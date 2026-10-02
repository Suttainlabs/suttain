import { useEffect, useState } from 'react';
import fetchTargetSuggestions from '@/components/drug-discovery/fetchTargetSuggestions';
export default function useTargetSuggestions(query, enabled) {
  const [result, setResult] = useState({ query: '', items: [], unavailable: [], loading: false });
  const eligible = enabled && query.trim().length >= 2;
  useEffect(() => {
    if (!eligible) { setResult({ query: '', items: [], unavailable: [], loading: false }); return; }
    const controller = new AbortController(); let active = true; let timeout;
    setResult({ query, items: [], unavailable: [], loading: true });
    const debounce = setTimeout(async () => {
      timeout = setTimeout(() => controller.abort(), 7000);
      try {
        const data = await fetchTargetSuggestions(query, controller.signal);
        if (active) setResult({ ...data, query, loading: false });
      } catch {
        if (active) setResult({ query, items: [], unavailable: ['ChEMBL', 'UniProt'], loading: false });
      } finally { clearTimeout(timeout); }
    }, 350);
    return () => { active = false; clearTimeout(debounce); clearTimeout(timeout); controller.abort(); };
  }, [query, eligible]);
  return eligible && result.query === query ? result : { items: [], unavailable: [], loading: eligible };
}