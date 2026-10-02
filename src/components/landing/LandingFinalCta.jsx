import React from "react";
import { Link } from "react-router-dom";

export default function LandingFinalCta() {
  return (
    <section className="border-t border-research-border px-4 py-14 sm:px-6 sm:py-20">
      <div className="max-w-6xl mx-auto"><div className="text-center mb-8"><p className="research-label mb-3">Choose your workspace</p><h2>Two paths. Your next step.</h2></div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="home-consumer rounded-xl border border-research-border bg-research-soft p-6"><h3 className="mb-3">For consumers and brands</h3><p className="text-research-muted mb-5">Start with a product, an ingredient or a formulation.</p><Link to="/BarcodeScanner" className="research-primary w-full">Try the product scanner</Link></div>
          <div className="home-research rounded-xl border border-research-border bg-research-soft p-6"><h3 className="mb-3">For researchers and R&amp;D teams</h3><p className="text-research-muted mb-5">Start with a molecular system or a calculation.</p><Link to="/ResearchDashboard" className="research-primary w-full">Open research dashboard</Link></div>
        </div>
      </div>
    </section>
  );
}