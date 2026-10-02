import React from "react";
import SmartChemicalSearch from "@/components/landing/SmartChemicalSearch";
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function LandingHero() {
  return (
    <section className="px-4 pt-14 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-8">
            <p className="research-label mb-5">Suttain / Autonomous research workflows</p>
            <h1 className="max-w-2xl mb-5">Move the workflow forward.<br />Keep the science in your hands.</h1>
            <p className="text-research-muted max-w-xl mb-7">Your workflow agent for computational research: find sourced compounds, prepare engine-specific inputs and review the next step. Suttain handles preparation; you keep control of the scientific decisions.</p>
            <div className="flex flex-wrap gap-3"><Link to="/ResearchDashboard" className="research-primary">Open research dashboard<ArrowRight className="h-4 w-4" /></Link><a href="#agent-walkthrough" className="research-secondary">Walk through the workflow</a></div>
            <p className="mt-5 text-sm text-research-muted">Workflow preparation and analysis. Engine execution requires configured compute.</p>
          </div>
          <aside className="lg:col-span-4 border-l border-research-border pl-6 lg:mt-2">
            <p className="research-label mb-5">The handoff</p>
            {['You define the question', 'Suttain prepares the workflow', 'You review and override', 'Keep a traceable output'].map((label, i) => <div key={label} className="flex items-center gap-4 py-3 border-b border-research-border"><span className="font-mono text-xs text-research-accent">0{i + 1}</span><span className="text-sm">{label}</span></div>)}
            <Link to="/ResearchPortal#research-api" className="inline-flex items-center gap-2 min-h-11 mt-4 text-sm text-research-accent hover:underline">Explore the research API<ArrowRight className="h-4 w-4" /></Link>
          </aside>
        </div>
        <div className="mt-12 border-t border-research-border pt-7"><p className="research-label mb-4">Start with a chemical question</p><SmartChemicalSearch /></div>
      </div>
    </section>
  );
}