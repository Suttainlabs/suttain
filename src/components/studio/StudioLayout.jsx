import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Gauge, ChevronRight } from 'lucide-react';

const STUDIO_NAV = [
  { path: '/ComputationalStudio', label: 'Hub', icon: LayoutGrid },
  { path: '/ComputationalStudio/Simulations', label: 'Simulations', icon: Gauge },
];

export default function StudioLayout({ children }) {
  const location = useLocation();
  const current = STUDIO_NAV.find(page => page.path === location.pathname);
  return (
    <div className="research-surface min-h-screen">
      <div className="sticky top-14 z-30 border-b border-research-border bg-research-page">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-5 py-3">
          <Link to="/ComputationalStudio" className="flex items-center gap-2 text-sm font-medium"><LayoutGrid className="h-4 w-4 text-research-accent" /><span>Computational studio</span></Link>
          <span className="hidden sm:block h-5 w-px bg-research-border" />
          <nav aria-label="Studio navigation" className="flex items-center gap-1">
            {STUDIO_NAV.map(({ path, label, icon: Icon }) => <Link key={path} to={path} aria-current={location.pathname === path ? 'page' : undefined} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${location.pathname === path ? 'bg-research-soft text-research-accent' : 'text-research-muted hover:text-research-text'}`}><Icon className="h-3.5 w-3.5" />{label}</Link>)}
          </nav>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-research-muted mb-8">
          <Link to="/ResearchPortal" className="hover:text-research-accent">Research</Link><ChevronRight className="h-3 w-3" />
          <Link to="/ComputationalStudio" aria-current={current?.label === 'Hub' ? 'page' : undefined} className="hover:text-research-accent">Computational studio</Link>
          {current?.label === 'Simulations' && <><ChevronRight className="h-3 w-3" /><span aria-current="page">Simulations</span></>}
        </nav>
        {children}
      </div>
    </div>
  );
}