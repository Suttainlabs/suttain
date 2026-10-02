import React from 'react';
import { Link } from 'react-router-dom';
import { Database, SlidersHorizontal, Layers, ArrowUpRight } from 'lucide-react';
const worlds = [
  { name: 'Consumer and brands', scope: 'home-consumer', audience: 'Product-focused tools for shoppers, makers and brands', items: [
    { icon: Database, title: 'Ingredient safety in context', detail: 'Look up a product and explore its ingredients, safety findings and alternatives.', to: '/BarcodeScanner' },
    { icon: SlidersHorizontal, title: 'Formulation you can review', detail: 'Prepare formulas with ingredient guidance and manufacturing instructions.', to: '/generator' },
    { icon: Layers, title: 'Environmental impact', detail: 'Explore sustainability assessments and lower-impact product choices.', to: '/SustainabilityImpact' }
  ] },
  { name: 'Research workflows', scope: 'home-research', audience: 'Computational tools for scientists and R&D teams', items: [
    { icon: Database, title: 'Multi-database search', detail: 'Search PubChem, ChEMBL, ChEBI, ChemSpider and Suttain DB with source labels.', to: '/ResearchPortal' },
    { icon: SlidersHorizontal, title: 'Custom forcefields', detail: 'Select, upload or create parameters and attach them to your simulation setup.', to: '/ResearchDashboard' },
    { icon: Layers, title: 'Unified simulation studio', detail: 'Prepare and track engine-specific workflows, including quantum chemistry and QM/MM.', to: '/ComputationalStudio/Simulations' }
  ] }
];
export default function LatestResearch() {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20" aria-labelledby="latest-title">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center"><p className="research-label mb-3">Inside each workspace</p><h2 id="latest-title">Product tools here. Research tools there.</h2><p className="text-research-muted mt-3">Consumer capabilities and the latest research improvements, kept in their own lanes.</p></div>
        <div className="grid gap-6 md:grid-cols-2">{worlds.map(world => <div key={world.name} className={`${world.scope} rounded-xl border border-research-border bg-research-soft p-6`}><h3 className="mb-2">{world.name}</h3><p className="text-sm text-research-muted mb-5">{world.audience}</p><div className="space-y-3">{world.items.map(({ icon: Icon, title, detail, to }) => <Link key={title} to={to} className="block rounded-lg border border-research-border bg-research-card p-4 hover:border-research-accent transition-colors"><div className="flex items-center gap-3 text-research-accent mb-2"><Icon className="h-4 w-4 shrink-0" /><span className="text-sm font-medium flex-1">{title}</span><ArrowUpRight className="h-4 w-4" /></div><p className="text-sm text-research-muted">{detail}</p></Link>)}</div></div>)}</div>
      </div>
    </section>
  );
}