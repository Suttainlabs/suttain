import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Called from entity automation: payload has event + data
    const userData = body.data || body;
    const email = userData.email;
    const fullName = userData.full_name || '';
    const firstName = fullName.split(' ')[0] || 'there';

    if (!email) {
      console.error('No email found in payload:', JSON.stringify(body));
      return Response.json({ error: 'No email in payload' }, { status: 400 });
    }

    console.log(`Sending welcome email to: ${email}`);

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
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

    console.log(`Welcome email sent successfully to: ${email}`);

    // Also notify admin
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'contact@suttain.com',
      subject: 'New User Signup on Suttain',
      body: `A new user has signed up on Suttain!\n\nName: ${fullName || 'N/A'}\nEmail: ${email}\nDate: ${new Date().toLocaleString()}\n\nLog in to your admin dashboard to view more details.`
    });

    return Response.json({ success: true, email });
  } catch (error) {
    console.error('Failed to send welcome email:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});