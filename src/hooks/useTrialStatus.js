import { getCurrentUsage, FREE_LIMITS } from '@/utils/usageTracker';
import { getPlanAccess } from '@/utils/planAccess';

export default function useTrialStatus(user) {
  const { hasCoreAccess, hasResearchAccess } = getPlanAccess(user);
  const usage = getCurrentUsage(user);
  const canSimulateCore = !!user && (hasCoreAccess || usage.simulations < FREE_LIMITS.simulations);
  return {
    isPro: hasCoreAccess || hasResearchAccess,
    plan: user?.role === 'admin' ? 'admin' : user?.subscription_plan || 'free',
    pillar: hasResearchAccess ? 'research' : hasCoreAccess ? 'core' : null,
    hasCoreAccess, hasResearchAccess, usage, limits: FREE_LIMITS,
    isExpired: false, daysLeft: 0,
    canSimulate: canSimulateCore, canSimulateCore,
    canFormulate: !!user && (hasCoreAccess || usage.formulas < FREE_LIMITS.formulas),
    canRunResearchSim: !!user && (hasResearchAccess || usage.researchSimulations < FREE_LIMITS.researchSimulations),
    canScan: true,
  };
}