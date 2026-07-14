import React from 'react';
import { Lock, Database, Cpu, FileOutput, Globe } from 'lucide-react';

export function TrustLabel({ source, type = 'database' }) {
  const icons = { database: Database, computed: Cpu, external: FileOutput, api: Globe };
  const Icon = icons[type] || Database;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-600">
      <Icon className="w-3 h-3" />
      {source}
    </span>
  );
}

export function TierBadge({ tier }) {
  if (tier === 'free') return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 border border-violet-200 rounded text-xs font-semibold text-violet-700">
      <Lock className="w-3 h-3" />
      {tier === 'pro' ? 'Pro' : tier}
    </span>
  );
}

export function StatCard({ label, value, icon: Icon, accent = '#007850' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-4 h-4" style={{ color: accent }} />}
      </div>
      <div className="text-2xl font-bold text-slate-800 font-mono">{value}</div>
    </div>
  );
}

export function UpgradePrompt({ feature }) {
  return (
    <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-violet-600 flex-shrink-0" />
        <span className="text-sm text-slate-700">{feature} is available on Researcher Pro and Institutional plans.</span>
      </div>
      <a href="/Pricing" className="text-sm font-semibold text-violet-600 hover:text-violet-700 whitespace-nowrap">Upgrade</a>
    </div>
  );
}

export function ExecutionTag({ type }) {
  if (type === 'external') {
    return <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-xs font-mono text-amber-700">External input file</span>;
  }
  return <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 rounded text-xs font-mono text-teal-700">In-browser</span>;
}