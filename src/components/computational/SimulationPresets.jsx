import React, { useState, useMemo } from "react";
import { Search, X } from 'lucide-react';
import SimulationTemplateCard from '@/components/research/SimulationTemplateCard';

import { PRESETS } from '@/components/computational/enterprisePresets';


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
    <section className="py-7 mb-8 border-b border-research-border">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6">
        <div><p className="research-label mb-2">Workflow presets</p><h2 className="mb-2">Enterprise simulation templates</h2><p className="text-sm text-research-muted">Select a preset to auto-fill the simulation form.</p></div>
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-research-muted" />
          <input aria-label="Search simulation templates" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search templates..." className="simulation-control !pl-10 !pr-10" />
          {search && <button type="button" aria-label="Clear template search" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-research-muted hover:text-research-accent"><X className="h-4 w-4" /></button>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(preset => <SimulationTemplateCard key={preset.id} preset={preset} selected={selected === preset.id} onSelect={handleSelect} />)}
        {filtered.length === 0 && <p className="col-span-full text-center py-8 text-sm text-research-muted">No templates match your search.</p>}
      </div>
    </section>
  );
}