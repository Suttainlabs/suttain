// GHS lookups and a FIXED scoring formula (fix list A1, A2, K4).
//
// Scores come only from GHS hazard statement codes, using the weights below,
// so the same set of codes always gives the same score. Nothing here calls a
// language model.

const UA = { 'User-Agent': 'Suttain/1.0 (ghs-scoring)' };

export type GhsStatement = { code: string; text: string };

// Fetches GHS hazard statements for a PubChem CID. Returns null when PubChem is
// unreachable (so callers can avoid caching an incomplete result) and [] when the
// compound simply has no GHS classification.
export async function fetchGhsStatements(cid: number | string): Promise<GhsStatement[] | null> {
  try {
    const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=GHS+Classification`, {
      headers: UA, signal: AbortSignal.timeout(8000),
    });
    if (res.status === 404) return [];
    if (!res.ok) return null;
    const json = await res.json();
    const out = new Map<string, string>();
    const walk = (section: any) => {
      for (const info of section?.Information || []) {
        for (const m of info?.Value?.StringWithMarkup || []) {
          const s = String(m?.String || '');
          const hit = s.match(/^(H\d{3}[A-Za-z+]*)(?:\s*\([\d.]+%\))?\s*:\s*([^[]+)/);
          if (hit && !out.has(hit[1])) out.set(hit[1], hit[2].trim().replace(/\.$/, ''));
        }
      }
      for (const child of section?.Section || []) walk(child);
    };
    for (const s of json?.Record?.Section || []) walk(s);
    return [...out.entries()].map(([code, text]) => ({ code, text }));
  } catch {
    return null;
  }
}

export const pubchemUrl = (cid: number | string) => `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;

// Fixed weights per GHS hazard statement. Documented so results are explainable.
const HEALTH: Record<string, number> = {
  H300: 90, H310: 90, H330: 90,
  H301: 75, H311: 75, H331: 75, H370: 75, H340: 75, H350: 75, H360: 75,
  H314: 65, H372: 60, H318: 55, H371: 55, H341: 55, H351: 55, H361: 55,
  H302: 40, H312: 40, H332: 40, H334: 45, H317: 35, H304: 40,
  H315: 25, H319: 25, H335: 25, H336: 25, H373: 30,
};
const ENVIRONMENT: Record<string, number> = { H400: 60, H410: 60, H411: 45, H401: 20, H412: 25, H402: 15, H413: 20 };
const REACTIVITY: Record<string, number> = {
  H200: 90, H201: 90, H202: 90, H203: 90, H204: 80, H205: 80,
  H220: 75, H224: 75, H250: 75, H270: 65, H271: 70,
  H225: 60, H221: 55, H240: 70, H241: 65, H242: 55, H251: 50, H252: 45, H260: 65, H261: 45,
  H226: 45, H228: 45, H272: 50, H222: 40, H223: 35, H229: 30, H227: 30, H290: 20,
};

const maxOf = (codes: string[], table: Record<string, number>) =>
  codes.reduce((m, c) => Math.max(m, table[c.slice(0, 4)] || 0), 0);

export function scoreFromGhsCodes(codes: string[]) {
  const health = maxOf(codes, HEALTH);
  const environment = maxOf(codes, ENVIRONMENT);
  const reactivity = maxOf(codes, REACTIVITY);
  return { health, environment, reactivity };
}

// Overall risk for a set of chemicals that do NOT react: the worst individual
// hazard, never below the curated floor.
export function combineScores(parts: { health: number; environment: number; reactivity: number }[], floor = 0) {
  const health = Math.max(0, ...parts.map((p) => p.health));
  const environment = Math.max(0, ...parts.map((p) => p.environment));
  const reactivity = Math.max(0, ...parts.map((p) => p.reactivity));
  const overall = Math.max(floor, health, reactivity, Math.round(environment * 0.8));
  return { overall, health, environment, reactivity };
}
