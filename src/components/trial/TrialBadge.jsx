import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Clock, Crown } from 'lucide-react';

export default function TrialBadge({ trialStatus }) {
  if (!trialStatus || trialStatus.plan === 'admin') return null;

  if (trialStatus.plan === 'pro' || trialStatus.plan === 'enterprise') {
    return (
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-300 rounded-lg px-3 py-1.5">
        <Crown className="w-4 h-4 text-violet-600" />
        <span className="text-violet-800 font-semibold text-sm capitalize">{trialStatus.plan}</span>
      </div>
    );
  }

  // Trial user
  if (trialStatus.isExpired) {
    return (
      <Link to={createPageUrl("Pricing")} className="flex items-center gap-1.5 bg-red-100 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-200 transition-colors">
        <Clock className="w-4 h-4 text-red-600" />
        <span className="text-red-700 font-semibold text-sm">Trial Expired</span>
      </Link>
    );
  }

  const urgency = trialStatus.daysLeft <= 3;

  return (
    <Link to={createPageUrl("Pricing")} className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 transition-colors ${
      urgency 
        ? 'bg-orange-100 border-orange-300 hover:bg-orange-200' 
        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    }`}>
      <Clock className={`w-4 h-4 ${urgency ? 'text-orange-600' : 'text-blue-500'}`} />
      <span className={`font-semibold text-sm ${urgency ? 'text-orange-700' : 'text-blue-700'}`}>
        {trialStatus.daysLeft}d left
      </span>
    </Link>
  );
}