import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useEngineRecommendation(task, goal, input, moleculeCount) {
  const [catalog, setCatalog] = useState(null);
  const [result, setResult] = useState(null);
  const [failure, setFailure] = useState(null);
  const latestInput = useRef(input);
  latestInput.current = input;
  const key = JSON.stringify([task, goal, moleculeCount]);
  useEffect(() => {
    let cancelled = false;
    base44.functions.invoke('recommendEngine', { task }).then(({ data }) => {
      if (data?.error) throw new Error(data.error);
      if (!cancelled) setCatalog({ task, data });
    }).catch(error => { if (!cancelled) setFailure({ task, message: error?.response?.data?.error || error.message }); });
    return () => { cancelled = true; };
  }, [task]);
  useEffect(() => {
    let cancelled = false;
    setFailure(null);
    const timer = setTimeout(async () => {
      try {
        const { data } = await base44.functions.invoke('recommendEngine', { task, goal, input: latestInput.current });
        if (data?.error) throw new Error(data.error);
        if (!cancelled) setResult({ key, data });
      } catch (error) {
        if (!cancelled) setFailure({ task, message: error?.response?.data?.error || error.message });
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [task, goal, moleculeCount]);
  return {
    rec: result?.key === key ? result.data : null,
    goals: catalog?.task === task ? catalog.data.goals || [] : [],
    recError: failure?.task === task ? failure.message : '',
  };
}