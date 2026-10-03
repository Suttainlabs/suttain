import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { verifyRowanSignature, syncRowanJob } from '../../shared/rowanCompute.ts';
export default async function(req) {
  try {
    if (req.method !== 'POST') return Response.json({error:'Method not allowed'},{status:405});
    const raw = new Uint8Array(await req.arrayBuffer());
    if (raw.length > 1000000 || !await verifyRowanSignature(raw,req.headers.get('X-Rowan-Signature'))) return Response.json({error:'Invalid Rowan signature'},{status:401});
    const payload = JSON.parse(new TextDecoder().decode(raw));
    const uuid = payload.uuid || payload.workflow_uuid || payload.workflow?.uuid;
    if (typeof uuid !== 'string' || !/^[a-f0-9-]{36}$/i.test(uuid)) return Response.json({error:'Invalid workflow receipt'},{status:400});
    const base44 = createClientFromRequest(req);
    const jobs = await base44.asServiceRole.entities.SimulationJob.filter({provider_job_id:uuid,execution_mode:'real'},undefined,1);
    if (!jobs.length) return Response.json({error:'Receipt not yet recorded; retry later'},{status:503});
    const job = await syncRowanJob(base44,jobs[0],true);
    return Response.json({received:true,status:job.status});
  } catch(error) { return Response.json({error:error.message},{status:500}); }
}