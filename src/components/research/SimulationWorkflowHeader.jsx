import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const sentenceLabel = label => label.split(/(DFT|QM\/MM|QM|MD|\([^)]+\))/).map(part => /^(DFT|QM\/MM|QM|MD|\([^)]+\))$/.test(part) ? part : part.toLowerCase()).join('').replace(/^\w/, char => char.toUpperCase());

export default function SimulationWorkflowHeader({ simulation, domain, engine }) {
  const Icon = simulation.icon;
  return (
    <header className="border-b border-research-border pb-8 mb-8">
      <Link to="/ComputationalStudio/Simulations" className="inline-flex items-center gap-2 text-sm text-research-muted hover:text-research-accent mb-7"><ArrowLeft className="h-4 w-4" />Back to simulations</Link>
      <div className="grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 lg:col-span-9">
          <p className="research-label mb-4">Computational studio / {sentenceLabel(domain)}</p>
          <div className="flex items-start gap-4">
            <div className="research-icon bg-research-soft"><Icon className="h-5 w-5" strokeWidth={1.5} /></div>
            <div className="min-w-0"><h1 className="mb-3">{sentenceLabel(simulation.label)}</h1><p className="text-research-muted max-w-2xl">{simulation.description}</p></div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-3 lg:text-right"><span className="inline-flex rounded border border-research-border bg-research-card px-3 py-2 font-mono text-xs text-research-muted">{engine}</span></div>
      </div>
    </header>
  );
}