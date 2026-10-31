// Returns short-lived links to a completed binding job's predicted 3D structure (mmCIF) and posed ligand (SDF),
// plus the engine's full metric set and timings. The first call copies the files from the provider into private storage.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireUser } from '../../shared/securityGuards.ts';
import { cacheBoltzStructure } from '../../shared/hostedStructure.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req), user = await requireUser(base44);
    const { job_id } = await req.json().catch(() => ({}));
    if (typeof job_id !== 'string' || !job_id || job_id.length > 100) return Response.json({ error: 'Invalid job ID' }, { status: 400 });
    const jobs = user.role === 'admin'
      ? await base44.asServiceRole.entities.SimulationJob.filter({ id: job_id }, undefined, 1)
      : await base44.entities.SimulationJob.filter({ id: job_id, created_by_id: user.id }, undefined, 1);
    const job = jobs[0];
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });
    if (job.status !== 'completed') return Response.json({ available: false, reason: 'The job has not finished yet.' });
    let structure = job.result?.structure;
    if (!structure?.cif_uri && job.result?.router_provider === 'boltz') {
      structure = await cacheBoltzStructure(base44, job).catch(() => null);
      if (!structure) return Response.json({ available: false, reason: 'Boltz no longer holds the structure for this run (it deletes files about 7 days after a run). Scores are still shown.' });
    }
    if (!structure?.cif_uri) return Response.json({ available: false, reason: `${job.engine || 'This engine'} does not return a structure file to Suttain yet. Scores are still shown.` });
    const sign = async (uri) => uri ? (await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 })).signed_url : null;
    return Response.json({ available: true, cif_url: await sign(structure.cif_uri), sdf_url: await sign(structure.sdf_uri), metrics: structure.metrics || {}, timings: structure.timings || {}, prediction_id: structure.prediction_id, model: structure.model, version: structure.version, samples: structure.samples || 1 });
  } catch (error) {
    return Response.json({ error: error.message || 'Could not load the structure.' }, { status: error.status || 502 });
  }
}
