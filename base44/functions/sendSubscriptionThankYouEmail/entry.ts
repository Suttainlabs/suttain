import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, full_name, plan_name = 'Pro' } = await req.json();

    if (!email || !full_name) {
      return Response.json({ error: 'Missing email or full_name' }, { status: 400 });
    }

    const firstName = full_name.split(' ')[0] || 'there';

    const emailContent = `
      <div style="margin:0;padding:0;background:#f6fbfa;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6fbfa;margin:0;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbeafe;box-shadow:0 16px 40px rgba(2,152,140,0.12);">
                <tr>
                  <td style="background:linear-gradient(135deg,#02988C 0%,#09D2FF 55%,#9531F5 100%);padding:34px 36px;text-align:center;">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:48px;width:auto;margin:0 auto 18px;display:block;" />
                    <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.25;font-weight:700;">Welcome to Suttain Pro</h1>
                    <p style="margin:10px 0 0;color:rgba(255,255,255,0.92);font-size:16px;line-height:1.5;">Your subscription is active and ready to use.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:38px 36px 34px;">
                    <p style="font-size:17px;line-height:1.7;margin:0 0 20px;color:#0f172a;font-weight:600;">Hello ${firstName},</p>
                    <p style="font-size:16px;line-height:1.75;margin:0 0 22px;color:#475569;">Thank you for subscribing to Suttain Pro - we’re excited to welcome you to our community.</p>
                    <p style="font-size:16px;line-height:1.75;margin:0 0 18px;color:#475569;">You now have access to a powerful suite of features designed to enhance your workflow:</p>
                    <div style="background:#f0fdfa;border:1px solid #b2f5ea;border-radius:14px;padding:22px 24px;margin:0 0 30px;">
                      <ul style="font-size:15px;line-height:1.9;margin:0;padding-left:20px;color:#334155;">
                        <li>Unlimited Chemical Simulations</li>
                        <li>Unlimited Formula Generation</li>
                        <li>AI Compliance Co-Pilot (50+ regions)</li>
                        <li>Sustainability and Carbon Footprint Scoring</li>
                        <li>Computational Simulations (DFT, Molecular Dynamics, Quantum Mechanics)</li>
                        <li>Advanced Analytics and Reporting</li>
                        <li>Personalized Safety Alerts</li>
                        <li>Priority Email Support</li>
                      </ul>
                    </div>
                    <h2 style="font-size:20px;line-height:1.4;margin:0 0 12px;color:#0f172a;">Getting Started</h2>
                    <p style="font-size:16px;line-height:1.75;margin:0 0 14px;color:#475569;">To begin using your Pro features, navigate to the Tools section within your account and run your first simulation.</p>
                    <p style="font-size:16px;line-height:1.75;margin:0 0 24px;color:#475569;">Our Learning Center offers comprehensive tutorials and guides to help you get the most out of your subscription.</p>
                    <div style="text-align:center;margin:0 0 32px;">
                      <a href="https://suttain.com/Simulator" style="display:inline-block;background:#02988C;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:999px;">Start Your First Simulation</a>
                    </div>
                    <h2 style="font-size:20px;line-height:1.4;margin:0 0 12px;color:#0f172a;">Support and Assistance</h2>
                    <p style="font-size:16px;line-height:1.75;margin:0 0 14px;color:#475569;">If you have any questions or need help, feel free to reach out:</p>
                    <p style="font-size:16px;line-height:1.75;margin:0 0 6px;color:#475569;">Email: <a href="mailto:contact@suttain.com" style="color:#02988C;text-decoration:underline;font-weight:600;">contact@suttain.com</a></p>
                    <p style="font-size:16px;line-height:1.75;margin:0 0 26px;color:#475569;">Live chat: Available in the application</p>
                    <p style="font-size:16px;line-height:1.75;margin:0 0 28px;color:#475569;">We’re committed to helping you succeed with Suttain Pro.</p>
                    <p style="font-size:16px;line-height:1.7;margin:0;color:#0f172a;">Best regards,<br /><strong>The Suttain Team</strong></p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;padding:22px 36px;text-align:center;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">Suttain · Safer chemistry, smarter formulation<br /><a href="https://suttain.com" style="color:#02988C;text-decoration:none;font-weight:600;">suttain.com</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `.trim();

    const res = await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Welcome to Suttain Pro — Thank You for Subscribing`,
      body: emailContent,
      from_name: 'Suttain'
    });

    console.log(`Subscription thank you email sent to ${email}`);

    // CC contact@suttain.com
    try {
      await base44.integrations.Core.SendEmail({
        to: 'contact@suttain.com',
        subject: `[CC] Welcome to Suttain Pro — Thank You for Subscribing`,
        body: emailContent,
        from_name: 'Suttain'
      });
    } catch (ccErr) {
      console.error('Failed to send CC email:', ccErr);
    }

    return Response.json({ success: true, email });
  } catch (error) {
    console.error('Error sending subscription thank you email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});