import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useHostedPolling(job, setJob) {
  const [pollError, setPollError] = useState('');
  const id = job?.id, status = job?.status;
  useEffect(() => {
    setPollError('');
    if (!id || ['completed', 'failed'].includes(status)) return;
    let cancelled = false, inFlight = false;
    const timer = setInterval(async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const { data } = await base44.functions.invoke('pollHostedPredictions', { job_id: id });
        if (data?.error || !data?.job) throw new Error(data?.error || 'No job status returned.');
        if (!cancelled) {
          setJob(data.job);
          setPollError('');
          if (['completed', 'failed'].includes(data.job.status)) clearInterval(timer);
        }
      } catch (error) {
        if (!cancelled) setPollError(error?.response?.data?.error || 'Unable to refresh results. Checking again in 15 seconds.');
      } finally { inFlight = false; }
    }, 15000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [id, status, setJob]);
  return pollError;
}