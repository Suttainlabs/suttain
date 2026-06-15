import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { Resend } from 'npm:resend';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Fetch all registered users
    const users = await base44.asServiceRole.entities.User.list();
    const emails = users.filter(u => u.email).map(u => u.email);

    if (emails.length === 0) {
      return Response.json({ sent: 0, message: 'No users found.' });
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>What's New in Suttain — June 2026</title>
</head>
<body style="margin:0;padding:0;background:#F0FAF5;font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FAF5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,40,30,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#007850 0%,#0D9E8E 60%,#6366f1 100%);padding:36px 40px 32px;">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
                   alt="Suttain" height="36" style="display:block;margin-bottom:20px;" />
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);">June 2026 Platform Update</p>
              <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;line-height:1.25;">
                Suttain is now a full molecular intelligence OS
              </h1>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.7;">
                We have shipped a major set of updates to the platform. Here is everything that is new and ready to use today.
              </p>
            </td>
          </tr>

          <!-- Updates list -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0D9E8E;">New tools launched</p>

              ${[
                {
                  title: "Molecule Explorer — 3D structure viewer",
                  desc: "Browse every chemical in your database in 3D. Structures are fetched live from PubChem with a full property panel covering physical, toxicity, and environmental data.",
                  color: "#0D9E8E",
                  url: "https://app.suttain.com/MoleculeExplorer",
                },
                {
                  title: "Chemical Intelligence Dashboard",
                  desc: "Six professional charts visualize your chemical database — molecular weight distributions, safety level breakdowns, category rankings, LogP scatter plots, and data coverage radar.",
                  color: "#6366f1",
                  url: "https://app.suttain.com/ChemicalDashboard",
                },
                {
                  title: "Research Portal — unified research hub",
                  desc: "One page that connects every research tool: Molecular Intelligence, Computational Simulations, Formula Intelligence, Sustainability scoring, Research API, and SDS Analyzer.",
                  color: "#007850",
                  url: "https://app.suttain.com/ResearchPortal",
                },
                {
                  title: "Research API — REST endpoints with SDKs",
                  desc: "Developer-facing REST API for compound lookup, hazard scoring, interaction checking, and formula generation. Python and JavaScript SDK examples included.",
                  color: "#6366f1",
                  url: "https://app.suttain.com/APIPortal",
                },
              ].map(item => `
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border-left:3px solid ${item.color};background:#F9FAFB;border-radius:0 10px 10px 0;">
                  <tr>
                    <td style="padding:14px 18px;">
                      <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;">${item.title}</p>
                      <p style="margin:0 0 10px;font-size:13px;color:#6B7280;line-height:1.6;">${item.desc}</p>
                      <a href="${item.url}" style="font-size:12px;font-weight:700;color:${item.color};text-decoration:none;">Open tool &rarr;</a>
                    </td>
                  </tr>
                </table>
              `).join('')}
            </td>
          </tr>

          <!-- Homepage redesign note -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6366f1;">Also updated</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #6366f1;background:#F9FAFB;border-radius:0 10px 10px 0;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;">Homepage redesigned</p>
                    <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">
                      The homepage now reflects all 12 tools across three categories: Core Safety Tools, Research Portal, and Advanced Simulation. New entrants are clearly marked so you can find what's new at a glance.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:36px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#007850,#0D9E8E);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:18px;font-weight:800;color:#ffffff;">Ready to explore?</p>
                    <p style="margin:0 0 20px;font-size:13px;color:rgba(255,255,255,0.75);">All new tools are live and free to access from your account.</p>
                    <a href="https://app.suttain.com/ResearchPortal"
                       style="display:inline-block;background:#ffffff;color:#007850;font-size:14px;font-weight:700;padding:12px 28px;border-radius:100px;text-decoration:none;">
                      Open Research Portal
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F0FAF5;padding:24px 40px;border-top:1px solid #D9EDE5;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;color:#9CA3AF;">
                You are receiving this because you have an account on Suttain.
              </p>
              <p style="margin:0;font-size:11px;color:#9CA3AF;">
                &copy; ${new Date().getFullYear()} Suttain. All rights reserved.
                &nbsp;|&nbsp;
                <a href="https://app.suttain.com" style="color:#0D9E8E;text-decoration:none;">suttain.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    let sent = 0;
    let failed = 0;
    const errors = [];

    // Send in batches of 10 to avoid rate limits
    const BATCH = 10;
    for (let i = 0; i < emails.length; i += BATCH) {
      const batch = emails.slice(i, i + BATCH);
      await Promise.all(batch.map(async (email) => {
        try {
          await resend.emails.send({
            from: 'Suttain <noreply@suttain.com>',
            to: email,
            subject: "What's new in Suttain — June 2026 Platform Update",
            html,
          });
          sent++;
        } catch (e) {
          failed++;
          errors.push({ email, error: e.message });
        }
      }));
      // Small delay between batches
      if (i + BATCH < emails.length) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    console.log(`Platform update email: sent=${sent}, failed=${failed}`);
    return Response.json({ sent, failed, total: emails.length, errors });
  } catch (error) {
    console.error('sendPlatformUpdateEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});