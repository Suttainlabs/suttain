import React from "react";
import { Link } from "react-router-dom";

export default function LandingFinalCta() {
  return (
    <section className="bg-research-soft border-t border-research-border px-4 py-14 sm:px-6 sm:py-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div><p className="research-label mb-3">Your next workflow starts here</p><h2 className="mb-3">Let preparation move faster.<br />Keep judgment with you.</h2><p className="max-w-lg text-research-muted">Open the research workspace, or start with a product on your shelf.</p></div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-3"><Link to="/ResearchDashboard" className="research-primary">Open research dashboard</Link><Link to="/BarcodeScanner" className="research-secondary">Try the product scanner</Link></div>
      </div>
    </section>
  );
}