import React from 'react';
import { Link } from 'react-router-dom';
import { Database, SlidersHorizontal, Layers, ArrowUpRight } from 'lucide-react';
const updates = [
  { icon: Database, title: 'Search across scientific databases', detail: 'Switch between PubChem, ChEMBL, ChEBI, ChemSpider and Suttain DB, or search across them with All. Results retain their source label.' },
  { icon: SlidersHorizontal, title: 'Bring your own forcefield', detail: 'Select built-in or saved parameters, upload a forcefield file, or create custom parameters. Use them once or save them to your library.' },
  { icon: Layers, title: 'One simulation studio', detail: 'Configure, prepare and track workflows across five compute fields, including quantum chemistry and QM/MM, with engine selection and reusable presets.' }
];
export default function LatestResearch() {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20" aria-labelledby="latest-title">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-end gap-5 mb-8"><div><p className="research-label mb-3">02 / Latest in research</p><h2 id="latest-title">Less setup. More control over the work.</h2></div><Link to="/ResearchPortal" className="inline-flex min-h-11 items-center gap-2 text-sm text-research-accent hover:underline">Explore the research portal<ArrowUpRight className="h-4 w-4" /></Link></div>
        <div className="grid gap-5 md:grid-cols-3">
          {updates.map(({ icon: Icon, title, detail }) => <Link key={title} to="/ResearchPortal" className="group rounded-xl border border-research-border bg-research-page p-6 transition-colors hover:border-research-accent"><Icon className="h-5 w-5 text-research-accent mb-6" strokeWidth={1.5} /><h3 className="mb-3">{title}</h3><p className="text-sm text-research-muted">{detail}</p><span className="mt-6 inline-flex items-center gap-2 text-sm text-research-accent">Explore workflow tools<ArrowUpRight className="h-4 w-4" /></span></Link>)}
        </div>
      </div>
    </section>
  );
}