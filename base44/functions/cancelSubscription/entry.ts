import Stripe from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeSubscriptionId = user.stripe_subscription_id;

    if (!stripeSubscriptionId) {
      return Response.json({ error: 'No active subscription found' }, { status: 400 });
    }

    // Cancel at period end, user keeps access until billing cycle ends
    const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    const accessUntil = new Date(subscription.current_period_end * 1000).toISOString();

    // Update user record to reflect pending cancellation
    await base44.asServiceRole.entities.User.update(user.id, {
      subscription_status: 'canceling',
      subscription_cancel_at: accessUntil,
    });

    // Send cancellation confirmation email
    try {
      const accessUntilFormatted = new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      });
      const firstName = (user.full_name || '').split(' ')[0] || 'there';
      const planLabel = (user.subscription_plan || 'pro').charAt(0).toUpperCase() + (user.subscription_plan || 'pro').slice(1);

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        from_name: 'Suttain',
        subject: 'Your Suttain subscription has been cancelled',
        body: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#475569,#1e293b);border-radius:12px 12px 0 0;padding:40px;text-align:center;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:44px;margin-bottom:16px;"/>
            <h1 style="color:#fff;margin:0 0 8px;font-size:24px;">Subscription Cancelled</h1>
            <p style="color:rgba(255,255,255,0.75);margin:0;font-size:15px;">We're sorry to see you go</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:36px 40px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
            <p style="font-size:16px;color:#1e293b;">Hi ${firstName},</p>
            <p style="color:#475569;font-size:15px;line-height:1.6;">We've received your cancellation request. Your ${planLabel} subscription will not renew, and you will <strong>not be charged again</strong>.</p>

            <div style="background:#fef9c3;border:1px solid #fde047;border-radius:12px;padding:20px 24px;margin:24px 0;text-align:center;">
              <p style="margin:0 0 6px;font-weight:700;font-size:16px;color:#713f12;">You keep full ${planLabel} access until:</p>
              <p style="margin:0;font-size:22px;font-weight:800;color:#92400e;">${accessUntilFormatted}</p>
            </div>

            <p style="color:#475569;font-size:14px;line-height:1.6;">After ${accessUntilFormatted}, your account will automatically revert to the free tier. Your saved formulas, simulations, and workspace data will remain accessible.</p>

            <p style="color:#475569;font-size:14px;line-height:1.6;">If you change your mind, you can resubscribe anytime from your profile page.</p>

            <div style="text-align:center;margin:28px 0 24px;">
              <a href="https://suttain.com/Pricing" style="display:inline-block;background:linear-gradient(135deg,#02988C,#09D2FF);color:#fff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 32px;border-radius:50px;">Resubscribe Anytime</a>
            </div>

            <p style="color:#94a3b8;font-size:13px;text-align:center;border-top:1px solid #f1f5f9;padding-top:16px;margin:0;">
              Questions? <a href="mailto:contact@suttain.com" style="color:#02988C;">contact@suttain.com</a>
            </p>
          </td>
        </tr>
        <tr><td style="text-align:center;padding:16px 0;">
          <p style="color:#cbd5e1;font-size:12px;margin:0;">© ${new Date().getFullYear()} Suttain. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
      });
      // CC contact@suttain.com
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: 'contact@suttain.com',
          from_name: 'Suttain',
          subject: `[CC] Subscription cancelled, ${user.email}`,
          body: `<p>Cancellation email sent to ${user.email}.</p><p>Plan: ${planLabel}</p><p>Access until: ${accessUntilFormatted}</p>`
        });
      } catch (ccErr) {
        console.error('Failed to send CC email:', ccErr);
      }
    } catch (emailErr) {
      console.error('Failed to send cancellation email:', emailErr);
    }

    console.log(`Subscription ${stripeSubscriptionId} set to cancel at period end for user ${user.id}`);
    return Response.json({ success: true, access_until: accessUntil });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});