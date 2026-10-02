import React, { useState, useMemo } from "react";
import { Search, Beaker, Atom, BookOpen, X } from "lucide-react";

import { PRESETS } from '@/components/computational/enterprisePresets';
const CATEGORY_ICONS = { catalysis: Atom, biomolecular: BookOpen, solid_state: Beaker };

export default function SimulationPresets({ onSelectPreset }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() =>
    PRESETS.filter(p =>
      search === "" ||
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tag.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  const handleSelect = (preset) => {
    setSelected(preset.id);
    onSelectPreset(preset);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">Enterprise simulation templates</h2>
          <p className="text-xs text-slate-500">Select a preset to auto-fill the simulation form</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(preset => {
          const Icon = CATEGORY_ICONS[preset.category] || Atom;
          const isActive = selected === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset)}
              className={`text-left p-4 rounded-xl border-2 transition-all focus:outline-none ${
                isActive
                  ? "border-violet-500 bg-violet-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-violet-600" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${preset.tagColor}`}>
                  {preset.tag}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground leading-tight mb-1">{preset.label}</p>
              <p className="text-xs text-primary mb-1">{preset.engine}</p>
              <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{preset.description}</p>
              {isActive && (
                <p className="text-[10px] text-violet-600 font-semibold mt-2">Applied to form below</p>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-8 text-sm text-slate-500">No templates match your search.</div>
        )}
      </div>
    </div>
  );
}