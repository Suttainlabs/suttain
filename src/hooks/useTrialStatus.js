import { useMemo } from 'react';

const TRIAL_DURATION_DAYS = 14;

export default function useTrialStatus(user) {
  return useMemo(() => {
    if (!user) return { isActive: false, daysLeft: 0, isExpired: true, plan: null };

    // Admins always have full access
    if (user.role === 'admin') return { isActive: true, daysLeft: 999, isExpired: false, plan: 'admin' };

    // Paid users always have access
    const plan = user.subscription_plan || 'trial';
    if (plan === 'pro' || plan === 'enterprise') {
      return { isActive: true, daysLeft: 999, isExpired: false, plan };
    }

    // Trial users - check trial_start_date
    const trialStart = user.trial_start_date || user.created_date;
    if (!trialStart) return { isActive: true, daysLeft: TRIAL_DURATION_DAYS, isExpired: false, plan: 'trial' };

    const startDate = new Date(trialStart);
    const now = new Date();
    const diffMs = now - startDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, TRIAL_DURATION_DAYS - diffDays);
    const isExpired = daysLeft <= 0;

    return {
      isActive: !isExpired,
      daysLeft,
      isExpired,
      plan: 'trial',
      trialStart: trialStart
    };
  }, [user]);
}