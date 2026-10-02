import React from "react";
import { Link } from 'react-router-dom';
import { ScanLine, Atom, FlaskConical, Leaf } from 'lucide-react';
const tools = [
  { title: 'Scan a product', detail: 'See ingredients, safety information and alternatives.', to: '/BarcodeScanner', icon: ScanLine },
  { title: 'Test interactions', detail: 'Check combinations before you mix them.', to: '/Simulator', icon: Atom },
  { title: 'Build a formula', detail: 'Prepare formulas with ingredient and process guidance.', to: '/generator', icon: FlaskConical },
  { title: 'Score sustainability', detail: 'Explore environmental impact and lower-impact choices.', to: '/SustainabilityImpact', icon: Leaf }
];
export default function LandingFeatures() {
  return (
    <section id="consumer-world" className="quiet-section quiet-container scroll-mt-20" aria-labelledby="consumer-title">
      <div className="quiet-section-heading"><p className="quiet-eyebrow">Features / Consumer and brands</p><h2 id="consumer-title">The same care, closer to everyday life</h2></div>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 gap-3">
        {tools.map(({ icon: Icon, ...tool }) => <Link key={tool.title} to={tool.to} className="quiet-feature"><div className="flex items-start justify-between mb-6"><span className="quiet-line-icon"><Icon className="h-6 w-6" strokeWidth={1.2} /></span><span className="quiet-dot" /></div><h3>{tool.title}</h3><p>{tool.detail}</p></Link>)}
      </div>
      <p className="quiet-note">Decision support, not a replacement for professional safety or regulatory advice.</p>
    </section>
  );
}