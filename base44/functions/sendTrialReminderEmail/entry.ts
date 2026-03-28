import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { Resend } from 'npm:resend@4.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { daysLeft, userEmail, userName } = await req.json();
    const firstName = userName?.split(' ')[0] || 'there';
    const emailTo = userEmail || user.email;

    const isExpiringSoon = daysLeft <= 3;
    const subject = isExpiringSoon
      ? `⚠️ Your Suttain free trial expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!`
      : `Your Suttain 14-day free trial — ${daysLeft} days remaining`;

    const body = isExpiringSoon
      ? `Hi ${firstName},

Your 14-day free trial of Suttain is ending in just ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!

Don't lose access to the tools you've been using:

🔬 Chemical Simulator — Test interactions before mixing
⚗️ Formula Generator — Build professional formulas in seconds
📱 Barcode Scanner — Instantly analyze any product's ingredients
🛡️ AI Compliance Co-Pilot — Stay compliant across 50+ regions

Choose the plan that works for you:

✅ Monthly Plan — $4.99/month
   Pay month-to-month with full flexibility.

✅ Yearly Plan — $49.99/year (Save 16% vs monthly!)
   Best value for regular users. ~$4.17/month.

✅ Lifetime Access — $250 one-time payment
   Pay once. Use Suttain forever. Best long-term value.

👉 Subscribe now: https://suttain.com/Pricing

Questions? Reply to this email or contact us at contact@suttain.com.

The Suttain Team`
      : `Hi ${firstName},

You have ${daysLeft} days left in your 14-day free trial of Suttain!

We hope you're enjoying:
🔬 Chemical Simulator
⚗️ Formula Generator
📱 Quick Scan (Barcode Scanner)
🛡️ AI Compliance Co-Pilot

When you're ready to continue, our plans start at just $4.99/month:

💡 Monthly — $4.99/month
💡 Yearly — $49.99/year (save 16%!)
💡 Lifetime — $250 one-time (pay once, use forever)

👉 View Plans: https://suttain.com/Pricing

The Suttain Team`;

    const { data, error } = await resend.emails.send({
      from: 'Suttain <contact@suttain.com>',
      to: emailTo,
      subject,
      text: body,
    });

    if (error) {
      console.error('Resend error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log('Trial reminder email sent:', data);
    return Response.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error('sendTrialReminderEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});