import React from 'react';
import { Database } from 'lucide-react';
import { sourcesFor } from '@/data/dataSources';

// Verified counts live in src/data/dataSources.js (single source of truth).
const SHOWN = ['pubchem', 'chembl', 'pdb', 'uniprot', 'alphafold', 'chebi'];

export default function ResearchDataSources() {
  const sources = sourcesFor('research').filter(s => SHOWN.includes(s.id)).sort((a, b) => SHOWN.indexOf(a.id) - SHOWN.indexOf(b.id));
  return (
    <section className="py-10 sm:py-12 border-b border-research-border" aria-labelledby="research-sources">
      <h2 id="research-sources" className="flex items-center gap-2 mb-2 !text-sm"><Database className="w-4 h-4 text-research-accent" />Scientific context for simulation and design</h2>
      <p className="text-sm text-research-muted mb-6 max-w-2xl">Live integrations Suttain queries during Atomistic Simulation and Drug Design. Figures are the providers' published totals.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map(source => (
          <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-research-border bg-research-card p-5 hover:border-research-accent transition-colors">
            <div className="flex items-baseline justify-between gap-3 mb-1"><h3 className="!text-base">{source.name}</h3>{source.count && <span className="font-mono text-sm text-research-accent">{source.count}</span>}</div>
            <p className="research-label mb-3">{source.org}{source.count ? ` · ${source.unit}` : ''}</p>
            <p className="text-sm text-research-muted">{source.detail}</p>
            {source.extra && <p className="text-xs text-research-muted mt-2 font-mono">{source.extra}</p>}
            {source.asOf && <p className="text-[11px] text-research-muted mt-3">Source: {source.asOf}</p>}
          </a>
        ))}
      </div>
    </section>
  );
}
