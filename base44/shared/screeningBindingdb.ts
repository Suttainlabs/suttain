import { sourceGet, sourceError } from './screeningHttp.ts';
import { measurement } from './screeningEvidence.ts';
export function parseBindingdb(data, target, url) {
  if (data === null) return { rows: [], reviewed: 0 };
  const records = data?.getLindsByUniprotsResponse?.affinities;
  if (!Array.isArray(records)) throw sourceError('Malformed BindingDB affinities', 'malformed');
  const rows = [];
  for (const r of records.slice(0, 1000)) {
    if (r.uniprot && r.uniprot !== target.uniprot_id) continue;
    if (!/^\d+$/.test(String(r.monomerid)) || !r.smile) continue;
    const raw = String(r.affinity).trim(), match = raw.match(/^(<=|>=|<|>|=)?\s*(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)$/);
    if (!match) continue;
    const e = measurement(r.affinity_type, match[2], 'nM', match[1] || '=', { source: 'BindingDB', pmid: r.pmid || null, doi: r.doi || null, assay_id: r.reactant_set_id || null, assay_description: r.query || null, target_match: `BindingDB exact UniProt query ${target.uniprot_id}; assay construct details not exposed by endpoint`, source_url: url });
    if (!e) continue;
    const id = `BDB-${r.monomerid}`;
    rows.push({ id, name: id, smiles: r.smile, inchikey: r.inchikey || null, source: 'BindingDB', source_url: `https://www.bindingdb.org/rwd/bind/chemsearch/marvin/MolStructure.jsp?monomerid=${r.monomerid}`, evidence: [e] });
  }
  return { rows, reviewed: Math.min(records.length, 1000), returned_records: records.length };
}
export async function fetchBindingdbEvidence(target, input, options = {}) {
  const url = `https://bindingdb.org/rest/getLigandsByUniprots?uniprot=${encodeURIComponent(target.uniprot_id)}&cutoff=10000&response=application/json`;
  const result = parseBindingdb(await sourceGet(url, { ...options, allowEmpty: true }), target, url);
  return { ...result, scope: 'Exact UniProt BindingDB query; first 1,000 records reviewed within an 8 MB response cap. BindingDB endpoint has no pagination; not an exhaustive target search.' };
}