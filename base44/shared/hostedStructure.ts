// base44/shared/hostedStructure.ts
// Keeps a private copy of a hosted prediction's 3D structure with the Suttain job.
// Boltz API (verified 2026-10-31 against a live structure-and-binding prediction):
//   output.best_sample.metrics            structure_confidence, ptm, iptm, ligand_iptm, protein_iptm, complex_plddt, complex_iplddt, complex_pde, complex_ipde
//   output.best_sample.structure.url      signed S3 URL to an mmCIF (ModelCIF) file; per-atom pLDDT (0-100) in the B-factor column
//   output.best_sample.ligand_structure   signed S3 URL to the posed ligand as SDF
//   output.binding_metrics                binding_confidence, optimization_score
//   created_at / started_at / completed_at, expires_at (provider deletes data about 7 days after completion)
import { secrets } from 'base44:runtime';

const BOLTZ = 'https://api.boltz.bio/compute/v1/predictions/structure-and-binding';

async function getText(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`Structure download failed (HTTP ${res.status}).`);
  return res.text();
}

export async function cacheBoltzStructure(base44: any, job: any) {
  const key = secrets.get('BOLTZ_API_KEY');
  if (!key || !job?.provider_job_id) return null;
  const res = await fetch(`${BOLTZ}/${encodeURIComponent(job.provider_job_id)}`, { headers: { 'x-api-key': key }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) return null;
  const d = await res.json();
  const best = d?.output?.best_sample;
  if (d?.status !== 'succeeded' || !best?.structure?.url) return null;
  const cif = await getText(best.structure.url);
  const sdf = best.ligand_structure?.url ? await getText(best.ligand_structure.url).catch(() => null) : null;
  const upload = async (text: string, name: string) => (await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file: new File([text], name, { type: 'text/plain' }) })).file_uri;
  const { type: _type, ...binding } = d.output.binding_metrics || {};
  const structure = {
    cif_uri: await upload(cif, `${d.id}.cif`),
    sdf_uri: sdf ? await upload(sdf, `${d.id}-ligand.sdf`) : null,
    metrics: { ...(best.metrics || {}), ...binding },
    timings: { created_at: d.created_at || null, started_at: d.started_at || null, completed_at: d.completed_at || null },
    prediction_id: d.id, model: d.model || null, version: d.version || null, idempotency_key: d.idempotency_key || null,
    samples: Array.isArray(d.output.all_sample_results) ? d.output.all_sample_results.length : 1,
  };
  const latest = await base44.asServiceRole.entities.SimulationJob.get(job.id).catch(() => job);
  await base44.asServiceRole.entities.SimulationJob.update(job.id, { result: { ...(latest?.result || job.result), structure } });
  return structure;
}
