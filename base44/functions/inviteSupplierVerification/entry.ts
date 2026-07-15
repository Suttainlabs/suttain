import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_URL = 'https://app.suttain.com';

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { verificationId, supplierEmail, supplierName, formulaName, ingredients, token } = await req.json();

    // Validate required fields
    if (!supplierEmail || !token || !verificationId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format to prevent injection via recipient field
    const emailRegex = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
    if (!emailRegex.test(supplierEmail)) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Verify the requesting user owns this verification record
    const verification = await base44.entities.SupplierVerification.get(verificationId);
    if (!verification || verification.created_by_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build verify URL with hardcoded domain — never trust user-controlled origin header
    const verifyUrl = `${APP_URL}/SupplierVerify?token=${encodeURIComponent(token)}`;

    // Escape all user-supplied content before inserting into HTML
    const safeSupplierName = escapeHtml(supplierName);
    const safeFormulaName = escapeHtml(formulaName);
    const safeIngredients = Array.isArray(ingredients) ? ingredients : [];
    const ingredientList = safeIngredients
      .map(i => `<li style="padding:4px 0;color:#374151;">${escapeHtml(i)}</li>`)
      .join('');

    const html = `
        <div style="font-family:'Source Sans 3',sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px 16px;">
          <div style="background:white;border-radius:16px;padding:32px;border:1px solid #e2e8f0;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:40px;margin-bottom:24px;" />
            <h2 style="color:#1e293b;margin:0 0 8px;">Hello${safeSupplierName ? `, ${safeSupplierName}` : ''}!</h2>
            <p style="color:#475569;margin:0 0 20px;line-height:1.6;">
              <strong>${escapeHtml(user.full_name || user.email)}</strong> has invited you to verify ingredient data for the formula 
              <strong>"${safeFormulaName}"</strong> on Suttain — a chemical safety and formulation platform.
            </p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 12px;font-weight:600;color:#166534;">Ingredients to verify:</p>
              <ul style="margin:0;padding-left:20px;">
                ${ingredientList}
              </ul>
            </div>
            <p style="color:#475569;margin:0 0 24px;line-height:1.6;">
              Please click the button below to access the secure verification form. You'll be able to confirm ingredient data, upload Certificates of Analysis (CoA), Safety Data Sheets (SDS), or any other relevant documentation.
            </p>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#02988C,#09D2FF);color:white;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:16px;">
                Verify Ingredient Data →
              </a>
            </div>
            <p style="color:#94a3b8;font-size:13px;margin:0;text-align:center;">
              This link is unique to you and expires in 14 days. If you did not expect this email, you can safely ignore it.
            </p>
          </div>
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:16px;">© ${new Date().getFullYear()} Suttain. All rights reserved.</p>
        </div>
      `;

    // Use the platform's restricted SendEmail integration instead of raw Resend client
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: supplierEmail,
      subject: `Ingredient Verification Request for "${safeFormulaName}" — Suttain`,
      body: html,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('inviteSupplierVerification error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});