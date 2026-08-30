import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Server-side safety alert pipeline: loads the user's safety profile, runs the
// LLM hazard analysis, creates the SafetyAlert + in-app Notification (user-scoped
// so ownership/RLS stays correct), and sends the rich alert email (service-scoped).
// Restricted integration calls use asServiceRole; entity writes stay user-scoped.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { productName, ingredients, alertType, profileId, additionalContext = {} } = body || {};

    if (!productName || !Array.isArray(ingredients) || !profileId) {
      return Response.json({ error: 'productName, ingredients, and profileId are required' }, { status: 400 });
    }

    // Load the user's safety profile (user-scoped -> respects ownership/RLS)
    const profiles = await base44.entities.SafetyProfile.filter({ id: profileId });
    const profile = profiles[0];
    if (!profile) return Response.json({ error: 'Safety profile not found' }, { status: 404 });

    // Construct the analysis prompt server-side from profile + product data
    const healthConditions = Object.entries(profile.health_conditions || {})
      .filter(([, v]) => v)
      .map(([k]) => k.replace(/_/g, ' '))
      .join(', ');
    const allergiesStr = (profile.allergies || []).join(', ') || 'None';
    const sensitivitiesStr = (profile.custom_sensitivities || []).join(', ') || 'None';

    const analysisPrompt = `You are a personalized safety expert. Analyze this product for safety concerns based on the user's specific health profile.

PRODUCT: ${productName}
INGREDIENTS: ${ingredients.join(', ')}

USER HEALTH PROFILE:
- Health Conditions: ${healthConditions || 'None'}
- Known Allergies: ${allergiesStr}
- Sensitivities: ${sensitivitiesStr}

Analyze each ingredient for:
1. Direct allergen matches
2. Cross-reactivity risks
3. Contraindications with health conditions
4. Potential toxic by-products when combined
5. Severity of risk (critical/high/medium/low)

Provide:
- Overall severity assessment
- Clear alert message for the user
- Detailed explanation of each concern
- List of flagged ingredients with specific reasons
- 3 safer alternative products (if applicable)

Return results in JSON format.`;

    const responseSchema = {
      type: 'object',
      properties: {
        severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
        alert_message: { type: 'string' },
        detailed_explanation: { type: 'string' },
        flagged_ingredients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ingredient: { type: 'string' },
              reason: { type: 'string' },
              risk_level: { type: 'string' }
            }
          }
        },
        safer_alternatives: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              product_name: { type: 'string' },
              reason: { type: 'string' },
              score: { type: 'number' }
            }
          }
        }
      },
      required: ['severity', 'alert_message']
    };

    // Restricted: service-scoped LLM call
    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: responseSchema,
      add_context_from_internet: true
    });

    // Create the alert (user-scoped so created_by_id = the user)
    const alert = await base44.entities.SafetyAlert.create({
      profile_id: profileId,
      alert_type: alertType,
      product_name: productName,
      severity: analysis.severity,
      flagged_ingredients: analysis.flagged_ingredients || [],
      alert_message: analysis.alert_message,
      detailed_explanation: analysis.detailed_explanation,
      safer_alternatives: analysis.safer_alternatives || [],
      user_action: 'acknowledged',
      interaction_context: additionalContext
    });

    // Send the rich safety-alert email when enabled and high/critical (service-scoped)
    const shouldSendEmail = profile.notification_preferences?.email_alerts &&
      (analysis.severity === 'critical' || analysis.severity === 'high');
    if (shouldSendEmail) {
      try {
        const severityColor = {
          critical: '#DC2626', high: '#EA580C', medium: '#F59E0B', low: '#3B82F6'
        }[analysis.severity] || '#3B82F6';
        const flaggedList = (analysis.flagged_ingredients || [])
          .map(item => `• ${item.ingredient}: ${item.reason}`)
          .join('\n') || 'No specific ingredients flagged';
        const alternativesList = (analysis.safer_alternatives || [])
          .slice(0, 3)
          .map((alt, i) => `${i + 1}. ${alt.product_name}`)
          .join('\n') || 'No alternatives available';
        const emailBody = `<!DOCTYPE html><html><head><style>
body{font-family:Arial,sans-serif;line-height:1.6;color:#334155;}
.container{max-width:600px;margin:0 auto;padding:20px;}
.header{background:linear-gradient(135deg,${severityColor} 0%,#EC4899 100%);color:white;padding:30px;border-radius:12px 12px 0 0;text-align:center;}
.content{background:#ffffff;padding:30px;border:1px solid #E2E8F0;}
.alert-badge{display:inline-block;padding:8px 16px;background:#FEE2E2;color:#DC2626;border-radius:6px;font-weight:bold;text-transform:uppercase;font-size:12px;}
.section{margin:20px 0;padding:15px;background:#F8FAFC;border-radius:8px;}
.ingredient-list{margin:10px 0;padding-left:20px;}
.footer{text-align:center;padding:20px;color:#64748B;font-size:12px;}
.warning-box{border-left:4px solid ${severityColor};padding-left:15px;margin:15px 0;}
</style></head><body><div class="container">
<div class="header"><h1 style="margin:0;font-size:28px;">Safety Alert</h1>
<p style="margin:10px 0 0 0;opacity:0.9;">Personalized for: ${profile.profile_name}</p></div>
<div class="content">
<div class="alert-badge">${(analysis.severity || '').toUpperCase()} SEVERITY</div>
<h2 style="margin-top:20px;">${productName}</h2>
<div class="warning-box"><strong>Alert Message:</strong><br/>${analysis.alert_message || ''}</div>
${analysis.detailed_explanation ? `<div class="section"><strong>Detailed Explanation:</strong><br/>${analysis.detailed_explanation}</div>` : ''}
<div class="section"><strong>Flagged Ingredients:</strong><pre class="ingredient-list">${flaggedList}</pre></div>
${(analysis.safer_alternatives || []).length > 0 ? `<div class="section"><strong>Safer Alternatives:</strong><pre class="ingredient-list">${alternativesList}</pre></div>` : ''}
</div>
<div class="footer"><p>This alert was generated based on your personalized safety profile.</p>
<p style="margin-top:15px;font-size:11px;">© ${new Date().getFullYear()} Suttain Inc.</p></div>
</div></body></html>`;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `${(analysis.severity || '').toUpperCase()} Safety Alert: ${productName}`,
          body: emailBody
        });
      } catch (e) {
        console.error('Safety alert email failed:', e.message);
      }
    }

    // Create in-app notification (user-scoped) + critical email (service-scoped)
    const flaggedIngredientsList = (analysis.flagged_ingredients || []).map(f => f.ingredient);
    if (flaggedIngredientsList.length > 0) {
      try {
        const notifSeverity = (analysis.severity === 'critical' || analysis.severity === 'high') ? 'critical' : 'warning';
        const action_url = alertType === 'product_scan' ? '/BarcodeScanner' : alertType === 'simulator' ? '/Simulator' : '/generator';
        const message = `${flaggedIngredientsList.length} ingredient${flaggedIngredientsList.length > 1 ? 's' : ''} in "${productName}" may not be safe for your profile: ${flaggedIngredientsList.slice(0, 3).join(', ')}${flaggedIngredientsList.length > 3 ? '...' : ''}`;
        await base44.entities.Notification.create({
          title: 'Safety Alert',
          message,
          type: 'safety',
          severity: notifSeverity,
          action_url,
          metadata: { productName, flaggedIngredients: flaggedIngredientsList },
          is_read: false
        });
        if (notifSeverity === 'critical' && user.notification_preferences?.email_notifications) {
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: user.email,
              subject: `Critical Alert: Safety Alert`,
              body: `${message}\n\nView details: https://suttain.base44.app${action_url}\n\nThis is an automated notification from Suttain.`
            });
          } catch (e) {
            console.error('Notification email failed:', e.message);
          }
        }
      } catch (e) {
        console.error('Failed to create notification:', e.message);
      }
    }

    return Response.json({
      alert,
      analysis,
      shouldWarn: analysis.severity === 'critical' || analysis.severity === 'high'
    });
  } catch (error) {
    console.error('analyzeSafetyAlerts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}