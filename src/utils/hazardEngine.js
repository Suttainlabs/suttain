import { base44 } from '@/api/base44Client';

/**
 * Calls the Suttain Hazard Prediction Engine to get a calibrated, source-traceable
 * hazard assessment for a chemical compound.
 *
 * @param {string} smiles - SMILES notation of the compound
 * @param {string} name - Compound name (alternative to SMILES)
 * @param {object} options - { include_internals: boolean }
 * @returns {object|null} Prediction result or null on error
 */
export async function getHazardScore(smiles, name, options = {}) {
  try {
    const response = await base44.functions.invoke('hazardPrediction', {
      smiles,
      name,
      include_internals: options.include_internals || false,
    });
    const data = response?.data !== undefined ? response.data : response;
    return data;
  } catch (error) {
    console.error('Hazard engine error:', error);
    return null;
  }
}

/**
 * Formats a hazard prediction result into a compact readout suitable for
 * displaying alongside scan results in SuttainScan, Food Intelligence, etc.
 *
 * Replaces plain pass/fail with a calibrated, sourced hazard readout.
 */
export function formatHazardReadout(result) {
  if (!result?.prediction) return null;
  const p = result.prediction;
  return {
    label: p.binary_result === 'hazardous' ? 'Hazardous' : 'Likely Safe',
    confidence: p.confidence,
    confidence_label: p.confidence_label,
    plain_language: p.plain_language,
    categories: (p.hazard_categories || []).map(c => ({
      category: c.category,
      sub_confidence: c.sub_confidence,
    })),
    citations: (p.citations || []).map(c => ({
      source: c.source,
      reference: c.reference,
      url: c.url,
    })),
    false_negative_note: p.false_negative_note,
    is_calibrated: true,
    source: 'Suttain Hazard Prediction Engine',
    methodology: result.methodology,
  };
}