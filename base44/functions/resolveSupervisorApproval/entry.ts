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

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token, action, reason } = body || {};

    if (!token) {
      return Response.json({ error: 'Missing approval token' }, { status: 400 });
    }

    // Public read by token — service role bypasses RLS (no login required for the supervisor)
    const records = await base44.asServiceRole.entities.SupervisorApproval.filter({ token });
    if (!records || records.length === 0) {
      return Response.json({ error: 'Invalid or expired approval link' }, { status: 404 });
    }
    const record = records[0];

    // PREVIEW: return a safe subset without mutating the record
    if (!action || action === 'preview') {
      return Response.json({
        status: record.status,
        supervisor_name: record.supervisor_name,
        supervisor_email: record.supervisor_email,
        requester_name: record.requester_name,
        requested_date: record.requested_date,
        decided_date: record.decided_date,
        supervisor_decision_reason: record.supervisor_decision_reason,
        chemicals_summary: record.chemicals_summary,
        persona: record.persona,
        simulation_snapshot: record.simulation_snapshot
      });
    }

    // DECIDE
    if (action !== 'approve' && action !== 'reject') {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
    if (record.status !== 'pending') {
      return Response.json(
        { error: `This request has already been ${record.status}.`, status: record.status },
        { status: 409 }
      );
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const now = new Date().toISOString();

    await base44.asServiceRole.entities.SupervisorApproval.update(record.id, {
      status: newStatus,
      supervisor_decision_reason: reason || '',
      decided_date: now
    });

    // Notify the requester by email
    let emailSent = false;
    let emailError = null;
    try {
      const safeRequester = escapeHtml(record.requester_name || record.requester_email);
      const safeSupervisor = escapeHtml(record.supervisor_name);
      const safeChemicals = escapeHtml(record.chemicals_summary || 'chemical simulation');
      const safeReason = escapeHtml(reason || '');
      const year = new Date().getFullYear();
      const APP_ORIGIN = 'https://suttain.com';
      const dashboardUrl = `${APP_ORIGIN}/Dashboard`;

      const isApproved = newStatus === 'approved';
      const headingColor = isApproved ? '#02988C' : '#dc2626';
      const headingText = isApproved ? 'Your simulation was approved' : 'Your simulation was rejected';
      const outcomeLine = isApproved
        ? `<strong>${safeSupervisor}</strong> approved your simulation${safeChemicals ? ' involving <strong>' + safeChemicals + '</strong>' : ''}. You can now generate the lab report from your dashboard.`
        : `<strong>${safeSupervisor}</strong> rejected your simulation${safeChemicals ? ' involving <strong>' + safeChemicals + '</strong>' : ''}.`;

      const reasonBlock = safeReason
        ? `<div style="margin:16px 0;padding:12px 16px;background:#F8FAFC;border-left:3px solid ${headingColor};border-radius:6px;font-size:14px;color:#475569;"><strong>Supervisor note:</strong> ${safeReason}</div>`
        : '';

      const html = `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #D9EDE5;border-radius:16px;overflow:hidden;">
          <div style="background:${headingColor};padding:24px 28px;">
            <h1 style="margin:0;color:#FFFFFF;font-size:18px;font-weight:700;">${headingText}</h1>
            <p style="margin:6px 0 0;color:#F0FDFA;font-size:13px;">Suttain · Supervisor approval</p>
          </div>
          <div style="padding:24px 28px;">
            <p style="margin:0 0 12px;color:#1e293b;font-size:15px;line-height:1.6;">Hi ${safeRequester},</p>
            <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">${outcomeLine}</p>
            ${reasonBlock}
            <a href="${dashboardUrl}" style="display:inline-block;background:#02988C;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:600;margin-top:8px;">Go to dashboard</a>
          </div>
          <div style="background:#EDF7F2;padding:14px 28px;text-align:center;">
            <p style="margin:0;color:#828282;font-size:11px;">© ${year} Suttain.</p>
          </div>
        </div>
      `;

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      await resend.emails.send({
        from: 'Suttain <noreply@suttain.com>',
        to: [record.requester_email],
        cc: 'contact@suttain.com',
        reply_to: 'contact@suttain.com',
        subject: headingText,
        html
      });
      emailSent = true;
    } catch (e) {
      emailError = e.message || String(e);
      console.warn('resolveSupervisorApproval: requester email failed:', emailError);
    }

    return Response.json({
      status: newStatus,
      decided_date: now,
      email_sent: emailSent,
      email_error: emailError
    });
  } catch (error) {
    console.error('resolveSupervisorApproval error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}