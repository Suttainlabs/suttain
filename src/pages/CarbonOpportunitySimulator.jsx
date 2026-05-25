import React, { useState, useContext } from 'react';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { base44 } from '@/api/base44Client';
import { Leaf, Loader2, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CarbonOpportunitySimulator() {
  const { user } = useContext(AuthContext);
  const [volume, setVolume] = useState('10000');
  const [ingredients, setIngredients] = useState('Sodium Lauryl Sulfate, Palm Oil, Mineral Oil');
  const [packaging, setPackaging] = useState('plastic');
  const [energy, setEnergy] = useState('grid');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) return (
    <div className="min-h-screen bg-[#F0FAF5] flex items-center justify-center p-6">
      <AuthGate featureName="Carbon Opportunity Simulator" featureDescription="Sign in to model your sustainability ROI." />
    </div>
  );

  const simulate = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Calculate carbon footprint and decarbonization opportunities for:
- Monthly production: ${volume} units
- Key ingredients: ${ingredients}
- Packaging: ${packaging}
- Energy source: ${energy}

Provide:
1. Current carbon footprint (kg CO2e per unit and per year)
2. Top 3 reduction opportunities ranked by impact-to-cost ratio, each with: action, reduction_low (%), reduction_high (%), cost_saving_1yr (USD), cost_saving_5yr (USD)
3. ROI summary

Show ranges not single figures.`,
        response_json_schema: {
          type: 'object',
          properties: {
            current_footprint_per_unit: { type: 'number' },
            current_footprint_annual: { type: 'number' },
            opportunities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  reduction_low: { type: 'number' },
                  reduction_high: { type: 'number' },
                  cost_saving_1yr: { type: 'number' },
                  cost_saving_5yr: { type: 'number' },
                  difficulty: { type: 'string' },
                }
              }
            },
            summary: { type: 'string' },
          }
        }
      });
      setResults(res);
    } catch { alert('Simulation failed. Please try again.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F0FAF5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Carbon Opportunity Simulator</h1>
          <p className="text-slate-500 mt-1">Model the ROI of sustainability investments before committing budget.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Monthly Production Volume (units)</label>
              <input type="number" value={volume} onChange={e => setVolume(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#02988C] outline-none" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Packaging Type</label>
              <select value={packaging} onChange={e => setPackaging(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#02988C] outline-none bg-white">
                <option value="plastic">Plastic</option>
                <option value="glass">Glass</option>
                <option value="recycled_plastic">Recycled Plastic</option>
                <option value="biodegradable">Biodegradable</option>
                <option value="aluminium">Aluminium</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Energy Source</label>
              <select value={energy} onChange={e => setEnergy(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#02988C] outline-none bg-white">
                <option value="grid">Grid (average mix)</option>
                <option value="renewables">100% Renewables</option>
                <option value="gas">Natural Gas</option>
                <option value="solar">Solar</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Key Ingredients</label>
              <input value={ingredients} onChange={e => setIngredients(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#02988C] outline-none" placeholder="e.g. Palm Oil, SLS, Glycerin" />
            </div>
          </div>
          <button onClick={simulate} disabled={loading} className={cn('flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all', !loading ? 'bg-[#02988C] text-white hover:bg-[#027d72]' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculating...</> : <><Leaf className="w-4 h-4" /> Run Simulation</>}
          </button>
        </div>

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                <p className="text-xs text-slate-400 mb-1">CO2e per unit</p>
                <p className="text-2xl font-bold text-slate-900">{results.current_footprint_per_unit?.toFixed(2)} kg</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                <p className="text-xs text-slate-400 mb-1">Annual CO2e</p>
                <p className="text-2xl font-bold text-slate-900">{(results.current_footprint_annual || 0).toLocaleString()} kg</p>
              </div>
            </div>

            <h2 className="text-base font-bold text-slate-900">Decarbonization Roadmap</h2>
            <p className="text-xs text-slate-400">Ranked by impact-to-cost ratio. Ranges reflect real-world data uncertainty.</p>

            {results.opportunities?.map((opp, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#02988C]/10 text-[#02988C] flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">{opp.action}</p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                        <TrendingDown className="w-3.5 h-3.5" />{opp.reduction_low}–{opp.reduction_high}% reduction
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                        <DollarSign className="w-3.5 h-3.5" />${(opp.cost_saving_1yr || 0).toLocaleString()} savings/yr
                      </div>
                      <div className="text-xs text-slate-400">${(opp.cost_saving_5yr || 0).toLocaleString()} over 5 years</div>
                    </div>
                    {opp.difficulty && <span className={cn('inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium', opp.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : opp.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>{opp.difficulty}</span>}
                  </div>
                </div>
              </div>
            ))}

            {results.summary && <p className="text-xs text-slate-500 leading-relaxed bg-white rounded-xl border border-slate-100 p-4">{results.summary}</p>}
          </div>
        )}
      </div>
    </div>
  );
}