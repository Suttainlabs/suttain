import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'contact@suttain.com';

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

// Email templates
const getWelcomeEmailHtml = (userName) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #02988C 0%, #09D2FF 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .content h2 { color: #1e293b; margin-top: 0; }
    .content p { color: #475569; line-height: 1.6; }
    .feature { display: flex; align-items: center; margin: 15px 0; padding: 15px; background: #f1f5f9; border-radius: 8px; }
    .feature-icon { width: 40px; height: 40px; background: #02988C; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; color: white; font-size: 20px; }
    .cta { display: inline-block; background: linear-gradient(135deg, #02988C 0%, #09D2FF 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Suttain! 🎉</h1>
    </div>
    <div class="content">
      <h2>Hi ${userName},</h2>
      <p>We're thrilled to have you join the Suttain community! You now have access to powerful tools for chemical safety and formulation.</p>
      
      <div class="feature">
        <div class="feature-icon">🧪</div>
        <div><strong>Chemical Simulator</strong><br/>Test chemical interactions safely</div>
      </div>
      
      <div class="feature">
        <div class="feature-icon">🧬</div>
        <div><strong>Formula Generator</strong><br/>Create custom formulas with AI assistance</div>
      </div>
      
      <div class="feature">
        <div class="feature-icon">📱</div>
        <div><strong>Quick Scan</strong><br/>Scan products to analyze ingredients</div>
      </div>
      
      <a href="https://suttain.com" class="cta">Get Started Now</a>
      
      <p>If you have any questions, don't hesitate to reach out!</p>
      <p>Best regards,<br/>The Suttain Team</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Suttain. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const getAdminNewUserHtml = (userName, userEmail, generatorCategory, simulatorCategory) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #1e293b; padding: 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 22px; }
    .content { padding: 30px; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .info-label { font-weight: 600; color: #475569; width: 150px; }
    .info-value { color: #1e293b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🆕 New User Signup</h1>
    </div>
    <div class="content">
      <h2>A new user has joined Suttain!</h2>
      <div class="info-row"><span class="info-label">Name:</span><span class="info-value">${userName || 'N/A'}</span></div>
      <div class="info-row"><span class="info-label">Email:</span><span class="info-value">${userEmail}</span></div>
      <div class="info-row"><span class="info-label">Generator Use:</span><span class="info-value">${generatorCategory || 'Not specified'}</span></div>
      <div class="info-row"><span class="info-label">Simulator Use:</span><span class="info-value">${simulatorCategory || 'Not specified'}</span></div>
      <div class="info-row"><span class="info-label">Signed Up:</span><span class="info-value">${new Date().toLocaleString()}</span></div>
    </div>
  </div>
</body>
</html>
`;

const getFeatureUsageHtml = (userName, featureType, details) => {
  const featureNames = {
    simulation: 'Chemical Simulator',
    formula: 'Formula Generator',
    barcode_scan: 'Quick Scan'
  };
  
  const featureDetails = {
    simulation: `
      <div class="info-row"><span class="info-label">Chemicals:</span><span class="info-value">${details.chemicals?.join(', ') || 'N/A'}</span></div>
      <div class="info-row"><span class="info-label">Risk Score:</span><span class="info-value">${details.riskScore || 'N/A'}</span></div>
      <div class="info-row"><span class="info-label">Safety Level:</span><span class="info-value">${details.safetyLevel || 'N/A'}</span></div>
    `,
    formula: `
      <div class="info-row"><span class="info-label">Formula Name:</span><span class="info-value">${details.formulaName || 'N/A'}</span></div>
      <div class="info-row"><span class="info-label">Product Type:</span><span class="info-value">${details.productType || 'N/A'}</span></div>
      <div class="info-row"><span class="info-label">Ingredients:</span><span class="info-value">${details.ingredientCount || 0} ingredients</span></div>
    `,
    barcode_scan: `
      <div class="info-row"><span class="info-label">Product:</span><span class="info-value">${details.productName || 'N/A'}</span></div>
      <div class="info-row"><span class="info-label">Brand:</span><span class="info-value">${details.brand || 'N/A'}</span></div>
      <div class="info-row"><span class="info-label">Barcode:</span><span class="info-value">${details.barcode || 'N/A'}</span></div>
    `
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #02988C 0%, #09D2FF 100%); padding: 25px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .info-label { font-weight: 600; color: #475569; width: 150px; }
    .info-value { color: #1e293b; }
    .cta { display: inline-block; background: linear-gradient(135deg, #02988C 0%, #09D2FF 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${featureNames[featureType] || 'Feature'} Results</h1>
    </div>
    <div class="content">
      <h2>Hi ${userName},</h2>
      <p>Here's a summary of your recent activity:</p>
      ${featureDetails[featureType] || ''}
      <a href="https://suttain.com" class="cta">View Full Results</a>
      <p>Best regards,<br/>The Suttain Team</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Suttain. All rights reserved.</div>
  </div>
</body>
</html>
`;
};

const getLearningCompleteHtml = (userName, courseName) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 30px; text-align: center; }
    .badge { width: 100px; height: 100px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center; font-size: 50px; }
    .cta { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Congratulations!</h1>
    </div>
    <div class="content">
      <div class="badge">🏆</div>
      <h2>Well done, ${userName}!</h2>
      <p>You've completed <strong>${courseName || 'a course'}</strong> in the Learning Center!</p>
      <p>Keep up the great work and continue expanding your chemical safety knowledge.</p>
      <a href="https://suttain.com/LearningSuite" class="cta">Continue Learning</a>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Suttain. All rights reserved.</div>
  </div>
</body>
</html>
`;

const getUpdateAnnouncementHtml = (updateTitle, updateDescription, features) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #9531F5 0%, #09D2FF 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .feature-item { padding: 15px; margin: 10px 0; background: #f1f5f9; border-radius: 8px; border-left: 4px solid #9531F5; }
    .cta { display: inline-block; background: linear-gradient(135deg, #9531F5 0%, #09D2FF 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 New Update: ${updateTitle}</h1>
    </div>
    <div class="content">
      <p>${updateDescription}</p>
      <h3>What's New:</h3>
      ${features?.map(f => `<div class="feature-item">✨ ${f}</div>`).join('') || ''}
      <a href="https://suttain.com" class="cta">Check It Out</a>
      <p>Best regards,<br/>The Suttain Team</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Suttain. All rights reserved.</div>
  </div>
</body>
</html>
`;

const getCertificationHtml = (userName, certName, score, earnedDate) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 30px; text-align: center; }
    .certificate { border: 3px solid #f59e0b; border-radius: 12px; padding: 30px; margin: 20px 0; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); }
    .cert-icon { font-size: 60px; margin-bottom: 15px; }
    .cert-title { font-size: 24px; font-weight: bold; color: #92400e; margin: 10px 0; }
    .cert-name { font-size: 18px; color: #78350f; }
    .cert-score { background: #f59e0b; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; margin: 15px 0; font-weight: bold; }
    .cert-date { color: #92400e; font-size: 14px; }
    .cta { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Certification Earned!</h1>
    </div>
    <div class="content">
      <p>Congratulations, ${userName}!</p>
      <div class="certificate">
        <div class="cert-icon">🎖️</div>
        <div class="cert-title">Certificate of Completion</div>
        <div class="cert-name">${certName}</div>
        <div class="cert-score">Score: ${score}%</div>
        <div class="cert-date">Earned on ${earnedDate}</div>
      </div>
      <p>You've demonstrated your knowledge and commitment to chemical safety. Keep learning!</p>
      <a href="https://suttain.com/LearningSuite" class="cta">View Your Certifications</a>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Suttain. All rights reserved.</div>
  </div>
</body>
</html>
`;

const getDownloadNotificationHtml = (userName, downloadType, fileName, details) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #02988C 0%, #09D2FF 100%); padding: 25px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .download-box { background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
    .download-icon { font-size: 40px; margin-bottom: 10px; }
    .cta { display: inline-block; background: linear-gradient(135deg, #02988C 0%, #09D2FF 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 10px 0; }
    .footer { background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📥 Your Download is Ready</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Your ${downloadType} has been generated and is ready for download.</p>
      <div class="download-box">
        <div class="download-icon">📄</div>
        <p><strong>${fileName}</strong></p>
        ${details?.fileUrl ? `<a href="${details.fileUrl}" class="cta">Download File</a>` : ''}
      </div>
      <p style="font-size: 12px; color: #64748b;">This link will expire in 24 hours. Please download your file promptly.</p>
      <p>Best regards,<br/>The Suttain Team</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Suttain. All rights reserved.</div>
  </div>
</body>
</html>
`;

const getWeeklyDigestHtml = (userName, stats) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-box { background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #6366f1; }
    .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
    .cta { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Your Weekly Summary</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Here's what you accomplished this week on Suttain:</p>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${stats?.simulations || 0}</div>
          <div class="stat-label">Simulations</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats?.formulas || 0}</div>
          <div class="stat-label">Formulas</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats?.scans || 0}</div>
          <div class="stat-label">Scans</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats?.points || 0}</div>
          <div class="stat-label">Points Earned</div>
        </div>
      </div>
      <a href="https://suttain.com/Profile" class="cta">View Full Dashboard</a>
      <p>Keep up the great work!<br/>The Suttain Team</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Suttain. All rights reserved.</div>
  </div>
</body>
</html>
`;

const getSafetyAlertHtml = (userName, alertData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: ${alertData?.severity === 'critical' ? '#dc2626' : '#f59e0b'}; padding: 25px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .alert-box { background: ${alertData?.severity === 'critical' ? '#fef2f2' : '#fffbeb'}; border: 2px solid ${alertData?.severity === 'critical' ? '#fecaca' : '#fde68a'}; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .alert-icon { font-size: 40px; text-align: center; margin-bottom: 10px; }
    .ingredient-list { background: white; border-radius: 8px; padding: 15px; margin-top: 15px; }
    .cta { display: inline-block; background: #02988C; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Safety Alert</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <div class="alert-box">
        <div class="alert-icon">${alertData?.severity === 'critical' ? '🚨' : '⚠️'}</div>
        <p><strong>${alertData?.productName || 'Product'}</strong></p>
        <p>${alertData?.message || 'A potential safety concern was detected based on your safety profile.'}</p>
        ${alertData?.flaggedIngredients?.length > 0 ? `
        <div class="ingredient-list">
          <strong>Flagged Ingredients:</strong>
          <ul>${alertData.flaggedIngredients.map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
        ` : ''}
      </div>
      <p>Review your safety profile settings to customize alerts.</p>
      <a href="https://suttain.com/PersonalizedSafety" class="cta">View Safety Profile</a>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Suttain. All rights reserved.</div>
  </div>
</body>
</html>
`;

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { type, to, subject, html, text, from, data } = await req.json();

        // Public types that only send to ADMIN_EMAIL (no auth required, but HTML-escape everything)
        const isPublicType = type === 'demo_request' || type === 'contact_form';

        // All other types require authentication
        let user = null;
        if (!isPublicType) {
            user = await base44.auth.me();
            if (!user) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        // Helper: send a single email via Resend
        const sendEmail = async (recipient, subjectLine, htmlBody) => {
            await resend.emails.send({
                from: 'Suttain <noreply@suttain.com>',
                to: [recipient],
                cc: 'contact@suttain.com',
                reply_to: 'contact@suttain.com',
                subject: subjectLine,
                html: htmlBody
            });
        };

        if (type === 'welcome') {
            const userName = escapeHtml(data.userName || user.full_name || 'there');
            const userEmail = user.email; // pinned to authenticated user
            const generatorCategory = escapeHtml(data.generatorCategory);
            const simulatorCategory = escapeHtml(data.simulatorCategory);
            await sendEmail(userEmail, 'Welcome to Suttain!', getWelcomeEmailHtml(userName));
            await sendEmail(ADMIN_EMAIL, `New User Signup: ${data.userName || userEmail}`, getAdminNewUserHtml(userName, escapeHtml(userEmail), generatorCategory, simulatorCategory));
            return Response.json({ success: true, message: 'Welcome emails sent' });
        }

        if (type === 'feature_usage') {
            const { featureType, details } = data;
            const userName = escapeHtml(data.userName || user.full_name || 'User');
            const safeDetails = {
                chemicals: Array.isArray(details?.chemicals) ? details.chemicals.map(escapeHtml) : [],
                riskScore: escapeHtml(details?.riskScore),
                safetyLevel: escapeHtml(details?.safetyLevel),
                formulaName: escapeHtml(details?.formulaName),
                productType: escapeHtml(details?.productType),
                ingredientCount: escapeHtml(details?.ingredientCount),
                productName: escapeHtml(details?.productName),
                brand: escapeHtml(details?.brand),
                barcode: escapeHtml(details?.barcode)
            };
            await sendEmail(user.email, `Your ${featureType === 'simulation' ? 'Simulation' : featureType === 'formula' ? 'Formula' : 'Scan'} Results - Suttain`, getFeatureUsageHtml(userName, escapeHtml(featureType), safeDetails));
            return Response.json({ success: true, message: 'Feature usage email sent' });
        }

        if (type === 'learning_complete') {
            const userName = escapeHtml(data.userName || user.full_name || 'User');
            const courseName = escapeHtml(data.courseName);
            await sendEmail(user.email, 'Congratulations on Completing Your Course!', getLearningCompleteHtml(userName, courseName));
            return Response.json({ success: true, message: 'Learning completion email sent' });
        }

        if (type === 'demo_request') {
            const name = escapeHtml(data.name);
            const email = escapeHtml(data.email);
            const companyName = escapeHtml(data.companyName);
            const role = escapeHtml(data.role);
            const message = escapeHtml(data.message);
            await sendEmail(ADMIN_EMAIL, `New Demo Request from ${data.companyName || 'Unknown'}`, `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #02988C 0%, #09D2FF 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">New Demo Request</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #1e293b; margin-top: 0;">Contact Details</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #64748b;">Name:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${name}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Email:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${email}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Company:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${companyName}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Role:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${role || 'Not specified'}</td></tr>
                        </table>
                        ${message ? `<div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 8px;"><p style="color: #64748b; margin: 0 0 5px 0; font-size: 12px;">MESSAGE:</p><p style="color: #1e293b; margin: 0;">${message}</p></div>` : ''}
                        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Submitted on ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            `);
            return Response.json({ success: true, message: 'Demo request notification sent' });
        }

        if (type === 'contact_form') {
            const name = escapeHtml(data.name);
            const email = escapeHtml(data.email);
            const contactSubject = escapeHtml(data.subject);
            const message = escapeHtml(data.message);
            await sendEmail(ADMIN_EMAIL, `New Contact Form: ${data.subject || 'No Subject'}`, `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #9531F5 0%, #09D2FF 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #1e293b; margin-top: 0;">Contact Details</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #64748b;">Name:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${name}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Email:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${email}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Subject:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${contactSubject}</td></tr>
                        </table>
                        <div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 8px;">
                            <p style="color: #64748b; margin: 0 0 5px 0; font-size: 12px;">MESSAGE:</p>
                            <p style="color: #1e293b; margin: 0; white-space: pre-wrap;">${message}</p>
                        </div>
                        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Submitted on ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            `);
            return Response.json({ success: true, message: 'Contact form notification sent' });
        }

        if (type === 'update_announcement') {
            if (user?.role !== 'admin') {
                return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
            }
            const updateTitle = escapeHtml(data.updateTitle);
            const updateDescription = escapeHtml(data.updateDescription);
            const features = Array.isArray(data.features) ? data.features.map(escapeHtml) : [];
            const recipients = Array.isArray(data.recipients) ? data.recipients.filter(e => emailRegex.test(e)) : [];
            for (const recipient of recipients) {
                await sendEmail(recipient, `Suttain Update: ${data.updateTitle || ''}`, getUpdateAnnouncementHtml(updateTitle, updateDescription, features));
            }
            return Response.json({ success: true, message: `Update announcement sent to ${recipients.length} users` });
        }

        if (type === 'certification') {
            const userName = escapeHtml(data.userName || user.full_name || 'User');
            const certName = escapeHtml(data.certName);
            const score = escapeHtml(data.score);
            const earnedDate = escapeHtml(data.earnedDate);
            await sendEmail(user.email, `Certification Earned: ${data.certName || ''}`, getCertificationHtml(userName, certName, score, earnedDate));
            return Response.json({ success: true, message: 'Certification email sent' });
        }

        if (type === 'download') {
            const userName = escapeHtml(data.userName || user.full_name || 'User');
            const downloadType = escapeHtml(data.downloadType);
            const fileName = escapeHtml(data.fileName);
            const fileUrl = escapeHtml(data.fileUrl);
            await sendEmail(user.email, `Your ${data.downloadType || 'File'} is Ready - Suttain`, getDownloadNotificationHtml(userName, downloadType, fileName, { fileUrl }));
            return Response.json({ success: true, message: 'Download notification sent' });
        }

        if (type === 'weekly_digest') {
            const userName = escapeHtml(data.userName || user.full_name || 'User');
            const stats = data.stats || {};
            await sendEmail(user.email, 'Your Weekly Suttain Summary', getWeeklyDigestHtml(userName, stats));
            return Response.json({ success: true, message: 'Weekly digest sent' });
        }

        if (type === 'safety_alert') {
            const userName = escapeHtml(data.userName || user.full_name || 'User');
            const alertData = data.alertData || {};
            const safeAlertData = {
                severity: escapeHtml(alertData.severity),
                productName: escapeHtml(alertData.productName),
                message: escapeHtml(alertData.message),
                flaggedIngredients: Array.isArray(alertData.flaggedIngredients) ? alertData.flaggedIngredients.map(escapeHtml) : []
            };
            await sendEmail(user.email, `Safety Alert: ${alertData.productName || 'Important Notice'}`, getSafetyAlertHtml(userName, safeAlertData));
            return Response.json({ success: true, message: 'Safety alert email sent' });
        }

        // Generic email send, restricted to admins to prevent open relay abuse
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required for generic email send' }, { status: 403 });
        }

        if (!to || !subject || (!html && !text)) {
            return Response.json({
                error: 'Missing required fields: to, subject, and either html or text are required'
            }, { status: 400 });
        }

        const { data: emailData, error } = await resend.emails.send({
            from: from || 'Suttain <noreply@suttain.com>',
            to: Array.isArray(to) ? to : [to],
            cc: 'contact@suttain.com',
            reply_to: 'contact@suttain.com',
            subject: escapeHtml(subject),
            html: escapeHtml(html),
            text
        });

        if (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({ success: true, data: emailData });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});