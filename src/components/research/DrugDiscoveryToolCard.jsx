import { Link } from 'react-router-dom';
import { FlaskConical, ArrowUpRight } from 'lucide-react';
export default function DrugDiscoveryToolCard() {
  return <section className="pb-12" aria-labelledby="research-drug-discovery">
    <Link to="/DrugDiscovery" className="grid md:grid-cols-3 gap-6 rounded-xl border border-research-border bg-research-card p-6 sm:p-8 hover:border-research-accent">
      <div><div className="research-icon mb-5"><FlaskConical className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" /></div><h2 id="research-drug-discovery">Drug discovery</h2></div>
      <div className="md:col-span-2"><p className="text-research-muted max-w-xl">Search biological targets using RCSB PDB, ChEMBL, and UniProt, then explore a guided screening pipeline and compare example candidates.</p><p className="text-xs text-research-muted mt-3">Live target data · Local screening demonstration</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-research-accent">Open drug discovery<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span></div>
    </Link>
  </section>;
}