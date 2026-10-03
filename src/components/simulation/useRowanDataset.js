import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
export default function useRowanDataset(result) {
  const [dataset,setDataset] = useState(null),[loading,setLoading] = useState(false),[error,setError] = useState(''),[retry,setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setDataset(null);setError('');
    if (!result.results_file_uri) {setLoading(false);return;}
    setLoading(true);
    (async () => {
      try {
        const {signed_url} = await base44.integrations.Core.CreateFileSignedUrl({file_uri:result.results_file_uri});
        const response = await fetch(signed_url);
        if (!response.ok) throw new Error('Unable to load the private calculation results.');
        const data = await response.json();if (!cancelled) setDataset(data);
      } catch (e) {if (!cancelled) setError(e.message);}
      finally {if (!cancelled) setLoading(false);}
    })();
    return () => {cancelled=true;};
  },[result.results_file_uri,retry]);
  return {dataset,loading,error,reload:() => setRetry(v => v+1)};
}