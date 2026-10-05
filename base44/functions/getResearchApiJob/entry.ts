import { operationClient } from '../../shared/researchApiContext.ts';
import { requireUser,deny } from '../../shared/securityGuards.ts';
import { researchEntitlement } from '../../shared/usageEntitlements.ts';
export default async function(req) {
 try {
  const base44=await operationClient(req,'getResearchApiJob'),user=await requireUser(base44);
  const denied=researchEntitlement(user);if(denied) return denied;
  const {kind,job_id}=await req.json();
  if(!['simulation','screening'].includes(kind) || typeof job_id!=='string' || job_id.length>100) deny('Supply kind (simulation or screening) and job_id.',400);
  const jobs=await base44.entities[kind==='screening'?'DrugDiscoveryJob':'SimulationJob'].filter({id:job_id,created_by_id:user.id},undefined,1);
  if(!jobs.length) deny('Job not found.',404);
  return Response.json({job:jobs[0]});
 } catch(error) {return Response.json({error:error.status?error.message:'Could not retrieve job.'},{status:error.status || 500});}
}