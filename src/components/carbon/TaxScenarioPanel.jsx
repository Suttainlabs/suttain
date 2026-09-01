import React from 'react';
import { Globe, Info, ShieldAlert } from 'lucide-react';

const SCENARIO_COLOR = {
  Low: 'text-green-700 bg-green-50',
  Base: 'text-amber-700 bg-amber-50',
  High: 'text-red-700 bg-red-50',
};

export default function TaxScenarioPanel({ scenarios, annualCO2eTonnes }) {
  if (!scenarios?.length) return null;

  const totalLow = scenarios.reduce((s, r) => s + r.low, 0);
  const totalBase = scenarios.reduce((s, r) => s + r.base, 0);
  const totalHigh = scenarios.reduce((s, r) => s + r.high, 0);
  const totalCbam = scenarios.reduce((s, r) => s + r.cbam_exposure, 0);

  return (
    <div className="space-y-3">
      {/* Dark summary header */}
      <div className="bg-gradient-to-br from-[#00281E] to-slate-800 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-white/60" />
          <p className="text-sm font-semibold text-white/80">Total Annual Carbon Tax Exposure ({scenarios.length} {scenarios.length === 1 ? 'market' : 'markets'})</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Low', val: totalLow },
            { label: 'Base', val: totalBase },
            { label: 'High', val: totalHigh },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xs text-white/40 mb-1">{s.label}</p>
              <p className="text-lg font-bold">${s.val.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/40 mt-3">
          Based on {annualCO2eTonnes.toFixed(1)} tonnes CO2e/year. Sums across all selected markets.
        </p>
      </div>

      {/* CBAM informational banner */}
      {totalCbam > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            CBAM (Carbon Border Adjustment Mechanism) currently covers cement, iron and steel, aluminium, fertilisers, electricity, and hydrogen. For cosmetics and cleaning product manufacturers, CBAM does not directly apply yet (chemicals and plastics expected by end of decade). The CBAM figures below are forward-looking, showing potential future exposure if your sector is added.
          </p>
        </div>
      )}

      {/* Per-market cards */}
      {scenarios.map((r, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <p className="font-bold text-slate-800 text-sm">{r.name}</p>
              <p className="text-xs text-slate-400">{r.regulation_name}</p>
            </div>
            {r.cbam_exposure > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                CBAM ~${r.cbam_exposure.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {[
              { l: 'Low', v: r.low },
              { l: 'Base', v: r.base },
              { l: 'High', v: r.high },
            ].map((s) => (
              <div key={s.l} className={`rounded-lg p-2.5 text-center text-xs font-semibold ${SCENARIO_COLOR[s.l]}`}>
                <p className="font-normal opacity-70 mb-0.5">{s.l}</p>
                <p className="text-base font-bold">${s.v.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="font-normal opacity-60">/yr</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
            <span>Price band: ${r.price_low} to ${r.price_high}/tonne</span>
            {r.ets && <span className="px-1.5 py-0.5 bg-slate-100 rounded">ETS</span>}
          </div>
          {r.note && <p className="text-xs text-slate-400 leading-relaxed">{r.note}</p>}
        </div>
      ))}
    </div>
  );
}