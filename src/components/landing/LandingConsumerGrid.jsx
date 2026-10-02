import React from 'react';
import { Link } from 'react-router-dom';
import LandingElementBadge from '@/components/landing/LandingElementBadge';

const tools = [
  { number: '03', symbol: 'Sn', title: 'Scan a product', body: 'Point your camera at a barcode or ingredient list for real chemical identification.', route: '/BarcodeScanner' },
  { number: '04', symbol: 'Ti', title: 'Test interactions', body: 'Check whether combining products or ingredients is safe before you mix them.', route: '/Simulator' },
  { number: '05', symbol: 'Bf', title: 'Build a formula', body: 'Generate a validated skincare, soap, or cleaning formula from scratch.', route: '/generator' },
  { number: '06', symbol: 'Ss', title: 'Score sustainability', body: 'See how a product or formula stacks up on environmental impact.', route: '/SustainabilityImpact' },
];
export default function LandingConsumerGrid() {
  return <section id="consumer-tools" className="home-section home-container">
    <div className="home-section-heading"><p className="home-eyebrow font-mono">For everyone</p><h2>Four ways in, one plain-language answer</h2><p>However you start, you end up knowing for sure.</p></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">{tools.map(tool => <Link key={tool.number} to={tool.route} className="home-feature">
      <LandingElementBadge {...tool} /><h3>{tool.title}</h3><p>{tool.body}</p>
    </Link>)}</div>
  </section>;
}