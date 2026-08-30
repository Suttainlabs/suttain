import { base44 } from '@/api/base44Client';

/**
 * Analyzes a product/formula against the user's safety profile and creates
 * alerts + email/in-app notifications.
 *
 * Runs entirely server-side via the `analyzeSafetyAlerts` backend function to
 * protect integration credits: the LLM hazard analysis and all alert emails
 * execute with the service role, never from the client.
 */
export async function analyzeAndCreateAlerts({
  productName,
  ingredients,
  alertType,
  profileId,
  userEmail,
  additionalContext = {}
}) {
  const res = await base44.functions.invoke('analyzeSafetyAlerts', {
    productName,
    ingredients,
    alertType,
    profileId,
    additionalContext
  });
  return res?.data !== undefined ? res.data : res;
}