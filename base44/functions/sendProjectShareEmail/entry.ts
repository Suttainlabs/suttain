import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { to, project_name, project_id, permission, invite_link, message, inviter_name } = body;

    if (!to || !project_name || !invite_link || !project_id) {
      return Response.json({ error: 'Missing required fields: to, project_name, project_id, invite_link' }, { status: 400 });
    }

    // Verify the calling user owns the project — use the user-scoped client
    // (enforces RLS) AND filter by created_by_id to prevent IDOR.
    try {
      const projects = await base44.entities.ChemicalProject.filter({
        id: project_id,
        created_by_id: user.id
      });
      if (!projects || projects.length === 0) {
        return Response.json({ error: 'You do not have permission to share this project' }, { status: 403 });
      }
    } catch {
      return Response.json({ error: 'Project not found or access denied' }, { status: 403 });
    }

    // Verify recipient is a registered app user — prevents open mail relay
    // where authenticated users send arbitrary emails to external addresses.
    try {
      const recipientUsers = await base44.asServiceRole.entities.User.filter({ email: to });
      if (!recipientUsers || recipientUsers.length === 0) {
        return Response.json({ error: 'Recipient must be a registered Suttain user' }, { status: 403 });
      }
    } catch {
      return Response.json({ error: 'Unable to verify recipient' }, { status: 403 });
    }

    // HTML-escape all user-controlled values to prevent email XSS
    const escapeHtml = (str) => String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const safeProjectName = escapeHtml(project_name);
    const safeInviterName = escapeHtml(inviter_name || user.full_name || user.email || 'A Suttain researcher');
    const safeMessage = escapeHtml(message);
    // Validate invite_link — restrict to the app's own domain to prevent open
    // redirect / phishing via arbitrary external URLs in official emails.
    const ALLOWED_SHARE_DOMAINS = ['suttain.com', 'app.suttain.com', 'www.suttain.com'];
    let validatedLink;
    try {
      const linkUrl = new URL(invite_link);
      if (linkUrl.protocol !== 'https:') {
        return Response.json({ error: 'Invite link must use HTTPS' }, { status: 400 });
      }
      if (!ALLOWED_SHARE_DOMAINS.includes(linkUrl.hostname)) {
        return Response.json({ error: 'Invite link must point to a Suttain domain' }, { status: 400 });
      }
      validatedLink = linkUrl.href;
    } catch {
      return Response.json({ error: 'Invalid invite link' }, { status: 400 });
    }
    const safeInviteLink = escapeHtml(validatedLink);

    const permissionLabel = permission === 'edit' ? 'edit (full collaboration)' : 'view (read-only)';
    const messageBlock = safeMessage
      ? `<div style="margin:20px 0;padding:12px 16px;background:#F0FAF5;border-left:3px solid #007850;border-radius:6px;font-size:14px;color:#464646;"><strong>Message from ${safeInviterName}:</strong><br/>${safeMessage}</div>`
      : '';

    const html = `
      <div style="font-family:'DM Sans',Inter,sans-serif;max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #D9EDE5;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#007850,#00A8C8);padding:28px 32px;">
          <h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700;">You're invited to collaborate</h1>
          <p style="margin:6px 0 0;color:#E6F9F3;font-size:13px;">Suttain Research Portal</p>
        </div>
        <div style="padding:28px 32px;">
          <p style="margin:0 0 16px;color:#464646;font-size:15px;line-height:1.6;">
            <strong>${safeInviterName}</strong> has invited you to collaborate on the research project
            <strong style="color:#007850;">${safeProjectName}</strong>.
          </p>
          <p style="margin:0 0 16px;color:#464646;font-size:14px;line-height:1.6;">
            Permission level: <strong>${permissionLabel}</strong>
          </p>
          ${messageBlock}
          <a href="${safeInviteLink}" style="display:inline-block;background:#007850;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:600;margin-top:8px;">
            Open Project
          </a>
          <p style="margin:24px 0 0;color:#828282;font-size:12px;line-height:1.5;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <span style="color:#007850;word-break:break-all;">${safeInviteLink}</span>
          </p>
        </div>
        <div style="background:#EDF7F2;padding:16px 32px;text-align:center;">
          <p style="margin:0;color:#828282;font-size:11px;">© ${new Date().getFullYear()} Suttain. This invitation was sent by ${safeInviterName}.</p>
        </div>
      </div>
    `;

    const text = `${safeInviterName} invited you to collaborate on "${safeProjectName}" with ${permissionLabel} permission.\n\n${safeMessage ? 'Message: ' + safeMessage + '\n\n' : ''}Open the project: ${safeInviteLink}`;

    let emailSent = false;
    let emailError = null;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to,
        subject: `${safeInviterName} shared "${safeProjectName}" with you on Suttain`,
        body: html
      });
      emailSent = true;
      // CC contact@suttain.com
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: 'contact@suttain.com',
          subject: `[CC] ${safeInviterName} shared "${safeProjectName}" on Suttain`,
          body: html
        });
      } catch (ccErr) {
        console.warn('CC email failed:', ccErr.message);
      }
    } catch (emailErr) {
      emailError = emailErr.message || String(emailErr);
      console.warn('sendProjectShareEmail: email delivery failed (share still recorded):', emailError);
    }

    return Response.json({
      status: 'success',
      email_sent: emailSent,
      email_error: emailError
    });
  } catch (error) {
    console.error('sendProjectShareEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});