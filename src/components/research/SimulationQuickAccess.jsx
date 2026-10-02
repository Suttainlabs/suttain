import React from 'react';
import { Link } from 'react-router-dom';
import { Atom, Zap, Beaker, Dna, Activity, ArrowUpRight } from 'lucide-react';
import { DOMAIN_TAGS, DOMAIN_DESCRIPTIONS } from '@/pages/ComputationalSimulation';

const ICONS = { Chemistry: Atom, 'Quantum Chemistry': Zap, 'Materials Science': Beaker, Biochemistry: Dna, Biophysics: Activity };
const sentenceCase = value => value.charAt(0) + value.slice(1).toLowerCase();
export default function SimulationQuickAccess() {
  return (
    <aside className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6">
      <p className="research-label mb-2">Quick access</p><h2 className="!text-lg mb-5">Research tools</h2>
      <div className="divide-y divide-research-border">
        {DOMAIN_TAGS.map(domain => {
          const Icon = ICONS[domain];
          return <Link key={domain} to={`/AtomisticSimulation?domain=${encodeURIComponent(domain)}`} className="group flex items-start gap-3 py-4 first:pt-0 last:pb-0">
            <Icon className="h-4 w-4 shrink-0 mt-1 text-research-accent" strokeWidth={1.5} />
            <div className="min-w-0"><h3 className="!text-sm group-hover:text-research-accent mb-1">{sentenceCase(domain)}</h3><p className="text-xs text-research-muted leading-relaxed">{DOMAIN_DESCRIPTIONS[domain]}</p></div>
            <ArrowUpRight className="h-4 w-4 shrink-0 mt-1 ml-auto text-research-muted group-hover:text-research-accent" />
          </Link>;
        })}
        <Link to="/DrugDesign" className="group flex items-start gap-3 py-4"><Beaker className="h-4 w-4 shrink-0 mt-1 text-research-accent" aria-hidden="true" /><div className="min-w-0"><h3 className="!text-sm mb-1 group-hover:text-research-accent">Drug Design</h3><p className="text-xs text-research-muted">Live target search and guided screening demonstration.</p></div><ArrowUpRight className="h-4 w-4 shrink-0 mt-1 ml-auto text-research-muted" aria-hidden="true" /></Link>
      </div>
    </aside>
  );
}