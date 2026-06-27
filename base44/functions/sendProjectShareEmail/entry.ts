import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { to, project_name, permission, invite_link, message, inviter_name } = body;

    if (!to || !project_name || !invite_link) {
      return Response.json({ error: 'Missing required fields: to, project_name, invite_link' }, { status: 400 });
    }

    const permissionLabel = permission === 'edit' ? 'edit (full collaboration)' : 'view (read-only)';
    const messageBlock = message
      ? `<div style="margin:20px 0;padding:12px 16px;background:#F0FAF5;border-left:3px solid #007850;border-radius:6px;font-size:14px;color:#464646;"><strong>Message from ${inviter_name}:</strong><br/>${message}</div>`
      : '';

    const html = `
      <div style="font-family:'DM Sans',Inter,sans-serif;max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #D9EDE5;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#007850,#00A8C8);padding:28px 32px;">
          <h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700;">You're invited to collaborate</h1>
          <p style="margin:6px 0 0;color:#E6F9F3;font-size:13px;">Suttain Research Portal</p>
        </div>
        <div style="padding:28px 32px;">
          <p style="margin:0 0 16px;color:#464646;font-size:15px;line-height:1.6;">
            <strong>${inviter_name}</strong> has invited you to collaborate on the research project
            <strong style="color:#007850;">${project_name}</strong>.
          </p>
          <p style="margin:0 0 16px;color:#464646;font-size:14px;line-height:1.6;">
            Permission level: <strong>${permissionLabel}</strong>
          </p>
          ${messageBlock}
          <a href="${invite_link}" style="display:inline-block;background:#007850;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:600;margin-top:8px;">
            Open Project
          </a>
          <p style="margin:24px 0 0;color:#828282;font-size:12px;line-height:1.5;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <span style="color:#007850;word-break:break-all;">${invite_link}</span>
          </p>
        </div>
        <div style="background:#EDF7F2;padding:16px 32px;text-align:center;">
          <p style="margin:0;color:#828282;font-size:11px;">© ${new Date().getFullYear()} Suttain. This invitation was sent by ${inviter_name}.</p>
        </div>
      </div>
    `;

    const text = `${inviter_name} invited you to collaborate on "${project_name}" with ${permissionLabel} permission.\n\n${message ? 'Message: ' + message + '\n\n' : ''}Open the project: ${invite_link}`;

    let emailSent = false;
    let emailError = null;
    try {
      await base44.integrations.Core.SendEmail({
        to,
        subject: `${inviter_name} shared "${project_name}" with you on Suttain`,
        body: html
      });
      emailSent = true;
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