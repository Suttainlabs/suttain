import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { referral_code } = await req.json();

        if (!referral_code) {
            return Response.json({ error: 'No referral code provided' }, { status: 400 });
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
        const allUsers = await base44.asServiceRole.entities.User.filter({ referral_code });
        if (!allUsers || allUsers.length === 0) {
            return Response.json({ error: 'Invalid referral code' }, { status: 404 });
        }

        const referrer = allUsers[0];

        // Mark current user as referred
        await base44.auth.updateMe({ referred_by: referral_code });

        // Award 100 points to the referrer
        const newPoints = (referrer.reward_points || 0) + 100;
        await base44.asServiceRole.entities.User.update(referrer.id, { reward_points: newPoints });

        console.log(`Referral processed: ${referrer.email} earned 100 points for referring ${user.email}`);

        return Response.json({ 
            success: true, 
            message: 'Referral applied. Your referrer has been rewarded 100 points.' 
        });
    } catch (error) {
        console.error('processReferral error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});