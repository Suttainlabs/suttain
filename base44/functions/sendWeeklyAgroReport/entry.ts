import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const oneWeekAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const buildReportHtml = (farmerName, sessions, yields, farms) => {
  const sessionCount = sessions.length;
  const yieldCount = yields.length;
  const totalYield = yields.reduce((sum, y) => sum + (y.yield_amount || 0), 0);
  const yieldUnit = yields[0]?.yield_unit || 'kg';

  const sessionRows = sessions.slice(0, 5).map(s => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #475569;">${formatDate(s.created_date)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 600; text-transform: capitalize;">${s.session_type || 'chat'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #475569;">${(s.question || '').slice(0, 60)}${(s.question || '').length > 60 ? '...' : ''}</td>
    </tr>
  `).join('');

  const yieldRows = yields.slice(0, 10).map(y => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 600;">${y.crop || 'Unknown crop'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #4A7C2A; font-weight: 700;">${y.yield_amount || 0} ${y.yield_unit || 'kg'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #475569;">${y.harvest_date ? formatDate(y.harvest_date) : 'N/A'}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #4A7C2A 0%, #007850 100%); padding: 30px 24px; color: white;">
        <h1 style="margin: 0; font-size: 22px;">Your Weekly Farm Report</h1>
        <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Hi ${farmerName}, here's your Suttain Farm summary for the past 7 days.</p>
      </div>
      <div style="padding: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 28px; font-weight: bold; color: #4A7C2A;">${sessionCount}</div>
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Advisory Sessions</div>
          </div>
          <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 28px; font-weight: bold; color: #007850;">${yieldCount}</div>
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Harvests Logged</div>
          </div>
          <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 28px; font-weight: bold; color: #00A8C8;">${totalYield.toLocaleString()}</div>
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Total ${yieldUnit}</div>
          </div>
        </div>

        ${farms.length > 0 ? `
        <div style="background: #f0f9f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #1e293b; font-size: 14px;"><strong>Active farms:</strong> ${farms.map(f => f.farm_name || f.primary_crop || 'Unnamed').join(', ')}</p>
        </div>` : ''}

        ${sessions.length > 0 ? `
        <h2 style="color: #1e293b; font-size: 16px; margin-bottom: 8px;">Recent Advisory Sessions</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 10px; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase;">Date</th>
              <th style="padding: 10px; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase;">Type</th>
              <th style="padding: 10px; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase;">Question</th>
            </tr>
          </thead>
          <tbody>${sessionRows}</tbody>
        </table>` : `<div style="background: #fef9f0; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px; margin-bottom: 24px;"><p style="margin: 0; color: #92400e; font-size: 14px;">No advisory sessions this week. Start a chat or photo diagnosis anytime in Suttain Farm.</p></div>`}

        ${yields.length > 0 ? `
        <h2 style="color: #1e293b; font-size: 16px; margin-bottom: 8px;">Crop Yield Progress</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 10px; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase;">Crop</th>
              <th style="padding: 10px; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase;">Amount</th>
              <th style="padding: 10px; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase;">Harvest Date</th>
            </tr>
          </thead>
          <tbody>${yieldRows}</tbody>
        </table>` : `<div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 16px; margin-bottom: 24px;"><p style="margin: 0; color: #065f46; font-size: 14px;">No harvests logged this week. Record your yields in Suttain Farm to track progress.</p></div>`}

        <div style="text-align: center; margin-top: 24px;">
          <a href="https://suttain.com/AgroDashboard" style="display: inline-block; background: linear-gradient(135deg, #4A7C2A, #007850); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Open Suttain Farm</a>
        </div>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 24px; text-align: center;">You're receiving this because you have a Suttain Farm farmer profile. — Suttain Farm</p>
      </div>
    </div>
  `;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only when invoked manually (scheduled runs bypass auth)
    if (req.method !== 'POST' || !req.headers.get('authorization')) {
      // Allow scheduled invocations (no auth header) but block direct browser access
    } else {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    const cutoff = oneWeekAgo();
    const farmers = await base44.asServiceRole.entities.Farmer.list(null, 500);

    // Build a map of user IDs to emails
    const users = await base44.asServiceRole.entities.User.list(null, 500);
    const userEmails = {};
    for (const u of users) {
      if (u.email) userEmails[u.id] = u.email;
    }

    let sent = 0;
    let skipped = 0;

    for (const farmer of farmers) {
      const email = userEmails[farmer.created_by_id];
      if (!email) {
        skipped++;
        continue;
      }

      // Fetch this farmer's farms, sessions, and yields from the past week
      const [farms, allSessions, allYields] = await Promise.all([
        base44.asServiceRole.entities.Farm.filter({ farmer_id: farmer.id }),
        base44.asServiceRole.entities.AdvisorySession.filter({ farmer_id: farmer.id }),
        base44.asServiceRole.entities.CropYield.filter({ farmer_id: farmer.id }),
      ]);

      const recentSessions = allSessions.filter(s => new Date(s.created_date) >= cutoff);
      const recentYields = allYields.filter(y => new Date(y.harvest_date || y.created_date) >= cutoff);

      // Skip farmers with no activity at all this week
      if (recentSessions.length === 0 && recentYields.length === 0) {
        skipped++;
        continue;
      }

      const farmerName = farmer.name?.split(' ')[0] || 'there';
      const html = buildReportHtml(farmerName, recentSessions, recentYields, farms);

      const { error } = await resend.emails.send({
        from: 'Suttain Farm <noreply@suttain.com>',
        to: email,
        reply_to: 'contact@suttain.com',
        subject: `Your Weekly Farm Report — ${recentSessions.length} sessions, ${recentYields.length} harvests`,
        html,
      });

      if (error) {
        console.error(`Failed to send to ${email}:`, error.message);
        skipped++;
      } else {
        sent++;
        console.log(`Weekly agro report sent to ${email}`);
      }
    }

    return Response.json({ success: true, sent, skipped, totalFarmers: farmers.length });
  } catch (error) {
    console.error('sendWeeklyAgroReport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});