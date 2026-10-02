import React from 'react';
import { Link } from 'react-router-dom';
import { Gauge, ArrowRight } from 'lucide-react';

export default function ResearchAccessNotice() {
  return (
    <div className="max-w-lg mx-auto my-12 rounded-xl border border-research-border bg-research-card p-8">
      <div className="research-icon mb-6"><Gauge className="h-5 w-5" /></div>
      <p className="research-label mb-3">Computational simulations</p>
      <h2 className="mb-4">Pro feature</h2>
      <p className="text-research-muted">Computational simulations require a Pro subscription. Configure QM/MM, advanced quantum chemistry and materials calculations.</p>
      <Link to="/Pricing" className="research-primary mt-7">Upgrade to Pro<ArrowRight className="w-4 h-4" /></Link>
    </div>
  );
}