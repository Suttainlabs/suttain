export function planAccess(user) {
  const bypass = user?.role === 'admin' || !!user?.admin_granted_access;
  const access = user?.product_access || [];
  const expiresAt = user?.subscription_end_date ? Date.parse(user.subscription_end_date) : null;
  const paid = !!user && ['active', 'trialing', 'canceling'].includes(user.subscription_status)
    && (expiresAt === null || (Number.isFinite(expiresAt) && expiresAt > Date.now()));
  const research = bypass || (paid && access.includes('research'));
  const core = bypass || research || (paid && (access.includes('core') || (!access.length && ['pro', 'starter', 'lifetime'].includes(user.subscription_plan))));
  return { core, research };
}
export function researchEntitlement(user) {
  if (planAccess(user).research) return null;
  return Response.json({ error: 'Research subscription required', code: 'RESEARCH_REQUIRED', pillar: 'research' }, { status: 403 });
}
export async function reserveUsage(base44, user, type, count = 1) {
  const access = planAccess(user);
  const research = type === 'research';
  if (research ? access.research : access.core) return null;
  const startField = research ? 'research_usage_period_start' : 'usage_period_start';
  const field = research ? 'usage_research_simulations' : type === 'formulas' ? 'usage_formulas' : 'usage_simulations';
  const limit = type === 'formulas' ? 5 : 3;
  const now = new Date().toISOString();
  const active = user[startField]?.slice(0, 7) === now.slice(0, 7);
  const used = active ? (user[field] || 0) : 0;
  if (used + count > limit) return Response.json({ error: 'Monthly limit reached', code: 'MONTHLY_LIMIT', pillar: research ? 'research' : 'core' }, { status: 403 });
  const update = { [startField]: now, [field]: used + count };
  if (!research && !active) {
    update.usage_simulations = type === 'simulations' ? count : 0;
    update.usage_formulas = type === 'formulas' ? count : 0;
    update.usage_scans = 0;
  }
  await base44.auth.updateMe(update);
  return null;
}