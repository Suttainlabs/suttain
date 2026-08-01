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
        <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const hasResearchAccess =
    user?.role === 'admin' ||
    user?.admin_granted_access ||
    (user?.product_access || []).includes('research');

  if (hasResearchAccess) return <>{children}</>;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4" style={{ background: '#F7F6F2' }}>
      <div className="max-w-xl w-full text-center">
        <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <FlaskConical className="w-3.5 h-3.5" />
          Suttain Research
        </div>
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center">
          <Lock className="w-6 h-6" style={{ color: '#534AB7' }} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          This tool is part of the Research plan
        </h1>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          Computational Studio, molecular intelligence, and structural biology require a Suttain Research subscription. Your Core plan covers the consumer safety and formulation tools.
        </p>
        <Link
          to="/Pricing"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ background: '#534AB7' }}
        >
          Upgrade to Research <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}