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
// Usage is counted on the server when a metered feature runs. The usage
// fields are write-protected on the User record, so the browser no longer
// writes them; this stays as a harmless no-op for existing callers.
export async function incrementUsage() {
  return null;
}