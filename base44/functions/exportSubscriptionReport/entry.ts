import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function escapeCSV(value) {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
}

function toCSV(rows, headers) {
  const headerRow = headers.join(',');
  const dataRows = rows.map(row => headers.map(h => escapeCSV(row[h])).join(','));
  return [headerRow, ...dataRows].join('\n');
}

function getTrialStatus(user) {
  const plan = user.subscription_plan;
  if (plan && plan !== 'trial') return plan;
  if (!user.trial_start_date) return 'trial_unknown';
  const trialStart = new Date(user.trial_start_date);
  const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000);
  const now = new Date();
  if (now > trialEnd) return 'trial_expired';
  const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
  return `trial_active (${daysLeft}d left)`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const users = await base44.asServiceRole.entities.User.filter({}, '-created_date', null, false, [
      'id', 'full_name', 'email', 'role', 'subscription_plan',
      'trial_start_date', 'reward_points', 'created_date'
    ]);

    const headers = [
      'user_id', 'full_name', 'email', 'role',
      'subscription_status', 'subscription_plan',
      'trial_start_date', 'trial_end_date',
      'reward_points', 'signup_date'
    ];

    const rows = users.map(u => {
      const trialStart = u.trial_start_date ? new Date(u.trial_start_date) : null;
      const trialEnd = trialStart ? new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000) : null;
      return {
        user_id: u.id,
        full_name: u.full_name || '',
        email: u.email || '',
        role: u.role || 'user',
        subscription_status: getTrialStatus(u),
        subscription_plan: u.subscription_plan || 'trial',
        trial_start_date: trialStart ? trialStart.toISOString().split('T')[0] : '',
        trial_end_date: trialEnd ? trialEnd.toISOString().split('T')[0] : '',
        reward_points: u.reward_points || 0,
        signup_date: u.created_date ? new Date(u.created_date).toISOString().split('T')[0] : ''
      };
    });

    const csv = toCSV(rows, headers);
    const filename = `suttain_subscription_report_${new Date().toISOString().split('T')[0]}.csv`;

    console.log(`Exported subscription report: ${rows.length} users`);

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Error exporting subscription report:', error);
    return new Response(JSON.stringify({ error: 'Failed to export subscription report.' }), { status: 500 });
  }
});