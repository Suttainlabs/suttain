import React from 'react';
import { Link } from 'react-router-dom';
import { Gauge, ArrowRight } from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';
import ResearchAudience from '@/components/research/ResearchAudience';

export default function ComputationalStudio() {
  return (
    <StudioLayout>
      <section className="py-4 sm:py-8">
        <div className="flex items-baseline justify-between gap-4 border-b border-research-border pb-6 mb-8">
          <h1>Tool pages</h1><span className="research-label">01 workspace</span>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <Link to="/ComputationalStudio/Simulations" className="group col-span-12 md:col-span-7 lg:col-span-6 rounded-xl border border-research-border bg-research-card p-6 sm:p-8 transition-colors hover:border-research-accent">
            <div className="flex items-start justify-between mb-8"><div className="research-icon bg-research-soft"><Gauge className="h-5 w-5" strokeWidth={1.5} /></div><span className="research-label">01 / Compute</span></div>
            <h2 className="mb-3">Simulations</h2>
            <p className="text-research-muted">Configure QM/MM, quantum chemistry, biomolecular dynamics and materials calculations across five compute fields.</p>
            <div className="flex items-center justify-between mt-8 border-t border-research-border pt-5"><span className="research-label">05 compute fields</span><span className="inline-flex items-center gap-2 font-medium text-sm text-research-accent">Open<ArrowRight className="h-4 w-4" /></span></div>
          </Link>
        </div>
      </section>
      <ResearchAudience />
    </StudioLayout>
  );
}