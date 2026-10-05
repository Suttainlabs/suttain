export function sourceError(message, code = 'unavailable') { const e = new Error(message); e.status = 502; e.sourceCode = code; return e; }
export async function sourceGet(url, options = {}) {
  const timeout = Math.min(options.timeout || 10000, Math.max(1, (options.deadline || Date.now() + 10000) - Date.now()));
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await (options.fetcher || fetch)(url, { headers: { Accept: options.text ? 'text/csv' : 'application/json' }, signal: controller.signal });
    if (response.status === 404 && options.empty404) return options.text ? '' : null;
    if (!response.ok) throw sourceError(`HTTP ${response.status}`, 'unavailable');
    let text = '', size = 0; const reader = response.body?.getReader();
    if (reader) { const decoder = new TextDecoder(); while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > (options.maxBytes || 8000000)) { await reader.cancel(); throw sourceError('Response exceeds bounded retrieval size', 'unavailable'); } text += decoder.decode(value, { stream: true }); } text += decoder.decode(); }
    else text = await response.text();
    if (options.text) return text;
    if (!text.trim() && options.allowEmpty) return null;
    try { return JSON.parse(text); } catch { throw sourceError('Malformed source response', 'malformed'); }
  } catch (e) { if (e.sourceCode) throw e; throw sourceError(e.name === 'AbortError' || controller.signal.aborted ? 'Source request timed out' : 'Source could not be reached', controller.signal.aborted ? 'timeout' : 'unavailable'); }
  finally { clearTimeout(timer); }
}
export function validateRows(data, key) { if (!Array.isArray(data?.[key])) throw sourceError(`Missing ${key} records`, 'malformed'); return data[key]; }