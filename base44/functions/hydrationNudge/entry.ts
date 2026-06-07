import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Scheduled function: runs once per day (e.g. 6pm local = ~23:00 UTC for US Central).
 * Scans all HydrationProfile records, checks today's intake vs goal,
 * and creates a Notification for users who are behind their goal.
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const today = new Date().toISOString().split('T')[0];

        // Fetch all hydration profiles (service role — we're running as a scheduled task)
        const profiles = await base44.asServiceRole.entities.HydrationProfile.list('-created_date', 500);

        if (!profiles.length) {
            return Response.json({ message: 'No hydration profiles found.', notified: 0 });
        }

        let notified = 0;

        for (const profile of profiles) {
            const userId = profile.created_by_id;
            if (!userId) continue;

            // Get today's logs for this user
            const logs = await base44.asServiceRole.entities.HydrationLog.filter(
                { log_date: today, created_by_id: userId },
                '-logged_at',
                200
            );

            const totalIntake = logs.reduce((sum, l) => sum + (l.amount_ml || 0), 0);

            // Calculate goal with basic adjustments (mirrors useHydration logic)
            const baseGoal = profile.base_goal_ml || 2000;
            const actBonus = { sedentary: 0, light: 150, moderate: 300, active: 500, very_active: 700 }[profile.activity_level] || 0;
            const climBonus = { cool: 0, moderate: 100, hot: 300, humid: 250 }[profile.climate] || 0;
            const trueGoal = baseGoal + actBonus + climBonus;

            const pct = trueGoal > 0 ? (totalIntake / trueGoal) * 100 : 100;

            // Only nudge users who are below 70% of their goal
            if (pct >= 70) continue;

            const remaining = trueGoal - totalIntake;
            const remainingCups = Math.ceil(remaining / 250);

            let title, message, severity;

            if (pct < 30) {
                title = 'Critical hydration shortfall today';
                message = `You have only consumed ${totalIntake}ml of your ${trueGoal}ml goal today — just ${Math.round(pct)}%. That is roughly ${remainingCups} cups remaining. Dehydration at this level can impair focus and physical performance.`;
                severity = 'critical';
            } else if (pct < 50) {
                title = 'You are falling behind on hydration';
                message = `You are at ${Math.round(pct)}% of your daily water goal (${totalIntake}ml of ${trueGoal}ml). Try drinking ${remainingCups} more cups before the day ends.`;
                severity = 'warning';
            } else {
                title = 'Almost there — keep hydrating';
                message = `Good progress today: ${Math.round(pct)}% of your ${trueGoal}ml goal reached. Just ${remainingCups} more cups to finish strong.`;
                severity = 'info';
            }

            // Avoid duplicate nudges — check if one already exists for today
            const existing = await base44.asServiceRole.entities.Notification.filter(
                { target_user: userId, type: 'system' },
                '-created_date',
                5
            );

            const alreadySent = existing.some(n =>
                n.title === title && n.created_date && n.created_date.startsWith(today)
            );

            if (alreadySent) continue;

            await base44.asServiceRole.entities.Notification.create({
                title,
                message,
                type: 'system',
                severity,
                target_user: userId,
                action_url: '/HydrationHome',
                metadata: { totalIntake, trueGoal, pct: Math.round(pct), date: today }
            });

            notified++;
        }

        console.log(`Hydration nudge complete. Notified ${notified} users.`);
        return Response.json({ success: true, notified, date: today });
    } catch (error) {
        console.error('Hydration nudge error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});