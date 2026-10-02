import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from 'lucide-react';

const TOOLS = [
  { title: 'Computational studio', desc: 'For computational chemists: configure quantum chemistry, QM/MM and other engine-specific workflows.', to: '/ComputationalStudio/Simulations' },
  { title: 'Scientific database search', desc: 'For researchers: discover compounds across PubChem, ChEMBL, ChEBI, ChemSpider and Suttain DB.', to: '/ResearchPortal' },
  { title: 'Forcefields and run tracking', desc: 'For simulation teams: manage parameters, prepare inputs and revisit saved workflow analyses.', to: '/ResearchDashboard' },
  { title: 'Research API', desc: 'For developers and research organizations: explore chemical data and workflow integration options.', to: '/APIPortal' }
];

export default function LandingToolkit() {
  return (
    <section id="research-world" className="home-research scroll-mt-20 rounded-xl border border-research-border p-6 sm:p-8" aria-labelledby="research-title">
      <p className="research-label mb-3">Dedicated research workspace</p><h2 id="research-title" className="mb-3">From scientific question to prepared workflow</h2>
      <p className="text-research-muted mb-6">For scientists, computational chemists and R&amp;D teams working with molecular systems. This is a separate research surface, not the consumer product-analysis toolkit.</p>
      <div className="grid gap-3">{TOOLS.map(tool => <Link key={tool.title} to={tool.to} className="rounded-lg border border-research-border p-4 hover:border-research-accent transition-colors"><h3 className="flex items-center justify-between gap-3 mb-1">{tool.title}<ArrowUpRight className="h-4 w-4 shrink-0" /></h3><p className="text-sm text-research-muted">{tool.desc}</p></Link>)}</div>
      <p className="text-sm text-research-muted mt-6">Review generated inputs and estimates. Engine execution requires separately configured compute.</p>
    </section>
  );
}