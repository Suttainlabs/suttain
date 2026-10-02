import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const sentenceLabel = (label) => label.split(/(DFT|QM|MD|QM\/MM|\([^)]+\))/).map(part => /^(DFT|QM|MD|QM\/MM|\([^)]+\))$/.test(part) ? part : part.toLowerCase()).join('').replace(/^\w/, char => char.toUpperCase());
export default function SimulationCatalogCard({ simulation, domain, index }) {
  const Icon = simulation.icon;
  return (
    <Link to={`/SimulationRunner?type=${simulation.id}&domain=${encodeURIComponent(domain)}`} className="group flex flex-col rounded-xl border border-research-border bg-research-card p-6 min-w-0 transition-colors hover:border-research-accent">
      <div className="flex items-start justify-between mb-6"><div className="research-icon bg-research-soft"><Icon className="h-5 w-5" strokeWidth={1.5} /></div><span className="research-label">{String(index + 1).padStart(2, '0')}</span></div>
      <h3 className="!text-lg mb-3">{sentenceLabel(simulation.label)}</h3>
      <p className="text-sm text-research-muted leading-relaxed mb-6">{simulation.description}</p>
      <div className="flex flex-wrap gap-1.5 mt-auto" aria-label="Supported engines">
        {simulation.engines.map(engine => <span key={engine} className="rounded border border-research-border px-2 py-1 font-mono text-xs text-research-muted">{engine}</span>)}
      </div>
      <div className="flex items-center justify-between border-t border-research-border pt-4 mt-5 text-sm text-research-accent"><span>Configure workflow</span><ArrowUpRight className="h-4 w-4" /></div>
    </Link>
  );
}