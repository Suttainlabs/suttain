import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Called from entity automation: payload has event + data
    const userData = body.data || body;
    const email = userData.email;
    const fullName = userData.full_name || '';
    const firstName = fullName.split(' ')[0] || 'there';

    if (!email) {
      console.error('No email found in payload:', JSON.stringify(body));
      return Response.json({ error: 'No email in payload' }, { status: 400 });
    }

    console.log(`Sending welcome email to: ${email}`);

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      from_name: 'Suttain',
      subject: 'Welcome to Suttain - Your Account Is Ready',
      body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to Suttain</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#02988C,#09D2FF);border-radius:12px 12px 0 0;padding:40px 40px 32px;text-align:center;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:48px;width:auto;margin-bottom:16px;"/>
            <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 8px;">Welcome to Suttain, ${firstName}!</h1>
            <p style="color:rgba(255,255,255,0.9);font-size:15px;margin:0;">Your free Suttain account is now active. No credit card required.</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px;">

            <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 8px;">Thank you for joining Suttain. We built Suttain to make chemical safety, sustainability, and formulation accessible to everyone — from individuals to global enterprises.</p>
            <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">Here is a complete overview of everything Suttain offers, organized by category:</p>

            <!-- CATEGORY 1: Safety & Formulation -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
              <tr>
                <td style="background:linear-gradient(135deg,#02988C,#0d9488);border-radius:8px 8px 0 0;padding:10px 16px;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#ffffff;letter-spacing:1.5px;text-transform:uppercase;">🧪 Safety &amp; Formulation</p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;margin-bottom:24px;overflow:hidden;">
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#02988C;">Chemical Simulator</p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Safely test chemical interactions before mixing in a real lab. The simulator runs instant hazard analysis, predicts reaction outcomes, generates GHS safety warnings, checks regulatory compliance across global markets, and scores the environmental impact of every combination — all without touching a single chemical.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#9531F5;">Formula Generator</p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Create professional-grade product formulas using AI. Choose your product type — skincare, cleaning, haircare, body wash, sunscreen, and more — then let Suttain generate a complete, lab-ready formula with ingredient percentages, mixing instructions, pH target, shelf life, safety validation, compliance scoring, and a full sustainability assessment.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0891b2;">Quick Scan</p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Scan any product barcode using your camera or by entering the code manually. Suttain instantly retrieves the full ingredient list and runs a comprehensive safety, toxicity, and eco-impact analysis on every ingredient — so you know exactly what is in any product before you use it.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#16a34a;">Ingredient Database</p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Access over 250,000 chemicals and ingredients from a single searchable database. For every substance, Suttain displays the INCI name, CAS number, SMILES notation, toxicity classification, GHS hazard symbols, biodegradability score, environmental impact rating, sourcing origin (natural vs. synthetic), and links to PubChem data — all in one place.</p>
                </td>
              </tr>
            </table>

            <!-- CATEGORY 2: Advanced Tools -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
              <tr>
                <td style="background:linear-gradient(135deg,#7c3aed,#9531F5);border-radius:8px 8px 0 0;padding:10px 16px;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#ffffff;letter-spacing:1.5px;text-transform:uppercase;">⚙️ Advanced Tools</p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;margin-bottom:24px;overflow:hidden;">
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#7c3aed;">Formula Simulation Engine</p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Fine-tune your formulas in real time. Adjust individual ingredient percentages using interactive sliders and instantly see how each change affects the formula's total cost, pH level, sustainability score, and overall safety rating — giving you precise control over every formulation decision.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#7c3aed;">Computational Simulations <span style="font-size:11px;background:#ede9fe;color:#7c3aed;padding:2px 7px;border-radius:20px;margin-left:4px;font-weight:700;">PRO</span></p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Run advanced computational chemistry directly inside Suttain. Supported simulation types include Density Functional Theory (DFT), Molecular Dynamics (MD), Quantum Mechanics (QM), drug-receptor docking, protein structure modeling, and ORCA/GROMACS script generation — bringing research-grade computational power to your browser without needing a local HPC cluster.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#2563eb;">AI Compliance Co-Pilot <span style="font-size:11px;background:#dbeafe;color:#1d4ed8;padding:2px 7px;border-radius:20px;margin-left:4px;font-weight:700;">PRO</span></p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Automate regulatory compliance for your formulas and product ingredients across 50+ global regions including the EU, FDA (USA), Health Canada, ASEAN, and more. The AI Co-Pilot highlights restricted or banned substances, suggests compliant substitutes, and generates a full compliance report ready for regulatory submission.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0d9488;">Sustainability &amp; Eco Impact Scoring <span style="font-size:11px;background:#ccfbf1;color:#0f766e;padding:2px 7px;border-radius:20px;margin-left:4px;font-weight:700;">PRO</span></p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Measure the full environmental footprint of your formulas. Suttain scores each formula on biodegradability, carbon footprint per kilogram, aquatic toxicity, renewable content percentage, and packaging impact — helping you build genuinely greener products and track progress toward sustainability certifications like ECOCERT and COSMOS.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0891b2;">Comparative Impact Reports <span style="font-size:11px;background:#e0f2fe;color:#0369a1;padding:2px 7px;border-radius:20px;margin-left:4px;font-weight:700;">PRO</span></p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Benchmark your formula's sustainability and safety score against industry averages for the same product category. Generate exportable PDF reports that show how your formulation compares across carbon footprint, biodegradability, toxicity, and compliance — ideal for brand transparency and B2B supplier presentations.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#dc2626;">Personalized Safety Alerts <span style="font-size:11px;background:#fee2e2;color:#dc2626;padding:2px 7px;border-radius:20px;margin-left:4px;font-weight:700;">PRO</span></p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Set up a personal health and sensitivity profile — including skin conditions, allergies, medical conditions, and ingredient intolerances. Suttain then automatically flags any ingredient in a scanned product or formula that conflicts with your profile, giving you personalized safety guidance tailored to your specific needs.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#6366f1;">My Workspace</p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Organize and revisit all your saved simulations, formulas, scans, and compliance checks in one personal workspace. Create folders, pin important sessions, add notes, and export your work as PDFs or lab reports — keeping your entire Suttain history structured and accessible.</p>
                </td>
              </tr>
            </table>

            <!-- CATEGORY 3: Enterprise -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
              <tr>
                <td style="background:linear-gradient(135deg,#1e293b,#334155);border-radius:8px 8px 0 0;padding:10px 16px;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#ffffff;letter-spacing:1.5px;text-transform:uppercase;">🏢 Enterprise</p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;margin-bottom:28px;overflow:hidden;">
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#475569;">Enterprise API Access <span style="font-size:11px;background:#f1f5f9;color:#64748b;padding:2px 7px;border-radius:20px;margin-left:4px;font-weight:700;">Coming Soon</span></p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Integrate Suttain's full chemical analysis, formula generation, compliance checking, and sustainability scoring directly into your enterprise systems via API. Designed for manufacturing companies, cosmetics brands, and research institutions that need bulk processing, white-label capabilities, team collaboration tools, and dedicated account management.</p>
                </td>
              </tr>
            </table>

            <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 28px;">On the Suttain free tier, you get <strong>3 simulations, 5 formula generations, and 2 product scans</strong> per month at no cost. Upgrade to a Suttain Pro or Lifetime plan anytime for unlimited access to all features.</p>

            <!-- Pricing -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:32px;">
              <tr style="background:#f8fafc;">
                <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:14px;color:#1e293b;"><strong>Suttain Pro - $4.99/month</strong><br/><span style="color:#64748b;">Unlimited access to all Suttain features. Cancel anytime.</span></p>
                </td>
              </tr>
              <tr style="background:#ffffff;">
                <td style="padding:12px 16px;">
                  <p style="margin:0;font-size:14px;color:#1e293b;"><strong>Suttain Lifetime Access - $99.99 one-time</strong><br/><span style="color:#64748b;">Pay once and use Suttain forever. Best value.</span></p>
                </td>
              </tr>
            </table>

            <!-- Mobile App -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:28px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#15803d;">📱 Suttain Android App — Now Available!</p>
                  <p style="margin:0 0 12px;font-size:13px;color:#334155;line-height:1.6;">The Suttain mobile app for Android is now available as a free download. Install it directly on your Android device to access all Suttain features on the go.</p>
                  <a href="https://drive.google.com/file/d/1pEBpCMv5BTutrpfaa_uKnQCpK1swDYBy/view?usp=sharing" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 24px;border-radius:50px;">Download Android APK (Free)</a>
                  <p style="margin:8px 0 0;font-size:12px;color:#64748b;">iOS version coming soon.</p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="https://suttain.com" style="display:inline-block;background:linear-gradient(135deg,#02988C,#09D2FF);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;">Get Started on Suttain</a>
                </td>
              </tr>
            </table>

            <p style="color:#334155;font-size:14px;line-height:1.7;margin:32px 0 0;">If you have any questions about Suttain or need help getting started, reply to this email or contact us at <a href="mailto:contact@suttain.com" style="color:#02988C;">contact@suttain.com</a>.</p>

            <p style="color:#1e293b;font-size:14px;margin:24px 0 0;">Warm regards,<br/><strong>Suttain Product Development</strong></p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1e293b;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">This email was sent by Suttain. Questions? Contact us at <a href="mailto:contact@suttain.com" style="color:#09D2FF;text-decoration:none;">contact@suttain.com</a></p>
            <p style="color:#64748b;font-size:12px;margin:0;">© ${new Date().getFullYear()} Suttain. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
    });

    console.log(`Welcome email sent successfully to: ${email}`);

    // Email 2: Subscription & Plan Options
    const subscriptionEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Suttain Subscription Plans</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#02988C,#09D2FF);border-radius:12px 12px 0 0;padding:40px 40px 32px;text-align:center;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:48px;width:auto;margin-bottom:16px;"/>
            <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 8px;">Suttain Subscription and Plan Options</h1>
            <p style="color:rgba(255,255,255,0.9);font-size:15px;margin:0;">Everything you need to know about your Suttain plan</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:36px 40px;">
            <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">Thank you for joining Suttain, ${firstName}. Below is a full breakdown of the subscription tiers available to you on the Suttain platform.</p>
            <h2 style="color:#1e293b;font-size:17px;margin:0 0 12px;">Suttain Free Tier</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;overflow:hidden;">
              <tr><td style="padding:14px 16px;background:#f8fafc;"><ul style="margin:0;padding-left:20px;color:#334155;font-size:14px;line-height:1.9;"><li>3 chemical simulations per month</li><li>5 formula generations per month</li><li>2 product scans per month</li><li>Access to the Suttain Ingredient Database (250,000+ chemicals)</li><li>Basic dashboard and formula history</li></ul></td></tr>
            </table>
            <h2 style="color:#1e293b;font-size:17px;margin:0 0 12px;">Suttain Pro Plan - $4.99/month</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;overflow:hidden;">
              <tr><td style="padding:14px 16px;background:#f8fafc;"><ul style="margin:0;padding-left:20px;color:#334155;font-size:14px;line-height:1.9;"><li>Unlimited Chemical Simulations on Suttain</li><li>Unlimited Formula Generations</li><li>Suttain Compliance Co-Pilot (global regulatory checks across 50+ regions)</li><li>Personalized Suttain Safety Profiles for health conditions and allergies</li><li>Sustainability Scoring and Eco Certifications</li><li>Formula Comparison and PDF Export</li><li>Priority support from the Suttain team</li></ul></td></tr>
            </table>
            <h2 style="color:#1e293b;font-size:17px;margin:0 0 12px;">Suttain Lifetime Access - $99.99 one-time</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;overflow:hidden;">
              <tr><td style="padding:14px 16px;background:#f8fafc;"><p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">Pay once and access Suttain forever. All Pro features included with no recurring charges. This is the best value option for long-term users of the Suttain platform.</p></td></tr>
            </table>
            <h2 style="color:#1e293b;font-size:17px;margin:0 0 12px;">Suttain Enterprise API Access <span style="font-size:12px;background:#ede9fe;color:#7c3aed;padding:2px 8px;border-radius:20px;margin-left:6px;">Coming Soon</span></h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:32px;overflow:hidden;">
              <tr><td style="padding:14px 16px;background:#f8fafc;"><p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">Integrate Suttain directly into your enterprise systems. Suttain's Enterprise API will offer bulk chemical analysis, white-label options, and dedicated account management for teams and organizations.</p></td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><a href="https://suttain.com" style="display:inline-block;background:linear-gradient(135deg,#02988C,#09D2FF);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;">Explore Suttain Plans</a></td></tr></table>
            <p style="color:#334155;font-size:14px;line-height:1.7;margin:32px 0 0;">For any questions about Suttain pricing or plans, contact us at <a href="mailto:contact@suttain.com" style="color:#02988C;">contact@suttain.com</a>.</p>
            <p style="color:#1e293b;font-size:14px;margin:24px 0 0;">Warm regards,<br/><strong>Suttain Product Development</strong></p>
          </td>
        </tr>
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
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      from_name: 'Suttain',
      subject: 'Welcome to Suttain - Your Subscription & Plan Options',
      body: subscriptionEmailHtml
    });

    console.log(`Subscription plan email sent to: ${email}`);

    // Also notify admin
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'contact@suttain.com',
      subject: 'New User Signup on Suttain',
      body: `A new user has signed up on Suttain!\n\nName: ${fullName || 'N/A'}\nEmail: ${email}\nDate: ${new Date().toLocaleString()}\n\nLog in to your admin dashboard to view more details.`
    });

    return Response.json({ success: true, email });
  } catch (error) {
    console.error('Failed to send welcome email:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});