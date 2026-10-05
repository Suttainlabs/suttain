import { parseSmiles } from './screeningSmiles.ts';
import { fingerprint, bestSimilarity } from './screeningFingerprint.ts';
import { descriptors, DESCRIPTOR_METHOD } from './screeningDescriptors.ts';
import { resolveEvidenceTarget } from './screeningTarget.ts';
import { retrieveEvidence } from './screeningSources.ts';
import { rankEvidence } from './screeningRanking.ts';
export const SCREENING_VERSION = 'suttain-evidence-v2';
export const SCREENING_LIMIT = 250;
export function screeningCapability() {
  const aspirin = parseSmiles('CC(=O)Oc1ccccc1C(=O)O'), fp = fingerprint(aspirin);
  const checks = [Math.abs(descriptors(aspirin).molecular_weight - 180.16) < 0.1, bestSimilarity(fp, [{ fp }]).score === 1, Math.abs(descriptors(parseSmiles('CCO')).molecular_weight - 46.069) < 0.1];
  return { available: checks.every(Boolean), version: SCREENING_VERSION, maxCandidates: SCREENING_LIMIT, sanityChecksPassed: checks.filter(Boolean).length };
}
export async function runLigandScreening(input, options = {}) {
  const bounded = { ...options, deadline: Date.now() + 65000 };
  const target = await resolveEvidenceTarget(input, bounded);
  const library = await retrieveEvidence(target, input, bounded);
  const ranked = rankEvidence(library.rows, input);
  return { pipeline_version: SCREENING_VERSION, method: input.method, target, ...ranked, requested_library: input.library, effective_library: library.library, source: library.source, source_status: library.source_status, source_url: ({ ChEMBL: 'https://www.ebi.ac.uk/chembl/', BindingDB: 'https://www.bindingdb.org/', PubChem: 'https://pubchem.ncbi.nlm.nih.gov/' })[library.source], fetched_count: library.rows.length, activity_records_reviewed: library.reviewed, retrieved_at: new Date().toISOString(), property_filter: input.admet_filter || 'standard', evidence_quality: input.evidence_quality || 'standard', affinity_type: input.affinity_type || 'IC50', descriptor_method: DESCRIPTOR_METHOD, fingerprint_method: 'Exact molecular path sets up to 5 bonds; Tanimoto; stereo ignored. Fingerprints computed once per molecule; self-matches excluded.', library_scope: library.scope, reference_criteria: 'Up to 30 exact Ki/Kd/IC50 reference measurements ≤ 1,000 nM from the bounded target-linked cohort. Self-matches excluded; absent non-self references produce no similarity score.', ranking_explanation: input.method === 'measured_potency' ? 'Ascending exact concentration for the selected endpoint only. Different assays and constructs are not directly comparable; no Ki/Kd/IC50 mixing.' : input.method === 'balanced_evidence' ? 'Heuristic score = 50% non-self similarity + 35% selected-endpoint potency component + 15% estimated rule compliance. Potency component clamps (pActivity − 5)/5 to 0–1; missing components contribute zero, never fabricated potency. Not a calibrated probability.' : 'Descending non-self ligand similarity; missing similarity ranks last. Property-only legacy runs rank by estimated rule compliance.', limitations: 'Research prioritization, not docking, validated affinity prediction, toxicity, ADMET or clinical safety. Target-linked candidates are already reported in assays, not newly discovered hits. Similarity is a structural comparison, not experimental evidence. Assay endpoint, construct, conditions and provenance must be reviewed before comparing potency. Retrieval is bounded, not exhaustive. Unsupported chemistry is skipped, stereochemistry ignored; LogP/TPSA and rule labels are reduced-fragment estimates. PubChem concise qualifiers are not reported and excluded from exact-potency ranking. BindingDB assay construct and confidence are not exposed by its endpoint.' };
}