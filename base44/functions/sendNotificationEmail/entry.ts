import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Narrow app-specific operation: sends a critical Suttain notification email to
// the calling user only (recipient derived from auth, never caller-supplied).
// Restricted SendEmail runs service-scoped.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, message, action_url } = await req.json();
    if (!title || !message) {
      return Response.json({ error: 'title and message are required' }, { status: 400 });
    }

    const origin = 'https://suttain.base44.app';
    const body = `${message}\n\n${action_url ? `View details: ${origin}${action_url}\n\n` : ''}This is an automated notification from Suttain.`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: `Critical Alert: ${title}`,
      body
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('sendNotificationEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}