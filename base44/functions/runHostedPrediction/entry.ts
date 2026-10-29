// Submits a binding or ADME calculation to the user's chosen provider, or "auto" with failover.
// Body: { task: 'binding'|'adme', provider: 'auto'|'rowan'|'boltz'|'tamarind', auto_fallback?: boolean,
//         input: { protein_sequence, ligand_smiles } | { smiles: string[] }, label?: string }
import { operationClient } from '../../shared/researchApiContext.ts';
import { requireUser, reserveSecurityAction } from '../../shared/securityGuards.ts';
import { reserveUsage } from '../../shared/usageEntitlements.ts';
import { submitWithFallback, recommend, PROVIDERS, CHAINS } from '../../shared/hostedProviders.ts';

const TASK_LABEL = { binding: 'Protein–ligand binding (structure + affinity)', adme: 'ADME prediction (Tier 1)' };

export default async function (req) {
  try {
    const base44 = await operationClient(req, 'runHostedPrediction'), user = await requireUser(base44);
    const data = await req.json();
    if (!data || JSON.stringify(data).length > 64000) return Response.json({ error: 'Request too large.' }, { status: 400 });
    if (!CHAINS[data.task]) return Response.json({ error: 'Choose binding or ADME.' }, { status: 400 });

    const limited = await reserveUsage(base44, user, 'research');
    if (limited) return limited;
    await reserveSecurityAction(base44, user, { channel: 'hosted_prediction', limit: 10, hourly: true });

    const jobHash = `hosted-${crypto.randomUUID()}`, name = String(data.label || TASK_LABEL[data.task]).slice(0, 120);
    const draft = await base44.entities.SimulationDraft.create({ name, sim_type: data.task, sim_type_label: TASK_LABEL[data.task], engine: 'Auto', raw_inputs: data.input || {}, run_id: jobHash, status: 'running', domain: 'Drug discovery' });
    let job = await base44.entities.SimulationJob.create({ draft_id: draft.id, job_hash: jobHash, job_name: name, sim_type: data.task, sim_type_label: TASK_LABEL[data.task], engine: 'Auto', inputs: data.input || {}, status: 'pending', execution_mode: 'real', result: {} });

    try {
      const rec = recommend(data.task, data.input, data.goal);
      const routed = await submitWithFallback(data.task, data.input, { preferred: data.provider, autoFallback: data.auto_fallback !== false, goal: data.goal });
      const p = PROVIDERS[routed.provider];
      const switched = routed.attempts.length > 0;
      job = await base44.entities.SimulationJob.update(job.id, {
        engine: p.label, provider_job_id: routed.provider_job_id, status: 'pending',
        result: {
          router_provider: routed.provider,            // marks this job as NOT a Rowan job (see syncRowanJob guard)
          task: data.task, model: p.model[data.task], requested_provider: routed.requested,
          goal: rec.goal, recommendation: { provider: rec.recommended, reason: rec.reason, followed: routed.provider === rec.recommended },
          inputs_normalized: routed.input, attempts: routed.attempts,
          fallback: switched ? { from: routed.attempts.map(a => PROVIDERS[a.provider].label), to: p.label, reasons: routed.attempts.map(a => a.kind), notice: `Ran on ${p.label} because ${routed.attempts.map(a => `${PROVIDERS[a.provider].label} (${a.kind})`).join(', ')} could not take it. Scores from different engines are not directly comparable.` } : null,
          citations: [{ title: p.label, text: p.citation }],
        },
      });
      await base44.entities.SimulationDraft.update(draft.id, { engine: p.label });
      return Response.json({ job, fallback: switched });
    } catch (error) {
      const msg = error.kind === 'exhausted'
        ? 'No provider could take this calculation right now. Nothing was computed and no result was estimated.'
        : error.message;
      job = await base44.entities.SimulationJob.update(job.id, { status: 'failed', error: msg, result: { router_provider: 'none', task: data.task, attempts: error.attempts || [] } });
      await base44.entities.SimulationDraft.update(draft.id, { status: 'failed', error: msg });
      return Response.json({ job }, { status: error.kind === 'invalid' ? 400 : 200 });
    }
  } catch (error) { return Response.json({ error: error.message }, { status: error.status || 500 }); }
}
