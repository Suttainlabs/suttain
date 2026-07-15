import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const getBlogNotificationHtml = (articleTitle, articleExcerpt, articleUrl) => {
  const safeTitle = escapeHtml(articleTitle);
  const safeExcerpt = escapeHtml(articleExcerpt);
  const safeUrl = escapeHtml(articleUrl || 'https://suttain.com/Blog');
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #007850 0%, #00A8C8 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
    .content { padding: 30px; }
    .content h2 { color: #1e293b; margin-top: 0; font-size: 22px; line-height: 1.3; }
    .content p { color: #475569; line-height: 1.6; }
    .article-card { background: #f1f5f9; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #007850; }
    .cta { display: inline-block; background: linear-gradient(135deg, #007850 0%, #00A8C8 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; font-size: 16px; }
    .footer { background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
    .footer a { color: #64748b; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Article on Suttain Blog</h1>
      <p>Fresh insights just published for you</p>
    </div>
    <div class="content">
      <p>We just published a new article we think you'll find valuable:</p>
      <div class="article-card">
        <h2>${safeTitle}</h2>
        ${safeExcerpt ? `<p style="margin-bottom: 0;">${safeExcerpt}</p>` : ''}
      </div>
      <a href="${safeUrl}" class="cta">Read the Article</a>
      <p style="font-size: 13px; color: #94a3b8;">You're receiving this because you subscribed to Suttain blog updates.</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Suttain. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
};

const getSubscribeConfirmationHtml = (email) => {
  const safeEmail = escapeHtml(email);
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #007850 0%, #00A8C8 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 26px; }
    .content { padding: 30px; text-align: center; }
    .icon { font-size: 56px; margin-bottom: 10px; }
    .content h2 { color: #1e293b; }
    .content p { color: #475569; line-height: 1.6; }
    .cta { display: inline-block; background: linear-gradient(135deg, #007850 0%, #00A8C8 100%); color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're Subscribed!</h1>
    </div>
    <div class="content">
      <div class="icon">✅</div>
      <h2>Welcome to Suttain Blog Updates</h2>
      <p>You'll now receive notifications whenever we publish new articles on chemical safety, sustainable formulation, and industry insights.</p>
      <a href="https://suttain.com/Blog" class="cta">Visit the Blog</a>
      <p style="font-size: 13px; color: #94a3b8; margin-top: 20px;">Subscribed as: ${safeEmail}</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Suttain. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const { action } = body;

        // ── Subscribe a new email ──
        if (action === 'subscribe') {
            const { email } = body;
            if (!email || typeof email !== 'string') {
                return Response.json({ error: 'Email is required' }, { status: 400 });
            }

            // Validate email format to prevent injection / abuse
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email) || email.length > 254) {
                return Response.json({ error: 'Invalid email address' }, { status: 400 });
            }

            // Deduplicate: skip if a subscription confirmation was already sent
            try {
                const existing = await base44.asServiceRole.entities.Notification.filter(
                    { target_user: email, type: 'feature' },
                    '-created_date',
                    5
                );
                const alreadySubscribed = existing.find(n => n.metadata?.blog_subscription === true);
                if (alreadySubscribed) {
                    return Response.json({ success: true, message: 'Already subscribed' });
                }
            } catch (e) {
                console.error('Subscription dedup check failed:', e.message);
            }

            // Use the platform's restricted email integration (not raw Resend)
            // to prevent open-relay abuse via the unauthenticated subscribe endpoint.
            await base44.integrations.Core.SendEmail({
                to: email,
                subject: 'You are now subscribed to Suttain Blog updates',
                body: getSubscribeConfirmationHtml(email)
            });

            // Record the subscription so we can deduplicate future requests
            try {
                await base44.asServiceRole.entities.Notification.create({
                    title: 'Blog subscription confirmed',
                    message: `${email} subscribed to blog updates.`,
                    type: 'feature',
                    target_user: email,
                    metadata: { blog_subscription: true }
                });
            } catch (e) {
                console.error('Failed to record subscription:', e.message);
            }

            console.log(`Blog subscription confirmed for: ${email}`);
            return Response.json({ success: true, message: 'Subscription confirmed' });
        }

        // ── Broadcast a new article to all registered users (admin only) ──
        if (action === 'broadcast') {
            const user = await base44.auth.me();
            if (user?.role !== 'admin') {
                return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
            }

            // Require explicit confirmation flag — prevents accidental triggers
            if (body.confirm !== true) {
                return Response.json({ error: 'Confirmation required' }, { status: 400 });
            }

            const { articleTitle, articleExcerpt, articleUrl } = body;
            if (!articleTitle) {
                return Response.json({ error: 'articleTitle is required' }, { status: 400 });
            }

            // Fetch all registered users
            const users = await base44.asServiceRole.entities.User.list();
            const emails = users.map(u => u.email).filter(Boolean);

            // Log recipient count BEFORE sending
            console.log(`Broadcasting new blog post "${articleTitle}" to ${emails.length} users (confirmed)`);

            let sent = 0;
            let failed = 0;

            // Send in batches to avoid rate limits
            for (let i = 0; i < emails.length; i += 10) {
                const batch = emails.slice(i, i + 10);
                await Promise.all(batch.map(async (email) => {
                    try {
                        await resend.emails.send({
                            from: 'Suttain Blog <noreply@suttain.com>',
                            to: [email],
                            subject: `New Article: ${articleTitle}`,
                            html: getBlogNotificationHtml(articleTitle, articleExcerpt, articleUrl)
                        });
                        sent++;
                    } catch (err) {
                        console.error(`Failed to send to ${email}:`, err.message);
                        failed++;
                    }
                }));

                // Small delay between batches
                if (i + 10 < emails.length) {
                    await new Promise(r => setTimeout(r, 300));
                }
            }

            return Response.json({
                success: true,
                message: `Broadcast complete: ${sent} sent, ${failed} failed`,
                sent,
                failed,
                recipient_count: emails.length
            });
        }

        return Response.json({ error: 'Invalid action. Use "subscribe" or "broadcast".' }, { status: 400 });

    } catch (error) {
        console.error('broadcastBlogPost error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});