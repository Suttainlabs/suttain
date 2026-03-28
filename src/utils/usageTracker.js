import { base44 } from '@/api/base44Client';

export const FREE_LIMITS = { simulations: 3, formulas: 5, scans: 2 };

export function getCurrentUsage(user) {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  if (!user?.usage_month || user.usage_month !== currentMonth) {
    return { simulations: 0, formulas: 0, scans: 0 };
  }
  return {
    simulations: user.usage_simulations || 0,
    formulas: user.usage_formulas || 0,
    scans: user.usage_scans || 0
  };
}

export async function incrementUsage(user, type) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const isNewMonth = !user.usage_month || user.usage_month !== currentMonth;

  const updates = { usage_month: currentMonth };

  if (isNewMonth) {
    updates.usage_simulations = type === 'simulations' ? 1 : 0;
    updates.usage_formulas = type === 'formulas' ? 1 : 0;
    updates.usage_scans = type === 'scans' ? 1 : 0;
  } else {
    updates[`usage_${type}`] = (user[`usage_${type}`] || 0) + 1;
  }

  await base44.auth.updateMe(updates);
}