import { useMemo } from 'react';
import { getCurrentUsage, FREE_LIMITS } from '../utils/usageTracker';

export default function useTrialStatus(user) {
  return useMemo(() => {
    if (!user) {
      return { isPro: false, plan: null, isExpired: false, canSimulate: false, canFormulate: false, canScan: false, usage: { simulations: 0, formulas: 0, scans: 0 }, limits: FREE_LIMITS };
    }

    if (user.role === 'admin') {
      return { isPro: true, plan: 'admin', isExpired: false, canSimulate: true, canFormulate: true, canScan: true, usage: null, limits: FREE_LIMITS };
    }

    const plan = user.subscription_plan || 'free';
    if (plan === 'pro' || plan === 'enterprise') {
      return { isPro: true, plan, isExpired: false, canSimulate: true, canFormulate: true, canScan: true, usage: null, limits: FREE_LIMITS };
    }

    // Free tier — check monthly usage
    const usage = getCurrentUsage(user);
    return {
      isPro: false,
      plan: 'free',
      isExpired: false, // free tier never expires, just gets limited
      canSimulate: usage.simulations < FREE_LIMITS.simulations,
      canFormulate: usage.formulas < FREE_LIMITS.formulas,
      canScan: usage.scans < FREE_LIMITS.scans,
      usage,
      limits: FREE_LIMITS,
      daysLeft: 0 // kept for backward compatibility
    };
  }, [user]);
}