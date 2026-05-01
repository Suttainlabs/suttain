import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, full_name, plan_name = 'Pro' } = await req.json();

    if (!email || !full_name) {
      return Response.json({ error: 'Missing email or full_name' }, { status: 400 });
    }

    const emailContent = `
Hello ${full_name},

Thank you for subscribing to Suttain ${plan_name}! 🎉

We're excited to have you on board. You now have access to:
- Unlimited Chemical Simulations
- Unlimited Formula Generation
- AI Compliance Co-Pilot (50+ regions)
- Sustainability & Carbon Footprint Scoring
- Computational Simulations (DFT, MD, QM)
- And much more!

Get started by heading to the Tools section and running your first simulation.

If you have any questions or need help, reach out to us at contact@suttain.com or use the live chat in the app.

Happy formulating! 🧪

Best regards,
The Suttain Team
https://suttain.com
    `.trim();

    const res = await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Welcome to Suttain ${plan_name}! 🎉 Thank You for Subscribing`,
      body: emailContent,
      from_name: 'Suttain'
    });

    console.log(`Subscription thank you email sent to ${email}`);
    return Response.json({ success: true, email });
  } catch (error) {
    console.error('Error sending subscription thank you email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});