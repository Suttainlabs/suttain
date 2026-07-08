import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const BLOG_URL = 'https://suttain.com/Blog';

function getMonthlyNewsletterHtml(firstName, updates, monthLabel) {
  const updatesHtml = updates.length > 0
    ? updates.map(u => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td width="28" valign="top" style="padding-top:2px;">
                    <div style="width:22px;height:22px;background:#00B478;border-radius:50%;display:flex;align-items:center;justify-content:center;">
                      <span style="color:#fff;font-size:13px;font-weight:700;line-height:22px;display:block;text-align:center;">&#10003;</span>
                    </div>
                  </td>
                  <td style="padding-left:10px;">
                    <p style="color:#00281E;font-size:15px;font-weight:600;margin:0 0 4px;">${u.title}</p>
                    <p style="color:#464646;font-size:14px;line-height:1.6;margin:0;">${u.description}</p>
                    ${u.url ? `<a href="${u.url}" style="color:#007850;font-size:13px;font-weight:600;text-decoration:none;margin-top:4px;display:inline-block;">Learn more &rarr;</a>` : ''}
                  </td>
                </tr>
              </table>`).join('')
    : `<p style="color:#464646;font-size:14px;line-height:1.6;margin:0;">No new updates were published this month. Explore our existing tools and features on the Suttain platform.</p>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Suttain Monthly Update</title>
</head>
<body style="margin:0;padding:0;background:#EDF7F2;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EDF7F2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,40,30,0.10);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#007850 0%,#00A8C8 100%);padding:36px 32px;text-align:center;">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" height="48" style="margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;background:#ffffff;padding:8px 16px;border-radius:10px;" />
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Monthly Update</h1>
              <p style="color:rgba(255,255,255,0.80);margin:8px 0 0;font-size:14px;">${monthLabel}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 32px 16px;">
              <p style="color:#00281E;font-size:16px;margin:0 0 8px;font-weight:600;">Hi ${firstName},</p>
              <p style="color:#464646;font-size:15px;line-height:1.7;margin:0;">
                Here are the latest features, tools, and improvements shipped on Suttain this month.
              </p>
            </td>
          </tr>

          <!-- Updates -->
          <tr>
            <td style="padding:16px 32px;">
              <h2 style="color:#00281E;font-size:17px;font-weight:700;margin:0 0 16px;border-bottom:2px solid #D9EDE5;padding-bottom:10px;">What Is New This Month</h2>
              ${updatesHtml}
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

          <!-- Follow Us -->
          <tr>
            <td style="padding:16px 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FAF5;border-radius:12px;border:1px solid #D9EDE5;">
                <tr>
                  <td style="padding:24px 28px;text-align:center;">
                    <h3 style="color:#00281E;font-size:15px;font-weight:700;margin:0 0 6px;">Follow Suttain</h3>
                    <p style="color:#464646;font-size:13px;margin:0 0 18px;">Stay up to date with the latest news, tips, and updates.</p>
                    <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
                      <tr>
                        <td style="padding:0 4px;"><a href="https://www.linkedin.com/company/suttainlabs/" style="display:inline-block;background:#ffffff;color:#007850;font-size:13px;font-weight:700;padding:10px 18px;border-radius:24px;text-decoration:none;border:1px solid #D9EDE5;">LinkedIn</a></td>
                        <td style="padding:0 4px;"><a href="https://www.instagram.com/suttainlabs/" style="display:inline-block;background:#ffffff;color:#007850;font-size:13px;font-weight:700;padding:10px 18px;border-radius:24px;text-decoration:none;border:1px solid #D9EDE5;">Instagram</a></td>
                        <td style="padding:0 4px;"><a href="https://www.youtube.com/channel/UCOgVoog8K35lkY9VCsNWqAg" style="display:inline-block;background:#ffffff;color:#007850;font-size:13px;font-weight:700;padding:10px 18px;border-radius:24px;text-decoration:none;border:1px solid #D9EDE5;">YouTube</a></td>
                        <td style="padding:0 4px;"><a href="https://x.com/suttain" style="display:inline-block;background:#ffffff;color:#007850;font-size:13px;font-weight:700;padding:10px 18px;border-radius:24px;text-decoration:none;border:1px solid #D9EDE5;">X</a></td>
                        <td style="padding:0 4px;"><a href="https://www.tiktok.com/@suttainlabs" style="display:inline-block;background:#ffffff;color:#007850;font-size:13px;font-weight:700;padding:10px 18px;border-radius:24px;text-decoration:none;border:1px solid #D9EDE5;">TikTok</a></td>
                      </tr>
                    </table>
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

    // ── Authorization gate ──
    // This function can be called two ways:
    //   1. Scheduled automation (service-role, no user context, no body)
    //   2. Manual HTTP call by an admin
    // For manual calls, require either admin role OR an explicit `authorized: true` flag.
    // The scheduler calls with no body, so we default authorized to true when there's no body.
    let body = {};
    try {
      const text = await req.text();
      if (text) body = JSON.parse(text);
    } catch {
      body = {};
    }

    const hasBody = Object.keys(body).length > 0;
    const authorized = body.authorized === true;

    if (hasBody) {
      // Manual HTTP call — require admin auth OR explicit authorized flag
      let user = null;
      try {
        user = await base44.auth.me();
      } catch {
        user = null;
      }
      const isAdmin = user?.role === 'admin';
      if (!isAdmin && !authorized) {
        return Response.json(
          { error: 'Forbidden: Admin authorization required to manually trigger the newsletter.' },
          { status: 403 }
        );
      }
      console.log('Newsletter triggered manually — authorization verified');
    }
    // If no body (scheduled automation), proceed as service-role

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

    // Fetch the most recent published platform updates (no date cutoff —
    // always show concrete updates rather than a vague placeholder)
    let updates = [];
    try {
      const allUpdates = await base44.asServiceRole.entities.PlatformUpdate.list('-created_date', 50);
      updates = (allUpdates || [])
        .filter(u => u.is_published !== false)
        .slice(0, 6)
        .map(u => ({ title: u.title, description: u.description, url: u.url || '' }));
    } catch (err) {
      console.error('Failed to fetch PlatformUpdate records:', err.message);
    }

    console.log(`Platform updates found: ${updates.length}`);

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    // Calculate the current month identifier for deduplication
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    for (const user of users) {
      if (!user.email) continue;

      // Deduplicate: check if we already sent this month's newsletter to this user
      const existing = await base44.asServiceRole.entities.Notification.filter(
        { target_user: user.email, type: 'feature' },
        '-created_date',
        5
      );
      const alreadySent = existing.find(n => n.metadata?.monthly_newsletter === true && n.metadata?.month_key === monthKey);
      if (alreadySent) {
        skipped++;
        continue;
      }

      const firstName = user.full_name?.split(' ')[0] || 'there';
      try {
        await resend.emails.send({
          from: 'Suttain <noreply@suttain.com>',
          to: [user.email],
          cc: 'contact@suttain.com',
          reply_to: 'contact@suttain.com',
          subject: `Suttain Monthly Update - ${monthLabel}`,
          html: getMonthlyNewsletterHtml(firstName, updates, monthLabel),
        });

        // Record that we sent this month's newsletter so we don't duplicate
        await base44.asServiceRole.entities.Notification.create({
          title: 'Monthly newsletter sent',
          message: `Monthly update for ${monthKey} was emailed.`,
          type: 'feature',
          target_user: user.email,
          metadata: { monthly_newsletter: true, month_key: monthKey }
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err.message);
        failed++;
      }
    }

    console.log(`Monthly newsletter: sent=${sent}, failed=${failed}, skipped=${skipped}, total=${users.length}, updates=${updates.length}`);
    return Response.json({ success: true, sent, failed, skipped, total: users.length, updatesIncluded: updates.length });
  } catch (error) {
    console.error('monthlyNewsletter error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});