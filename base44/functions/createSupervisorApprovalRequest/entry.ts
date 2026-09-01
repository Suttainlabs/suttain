import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { Resend } from 'npm:resend@2.0.0';

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const emailRegex = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      supervisor_name,
      supervisor_email,
      simulation_snapshot,
      simulation_id,
      persona,
      chemicals_summary
    } = body || {};

    if (!supervisor_name || !supervisor_email || !simulation_snapshot) {
      return Response.json(
        { error: 'Missing required fields: supervisor_name, supervisor_email, simulation_snapshot' },
        { status: 400 }
      );
    }
    if (!emailRegex.test(supervisor_email)) {
      return Response.json({ error: 'Invalid supervisor email' }, { status: 400 });
    }

    const token = crypto.randomUUID() + '-' + crypto.randomUUID();
    const now = new Date().toISOString();

    // Persist the approval request (user-scoped → created_by_id auto-set)
    const record = await base44.entities.SupervisorApproval.create({
      token,
      simulation_snapshot,
      chemicals_summary: chemicals_summary || '',
      persona: persona || '',
      requester_user_id: user.id,
      requester_name: user.full_name || '',
      requester_email: user.email,
      supervisor_name,
      supervisor_email,
      status: 'pending',
      requested_date: now,
      simulation_id: simulation_id || ''
    });

    const APP_ORIGIN = 'https://suttain.com';
    const approvalUrl = `${APP_ORIGIN}/ApproveSimulation?token=${token}`;

    const safeSupervisor = escapeHtml(supervisor_name);
    const safeRequester = escapeHtml(user.full_name || user.email);
    const safeChemicals = escapeHtml(chemicals_summary || 'chemical simulation');
    const year = new Date().getFullYear();

    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #D9EDE5;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#02988C,#09D2FF);padding:24px 28px;">
          <h1 style="margin:0;color:#FFFFFF;font-size:18px;font-weight:700;">Simulation approval requested</h1>
          <p style="margin:6px 0 0;color:#E6F9F3;font-size:13px;">Suttain · Chemical Interaction Simulator</p>
        </div>
        <div style="padding:24px 28px;">
          <p style="margin:0 0 12px;color:#1e293b;font-size:15px;line-height:1.6;">
            <strong>${safeRequester}</strong> has requested your supervisor approval for a chemical simulation${safeChemicals ? ' involving <strong>' + safeChemicals + '</strong>' : ''}.
          </p>
          <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">
            Please review the simulation details and approve or reject it. No account is required, this secure link is unique to you.
          </p>
          <a href="${approvalUrl}" style="display:inline-block;background:#02988C;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:600;margin-top:4px;">Review &amp; approve</a>
          <p style="margin:20px 0 0;color:#828282;font-size:12px;line-height:1.5;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <span style="color:#02988C;word-break:break-all;">${approvalUrl}</span>
          </p>
        </div>
        <div style="background:#EDF7F2;padding:14px 28px;text-align:center;">
          <p style="margin:0;color:#828282;font-size:11px;">© ${year} Suttain. This request was sent by ${safeRequester}.</p>
        </div>
      </div>
    `;

    let emailSent = false;
    let emailError = null;
    try {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      await resend.emails.send({
        from: 'Suttain <noreply@suttain.com>',
        to: [supervisor_email],
        cc: 'contact@suttain.com',
        reply_to: 'contact@suttain.com',
        subject: `Supervisor approval requested by ${user.full_name || user.email}`,
        html
      });
      emailSent = true;
    } catch (e) {
      emailError = e.message || String(e);
      console.warn('createSupervisorApprovalRequest: supervisor email failed:', emailError);
    }

    return Response.json({
      status: 'success',
      id: record.id,
      token,
      approval_url: approvalUrl,
      email_sent: emailSent,
      email_error: emailError
    });
  } catch (error) {
    console.error('createSupervisorApprovalRequest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}