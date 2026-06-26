import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Converts a UTC Date to a user's local date/time components using their IANA timezone.
 * Falls back to UTC if timezone is missing or invalid.
 */
function getLocalTime(date, tz) {
    try {
        const opts = { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
        const parts = new Intl.DateTimeFormat('en-CA', opts).formatToParts(date);
        const get = (type) => parts.find(p => p.type === type)?.value || '00';
        return {
            date: `${get('year')}-${get('month')}-${get('day')}`,
            hour: parseInt(get('hour')),
            minute: parseInt(get('minute')),
            minutes: parseInt(get('hour')) * 60 + parseInt(get('minute'))
        };
    } catch {
        // Fallback: treat as UTC
        const iso = date.toISOString();
        return {
            date: iso.substring(0, 10),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes(),
            minutes: date.getUTCHours() * 60 + date.getUTCMinutes()
        };
    }
}

/**
 * Scheduled function: runs every 30 minutes.
 * For each user with smart_reminders=true, checks:
 * 1. Current time is within their reminder window (using their local timezone)
 * 2. Enough time has passed since their last reminder (based on reminder_frequency)
 * 3. They haven't hit their goal yet
 * Then creates an in-app Notification and sends an email reminder.
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const now = new Date();

        const profiles = await base44.asServiceRole.entities.HydrationProfile.list('-created_date', 500);

        if (!profiles.length) {
            return Response.json({ message: 'No hydration profiles found.', notified: 0 });
        }

        // Build a userId->email map upfront to avoid N+1 queries in the loop
        const userIds = [...new Set(profiles.map(p => p.created_by_id).filter(Boolean))];
        const userEmailMap = {};
        try {
            const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
            for (const u of allUsers) {
                userEmailMap[u.id] = u.email;
            }
        } catch (userErr) {
            console.error('Failed to fetch users for email map:', userErr.message);
        }

        let notified = 0;

        for (const profile of profiles) {
            const userId = profile.created_by_id;
            if (!userId) continue;

            // Skip users who have reminders disabled
            if (!profile.smart_reminders) continue;

            const userEmail = userEmailMap[userId];
            if (!userEmail) continue;

            // Get user's local time using their stored timezone (fallback: UTC)
            const tz = profile.timezone || 'UTC';
            const local = getLocalTime(now, tz);
            const today = local.date;

            // Parse reminder window (stored as HH:MM in user's local time)
            const startParts = (profile.reminder_start || '07:00').split(':');
            const endParts = (profile.reminder_end || '22:00').split(':');
            const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
            const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);

            // Check if current LOCAL time is within the reminder window
            if (local.minutes < startMinutes || local.minutes > endMinutes) {
                continue; // Outside reminder window for this user
            }

            // Get today's logs for this user (using local date)
            const logs = await base44.asServiceRole.entities.HydrationLog.filter(
                { log_date: today, created_by_id: userId },
                '-logged_at',
                200
            );

            const totalIntake = logs.reduce((sum, l) => sum + (l.amount_ml || 0), 0);

            // Calculate goal
            const baseGoal = profile.base_goal_ml || 2000;
            const actBonus = { sedentary: 0, light: 150, moderate: 300, active: 500, very_active: 700 }[profile.activity_level] || 0;
            const climBonus = { cool: 0, moderate: 100, hot: 300, humid: 250 }[profile.climate] || 0;
            const trueGoal = baseGoal + actBonus + climBonus;

            const pct = trueGoal > 0 ? (totalIntake / trueGoal) * 100 : 100;

            // Skip if already at or above goal
            if (pct >= 100) continue;

            // Check last reminder sent — enforce frequency
            const freqMins = parseInt(profile.reminder_frequency || '60') || 60;

            const recentNotifs = await base44.asServiceRole.entities.Notification.filter(
                { target_user: userEmail, type: 'system' },
                '-created_date',
                10
            );

            const lastHydrationNotif = recentNotifs.find(n =>
                n.metadata?.hydration_reminder === true &&
                n.metadata?.date === today
            );

            if (lastHydrationNotif) {
                const lastSentAt = new Date(lastHydrationNotif.created_date);
                const minutesSinceLast = (now - lastSentAt) / 60000;
                if (minutesSinceLast < freqMins) continue; // Too soon
            }

            // Only send ONE email per day — check if we already sent an email today
            const alreadyEmailedToday = recentNotifs.find(n =>
                n.metadata?.hydration_reminder === true &&
                n.metadata?.email_sent === true &&
                n.metadata?.date === today
            );

            // Build reminder message based on style
            const style = profile.reminder_style || 'gentle';
            const remaining = trueGoal - totalIntake;
            const remainingOz = (remaining / 29.5735).toFixed(0);
            const totalOz = (trueGoal / 29.5735).toFixed(0);
            const doneOz = (totalIntake / 29.5735).toFixed(0);

            let title, message;

            if (style === 'motivational') {
                title = 'Keep going — you can do this!';
                message = `You have had ${doneOz} oz so far. Just ${remainingOz} oz left to hit your ${totalOz} oz goal today. You are ${Math.round(pct)}% of the way there.`;
            } else if (style === 'scientific') {
                title = 'Hydration science reminder';
                message = `Your brain is 75% water. At ${Math.round(pct)}% of your goal (${doneOz} oz of ${totalOz} oz), a ${100 - Math.round(pct)}% shortfall can reduce cognitive performance. Drink ${remainingOz} oz now.`;
            } else if (style === 'biological') {
                title = 'Biological hydration alert';
                message = `Your body needs ${remainingOz} more oz of water today to meet your personalised ${totalOz} oz goal. Your kidneys and cells depend on consistent hydration throughout the day.`;
            } else {
                // gentle (default)
                title = 'Time for a sip';
                message = `You are at ${Math.round(pct)}% of your daily goal. Drink ${remainingOz} oz more to reach ${totalOz} oz today.`;
            }

            // Create in-app notification
            await base44.asServiceRole.entities.Notification.create({
                title,
                message,
                type: 'system',
                severity: pct < 40 ? 'warning' : 'info',
                target_user: userEmail,
                action_url: '/HydrationHome',
                metadata: {
                    hydration_reminder: true,
                    email_sent: !alreadyEmailedToday,
                    totalIntake,
                    trueGoal,
                    pct: Math.round(pct),
                    date: today
                }
            });

            // Only send ONE email per day — subsequent reminders are in-app only
            try {
                if (userEmail && !alreadyEmailedToday) {
                    const resendKey = Deno.env.get('RESEND_API_KEY');
                    if (resendKey) {
                        await fetch('https://api.resend.com/emails', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${resendKey}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                from: 'Suttain Hydration <no-reply@suttain.com>',
                                to: userEmail,
                                subject: title,
                                html: `
                                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f0faf5;border-radius:16px;">
                                        <h2 style="color:#007850;margin-bottom:8px;">${title}</h2>
                                        <p style="color:#464646;font-size:15px;line-height:1.6;">${message}</p>
                                        <a href="https://suttain.com/HydrationHome"
                                           style="display:inline-block;margin-top:20px;padding:12px 28px;background:#007850;color:#fff;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px;">
                                            Log Water Now
                                        </a>
                                        <p style="color:#828282;font-size:12px;margin-top:24px;">
                                            You are receiving this because you have Smart Reminders enabled in Suttain. 
                                            <a href="https://suttain.com/HydrationReminders" style="color:#007850;">Manage reminders</a>
                                        </p>
                                    </div>
                                `
                            })
                        });
                    }
                }
            } catch (emailErr) {
                console.error('Email reminder failed for user', userId, emailErr.message);
            }

            notified++;
        }

        console.log(`Hydration nudge complete. Notified ${notified} users.`);
        return Response.json({ success: true, notified, date: now.toISOString().substring(0, 10) });
    } catch (error) {
        console.error('Hydration nudge error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});