import React from 'react';
import { Atom, BookOpen, Beaker, ArrowUpRight, Check } from 'lucide-react';

const ICONS = { catalysis: Atom, biomolecular: BookOpen, solid_state: Beaker };
export default function SimulationTemplateCard({ preset, selected, onSelect }) {
  const Icon = ICONS[preset.category] || Atom;
  return (
    <button type="button" aria-pressed={selected} onClick={() => onSelect(preset)} className={`group min-w-0 text-left flex flex-col rounded-xl border p-5 sm:p-6 transition-colors ${selected ? 'border-research-accent bg-research-soft' : 'border-research-border bg-research-card hover:border-research-accent'}`}>
      <div className="flex items-start justify-between gap-3 mb-5"><div className="research-icon"><Icon className="h-5 w-5" strokeWidth={1.5} /></div><span className="research-label">{preset.tag}</span></div>
      <h3 className="!text-lg mb-2">{preset.label}</h3>
      <p className="text-sm text-research-muted leading-relaxed mb-5">{preset.description}</p>
      <div className="mt-auto pt-4 border-t border-research-border flex items-center justify-between gap-2"><span className="font-mono text-xs text-research-muted">{preset.engine}</span><span className="inline-flex items-center gap-1.5 text-xs text-research-accent">{selected ? <><Check className="h-4 w-4" />Applied</> : <>Use template<ArrowUpRight className="h-4 w-4" /></>}</span></div>
    </button>
  );
}