import { Link } from 'react-router-dom';
import { FlaskConical, ArrowUpRight } from 'lucide-react';
export default function DrugDesignToolCard() {
  return <section className="pb-12" aria-labelledby="research-drug-discovery">
    <Link to="/DrugDesign" className="grid md:grid-cols-3 gap-6 rounded-xl border border-research-border bg-research-card p-6 sm:p-8 hover:border-research-accent">
      <div><div className="research-icon mb-5"><FlaskConical className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" /></div><h2 id="research-drug-discovery">Drug Design</h2></div>
      <div className="md:col-span-2"><p className="text-research-muted max-w-xl">Find biological targets in RCSB PDB, ChEMBL, and UniProt. Explore screening methods, compare illustrative candidates, and save a personal shortlist for further investigation.</p><p className="text-xs text-research-muted mt-3">Live target records · Illustrative candidate scores · Experimental validation required</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-research-accent">Open Drug Design<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span></div>
    </Link>
  </section>;
}