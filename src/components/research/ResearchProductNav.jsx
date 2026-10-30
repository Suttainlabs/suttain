import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FlaskConical, LayoutDashboard } from 'lucide-react';
import { RESEARCH_PRODUCTS } from '@/components/research/researchProducts';

const ATOMISTIC_PATHS = ['/AtomisticSimulation', '/SimulationRunner'];

// Shared top bar for Research: the portal plus the three connected products.
export default function ResearchProductNav() {
  const { pathname } = useLocation();
  const isActive = p => p.id === 'atomistic' ? ATOMISTIC_PATHS.some(x => pathname.startsWith(x)) : pathname.startsWith(p.route);
  return (
    <div className="sticky top-14 z-30 border-b border-research-border bg-research-page/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-3 sm:gap-5 py-2.5 overflow-x-auto no-scrollbar">
        <Link to="/ResearchPortal" aria-current={pathname === '/ResearchPortal' ? 'page' : undefined} className="shrink-0 flex items-center gap-2 text-sm font-medium text-research-text"><FlaskConical className="h-4 w-4 text-research-accent" /><span>Research</span></Link>
        <span className="hidden sm:block h-5 w-px bg-research-border shrink-0" />
        <nav aria-label="Research tools" className="flex items-center gap-1">
          {RESEARCH_PRODUCTS.map(p => {
            const Icon = p.icon; const active = isActive(p);
            return (
              <Link key={p.id} to={p.route} aria-current={active ? 'page' : undefined}
                className={`shrink-0 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-research-soft text-research-accent font-medium' : 'text-research-muted hover:text-research-text'}`}>
                <span className="font-mono text-[11px] opacity-70">{p.step}</span><Icon className="h-3.5 w-3.5" />{p.name}
              </Link>
            );
          })}
          <Link to="/ResearchDashboard" aria-current={pathname === '/ResearchDashboard' ? 'page' : undefined}
            className={`shrink-0 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${pathname === '/ResearchDashboard' ? 'bg-research-soft text-research-accent font-medium' : 'text-research-muted hover:text-research-text'}`}>
            <LayoutDashboard className="h-3.5 w-3.5" />My workspace
          </Link>
        </nav>
      </div>
    </div>
  );
}

// "Next step" card used at the end of a result to move to the connected tool.
export function NextStepLink({ to, step, title, text }) {
  return (
    <Link to={to} className="group flex items-start gap-3 rounded-lg border border-research-border bg-research-card p-4 transition-colors hover:border-research-accent">
      <span className="font-mono text-xs text-research-accent mt-0.5">{step}</span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-research-text group-hover:text-research-accent">{title} →</span><span className="block text-xs text-research-muted mt-0.5">{text}</span></span>
    </Link>
  );
}
