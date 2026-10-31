// Mirrors pollRowanJobs: user polls one job; admin can catch up all pending hosted jobs.
import { operationClient } from '../../shared/researchApiContext.ts';
import { requireUser } from '../../shared/securityGuards.ts';
import { pollProvider, extractMetrics, PROVIDERS } from '../../shared/hostedProviders.ts';
import { cacheHostedStructure } from '../../shared/hostedStructure.ts';

async function syncHostedJob(client, job, service = false) {
  const entities = service ? client.asServiceRole.entities : client.entities;
  const provider = job.result?.router_provider;
  if (!PROVIDERS[provider] || !job.provider_job_id || !['pending', 'running'].includes(job.status)) return job;
  const outcome: any = await pollProvider(provider, job.result.task, job.provider_job_id, job.result.inputs_normalized);
  let update: any = { status: 'running' };
  if (outcome.state === 'failed') update = { status: 'failed', error: outcome.error };
  if (outcome.state === 'completed') {
    const file = new File([JSON.stringify({ provider, task: job.result.task, raw: outcome.raw })], `${provider}-results.json`, { type: 'application/json' });
    const { file_uri } = await client.asServiceRole.integrations.Core.UploadPrivateFile({ file });
    const metrics = job.result.task === 'binding' ? extractMetrics(outcome.raw) : [];
    // ADME rows are normalized by each adapter: { smiles, status, properties, error }. Property sets differ by provider.
    const adme = job.result.task === 'adme' ? (outcome.rows || []) : null;
    update = {
      status: 'completed',
      result: {
        ...job.result, execution_mode: 'real', results_file_uri: file_uri, provider_version: outcome.version || null,
        metrics, adme,
        system_overview: `Computed by ${PROVIDERS[provider].label} (${job.result.model}).`,
        predicted_results: { summary: 'Provider output', key_values: metrics.map(m => ({ property: m.key, value: String(m.value), unit: '', interpretation: `Reported by ${PROVIDERS[provider].label}; not an AI estimate.` })) },
        limitations: 'Machine-learning prediction, not experimental measurement. Scores from different providers or models are not interchangeable; compare candidates only within the same engine.',
      },
    };
  }
  const updated = await entities.SimulationJob.update(job.id, update);
  // Keep our own copy of the predicted structure: providers delete their files after a few days.
  if (update.status === 'completed' && job.result.task === 'binding') {
    try { const structure = await cacheHostedStructure(client, updated); if (structure) updated.result = { ...updated.result, structure }; } catch { /* the viewer retries on demand */ }
  }
  if (job.draft_id) await entities.SimulationDraft.update(job.draft_id, { status: update.status === 'running' ? 'running' : update.status, ...(update.result ? { result: update.result } : {}), ...(update.error ? { error: update.error } : {}) });
  return updated;
}

export default async function (req) {
  try {
    const base44 = await operationClient(req, 'pollHostedPredictions'), user = await requireUser(base44);
    const { job_id, catch_up = false } = await req.json();
    if (catch_up) {
      if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      const jobs = await base44.asServiceRole.entities.SimulationJob.filter({ execution_mode: 'real', status: { $in: ['pending', 'running'] } }, 'updated_date', 40);
      const outcomes = [];
      for (const job of jobs.filter(j => PROVIDERS[j.result?.router_provider])) {
        try { const u = await syncHostedJob(base44, job, true); outcomes.push({ id: job.id, status: u.status }); }
        catch (error) { outcomes.push({ id: job.id, error: error.message }); }
      }
      return Response.json({ outcomes });
    }
    if (typeof job_id !== 'string' || job_id.length > 100) return Response.json({ error: 'Invalid job ID' }, { status: 400 });
    const jobs = await base44.entities.SimulationJob.filter({ id: job_id, created_by_id: user.id }, undefined, 1);
    if (!jobs.length) return Response.json({ error: 'Job not found' }, { status: 404 });
    const job = jobs[0];
    if (Date.now() - Date.parse(job.updated_date) < 12000 && ['pending', 'running'].includes(job.status)) return Response.json({ job });
    return Response.json({ job: await syncHostedJob(base44, job) });
  } catch (error) { return Response.json({ error: error.message }, { status: error.status || 502 }); }
}
