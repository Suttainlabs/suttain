import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Lock, FlaskConical, ArrowRight } from 'lucide-react';
import AuthContext from '@/components/auth/AuthContext';

// Wraps Research-only pages. Core subscribers (product_access: ['core'])
// see a lock screen instead of the tool, so they cannot reach the Research
// platform. Admins and users with the 'research' pillar pass through.
export default function ResearchGuard({ children }) {
  const { user, isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-research-border border-t-research-accent rounded-full animate-spin" />
      </div>
    );
  }

  const hasResearchAccess =
    user?.role === 'admin' ||
    user?.admin_granted_access ||
    (user?.product_access || []).includes('research');

  if (hasResearchAccess) return <>{children}</>;

  return (
    <div className="research-surface min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full rounded-xl border border-research-border bg-research-card p-8 text-center">
        <div className="inline-flex items-center gap-2 text-research-accent font-mono text-xs mb-6">
          <FlaskConical className="w-3.5 h-3.5" />
          Suttain Research
        </div>
        <div className="research-icon mx-auto mb-5">
          <Lock className="w-5 h-5 text-research-accent" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          This tool is part of Sustain research
        </h1>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          Your Research free plan includes 3 simulations per month. Computational Studio, structural biology, chemical comparison, and DFT/MD runs require the Sustain research plan.
        </p>
        <Link
          to="/Pricing"
          className="research-primary"
        >
          Get research <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}