import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { Resend } from 'npm:resend@4.0.0';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const CATEGORY_LABELS = {
  tool: 'New Tool',
  research: 'Research',
  business: 'Business',
  improvement: 'Improvement',
  announcement: 'Announcement',
};

const CATEGORY_COLORS = {
  tool: '#007850',
  research: '#6B3FA0',
  business: '#00A8C8',
  improvement: '#D4900A',
  announcement: '#00B478',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { title, message, category, confirm } = body;

    if (!confirm) {
      return Response.json({ error: 'Confirmation required' }, { status: 400 });
    }
    if (!title || !title.trim()) {
      return Response.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const safeTitle = escapeHtml(title.trim());
    const safeMessage = escapeHtml(message.trim());
    const cat = category || 'announcement';
    const catLabel = CATEGORY_LABELS[cat] || 'Announcement';
    const catColor = CATEGORY_COLORS[cat] || '#00B478';

    // Save to PlatformUpdate entity for record-keeping
    try {
      await base44.asServiceRole.entities.PlatformUpdate.create({
        title: title.trim(),
        description: message.trim(),
        category: cat,
        is_published: true,
      });
      console.log(`PlatformUpdate record saved: ${title.trim()}`);
    } catch (e) {
      console.error('Failed to save PlatformUpdate record:', e.message);
    }

    // Fetch all registered users
    const users = await base44.asServiceRole.entities.User.list();
    const emails = users.filter(u => u.email).map(u => u.email);

    if (emails.length === 0) {
      return Response.json({ sent: 0, failed: 0, total: 0, message: 'No users found.' });
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
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
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);">${catLabel}</p>
              <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;line-height:1.25;">
                ${safeTitle}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;white-space:pre-wrap;">${safeMessage}</p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:36px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#007850,#0D9E8E);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:18px;font-weight:800;color:#ffffff;">Explore Suttain</p>
                    <p style="margin:0 0 20px;font-size:13px;color:rgba(255,255,255,0.75);">All tools are available from your account.</p>
                    <a href="https://app.suttain.com"
                       style="display:inline-block;background:#ffffff;color:#007850;font-size:14px;font-weight:700;padding:12px 28px;border-radius:100px;text-decoration:none;">
                      Open Suttain
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

    const subject = `${catLabel}: ${title.trim()}`;

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
            cc: 'contact@suttain.com',
            reply_to: 'contact@suttain.com',
            subject,
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

    console.log(`Announcement "${title.trim()}": sent=${sent}, failed=${failed}, total=${emails.length}`);
    return Response.json({ sent, failed, total: emails.length, errors });
  } catch (error) {
    console.error('sendPlatformUpdateEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});