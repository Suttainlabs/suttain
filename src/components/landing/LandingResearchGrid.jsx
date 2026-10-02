import React from 'react';
import { Link } from 'react-router-dom';
import LandingElementBadge from '@/components/landing/LandingElementBadge';

const tools = [

  { number: '07', symbol: 'Sm', title: 'Simulation', body: 'Model reactions and formulations before you run them, with the same safety engine that powers consumer scans.', route: '/ComputationalStudio/Simulations' },
  { number: '08', symbol: 'Ap', title: 'API access', body: "Bring Suttain's data model, safety engine, and formula intelligence directly into your own tools and pipelines.", route: '/APIPortal' },
];
export default function LandingResearchGrid() {
  return <section id="research-tools" className="home-section home-tinted">
    <div className="home-container">
      <div className="home-section-heading"><p className="home-eyebrow home-research-label font-mono">For researchers</p><h2>Chemical intelligence, at working depth</h2><p>The same engine, running at the resolution real chemical work needs.</p></div>
      <div className="grid sm:grid-cols-2 gap-9">{tools.map(tool => <Link key={tool.number} to={tool.route} className="home-feature home-research-card">
        <LandingElementBadge {...tool} research /><h3>{tool.title}</h3><p>{tool.body}</p>
      </Link>)}</div>
    </div>
  </section>;
}