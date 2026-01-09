import { base44 } from '@/api/base44Client';
import { createFeatureUsageNotification } from '../notifications/notificationUtils';

/**
 * Send email and in-app notification when user uses a feature
 */
export async function sendFeatureUsageEmail(user, featureType, details = {}) {
  if (!user?.email) return;

  const featureTemplates = {
    simulation: {
      subject: 'Chemical Simulation Completed - Suttain',
      body: `Hi ${user.full_name || 'there'},

Your chemical simulation has been completed!

Chemicals tested: ${details.chemicals?.join(', ') || 'N/A'}
Risk Score: ${details.riskScore || 'N/A'}
Safety Level: ${details.safetyLevel || 'N/A'}

${details.recommendation ? `Recommendation: ${details.recommendation}` : ''}

View your full results and safer alternatives in the Suttain app.

Stay safe,
The Suttain Team`
    },
    formula: {
      subject: 'Formula Created - Suttain',
      body: `Hi ${user.full_name || 'there'},

Your formula "${details.formulaName || 'New Formula'}" has been created!

Product Type: ${details.productType || 'N/A'}
Ingredients: ${details.ingredientCount || 0} ingredients
Mode: ${details.businessMode ? 'Business' : 'Individual'}

View and customize your formula in the Suttain app.

Happy formulating,
The Suttain Team`
    },
    barcode_scan: {
      subject: 'Product Scanned - Suttain',
      body: `Hi ${user.full_name || 'there'},

You scanned a product!

Product: ${details.productName || 'Unknown Product'}
Brand: ${details.brand || 'Unknown'}
Barcode: ${details.barcode || 'N/A'}
Risk Level: ${details.riskLevel || 'Unknown'}

${details.ingredientCount ? `Contains ${details.ingredientCount} identified ingredients.` : ''}

View the full analysis in the Suttain app.

Stay informed,
The Suttain Team`
    },
    compliance_check: {
      subject: 'Compliance Check Completed - Suttain',
      body: `Hi ${user.full_name || 'there'},

Your compliance check is complete!

Product: ${details.productName || 'N/A'}
Regions Checked: ${details.regions?.join(', ') || 'N/A'}
Status: ${details.status || 'N/A'}

View the detailed compliance report in the Suttain app.

Best regards,
The Suttain Team`
    },
    safety_profile: {
      subject: 'Safety Profile Updated - Suttain',
      body: `Hi ${user.full_name || 'there'},

Your safety profile "${details.profileName || 'Safety Profile'}" has been ${details.action || 'updated'}!

${details.conditionsCount ? `Health Conditions: ${details.conditionsCount}` : ''}
${details.allergiesCount ? `Allergies: ${details.allergiesCount}` : ''}

You'll now receive personalized alerts based on this profile.

Stay safe,
The Suttain Team`
    }
  };

  const template = featureTemplates[featureType];
  if (!template) return;

  // In-app notification templates
  const inAppTemplates = {
    simulation: {
      title: '🧪 Simulation Complete',
      message: `Your chemical simulation is ready. Risk Score: ${details.riskScore || 'N/A'}, Safety Level: ${details.safetyLevel || 'N/A'}`,
      action_url: '/Simulator'
    },
    formula: {
      title: '🧬 Formula Created',
      message: `"${details.formulaName || 'New Formula'}" has been created with ${details.ingredientCount || 0} ingredients.`,
      action_url: '/generator'
    },
    barcode_scan: {
      title: '📱 Product Scanned',
      message: `"${details.productName || 'Product'}" has been analyzed. Risk Level: ${details.riskLevel || 'Unknown'}`,
      action_url: '/BarcodeScanner'
    }
  };

  try {
    // Send email notification via Resend
    await base44.functions.invoke('sendEmailResend', {
      type: 'feature_usage',
      data: {
        userName: user.full_name || 'there',
        userEmail: user.email,
        featureType,
        details
      }
    });

    // Send Slack notification to team
    await base44.functions.invoke('sendSlackNotification', {
      channel: '#all-suttain',
      type: 'feature_usage',
      data: {
        userName: user.full_name || 'User',
        featureType,
        details
      }
    });

    // Create in-app notification for simulator, scanner, and generator
    const inAppTemplate = inAppTemplates[featureType];
    if (inAppTemplate) {
      await createFeatureUsageNotification({
        featureType,
        title: inAppTemplate.title,
        message: inAppTemplate.message,
        details,
        action_url: inAppTemplate.action_url
      });
    }
  } catch (error) {
    console.error(`Failed to send ${featureType} notification:`, error);
  }
}