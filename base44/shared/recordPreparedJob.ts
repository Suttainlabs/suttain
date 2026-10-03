export default async function recordPreparedJob(base44,data,result) {
  const hash=`local-${crypto.randomUUID()}`, name=String(data.sim_type_label || data.sim_type).slice(0,120);
  const draft=await base44.entities.SimulationDraft.create({name,sim_type:data.sim_type,sim_type_label:name,engine:result.engine,raw_inputs:data.inputs,environmental_params:data.environmental_params || {},run_id:hash,status:'draft',domain:String(data.domain || '').slice(0,80)});
  const job=await base44.entities.SimulationJob.create({draft_id:draft.id,job_hash:hash,job_name:name,sim_type:data.sim_type,sim_type_label:name,engine:result.engine,inputs:data.inputs,environmental_params:data.environmental_params || {},status:'completed',execution_mode:'local_pending',result});
  return {...result,job_id:job.id,job_hash:hash};
}