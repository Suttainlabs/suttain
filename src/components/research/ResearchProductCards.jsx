import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { RESEARCH_PRODUCTS } from '@/components/research/researchProducts';

export default function ResearchProductCards() {
  return (
    <section aria-labelledby="research-products-title" className="py-12 sm:py-16 border-b border-research-border">
      <p className="research-label mb-3">Research tools</p>
      <h2 id="research-products-title" className="mb-8">Open a tool</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {RESEARCH_PRODUCTS.map(p => {
          const Icon = p.icon;
          return (
            <Link key={p.id} to={p.route} className="group flex flex-col rounded-xl border border-research-border bg-research-card p-6 transition-colors hover:border-research-accent min-w-0">
              <div className="flex items-center justify-between mb-5"><div className="research-icon"><Icon className="h-5 w-5" strokeWidth={1.5} /></div><span className="research-label">{p.step} · {p.verb}</span></div>
              <h3 className="!text-lg mb-2">{p.name}</h3>
              <p className="text-sm text-research-muted leading-relaxed flex-1">{p.summary}</p>
              <div className="mt-5 flex flex-wrap gap-1.5" aria-label="Engines and sources">{p.engines.map(e => <span key={e} className="font-mono text-[11px] rounded border border-research-border px-2 py-0.5 text-research-muted">{e}</span>)}</div>
              <p className="mt-4 text-xs text-research-muted border-t border-research-border pt-3">{p.evidence}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-research-accent">Open {p.name}<ArrowUpRight className="h-4 w-4" /></span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
