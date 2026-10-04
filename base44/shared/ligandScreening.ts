import { parseSmiles } from './screeningSmiles.ts';
import { fingerprint, bestSimilarity } from './screeningFingerprint.ts';
import { descriptors, DESCRIPTOR_METHOD } from './screeningDescriptors.ts';
import { resolveScreeningTarget, fetchScreeningActives, fetchScreeningLibrary, screeningError } from './screeningChembl.ts';
export const SCREENING_VERSION = 'suttain-js-ligand-v1';
export const SCREENING_LIMIT = 250;
export function screeningCapability() {
  // Deterministic startup checks, not a claim of scientific validation or source uptime.
  const aspirin = parseSmiles('CC(=O)Oc1ccccc1C(=O)O'), fp = fingerprint(aspirin);
  const checks = [Math.abs(descriptors(aspirin).molecular_weight - 180.16) < 0.1, bestSimilarity(fp, [{ fp }]).score === 1, Math.abs(descriptors(parseSmiles('CCO')).molecular_weight - 46.069) < 0.1];
  return { available: checks.every(Boolean), version: SCREENING_VERSION, maxCandidates: SCREENING_LIMIT, sanityChecksPassed: checks.filter(Boolean).length };
}
export async function runLigandScreening(input) {
  const target = await resolveScreeningTarget(input), propertyOnly = input.method === 'property_filter';
  const [activeData, library] = await Promise.all([propertyOnly ? Promise.resolve({ references: [], activity_records_reviewed: 0 }) : fetchScreeningActives(target.id), fetchScreeningLibrary(input.max_candidates)]);
  const references = [], skippedReferences = [];
  for (const row of activeData.references) {
    try { references.push({ ...row, fp: fingerprint(parseSmiles(row.smiles)) }); }
    catch (error) { skippedReferences.push({ id: row.id, reason: error.message }); }
  }
  if (!propertyOnly && !references.length) throw screeningError('No reference ligands could be parsed by the supported JS SMILES subset. Choose a different target.');
  const candidates = [], skipped = []; let screened = 0, filtered = 0;
  const filter = input.admet_filter || 'standard';
  for (const molecule of library) {
    try {
      const graph = parseSmiles(molecule.smiles), props = descriptors(graph);
      const match = propertyOnly ? null : bestSimilarity(fingerprint(graph), references);
      screened++;
      if ((filter === 'strict' && props.risk !== 'low') || (filter === 'standard' && props.risk === 'high')) { filtered++; continue; }
      candidates.push({ id: molecule.id, drug: molecule.name, smiles: molecule.smiles, ...props, binding_proxy_score: match ? +match.score.toFixed(4) : null, most_similar_known_ligand: match?.reference?.id || null, reference_smiles: match?.reference?.smiles || null, is_reference: references.some(r => r.id === molecule.id || r.smiles === molecule.smiles) });
    } catch (error) { skipped.push({ id: molecule.id, reason: error.message }); }
  }
  if (!screened) throw screeningError(`None of the ${library.length} fetched compounds could be processed by the JS SMILES subset. Try a larger batch or another target.`);
  candidates.sort((a, b) => propertyOnly ? (a.lipinski_violations + a.veber_violations) - (b.lipinski_violations + b.veber_violations) || a.molecular_weight - b.molecular_weight : b.binding_proxy_score - a.binding_proxy_score || a.id.localeCompare(b.id));
  return { pipeline_version: SCREENING_VERSION, method: propertyOnly ? 'property_filter' : 'ligand_similarity', target, descriptor_method: DESCRIPTOR_METHOD, fingerprint_method: 'Exact canonical path sets up to 5 bonds; Tanimoto; no stereochemistry', candidates, compounds_screened: screened, fetched_count: library.length, filtered_count: filtered, skipped_count: skipped.length, skipped, skipped_references: skippedReferences, reference_count: references.length, references: references.map(({ fp, ...row }) => row), activity_records_reviewed: activeData.activity_records_reviewed, property_filter: filter, source: 'ChEMBL REST API', source_url: 'https://www.ebi.ac.uk/chembl/api/data/', retrieved_at: new Date().toISOString(), library_scope: 'First clinical-stage small molecules (max_phase >= 1), ordered by ChEMBL ID; not the whole ChEMBL database', reference_criteria: 'Binding assay, exact IC50 > 0 and <= 1000 nM; validity flags and duplicates excluded; up to 30 unique ligands from 300 activity rows', limitations: 'Research prioritization only. Similarity is not binding affinity or probability. LogP, TPSA, hydrogen-bond counts, rotatable bonds and Lipinski/Veber labels are reduced-fragment estimates, not full Wildman–Crippen/Ertl implementations, validated ADMET, toxicity or clinical safety. Unsupported chemistry is skipped; stereo is ignored. Reference compounds may occur in the candidate batch and are marked.' };
}