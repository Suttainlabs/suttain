import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled (service role) and admin-triggered calls
    let callerIsAdmin = false;
    try {
      const user = await base44.auth.me();
      callerIsAdmin = user?.role === 'admin';
    } catch (_) {
      // Called from automation (no user session) — allow via service role
    }

    const body = await req.json().catch(() => ({}));
    const { manual, targetUserId } = body;

    // If called manually from frontend, require admin
    if (manual && !callerIsAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const now = new Date();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // Fetch all pro users
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const proUsers = allUsers.filter(u => {
      const plan = u.subscription_plan || u.data?.subscription_plan;
      return plan === 'pro' || plan === 'enterprise';
    });

    const results = [];

    for (const u of proUsers) {
      // Skip if targeting a specific user and this isn't them
      if (targetUserId && u.id !== targetUserId) continue;

      const endDateRaw = u.subscription_period_end || u.subscription_end_date ||
                         u.data?.subscription_period_end || u.data?.subscription_end_date;
      if (!endDateRaw) continue;

      const endDate = new Date(endDateRaw);
      const msLeft = endDate - now;
      const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));

      // Only email if expiring within 3 days (1-3 day window)
      // Or if manually triggered for a specific user
      const shouldSend = targetUserId ? true : (daysLeft >= 1 && daysLeft <= 3);
      if (!shouldSend) continue;

      // Deduplication: skip if we already sent a renewal reminder today
      if (!targetUserId) {
        try {
          const todayKey = new Date().toISOString().split('T')[0];
          const existing = await base44.asServiceRole.entities.Notification.filter(
            { target_user: u.email, type: 'subscription' },
            '-created_date',
            5
          );
          const alreadySentToday = existing.find(n =>
            n.metadata?.renewal_reminder === true && n.metadata?.reminder_date === todayKey
          );
          if (alreadySentToday) {
            console.log(`Skipping ${u.email} — reminder already sent today`);
            continue;
          }
        } catch (dedupErr) {
          console.error(`Dedup check failed for ${u.email}:`, dedupErr.message);
        }
      }

      const firstName = (u.full_name || u.email || 'there').split(' ')[0];
      const expiryStr = endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const billing = u.subscription_billing || u.data?.subscription_billing || 'monthly';

      const subject = `⏳ Your Suttain Pro subscription expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;

      const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#02988C,#09D2FF);padding:32px 40px;text-align:center;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" height="40" style="display:block;margin:0 auto 16px;">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Your Pro subscription is ending soon</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">${expiryStr}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="color:#1e293b;font-size:16px;margin:0 0 16px;">Hi ${firstName},</p>
            <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">
              Your <strong>Suttain Pro</strong> subscription (${billing}) will expire in 
              <strong style="color:#02988C;">${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong> on <strong>${expiryStr}</strong>.
              Renew now to keep uninterrupted access to all your tools.
            </p>

            <!-- Feature list -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:28px;">
              <tr><td>
                <p style="color:#166534;font-weight:700;margin:0 0 12px;font-size:14px;">What you'll keep with Pro:</p>
                ${[
                  ['🔬', 'Unlimited Chemical Simulations'],
                  ['⚗️', 'AI Formula Generator — unlimited formulas'],
                  ['📱', 'Barcode Scanner with deep ingredient analysis'],
                  ['🛡️', 'Regulatory Compliance Audit & PDF reports'],
                  ['📊', 'Comparative Impact Reports & sustainability scores'],
                  ['💾', 'Workspace — save & organize all your work'],
                ].map(([icon, text]) => `
                <p style="color:#15803d;margin:0 0 8px;font-size:13px;">${icon} &nbsp;${text}</p>
                `).join('')}
              </td></tr>
            </table>

            <!-- Pricing options -->
            <p style="color:#1e293b;font-weight:700;font-size:15px;margin:0 0 12px;">Choose your renewal plan:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              ${[
                ['Monthly', '$4.99/month', 'Full flexibility, cancel anytime'],
                ['Yearly', '$49.99/year', 'Save 16% — best for regular users (~$4.17/mo)'],
                ['Lifetime', '$99.99 once', 'Pay once, use Suttain forever'],
              ].map(([label, price, desc]) => `
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                  <span style="font-weight:700;color:#1e293b;font-size:14px;">${label}</span>
                  &nbsp;<strong style="color:#02988C;">${price}</strong>
                  <br><span style="color:#64748b;font-size:12px;">${desc}</span>
                </td>
              </tr>
              `).join('')}
            </table>

            <!-- CTA -->
            <div style="text-align:center;margin:32px 0 24px;">
              <a href="https://suttain.com/Pricing" style="display:inline-block;background:linear-gradient(135deg,#02988C,#09D2FF);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 40px;border-radius:50px;box-shadow:0 4px 14px rgba(2,152,140,0.35);">
                Renew My Pro Access →
              </a>
            </div>
            <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
              Questions? Reply to this email or write to <a href="mailto:contact@suttain.com" style="color:#02988C;">contact@suttain.com</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="color:#94a3b8;font-size:11px;margin:0;">
              © ${new Date().getFullYear()} Suttain. All rights reserved.<br>
              <a href="https://suttain.com" style="color:#02988C;text-decoration:none;">suttain.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      const { error: emailError } = await resend.emails.send({
        from: 'Suttain <contact@suttain.com>',
        to: u.email,
        cc: 'contact@suttain.com',
        reply_to: 'contact@suttain.com',
        subject,
        html: htmlBody,
      });

      if (emailError) {
        console.error(`Email failed for ${u.email}:`, emailError);
        results.push({ email: u.email, status: 'failed', error: emailError.message });
      } else {
        console.log(`Pro expiration reminder sent to ${u.email} (${daysLeft} days left)`);
        // Record the reminder so we don't duplicate
        try {
          const todayKey = new Date().toISOString().split('T')[0];
          await base44.asServiceRole.entities.Notification.create({
            title: 'Renewal reminder sent',
            message: `Renewal reminder emailed to ${u.email} (${daysLeft} days left).`,
            type: 'subscription',
            target_user: u.email,
            metadata: { renewal_reminder: true, reminder_date: todayKey, days_left: daysLeft }
          });
        } catch (notifErr) {
          console.error(`Failed to record reminder notification for ${u.email}:`, notifErr.message);
        }
        results.push({ email: u.email, status: 'sent', daysLeft });
      }
    }

    return Response.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('sendProExpirationEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});