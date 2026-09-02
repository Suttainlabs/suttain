// Shared fetch helpers for Suttain Research backend functions.
// Reused by structurePrediction, binderDesign, and dockingAnalysis.
// Extracted (not copied) per platform guidance so all three functions share one implementation.

export async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 || res.status >= 500) {
        const bodyText = await res.text().catch(() => "");
        console.log(`[researchFetch] Retryable ${res.status} attempt ${attempt + 1}/${maxRetries + 1} for ${url}`);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
          continue;
        }
        return {
          ok: false,
          status: res.status,
          statusText: res.statusText,
          json: async () => ({ error: `Server returned ${res.status} after ${maxRetries + 1} attempts. ${bodyText.slice(0, 300)}` }),
          text: async () => bodyText,
        };
      }
      return res;
    } catch (err) {
      lastError = err;
      console.log(`[researchFetch] Fetch error attempt ${attempt + 1}/${maxRetries + 1} for ${url}: ${err.message}`);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
        continue;
      }
    }
  }
  throw lastError || new Error("Fetch failed after retries");
}

const ALLOWED_RESEARCH_DOMAINS = [
  "alphafold.ebi.ac.uk",
  "rest.uniprot.org",
  "www.uniprot.org",
  "api.esmatlas.com",
  "data.rcsb.org",
  "files.rcsb.org",
  "pubchem.ncbi.nlm.nih.gov",
];

// SSRF-safe fetch for allowlisted external research domains.
// Validates scheme, host, credentials, and resolved IPs before fetching.
export async function safeExternalFetch(url, options = {}, allowed = ALLOWED_RESEARCH_DOMAINS) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, status: 400, json: async () => ({ error: "Invalid URL" }), text: async () => "" };
  }
  if (!allowed.includes(parsed.hostname)) {
    return { ok: false, status: 403, json: async () => ({ error: "Domain not allowed" }), text: async () => "" };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, status: 403, json: async () => ({ error: "Only HTTPS URLs allowed" }), text: async () => "" };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, status: 403, json: async () => ({ error: "Credentials in URL not allowed" }), text: async () => "" };
  }
  const safeUrl = `https://${parsed.hostname}${parsed.pathname}${parsed.search}`;

  let resolvedIps;
  try {
    resolvedIps = await Deno.resolveDns(parsed.hostname, "A");
  } catch (dnsErr) {
    return { ok: false, status: 400, json: async () => ({ error: `DNS resolution failed: ${dnsErr.message}` }), text: async () => "" };
  }
  const isPrivateIp = (ip) => {
    const parts = ip.split(".").map(Number);
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
    return { ok: false, status: 403, json: async () => ({ error: "Resolved IP is blocked" }), text: async () => "" };
  }

  return fetchWithRetry(safeUrl, {
    redirect: "follow",
    ...options,
    headers: {
      "User-Agent": "Suttain-Research-Platform/1.0 (contact@suttain.com)",
      ...(options.headers || {}),
    },
  });
}

// Compute mean per-residue pLDDT from B-factor columns of a PDB string.
export function meanPlddtFromPdb(pdbText) {
  const bfactors = [];
  for (const line of pdbText.split("\n")) {
    if (line.startsWith("ATOM") && line.length >= 66) {
      const b = parseFloat(line.substring(60, 66));
      if (!isNaN(b)) bfactors.push(b);
    }
  }
  if (!bfactors.length) return null;
  return Math.round((bfactors.reduce((a, b) => a + b, 0) / bfactors.length) * 10) / 10;
}

export async function authGuard(base44) {
  return await base44.auth.me().catch(() => null);
}