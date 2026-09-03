import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ── Centralized feature/tool registry ──────────────────────────────
// Update this list whenever a new feature, tool, or platform is added
// to Suttain. The welcome email will automatically include it.
const FEATURE_REGISTRY = {
  tools: [
    { name: 'Chemical Simulator', desc: 'Test chemical interactions safely before mixing, hazard analysis, reaction predictions, and GHS safety warnings.', url: 'https://suttain.com/Simulator' },
    { name: 'Formula Generator', desc: 'Create production-ready formulas with AI, ingredient percentages, mixing instructions, pH targets, and safety validation.', url: 'https://suttain.com/generator' },
    { name: 'SuttainScan', desc: 'Scan any product barcode to instantly analyze ingredients for safety, toxicity, and eco-impact.', url: 'https://suttain.com/BarcodeScanner' },
    { name: 'Hydration Intelligence', desc: 'Track daily water intake with biological, food-linked adjustments tailored to your body.', url: 'https://suttain.com/HydrationHome' },
  ],
  research: [
    { name: 'Molecule Analysis', desc: 'Query any compound for hazard classification, toxicity profiling, and 3D structure visualization.', url: 'https://suttain.com/MoleculeAnalysis' },
    { name: 'Computational Studio', desc: 'Run simulations, quantum chemistry, and the new molecular design suite: protein structure prediction, binder design, and docking.', url: 'https://suttain.com/ComputationalStudio' },
    { name: 'Structural Biology', desc: 'AlphaFold-powered protein structure analysis and exploration.', url: 'https://suttain.com/StructuralBiology' },
    { name: 'Chemical Library', desc: 'Browse and manage your chemical library with search by name, CAS, formula, or safety level.', url: 'https://suttain.com/ChemicalLibrary' },
  ],
  business: [
    { name: 'Enterprise API', desc: 'Custom integrations, dedicated infrastructure, and white-label solutions for organizations at scale.', url: 'https://suttain.com/EnterpriseAPI' },
    { name: 'API Documentation', desc: 'REST endpoints for compound lookup, hazard scoring, interaction checking, and formula generation.', url: 'https://suttain.com/APIPortal' },
  ],
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderFeatureSection(title, color, items) {
  const rows = items.map(f => `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
        <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${color};">${f.name}</p>
        <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">${f.desc}</p>
      </td>
    </tr>`).join('');
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr>
        <td style="background:linear-gradient(135deg,${color},#0d9488);border-radius:8px 8px 0 0;padding:10px 16px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#ffffff;letter-spacing:1.5px;text-transform:uppercase;">${title}</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;margin-bottom:24px;overflow:hidden;">
      ${rows}
    </table>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Called from entity automation: payload has event + data
    const userData = body.data || body;
    const email = userData.email;
    const fullName = userData.full_name || '';
    const firstName = escapeHtml(fullName.split(' ')[0] || 'there');
    const safeFullName = escapeHtml(fullName);
    const safeEmail = escapeHtml(email);

    if (!email) {
      console.error('No email found in payload:', JSON.stringify(body));
      return Response.json({ error: 'No email in payload' }, { status: 400 });
    }

    console.log(`Sending welcome email to: ${email}`);

    const toolsSection = renderFeatureSection('Tools', '#02988C', FEATURE_REGISTRY.tools);
    const researchSection = renderFeatureSection('Research', '#7c3aed', FEATURE_REGISTRY.research);
    const businessSection = renderFeatureSection('Business', '#1e293b', FEATURE_REGISTRY.business);

    const totalTools = FEATURE_REGISTRY.tools.length + FEATURE_REGISTRY.research.length + FEATURE_REGISTRY.business.length;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      from_name: 'Abel at Suttain',
      subject: 'Welcome to Suttain',
      body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to Suttain</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background-color:#007850;border-radius:12px 12px 0 0;padding:40px 40px 32px;text-align:center;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:48px;width:auto;margin-bottom:16px;display:block;"/>
            <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 8px;">Welcome to Suttain, ${firstName}!</h1>
            <!-- firstName is HTML-escaped above -->
            <p style="color:#ffffff;font-size:15px;margin:0;">Your free account is ready, ${totalTools} tools and features waiting for you.</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px;">
            <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${firstName},</p>
            <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">Welcome to Suttain. Your free account is live, here is what you can do today:</p>

            ${toolsSection}
            ${researchSection}
            ${businessSection}

            <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 24px;">Free tier includes 3 simulations, 5 formula generations, and 2 product scans per month. Upgrade to Starter, Pro, or Lifetime anytime.</p>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="https://suttain.com/Dashboard" style="display:inline-block;background-color:#007850;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;">Go to Your Dashboard</a>
                </td>
              </tr>
            </table>

            <p style="color:#334155;font-size:14px;line-height:1.7;margin:32px 0 0;">If you have any questions, just reply to this email, I read every one.</p>

            <p style="color:#1e293b;font-size:15px;line-height:1.6;margin:24px 0 0;">
              Best,<br/><br/>
              <strong style="font-size:16px;">Abel</strong><br/>
              <span style="color:#475569;font-size:14px;">Cofounder &amp; AI System Builder</span><br/>
              <span style="color:#02988C;font-size:14px;">Suttain</span>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1e293b;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">This email was sent by Suttain. Questions? Contact us at <a href="mailto:contact@suttain.com" style="color:#09D2FF;text-decoration:none;">contact@suttain.com</a></p>
            <p style="color:#64748b;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} Suttain. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
    });

    console.log(`Welcome email sent successfully to: ${email}`);

    // Notify admin of new signup
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'contact@suttain.com',
      from_name: 'Suttain Alerts',
      subject: `New User Signup: ${fullName || email}`,
      body: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:32px 0;">
<table width="560" style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
  <tr><td style="background:linear-gradient(135deg,#007850,#00A8C8);padding:24px 32px;">
    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:32px;display:block;margin-bottom:12px;"/>
    <h2 style="color:#fff;margin:0;font-size:20px;">New User Signed Up</h2>
  </td></tr>
  <tr><td style="padding:28px 32px;">
    <table width="100%" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;background:#f8fafc;width:120px;font-size:13px;font-weight:700;color:#475569;">Name</td><td style="padding:12px 16px;font-size:14px;color:#1e293b;">${safeFullName || 'N/A'}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;background:#f8fafc;font-size:13px;font-weight:700;color:#475569;">Email</td><td style="padding:12px 16px;font-size:14px;color:#1e293b;">${safeEmail}</td></tr>
      <tr><td style="padding:12px 16px;background:#f8fafc;font-size:13px;font-weight:700;color:#475569;">Date</td><td style="padding:12px 16px;font-size:14px;color:#1e293b;">${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} (CT)</td></tr>
    </table>
    <div style="text-align:center;margin-top:24px;">
      <a href="https://suttain.com/AdminDashboard" style="display:inline-block;background:#007850;color:#fff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:50px;text-decoration:none;">View in Admin Dashboard</a>
    </div>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;color:#94a3b8;font-size:12px;">Suttain Admin Alert &bull; contact@suttain.com</p>
  </td></tr>
</table>
</body></html>`
    });

    return Response.json({ success: true, email, featuresListed: totalTools });
  } catch (error) {
    console.error('Failed to send welcome email:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});