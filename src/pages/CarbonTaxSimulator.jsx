import React, { useState, useContext, useCallback } from 'react';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { base44 } from '@/api/base44Client';
import { Leaf, Loader2, Plus, Globe, TrendingDown, Download, RefreshCw, ChevronRight, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import IngredientCarbonRow from '@/components/carbon/IngredientCarbonRow';
import CarbonSummaryPanel from '@/components/carbon/CarbonSummaryPanel';
import AlternativeCard from '@/components/carbon/AlternativeCard';
import TaxScenarioPanel from '@/components/carbon/TaxScenarioPanel';

// Default carbon intensity library (kg CO2e per kg ingredient)
const CARBON_LIBRARY = {
  'palm oil': 3.5, 'sodium lauryl sulfate': 2.8, 'mineral oil': 1.1,
  'glycerin': 1.6, 'ethanol': 1.3, 'water': 0.001, 'fragrance': 4.2,
  'parabens': 3.1, 'titanium dioxide': 5.7, 'dimethicone': 3.9,
  'petroleum jelly': 1.4, 'propylene glycol': 2.6, 'citric acid': 1.9,
  'sodium hydroxide': 0.9, 'hydrogen peroxide': 1.2,
};

const MARKETS = [
  { id: 'eu', name: 'EU', ets: true, cbam: true },
  { id: 'uk', name: 'UK', ets: true, cbam: false },
  { id: 'canada', name: 'Canada', ets: false, cbam: false },
  { id: 'usa_california', name: 'USA (CA)', ets: true, cbam: false },
  { id: 'australia', name: 'Australia', ets: false, cbam: false },
];

const TABS = ['Footprint', 'Tax Impact', 'Alternatives'];

let idCounter = 0;
const newIngredient = (name = '', quantity_kg = 1, carbon_intensity = 1) => ({
  id: ++idCounter,
  name,
  quantity_kg,
  carbon_intensity,
  category: '',
});

export default function CarbonTaxSimulator() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Footprint');
  const [ingredients, setIngredients] = useState([]);
  const [newName, setNewName] = useState('');
  const [unitsPerMonth, setUnitsPerMonth] = useState(10000);
  const [selectedMarkets, setSelectedMarkets] = useState(['eu']);
  const [carbonPrice, setCarbonPrice] = useState(65); // USD per tonne

  const [loadingAlts, setLoadingAlts] = useState(false);
  const [loadingTax, setLoadingTax] = useState(false);
  const [alternatives, setAlternatives] = useState(null);
  const [taxResults, setTaxResults] = useState(null);

  const [addLoading, setAddLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#EDF7F2' }}>
      <AuthGate featureName="Carbon Tax & Opportunity Simulator" featureDescription="Sign in to calculate real-time carbon footprints, forecast tax exposure, and find greener alternatives with ROI." />
    </div>
  );

  // Real-time calculations
  const totalCO2e = ingredients.reduce((sum, ing) => sum + (ing.quantity_kg * ing.carbon_intensity), 0);
  const annualCO2e = totalCO2e * 12 * (unitsPerMonth / 1000); // scaled
  const taxExposure = Math.round((annualCO2e / 1000) * carbonPrice);

  const addIngredient = async () => {
    if (!newName.trim()) return;
    const lower = newName.toLowerCase().trim();
    const knownIntensity = CARBON_LIBRARY[lower];

    if (knownIntensity) {
      setIngredients(prev => [...prev, newIngredient(newName.trim(), 1, knownIntensity)]);
      setNewName('');
      return;
    }

    // Use AI to estimate carbon intensity for unknown ingredients
    setAddLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Estimate the carbon intensity (kg CO2e per kg of ingredient) for "${newName}" used in cosmetic/cleaning product formulation. Consider production, transport, and processing. Provide a realistic single number based on life cycle assessment data.`,
        response_json_schema: {
          type: 'object',
          properties: {
            carbon_intensity: { type: 'number' },
            category: { type: 'string' },
            confidence: { type: 'string' },
          }
        }
      });
      setIngredients(prev => [...prev, newIngredient(newName.trim(), 1, res.carbon_intensity || 1)]);
    } catch {
      setIngredients(prev => [...prev, newIngredient(newName.trim(), 1, 1)]);
    }
    setAddLoading(false);
    setNewName('');
  };

  const removeIngredient = (id) => setIngredients(prev => prev.filter(i => i.id !== id));
  const updateQuantity = (id, qty) => setIngredients(prev => prev.map(i => i.id === id ? { ...i, quantity_kg: qty } : i));

  // Apply a suggested alternative: swap the ingredient in the formula and reset stale analysis
  const applyAlternative = (alt) => {
    setIngredients(prev => prev.map(i => {
      if (i.name.toLowerCase().trim() !== String(alt.replace_ingredient).toLowerCase().trim()) return i;
      const reduced = alt.carbon_reduction_pct > 0
        ? Math.max(0.01, i.carbon_intensity * (1 - alt.carbon_reduction_pct / 100))
        : i.carbon_intensity;
      return { ...i, name: alt.alternative_ingredient, carbon_intensity: +reduced.toFixed(2) };
    }));
    setAlternatives(null);
    setTaxResults(null);
    setActiveTab('Footprint');
  };
  const toggleMarket = (id) => setSelectedMarkets(prev => prev.includes(id) ? prev.filter(m => m !== id) : prev.length < 5 ? [...prev, id] : prev);

  const runTaxSimulation = async () => {
    setLoadingTax(true);
    try {
      const ingredientList = ingredients.map(i => `${i.name} (${i.quantity_kg}kg, ${i.carbon_intensity} kg CO2e/kg)`).join(', ');
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Carbon tax exposure analysis for a product manufacturer.
Monthly production: ${unitsPerMonth} units. Batch CO2e: ${totalCO2e.toFixed(1)} kg. Annual CO2e: ${(annualCO2e / 1000).toFixed(1)} tonnes.
Ingredients: ${ingredientList}.
Target markets: ${selectedMarkets.join(', ')}.
Carbon price assumption: $${carbonPrice}/tonne.

For each selected market, provide 3 annual cost scenarios (low/base/high carbon price) and CBAM exposure if EU is selected.`,
        response_json_schema: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  market: { type: 'string' },
                  low: { type: 'number' },
                  base: { type: 'number' },
                  high: { type: 'number' },
                  currency: { type: 'string' },
                  cbam_exposure: { type: 'number' },
                  note: { type: 'string' },
                }
              }
            },
            total_low: { type: 'number' },
            total_base: { type: 'number' },
            total_high: { type: 'number' },
          }
        }
      });
      setTaxResults(res);
      setActiveTab('Tax Impact');
    } catch { alert('Tax simulation failed. Please try again.'); }
    setLoadingTax(false);
  };

  const runAlternatives = async () => {
    setLoadingAlts(true);
    try {
      const highCarbonIngs = [...ingredients].sort((a, b) => (b.quantity_kg * b.carbon_intensity) - (a.quantity_kg * a.carbon_intensity)).slice(0, 5);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a green chemistry expert. Suggest greener ingredient alternatives that improve eco-score and carbon footprint.

Current high-impact ingredients:
${highCarbonIngs.map(i => `- ${i.name}: ${i.carbon_intensity} kg CO2e/kg, quantity ${i.quantity_kg}kg`).join('\n')}

For each, suggest the best greener alternative with:
- Specific alternative ingredient name
- Reason (why greener, what it replaces)
- Carbon reduction percentage
- Estimated annual cost saving at ${unitsPerMonth} units/month production
- Eco score gain (1-10 scale)
- Implementation difficulty (Easy/Medium/Hard)
- Any compliance or performance tradeoffs

Prioritise by ROI. Return top 5 alternatives.`,
        response_json_schema: {
          type: 'object',
          properties: {
            alternatives: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  replace_ingredient: { type: 'string' },
                  alternative_ingredient: { type: 'string' },
                  reason: { type: 'string' },
                  carbon_reduction_pct: { type: 'number' },
                  cost_saving_1yr: { type: 'number' },
                  cost_saving_5yr: { type: 'number' },
                  eco_score_gain: { type: 'number' },
                  difficulty: { type: 'string' },
                  tradeoffs: { type: 'string' },
                }
              }
            },
            total_potential_reduction_pct: { type: 'number' },
            summary: { type: 'string' },
          }
        }
      });
      setAlternatives(res);
      setActiveTab('Alternatives');
    } catch { alert('Alternatives analysis failed. Please try again.'); }
    setLoadingAlts(false);
  };

  const exportReport = () => {
    const lines = [
      'SUTTAIN — CARBON TAX & OPPORTUNITY REPORT',
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      '--- INGREDIENT FOOTPRINT ---',
      ...ingredients.map(i => `${i.name}: ${i.quantity_kg}kg × ${i.carbon_intensity} = ${(i.quantity_kg * i.carbon_intensity).toFixed(2)} kg CO2e`),
      `Total batch CO2e: ${totalCO2e.toFixed(2)} kg`,
      `Annual CO2e: ${(annualCO2e / 1000).toFixed(1)} tonnes`,
      `Estimated tax exposure: $${taxExposure}/yr at $${carbonPrice}/tonne`,
      '',
    ];
    if (taxResults) {
      lines.push('--- TAX SCENARIO ANALYSIS ---');
      taxResults.results?.forEach(r => {
        lines.push(`${r.market}: Low $${r.low} / Base $${r.base} / High $${r.high}`);
      });
      lines.push('');
    }
    if (alternatives) {
      lines.push('--- GREEN ALTERNATIVES ---');
      alternatives.alternatives?.forEach((a, i) => {
        lines.push(`${i + 1}. Replace ${a.replace_ingredient} with ${a.alternative_ingredient} — ${a.carbon_reduction_pct}% less CO2e, $${a.cost_saving_1yr}/yr savings`);
      });
      lines.push('');
      if (alternatives.summary) lines.push(alternatives.summary);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'suttain_carbon_report.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const anyLoading = loadingAlts || loadingTax || addLoading;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDF7F2' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Carbon Tax & Opportunity Simulator</h1>
            <p className="text-slate-500 mt-1">Build your ingredient list, calculate live carbon footprint, simulate tax exposure, and find greener alternatives with ROI.</p>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT — Ingredient Builder */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[#02988C]" /> Ingredients
              </h2>

              <div className="divide-y divide-slate-50">
                {ingredients.map(ing => (
                  <IngredientCarbonRow
                    key={ing.id}
                    ingredient={ing}
                    onRemove={removeIngredient}
                    onQuantityChange={updateQuantity}
                  />
                ))}
              </div>

              {/* Add ingredient */}
              <div className="mt-4 flex gap-2">
                <div className="flex-1 relative">
                  <input
                    value={newName}
                    onChange={e => {
                      const val = e.target.value;
                      setNewName(val);
                      if (val.trim().length >= 2) {
                        const lower = val.toLowerCase();
                        setSuggestions(Object.keys(CARBON_LIBRARY).filter(k => k.includes(lower)).slice(0, 6));
                      } else {
                        setSuggestions([]);
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { setSuggestions([]); addIngredient(); }
                      if (e.key === 'Escape') setSuggestions([]);
                    }}
                    onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                    placeholder="Add ingredient..."
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02988C]"
                    disabled={addLoading}
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                      {suggestions.map(s => (
                        <button
                          key={s}
                          onMouseDown={() => {
                            setNewName(s.replace(/\b\w/g, c => c.toUpperCase()));
                            setSuggestions([]);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-[#F0FAF5] hover:text-[#02988C] flex items-center justify-between group transition-colors"
                        >
                          <span className="capitalize">{s}</span>
                          <span className="text-xs text-slate-400 group-hover:text-[#02988C]">{CARBON_LIBRARY[s]} kg CO2e/kg</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { setSuggestions([]); addIngredient(); }}
                  disabled={addLoading || !newName.trim()}
                  className={cn('px-3 py-2 rounded-lg text-white flex items-center gap-1 text-sm font-semibold transition-all', newName.trim() && !addLoading ? 'bg-[#02988C] hover:bg-[#027d72]' : 'bg-slate-200 text-slate-400 cursor-not-allowed')}
                >
                  {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">Unknown ingredients are estimated via AI automatically.</p>
            </div>

            {/* Config */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h2 className="font-bold text-slate-800 mb-1">Configuration</h2>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Units per Month</label>
                <input
                  type="number" min="1"
                  value={unitsPerMonth}
                  onChange={e => setUnitsPerMonth(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#02988C]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Carbon Price ($/tonne)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="10" max="200" step="5"
                    value={carbonPrice}
                    onChange={e => setCarbonPrice(parseInt(e.target.value))}
                    className="flex-1 accent-[#02988C]"
                  />
                  <span className="text-sm font-bold text-slate-700 w-12 text-right">${carbonPrice}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">EU ETS ~$65 | UK ETS ~$55 | CA ~$45</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-2">Target Markets</label>
                <div className="flex flex-wrap gap-1.5">
                  {MARKETS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => toggleMarket(m.id)}
                      className={cn('px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all', selectedMarkets.includes(m.id) ? 'border-[#02988C] bg-[#F0FAF5] text-[#02988C]' : 'border-slate-200 text-slate-500 hover:border-[#02988C]/40')}
                    >
                      {m.name}
                      {m.cbam && <span className="ml-1 text-amber-500 text-[9px]">CBAM</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={runTaxSimulation}
                disabled={anyLoading || !ingredients.length || !selectedMarkets.length}
                className={cn('w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all', !anyLoading && ingredients.length && selectedMarkets.length ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}
              >
                {loadingTax ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                Simulate Tax Impact
              </button>
              <button
                onClick={runAlternatives}
                disabled={anyLoading || !ingredients.length}
                className={cn('w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all', !anyLoading && ingredients.length ? 'bg-[#02988C] text-white hover:bg-[#027d72]' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}
              >
                {loadingAlts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Leaf className="w-4 h-4" />}
                Find Greener Alternatives
              </button>
            </div>
          </div>

          {/* RIGHT — Results Panel */}
          <div className="lg:col-span-2 space-y-4">

            {/* Live Summary */}
            <CarbonSummaryPanel
              totalCO2e={totalCO2e}
              annualCO2e={annualCO2e}
              taxExposure={taxExposure}
              unitsPerMonth={unitsPerMonth}
            />

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex border-b border-slate-100">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn('flex-1 py-3 text-sm font-semibold transition-colors', activeTab === tab ? 'text-[#02988C] border-b-2 border-[#02988C] bg-[#F0FAF5]' : 'text-slate-500 hover:text-slate-700')}
                  >
                    {tab}
                    {tab === 'Tax Impact' && taxResults && <span className="ml-1.5 w-2 h-2 bg-amber-400 rounded-full inline-block" />}
                    {tab === 'Alternatives' && alternatives && <span className="ml-1.5 w-2 h-2 bg-green-400 rounded-full inline-block" />}
                  </button>
                ))}
              </div>

              <div className="p-5">

                {activeTab === 'Footprint' && (
                  <div>
                    <h3 className="font-bold text-slate-800 mb-3 text-sm">Ingredient Carbon Breakdown</h3>
                    {ingredients.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">Add ingredients on the left to see their carbon footprint.</p>
                    ) : (
                      <div className="space-y-2">
                        {[...ingredients]
                          .sort((a, b) => (b.quantity_kg * b.carbon_intensity) - (a.quantity_kg * a.carbon_intensity))
                          .map(ing => {
                            const contribution = totalCO2e > 0 ? ((ing.quantity_kg * ing.carbon_intensity) / totalCO2e * 100) : 0;
                            return (
                              <div key={ing.id} className="flex items-center gap-3">
                                <span className="text-xs text-slate-600 w-32 truncate">{ing.name}</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${contribution}%`,
                                      background: contribution > 30 ? '#ef4444' : contribution > 15 ? '#f59e0b' : '#02988C'
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-slate-600 w-12 text-right">{contribution.toFixed(1)}%</span>
                                <span className="text-xs text-slate-400 w-20 text-right">{(ing.quantity_kg * ing.carbon_intensity).toFixed(2)} kg CO2e</span>
                              </div>
                            );
                          })}
                        <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-800">
                          <span>Total</span>
                          <span>{totalCO2e.toFixed(2)} kg CO2e per batch</span>
                        </div>
                      </div>
                    )}

                    {ingredients.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-xs text-blue-700 leading-relaxed">
                          At {unitsPerMonth.toLocaleString()} units/month, your estimated annual carbon exposure is <strong>{(annualCO2e / 1000).toFixed(1)} tonnes CO2e</strong> — equivalent to a carbon tax liability of <strong>${taxExposure.toLocaleString()}/yr</strong> at ${carbonPrice}/tonne. Run the Tax Impact simulation to see market-by-market breakdown.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Tax Impact' && (
                  <div>
                    {taxResults ? (
                      <TaxScenarioPanel taxResults={taxResults} />
                    ) : (
                      <div className="text-center py-10">
                        <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-400 mb-3">Select your target markets and click "Simulate Tax Impact" to see your carbon tax exposure across low, base, and high price scenarios.</p>
                        <button onClick={runTaxSimulation} disabled={anyLoading || !selectedMarkets.length} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50">
                          {loadingTax ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                          Run Now
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-4">Estimates are ranges based on current carbon pricing data. Actual exposure depends on product classification and real-time prices.</p>
                  </div>
                )}

                {activeTab === 'Alternatives' && (
                  <div>
                    {alternatives ? (
                      <div className="space-y-4">
                        {alternatives.total_potential_reduction_pct > 0 && (
                          <div className="bg-[#F0FAF5] border border-[#02988C]/20 rounded-xl p-4 flex items-center gap-3">
                            <TrendingDown className="w-6 h-6 text-[#02988C] flex-shrink-0" />
                            <div>
                              <p className="font-bold text-[#02988C] text-sm">Up to {alternatives.total_potential_reduction_pct}% CO2e reduction possible</p>
                              <p className="text-xs text-slate-500 mt-0.5">{alternatives.summary}</p>
                            </div>
                          </div>
                        )}
                        {alternatives.alternatives?.map((alt, i) => (
                          <AlternativeCard key={i} alt={alt} index={i} onSwap={() => applyAlternative(alt)} />
                        ))}
                        <button
                          onClick={runAlternatives}
                          disabled={loadingAlts}
                          className="flex items-center gap-2 text-xs text-[#02988C] font-semibold hover:underline"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Refresh Suggestions
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Leaf className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-400 mb-3">Click "Find Greener Alternatives" to get AI-ranked ingredient substitutions that reduce CO2e and maximise ROI.</p>
                        <button onClick={runAlternatives} disabled={anyLoading || !ingredients.length} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#02988C] text-white rounded-xl text-sm font-semibold hover:bg-[#027d72] transition-colors disabled:opacity-50">
                          {loadingAlts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Leaf className="w-4 h-4" />}
                          Find Alternatives
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}