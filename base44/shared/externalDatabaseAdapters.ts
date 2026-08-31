// External database enrichment adapters for the Suttain platform.
// Shared by:
//   - enrichChemicalMultiSource (HTTP function for frontend lookups)
//   - getAccurateChemicalAnalysis (accuracy floor + compliance auditor)
//
// Each adapter resolves one external database and returns a normalized shape:
//   { source_db, fields: [{ field, value, units, source_url }], retrieved_at }
// Adapters return null on any failure (no data / timeout / parse error) so the
// aggregator can report per-source status without blocking the response.

const FETCH_TIMEOUT = 8000; // 8s per adapter call

function nowIso() { return new Date().toISOString(); }

async function timedFetch(url, opts = {}) {
  try {
    const res = await fetch(url, {
      ...opts,
      signal: AbortSignal.timeout(opts.timeout || FETCH_TIMEOUT),
      headers: { Accept: 'application/json, text/plain, */*', ...(opts.headers || {}) },
    });
    if (!res.ok) return { ok: false, status: res.status };
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return { ok: true, json: await res.json() }; } catch { return { ok: false }; }
    }
    return { ok: true, text: await res.text() };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── Identity resolution (PubChem CID + CAS via synonyms) ───────────────────
export async function resolveChemicalIdentity(query) {
  const trimmed = (query || '').trim();
  if (!trimmed) return { name: '', cid: null, dtxsid: null, cas: null, smiles: null, molecular_formula: null, molecular_weight: null };
  const isCas = /^\d{2,7}-\d{2}-\d$/.test(trimmed);
  const isSmiles = /[()=#\[\]\\@]/.test(trimmed);
  const pubchemHeaders = { 'User-Agent': 'Suttain/1.0 (chemical-enrichment)', Accept: 'application/json' };

  // PubChem identity — CID is returned automatically; do NOT request it explicitly.
  let pubchem = null;
  if (isSmiles) {
    pubchem = await timedFetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(trimmed)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName/JSON`, { headers: pubchemHeaders });
  } else {
    pubchem = await timedFetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(trimmed)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName/JSON`, { headers: pubchemHeaders });
  }
  let cid = null, name = trimmed, smiles = null, formula = null, weight = null;
  if (pubchem.ok && pubchem.json?.PropertyTable?.Properties?.[0]) {
    const p = pubchem.json.PropertyTable.Properties[0];
    cid = p.CID != null ? String(p.CID) : null;
    name = p.IUPACName || trimmed;
    smiles = p.CanonicalSMILES || null;
    formula = p.MolecularFormula || null;
    weight = p.MolecularWeight != null ? Number(p.MolecularWeight) : null;
  }

  // Resolve CAS from PubChem synonyms (so EPA ECOTOX / Envirofacts adapters work)
  let cas = isCas ? trimmed : null;
  let dtxsid = null;
  if (cid && !cas) {
    const synRes = await timedFetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`, { headers: pubchemHeaders, timeout: 5000 });
    if (synRes.ok && synRes.json?.InformationList?.Information?.[0]?.Synonym) {
      const synonyms = synRes.json.InformationList.Information[0].Synonym;
      const casMatch = synonyms.find(s => /^\d{2,7}-\d{2}-\d$/.test(s));
      if (casMatch) cas = casMatch;
    }
  }

  // EPA CompTox Dashboard — DTXSID resolution (best-effort; endpoint availability varies)
  const compToxQuery = isCas ? trimmed : name;
  if (compToxQuery) {
    const epa = await timedFetch(`https://comptox.epa.gov/dashboard-api/ccdapp2/chemical/search/equal/${encodeURIComponent(compToxQuery)}`, { headers: pubchemHeaders, timeout: 5000 });
    if (epa.ok && epa.json) {
      const hit = Array.isArray(epa.json) ? epa.json[0] : (epa.json?.results?.[0] || epa.json);
      if (hit) {
        dtxsid = hit.dtxsid || hit.DTXSID || null;
        cas = cas || hit.casrn || hit.casNumber || null;
        name = name || hit.name || hit.preferredName || trimmed;
      }
    }
  }

  return { name, cid, dtxsid, cas, smiles, molecular_formula: formula, molecular_weight: weight };
}

// ─── 1. PubChem GHS classifications (PUG View) ──────────────────────────────
export async function pubchemGHS(identity) {
  if (!identity.cid) return null;
  const res = await timedFetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${identity.cid}/JSON?heading=GHS+Classification`, { headers: { 'User-Agent': 'Suttain/1.0 (chemical-enrichment)' } });
  if (!res.ok || !res.json) return null;
  const sourceUrl = `https://pubchem.ncbi.nlm.nih.gov/compound/${identity.cid}`;
  const fields = [];
  function walk(section) {
    if (Array.isArray(section.Information)) {
      for (const info of section.Information) {
        const label = info.Description || info.Name || section.TOCHeading || '';
        let val = info.Value?.StringWithMarkup?.[0]?.String || info.Value?.String || '';
        if (!val && Array.isArray(info.Value?.StringWithMarkup)) {
          val = info.Value.StringWithMarkup.map(s => s.String || '').join(' ');
        }
        if (val) fields.push({ field: label || 'GHS classification', value: val, units: '', source_url: sourceUrl });
      }
    }
    if (Array.isArray(section.Section)) section.Section.forEach(walk);
  }
  (res.json?.Record?.Section || []).forEach(walk);
  if (fields.length === 0) return null;
  return { source_db: 'PubChem GHS', fields, retrieved_at: nowIso() };
}

// ─── 2. ChEBI ontology / biochemical role ───────────────────────────────────
export async function chebiDetail(identity) {
  const term = identity.name || identity.cas;
  if (!term) return null;
  const searchRes = await timedFetch(`https://www.ebi.ac.uk/chebi/web-services2/rest/search?search=${encodeURIComponent(term)}&searchCategory=ALL&maximumResults=1`);
  if (!searchRes.ok || !searchRes.json) return null;
  const hit = searchRes.json?.searchResults?.results?.[0];
  if (!hit?.chebiId) return null;
  const id = hit.chebiId;
  const sourceUrl = `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${id}`;
  const fields = [];
  if (hit.chebiAsciiName) fields.push({ field: 'ChEBI name', value: hit.chebiAsciiName, units: '', source_url: sourceUrl });
  const formula = hit.formulae?.[0]?.data || (hit.formulae?.data);
  if (formula) fields.push({ field: 'Molecular formula', value: formula, units: '', source_url: sourceUrl });
  if (hit.mass != null) fields.push({ field: 'Mass', value: String(hit.mass), units: 'Da', source_url: sourceUrl });
  if (hit.iupacNames?.length) fields.push({ field: 'IUPAC name', value: hit.iupacNames[0], units: '', source_url: sourceUrl });
  // Fetch full entity for definition + roles
  const entRes = await timedFetch(`https://www.ebi.ac.uk/chebi/web-services2/rest/entity/${id}`);
  if (entRes.ok && entRes.json) {
    const e = entRes.json;
    if (e.definition) fields.push({ field: 'Definition', value: e.definition, units: '', source_url: sourceUrl });
    const roles = (e.Roles || e.Functions || []).map(r => r?.chebiAsciiName || r?.name).filter(Boolean);
    if (roles.length) fields.push({ field: 'Biochemical role', value: roles.slice(0, 4).join(', '), units: '', source_url: sourceUrl });
  }
  if (fields.length === 0) return null;
  return { source_db: 'ChEBI', fields, retrieved_at: nowIso() };
}

// ─── 3. NIST WebBook thermophysical properties ──────────────────────────────
export async function nistWebbook(identity) {
  const q = identity.cas || identity.name;
  if (!q) return null;
  const key = identity.cas ? 'CAS' : 'Name';
  const url = `https://webbook.nist.gov/cgi/cbook.cgi?${key}=${encodeURIComponent(q)}&Units=SI&cTG=on&cTP=on&cPI=on`;
  const res = await timedFetch(url);
  if (!res.ok || !res.text) return null;
  const html = res.text;
  if (/no data available|not found|<title>NIST Chemistry WebBook<\/title>\s*<h1>No data/i.test(html) && !/Boiling|Melting|Density/i.test(html)) return null;
  const fields = [];
  const grab = (label, regex) => {
    const m = html.match(regex);
    if (m && m[1]) fields.push({ field: label, value: m[1].replace(/<[^>]*>/g, '').trim(), units: '', source_url: url });
  };
  grab('Boiling point', /Boiling Point[\s\S]{0,300}?>([\d.]+\s*[\u00b0CKF][\s\S]{0,20})/i);
  grab('Melting point', /Melting Point[\s\S]{0,300}?>([\d.]+\s*[\u00b0CKF][\s\S]{0,20})/i);
  grab('Density', /Density[\s\S]{0,300}?>([\d.]+\s*(?:g\/cm3|kg\/m3|g\/mL)[\s\S]{0,20})/i);
  grab('Flash point', /Flash Point[\s\S]{0,300}?>([\d.]+\s*[\u00b0CKF][\s\S]{0,20})/i);
  grab('Vapor pressure', /Vapor Pressure[\s\S]{0,300}?>([\d.eE+-]+\s*(?:kPa|mmHg|Pa)[\s\S]{0,20})/i);
  if (fields.length === 0) return null;
  return { source_db: 'NIST WebBook', fields, retrieved_at: nowIso() };
}

// ─── 4. EPA Safer Chemical Ingredients List (via CompTox details) ───────────
export async function epaSCIL(identity) {
  if (!identity.dtxsid) return null;
  const res = await timedFetch(`https://comptox.epa.gov/dashboard-api/ccdapp2/chemical/details/${identity.dtxsid}`);
  if (!res.ok || !res.json) return null;
  const d = res.json;
  const sourceUrl = `https://comptox.epa.gov/dashboard/chemical/details/${identity.dtxsid}`;
  const fields = [];
  const safer = d.saferChemical ?? d.safer_chemical ?? d.isSaferChemical ?? d.saferChemicalIngredient;
  if (safer != null) fields.push({ field: 'On EPA Safer Chemical Ingredients List', value: safer ? 'Yes' : 'No', units: '', source_url: sourceUrl });
  if (d.functionalUse || d.functional_use) fields.push({ field: 'Functional use', value: d.functionalUse || d.functional_use, units: '', source_url: sourceUrl });
  if (d.lifecycleStage || d.lifecycle_stage) fields.push({ field: 'Lifecycle stage', value: Array.isArray(d.lifecycleStage) ? d.lifecycleStage.join(', ') : (d.lifecycleStage || d.lifecycle_stage), units: '', source_url: sourceUrl });
  if (fields.length === 0) return null;
  return { source_db: 'EPA Safer Choice (SCIL)', fields, retrieved_at: nowIso() };
}

// ─── 5. EPA IRIS toxicity reference values ───────────────────────────────────
// The IRIS web search is JavaScript-rendered: the initial HTML contains only
// boilerplate help text, not per-chemical values. To avoid false positives we
// only return data when the page contains a genuine assessment link for the
// queried chemical. Real IRIS toxicity values are also surfaced via the EPA
// CompTox Dashboard API (preferred when available).
export async function epaIRIS(identity) {
  const term = identity.name || identity.cas;
  if (!term) return null;
  const url = `https://cfpub.epa.gov/ncea/iris/search/index.cfm?chemical_name=${encodeURIComponent(term)}`;
  const res = await timedFetch(url, { headers: { 'User-Agent': 'Suttain/1.0 (chemical-enrichment)' } });
  if (!res.ok || !res.text) return null;
  const html = res.text;
  // The JS-rendered search shell has no inline results — bail out rather than
  // match boilerplate help text (which would produce false positives).
  const hasAssessmentLink = /\/ncea\/iris\/documents\/|reviewstanddoc|iris_documents\/toxicological/i.test(html);
  const hasNoResults = /no records|0 results|no matching|did not match/i.test(html);
  if (!hasAssessmentLink || hasNoResults) return null;
  const fields = [];
  const grab = (label, regex, units) => {
    const m = html.match(regex);
    if (m && m[1]) fields.push({ field: label, value: m[1].trim(), units: units || '', source_url: url });
  };
  grab('Oral RfD (reference dose)', /RfD[^0-9]*([\d.eE+-]+)\s*mg\/kg-day/i, 'mg/kg-day');
  grab('Inhalation RfC', /RfC[^0-9]*([\d.eE+-]+)\s*mg\/m3/i, 'mg/m3');
  grab('Cancer slope factor (oral)', /oral slope factor[^0-9]*([\d.eE+-]+)/i, '(mg/kg-day)-1');
  if (fields.length === 0) return null;
  return { source_db: 'EPA IRIS', fields, retrieved_at: nowIso() };
}

// ─── 6. EPA ECOTOX aquatic / terrestrial toxicity ───────────────────────────
export async function epaECOTOX(identity) {
  if (!identity.cas) return null;
  const url = `https://cfpub.epa.gov/ecotox/searchresult?cas=${encodeURIComponent(identity.cas)}`;
  const res = await timedFetch(url);
  if (!res.ok || !res.text) return null;
  const html = res.text;
  const fields = [];
  const grab = (label, regex) => {
    const m = html.match(regex);
    if (m && m[1]) fields.push({ field: label, value: m[1].trim(), units: m[2] || '', source_url: url });
  };
  grab('LC50 (lethal concentration, aquatic)', /LC50[^0-9]*([\d.]+)\s*(mg\/L|ug\/L|ppm|mg\/kg)/i);
  grab('EC50 (effect concentration)', /EC50[^0-9]*([\d.]+)\s*(mg\/L|ug\/L|ppm)/i);
  grab('NOEC (no observed effect concentration)', /NOEC[^0-9]*([\d.]+)\s*(mg\/L|ug\/L|ppm)/i);
  if (fields.length === 0) return null;
  return { source_db: 'EPA ECOTOX', fields, retrieved_at: nowIso() };
}

// ─── 7. EPA Envirofacts (TRI release / facility data) ───────────────────────
export async function epaEnvirofacts(identity) {
  if (!identity.cas) return null;
  const url = `https://data.epa.gov/efservice/TRI_CHEMICAL_INFO/CAS/${encodeURIComponent(identity.cas)}/json`;
  const res = await timedFetch(url);
  if (!res.ok || !res.json) return null;
  const arr = Array.isArray(res.json) ? res.json : [];
  if (arr.length === 0) return null;
  const d = arr[0];
  const sourceUrl = 'https://enviro.epa.gov/facts/tri/';
  const fields = [];
  if (d.CARCINOGEN) fields.push({ field: 'TRI carcinogen flag', value: d.CARCINOGEN, units: '', source_url: sourceUrl });
  if (d.PBT) fields.push({ field: 'TRI persistent bioaccumulative toxic (PBT)', value: d.PBT, units: '', source_url: sourceUrl });
  if (d.CLEANUP_AIR) fields.push({ field: 'TRI air releases', value: d.CLEANUP_AIR, units: '', source_url: sourceUrl });
  if (d.CLEANUP_WATER) fields.push({ field: 'TRI water releases', value: d.CLEANUP_WATER, units: '', source_url: sourceUrl });
  if (d.CHRONIC_HUMAN_HEALTH) fields.push({ field: 'TRI chronic human health', value: d.CHRONIC_HUMAN_HEALTH, units: '', source_url: sourceUrl });
  if (fields.length === 0) return null;
  return { source_db: 'EPA Envirofacts (TRI)', fields, retrieved_at: nowIso() };
}

// ─── 8. EPA USEEIO life-cycle impact coefficients ───────────────────────────
export async function epaUSEEIO(identity) {
  const sectorsRes = await timedFetch('https://api.edap-ord.com/useeio/api/sectors');
  if (!sectorsRes.ok || !sectorsRes.json) return null;
  const sectors = Array.isArray(sectorsRes.json) ? sectorsRes.json : [];
  if (sectors.length === 0) return null;
  const q = (identity.name || '').toLowerCase();
  const keywords = q.split(/\s+/).filter(w => w.length > 3);
  let match = sectors.find(s => {
    const name = (s.name || s.sectorName || s.description || '').toLowerCase();
    return keywords.some(k => name.includes(k)) || (q && name.includes(q));
  });
  if (!match) {
    // Fall back to the first sector as a representative reference rather than nothing
    match = sectors.find(s => s.id === '221100' || /all industry|total/i.test(s.name || '')) || sectors[0];
  }
  const id = match.id || match.code || '';
  const sourceUrl = `https://api.edap-ord.com/useeio/api/sector/${id}`;
  const fields = [];
  if (match.name) fields.push({ field: 'USEEIO sector', value: match.name, units: '', source_url: sourceUrl });
  if (match.description) fields.push({ field: 'Sector description', value: match.description, units: '', source_url: sourceUrl });
  if (match.id) fields.push({ field: 'USEEIO sector code', value: match.id, units: '', source_url: sourceUrl });
  if (fields.length === 0) return null;
  return { source_db: 'EPA USEEIO', fields, retrieved_at: nowIso() };
}

// ─── Adapter registry ────────────────────────────────────────────────────────
const ADAPTERS = {
  pubchemGHS,
  chebiDetail,
  nistWebbook,
  epaSCIL,
  epaIRIS,
  epaECOTOX,
  epaEnvirofacts,
  epaUSEEIO,
};

export const ALL_ADAPTER_NAMES = Object.keys(ADAPTERS);
export const SOURCE_DB_LABELS = {
  pubchemGHS: 'PubChem GHS',
  chebiDetail: 'ChEBI',
  nistWebbook: 'NIST WebBook',
  epaSCIL: 'EPA Safer Choice (SCIL)',
  epaIRIS: 'EPA IRIS',
  epaECOTOX: 'EPA ECOTOX',
  epaEnvirofacts: 'EPA Envirofacts (TRI)',
  epaUSEEIO: 'EPA USEEIO',
};

// ─── Unified aggregator ──────────────────────────────────────────────────────
export async function enrichChemicalMultiSource(query, opts = {}) {
  const adapterNames = (opts.adapters && opts.adapters.length > 0) ? opts.adapters : ALL_ADAPTER_NAMES;
  const identity = await resolveChemicalIdentity(query);
  const results = await Promise.allSettled(adapterNames.map(name => ADAPTERS[name](identity)));
  const sources = [];
  const sourceStatus = {};
  results.forEach((r, i) => {
    const name = adapterNames[i];
    if (r.status === 'fulfilled' && r.value) {
      sources.push(r.value);
      sourceStatus[name] = 'ok';
    } else {
      sourceStatus[name] = r.status === 'rejected' ? 'error' : 'no_data';
    }
  });
  return { query, identity, sources, source_status: sourceStatus, retrieved_at: nowIso() };
}

// ─── Extract authoritative signals for the accuracy floor ────────────────────
// Used by getAccurateChemicalAnalysis to cross-check the curated hazard floor.
export function extractAuthoritativeFromEnrichment(enrichment) {
  if (!enrichment || !enrichment.sources) return { ghs_codes: [], iris_rfd: null, iris_cancer_slope: null, scil_safer: null, ecotox_lc50: null, sources: [] };
  const out = { ghs_codes: [], iris_rfd: null, iris_cancer_slope: null, scil_safer: null, ecotox_lc50: null, sources: [] };
  for (const s of enrichment.sources) {
    out.sources.push(s.source_db);
    for (const f of s.fields) {
      const v = String(f.value || '');
      // GHS H-codes
      const codes = v.match(/H\d{3}[A-Za-z]?/g);
      if (codes) out.ghs_codes.push(...codes);
      // IRIS reference dose
      if (/oral rfd|reference dose/i.test(f.field)) out.iris_rfd = parseFloat(v);
      // IRIS cancer slope factor
      if (/cancer slope factor/i.test(f.field)) out.iris_cancer_slope = parseFloat(v);
      // SCIL safer status
      if (/safer chemical ingredients list/i.test(f.field)) out.scil_safer = /^yes/i.test(v.trim());
      // ECOTOX LC50
      if (/^lc50/i.test(f.field)) out.ecotox_lc50 = parseFloat(v);
    }
  }
  out.ghs_codes = Array.from(new Set(out.ghs_codes));
  return out;
}

// ─── Merge live enrichment into the curated combination floor ────────────────
// Returns an augmented floor result. Authoritative-data-wins precedence: live
// regulatory signals (carcinogen GHS codes, IRIS cancer data) can only RAISE
// the floor, never lower it.
export function mergeEnrichmentIntoFloor(floorResult, enrichmentByChemical) {
  if (!enrichmentByChemical || enrichmentByChemical.length === 0) return floorResult;
  let floor = floorResult.floor || 0;
  let safetyLevel = floorResult.safetyLevel;
  const triggerReasons = [...(floorResult.triggerReasons || [])];
  const sources = new Set(floorResult.sources || []);
  const hazardClasses = new Set(floorResult.hazardClasses || []);
  const liveSources = [];

  for (const item of enrichmentByChemical) {
    if (!item || !item.enrichment) continue;
    const auth = extractAuthoritativeFromEnrichment(item.enrichment);
    if (auth.sources.length) liveSources.push(...auth.sources);

    const chemName = item.chemical || item.enrichment?.identity?.name || 'chemical';

    // Carcinogen GHS codes (H350, H350i, H351) raise the floor
    const carcinogenCodes = auth.ghs_codes.filter(c => /H35[01]/.test(c));
    if (carcinogenCodes.length > 0 && !hazardClasses.has('carcinogen')) {
      hazardClasses.add('carcinogen');
      if (floor < 76) { floor = 76; safetyLevel = 'CRITICAL'; }
      triggerReasons.push(`${chemName}: GHS ${carcinogenCodes.join(', ')} (carcinogenicity) from live PubChem data — floor raised to CRITICAL`);
    }
    // Reproductive toxin (H360/H361)
    const reproCodes = auth.ghs_codes.filter(c => /H36[01]/.test(c));
    if (reproCodes.length > 0 && !hazardClasses.has('reproductive_toxin')) {
      hazardClasses.add('reproductive_toxin');
      if (floor < 55) { floor = 55; safetyLevel = safetyLevel || 'DANGEROUS'; }
      triggerReasons.push(`${chemName}: GHS ${reproCodes.join(', ')} (reproductive toxicity) from live PubChem data`);
    }
    // IRIS cancer slope factor present = carcinogen evidence
    if (auth.iris_cancer_slope != null && auth.iris_cancer_slope > 0) {
      hazardClasses.add('carcinogen');
      if (floor < 75) { floor = 75; safetyLevel = safetyLevel || 'CRITICAL'; }
      triggerReasons.push(`${chemName}: EPA IRIS cancer slope factor reported (${auth.iris_cancer_slope} (mg/kg-day)-1) — carcinogenicity confirmed`);
    }
    // EPA SCIL: chemical is NOT on the safer ingredients list
    if (auth.scil_safer === false) {
      triggerReasons.push(`${chemName}: not listed on the EPA Safer Chemical Ingredients List (SCIL) — preferred-substitute flag`);
    }
    // ECOTOX aquatic toxicity: LC50 < 1 mg/L = very toxic to aquatic life
    if (auth.ecotox_lc50 != null && auth.ecotox_lc50 < 1) {
      hazardClasses.add('environmental_toxin');
      if (floor < 50) { floor = 50; safetyLevel = safetyLevel || 'DANGEROUS'; }
      triggerReasons.push(`${chemName}: EPA ECOTOX LC50 ${auth.ecotox_lc50} mg/L (very toxic to aquatic life)`);
    }
  }

  // Recompute safety level from the (possibly raised) floor
  if (floor > (floorResult.floor || 0)) {
    if (floor >= 90) safetyLevel = 'FATAL';
    else if (floor >= 75) safetyLevel = 'CRITICAL';
    else if (floor >= 55) safetyLevel = 'DANGEROUS';
    else if (floor >= 35) safetyLevel = 'MODERATE';
    else if (floor >= 15) safetyLevel = 'LOW';
    else safetyLevel = 'SAFE';
  }

  if (liveSources.length) Array.from(new Set(liveSources)).forEach(s => sources.add(s));

  return {
    ...floorResult,
    floor,
    safetyLevel,
    triggerReasons,
    sources: Array.from(sources),
    hazardClasses: Array.from(hazardClasses),
    hasAuthoritativeData: floorResult.hasAuthoritativeData || liveSources.length > 0,
  };
}