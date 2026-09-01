import { useMemo } from 'react';
import { getCurrentUsage, FREE_LIMITS } from '../utils/usageTracker';

export default function useTrialStatus(user) {
  return useMemo(() => {
    if (!user) {
      return { isPro: false, plan: null, pillar: null, hasCoreAccess: false, hasResearchAccess: false, isExpired: false, canSimulate: false, canFormulate: false, canScan: false, usage: { simulations: 0, formulas: 0, scans: 0 }, limits: FREE_LIMITS };
    }

    if (user.role === 'admin') {
      return { isPro: true, plan: 'admin', pillar: 'admin', hasCoreAccess: true, hasResearchAccess: true, isExpired: false, canSimulate: true, canFormulate: true, canScan: true, usage: null, limits: FREE_LIMITS };
    }

    // Admin-granted temporary full access
    if (user.admin_granted_access) {
      return { isPro: true, plan: 'admin_granted', pillar: 'admin', hasCoreAccess: true, hasResearchAccess: true, isExpired: false, canSimulate: true, canFormulate: true, canScan: true, usage: null, limits: FREE_LIMITS };
    }

    // Paid access is scoped to the pillars the user purchased (product_access).
    // Legacy "pro" subscribers without product_access default to Core.
    const plan = user.subscription_plan || 'free';
    const productAccess = user.product_access || [];
    const hasCoreAccess = productAccess.includes('core') || (plan === 'pro' && productAccess.length === 0);
    const hasResearchAccess = productAccess.includes('research');
    const pillar = hasResearchAccess ? 'research' : hasCoreAccess ? 'core' : null;

    if (plan === 'pro' || plan === 'enterprise') {
      return {
        isPro: hasCoreAccess || hasResearchAccess,
        plan,
        pillar,
        hasCoreAccess,
        hasResearchAccess,
        isExpired: false,
        canSimulate: hasCoreAccess,
        canFormulate: hasCoreAccess,
        canScan: hasCoreAccess,
        usage: null,
        limits: FREE_LIMITS,
      };
    }

    // Free tier: check weekly (7-day rolling window) usage
    const usage = getCurrentUsage(user);
    return {
      isPro: false,
      plan: 'free',
      pillar: null,
      hasCoreAccess: false,
      hasResearchAccess: false,
      isExpired: false, // free tier never expires, just gets limited
      canSimulate: usage.simulations < FREE_LIMITS.simulations,
      canFormulate: usage.formulas < FREE_LIMITS.formulas,
      canScan: true, // Quick Scan is free for all users
      usage,
      limits: FREE_LIMITS,
      daysLeft: 0 // kept for backward compatibility
    };
  }, [user]);
}