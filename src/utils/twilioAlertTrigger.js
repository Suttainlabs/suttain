import { base44 } from "@/api/base44Client";

/**
 * Triggers a Twilio SMS/WhatsApp alert if the user has alerts enabled
 * and the product risk level is High or Critical.
 */
export async function triggerSafetyAlertIfNeeded({ user, productName, riskLevel, regulatoryAlert, flaggedIngredients, reportUrl }) {
  if (!user) return;
  if (!user.twilio_alerts_enabled) return;
  if (!user.twilio_phone) return;

  const shouldAlert = ['high', 'critical'].includes((riskLevel || '').toLowerCase());
  const hasRegulatoryAlert = !!regulatoryAlert;

  if (!shouldAlert && !hasRegulatoryAlert) return;

  try {
    await base44.functions.invoke("sendTwilioAlert", {
      to: user.twilio_phone,
      channel: user.twilio_channel || 'whatsapp',
      productName,
      riskLevel,
      regulatoryAlert,
      flaggedIngredients: flaggedIngredients || [],
      reportUrl: reportUrl || window.location.href
    });
    console.log('Twilio safety alert sent for:', productName);
  } catch (err) {
    // Non-blocking — don't interrupt the user's flow
    console.error('Twilio alert failed (non-blocking):', err.message);
  }
}