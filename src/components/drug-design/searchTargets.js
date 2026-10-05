import { searchScreeningTargets } from '@/functions/searchScreeningTargets';
export default async function searchTargets(query, signal) {
  if (!query.trim()) return { matches: [], unavailable: [] };
  const response = await searchScreeningTargets({ query: query.trim() });
  if (signal?.aborted) throw new DOMException('Search cancelled', 'AbortError');
  return response.data;
}