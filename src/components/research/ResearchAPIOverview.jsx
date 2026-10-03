import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, ArrowRight } from 'lucide-react';

export default function ResearchAPIOverview() {
  return (
    <section id="research-api" aria-labelledby="research-api-heading" className="scroll-mt-24 grid grid-cols-12 gap-8 rounded-xl border border-research-border bg-research-card p-6 sm:p-8 lg:p-10">
      <div className="col-span-12 lg:col-span-7">
        <div className="flex items-center gap-3 mb-6"><div className="research-icon"><Code2 className="h-5 w-5" strokeWidth={1.5} /></div><span className="research-label">API documentation</span></div>
        <h2 id="research-api-heading" className="mb-4">A clear reference for research workflows.</h2>
        <p className="text-research-muted max-w-lg">Explore supported engines, request parameters and examples. Understand which workflows run through Rowan and which prepare files for local execution.</p>
        <Link to="/APIPortal" className="research-primary mt-7">Read API documentation<ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="col-span-12 lg:col-span-5 lg:border-l lg:border-research-border lg:pl-8 flex flex-col justify-center">
        <p className="research-label mb-5">In the documentation</p>
        {[
          ['01', 'Engine reference', 'Supported methods, tasks and requirements'],
          ['02', 'Request examples', 'Parameters and expected responses'],
          ['03', 'Software citations', 'Provider attribution and source references'],
        ].map(([number, title, description]) => <div key={number} className="flex gap-4 py-4 border-b border-research-border last:border-0"><span className="font-mono text-xs text-research-accent pt-1">{number}</span><div><p className="text-sm font-medium mb-1">{title}</p><p className="text-sm text-research-muted">{description}</p></div></div>)}
      </div>
    </section>
  );
}