import React from 'react';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export function SourceLabel({ source }) {
  if (!source) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
      <ShieldCheck className="w-3 h-3 text-[#007850]" />
      {source}
    </span>
  );
}

export function ConfidenceBar({ value, label = 'Confidence' }) {
  if (value == null) return null;
  const pct = Math.round(Math.min(100, Math.max(0, value * 100)));
  const color = pct >= 75 ? '#00B478' : pct >= 50 ? '#D4900A' : '#C42B2B';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold text-slate-800 tabular-nums w-10 text-right">{pct}%</span>
    </div>
  );
}

export function LoadingState({ label = 'Analyzing...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="w-8 h-8 text-[#007850] animate-spin" />
      <p className="text-sm text-slate-500 font-medium">{label}</p>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-sm text-red-600 font-medium text-center max-w-md">{message}</p>
    </div>
  );
}

export function ResultCard({ source, confidence, confidenceLabel, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <SourceLabel source={source} />
          {confidence != null && (
            <div className="flex-1 min-w-[150px] max-w-[280px]">
              <ConfidenceBar value={confidence} label={confidenceLabel || 'Confidence'} />
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function DataRow({ label, value, unit }) {
  return (
    <div className="flex justify-between text-sm gap-2 py-1">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-slate-800 text-right">{value}{unit ? ` ${unit}` : ''}</span>
    </div>
  );
}