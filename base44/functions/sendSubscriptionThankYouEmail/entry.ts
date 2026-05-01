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

Thank you for subscribing to Suttain Pro. We are excited to welcome you to our community.

You now have access to the following features:

- Unlimited Chemical Simulations
- Unlimited Formula Generation
- AI Compliance Co-Pilot (50+ regions)
- Sustainability and Carbon Footprint Scoring
- Computational Simulations (DFT, Molecular Dynamics, Quantum Mechanics)
- Advanced Analytics and Reporting
- Personalized Safety Alerts
- Priority Email Support

Getting Started

To begin using your new Pro features, navigate to the Tools section within your account and run your first simulation. Our learning center provides comprehensive tutorials and guides to help you maximize your investment.

Support and Assistance

If you have any questions or require assistance, please reach out to our support team at contact@suttain.com or use the live chat feature available in the application.

We are committed to helping you succeed with Suttain Pro.

Best regards,
The Suttain Team
https://suttain.com
    `.trim();

    const res = await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Welcome to Suttain Pro — Thank You for Subscribing`,
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