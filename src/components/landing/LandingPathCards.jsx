import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LandingElementBadge from '@/components/landing/LandingElementBadge';

const paths = [
  { number: '01', symbol: 'Cb', title: 'Consumer and brand', description: 'Safer, greener products. Scan products, generate validated formulas, and check compliance, no lab required.', items: ['Scan a product', 'Test interactions', 'Build a formula', 'Score sustainability'], link: '/BarcodeScanner', label: 'Explore consumer tools' },
  { number: '02', symbol: 'Rs', research: true, title: 'Research', description: 'Atomistic Simulation and Drug Design for chemists, scientists, and R&D teams. Prepare molecular calculations, explore targets, and review the evidence behind your next step.', items: ['Atomistic Simulation', 'Drug Design'], link: '/ResearchPortal', label: 'Explore research tools' },
];
export default function LandingPathCards() {
  return <section className="home-paths home-container" aria-label="Two ways to work">
    <div className="grid sm:grid-cols-2 gap-6">{paths.map(path => <article key={path.number} className={`home-path-card ${path.research ? 'home-research-card' : ''}`}>
      <LandingElementBadge {...path} />
      <h2>{path.title}</h2><p>{path.description}</p>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-2">{path.items.map(item => <li key={item}>{item}</li>)}</ul>
      <Link to={path.link} className="home-path-link">{path.label}<ArrowRight size={16} aria-hidden="true" /></Link>
    </article>)}</div>
  </section>;
}