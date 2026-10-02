import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Gauge, ChevronRight } from 'lucide-react';

export default function SimulationDashboardHeader({ user }) {
  return (
    <header className="border-b border-research-border pb-8 mb-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 research-label mb-8">
        <Link to="/ResearchPortal" className="hover:text-research-accent">Research</Link><ChevronRight className="h-3 w-3" /><span aria-current="page">Research dashboard</span>
      </nav>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="max-w-2xl"><p className="research-label mb-3">Research workspace</p>
          <div className="flex items-center gap-3 mb-4"><Gauge className="h-6 w-6 text-research-accent" strokeWidth={1.5} /><h1>Research dashboard</h1></div>
          <p className="text-research-muted">{user.full_name?.split(' ')[0] ? `Welcome back, ${user.full_name.split(' ')[0]}. ` : ''}Track Atomistic Simulation workflows and Drug Design jobs, and revisit saved candidate shortlists.</p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0"><Link to="/AtomisticSimulation" className="research-primary"><Plus className="h-4 w-4" />New simulation</Link><Link to="/DrugDesign" className="research-secondary">Drug Design<Plus className="h-4 w-4" /></Link></div>
      </div>
    </header>
  );
}