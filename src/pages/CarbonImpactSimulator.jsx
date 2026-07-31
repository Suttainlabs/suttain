import React, { useState, useContext } from 'react';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { base44 } from '@/api/base44Client';
import { Leaf, Loader2, Globe, TrendingDown, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import CarbonSummaryPanel from '@/components/carbon/CarbonSummaryPanel';
import AlternativeCard from '@/components/carbon/AlternativeCard';
import TaxScenarioPanel from '@/components/carbon/TaxScenarioPanel';
import CarbonIngredientBuilder from '@/components/carbon/CarbonIngredientBuilder';
import FootprintBreakdown from '@/components/carbon/FootprintBreakdown';
import { CARBON_LIBRARY, newIngredient } from '@/components/carbon/carbonData';

const TABS = ['Tax scenario', 'Opportunity scenario'];

export default function CarbonImpactSimulator() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Tax scenario');
  const [ingredients, setIngredients] = useState([]);
  const [unitsPerMonth, setUnitsPerMonth] = useState(10000);
  const [selectedMarkets, setSelectedMarkets] = useState(['eu']);
  const [carbonPrice, setCarbonPrice] = useState(65);

  const [loadingAlts, setLoadingAlts] = useState(false);
  const [loadingTax, setLoadingTax] = useState(false);
  const [alternatives, setAlternatives] = useState(null);
  const [taxResults, setTaxResults] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#EDF7F2' }}>
      <AuthGate featureName="Carbon Impact Simulator" featureDescription="Sign in to calculate real-time carbon footprints, forecast tax exposure, and find greener alternatives with ROI." />
    </div>
  );

  // Real-time calculations
  const totalCO2e = ingredients.reduce((sum, ing) => sum + (ing.quantity_kg * ing.carbon_intensity), 0);
  const annualCO2e = totalCO2e * 12 * (unitsPerMonth / 1000);
  const taxExposure = Math.round((annualCO2e / 1000) * carbonPrice);

  const addIngredient = async (name) => {
    const knownIntensity = CARBON_LIBRARY[name.toLowerCase()];
    if (knownIntensity) {
      setIngredients(prev => [...prev, newIngredient(name, 1, knownIntensity)]);
      return;
    }
    setAddLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Estimate the carbon intensity (kg CO2e per kg of ingredient) for "${name}" used in cosmetic/cleaning product formulation. Consider production, transport, and processing. Provide a realistic single number based on life cycle assessment data.`,
        response_json_schema: {
          type: 'object',
          properties: {
            carbon_intensity: { type: 'number' },
            category: { type: 'string' },
            confidence: { type: 'string' },
          }
        }
      });
      setIngredients(prev => [...prev, newIngredient(name, 1, res.carbon_intensity || 1)]);
    } catch {
      setIngredients(prev => [...prev, newIngredient(name, 1, 1)]);
    }
    setAddLoading(false);
  };

  const removeIngredient = (id) => setIngredients(prev => prev.filter(i => i.id !== id));
  const updateQuantity = (id, qty) => setIngredients(prev => prev.map(i => i.id === id ? { ...i, quantity_kg: qty } : i));
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
      setActiveTab('Tax scenario');
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
      setActiveTab('Opportunity scenario');
    } catch { alert('Alternatives analysis failed. Please try again.'); }
    setLoadingAlts(false);
  };

  const exportReport = () => {
    const lines = [
      'SUTTAIN — CARBON IMPACT REPORT',
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
      lines.push('--- OPPORTUNITY SCENARIO (GREEN ALTERNATIVES) ---');
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

        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Carbon Impact Simulator</h1>
            <p className="text-slate-600 mt-1">Build your ingredient list, calculate live carbon footprint, simulate tax exposure, and find greener alternatives with ROI.</p>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          <div className="lg:col-span-1 space-y-4">
            <CarbonIngredientBuilder
              ingredients={ingredients}
              onAdd={addIngredient}
              onRemove={removeIngredient}
              onQuantityChange={updateQuantity}
              addLoading={addLoading}
              unitsPerMonth={unitsPerMonth}
              setUnitsPerMonth={setUnitsPerMonth}
              carbonPrice={carbonPrice}
              setCarbonPrice={setCarbonPrice}
              selectedMarkets={selectedMarkets}
              toggleMarket={toggleMarket}
            />

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

          <div className="lg:col-span-2 space-y-4">
            <CarbonSummaryPanel
              totalCO2e={totalCO2e}
              annualCO2e={annualCO2e}
              taxExposure={taxExposure}
              unitsPerMonth={unitsPerMonth}
            />

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex border-b border-slate-100">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn('flex-1 py-3 text-sm font-semibold transition-colors', activeTab === tab ? 'text-[#02988C] border-b-2 border-[#02988C] bg-[#F0FAF5]' : 'text-slate-600 hover:text-slate-800')}
                  >
                    {tab}
                    {tab === 'Tax scenario' && taxResults && <span className="ml-1.5 w-2 h-2 bg-amber-400 rounded-full inline-block" />}
                    {tab === 'Opportunity scenario' && alternatives && <span className="ml-1.5 w-2 h-2 bg-green-400 rounded-full inline-block" />}
                  </button>
                ))}
              </div>

              <div className="p-5">

                {activeTab === 'Tax scenario' && (
                  <div className="space-y-6">
                    <FootprintBreakdown
                      ingredients={ingredients}
                      totalCO2e={totalCO2e}
                      annualCO2e={annualCO2e}
                      taxExposure={taxExposure}
                      unitsPerMonth={unitsPerMonth}
                      carbonPrice={carbonPrice}
                    />

                    {taxResults ? (
                      <div className="pt-2 border-t border-slate-100">
                        <TaxScenarioPanel taxResults={taxResults} />
                      </div>
                    ) : (
                      <div className="text-center py-10 border-t border-slate-100">
                        <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-600 mb-3">Select your target markets and click "Simulate Tax Impact" to see your carbon tax exposure across low, base, and high price scenarios.</p>
                        <button onClick={runTaxSimulation} disabled={anyLoading || !selectedMarkets.length || !ingredients.length} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50">
                          {loadingTax ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                          Run Now
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-slate-500">Estimates are ranges based on current carbon pricing data. Actual exposure depends on product classification and real-time prices.</p>
                  </div>
                )}

                {activeTab === 'Opportunity scenario' && (
                  <div>
                    {alternatives ? (
                      <div className="space-y-4">
                        {alternatives.total_potential_reduction_pct > 0 && (
                          <div className="bg-[#F0FAF5] border border-[#02988C]/20 rounded-xl p-4 flex items-center gap-3">
                            <TrendingDown className="w-6 h-6 text-[#02988C] flex-shrink-0" />
                            <div>
                              <p className="font-bold text-[#02988C] text-sm">Up to {alternatives.total_potential_reduction_pct}% CO2e reduction possible</p>
                              <p className="text-xs text-slate-600 mt-0.5">{alternatives.summary}</p>
                            </div>
                          </div>
                        )}
                        {alternatives.alternatives?.map((alt, i) => (
                          <AlternativeCard key={i} alt={alt} index={i} />
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
                        <p className="text-sm text-slate-600 mb-3">Click "Find Greener Alternatives" to get AI-ranked ingredient substitutions that reduce CO2e and maximise ROI.</p>
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