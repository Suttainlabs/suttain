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
      subject: 'Welcome to Suttain — Your Free Account Is Ready',
      body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to Suttain</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#02988C,#09D2FF);border-radius:12px 12px 0 0;padding:40px 40px 32px;text-align:center;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:48px;width:auto;margin-bottom:16px;"/>
            <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 8px;">Welcome to Suttain, ${firstName}!</h1>
            <p style="color:rgba(255,255,255,0.9);font-size:15px;margin:0;">Your free account is now active — no credit card required.</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px;">

            <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">We are really glad to have you here. Here is a quick look at what you can do with Suttain:</p>

            <!-- Features -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#f8fafc;border-left:4px solid #02988C;border-radius:6px;padding:14px 16px;margin-bottom:10px;display:block;">
                  <p style="margin:0;font-size:14px;color:#1e293b;"><strong style="color:#02988C;">⚗️ Chemical Simulator</strong><br>Safely test chemical interactions before mixing</p>
                </td>
              </tr>
              <tr><td style="height:8px;"></td></tr>
              <tr>
                <td style="background:#f8fafc;border-left:4px solid #9531F5;border-radius:6px;padding:14px 16px;">
                  <p style="margin:0;font-size:14px;color:#1e293b;"><strong style="color:#9531F5;">🧪 Formula Generator</strong><br>Create professional-grade formulas in seconds</p>
                </td>
              </tr>
              <tr><td style="height:8px;"></td></tr>
              <tr>
                <td style="background:#f8fafc;border-left:4px solid #09D2FF;border-radius:6px;padding:14px 16px;">
                  <p style="margin:0;font-size:14px;color:#1e293b;"><strong style="color:#0891b2;">📱 Quick Scan</strong><br>Scan any product barcode for instant ingredient analysis</p>
                </td>
              </tr>
              <tr><td style="height:8px;"></td></tr>
              <tr>
                <td style="background:#f8fafc;border-left:4px solid #f59e0b;border-radius:6px;padding:14px 16px;">
                  <p style="margin:0;font-size:14px;color:#1e293b;"><strong style="color:#d97706;">🛡️ AI Compliance Co-Pilot</strong><br>Stay aligned with 50+ global regulations</p>
                </td>
              </tr>
            </table>

            <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 28px;">On the free tier, you get <strong>3 simulations, 5 formula generations, and 2 product scans</strong> per month — completely free. Upgrade anytime for unlimited access.</p>

            <!-- Pricing -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:32px;">
              <tr style="background:#f8fafc;">
                <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:14px;color:#1e293b;"><strong>Pro — $4.99/month</strong><br><span style="color:#64748b;">Unlimited access. Cancel anytime.</span></p>
                </td>
              </tr>
              <tr style="background:#ffffff;">
                <td style="padding:12px 16px;">
                  <p style="margin:0;font-size:14px;color:#1e293b;"><strong>Lifetime Access — $99.99 one-time</strong><br><span style="color:#64748b;">Pay once, use Suttain forever. Best value.</span></p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="https://suttain.com" style="display:inline-block;background:linear-gradient(135deg,#02988C,#09D2FF);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;">Get Started on Suttain →</a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1e293b;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">Questions? Reply to this email or reach us at <a href="mailto:contact@suttain.com" style="color:#09D2FF;text-decoration:none;">contact@suttain.com</a></p>
            <p style="color:#64748b;font-size:12px;margin:0;">© ${new Date().getFullYear()} Suttain. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
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