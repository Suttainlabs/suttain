import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ScanLine, FlaskConical } from 'lucide-react';

export default function LandingDoors() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12" aria-label="Choose your Suttain workspace">
      <div className="grid gap-5 md:grid-cols-2">
        <article className="home-consumer flex flex-col rounded-xl border border-research-accent bg-research-soft p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6"><p className="research-label">For consumers, makers and product brands</p><ScanLine className="h-6 w-6 text-research-accent ml-3 shrink-0" /></div>
          <h2 className="mb-3">Consumer and brand tools</h2><p className="text-research-muted mb-5">Understand what is in a product, explore ingredient interactions and develop formulations with safety and environmental impact in view.</p>
          <p className="text-sm mb-6">Product scanning · Formulation · Chemical safety · Sustainability</p>
          <a href="#consumer-world" className="research-primary mt-auto">Explore consumer and brand tools<ArrowRight className="h-4 w-4" /></a>
          <Link to="/BarcodeScanner" className="min-h-11 mt-3 flex items-center justify-center text-sm text-research-accent hover:underline">Go to product scanner</Link>
        </article>
        <article className="home-research flex flex-col rounded-xl border border-research-accent bg-research-soft p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6"><p className="research-label">For scientists, computational chemists and R&amp;D teams</p><FlaskConical className="h-6 w-6 text-research-accent ml-3 shrink-0" /></div>
          <h2 className="mb-3">Autonomous research workflows</h2><p className="text-research-muted mb-5">A dedicated computational workspace for sourced compound search, engine-specific workflow preparation and researcher-led review.</p>
          <p className="text-sm mb-6">Computational studio · Scientific databases · Forcefields · Research API</p>
          <a href="#research-world" className="research-primary mt-auto">Explore research workflows<ArrowRight className="h-4 w-4" /></a>
          <Link to="/ResearchDashboard" className="min-h-11 mt-3 flex items-center justify-center text-sm text-research-accent hover:underline">Go to research dashboard</Link>
        </article>
      </div>
    </section>
  );
}