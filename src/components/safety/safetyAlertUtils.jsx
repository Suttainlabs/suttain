import { base44 } from '@/api/base44Client';
import { createSafetyNotification } from '../notifications/notificationUtils';

/**
 * Creates a safety alert and sends email notification if configured
 * @param {Object} alertData - The alert data to create
 * @param {string} userEmail - The user's email address
 * @returns {Promise<Object>} The created alert
 */
export async function createSafetyAlertWithNotification(alertData, userEmail) {
  try {
    // Create the alert in the database
    const alert = await base44.entities.SafetyAlert.create(alertData);

    // Get the user's profile to check notification preferences
    const profiles = await base44.entities.SafetyProfile.filter({ 
      id: alertData.profile_id 
    });
    
    const profile = profiles[0];
    
    // Check if email notifications are enabled and if severity warrants it
    const shouldSendEmail = 
      profile?.notification_preferences?.email_alerts &&
      (alertData.severity === 'critical' || alertData.severity === 'high');

    if (shouldSendEmail && userEmail) {
      // Send email notification
      await sendSafetyAlertEmail(alert, profile, userEmail);
    }

    return alert;
  } catch (error) {
    console.error('Error creating safety alert:', error);
    throw error;
  }
}

/**
 * Sends an email notification for a safety alert
 * @param {Object} alert - The alert object
 * @param {Object} profile - The safety profile
 * @param {string} userEmail - The user's email address
 */
async function sendSafetyAlertEmail(alert, profile, userEmail) {
  const severityEmoji = {
    critical: '🚨',
    high: '⚠️',
    medium: '⚡',
    low: 'ℹ️'
  };

  const severityColor = {
    critical: '#DC2626',
    high: '#EA580C',
    medium: '#F59E0B',
    low: '#3B82F6'
  };

  const flaggedIngredientsList = alert.flagged_ingredients
    ?.map(item => `• ${item.ingredient}: ${item.reason}`)
    .join('\n') || 'No specific ingredients flagged';

  const alternativesList = alert.safer_alternatives
    ?.slice(0, 3)
    .map((alt, index) => `${index + 1}. ${alt.product_name}`)
    .join('\n') || 'No alternatives available';

  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #334155; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, ${severityColor[alert.severity]} 0%, #EC4899 100%); 
              color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #E2E8F0; }
    .alert-badge { display: inline-block; padding: 8px 16px; background: #FEE2E2; 
                   color: #DC2626; border-radius: 6px; font-weight: bold; 
                   text-transform: uppercase; font-size: 12px; }
    .section { margin: 20px 0; padding: 15px; background: #F8FAFC; border-radius: 8px; }
    .ingredient-list { margin: 10px 0; padding-left: 20px; }
    .footer { text-align: center; padding: 20px; color: #64748B; font-size: 12px; }
    .button { display: inline-block; padding: 12px 24px; background: #E11D48; 
              color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    h2 { color: #1E293B; margin-top: 0; }
    .warning-box { border-left: 4px solid ${severityColor[alert.severity]}; 
                   padding-left: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">${severityEmoji[alert.severity]} Safety Alert</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Personalized for: ${profile.profile_name}</p>
    </div>
    
    <div class="content">
      <div class="alert-badge">${alert.severity.toUpperCase()} SEVERITY</div>
      
      <h2 style="margin-top: 20px;">${alert.product_name}</h2>
      
      <div class="warning-box">
        <strong>Alert Message:</strong><br/>
        ${alert.alert_message}
      </div>
      
      ${alert.detailed_explanation ? `
        <div class="section">
          <strong>📋 Detailed Explanation:</strong><br/>
          ${alert.detailed_explanation}
        </div>
      ` : ''}
      
      <div class="section">
        <strong>🧪 Flagged Ingredients:</strong>
        <pre class="ingredient-list">${flaggedIngredientsList}</pre>
      </div>
      
      ${alert.safer_alternatives && alert.safer_alternatives.length > 0 ? `
        <div class="section">
          <strong>✨ Safer Alternatives:</strong>
          <pre class="ingredient-list">${alternativesList}</pre>
        </div>
      ` : ''}
      
      <div style="text-align: center;">
        <a href="https://suttain.com/personalized-safety" class="button">
          View Full Alert Details
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 14px; color: #64748B;">
        <strong>What to do next:</strong><br/>
        • Review the flagged ingredients carefully<br/>
        • Consider the suggested safer alternatives<br/>
        • Consult with a healthcare professional if needed<br/>
        • Update your safety profile if your health conditions change
      </div>
    </div>
    
    <div class="footer">
      <p>This alert was generated based on your personalized safety profile.<br/>
      To manage your notification preferences, visit your <a href="https://suttain.com/profile" style="color: #E11D48;">Profile Settings</a>.</p>
      <p style="margin-top: 15px; font-size: 11px;">
        © ${new Date().getFullYear()} Suttain Inc. • Protecting your health with AI-powered insights
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await base44.integrations.Core.SendEmail({
      to: userEmail,
      subject: `${severityEmoji[alert.severity]} ${alert.severity.toUpperCase()} Safety Alert: ${alert.product_name}`,
      body: emailBody
    });
  } catch (error) {
    console.error('Failed to send safety alert email:', error);
    // Don't throw - we don't want email failures to break alert creation
  }
}

/**
 * Analyzes product/formula and creates alerts based on user's safety profile
 * @param {Object} params - Analysis parameters
 * @returns {Promise<Object>} Analysis result with alerts
 */
export async function analyzeAndCreateAlerts({
  productName,
  ingredients,
  alertType,
  profileId,
  userEmail,
  additionalContext = {}
}) {
  try {
    // Get the user's safety profile
    const profiles = await base44.entities.SafetyProfile.filter({ id: profileId });
    const profile = profiles[0];
    
    if (!profile) {
      throw new Error('Safety profile not found');
    }

    // Build analysis prompt
    const healthConditions = Object.entries(profile.health_conditions || {})
      .filter(([_, value]) => value)
      .map(([key]) => key.replace(/_/g, ' '))
      .join(', ');

    const allergiesStr = profile.allergies?.join(', ') || 'None';
    const sensitivitiesStr = profile.custom_sensitivities?.join(', ') || 'None';

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
        severity: {
          type: 'string',
          enum: ['critical', 'high', 'medium', 'low']
        },
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

    // Get AI analysis
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: responseSchema,
      add_context_from_internet: true
    });

    // Create alert with notification
    const alert = await createSafetyAlertWithNotification(
      {
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
      },
      userEmail
    );

    // Create in-app notification only if there are flagged ingredients
    const flaggedIngredientsList = (analysis.flagged_ingredients || []).map(f => f.ingredient);
    if (flaggedIngredientsList.length > 0) {
      try {
        await createSafetyNotification({
          productName,
          severity: analysis.severity === 'critical' || analysis.severity === 'high' ? 'critical' : 'warning',
          flaggedIngredients: flaggedIngredientsList,
          action_url: alertType === 'product_scan' ? '/BarcodeScanner' : alertType === 'simulator' ? '/Simulator' : '/generator'
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }
    }

    return {
      alert,
      analysis,
      shouldWarn: analysis.severity === 'critical' || analysis.severity === 'high'
    };
  } catch (error) {
    console.error('Error analyzing product for safety:', error);
    throw error;
  }
}