import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, ArrowRight } from 'lucide-react';

export default function ResearchAPIOverview() {
  return (
    <section id="research-api" aria-labelledby="research-api-heading" className="scroll-mt-24 grid grid-cols-12 gap-8 rounded-xl border border-research-border bg-research-card p-6 sm:p-8 lg:p-10">
      <div className="col-span-12 lg:col-span-7">
        <div className="flex items-center gap-3 mb-6"><div className="research-icon"><Code2 className="h-5 w-5" strokeWidth={1.5} /></div><span className="research-label">Research API / Early access</span></div>
        <h2 id="research-api-heading" className="mb-4">The same research context. In your own systems.</h2>
        <p className="text-research-muted max-w-lg">Complement Atomistic Simulation and Drug Design with compound lookup, safety screening, and formulation context for your own systems. Review documented endpoints and Python and JavaScript examples; these references do not imply a live simulation or screening API.</p>
        <Link to="/APIPortal" className="research-primary mt-7">Research API<ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="col-span-12 lg:col-span-5 lg:border-l lg:border-research-border lg:pl-8 flex flex-col justify-center">
        <p className="research-label mb-5">In the documentation</p>
        {[
          ['01', 'Compound lookup', 'Identity, properties and source references'],
          ['02', 'Safety and interactions', 'Hazard scores and chemical incompatibilities'],
          ['03', 'Formula generation', 'Product goals and formulation constraints'],
        ].map(([number, title, description]) => <div key={number} className="flex gap-4 py-4 border-b border-research-border last:border-0"><span className="font-mono text-xs text-research-accent pt-1">{number}</span><div><p className="text-sm font-medium mb-1">{title}</p><p className="text-sm text-research-muted">{description}</p></div></div>)}
      </div>
    </section>
  );
}