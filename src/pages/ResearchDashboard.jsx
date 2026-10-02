import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Lock, Loader2 } from 'lucide-react';
import SimulationDashboardWorkspace from '@/components/research/SimulationDashboardWorkspace';

export default function ResearchDashboard() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => { setUser(null); setAuthChecked(true); }, 4000);
    base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => { clearTimeout(timeout); setAuthChecked(true); });
    return () => clearTimeout(timeout);
  }, []);
  if (!authChecked) return <div role="status" className="min-h-screen research-surface flex items-center justify-center gap-2 text-research-muted"><Loader2 className="h-5 w-5 animate-spin" />Loading your workspace...</div>;
  if (!user) return (
    <div className="min-h-screen research-surface flex items-center justify-center px-4 py-12">
      <section className="max-w-xl w-full text-center bg-research-card border border-research-border rounded-xl p-6 sm:p-8">
        <div className="research-icon bg-research-soft mx-auto mb-5"><Lock className="h-5 w-5" strokeWidth={1.5} /></div>
        <h1 className="mb-4">Your simulation workspace</h1>
        <p className="text-research-muted mb-7">Sign in to configure computational simulations and track your quantum chemistry, materials and biomolecular workflows.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center"><Link to="/login?returnTo=%2FResearchDashboard" className="research-secondary">Sign in</Link><Link to="/register?returnTo=%2FResearchDashboard" className="research-primary">Sign up free</Link></div>
      </section>
    </div>
  );
  return <div className="min-h-screen research-surface"><SimulationDashboardWorkspace user={user} /></div>;
}