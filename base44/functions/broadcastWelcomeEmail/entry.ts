import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const subscriptionEmailHtml = (firstName) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Suttain Subscription Plans</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#02988C,#09D2FF);border-radius:12px 12px 0 0;padding:40px 40px 32px;text-align:center;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:48px;width:auto;margin-bottom:16px;"/>
            <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 8px;">Suttain Subscription and Plan Options</h1>
            <p style="color:rgba(255,255,255,0.9);font-size:15px;margin:0;">Everything you need to know about your Suttain plan</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:36px 40px;">
            <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">Thank you for being part of Suttain${firstName && firstName !== 'there' ? ', ' + firstName : ''}. Below is a full breakdown of the subscription tiers available to you on the Suttain platform.</p>
            <h2 style="color:#1e293b;font-size:17px;margin:0 0 12px;">Suttain Free Tier</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;overflow:hidden;">
              <tr><td style="padding:14px 16px;background:#f8fafc;"><ul style="margin:0;padding-left:20px;color:#334155;font-size:14px;line-height:1.9;"><li>3 chemical simulations per month</li><li>5 formula generations per month</li><li>2 product scans per month</li><li>Access to the Suttain Ingredient Database (250,000+ chemicals)</li><li>Basic dashboard and formula history</li></ul></td></tr>
            </table>
            <h2 style="color:#1e293b;font-size:17px;margin:0 0 12px;">Suttain Pro Plan - $4.99/month</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;overflow:hidden;">
              <tr><td style="padding:14px 16px;background:#f8fafc;"><ul style="margin:0;padding-left:20px;color:#334155;font-size:14px;line-height:1.9;"><li>Unlimited Chemical Simulations on Suttain</li><li>Unlimited Formula Generations</li><li>Suttain Compliance Co-Pilot (global regulatory checks across 50+ regions)</li><li>Personalized Suttain Safety Profiles for health conditions and allergies</li><li>Sustainability Scoring and Eco Certifications</li><li>Formula Comparison and PDF Export</li><li>Priority support from the Suttain team</li></ul></td></tr>
            </table>
            <h2 style="color:#1e293b;font-size:17px;margin:0 0 12px;">Suttain Lifetime Access - $99.99 one-time</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;overflow:hidden;">
              <tr><td style="padding:14px 16px;background:#f8fafc;"><p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">Pay once and access Suttain forever. All Pro features included with no recurring charges. This is the best value option for long-term users of the Suttain platform.</p></td></tr>
            </table>
            <h2 style="color:#1e293b;font-size:17px;margin:0 0 12px;">Suttain Enterprise API Access <span style="font-size:12px;background:#ede9fe;color:#7c3aed;padding:2px 8px;border-radius:20px;margin-left:6px;">Coming Soon</span></h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:32px;overflow:hidden;">
              <tr><td style="padding:14px 16px;background:#f8fafc;"><p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">Integrate Suttain directly into your enterprise systems. Suttain's Enterprise API will offer bulk chemical analysis, white-label options, and dedicated account management for teams and organizations.</p></td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><a href="https://suttain.com" style="display:inline-block;background:linear-gradient(135deg,#02988C,#09D2FF);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;">Explore Suttain Plans</a></td></tr></table>
            <p style="color:#334155;font-size:14px;line-height:1.7;margin:32px 0 0;">For any questions about Suttain pricing or plans, contact us at <a href="mailto:contact@suttain.com" style="color:#02988C;">contact@suttain.com</a>.</p>
            <p style="color:#1e293b;font-size:14px;margin:24px 0 0;">Warm regards,<br/><strong>Suttain Product Development</strong></p>
          </td>
        </tr>
        <tr>
          <td style="background:#1e293b;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">This email was sent by Suttain. Questions? Contact us at <a href="mailto:contact@suttain.com" style="color:#09D2FF;text-decoration:none;">contact@suttain.com</a></p>
            <p style="color:#64748b;font-size:12px;margin:0;">2026 Suttain. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin only
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await base44.asServiceRole.entities.User.list();
    console.log(`Broadcasting to ${users.length} users...`);

    const results = [];
    for (const u of users) {
      if (!u.email) continue;
      const firstName = (u.full_name || '').split(' ')[0] || 'there';
      try {
        // Email 1: Welcome / Free Account — invoke sendWelcomeEmail which sends both emails
        await base44.asServiceRole.functions.invoke('sendWelcomeEmail', { email: u.email, full_name: u.full_name || '' });
        console.log(`Sent both emails to: ${u.email}`);
        results.push({ email: u.email, status: 'sent' });
      } catch (err) {
        console.error(`Failed for ${u.email}: ${err.message}`);
        results.push({ email: u.email, status: 'failed', error: err.message });
      }
    }

    return Response.json({ success: true, total: users.length, results });
  } catch (error) {
    console.error('Broadcast failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});