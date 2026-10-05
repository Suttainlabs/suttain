import { sourceGet, sourceError, validateRows } from './screeningHttp.ts';
import { measurement } from './screeningEvidence.ts';
const ROOT = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/';
export function csvRecords(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) { const c = text[i]; if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; } else if (c === ',' && !quoted) { row.push(field); field = ''; } else if (c === '\n' && !quoted) { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; } else field += c; }
  if (quoted) throw sourceError('Malformed PubChem CSV', 'malformed');
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  const header = rows.shift(); if (!header?.includes('CID') || !header.includes('Target Accession')) throw sourceError('Missing PubChem CSV columns', 'malformed');
  return rows.map(values => Object.fromEntries(header.map((key, i) => [key, values[i] || ''])));
}
export function eligibleAssay(a, target) {
  const targets = a?.target || [], name = a?.name || '';
  if (a?.activity_outcome_method !== 2 || targets.length !== 1 || !target.protein_accessions.includes(targets[0].mol_id?.protein_accession)) return null;
  if (/\b(?:cell|cells|proliferation|cytotoxic|in vivo|mutant)\b|[A-Z]\d{2,4}[A-Z]/i.test(name) || !/binding|enzyme|kinase inhibition|kinase activity|tyrosine kinase|purified/i.test(name)) return null;
  const ac = (a.results || []).filter(r => r.ac && r.unit === 5);
  if (ac.length !== 1) return null;
  const type = ac[0].name.match(/\b(IC50|Ki|Kd|AC50|EC50)\b/i)?.[1];
  const standardized = ['Standard Type', 'Standard Relation', 'Standard Value', 'Standard Units'].every(name => a.results.some(r => r.name === name));
  if ((!type && !standardized) || /extrapolat|highest.*concentration/i.test((ac[0].description || []).join(' '))) return null;
  return { type: type ? ({ ki: 'Ki', kd: 'Kd', ic50: 'IC50', ac50: 'AC50', ec50: 'EC50' })[type.toLowerCase()] : null, standardized, pmid: a.xref?.find(x => x.xref?.pmid)?.xref.pmid || null };
}
export function parsePubchemRows(text, a, target, raw = null) {
  const meta = eligibleAssay(a, target); if (!meta) return { rows: [], reviewed: 0 };
  const records = csvRecords(text), rows = [];
  const rawRows = new Map();
  if (meta.standardized) {
    if (!Array.isArray(raw?.PC_AssaySubmit?.data) || raw.PC_AssaySubmit.assay?.descr?.aid?.id !== a.aid.id) throw sourceError('Malformed PubChem standardized measurements', 'malformed');
    const fields = new Map(a.results.map(r => [r.tid, r.name]));
    for (const item of raw.PC_AssaySubmit.data.slice(0, 1000)) if (item.outcome === 2) rawRows.set(String(item.sid), Object.fromEntries((item.data || []).map(v => [fields.get(v.tid), v.value?.sval ?? v.value?.fval])));
  }
  for (const r of records.slice(0, 1000)) {
    if (r['Activity Outcome'] !== 'Active' || r.RNAi || !/^\d+$/.test(r.CID) || !target.protein_accessions.includes(r['Target Accession'])) continue;
    if (r['Target GeneID'] && !target.gene_ids.includes(r['Target GeneID'])) continue;
    const fields = rawRows.get(r.SID);
    if (meta.standardized && !fields) continue;
    const e = measurement(fields?.['Standard Type'] || meta.type, fields ? fields['Standard Value'] : r['Activity Value [uM]'], fields ? fields['Standard Units'] : 'uM', fields ? fields['Standard Relation'] : 'reported', { source: 'PubChem', assay_id: String(a.aid.id), assay_description: a.name, pmid: meta.pmid, target_match: `Exact UniProt/RefSeq accession ${r['Target Accession']}; single-target confirmatory biochemical assay`, source_url: `https://pubchem.ncbi.nlm.nih.gov/bioassay/${a.aid.id}` });
    if (e && e.value_nm <= 10000) rows.push({ cid: r.CID, id: `CID-${r.CID}`, name: `PubChem CID ${r.CID}`, source: 'PubChem', source_url: `https://pubchem.ncbi.nlm.nih.gov/compound/${r.CID}`, evidence: [e] });
  }
  return { rows, reviewed: Math.min(records.length, 1000) };
}
export async function fetchPubchemEvidence(target, input, options = {}) {
  if (target.gene_ids.length !== 1) throw sourceError('No unique curated UniProt GeneID mapping', 'unavailable');
  const list = await sourceGet(`${ROOT}assay/target/geneid/${target.gene_ids[0]}/aids/JSON`, { ...options, empty404: true });
  if (list === null) return { rows: [], reviewed: 0, scope: 'No PubChem assays for the mapped GeneID.' };
  const aids = validateRows(list.IdentifierList, 'AID').slice(0, 60);
  if (!aids.length) return { rows: [], reviewed: 0, scope: 'No PubChem assays for the mapped GeneID.' };
  const descriptions = await sourceGet(`${ROOT}assay/aid/${aids.join(',')}/description/JSON`, options);
  const assays = validateRows(descriptions, 'PC_AssayContainer').map(x => x.assay?.descr).filter(a => eligibleAssay(a, target)).slice(0, 3);
  let reviewed = 0; const rows = [];
  for (const a of assays) {
    const text = await sourceGet(`${ROOT}assay/aid/${a.aid.id}/concise/CSV`, { ...options, text: true });
    const raw = eligibleAssay(a, target).standardized ? await sourceGet(`${ROOT}assay/aid/${a.aid.id}/JSON`, options) : null;
    const parsed = parsePubchemRows(text, a, target, raw); reviewed += parsed.reviewed; rows.push(...parsed.rows);
  }
  const cids = [...new Set(rows.map(r => r.cid))].slice(0, input.max_candidates);
  const structures = new Map();
  for (let offset = 0; offset < cids.length; offset += 50) {
    const d = await sourceGet(`${ROOT}compound/cid/${cids.slice(offset, offset + 50).join(',')}/property/CanonicalSMILES,InChIKey/JSON`, options);
    for (const p of validateRows(d.PropertyTable, 'Properties')) structures.set(String(p.CID), p);
  }
  return { rows: rows.filter(r => structures.has(r.cid)).map(r => { const p = structures.get(r.cid); return { ...r, smiles: p.ConnectivitySMILES || p.CanonicalSMILES, canonical_smiles: p.ConnectivitySMILES || p.CanonicalSMILES, inchikey: p.InChIKey }; }), reviewed, scope: 'First 60 GeneID-linked assays; up to 3 single-target confirmatory biochemical assays, 1,000 rows each. Mutants/cellular/RNAi/ambiguous or extrapolated endpoints excluded. Standardized records retain raw endpoint, units and relation. Concise-only values have unreported qualifiers and are excluded from exact-potency ranking.' };
}