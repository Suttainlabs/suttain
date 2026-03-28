import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin only
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await base44.asServiceRole.entities.User.list();
    console.log(`Sending welcome email to ${users.length} users...`);

    const results = [];
    for (const u of users) {
      if (!u.email) continue;
      const firstName = (u.full_name || '').split(' ')[0] || 'there';
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          from_name: 'Suttain',
          subject: 'Welcome to Suttain — Your 14-Day Free Trial Has Begun',
          body: `Hi ${firstName},

Welcome to Suttain. We are glad to have you on board.

Your 14-day free trial is now active — no credit card required. Here is what you can explore:

- Chemical Simulator: Safely test chemical interactions before mixing
- Formula Generator: Create professional-grade formulas in seconds
- Quick Scan: Scan any product barcode for instant ingredient analysis
- AI Compliance Co-Pilot: Stay compliant across 50+ global regulations

Your trial gives you full access to every feature for 14 days, completely free.

When your trial ends, choose the plan that fits you best:

  Monthly Plan — $4.99/month
  Full access, billed monthly. Cancel anytime.

  Yearly Plan — $49.99/year (save 16% vs. monthly)
  Approximately $4.17/month. Best value for regular users.

  Lifetime Access — $250 one-time payment
  Pay once. Use Suttain indefinitely.

Explore freely for 14 days and upgrade whenever you are ready.

Get started: https://suttain.com

If you have any questions, reply to this email or contact us at contact@suttain.com.

Best regards,
The Suttain Team`
        });
        console.log(`Sent to: ${u.email}`);
        results.push({ email: u.email, status: 'sent' });
      } catch (err) {
        console.error(`Failed for ${u.email}: ${err.message}`);
        results.push({ email: u.email, status: 'failed', error: err.message });
      }
    }

    return Response.json({ success: true, total: users.length, results });
  } catch (error) {
    console.error('Broadcast failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});