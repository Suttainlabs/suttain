import { base44 } from '@/api/base44Client';

// Calendar-month budgets, with independent Core and Research windows.
export const FREE_LIMITS = { simulations: 3, formulas: 5, scans: Infinity, researchSimulations: 3 };
const month = value => value ? new Date(value).toISOString().slice(0, 7) : '';
const currentMonth = () => new Date().toISOString().slice(0, 7);
export function getCurrentUsage(user) {
  const coreActive = month(user?.usage_period_start) === currentMonth();
  const researchActive = month(user?.research_usage_period_start) === currentMonth();
  return {
    simulations: coreActive ? (user?.usage_simulations || 0) : 0,
    formulas: coreActive ? (user?.usage_formulas || 0) : 0,
    scans: coreActive ? (user?.usage_scans || 0) : 0,
    researchSimulations: researchActive ? (user?.usage_research_simulations || 0) : 0,
  };
}
export async function incrementUsage(user, type) {
  const latest = await base44.auth.me();
  const usage = getCurrentUsage(latest);
  const now = new Date().toISOString();
  if (type === 'researchSimulations') {
    return base44.auth.updateMe({ research_usage_period_start: now, usage_research_simulations: usage.researchSimulations + 1 });
  }
  return base44.auth.updateMe({
    usage_period_start: now,
    usage_simulations: usage.simulations,
    usage_formulas: usage.formulas,
    usage_scans: usage.scans,
    [`usage_${type}`]: usage[type] + 1,
  });
}