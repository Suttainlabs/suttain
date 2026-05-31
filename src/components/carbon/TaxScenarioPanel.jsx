import React from 'react';
import { Globe } from 'lucide-react';

const SCENARIO_COLOR = {
  Low: 'text-green-700 bg-green-50',
  Base: 'text-amber-700 bg-amber-50',
  High: 'text-red-700 bg-red-50',
};

export default function TaxScenarioPanel({ taxResults }) {
  if (!taxResults?.results?.length) return null;

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-[#00281E] to-slate-800 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-white/60" />
          <p className="text-sm font-semibold text-white/80">Total Annual Carbon Tax Exposure</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Low', val: taxResults.total_low },
            { label: 'Base', val: taxResults.total_base },
            { label: 'High', val: taxResults.total_high },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xs text-white/40 mb-1">{s.label}</p>
              <p className="text-lg font-bold">${(s.val || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {taxResults.results.map((r, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-slate-800 text-sm">{r.market}</p>
            {r.cbam_exposure > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                CBAM ~${r.cbam_exposure.toLocaleString()}/yr
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {[{ l: 'Low', v: r.low }, { l: 'Base', v: r.base }, { l: 'High', v: r.high }].map(s => (
              <div key={s.l} className={`rounded-lg p-2.5 text-center text-xs font-semibold ${SCENARIO_COLOR[s.l]}`}>
                <p className="font-normal opacity-70 mb-0.5">{s.l}</p>
                <p className="text-base font-bold">${(s.v || 0).toLocaleString()}</p>
                <p className="font-normal opacity-60">/yr</p>
              </div>
            ))}
          </div>
          {r.note && <p className="text-xs text-slate-400 leading-relaxed">{r.note}</p>}
        </div>
      ))}
    </div>
  );
}