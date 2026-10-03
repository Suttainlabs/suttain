import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireUser, reserveSecurityAction } from '../../shared/securityGuards.ts';
import { reserveUsage, planAccess } from '../../shared/usageEntitlements.ts';
import { resolveRowanMolecule, mapRowanSettings, invalid } from '../../shared/rowanInput.ts';
import { rowanRequest } from '../../shared/rowanCompute.ts';
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req), user = await requireUser(base44);
    const data = await req.json();
    if (!data || JSON.stringify(data).length > 32000 || !data.inputs || typeof data.inputs !== 'object') invalid('Invalid simulation inputs.');
    if (!['dft','quantum_mechanics','molecular_dynamics','protein_modeling','materials','monte_carlo','visualization','surface_chemistry','biomolecular_dynamics','electron_spectroscopy','machine_learning_pot'].includes(data.sim_type)) invalid('Unknown simulation type.');
    const mapping = mapRowanSettings(data.sim_type, data.inputs, String(data.engine || '').slice(0,60), data.environmental_params || {});
    if (data.validate_only) { if (user.role !== 'admin') return Response.json({error:'Forbidden'}, {status:403}); return Response.json({valid:true,mapping}); }
    const limited = await reserveUsage(base44, user, 'research');
    if (limited) return limited;
    await reserveSecurityAction(base44,user,{channel:'rowan_compute',limit:10,hourly:true});
    const jobHash = `rowan-${crypto.randomUUID()}`, name = String(data.sim_type_label || data.sim_type).slice(0,120);
    const draft = await base44.entities.SimulationDraft.create({name,sim_type:data.sim_type,sim_type_label:name,engine:data.engine || 'Rowan',raw_inputs:data.inputs,environmental_params:data.environmental_params || {},run_id:jobHash,status:'running',domain:String(data.domain || '').slice(0,80)});
    let job = await base44.entities.SimulationJob.create({draft_id:draft.id,job_hash:jobHash,job_name:name,sim_type:data.sim_type,sim_type_label:name,engine:data.engine || 'Rowan',inputs:data.inputs,environmental_params:data.environmental_params || {},status:'pending',execution_mode:'real',result:{settings:mapping.settings || null}});
    try {
      if (mapping.unsupported) { const error = new Error(mapping.unsupported); error.status = 400; throw error; }
      const molecule = await resolveRowanMolecule(data.structure || {});
      const workflow = await rowanRequest('/workflow',{method:'POST',body:JSON.stringify({workflow_type:'basic_calculation',name:`Suttain ${jobHash}`,initial_molecule:molecule,workflow_data:{initial_molecule:molecule,settings:mapping.settings,tasks:mapping.settings.tasks,engine:mapping.settings.engine},max_credits:25,webhook_url:'https://suttain.base44.app/functions/receiveRowanWebhook',is_draft:false})});
      if (!workflow.uuid) throw new Error('Rowan did not return a workflow receipt.');
      job = await base44.entities.SimulationJob.update(job.id,{provider_job_id:workflow.uuid,status:workflow.object_status === 1 ? 'running' : 'pending'});
      return Response.json({job});
    } catch (error) {
      const fallback = !mapping.unsupported && !error.status && (!error.providerStatus || error.providerStatus >= 500 || [402,429].includes(error.providerStatus));
      let result = {execution_mode:'demonstration',system_overview:'Demonstration mode: no real calculation was completed.',computational_approach:'Review-only workflow preparation; computed properties and trajectories are unavailable.',scientific_interpretation:'No scientific conclusions can be drawn from this demonstration.',limitations:error.message,predicted_results:{summary:'No computed values available',key_values:[]}};
      if (fallback && planAccess(user).research) {
        try {
          const analysis = await base44.functions.invoke('runConsumerLLM',{operation:'simulationRunner',data:{selectedEngine:data.engine,simulationConfig:data.inputs,moleculeInfo:String(data.inputs.molecule || data.inputs.system || '').slice(0,2000)}});
          if (analysis.data && !analysis.data.error) result = {...analysis.data,execution_mode:'demonstration',limitations:`${error.message} No real provider result is available. ${analysis.data.limitations || ''}`,predicted_results:{summary:analysis.data.predicted_results?.summary || 'Qualitative workflow preparation only',key_values:[]}};
        } catch { /* Keep the deterministic demonstration when AI is unavailable. */ }
      }
      job = await base44.entities.SimulationJob.update(job.id, fallback ? {status:'completed',execution_mode:'demonstration',result} : {status:'failed',error:error.message});
      await base44.entities.SimulationDraft.update(draft.id,fallback ? {status:'completed',result} : {status:'failed',error:error.message});
      return Response.json({job,demonstration:fallback});
    }
  } catch(error) { return Response.json({error:error.message},{status:error.status || 500}); }
}