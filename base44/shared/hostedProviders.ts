// base44/shared/hostedProviders.ts
// Hosted compute router for Suttain: per-calculation provider chains with automatic failover.
// Matches existing conventions in rowanCompute.ts (secrets from base44:runtime, providerStatus on errors).
//
// Verified against provider docs on 2026-10-28:
//   Boltz API  - POST /compute/v1/predictions/adme, GET /compute/v1/predictions/adme/{id},
//                POST /compute/v1/predictions/structure-and-binding (model "boltz-2.1"), header x-api-key
//   Tamarind   - POST /api/validate-job, POST /api/submit-job, GET /api/jobs?jobName=, POST /api/result,
//                tool type "boltz" with inputFormat "molecules", header x-api-key
// NOT yet verified (check on first live run):
//   - Boltz retrieve path for structure-and-binding (assumed to mirror the ADME retrieve path)
//   - Exact field names of Boltz binding-affinity output (stored raw; extracted defensively below)
//   - Tamarind setting that switches on affinity for the boltz tool (read GET /api/tools/boltz/schema)
import { secrets } from 'base44:runtime';

export type Task = 'binding' | 'adme';
export type ProviderId = 'boltz' | 'tamarind';
export type FailKind = 'credits' | 'unavailable' | 'invalid' | 'not_configured';

// Order = automatic fallback order when the user picks "Auto".
export const CHAINS: Record<Task, ProviderId[]> = {
  binding: ['boltz', 'tamarind'],
  adme: ['boltz'],
};

export const PROVIDERS: Record<ProviderId, { label: string; secret: string; tasks: Task[]; model: Record<string, string>; citation: string }> = {
  boltz: {
    label: 'Boltz API', secret: 'BOLTZ_API_KEY', tasks: ['binding', 'adme'],
    model: { binding: 'Boltz-2.1 (structure + binding)', adme: 'Boltz ADME v1 (Tier 1)' },
    citation: 'Boltz-2: Passaro, Corso, Wohlwend et al. (MIT Jameel Clinic / Recursion), 2025. https://boltz.bio',
  },
  tamarind: {
    label: 'Tamarind Bio', secret: 'TAMARIND_API_KEY', tasks: ['binding'],
    model: { binding: 'Boltz-2 (hosted by Tamarind)' },
    citation: 'Computed with Boltz-2 on Tamarind Bio (https://www.tamarind.bio). Cite Boltz-2 and the hosting platform.',
  },
};

export class ProviderError extends Error {
  provider?: ProviderId; kind!: FailKind | 'exhausted'; providerStatus?: number; attempts?: unknown[];
  constructor(message: string, opts: { provider?: ProviderId; kind: FailKind | 'exhausted'; providerStatus?: number; attempts?: unknown[] }) {
    super(message); Object.assign(this, opts);
  }
}

const CREDIT_RE = /(insufficient|exhausted|not enough|out of|no remaining).*(credit|balance|fund)|credit.*(exhausted|insufficient|depleted)|budget (was )?exceeded|spending limit|quota/i;

function classify(status: number, text: string): FailKind {
  if (status === 402 || CREDIT_RE.test(text)) return 'credits';
  if (status === 429 || status >= 500) return 'unavailable';
  return 'invalid'; // bad input: do not burn the next provider's credits on the same payload
}

async function http(provider: ProviderId, url: string, init: RequestInit = {}) {
  const key = secrets.get(PROVIDERS[provider].secret);
  if (!key) throw new ProviderError(`${PROVIDERS[provider].label} is not configured.`, { provider, kind: 'not_configured' });
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers: { 'x-api-key': key, 'Content-Type': 'application/json', ...(init.headers || {}) }, signal: AbortSignal.timeout(25000) });
  } catch (e) {
    throw new ProviderError(`${PROVIDERS[provider].label} could not be reached.`, { provider, kind: 'unavailable' });
  }
  const text = await response.text();
  let data: any = text;
  try { data = JSON.parse(text); } catch { /* some endpoints return plain text */ }
  if (!response.ok) {
    const detail = typeof data === 'string' ? data : (data?.error?.message || data?.error || data?.detail || data?.message || `HTTP ${response.status}`);
    throw new ProviderError(`${PROVIDERS[provider].label}: ${String(detail).slice(0, 400)}`, { provider, kind: classify(response.status, String(detail)), providerStatus: response.status });
  }
  return { status: response.status, data };
}

// ---------- Input validation (shared) ----------
const AA = /^[ACDEFGHIKLMNPQRSTVWYX]+$/;
export function validateInput(task: Task, input: any) {
  if (task === 'binding') {
    const seq = String(input?.protein_sequence || '').replace(/\s+/g, '').toUpperCase();
    const smiles = String(input?.ligand_smiles || '').trim();
    if (!seq || !AA.test(seq) || seq.length > 2900) throw new ProviderError('Enter a protein sequence (one-letter amino acid codes, up to 2,900 residues).', { kind: 'invalid' });
    if (!smiles || smiles.length > 2000) throw new ProviderError('Enter one ligand SMILES.', { kind: 'invalid' });
    return { protein_sequence: seq, ligand_smiles: smiles };
  }
  const list = (Array.isArray(input?.smiles) ? input.smiles : [input?.smiles]).map((s: any) => String(s || '').trim()).filter(Boolean);
  if (!list.length || list.length > 128) throw new ProviderError('Enter between 1 and 128 SMILES strings.', { kind: 'invalid' });
  return { smiles: list };
}

// ---------- Boltz adapter ----------
const BOLTZ = 'https://api.boltz.bio/compute/v1/predictions';
const boltzPath = (task: Task) => (task === 'adme' ? 'adme' : 'structure-and-binding');

const boltz = {
  async submit(task: Task, input: any, idempotencyKey: string) {
    const body = task === 'adme'
      ? { model: 'adme-v1', idempotency_key: idempotencyKey, input: { molecules: input.smiles.map((smiles: string, i: number) => ({ smiles, id: `m${i}` })) } }
      : { model: 'boltz-2.1', idempotency_key: idempotencyKey, input: {
          entities: [
            { type: 'protein', chain_ids: ['A'], value: input.protein_sequence },
            { type: 'ligand_smiles', chain_ids: ['B'], value: input.ligand_smiles },
          ],
          binding: { type: 'ligand_protein_binding', binder_chain_id: 'B' },
        } };
    const { data } = await http('boltz', `${BOLTZ}/${boltzPath(task)}`, { method: 'POST', body: JSON.stringify(body) });
    if (!data?.id) throw new ProviderError('Boltz API did not return a prediction id.', { provider: 'boltz', kind: 'unavailable' });
    return { provider_job_id: data.id as string };
  },
  async poll(task: Task, id: string) {
    const { data } = await http('boltz', `${BOLTZ}/${boltzPath(task)}/${encodeURIComponent(id)}`);
    if (data.status === 'succeeded') return { state: 'completed' as const, raw: data.output, version: data.version };
    if (data.status === 'failed') return { state: 'failed' as const, error: data.error?.message || 'Boltz prediction failed.' };
    return { state: 'running' as const };
  },
};

// ---------- Tamarind adapter ----------
const TAM = 'https://app.tamarind.bio/api';
const tamarind = {
  async submit(task: Task, input: any, idempotencyKey: string) {
    if (task !== 'binding') throw new ProviderError('Tamarind is only wired for binding in Suttain.', { provider: 'tamarind', kind: 'invalid' });
    const settings = { inputFormat: 'molecules', molecules: [
      { type: 'protein', sequence: input.protein_sequence, chain: 'A' },
      { type: 'ligand', sequence: input.ligand_smiles, chain: 'B' },
    ] };
    // validate-job answers 200 even when invalid; status is checked by http(), then read `valid`.
    const check = await http('tamarind', `${TAM}/validate-job`, { method: 'POST', body: JSON.stringify({ type: 'boltz', settings }) });
    if (!check.data?.valid) throw new ProviderError(`Tamarind rejected the input: ${check.data?.error || 'invalid settings'}`, { provider: 'tamarind', kind: 'invalid' });
    const jobName = `suttain-${idempotencyKey}`.replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 200);
    await http('tamarind', `${TAM}/submit-job`, { method: 'POST', body: JSON.stringify({ jobName, type: 'boltz', settings: check.data.normalized }) });
    return { provider_job_id: jobName };
  },
  async poll(_task: Task, jobName: string) {
    const { data } = await http('tamarind', `${TAM}/jobs?jobName=${encodeURIComponent(jobName)}`);
    const s = data?.JobStatus;
    if (s === 'Complete') {
      const res = await http('tamarind', `${TAM}/result`, { method: 'POST', body: JSON.stringify({ jobName }) });
      if (res.status === 202) return { state: 'running' as const }; // archive still being prepared
      const url = typeof res.data === 'string' ? res.data.replace(/^"|"$/g, '') : null;
      return { state: 'completed' as const, raw: { results_zip_url: url, scores: data?.Score ?? null } };
    }
    if (s === 'Failed' || s === 'Stopped') return { state: 'failed' as const, error: `Tamarind job ${s.toLowerCase()}.` };
    return { state: 'running' as const };
  },
};

const ADAPTERS = { boltz, tamarind };

// ---------- Router ----------
export async function submitWithFallback(task: Task, rawInput: any, opts: { preferred?: ProviderId | 'auto'; autoFallback?: boolean } = {}) {
  if (!CHAINS[task]) throw new ProviderError('Unknown calculation type.', { kind: 'invalid' });
  const input = validateInput(task, rawInput);
  const chain = CHAINS[task];
  const preferred = opts.preferred && opts.preferred !== 'auto' ? opts.preferred : null;
  if (preferred && !chain.includes(preferred)) throw new ProviderError(`${PROVIDERS[preferred]?.label || preferred} does not run this calculation.`, { kind: 'invalid' });
  let order = preferred ? [preferred, ...chain.filter(p => p !== preferred)] : chain;
  if (opts.autoFallback === false) order = order.slice(0, 1);

  const idempotencyKey = crypto.randomUUID();
  const attempts: { provider: ProviderId; kind: FailKind; message: string }[] = [];
  for (const provider of order) {
    try {
      const { provider_job_id } = await ADAPTERS[provider].submit(task, input, idempotencyKey);
      return { provider, provider_job_id, input, attempts, requested: preferred || 'auto' };
    } catch (e: any) {
      const kind: FailKind = e instanceof ProviderError && e.kind !== 'exhausted' ? e.kind : 'unavailable';
      attempts.push({ provider, kind, message: String(e.message).slice(0, 300) });
      if (kind === 'invalid') throw new ProviderError(e.message, { provider, kind: 'invalid', attempts });
    }
  }
  throw new ProviderError('No provider could take this calculation right now (credits exhausted or service unavailable).', { kind: 'exhausted', attempts });
}

export async function pollProvider(provider: ProviderId, task: Task, providerJobId: string) {
  return ADAPTERS[provider].poll(task, providerJobId);
}

// Pull affinity-like numbers out of Boltz output without guessing field names.
// Every value keeps its original key path so the UI can show exactly what the provider reported.
export function extractMetrics(raw: any, prefix = '', out: { key: string; value: number }[] = []) {
  if (raw && typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'number' && /affinity|ic50|probability|confidence|iptm|ptm|plddt/i.test(k)) out.push({ key: path, value: v });
      else if (v && typeof v === 'object' && out.length < 40) extractMetrics(v, path, out);
    }
  }
  return out;
}
