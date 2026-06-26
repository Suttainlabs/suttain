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
      const predRes = await alphafoldApi({ action: 'prediction', uniprotId: cleanId });
      if (predRes.error) throw new Error(predRes.error);
      setPrediction(predRes);
      // Fetch PAE JSON for max value
      if (predRes.paeDocUrl) {
        const paeRes = await alphafoldApi({ action: 'fetchJson', url: predRes.paeDocUrl });
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
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <label className="text-xs font-semibold text-slate-400 mb-1.5 block">UniProt ID</label>
        <div className="flex gap-2">
          <Input
            value={uniprotId}
            onChange={e => setUniprotId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLoad()}
            placeholder="e.g. P04637"
            className="bg-slate-900/50 border-slate-700 text-white"
          />
          <Button onClick={handleLoad} disabled={loading} className="bg-[#0D9E8E] hover:bg-[#0b8a7d] text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Search className="w-4 h-4 mr-1.5" />}
            Load PAE Matrix
          </Button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>

      {prediction && (
        <>
          {/* PAE Image */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2">Predicted Aligned Error (PAE) Matrix</h3>
            <p className="text-[11px] text-slate-500 mb-3">Dark = high confidence, Light = uncertain</p>
            {prediction.paeImageUrl && (
              <img src={prediction.paeImageUrl} alt="PAE Heatmap" className="w-full rounded-lg" />
            )}
          </div>

          {/* Max PAE stat */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Maximum Structural Uncertainty</p>
            <p className="text-3xl font-black text-white">
              {maxPae != null ? maxPae.toFixed(1) : (prediction.max_predicted_aligned_error?.toFixed(1) || '—')}
              <span className="text-sm font-normal text-slate-500 ml-2">Å</span>
            </p>
          </div>

          {/* Interpretation card */}
          <div className="bg-gradient-to-br from-violet-500/10 to-[#0D9E8E]/10 border border-violet-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">AI Interpretation</h3>
            </div>
            {interpLoading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Generating interpretation...
              </div>
            ) : (
              <p className="text-sm text-slate-200 leading-relaxed">{interpretation}</p>
            )}
          </div>

          <AlphaFoldAttribution />
        </>
      )}
    </div>
  );
}