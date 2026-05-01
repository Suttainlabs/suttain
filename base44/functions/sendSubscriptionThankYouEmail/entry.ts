import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, full_name, plan_name = 'Pro' } = await req.json();

    if (!email || !full_name) {
      return Response.json({ error: 'Missing email or full_name' }, { status: 400 });
    }

    const emailContent = `
Dear ${full_name},

Thank you for subscribing to Suttain Pro. We are delighted to welcome you to our platform and look forward to supporting your success.

YOUR PREMIUM FEATURES

Your subscription now includes access to the following capabilities:

• Unlimited Chemical Simulations
• Unlimited Formula Generation
• AI Compliance Co-Pilot (50+ regions)
• Sustainability and Carbon Footprint Scoring
• Computational Simulations (DFT, Molecular Dynamics, Quantum Mechanics)
• Advanced Analytics and Reporting
• Personalized Safety Alerts
• Priority Email Support

GETTING STARTED

To begin using your new Pro features, please navigate to the Tools section within your account and run your first simulation. Our comprehensive Learning Center provides detailed tutorials and guides to help you maximize your investment in Suttain Pro.

SUPPORT AND ASSISTANCE

Should you have any questions or require technical assistance, our dedicated support team is available to help. You may reach us at contact@suttain.com or utilize the live chat feature available within the application.

We are committed to ensuring your success and would be pleased to address any inquiries you may have.

Sincerely,

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