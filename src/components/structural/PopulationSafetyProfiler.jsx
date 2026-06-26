import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertTriangle, ShieldCheck, Lightbulb, Quote } from 'lucide-react';
import { proteinStructureIntelligence } from '@/functions/proteinStructureIntelligence';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AlphaFoldAttribution from './AlphaFoldAttribution';

const POP_STATUS = {
  Safe: { color: '#16a34a', icon: ShieldCheck },
  Caution: { color: '#f59e0b', icon: AlertTriangle },
  Avoid: { color: '#dc2626', icon: AlertTriangle },
};

const LIFE_LABELS = {
  adult: 'adult', pregnant: 'pregnant', nursing: 'nursing', child: 'child', adolescent: 'adolescent', elderly: 'elderly',
};

export default function PopulationSafetyProfiler() {
  const [chemical, setChemical] = useState('');
  const [healthProfile, setHealthProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.entities.UserHealthProfile.list()
      .then(data => setHealthProfile(data?.[0] || null))
      .catch(() => setHealthProfile(null))
      .finally(() => setProfileLoading(false));
  }, []);

  const handleAnalyze = async () => {
    if (!chemical.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data: res } = await proteinStructureIntelligence({ chemical: chemical.trim(), context: 'general' });
      if (res?.error) throw new Error(res.error);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const profileSummary = healthProfile
    ? `a ${LIFE_LABELS[healthProfile.life_stage] || 'adult'} individual${healthProfile.health_conditions?.length ? ` with ${healthProfile.health_conditions.join(', ')}` : ''}${healthProfile.allergies?.length ? `${healthProfile.health_conditions?.length ? ' and' : ' with'} allergies to ${healthProfile.allergies.join(', ')}` : ''}`
    : 'an individual (no health profile saved)';

  // Map user profile to relevant population warnings
  const relevantWarnings = [];
  if (result?.population_protein_warnings) {
    const pw = result.population_protein_warnings;
    if (healthProfile?.life_stage === 'pregnant' || healthProfile?.life_stage === 'nursing') relevantWarnings.push({ key: 'pregnancy', ...pw.pregnancy });
    if (healthProfile?.life_stage === 'child' || healthProfile?.life_stage === 'adolescent') relevantWarnings.push({ key: 'children', ...pw.children });
    if (healthProfile?.health_conditions?.some(c => /skin|dermat|eczema|psoriasis/i.test(c)) || healthProfile?.sensitivity_preferences?.some(s => /skin|fragrance/i.test(s))) relevantWarnings.push({ key: 'sensitive_skin', ...pw.sensitive_skin });
    if (healthProfile?.health_conditions?.some(c => /hormone|endocrine|thyroid|pcos/i.test(c))) relevantWarnings.push({ key: 'hormone_conditions', ...pw.hormone_conditions });
    // If none matched, show all
    if (relevantWarnings.length === 0) {
      Object.entries(pw).forEach(([key, val]) => relevantWarnings.push({ key, ...val }));
    }
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Ingredient name</label>
          <Input
            value={chemical}
            onChange={e => setChemical(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            placeholder="e.g. methylparaben, BPA, triclosan"
            className="bg-slate-900/50 border-slate-700 text-white"
          />
        </div>
        {/* Health profile summary */}
        <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-700/30">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Your Health Profile</p>
          {profileLoading ? (
            <p className="text-xs text-slate-500">Loading...</p>
          ) : healthProfile ? (
            <p className="text-xs text-slate-300">
              {LIFE_LABELS[healthProfile.life_stage] || 'Adult'}
              {healthProfile.health_conditions?.length > 0 && ` · ${healthProfile.health_conditions.join(', ')}`}
              {healthProfile.allergies?.length > 0 && ` · Allergies: ${healthProfile.allergies.join(', ')}`}
              {healthProfile.medications?.length > 0 && ` · Meds: ${healthProfile.medications.join(', ')}`}
            </p>
          ) : (
            <p className="text-xs text-slate-500">No health profile saved. Add one in your Profile settings for personalized warnings.</p>
          )}
        </div>
        <Button onClick={handleAnalyze} disabled={loading} className="bg-[#0D9E8E] hover:bg-[#0b8a7d] text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Search className="w-4 h-4 mr-1.5" />}
          Analyze Personalized Risk
        </Button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {result && (
        <>
          {/* Personalized header */}
          <div className="bg-gradient-to-r from-violet-500/10 to-[#0D9E8E]/10 border border-violet-500/30 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-1">Personalized Risk Assessment</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on your health profile as {profileSummary}, here is the protein-binding risk analysis for <span className="font-semibold text-white">{result.chemical}</span>.
            </p>
          </div>

          {/* Priority warnings */}
          {relevantWarnings.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Priority Warnings for Your Profile</h3>
              <div className="space-y-3">
                {relevantWarnings.map(w => {
                  const cfg = POP_STATUS[w.status] || POP_STATUS.Caution;
                  const Icon = cfg.icon;
                  const labels = { pregnancy: 'Pregnancy', children: 'Children', sensitive_skin: 'Sensitive Skin', hormone_conditions: 'Hormone Conditions' };
                  return (
                    <div key={w.key} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-700/30">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.color + '20' }}>
                        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white">{labels[w.key]}</p>
                        <p className="text-[11px] font-semibold mt-0.5" style={{ color: cfg.color }}>{w.status}</p>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{w.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Safer alternatives */}
          {result.safer_alternatives?.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-[#0D9E8E]" />
                <h3 className="text-sm font-bold text-white">Safer Alternatives</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.safer_alternatives.map((alt, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-[#0D9E8E]/10 border border-[#0D9E8E]/30 text-[#0D9E8E] text-xs font-semibold">
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AlphaFold insight quote */}
          {result.alphafold_insight && (
            <div className="bg-slate-800/40 border-l-4 border-[#0D9E8E] rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Quote className="w-5 h-5 text-[#0D9E8E] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">AlphaFold Structural Insight</p>
                  <p className="text-sm text-slate-200 leading-relaxed italic">"{result.alphafold_insight}"</p>
                </div>
              </div>
            </div>
          )}

          <AlphaFoldAttribution />
        </>
      )}
    </div>
  );
}