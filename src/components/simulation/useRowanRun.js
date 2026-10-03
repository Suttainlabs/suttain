import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { runRowanCompute } from '@/functions/runRowanCompute';
import { pollRowanJobs } from '@/functions/pollRowanJobs';
import prepareRowanInput from '@/components/simulation/prepareRowanInput';
export default function useRowanRun({user,sim,engine,domain,inputs,environment,onResult,refreshUser}) {
  const storageKey = `suttain-rowan-active-${user?.id}-${sim?.id}`;
  const [job,setJob] = useState(null), [busy,setBusy] = useState(false), [error,setError] = useState('');
  useEffect(() => { if (!user || !sim) return; const id = localStorage.getItem(storageKey); if (id) base44.entities.SimulationJob.filter({id,created_by_id:user.id},undefined,1).then(rows => { if(rows[0]) setJob(rows[0]); }); },[storageKey,user?.id]);
  useEffect(() => {
    if (job?.status === 'failed') {localStorage.removeItem(storageKey);setError(job.error);}
    if (!job || job.status !== 'completed') return;
    localStorage.removeItem(storageKey);
    onResult({...job.result,simType:sim,inputs:job.inputs,environmental_params:job.environmental_params,engine:job.result?.engine || job.engine,domain,job_hash:job.job_hash,execution_mode:job.execution_mode,provider_job_id:job.provider_job_id});
  },[job?.id,job?.status]);
  useEffect(() => {
    if (!job || !['pending','running'].includes(job.status)) { setBusy(false); return; }
    setBusy(true);
    let stopped = false, timer;
    const poll = async () => {
      try { const {data} = await pollRowanJobs({job_id:job.id}); if (!stopped) {setError('');setJob(data.job);} }
      catch(e) { if (!stopped) setError(`Status update delayed: ${e.response?.data?.error || e.message}. Tracking will retry automatically.`); }
      if (!stopped) timer = setTimeout(poll,5000);
    };
    timer = setTimeout(poll,5000);
    const unsubscribe = base44.entities.SimulationJob.subscribe(event => { if(event.id === job.id && event.type === 'update') base44.entities.SimulationJob.get(job.id).then(value => { if(!stopped) setJob(value); }); });
    return () => {stopped = true;clearTimeout(timer);unsubscribe();};
  },[job?.id,job?.status]);
  const run = async () => {
    if (busy) return;
    setBusy(true);setError('');onResult(null);
    try {
      const structure = ['dft','quantum_mechanics'].includes(sim.id) ? await prepareRowanInput(inputs) : {};
      const {data} = await runRowanCompute({sim_type:sim.id,sim_type_label:sim.label,engine,inputs,domain,environmental_params:environment || {},structure});
      setJob(data.job);
      if (['pending','running'].includes(data.job.status)) localStorage.setItem(storageKey,data.job.id);
      if (data.job.status === 'failed') {localStorage.removeItem(storageKey);setError(data.job.error);}
      if (refreshUser) await refreshUser();
    } catch(e) {setError(e.response?.data?.error || e.message);}
    finally {setBusy(false);}
  };
  return {job,isRunning:busy || ['pending','running'].includes(job?.status),error,run};
}