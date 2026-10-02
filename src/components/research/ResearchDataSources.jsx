import React from 'react';
import { Database } from 'lucide-react';

const SOURCES = [
  { name: 'PubChem', org: 'NCBI / NIH', records: '130M+', detail: 'Compound identity, bioassays and properties' },
  { name: 'ChEMBL', org: 'EMBL-EBI', records: '2.4M+', detail: 'Bioactivity and molecular target data' },
  { name: 'EPA CompTox', org: 'US EPA', records: '900k+', detail: 'Toxicity, environmental fate and regulation' },
  { name: 'AlphaFold DB', org: 'EMBL-EBI / DeepMind', records: '200k+', detail: 'Protein structures and confidence metrics' },
];
export default function ResearchDataSources() {
  return (
    <section className="py-10 sm:py-12 border-b border-research-border" aria-labelledby="research-sources">
      <h2 id="research-sources" className="flex items-center gap-2 mb-6 !text-sm"><Database className="w-4 h-4 text-research-accent" />Scientific context for simulation and design</h2>
      <div className="grid grid-cols-12 gap-y-6">
        {SOURCES.map((source, i) => (
          <div key={source.name} className={`col-span-12 sm:col-span-6 lg:col-span-3 ${i > 0 ? 'lg:border-l lg:border-research-border lg:pl-6' : ''} pr-4`}>
            <div className="flex items-baseline justify-between gap-3 mb-3"><h3 className="!text-base">{source.name}</h3><span className="font-mono text-xs text-research-accent">{source.records}</span></div>
            <p className="research-label mb-2">{source.org}</p>
            <p className="text-sm text-research-muted">{source.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}