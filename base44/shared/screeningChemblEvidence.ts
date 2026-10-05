import { sourceGet, validateRows, sourceError } from './screeningHttp.ts';
import { measurement } from './screeningEvidence.ts';
export async function fetchChemblEvidence(target, input, options = {}) {
  if (!target.chembl_id) throw sourceError('No unique verified ChEMBL mapping', 'unavailable');
  const records = []; let reviewed = 0;
  const bound = Math.min(500, Math.max(100, input.max_candidates * 2));
  for (let offset = 0; offset < bound; offset += 100) {
    const params = new URLSearchParams({ target_chembl_id: target.chembl_id, assay_type: 'B', standard_type__in: 'IC50,Ki,Kd', standard_units: 'nM', standard_relation: '=', standard_value__gt: '0', standard_value__lte: '10000', limit: '100', offset: String(offset), order_by: 'activity_id', format: 'json' });
    const data = await sourceGet(`https://www.ebi.ac.uk/chembl/api/data/activity?${params}`, options), rows = validateRows(data, 'activities'); reviewed += rows.length;
    const ids = [...new Set(rows.map(r => r.assay_chembl_id).filter(Boolean))];
    const trusted = new Set();
    if (ids.length) {
      const assayParams = new URLSearchParams({ assay_chembl_id__in: ids.join(','), target_chembl_id: target.chembl_id, confidence_score: '9', assay_type: 'B', limit: '100', format: 'json' });
      const assays = await sourceGet(`https://www.ebi.ac.uk/chembl/api/data/assay?${assayParams}`, options);
      for (const a of validateRows(assays, 'assays')) if (a.target_chembl_id === target.chembl_id && a.assay_type === 'B' && Number(a.confidence_score) === 9 && !a.variant_sequence && !a.variant_id) trusted.add(a.assay_chembl_id);
    }
    for (const r of rows) {
      if (r.target_chembl_id !== target.chembl_id || r.assay_type !== 'B' || !trusted.has(r.assay_chembl_id) || r.data_validity_comment || Number(r.potential_duplicate) === 1 || !r.canonical_smiles) continue;
      const e = measurement(r.standard_type, r.standard_value, r.standard_units, r.standard_relation, { source: 'ChEMBL', assay_id: r.assay_chembl_id, activity_id: r.activity_id, assay_description: r.assay_description, document_id: r.document_chembl_id, pmid: r.document_pmid || null, doi: r.document_doi || null, target_match: `Exact ChEMBL target ${target.chembl_id}; assay confidence 9`, source_url: `https://www.ebi.ac.uk/chembl/explore/assay/${r.assay_chembl_id}` });
      if (!e) continue;
      records.push({ id: r.molecule_chembl_id, name: r.molecule_pref_name || r.molecule_chembl_id, smiles: r.canonical_smiles, canonical_smiles: r.canonical_smiles, source: 'ChEMBL', source_url: `https://www.ebi.ac.uk/chembl/explore/compound/${r.molecule_chembl_id}`, evidence: [e] });
    }
    if (!data.page_meta?.next || rows.length < 100) break;
  }
  return { rows: records, reviewed, scope: `Up to ${bound} target-linked binding records; exact Ki/Kd/IC50 ≤ 10,000 nM; confidence 9. Not the full database.` };
}