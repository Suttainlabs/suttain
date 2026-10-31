// Deterministic result cache (fix list A1, A2): identical inputs return the
// identical stored result. Best-effort: any storage error simply skips caching.

export async function cacheKey(kind: string, inputs: unknown, version: string) {
  const text = JSON.stringify({ kind, version, inputs });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function readCache(serviceClient: any, key: string) {
  try {
    const rows = await serviceClient.entities.AnalysisCache.filter({ cache_key: key }, '-created_date', 1);
    return rows?.[0]?.result || null;
  } catch {
    return null;
  }
}

export async function writeCache(serviceClient: any, kind: string, key: string, inputs: unknown, result: unknown, version: string) {
  try {
    await serviceClient.entities.AnalysisCache.create({ cache_key: key, kind, inputs, result, version });
  } catch (error) {
    console.warn('AnalysisCache write skipped:', (error as Error)?.message);
  }
}
