import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Gauge, ChevronRight } from 'lucide-react';
import ResearchProductNav from '@/components/research/ResearchProductNav';

const STUDIO_NAV = [
  { path: '/AtomisticSimulation', label: 'Hub', icon: LayoutGrid },
  { path: '/AtomisticSimulation/Simulations', label: 'Simulations', icon: Gauge },
];

export default function StudioLayout({ children }) {
  const location = useLocation();
  const current = STUDIO_NAV.find(page => page.path === location.pathname);
  return (
    <div className="research-surface min-h-screen">
      <ResearchProductNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-research-muted mb-8">
          <Link to="/ResearchPortal" className="hover:text-research-accent">Research</Link><ChevronRight className="h-3 w-3" />
          <Link to="/AtomisticSimulation" aria-current={current?.label === 'Hub' ? 'page' : undefined} className="hover:text-research-accent">Atomistic Simulation</Link>
          {current?.label === 'Simulations' && <><ChevronRight className="h-3 w-3" /><span aria-current="page">Simulations</span></>}
        </nav>
        {children}
      </div>
    </div>
  );
}