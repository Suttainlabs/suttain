import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireUser } from '../../shared/securityGuards.ts';
import { syncRowanJob } from '../../shared/rowanCompute.ts';
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req), user = await requireUser(base44);
    const {job_id,catch_up = false} = await req.json();
    if (catch_up) {
      if (user.role !== 'admin') return Response.json({error:'Forbidden'},{status:403});
      const jobs = await base44.asServiceRole.entities.SimulationJob.filter({execution_mode:'real',status:{$in:['pending','running']}},'updated_date',20);
      const outcomes = [];
      for (const job of jobs) {
        try { const updated = await syncRowanJob(base44,job,true); outcomes.push({id:job.id,status:updated.status}); }
        catch(error) { outcomes.push({id:job.id,error:error.message}); }
      }
      return Response.json({outcomes});
    }
    if (typeof job_id !== 'string' || job_id.length > 100) return Response.json({error:'Invalid job ID'},{status:400});
    const jobs = await base44.entities.SimulationJob.filter({id:job_id,created_by_id:user.id},undefined,1);
    if (!jobs.length) return Response.json({error:'Job not found'},{status:404});
    const job = jobs[0];
    if (job.execution_mode !== 'real') return Response.json({job});
    if (Date.now() - Date.parse(job.updated_date) < 12000 && ['pending','running'].includes(job.status)) return Response.json({job});
    return Response.json({job:await syncRowanJob(base44,job)});
  } catch(error) { return Response.json({error:error.message},{status:error.status || 502}); }
}