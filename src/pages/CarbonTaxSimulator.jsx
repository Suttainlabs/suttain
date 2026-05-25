import React, { useState, useContext } from 'react';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { base44 } from '@/api/base44Client';
import { Globe, Loader2, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const MARKETS = [
  { id: 'eu', name: 'European Union', flag: '🇪🇺', ets: true, cbam: true },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', ets: true, cbam: false },
  { id: 'canada', name: 'Canada', flag: '🇨🇦', ets: false, cbam: false },
  { id: 'usa_california', name: 'USA (California)', flag: '🇺🇸', ets: true, cbam: false },
  { id: 'australia', name: 'Australia', flag: '🇦🇺', ets: false, cbam: false },
];

export default function CarbonTaxSimulator() {
  const { user } = useContext(AuthContext);
  const [selectedMarkets, setSelectedMarkets] = useState(['eu']);
  const [volume, setVolume] = useState('10000');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) return (
    <div className="min-h-screen bg-[#F0FAF5] flex items-center justify-center p-6">
      <AuthGate featureName="Carbon Tax Simulator" featureDescription="Sign in to forecast carbon tax exposure." />
    </div>
  );

  const toggleMarket = (id) => setSelectedMarkets(prev => prev.includes(id) ? prev.filter(m => m !== id) : prev.length < 5 ? [...prev, id] : prev);

  const simulate = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Estimate carbon tax exposure for a cleaning/cosmetic product manufacturer.
Production volume: ${volume} units/month.
Target markets: ${selectedMarkets.join(', ')}.

For each market provide 3 scenarios (low/base/high) as annual EUR/USD cost estimates.
Also provide CBAM exposure if applicable (EU market).
Return realistic ranges based on current carbon pricing.`,
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
      setResults(res);
    } catch { alert('Simulation failed. Please try again.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F0FAF5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Carbon Tax Simulator</h1>
          <p className="text-slate-500 mt-1">Forecast carbon pricing exposure across global markets before you expand.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Monthly Production Volume (units)</label>
            <input type="number" value={volume} onChange={e => setVolume(e.target.value)} className="w-full max-w-xs px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#02988C] outline-none font-semibold text-slate-800" placeholder="10000" />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Target Markets (max 5)</label>
            <div className="flex flex-wrap gap-2">
              {MARKETS.map(m => (
                <button key={m.id} onClick={() => toggleMarket(m.id)} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all', selectedMarkets.includes(m.id) ? 'border-[#02988C] bg-[#F0FAF5] text-[#02988C]' : 'border-slate-200 text-slate-600 hover:border-[#02988C]/40')}>
                  {m.flag} {m.name}
                  {m.ets && <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">ETS</span>}
                  {m.cbam && <span className="text-xs bg-amber-100 text-amber-700 px-1 rounded">CBAM</span>}
                </button>
              ))}
            </div>
          </div>
          <button onClick={simulate} disabled={loading || selectedMarkets.length === 0} className={cn('flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all', selectedMarkets.length > 0 && !loading ? 'bg-[#02988C] text-white hover:bg-[#027d72]' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculating...</> : <><Globe className="w-4 h-4" /> Run Simulation</>}
          </button>
        </div>

        {results && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-gradient-to-br from-[#00281E] to-slate-800 rounded-xl p-6 text-white">
              <p className="text-sm text-white/60 mb-1">Total Annual Carbon Exposure Estimate</p>
              <p className="text-xs text-white/40 mb-3">3-scenario range — low / base / high carbon price projections</p>
              <div className="grid grid-cols-3 gap-4">
                {[{ label: 'Low', val: results.total_low, icon: TrendingDown }, { label: 'Base', val: results.total_base, icon: null }, { label: 'High', val: results.total_high, icon: TrendingUp }].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-xs text-white/50 mb-1">{s.label}</p>
                    <p className="text-xl font-bold">${(s.val || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-market breakdown */}
            <div className="space-y-3">
              {results.results?.map((r, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-slate-800">{r.market}</p>
                    <span className="text-xs text-slate-400 font-medium">{r.currency || 'USD'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[{ l: 'Low', v: r.low }, { l: 'Base', v: r.base }, { l: 'High', v: r.high }].map(s => (
                      <div key={s.l} className="bg-[#F0FAF5] rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400">{s.l}</p>
                        <p className="text-base font-bold text-slate-800">${(s.v || 0).toLocaleString()}/yr</p>
                      </div>
                    ))}
                  </div>
                  {r.cbam_exposure > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                      CBAM Exposure: ~${r.cbam_exposure.toLocaleString()}/yr
                    </div>
                  )}
                  {r.note && <p className="text-xs text-slate-400 mt-2">{r.note}</p>}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 text-center">Estimates shown as ranges. Actual exposure depends on precise product classification, production mix, and real-time carbon prices.</p>

            <button onClick={() => {
              const text = JSON.stringify(results, null, 2);
              const blob = new Blob([text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'carbon_exposure_brief.txt'; a.click();
            }} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" /> Export Brief
            </button>
          </div>
        )}
      </div>
    </div>
  );
}