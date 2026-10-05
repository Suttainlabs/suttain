export const computeUnavailable = 'Real screening compute is not connected. No job has been submitted or counted. Your saved shortlist is still available.';
export const realJobFilter = { execution_mode: 'real', provider_job_id: { $exists: true, $nin: ['', null] } };
export async function eachOwnedPage(entity, userId, filter, fields, consume) {
  const size = 200;
  for (let skip = 0; ; skip += size) {
    const rows = await entity.filter({ ...filter, created_by_id: userId }, 'created_date', size, skip, fields);
    consume(rows);
    if (rows.length < size) return;
  }
}
export function validateSubmission(input) {
  if (!input || typeof input !== 'object' || typeof input.target_ref !== 'string' || !input.target_ref.trim() || input.target_ref.length > 100 || typeof input.target_label !== 'string' || !input.target_label.trim() || input.target_label.length > 1000) return 'Select a valid target.';
  if (!['chembl_bioactive', 'bindingdb', 'pubchem'].includes(input.library)) return 'Choose a supported compound source tier.';
  if (!['ligand_similarity', 'measured_potency', 'balanced_evidence', 'property_filter'].includes(input.method)) return 'Choose similarity, measured potency or balanced evidence. No docking or ML prediction is performed.';
  if (input.evidence_quality !== undefined && !['standard', 'strict'].includes(input.evidence_quality)) return 'Choose a valid evidence-quality setting.';
  if (input.affinity_type !== undefined && !['IC50', 'Ki', 'Kd'].includes(input.affinity_type)) return 'Choose IC50, Ki or Kd.';
  if (!Number.isInteger(input.max_candidates) || input.max_candidates < 1 || input.max_candidates > 250) return 'Candidate limit must be a whole number from 1 to 250 per synchronous run.';
  if (input.admet_filter !== undefined && !['none', 'standard', 'strict'].includes(input.admet_filter)) return 'Choose a valid property filter.';
  for (const key of ['target_chembl_id', 'target_uniprot_id']) if (input[key] !== undefined && (typeof input[key] !== 'string' || input[key].length > 30)) return 'Invalid target identifier.';
  return null;
}