import React from "react";
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
const tools = [
  { title: 'Product scanner', detail: 'For shoppers: inspect ingredients, safety information and alternatives.', to: '/BarcodeScanner' },
  { title: 'Formula generator', detail: 'For makers and brands: prepare formulas and review ingredients and manufacturing steps.', to: '/generator' },
  { title: 'Chemical simulator', detail: 'For consumers and formulators: explore interactions before combining ingredients.', to: '/Simulator' },
  { title: 'Sustainability and impact', detail: 'For brands: assess environmental impact and explore lower-impact alternatives.', to: '/SustainabilityImpact' }
];
export default function LandingFeatures() {
  return (
    <section id="consumer-world" className="home-consumer scroll-mt-20 rounded-xl border border-research-border p-6 sm:p-8" aria-labelledby="consumer-title">
      <p className="research-label mb-3">Consumer and brand workspace</p><h2 id="consumer-title" className="mb-3">Better decisions about real products</h2>
      <p className="text-research-muted mb-6">For consumers checking a purchase, makers building a formula and brands reviewing product impact. These are product-focused tools, not computational research workflows.</p>
      <div className="grid gap-3">{tools.map(tool => <Link key={tool.title} to={tool.to} className="rounded-lg border border-research-border p-4 hover:border-research-accent transition-colors"><h3 className="flex items-center justify-between gap-3 mb-1">{tool.title}<ArrowUpRight className="h-4 w-4 shrink-0" /></h3><p className="text-sm text-research-muted">{tool.detail}</p></Link>)}</div>
      <p className="text-sm text-research-muted mt-6">Guidance supports your decisions; it does not replace professional safety or regulatory advice.</p>
    </section>
  );
}