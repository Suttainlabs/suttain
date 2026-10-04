async function json(url, signal, options = {}) {
  const response = await fetch(url, { ...options, signal });
  if (response.status === 204) return {};
  if (!response.ok) throw new Error(`Public source returned ${response.status}`);
  return response.json();
}
async function pdb(query, signal) {
  const result = await json('https://search.rcsb.org/rcsbsearch/v2/query', signal, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: { type: 'terminal', service: 'full_text', parameters: { value: query } }, return_type: 'entry', request_options: { paginate: { start: 0, rows: 1 } } }) });
  const id = result.result_set?.[0]?.identifier;
  if (!id) return null;
  const entry = await json(`https://data.rcsb.org/rest/v1/core/entry/${encodeURIComponent(id)}`, signal);
  return { source: 'RCSB PDB', pdb_id: id, name: entry.struct?.title || query, structure_resolved: true, resolution: entry.rcsb_entry_info?.resolution_combined?.[0], method: entry.exptl?.[0]?.method };
}
async function chembl(query, signal) {
  const data = await json(`https://www.ebi.ac.uk/chembl/api/data/target/search?q=${encodeURIComponent(query)}&format=json`, signal);
  const target = data.targets?.[0];
  if (!target) return null;
  const hit = { source: 'ChEMBL', chembl_id: target.target_chembl_id, chembl_name: target.pref_name, target_class: target.target_type };
  try { const activity = await json(`https://www.ebi.ac.uk/chembl/api/data/activity?target_chembl_id=${encodeURIComponent(target.target_chembl_id)}&limit=1&format=json`, signal); hit.activity_count = activity.page_meta?.total_count; } catch { hit.activity_unavailable = true; }
  return hit;
}
async function uniprot(query, signal) {
  const params = new URLSearchParams({ query: `(${query}) AND organism_id:9606`, fields: 'accession,protein_name,cc_disease', format: 'json', size: '1' });
  const data = await json(`https://rest.uniprot.org/uniprotkb/search?${params}`, signal);
  const target = data.results?.[0];
  if (!target) return null;
  return { source: 'UniProt', uniprot_id: target.primaryAccession, uniprot_name: target.proteinDescription?.recommendedName?.fullName?.value, disease_context: (target.comments || []).filter(c => c.commentType === 'DISEASE').map(c => c.disease?.diseaseId).filter(Boolean).join(', ') };
}
export default async function searchTargets(query, signal) {
  if (!query.trim()) return { matches: [], unavailable: [] };
  const sources = ['RCSB PDB', 'ChEMBL', 'UniProt'];
  const result = await Promise.allSettled([pdb(query.trim(), signal), chembl(query.trim(), signal), uniprot(query.trim(), signal)]);
  const hits = result.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
  const unavailable = result.flatMap((r, i) => r.status === 'rejected' ? [sources[i]] : []);
  // Independent search hits are not proof of the same biological target.
  const matches = hits.map(hit => ({ ...hit, name: hit.chembl_name || hit.uniprot_name || hit.name || query, source_notes: [hit.source] }));
  matches.sort((a, b) => Number(!!b.chembl_id) - Number(!!a.chembl_id));
  return { matches, unavailable };
}