import { useEffect, useRef, useState } from 'react';
import searchTargets from '@/components/drug-design/searchTargets';
export default function useTargetSearch() {
  const [query, setQuery] = useState('EGFR'); const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(''); const [sourceWarning, setSourceWarning] = useState('');
  const [matches, setMatches] = useState([]); const [selectedTarget, setSelectedTarget] = useState(null);
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);
  function resetSearch() { controller.current?.abort(); controller.current = null; setSearching(false); setSelectedTarget(null); setMatches([]); setSearchError(''); setSourceWarning(''); }
  async function runSearch(searchQuery = query) {
    if (!searchQuery.trim()) return;
    controller.current?.abort(); const request = new AbortController(); controller.current = request;
    setSearching(true); setSearchError(''); setSourceWarning(''); setMatches([]); setSelectedTarget(null);
    const timer = setTimeout(() => request.abort(), 15000);
    try {
      const result = await searchTargets(searchQuery, request.signal);
      if (controller.current !== request) return;
      setMatches(result.matches);
      if (!result.matches.length) setSearchError(result.unavailable.length === 3 ? 'Target sources could not be reached. Please try again.' : 'No match found across the available sources. Try a different protein, gene, or disease name.');
      if (result.unavailable.length) setSourceWarning(`Unavailable sources: ${result.unavailable.join(', ')}. Results may be incomplete.`);
    } catch (error) { if (controller.current === request) setSearchError(error.name === 'AbortError' ? 'Search timed out. Please try again.' : 'Search failed. Please try again.'); }
    finally { clearTimeout(timer); if (controller.current === request) { setSearching(false); controller.current = null; } }
  }
  return { query, setQuery, searching, searchError, sourceWarning, matches, selectedTarget, setSelectedTarget, runSearch, resetSearch };
}