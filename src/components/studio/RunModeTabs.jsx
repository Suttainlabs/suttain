import React from 'react';
import { Play, Layers, GitBranch, Lock } from 'lucide-react';

const MODES = [
  { id: 'single', label: 'Single Run', icon: Play, gated: false },
  { id: 'batch', label: 'Batch Workflows', icon: Layers, gated: true },
  { id: 'pipeline', label: 'Pipelines', icon: GitBranch, gated: true },
];

export default function RunModeTabs({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit overflow-x-auto no-scrollbar">
      {MODES.map(mode => (
        <button key={mode.id} onClick={() => onChange(mode.id)}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
            active === mode.id
              ? 'bg-[#0F6E56] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}>
          <mode.icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{mode.label}</span>
          {mode.gated && <Lock className="w-2.5 h-2.5 ml-0.5 opacity-50" />}
        </button>
      ))}
    </div>
  );
}