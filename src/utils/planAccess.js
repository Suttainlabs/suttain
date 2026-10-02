export function getPlanAccess(user) {
  const bypass = user?.role === 'admin' || !!user?.admin_granted_access;
  const access = user?.product_access || [];
  const paid = !!user && !['none', 'canceled', 'unpaid', 'past_due', 'incomplete', 'incomplete_expired'].includes(user.subscription_status);
  const hasResearchAccess = bypass || (paid && access.includes('research'));
  const legacyCore = access.length === 0 && ['pro', 'starter', 'lifetime'].includes(user?.subscription_plan);
  const hasCoreAccess = bypass || hasResearchAccess || (paid && (access.includes('core') || legacyCore));
  return { hasCoreAccess, hasResearchAccess };
}