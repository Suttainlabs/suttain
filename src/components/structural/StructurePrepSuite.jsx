import React, { useState } from 'react';
import StructurePrepPanel from './StructurePrepPanel';
import { Scissors, Layers, Search, Hash, LayoutGrid, Target } from 'lucide-react';

const MODE_META = {
  split: { label: 'Splitter', icon: Scissors, color: '#3B82F6' },
  merge: { label: 'Merger', icon: Layers, color: '#8B5CF6' },
  missing_residues: { label: 'Missing Residues', icon: Search, color: '#F59E0B' },
  renumber: { label: 'Renumber', icon: Hash, color: '#EC4899' },
  grid_params: { label: 'Grid Generator', icon: LayoutGrid, color: '#0D9E8E' },
  ligand_grid_params: { label: 'Ligand Grid', icon: Target, color: '#EF4444' },
};

export default function StructurePrepSuite({
  modes,
  pdbContent,
  onResult,
  onUseParams,
}) {
  const [activeMode, setActiveMode] = useState(modes[0]);

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {modes.map((mode) => {
          const meta = MODE_META[mode];
          const Icon = meta.icon;
          const isActive = activeMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                isActive
                  ? 'bg-slate-700/60 border-slate-600 text-white'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              <Icon className="w-3 h-3" style={{ color: isActive ? meta.color : undefined }} />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <StructurePrepPanel
        mode={activeMode}
        pdbContent={pdbContent}
        onResult={onResult}
        onUseParams={onUseParams}
      />
    </div>
  );
}