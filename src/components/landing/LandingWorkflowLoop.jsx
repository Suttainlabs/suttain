import React from 'react';
import { ArrowRight } from 'lucide-react';
import LandingElementBadge from '@/components/landing/LandingElementBadge';

const steps = [
  { number: 'A', symbol: 'Cu', title: 'Define your question', body: 'Choose consumer tools, Atomistic Simulation, or Drug Design for the task at hand.' },
  { number: 'B', symbol: 'En', research: true, title: 'Prepare your workflow', body: 'Select inputs and source records, then configure a calculation or screening approach.' },
  { number: 'C', symbol: 'Rs', research: true, title: 'Review your next step', body: 'Check assumptions, retain research context, and validate findings before laboratory use.' },
];
export default function LandingWorkflowLoop() {
  return <section id="agent-walkthrough" className="home-section home-tinted">
    <div className="home-container text-center">
      <div className="home-section-heading"><p className="home-eyebrow font-mono">How it fits together</p><h2>From a question to a reviewable next step</h2><p>Consumer tools and Research share a platform, with workflows tailored to different tasks.</p></div>
      <div className="home-workflow">{steps.map((step, index) => <React.Fragment key={step.number}>
        {index > 0 && <ArrowRight className="home-workflow-arrow" aria-hidden="true" />}
        <article className="home-workflow-card"><LandingElementBadge {...step} /><h3>{step.title}</h3><p>{step.body}</p></article>
      </React.Fragment>)}</div>
      <p className="home-workflow-note">Atomistic Simulation prepares molecular workflows; Drug Design supports target search and candidate review. Generated setups and illustrative scores require independent validation, and engine execution needs configured compute.</p>
    </div>
  </section>;
}