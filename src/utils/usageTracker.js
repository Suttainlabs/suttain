import { base44 } from '@/api/base44Client';

// Free-tier limits: reset every 7 days (rolling window anchored to usage_period_start)
export const FREE_LIMITS = { simulations: 2, formulas: 5, scans: Infinity };

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Returns true if the user's current 7-day usage window is still active.
 * If the window has expired (or was never started), callers should treat
 * all counters as zero (i.e. limits have reset).
 */
function isUsageWindowActive(user) {
  if (!user?.usage_period_start) return false;
  const start = new Date(user.usage_period_start).getTime();
  return (Date.now() - start) < SEVEN_DAYS_MS;
}

/**
 * Current usage within the active 7-day window.
 * Returns zeros if the window has expired (meaning limits have reset).
 */
export function getCurrentUsage(user) {
  const active = isUsageWindowActive(user);
  return {
    simulations: active ? (user?.usage_simulations || 0) : 0,
    formulas: active ? (user?.usage_formulas || 0) : 0,
    scans: active ? (user?.usage_scans || 0) : 0,
  };
}

/**
 * Increments the usage counter for the given type ('simulations' | 'formulas' | 'scans').
 * Starts a new 7-day window (resetting all counters) if the previous one has expired.
 */
export async function incrementUsage(user, type) {
  const active = isUsageWindowActive(user);
  const now = new Date().toISOString();

  if (!active) {
    // Window expired (or first use), start fresh, reset all counters
    await base44.auth.updateMe({
      usage_period_start: now,
      usage_simulations: type === 'simulations' ? 1 : 0,
      usage_formulas: type === 'formulas' ? 1 : 0,
      usage_scans: type === 'scans' ? 1 : 0,
    });
    return;
  }

  // Window active: just increment the relevant counter
  await base44.auth.updateMe({
    [`usage_${type}`]: (user[`usage_${type}`] || 0) + 1,
  });
}