import React, { useState } from 'react';
import { Search, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { proteinStructureIntelligence } from '@/functions/proteinStructureIntelligence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import AlphaFoldAttribution from './AlphaFoldAttribution';

const BINDING_COLORS = {
  Confirmed: { bg: '#dc262620', text: '#dc2626' },
  Probable: { bg: '#ea580c20', text: '#ea580c' },
  Possible: { bg: '#f59e0b20', text: '#f59e0b' },
  Unlikely: { bg: '#0d9e8e20', text: '#0d9e8e' },
  None: { bg: '#16a34a20', text: '#16a34a' },
};

const RISK_COLORS = {
  Safe: '#16a34a', Low: '#0d9e8e', Moderate: '#f59e0b', High: '#ea580c', Critical: '#dc2626',
};

function plddtDot(score) {
  if (score > 90) return '#2563eb';
  if (score >= 70) return '#0d9e8e';
  if (score >= 50) return '#f59e0b';
  return '#dc2626';
}

const POP_STATUS = {
  Safe: { color: '#16a34a', icon: ShieldCheck },
  Caution: { color: '#f59e0b', icon: AlertTriangle },
  Avoid: { color: '#dc2626', icon: AlertTriangle },
};

export default function ChemicalBindingScanner() {
  const [chemical, setChemical] = useState('');
  const [context, setContext] = useState('general');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!chemical.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data: res } = await proteinStructureIntelligence({ chemical: chemical.trim(), context });
      if (res?.error) throw new Error(res.error);
      setResult(res);
    } catch (e) {
      setError(e.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Enter ingredient or chemical name (e.g. methylparaben, BPA, triclosan)</label>
          <Input
            value={chemical}
            onChange={e => setChemical(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            placeholder="methylparaben"
            className="bg-slate-50 border-slate-200 text-slate-900"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Context</label>
          <Select value={context} onValueChange={setContext}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="food">Food Ingredient</SelectItem>
              <SelectItem value="cosmetic">Cosmetic</SelectItem>
              <SelectItem value="cleaning">Cleaning Product</SelectItem>
              <SelectItem value="industrial">Industrial Chemical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAnalyze} disabled={loading} className="bg-[#0D9E8E] hover:bg-[#0b8a7d] text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Search className="w-4 h-4 mr-1.5" />}
          Analyze Protein Interactions
        </Button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      {result && (
        <>
          {/* Overview row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Overall Risk Score</p>
              <p className="text-3xl font-black" style={{ color: RISK_COLORS[result.risk_level] || '#94a3b8' }}>
                {result.overall_protein_risk_score}
              </p>
              <p className="text-[10px] text-slate-500">out of 100</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Risk Level</p>
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                style={{ backgroundColor: (RISK_COLORS[result.risk_level] || '#94a3b8') + '20', color: RISK_COLORS[result.risk_level] || '#94a3b8' }}
              >
                {result.risk_level}
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Chemical Class</p>
              <p className="text-sm font-semibold text-slate-900">{result.chemical_class}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Proteins Queried</p>
              <p className="text-3xl font-black text-slate-900">{result.proteins_queried}</p>
            </div>
          </div>

          {/* Protein interaction table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Protein Interaction Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-3">Gene</th>
                    <th className="py-2 pr-3">Protein Name</th>
                    <th className="py-2 pr-3">Binding Prob.</th>
                    <th className="py-2 pr-3">Interaction</th>
                    <th className="py-2 pr-3">Consequence</th>
                    <th className="py-2 pr-3">Evidence</th>
                    <th className="py-2 pr-3">AF Conf.</th>
                    <th className="py-2 pr-3">Reg. Concern</th>
                  </tr>
                </thead>
                <tbody>
                  {result.protein_interactions?.map((p, i) => {
                    const bc = BINDING_COLORS[p.binding_probability] || BINDING_COLORS.None;
                    return (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-2.5 pr-3 font-mono font-semibold text-[#0D9E8E]">{p.gene}</td>
                        <td className="py-2.5 pr-3 text-slate-700">{p.protein_name}</td>
                        <td className="py-2.5 pr-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: bc.bg, color: bc.text }}>
                            {p.binding_probability}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-slate-600">{p.interaction_type}</td>
                        <td className="py-2.5 pr-3 text-slate-600 max-w-[200px]">{p.biological_consequence}</td>
                        <td className="py-2.5 pr-3 text-slate-600">{p.evidence_strength}</td>
                        <td className="py-2.5 pr-3">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: plddtDot(p.alphafold_confidence) }} />
                            <span className="font-mono text-slate-700">{p.alphafold_confidence}</span>
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-slate-600">{p.regulatory_concern}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Endocrine */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h4 className="text-xs font-bold text-slate-900 mb-3">Endocrine Disruption Risk</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${result.endocrine_disruption?.is_potential_disruptor ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <span className="text-xs text-slate-700">{result.endocrine_disruption?.is_potential_disruptor ? 'Potential disruptor' : 'No disruption risk'}</span>
                </div>
                <p className="text-xs text-slate-600">Risk score: <span className="font-mono text-slate-900">{result.endocrine_disruption?.risk_score}/100</span></p>
                {result.endocrine_disruption?.affected_hormones?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.endocrine_disruption.affected_hormones.map(h => (
                      <span key={h} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700/50 text-slate-700">{h}</span>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-slate-500 leading-snug">{result.endocrine_disruption?.mechanism}</p>
              </div>
            </div>

            {/* Carcinogenicity */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h4 className="text-xs font-bold text-slate-900 mb-3">Carcinogenicity Risk</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${result.carcinogenicity?.is_potential_carcinogen ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <span className="text-xs text-slate-700">{result.carcinogenicity?.is_potential_carcinogen ? 'Potential carcinogen' : 'No carcinogenicity risk'}</span>
                </div>
                <p className="text-xs text-slate-600">Risk score: <span className="font-mono text-slate-900">{result.carcinogenicity?.risk_score}/100</span></p>
                <p className="text-[11px] text-slate-500 leading-snug">{result.carcinogenicity?.mechanism}</p>
              </div>
            </div>

            {/* Metabolic */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h4 className="text-xs font-bold text-slate-900 mb-3">Metabolic Interaction</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${result.metabolic_interaction?.cyp_enzyme_inhibitor ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                  <span className="text-xs text-slate-700">{result.metabolic_interaction?.cyp_enzyme_inhibitor ? 'CYP enzyme inhibitor' : 'No CYP inhibition'}</span>
                </div>
                <p className="text-xs text-slate-600">Risk score: <span className="font-mono text-slate-900">{result.metabolic_interaction?.risk_score}/100</span></p>
                <p className="text-[11px] text-slate-500 leading-snug">{result.metabolic_interaction?.drug_interaction_concern}</p>
                <p className="text-[11px] text-slate-600 leading-snug">{result.metabolic_interaction?.explanation}</p>
              </div>
            </div>
          </div>

          {/* Population warnings */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Population Warnings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(result.population_protein_warnings || {}).map(([key, warn]) => {
                const cfg = POP_STATUS[warn.status] || POP_STATUS.Caution;
                const Icon = cfg.icon;
                const labels = { pregnancy: 'Pregnancy', children: 'Children', sensitive_skin: 'Sensitive Skin', hormone_conditions: 'Hormone Conditions' };
                return (
                  <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.color + '20' }}>
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900">{labels[key]}</p>
                      <p className="text-[11px] font-semibold mt-0.5" style={{ color: cfg.color }}>{warn.status}</p>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{warn.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <AlphaFoldAttribution />
        </>
      )}
    </div>
  );
}