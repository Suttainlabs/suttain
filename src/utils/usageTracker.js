import { base44 } from '@/api/base44Client';

export const FREE_LIMITS = { simulations: 2, formulas: 5, scans: Infinity }; // scans are free for all

export function getCurrentUsage(user) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const isCurrentMonth = user?.usage_month === currentMonth;
  return {
    simulations: user?.lifetime_simulations || 0,
    formulas: isCurrentMonth ? (user?.usage_formulas || 0) : 0,
    scans: isCurrentMonth ? (user?.usage_scans || 0) : 0,
  };
}

export async function incrementUsage(user, type) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const isNewMonth = !user.usage_month || user.usage_month !== currentMonth;

  const updates = { usage_month: currentMonth };

  if (type === 'simulations') {
    updates.lifetime_simulations = (user.lifetime_simulations || 0) + 1;
  } else if (isNewMonth) {
    updates.usage_formulas = type === 'formulas' ? 1 : 0;
    updates.usage_scans = type === 'scans' ? 1 : 0;
  } else {
    updates[`usage_${type}`] = (user[`usage_${type}`] || 0) + 1;
  }

  await base44.auth.updateMe(updates);
}