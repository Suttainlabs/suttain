import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AuthContext from '@/components/auth/AuthContext';
import { RESEARCH_PRODUCTS } from '@/components/research/researchProducts';

export default function ResearchHero() {
  const { user } = useContext(AuthContext);
  return (
    <section className="grid grid-cols-12 gap-8 border-b border-research-border py-12 sm:py-16 lg:py-20">
      <div className="col-span-12 lg:col-span-7">
        <p className="research-label mb-4">Suttain Research</p>
        <h1 className="max-w-xl mb-5">Find a target. Predict binding. Calculate the molecule.</h1>
        <p className="max-w-xl text-research-muted leading-relaxed">Three connected tools for drug discovery and computational chemistry. Drug Design finds targets and candidates, Binding &amp; ADME predicts how they bind and behave, and Atomistic Simulation runs quantum chemistry on the molecules worth the effort. Every result says which engine produced it and how far to trust it.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a href="#research-tools" className="research-primary">See how the tools connect<ArrowRight className="h-4 w-4" /></a>
          <Link to={user ? '/ResearchDashboard' : '/DrugDesign'} className="research-secondary">{user ? 'Open my workspace' : 'Start with Drug Design'}</Link>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-5 flex items-center">
        <ol className="w-full space-y-3" aria-label="Research tools in order">
          {RESEARCH_PRODUCTS.map(p => {
            const Icon = p.icon;
            return (
              <li key={p.id}>
                <Link to={p.route} className="flex items-center gap-4 rounded-xl border border-research-border bg-research-card p-4 hover:border-research-accent transition-colors">
                  <span className="font-mono text-xs text-research-muted">{p.step}</span>
                  <Icon className="h-5 w-5 text-research-accent shrink-0" strokeWidth={1.5} />
                  <span className="min-w-0"><span className="block text-sm font-medium text-research-text">{p.name}</span><span className="block text-xs text-research-muted truncate">{p.question}</span></span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
