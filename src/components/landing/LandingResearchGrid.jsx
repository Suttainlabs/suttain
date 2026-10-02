import React from 'react';
import { Link } from 'react-router-dom';
import LandingElementBadge from '@/components/landing/LandingElementBadge';

const tools = [

  { number: '07', symbol: 'Sm', title: 'Atomistic Simulation', body: 'Configure quantum chemistry, molecular dynamics, and materials workflows. Prepare engine-specific inputs and review assumptions before running calculations with configured compute.', route: '/AtomisticSimulation' },
  { number: '08', symbol: 'Ap', title: 'Drug Design', body: 'Search biological targets, explore screening methods, and save candidate shortlists. Live target records support research; demonstration scores are not validated predictions.', route: '/DrugDesign' },
];
export default function LandingResearchGrid() {
  return <section id="research-tools" className="home-section home-tinted">
    <div className="home-container">
      <div className="home-section-heading"><p className="home-eyebrow home-research-label font-mono">For researchers</p><h2>Two tools. A focused research workspace.</h2><p>Atomistic Simulation for molecular systems. Drug Design for targets and candidates.</p></div>
      <div className="grid sm:grid-cols-2 gap-9">{tools.map(tool => <Link key={tool.number} to={tool.route} className="home-feature home-research-card">
        <LandingElementBadge {...tool} research /><h3>{tool.title}</h3><p>{tool.body}</p>
      </Link>)}</div>
    </div>
  </section>;
}