// base44/shared/hostedProviders.ts
// Hosted compute router for Suttain: per-calculation provider chains with interchangeable failover.
// Default order: Rowan -> Boltz API -> Tamarind. Users can pick any provider; the rest become fallbacks.
//
// Request formats verified 2026-10-28:
//   Rowan     - from the official SDK source (rowan-python 3.2.4 / stjames 0.0.293):
//               POST https://api.rowansci.com/workflow, header X-API-Key
//               workflow_type "protein_cofolding" (Boltz-2 co-folding + affinity) and "admet" (one SMILES per workflow)
//               GET /workflow/{uuid} -> object_status (0 queued, 1 running, 2 done, 3/4/7 failed) + object_data
//   Boltz API - POST /compute/v1/predictions/adme | /structure-and-binding, GET /compute/v1/predictions/adme/{id}
//   Tamarind  - POST /api/validate-job, /api/submit-job, GET /api/jobs?jobName=, POST /api/result; tool "boltz"
// Not yet verified (check on first live run):
//   - Boltz retrieve path for structure-and-binding (assumed to mirror the ADME retrieve path)
//   - Tamarind setting that switches on affinity for its boltz tool (GET /api/tools/boltz/schema, needs a key)
// Note: Rowan router jobs are synced by polling (pollHostedPredictions), not by the Rowan webhook.
import { secrets } from 'base44:runtime';

export type Task = 'binding' | 'adme';
export type ProviderId = 'rowan' | 'boltz' | 'tamarind';
export type FailKind = 'credits' | 'unavailable' | 'invalid' | 'unsupported' | 'not_configured';

// Order = automatic fallback order. A user's chosen provider moves to the front; the others follow in this order.
export const CHAINS: Record<Task, ProviderId[]> = {
  binding: ['rowan', 'boltz', 'tamarind'],
  adme: ['rowan', 'boltz'],
};

export const PROVIDERS: Record<ProviderId, { label: string; secret: string; header: string; tasks: Task[]; model: Record<string, string>; citation: string }> = {
  rowan: {
    label: 'Rowan', secret: 'ROWAN_API_KEY', header: 'X-API-Key', tasks: ['binding', 'adme'],
    model: { binding: 'Boltz-2 co-folding (run by Rowan)', adme: 'Rowan ADMET' },
    citation: 'Rowan Scientific. https://www.rowansci.com. Binding computed with Boltz-2 (Passaro, Corso, Wohlwend et al., 2025).',
  },
  boltz: {
    label: 'Boltz API', secret: 'BOLTZ_API_KEY', header: 'x-api-key', tasks: ['binding', 'adme'],
    model: { binding: 'Boltz-2.1 (structure + binding)', adme: 'Boltz ADME v1 (Tier 1)' },
    citation: 'Boltz-2: Passaro, Corso, Wohlwend et al. (MIT Jameel Clinic / Recursion), 2025. https://boltz.bio',
  },
  tamarind: {
    label: 'Tamarind Bio', secret: 'TAMARIND_API_KEY', header: 'x-api-key', tasks: ['binding'],
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

const CREDIT_RE = /(insufficient|exhausted|not enough|out of|no remaining|lack of).*(credit|balance|fund)|credit.*(exhausted|insufficient|depleted)|budget (was )?exceeded|spending limit|quota/i;

function classify(status: number, text: string): FailKind {
  if (status === 402 || CREDIT_RE.test(text)) return 'credits';
  if (status === 429 || status >= 500) return 'unavailable';
  return 'invalid'; // bad input: do not spend the next provider's credits on the same payload
}

async function http(provider: ProviderId, url: string, init: RequestInit = {}) {
  const p = PROVIDERS[provider];
  const key = secrets.get(p.secret);
  if (!key) throw new ProviderError(`${p.label} is not configured.`, { provider, kind: 'not_configured' });
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers: { [p.header]: key, 'Content-Type': 'application/json', ...(init.headers || {}) }, signal: AbortSignal.timeout(25000) });
  } catch {
    throw new ProviderError(`${p.label} could not be reached.`, { provider, kind: 'unavailable' });
  }
  const text = await response.text();
  let data: any = text;
  try { data = JSON.parse(text); } catch { /* some endpoints return plain text */ }
  if (!response.ok) {
    const detail = typeof data === 'string' ? data : (data?.error?.message || data?.error || data?.detail || data?.message || `HTTP ${response.status}`);
    const msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
    throw new ProviderError(`${p.label}: ${msg.slice(0, 400)}`, { provider, kind: classify(response.status, msg), providerStatus: response.status });
  }
  return { status: response.status, data };
}

// ---------- Input validation (shared by all providers) ----------
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

type AdmeRow = { smiles: string; status: string; properties: Record<string, unknown>; error: string | null };
type PollOutcome =
  | { state: 'running' }
  | { state: 'failed'; error: string }
  | { state: 'completed'; raw: unknown; version?: string | null; rows?: AdmeRow[] };

// ---------- Rowan adapter ----------
const ROWAN = 'https://api.rowansci.com';
const ROWAN_ADME_MAX = 10; // Rowan ADMET is one workflow per molecule; larger batches go to the next provider
const ROWAN_FAILED = [3, 4, 7];

const rowan = {
  async submit(task: Task, input: any) {
    if (task === 'binding') {
      const workflow_data = {
        initial_protein_sequences: [input.protein_sequence],
        initial_smiles_list: [input.ligand_smiles],
        ligand_binding_affinity_index: 0,
        use_msa_server: true, use_potentials: false, do_pose_refinement: false, compute_strain: false,
        model: 'boltz_2',
      };
      const { data } = await http('rowan', `${ROWAN}/workflow`, { method: 'POST', body: JSON.stringify({ workflow_type: 'protein_cofolding', workflow_data, name: 'Suttain binding', max_credits: 50, is_draft: false }) });
      if (!data?.uuid) throw new ProviderError('Rowan did not return a workflow receipt.', { provider: 'rowan', kind: 'unavailable' });
      return { provider_job_id: data.uuid as string };
    }
    if (input.smiles.length > ROWAN_ADME_MAX) throw new ProviderError(`Rowan ADMET runs one molecule per workflow; batches over ${ROWAN_ADME_MAX} go to the next engine.`, { provider: 'rowan', kind: 'unsupported' });
    const uuids: string[] = [];
    for (const smiles of input.smiles) {
      const { data } = await http('rowan', `${ROWAN}/workflow`, { method: 'POST', body: JSON.stringify({ workflow_type: 'admet', workflow_data: { initial_smiles: smiles }, initial_smiles: smiles, name: 'Suttain ADMET', max_credits: 10, is_draft: false }) });
      if (!data?.uuid) throw new ProviderError('Rowan did not return a workflow receipt.', { provider: 'rowan', kind: 'unavailable' });
      uuids.push(data.uuid);
    }
    return { provider_job_id: uuids.join(',') };
  },
  async poll(task: Task, id: string, input?: any): Promise<PollOutcome> {
    const uuids = id.split(',');
    const workflows = [];
    for (const uuid of uuids) workflows.push((await http('rowan', `${ROWAN}/workflow/${encodeURIComponent(uuid)}`)).data);
    if (workflows.some(w => ROWAN_FAILED.includes(w.object_status)) && task === 'binding') return { state: 'failed', error: 'Rowan co-folding failed or stopped.' };
    if (!workflows.every(w => w.object_status === 2 || ROWAN_FAILED.includes(w.object_status))) return { state: 'running' };
    if (task === 'binding') {
      const d = workflows[0].object_data || {};
      const best = d.cofolding_results?.[0] || { affinity_score: d.affinity_score, scores: d.scores, posebusters_valid: d.posebusters_valid };
      return { state: 'completed', raw: { affinity_score: best.affinity_score, scores: best.scores, posebusters_valid: best.posebusters_valid, predicted_structure_uuid: best.predicted_structure_uuid ?? d.predicted_structure_uuid, model: d.model, credits_charged: workflows[0].credits_charged } };
    }
    const smiles: string[] = input?.smiles || [];
    const rows: AdmeRow[] = workflows.map((w, i) => ROWAN_FAILED.includes(w.object_status)
      ? { smiles: smiles[i] || w.object_data?.initial_smiles || '', status: 'failed', properties: {}, error: 'Rowan ADMET failed for this molecule.' }
      : { smiles: smiles[i] || w.object_data?.initial_smiles || '', status: 'succeeded', properties: w.object_data?.properties || {}, error: null });
    return { state: 'completed', raw: workflows.map(w => ({ uuid: w.uuid, properties: w.object_data?.properties, credits_charged: w.credits_charged })), rows };
  },
};

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
  async poll(task: Task, id: string): Promise<PollOutcome> {
    const { data } = await http('boltz', `${BOLTZ}/${boltzPath(task)}/${encodeURIComponent(id)}`);
    if (data.status === 'failed') return { state: 'failed', error: data.error?.message || 'Boltz prediction failed.' };
    if (data.status !== 'succeeded') return { state: 'running' };
    const rows = task === 'adme' ? (data.output?.molecules || []).map((m: any) => ({ smiles: m.smiles, status: m.status, properties: m.adme || {}, error: m.error?.message || null })) : undefined;
    return { state: 'completed', raw: data.output, version: data.version, rows };
  },
};

// ---------- Tamarind adapter ----------
const TAM = 'https://app.tamarind.bio/api';
const tamarind = {
  async submit(task: Task, input: any, idempotencyKey: string) {
    if (task !== 'binding') throw new ProviderError('Tamarind does not offer ADME in Suttain.', { provider: 'tamarind', kind: 'unsupported' });
    const settings = { inputFormat: 'molecules', molecules: [
      { type: 'protein', sequence: input.protein_sequence, chain: 'A' },
      { type: 'ligand', sequence: input.ligand_smiles, chain: 'B' },
    ] };
    // validate-job answers 200 even when invalid; http() checks the status, then read `valid`.
    const check = await http('tamarind', `${TAM}/validate-job`, { method: 'POST', body: JSON.stringify({ type: 'boltz', settings }) });
    if (!check.data?.valid) throw new ProviderError(`Tamarind rejected the input: ${check.data?.error || 'invalid settings'}`, { provider: 'tamarind', kind: 'invalid' });
    const jobName = `suttain-${idempotencyKey}`.replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 200);
    await http('tamarind', `${TAM}/submit-job`, { method: 'POST', body: JSON.stringify({ jobName, type: 'boltz', settings: check.data.normalized }) });
    return { provider_job_id: jobName };
  },
  async poll(_task: Task, jobName: string): Promise<PollOutcome> {
    const { data } = await http('tamarind', `${TAM}/jobs?jobName=${encodeURIComponent(jobName)}`);
    const s = data?.JobStatus;
    if (s === 'Failed' || s === 'Stopped') return { state: 'failed', error: `Tamarind job ${String(s).toLowerCase()}.` };
    if (s !== 'Complete') return { state: 'running' };
    const res = await http('tamarind', `${TAM}/result`, { method: 'POST', body: JSON.stringify({ jobName }) });
    if (res.status === 202) return { state: 'running' }; // results archive still being prepared
    const url = typeof res.data === 'string' ? res.data.replace(/^"|"$/g, '') : null;
    return { state: 'completed', raw: { results_zip_url: url, scores: data?.Score ?? null } };
  },
};

const ADAPTERS: Record<ProviderId, { submit: (t: Task, i: any, k: string) => Promise<{ provider_job_id: string }>; poll: (t: Task, id: string, input?: any) => Promise<PollOutcome> }> = { rowan, boltz, tamarind };

// ---------- Recommendation ----------
// Deterministic rules: the same goal and input always produce the same recommendation.
// Each rule rests on a documented difference between engines (sources noted inline).
export type Goal = 'potency' | 'hit_discovery' | 'pose' | 'quick_screen' | 'full_profile';
export const GOALS: Record<Task, { id: Goal; label: string; hint: string }[]> = {
  binding: [
    { id: 'potency', label: 'Estimate potency / rank analogs', hint: 'How strongly does each compound bind?' },
    { id: 'hit_discovery', label: 'Find real binders (hit discovery)', hint: 'Does this compound bind at all?' },
    { id: 'pose', label: 'See the binding pose', hint: 'Where and how does it sit in the pocket?' },
  ],
  adme: [
    { id: 'full_profile', label: 'Full property profile', hint: 'A wider property set for a few molecules' },
    { id: 'quick_screen', label: 'Quick screen of many molecules', hint: 'Solubility, permeability, lipophilicity at scale' },
  ],
};

export function recommend(task: Task, rawInput: any, goal?: Goal | null) {
  const n = task === 'adme' ? (Array.isArray(rawInput?.smiles) ? rawInput.smiles.filter((s: any) => String(s || '').trim()).length : 1) : 1;
  let order: ProviderId[], reason: string, chosenGoal: Goal;
  if (task === 'binding') {
    chosenGoal = goal && GOALS.binding.some(g => g.id === goal) ? goal : 'potency';
    if (chosenGoal === 'hit_discovery') {
      // Rowan SDK docs: Boltz-2.1 binding_confidence is the primary metric for hit discovery.
      order = ['boltz', 'rowan', 'tamarind'];
      reason = 'Boltz API runs Boltz-2.1, which reports a binding-confidence score built to separate true binders from decoys.';
    } else if (chosenGoal === 'pose') {
      // Rowan returns PoseBusters pose validity; Tamarind returns full structure files.
      order = ['rowan', 'tamarind', 'boltz'];
      reason = 'Rowan returns the predicted complex with a PoseBusters pose-validity check, so you can trust the pose before reading into it.';
    } else {
      // Rowan SDK docs: Boltz-2 pred_value is a predicted pIC50 (-log10 IC50).
      order = ['rowan', 'boltz', 'tamarind'];
      reason = 'Rowan runs Boltz-2, which reports a predicted pIC50, an interpretable potency number for ranking analogs.';
    }
  } else {
    chosenGoal = n > ROWAN_ADME_MAX ? 'quick_screen' : (goal && GOALS.adme.some(g => g.id === goal) ? goal : 'full_profile');
    if (chosenGoal === 'quick_screen') {
      order = ['boltz', 'rowan'];
      reason = n > ROWAN_ADME_MAX
        ? `Boltz scores up to 128 molecules in one batch; Rowan runs one job per molecule (max ${ROWAN_ADME_MAX} here).`
        : 'Boltz ADME gives a fast Tier-1 screen: solubility, permeability and lipophilicity.';
    } else {
      order = ['rowan', 'boltz'];
      reason = 'Rowan ADMET returns a per-molecule property set (e.g. molecular weight, logP, TPSA), wider than the three Tier-1 values from Boltz.';
    }
  }
  const engines = order.map(p => ({ provider: p, label: PROVIDERS[p].label, model: PROVIDERS[p].model[task], configured: !!secrets.get(PROVIDERS[p].secret) }));
  const recommended = engines.find(e => e.configured)?.provider || order[0];
  const unavailableTop = recommended !== order[0];
  return {
    task, goal: chosenGoal, recommended, order, engines,
    reason: unavailableTop ? `${reason} ${PROVIDERS[order[0]].label} is not connected, so ${PROVIDERS[recommended].label} is the best available choice.` : reason,
  };
}

// ---------- Router ----------
export async function submitWithFallback(task: Task, rawInput: any, opts: { preferred?: ProviderId | 'auto'; autoFallback?: boolean; goal?: Goal | null } = {}) {
  if (!CHAINS[task]) throw new ProviderError('Unknown calculation type.', { kind: 'invalid' });
  const input = validateInput(task, rawInput);
  const chain = recommend(task, input, opts.goal).order; // "Auto" follows the recommendation for the user's goal
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

export async function pollProvider(provider: ProviderId, task: Task, providerJobId: string, input?: any) {
  return ADAPTERS[provider].poll(task, providerJobId, input);
}

// Pull affinity and confidence numbers out of any provider's output without guessing exact field names.
// Each value keeps its full key path so the UI shows exactly what the provider reported.
const METRIC_RE = /affinity|pred_value|probability|binding_confidence|optimization_score|ic50|confidence_score|iptm|ptm|lddt/i;
export function extractMetrics(raw: any, prefix = '', out: { key: string; value: number }[] = []) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [k, v] of Object.entries(raw)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'number' && METRIC_RE.test(path)) out.push({ key: path, value: v });
      else if (v && typeof v === 'object' && out.length < 40) extractMetrics(v, path, out);
    }
  }
  return out;
}
