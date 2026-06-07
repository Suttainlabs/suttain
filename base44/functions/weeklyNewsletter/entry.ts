import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const WEEKLY_UPDATES = [
  'Improved chemical simulation accuracy with updated reaction databases',
  'New sustainability scoring for carbon footprint calculations',
  'Enhanced formula generator with AI-powered ingredient suggestions',
  'Expanded ingredient database to 250k+ chemicals with new eco-impact data',
  'Faster barcode scanning with improved product recognition',
];

const BLOG_URL = 'https://suttain.com/Blog';

function getWeeklyNewsletterHtml(firstName, updates) {
  const week = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Suttain Weekly Update</title>
</head>
<body style="margin:0;padding:0;background:#EDF7F2;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EDF7F2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,40,30,0.10);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#007850 0%,#00A8C8 100%);padding:36px 32px;text-align:center;">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" height="40" style="margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;" />
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Weekly Update</h1>
              <p style="color:rgba(255,255,255,0.80);margin:8px 0 0;font-size:14px;">${week}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 32px 16px;">
              <p style="color:#00281E;font-size:16px;margin:0 0 8px;font-weight:600;">Hi ${firstName},</p>
              <p style="color:#464646;font-size:15px;line-height:1.7;margin:0;">
                Here is a look at what has been updated and improved on Suttain this week. We are constantly working to make your formulation and chemical safety experience better.
              </p>
            </td>
          </tr>

          <!-- Updates -->
          <tr>
            <td style="padding:16px 32px;">
              <h2 style="color:#00281E;font-size:17px;font-weight:700;margin:0 0 16px;border-bottom:2px solid #D9EDE5;padding-bottom:10px;">What Is New This Week</h2>
              ${updates.map(u => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td width="28" valign="top" style="padding-top:2px;">
                    <div style="width:22px;height:22px;background:#00B478;border-radius:50%;display:flex;align-items:center;justify-content:center;">
                      <span style="color:#fff;font-size:13px;font-weight:700;line-height:22px;display:block;text-align:center;">&#10003;</span>
                    </div>
                  </td>
                  <td style="padding-left:10px;">
                    <p style="color:#464646;font-size:14px;line-height:1.6;margin:0;">${u}</p>
                  </td>
                </tr>
              </table>
              `).join('')}
            </td>
          </tr>

          <!-- Blog CTA -->
          <tr>
            <td style="padding:16px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FAF5;border-radius:12px;border:1px solid #D9EDE5;">
                <tr>
                  <td style="padding:24px 28px;">
                    <h3 style="color:#00281E;font-size:16px;font-weight:700;margin:0 0 8px;">Read the Latest on Our Blog</h3>
                    <p style="color:#464646;font-size:14px;line-height:1.6;margin:0 0 20px;">Dive deeper into chemical sustainability, formulation tips, and industry insights from the Suttain team.</p>
                    <a href="${BLOG_URL}" style="display:inline-block;background:linear-gradient(135deg,#007850,#00A8C8);color:#ffffff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.2px;">Read the Blog</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#00281E;padding:24px 32px;text-align:center;">
              <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0 0 6px;">Suttain &mdash; Chemical Safety &amp; Sustainability Platform</p>
              <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;">
                You are receiving this because you have a Suttain account.
                Questions? <a href="mailto:contact@suttain.com" style="color:#00B478;text-decoration:none;">contact@suttain.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch ALL users via pagination (default list() only returns 50)
    let users = [];
    let page = 0;
    const pageSize = 100;
    while (true) {
      const batch = await base44.asServiceRole.entities.User.list('created_date', pageSize, page * pageSize);
      if (!batch || batch.length === 0) break;
      users = users.concat(batch);
      if (batch.length < pageSize) break;
      page++;
    }

    if (users.length === 0) {
      return Response.json({ success: true, message: 'No users found', sent: 0 });
    }

    console.log(`Total users fetched: ${users.length}`);

    const updates = WEEKLY_UPDATES;
    let sent = 0;
    let failed = 0;

    for (const user of users) {
      if (!user.email) continue;
      const firstName = user.full_name?.split(' ')[0] || 'there';
      try {
        await resend.emails.send({
          from: 'Suttain <noreply@suttain.com>',
          to: [user.email],
          subject: `Suttain Weekly Update - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
          html: getWeeklyNewsletterHtml(firstName, updates),
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err.message);
        failed++;
      }
    }

    console.log(`Weekly newsletter: sent=${sent}, failed=${failed}, total=${users.length}`);
    return Response.json({ success: true, sent, failed, total: users.length });
  } catch (error) {
    console.error('weeklyNewsletter error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});