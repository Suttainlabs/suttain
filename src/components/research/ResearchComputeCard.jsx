import React from 'react';
import { Link } from 'react-router-dom';
import { Gauge, ArrowUpRight } from 'lucide-react';

export default function ResearchComputeCard() {
  return (
    <section className="pb-12" aria-labelledby="research-compute">
      <p className="research-label mb-5">Research / Atomistic Simulation</p>
      <Link to="/AtomisticSimulation" className="group grid grid-cols-12 gap-6 sm:gap-8 rounded-xl border border-research-border bg-research-card p-6 sm:p-8 transition-colors hover:border-research-accent">
        <div className="col-span-12 md:col-span-4">
          <div className="research-icon mb-5"><Gauge className="h-5 w-5" strokeWidth={1.5} /></div>
          <h2 id="research-compute">Atomistic Simulation</h2>
        </div>
        <div className="col-span-12 md:col-span-8 flex flex-col items-start">
          <p className="text-research-muted max-w-xl">Explore electronic structure, biomolecular dynamics, and materials at the atomic scale. Configure quantum chemistry, QM/MM, and molecular dynamics workflows; review prepared inputs before executing them with separately configured compute.</p>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Supported engines">
            {['ORCA', 'Gaussian', 'GROMACS', 'OpenMM', 'CP2K'].map(engine => <span key={engine} className="font-mono text-xs rounded border border-research-border px-2.5 py-1 text-research-muted">{engine}</span>)}
          </div>
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-research-accent">Open Atomistic Simulation<ArrowUpRight className="h-4 w-4" /></span>
        </div>
      </Link>
    </section>
  );
}