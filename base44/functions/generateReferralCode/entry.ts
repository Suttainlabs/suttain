import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Return existing code if already has one
        if (user.referral_code) {
            return Response.json({ referral_code: user.referral_code });
        }

        // Generate a unique 8-char code from name + random
        const prefix = (user.full_name || 'S').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
        const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        const referral_code = `${prefix}${suffix}`;

        await base44.auth.updateMe({ referral_code });

        console.log(`Generated referral code ${referral_code} for ${user.email}`);

        return Response.json({ referral_code });
    } catch (error) {
        console.error('generateReferralCode error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});