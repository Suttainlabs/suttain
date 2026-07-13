import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { alphafoldApi } from '@/functions/alphafoldApi';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AlphaFoldAttribution from './AlphaFoldAttribution';

export default function DomainReliabilityHeatmap() {
  const [uniprotId, setUniprotId] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [maxPae, setMaxPae] = useState(null);
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);
  const [interpLoading, setInterpLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoad = async () => {
    const cleanId = uniprotId.trim().toUpperCase();
    if (!cleanId) return;
    setLoading(true);
    setError('');
    setPrediction(null);
    setMaxPae(null);
    setInterpretation('');
    try {
      const { data: predRes } = await alphafoldApi({ action: 'prediction', uniprotId: cleanId });
      if (predRes?.error) throw new Error(predRes.error);
      setPrediction(predRes);
      // Fetch PAE JSON for max value
      if (predRes?.paeDocUrl) {
        const { data: paeRes } = await alphafoldApi({ action: 'fetchJson', url: predRes.paeDocUrl });
        if (!paeRes.error && paeRes.max_predicted_aligned_error != null) {
          setMaxPae(paeRes.max_predicted_aligned_error);
        }
      }
      // Generate interpretation
      setInterpLoading(true);
      const interpRes = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a structural biology expert. Given the following AlphaFold protein structure quality metrics, write a 2-sentence plain English explanation of what the domain reliability means for this protein's function. Be specific and practical.

Protein: ${predRes.uniprotDescription} (${predRes.gene})
Max Predicted Aligned Error (PAE): ${predRes.max_predicted_aligned_error || maxPae || 'unknown'} Angstroms
Global pLDDT: ${predRes.globalMetricValue}
Fraction Very High (>90): ${(predRes.fractionPlddtVeryHigh * 100).toFixed(1)}%
Fraction Confident (70-90): ${(predRes.fractionPlddtConfident * 100).toFixed(1)}%
Fraction Low (50-70): ${(predRes.fractionPlddtLow * 100).toFixed(1)}%
Fraction Very Low (<50): ${(predRes.fractionPlddtVeryLow * 100).toFixed(1)}%

Explain in exactly 2 sentences what these metrics tell us about which domains are reliable and what that means for understanding this protein's function and potential drug-binding sites.`,
      });
      setInterpretation(typeof interpRes === 'string' ? interpRes : JSON.stringify(interpRes));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setInterpLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">UniProt ID</label>
        <div className="flex gap-2">
          <Input
            value={uniprotId}
            onChange={e => setUniprotId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLoad()}
            placeholder="e.g. P04637"
            className="bg-white border-slate-300 text-slate-800"
          />
          <Button onClick={handleLoad} disabled={loading} className="bg-[#007850] hover:bg-[#00695C] text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Search className="w-4 h-4 mr-1.5" />}
            Load PAE Matrix
          </Button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {prediction && (
        <>
          {/* PAE Image */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Predicted Aligned Error (PAE) Matrix</h3>
            <p className="text-[11px] text-slate-500 mb-3">Dark = high confidence, Light = uncertain</p>
            {prediction.paeImageUrl && (
              <img src={prediction.paeImageUrl} alt="PAE Heatmap" className="w-full rounded-lg" />
            )}
          </div>

          {/* Max PAE stat */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Maximum Structural Uncertainty</p>
            <p className="text-3xl font-black text-slate-900">
              {maxPae != null ? maxPae.toFixed(1) : (prediction.max_predicted_aligned_error?.toFixed(1) || '—')}
              <span className="text-sm font-normal text-slate-500 ml-2">Å</span>
            </p>
          </div>

          {/* Interpretation card */}
          <div className="bg-gradient-to-br from-violet-50 to-teal-50 border border-violet-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-bold text-slate-900">AI Interpretation</h3>
            </div>
            {interpLoading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Generating interpretation...
              </div>
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">{interpretation}</p>
            )}
          </div>

          <AlphaFoldAttribution />
        </>
      )}
    </div>
  );
}