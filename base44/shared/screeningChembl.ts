const ROOT = 'https://www.ebi.ac.uk/chembl/api/data/';
export function screeningError(message, status = 422) { const error = new Error(message); error.status = status; return error; }
export async function chemblGet(resource, params = {}) {
  const url = new URL(resource, ROOT); url.search = new URLSearchParams({ format: 'json', ...params }).toString();
  let response;
  try { response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) }); }
  catch { throw screeningError('ChEMBL could not be reached within 15 seconds. Please try again.', 502); }
  if (!response.ok) throw screeningError(`ChEMBL returned HTTP ${response.status}. No screening results were fabricated; please try again.`, 502);
  try { return await response.json(); } catch { throw screeningError('ChEMBL returned an unreadable response. Please try again.', 502); }
}
export async function resolveScreeningTarget(input) {
  const ref = String(input.target_chembl_id || input.target_ref).trim().toUpperCase();
  if (/^CHEMBL\d+$/.test(ref)) {
    const target = await chemblGet(`target/${ref}`);
    if (target.target_type !== 'SINGLE PROTEIN') throw screeningError('Choose a single-protein ChEMBL target for this screening method.');
    return { id: target.target_chembl_id, name: target.pref_name, organism: target.organism };
  }
  const accession = String(input.target_uniprot_id || ref).trim().toUpperCase();
  if (!/^[A-Z0-9]{6,10}$/.test(accession)) throw screeningError('Choose a ChEMBL or UniProt target. PDB-only targets cannot be mapped unambiguously.');
  const data = await chemblGet('target', { target_components__accession: accession, target_type: 'SINGLE PROTEIN', limit: '2' });
  if (data.targets?.length !== 1 || data.page_meta?.total_count > 1) throw screeningError('No unique single-protein ChEMBL target was found. Select its ChEMBL record directly.');
  const target = data.targets[0]; return { id: target.target_chembl_id, name: target.pref_name, organism: target.organism };
}
export async function fetchScreeningActives(targetId) {
  const found = new Map(); let queried = 0;
  for (let offset = 0; offset < 300 && found.size < 30; offset += 100) {
    const data = await chemblGet('activity', { target_chembl_id: targetId, standard_type: 'IC50', standard_units: 'nM', standard_relation: '=', standard_value__gt: '0', standard_value__lte: '1000', assay_type: 'B', limit: '100', offset: String(offset), order_by: 'activity_id' });
    const rows = data.activities || []; queried += rows.length;
    for (const row of rows) {
      if (!row.canonical_smiles || !row.molecule_chembl_id || row.standard_type !== 'IC50' || row.standard_units !== 'nM' || row.standard_relation !== '=' || !(Number(row.standard_value) > 0 && Number(row.standard_value) <= 1000) || row.data_validity_comment || Number(row.potential_duplicate) === 1) continue;
      if (!found.has(row.molecule_chembl_id)) found.set(row.molecule_chembl_id, { id: row.molecule_chembl_id, smiles: row.canonical_smiles, activity_id: row.activity_id, ic50_nm: Number(row.standard_value) });
      if (found.size >= 30) break;
    }
    if (!data.page_meta?.next || rows.length < 100) break;
  }
  if (!found.size) throw screeningError('No qualifying reference ligands found in the first 300 ChEMBL binding-assay records (IC50 ≤ 1,000 nM). Choose another target.');
  return { references: [...found.values()], activity_records_reviewed: queried };
}
export async function fetchScreeningLibrary(limit) {
  const found = new Map();
  for (let offset = 0; found.size < limit && offset < limit; offset += 100) {
    const data = await chemblGet('molecule', { molecule_type: 'Small molecule', max_phase__gte: '1', limit: String(Math.min(100, limit - found.size)), offset: String(offset), order_by: 'molecule_chembl_id' });
    const rows = data.molecules || [];
    for (const row of rows) if (row.molecule_structures?.canonical_smiles) found.set(row.molecule_chembl_id, { id: row.molecule_chembl_id, name: row.pref_name || row.molecule_chembl_id, smiles: row.molecule_structures.canonical_smiles });
    if (!data.page_meta?.next || !rows.length) break;
  }
  if (!found.size) throw screeningError('ChEMBL returned no candidate structures. Please try again.', 502);
  return [...found.values()].slice(0, limit);
}