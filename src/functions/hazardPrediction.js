import { base44 } from '@/api/base44Client';

/**
 * Frontend wrapper for hazard prediction.
 * `hazardPrediction` has been retired; this wrapper now calls the real trained
 * `hazardClassifier` backend function (random-forest + isotonic calibration).
 *
 * @param {object} payload - { query?, name?, smiles?, mode? }
 * @returns {Promise<object>} Calibrated verdict, probability, confidence, descriptors, validation metrics
 */
export async function hazardPrediction(payload) {
  const mode = payload?.mode === 'safety' ? 'safety' : 'balanced';
  const isSmiles = !!payload?.smiles && !payload?.query && !payload?.name;
  const body = isSmiles
    ? { smiles: payload.smiles, mode }
    : { query: (payload?.query || payload?.name || payload?.smiles || '').toString().trim(), mode };
  const response = await base44.functions.invoke('hazardClassifier', body);
  return response;
}