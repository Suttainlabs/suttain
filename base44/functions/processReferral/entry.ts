import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
    if (req.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } });
    }
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me().catch(() => null);

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json().catch(() => null);
        if (typeof body?.referral_code !== 'string' || body.referral_code.length > 10) {
            return Response.json({ error: 'Invalid referral code' }, { status: 400 });
        }
        const referral_code = body.referral_code.trim().toUpperCase();
        if (!/^[A-Z0-9]{1,10}$/.test(referral_code)) {
            return Response.json({ error: 'Invalid referral code' }, { status: 400 });
        }

        // Don't allow self-referral
        if (user.referral_code === referral_code) {
            return Response.json({ error: 'Cannot use your own referral code' }, { status: 400 });
        }

        // Don't re-apply if already referred
        if (user.referred_by) {
            return Response.json({ error: 'Already used a referral code' }, { status: 400 });
        }

        // Find the referring user
        const allUsers = await base44.asServiceRole.entities.User.filter({ referral_code }, '-created_date', 2);
        if (!allUsers || allUsers.length !== 1) {
            return Response.json({ error: 'Invalid referral code' }, { status: 404 });
        }

        const referrer = allUsers[0];
        if (referrer.id === user.id) {
            return Response.json({ error: 'Cannot use your own referral code' }, { status: 400 });
        }

        // A submitted code is attribution only, not proof of a genuine referral.
        // Never award points from this caller-controlled flow, including for admins.
        // Future rewards must use independently verified, deduplicated evidence.
        await base44.auth.updateMe({ referred_by: referral_code });

        return Response.json({
            success: true,
            rewarded: false,
            message: 'Referral code recorded. Automatic referral rewards are paused until verification is available.'
        });
    } catch (error) {
        console.error('processReferral error:', error.message);
        return Response.json({ error: 'Unable to record the referral code.' }, { status: 500 });
    }
}