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
    <section className="quiet-latest quiet-container quiet-section" aria-labelledby="latest-title">
      <div className="quiet-section-heading"><h2 id="latest-title">Latest</h2></div>
      <div className="grid gap-4 sm:grid-cols-2">{worlds.map(world => <div key={world.name} className="quiet-update"><h3>{world.name === 'Research workflows' ? 'Recent research improvements' : 'Consumer tools'}</h3><p className="quiet-update-intro">{world.name === 'Research workflows' ? 'Sourced search, custom parameters and a unified studio.' : 'Ingredient insights, formulation and environmental impact.'}</p><div className="quiet-update-links">{world.items.map(({ title, to }) => <Link key={title} to={to}>{title}<ArrowUpRight className="h-3 w-3 shrink-0" /></Link>)}</div></div>)}</div>
    </section>
  );
}