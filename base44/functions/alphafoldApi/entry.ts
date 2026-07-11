import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Fetch with exponential backoff for 429 (Too Many Requests) and 5xx errors.
 * Retries up to 3 times with delays of 1s, 2s, 4s.
 */
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      // Retry on 429 or 5xx
      if (res.status === 429 || res.status >= 500) {
        const bodyText = await res.text().catch(() => '');
        console.log(`[alphafoldApi] Retryable status ${res.status} on attempt ${attempt + 1}/${maxRetries + 1} for ${url}`);
        if (attempt < maxRetries) {
          const delayMs = Math.pow(2, attempt) * 1000;
          console.log(`[alphafoldApi] Backing off for ${delayMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        // Exhausted retries — return a synthetic error response
        return {
 ok: false, status: res.status, statusText: res.statusText,
          json: async () => ({ error: `Server returned ${res.status} after ${maxRetries + 1} attempts. Body: ${bodyText.slice(0, 500)}` }),
          text: async () => bodyText,
        };
      }
      return res;
    } catch (err) {
      lastError = err;
      console.log(`[alphafoldApi] Fetch error on attempt ${attempt + 1}/${maxRetries + 1} for ${url}: ${err.message}`);
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
    }
  }
  throw lastError || new Error('Fetch failed after retries');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action, uniprotId, url, gene } = body;

    // Require authentication for all actions to prevent abuse/DoS
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ── Prediction action ──
    if (action === 'prediction') {
      if (!uniprotId) return Response.json({ error: 'uniprotId required' }, { status: 400 });
      const predictionUrl = `https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(uniprotId)}`;
      console.log(`[alphafoldApi] Prediction request for UniProt ID: ${uniprotId}`);
      console.log(`[alphafoldApi] Fetching: ${predictionUrl}`);

      const res = await fetchWithRetry(predictionUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Suttain-Research-Platform/1.0 (contact@suttain.com)',
        },
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => '');
        console.log(`[alphafoldApi] Prediction failed: status=${res.status}, body=${errorBody.slice(0, 500)}`);
        const errorMsg = res.status === 404
          ? 'No AlphaFold prediction found for this UniProt ID. Verify the accession is correct and that AlphaFold has a structure for it.'
          : `AlphaFold API returned status ${res.status}: ${errorBody.slice(0, 300) || res.statusText}`;
        return Response.json({ error: errorMsg, status: res.status }, { status: res.status });
      }

      const data = await res.json();
      console.log(`[alphafoldApi] Prediction success, keys: ${Object.keys(data).join(', ')}`);
      // AlphaFold prediction endpoint returns an array — extract first entry
      const prediction = Array.isArray(data) ? data[0] : data;
      if (!prediction) return Response.json({ error: 'No prediction found in response' }, { status: 404 });
      return Response.json(prediction);
    }

    // ── Fetch JSON / CSV action (with SSRF protection) ──
    if (action === 'fetchJson' || action === 'fetchCsv') {
      if (!url) return Response.json({ error: 'url required' }, { status: 400 });

      // Strict allowlist of trusted external domains
      const ALLOWED_DOMAINS = [
        'alphafold.ebi.ac.uk',
        'rest.uniprot.org',
        'www.uniprot.org',
      ];
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch {
        return Response.json({ error: 'Invalid URL' }, { status: 400 });
      }
      if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
        console.log(`[alphafoldApi] Domain rejected: ${parsedUrl.hostname}`);
        return Response.json({ error: 'Domain not allowed' }, { status: 403 });
      }
      // Enforce HTTPS to prevent protocol-based SSRF
      if (parsedUrl.protocol !== 'https:') {
        return Response.json({ error: 'Only HTTPS URLs allowed' }, { status: 403 });
      }
      // Reject URLs with embedded credentials
      if (parsedUrl.username || parsedUrl.password) {
        return Response.json({ error: 'Credentials in URL not allowed' }, { status: 403 });
      }
      // Reconstruct URL from validated components to prevent parsing tricks
      const safeUrl = `https://${parsedUrl.hostname}${parsedUrl.pathname}${parsedUrl.search}`;

      // Resolve DNS once and reject private/loopback/link-local IPs to prevent SSRF
      let resolvedIps;
      try {
        resolvedIps = await Deno.resolveDns(parsedUrl.hostname, 'A');
        console.log(`[alphafoldApi] DNS resolution for ${parsedUrl.hostname}: ${resolvedIps.join(', ')}`);
      } catch (dnsErr) {
        console.log(`[alphafoldApi] DNS resolution failed for ${parsedUrl.hostname}: ${dnsErr.message}`);
        return Response.json({ error: `DNS resolution failed for ${parsedUrl.hostname}: ${dnsErr.message}` }, { status: 400 });
      }
      const isPrivateIp = (ip) => {
        const parts = ip.split('.').map(Number);
        if (parts.length !== 4) return true;
        const [a, b] = parts;
        return (
          a === 10 ||
          (a === 172 && b >= 16 && b <= 31) ||
          (a === 192 && b === 168) ||
          a === 127 ||
          (a === 169 && b === 254) ||
          a === 0 ||
          (a === 100 && b >= 64 && b <= 127)
        );
      };
      if (resolvedIps.length === 0 || resolvedIps.some(isPrivateIp)) {
        console.log(`[alphafoldApi] IP blocked: ${resolvedIps.join(', ')}`);
        return Response.json({ error: 'Resolved IP is blocked' }, { status: 403 });
      }
      // Pin the validated IP in the fetch URL to eliminate TOCTOU DNS rebinding.
      const validatedIp = resolvedIps[0];
      const pinnedUrl = `https://${validatedIp}${parsedUrl.pathname}${parsedUrl.search}`;
      console.log(`[alphafoldApi] Pinned URL: ${pinnedUrl} (Host: ${parsedUrl.hostname})`);

      const res = await fetchWithRetry(pinnedUrl, {
        redirect: 'follow',
        headers: {
          Host: parsedUrl.hostname,
          'Accept': action === 'fetchJson' ? 'application/json' : 'text/csv',
          'User-Agent': 'Suttain-Research-Platform/1.0 (contact@suttain.com)',
        },
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => '');
        console.log(`[alphafoldApi] Fetch ${action} failed: status=${res.status}, body=${errorBody.slice(0, 500)}`);
        return Response.json({ error: `Fetch failed with status ${res.status}: ${errorBody.slice(0, 300) || res.statusText}` }, { status: res.status });
      }

      if (action === 'fetchJson') {
        const data = await res.json();
        return Response.json(data);
      }
      const text = await res.text();
      return Response.json({ csv: text });
    }

    // ── Gene search action ──
    if (action === 'geneSearch') {
      if (!gene) return Response.json({ error: 'gene required' }, { status: 400 });
      const query = `gene:${encodeURIComponent(gene)}+AND+organism_id:9606+AND+reviewed:true`;
      const searchUrl = `https://rest.uniprot.org/uniprotkb/search?query=${query}&format=json&size=5&fields=accession,gene_names,protein_name`;
      console.log(`[alphafoldApi] Gene search for: ${gene}`);
      console.log(`[alphafoldApi] Fetching: ${searchUrl}`);

      const res = await fetchWithRetry(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Suttain-Research-Platform/1.0 (contact@suttain.com)',
        },
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => '');
        console.log(`[alphafoldApi] Gene search failed: status=${res.status}, body=${errorBody.slice(0, 500)}`);
        const errorMsg = res.status === 429
          ? 'UniProt is rate-limiting requests. Please wait a moment and try again.'
          : `UniProt search returned status ${res.status}: ${errorBody.slice(0, 300) || res.statusText}`;
        return Response.json({ error: errorMsg, status: res.status }, { status: res.status });
      }

      const data = await res.json();
      const results = (data.results || []).map(r => ({
        accession: r.primaryAccession,
        gene: r.genes?.[0]?.geneName?.value || gene,
        description: r.proteinDescription?.recommendedName?.fullName?.value || '',
      }));
      console.log(`[alphafoldApi] Gene search success, ${results.length} results`);
      return Response.json({ results });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.log(`[alphafoldApi] Unhandled error: ${error.message}`);
    console.log(`[alphafoldApi] Stack: ${error.stack}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
});