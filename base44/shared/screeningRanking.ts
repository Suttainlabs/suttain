import { parseSmiles } from './screeningSmiles.ts';
import { fingerprint, bestSimilarity } from './screeningFingerprint.ts';
import { descriptors } from './screeningDescriptors.ts';
import { normalizeEvidence, bestMeasurement, qualifiesEvidence } from './screeningEvidence.ts';
export function rankEvidence(raw, input) {
  const normalized = normalizeEvidence(raw), parsed = [], skipped = []; let qualityExcluded = 0;
  for (const row of normalized.rows.slice(0, input.max_candidates)) {
    if (!(row.evidence || []).some(e => input.evidence_quality === 'strict' ? qualifiesEvidence(e, 'strict') : e.value_nm <= 10000)) { qualityExcluded++; continue; }
    try { const graph = parseSmiles(row.smiles); parsed.push({ ...row, props: descriptors(graph), fp: input.method === 'measured_potency' || input.method === 'property_filter' ? null : fingerprint(graph) }); }
    catch (e) { skipped.push({ id: row.id, reason: e.message }); }
  }
  const references = parsed.filter(r => r.fp && r.evidence.some(e => qualifiesEvidence(e, input.evidence_quality) && e.value_nm <= 1000)).slice(0, 30);
  const candidates = []; let filtered = 0, missingPotency = 0;
  for (const row of parsed) {
    const props = row.props, filter = input.admet_filter || 'standard';
    if ((filter === 'strict' && props.risk !== 'low') || (filter === 'standard' && props.risk === 'high')) { filtered++; continue; }
    const measured = bestMeasurement(row, input.affinity_type || 'IC50', input.evidence_quality);
    if (input.method === 'measured_potency' && !measured) { missingPotency++; continue; }
    const others = references.filter(r => r.id !== row.id && r.smiles !== row.smiles && !(r.inchikey && r.inchikey === row.inchikey));
    const match = row.fp && others.length ? bestSimilarity(row.fp, others) : null;
    const sim = match ? +match.score.toFixed(4) : null;
    const potencyComponent = measured ? Math.max(0, Math.min(1, (9 - Math.log10(measured.value_nm) - 5) / 5)) : null;
    const propertiesComponent = 1 / (1 + props.lipinski_violations + props.veber_violations);
    const rankingScore = input.method === 'balanced_evidence' ? +(0.5 * (sim || 0) + 0.35 * (potencyComponent || 0) + 0.15 * propertiesComponent).toFixed(4) : input.method === 'measured_potency' ? potencyComponent : input.method === 'property_filter' ? propertiesComponent : sim;
    const { fp, props: ignored, name, ...rest } = row;
    candidates.push({ ...rest, drug: name, ...props, ranking_score: rankingScore, ranking_method: input.method, binding_proxy_score: sim, measured_affinity: measured, evidence_label: measured ? 'Measured target-linked potency' : 'Reported assay evidence; no eligible exact potency for selected endpoint', score_components: { similarity: sim, measured_potency: potencyComponent, estimated_properties: propertiesComponent }, most_similar_known_ligand: match?.reference?.id || null, reference_smiles: match?.reference?.smiles || null, reference_source_url: match?.reference?.source_url || null, is_reference: references.some(r => r.id === row.id) });
  }
  candidates.sort((a, b) => input.method === 'measured_potency' ? a.measured_affinity.value_nm - b.measured_affinity.value_nm || a.id.localeCompare(b.id) : (b.ranking_score ?? -1) - (a.ranking_score ?? -1) || a.id.localeCompare(b.id));
  candidates.forEach((c, i) => { c.rank = i + 1; });
  return { candidates, compounds_screened: parsed.length, duplicate_count: normalized.duplicates, unique_fetched_count: normalized.rows.length, skipped, skipped_count: skipped.length, quality_excluded_count: qualityExcluded, missing_potency_count: missingPotency, filtered_count: filtered, reference_count: references.length, references: references.map(({ fp, props, ...r }) => r) };
}