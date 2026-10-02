import React from 'react';
import { ArrowRight } from 'lucide-react';
import LandingElementBadge from '@/components/landing/LandingElementBadge';

const steps = [
  { number: 'A', symbol: 'Cu', title: 'Someone uses a tool', body: 'A scan, a formula, a simulation, anywhere in the world.' },
  { number: 'B', symbol: 'En', research: true, title: 'The engine learns', body: 'Aggregate patterns sharpen the shared safety and formula models.' },
  { number: 'C', symbol: 'Rs', research: true, title: 'Research gets rigor', body: 'Formulators and safety teams work from a model tested at real-world scale.' },
];
export default function LandingWorkflowLoop() {
  return <section id="agent-walkthrough" className="home-section home-tinted">
    <div className="home-container text-center">
      <div className="home-section-heading"><p className="home-eyebrow font-mono">How it fits together</p><h2>One engine, sharpened by use</h2><p>Consumer and research aren't separate products bolted together. They're one loop.</p></div>
      <div className="home-workflow">{steps.map((step, index) => <React.Fragment key={step.number}>
        {index > 0 && <ArrowRight className="home-workflow-arrow" aria-hidden="true" />}
        <article className="home-workflow-card"><LandingElementBadge {...step} /><h3>{step.title}</h3><p>{step.body}</p></article>
      </React.Fragment>)}</div>
      <p className="home-workflow-note">Every scan is aggregated, never sold as individual data. A small contribution to a shared, growing picture of what's actually in the things we use.</p>
    </div>
  </section>;
}