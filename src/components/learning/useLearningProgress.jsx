import { base44 } from '@/api/base44Client';

/**
 * Send learning completion email and Slack notification when user completes a course/tutorial
 */
export async function sendLearningCompletionEmail(user, courseName) {
  if (!user?.email) return;

  try {
    // Send email
    await base44.functions.invoke('sendEmailResend', {
      type: 'learning_complete',
      data: {
        userName: user.full_name || 'there',
        userEmail: user.email,
        courseName
      }
    });

    // Send Slack notification
    await base44.functions.invoke('sendSlackNotification', {
      type: 'learning_complete',
      data: {
        userName: user.full_name || 'User',
        courseName
      }
    });
  } catch (error) {
    console.error('Failed to send learning completion notification:', error);
  }
}