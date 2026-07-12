import { base44 } from '@/api/base44Client';

/**
 * Frontend wrapper for the hazardPrediction backend function.
 * Calls the Hazard Prediction Engine to get a calibrated, source-traceable
 * hazard assessment for a chemical compound.
 *
 * @param {object} payload - { smiles, name, compound_id, include_internals }
 * @returns {Promise<object>} Prediction result with binary result, confidence, categories, citations
 */
export async function hazardPrediction(payload) {
  const response = await base44.functions.invoke('hazardPrediction', payload);
  return response;
}