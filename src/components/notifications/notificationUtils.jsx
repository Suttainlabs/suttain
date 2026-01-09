import { base44 } from '@/api/base44Client';

/**
 * Create a notification for the current user
 */
export async function createNotification({ title, message, type, severity = 'info', action_url = null, metadata = {} }) {
  try {
    const notification = await base44.entities.Notification.create({
      title,
      message,
      type,
      severity,
      action_url,
      metadata,
      is_read: false
    });

    // Check if email notifications are enabled
    const user = await base44.auth.me();
    const emailEnabled = user.notification_preferences?.email_notifications;

    // Send email for critical notifications if enabled
    if (severity === 'critical' && emailEnabled) {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `🚨 Critical Alert: ${title}`,
        body: `${message}\n\n${action_url ? `View details: ${window.location.origin}${action_url}` : ''}\n\nThis is an automated notification from Suttain.`
      });
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Create a safety alert notification
 */
export async function createSafetyNotification({ productName, severity, flaggedIngredients, action_url }) {
  // Only create notification if there are actual flagged ingredients
  if (!flaggedIngredients || flaggedIngredients.length === 0) {
    return null;
  }
  
  const message = `${flaggedIngredients.length} ingredient${flaggedIngredients.length > 1 ? 's' : ''} in "${productName}" may not be safe for your profile: ${flaggedIngredients.slice(0, 3).join(', ')}${flaggedIngredients.length > 3 ? '...' : ''}`;
  
  return createNotification({
    title: '⚠️ Safety Alert',
    message,
    type: 'safety',
    severity,
    action_url,
    metadata: { productName, flaggedIngredients }
  });
}

/**
 * Create a compliance notification
 */
export async function createComplianceNotification({ productName, issues, regions, action_url }) {
  return createNotification({
    title: '📋 Compliance Issue Detected',
    message: `"${productName}" has compliance issues in ${regions.join(', ')}. ${issues.length} issue${issues.length > 1 ? 's' : ''} found.`,
    type: 'compliance',
    severity: 'warning',
    action_url,
    metadata: { productName, issues, regions }
  });
}

/**
 * Create a subscription notification
 */
export async function createSubscriptionNotification({ title, message, action_url }) {
  return createNotification({
    title,
    message,
    type: 'subscription',
    severity: 'info',
    action_url
  });
}

/**
 * Create a feature release notification
 */
export async function createFeatureNotification({ featureName, description, action_url }) {
  return createNotification({
    title: `✨ New Feature: ${featureName}`,
    message: description,
    type: 'feature',
    severity: 'info',
    action_url
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId) {
  try {
    await base44.entities.Notification.update(notificationId, { is_read: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
  try {
    const notifications = await base44.entities.Notification.filter({ is_read: false });
    return notifications.length;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
}

/**
 * Create a feature usage notification (for simulator, scanner, generator)
 */
export async function createFeatureUsageNotification({ featureType, title, message, details = {}, action_url }) {
  return createNotification({
    title,
    message,
    type: 'feature',
    severity: 'info',
    action_url,
    metadata: { featureType, ...details }
  });
}