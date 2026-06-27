import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@4.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const PLAN_LABELS = {
  starter: 'Suttain Starter',
  pro: 'Suttain Pro',
  academic: 'Suttain Academic',
  lifetime: 'Suttain Lifetime',
};

async function sendEmailViaResend(to, subject, html) {
  try {
    await resend.emails.send({
      from: 'Suttain <contact@suttain.com>',
      to,
      cc: 'contact@suttain.com',
      reply_to: 'contact@suttain.com',
      subject,
      html,
    });
    console.log('Renewal reminder sent to:', to);
  } catch (e) {
    console.error('Resend email failed:', e);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Calculate the date 3 days from now (UTC, date-only)
    const now = new Date();
    const targetDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`Checking for subscriptions ending on ${targetDateStr}`);

    // Query all active, non-canceled, non-lifetime users
    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);

    let sentCount = 0;
    for (const user of users) {
      // Skip users without an end date or with lifetime billing
      if (!user.subscription_end_date || user.subscription_billing === 'lifetime') continue;
      // Skip users already canceling
      if (user.subscription_status === 'canceling' || user.subscription_status === 'canceled') continue;

      const userEndDate = user.subscription_end_date.split('T')[0];
      if (userEndDate !== targetDateStr) continue;

      const planLabel = PLAN_LABELS[user.subscription_plan] || 'Suttain Pro';
      const firstName = (user.full_name || '').split(' ')[0] || 'there';
      const formattedDate = new Date(user.subscription_end_date).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      });

      const html = `
        <div style="margin:0;padding:0;background:#f6fbfa;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6fbfa;margin:0;padding:32px 16px;">
            <tr><td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbeafe;box-shadow:0 16px 40px rgba(2,152,140,0.12);">
                <tr>
                  <td style="background:linear-gradient(135deg,#02988C 0%,#09D2FF 55%,#9531F5 100%);padding:34px 36px;text-align:center;">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:48px;width:auto;margin:0 auto 18px;display:block;" />
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Your ${planLabel} Subscription Renews Soon</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:38px 36px 34px;">
                    <p style="font-size:17px;line-height:1.7;margin:0 0 20px;color:#0f172a;font-weight:600;">Hello ${firstName},</p>
                    <p style="font-size:16px;line-height:1.75;margin:0 0 22px;color:#475569;">This is a friendly reminder that your <strong>${planLabel}</strong> subscription is scheduled to renew on <strong>${formattedDate}</strong>.</p>
                    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:12px;padding:20px 24px;margin:0 0 28px;text-align:center;">
                      <p style="margin:0;font-weight:700;font-size:16px;color:#713f12;">Renewal Date</p>
                      <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#92400e;">${formattedDate}</p>
                    </div>
                    <p style="font-size:16px;line-height:1.75;margin:0 0 14px;color:#475569;">Your subscription will automatically renew and your payment method on file will be charged. No action is needed to continue your access.</p>
                    <p style="font-size:16px;line-height:1.75;margin:0 0 28px;color:#475569;">If you'd like to change or cancel your plan, you can do so from your billing dashboard before the renewal date.</p>
                    <div style="text-align:center;margin:0 0 32px;">
                      <a href="https://suttain.com/BillingDashboard" style="display:inline-block;background:#02988C;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:999px;">Manage Your Subscription</a>
                    </div>
                    <p style="font-size:16px;line-height:1.7;margin:0;color:#0f172a;">Best regards,<br /><strong>The Suttain Team</strong></p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;padding:22px 36px;text-align:center;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">Suttain · Safer chemistry, smarter formulation<br /><a href="https://suttain.com" style="color:#02988C;text-decoration:none;font-weight:600;">suttain.com</a></p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </div>
      `;

      await sendEmailViaResend(user.email, `Your ${planLabel} subscription renews on ${formattedDate}`, html);
      sentCount++;
    }

    console.log(`Renewal reminder complete: ${sentCount} emails sent for subscriptions ending ${targetDateStr}`);
    return Response.json({ success: true, sent: sentCount, targetDate: targetDateStr });
  } catch (error) {
    console.error('sendRenewalReminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});