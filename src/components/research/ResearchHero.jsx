import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2 } from 'lucide-react';
import AuthContext from '@/components/auth/AuthContext';

export default function ResearchHero() {
  const { user } = useContext(AuthContext);
  return (
    <section className="grid grid-cols-12 gap-8 border-b border-research-border py-12 sm:py-16 lg:py-20">
      <div className="col-span-12 lg:col-span-8">
        <h1 className="max-w-xl mb-5">Atomistic Simulation and Drug Design. One research workspace.</h1>
        <p className="max-w-xl text-research-muted leading-relaxed">Study molecular systems with Atomistic Simulation, or explore biological targets and candidate shortlists with Drug Design. Configure workflows, inspect source records, and keep assumptions in view—from your first question to a reviewable research record.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to={user ? '/ResearchDashboard' : '/AtomisticSimulation'} className="research-primary">
            {user ? 'Open research dashboard' : 'Open Atomistic Simulation'}<ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#research-api" className="research-secondary"><Code2 className="h-4 w-4" />Explore the API</a>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 flex items-center lg:justify-end">
        <div className="flex lg:flex-col gap-5 lg:gap-4 lg:items-start">
          <div aria-hidden="true" className="h-28 w-28 rounded-xl border border-research-border bg-research-card p-4 flex flex-col justify-between">
            <span className="font-mono text-xs text-research-muted">00 / Research</span>
            <span className="text-4xl font-medium text-research-accent leading-none">Rp</span>
          </div>
          <div className="text-sm text-research-muted leading-relaxed"><p className="font-mono text-xs mb-2">05 compute fields</p><p>Chemistry · Quantum chemistry</p><p>Materials science</p><p>Biochemistry · Biophysics</p></div>
        </div>
      </div>
    </section>
  );
}