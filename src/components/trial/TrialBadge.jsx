import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Crown, Zap } from 'lucide-react';

export default function TrialBadge({ trialStatus }) {
  if (!trialStatus || trialStatus.plan === 'admin') return null;

  if (trialStatus.isPro) {
    return (
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-300 rounded-lg px-3 py-1.5">
        <Crown className="w-4 h-4 text-violet-600" />
        <span className="text-violet-800 font-semibold text-sm capitalize">Pro</span>
      </div>
    );
  }

  // Free tier — show usage summary
  const { usage, limits } = trialStatus;
  const anyLimitReached = !trialStatus.canSimulate || !trialStatus.canFormulate || !trialStatus.canScan;

  return (
    <Link
      to={createPageUrl("Pricing")}
      className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 transition-colors ${
        anyLimitReached
          ? 'bg-orange-100 border-orange-300 hover:bg-orange-200'
          : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
      }`}
    >
      <Zap className={`w-4 h-4 ${anyLimitReached ? 'text-orange-500' : 'text-slate-500'}`} />
      <span className={`font-semibold text-xs ${anyLimitReached ? 'text-orange-700' : 'text-slate-600'}`}>
        {anyLimitReached ? 'Limit Reached' : 'Free Tier'}
      </span>
    </Link>
  );
}