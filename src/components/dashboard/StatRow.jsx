import React from 'react';
import { FlaskConical, TestTube, QrCode } from 'lucide-react';

const STATS = [
  { key: 'totalFormulas', label: 'Formulas', icon: FlaskConical },
  { key: 'totalSimulations', label: 'Simulations', icon: TestTube },
  { key: 'totalScans', label: 'Scans', icon: QrCode },
];

export default function StatRow({ stats, isLoading }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STATS.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-[#02988C]" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-semibold text-slate-900 leading-tight">
              {isLoading ? <span className="inline-block w-6 h-5 bg-slate-100 rounded animate-pulse" /> : (stats[key] ?? 0)}
            </p>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}