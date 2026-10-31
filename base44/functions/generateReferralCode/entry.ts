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
        const bytes = crypto.getRandomValues(new Uint8Array(5));
        const suffix = Array.from(bytes, b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
        const referral_code = `${prefix}${suffix}`;

        // referral_code is write-protected on User; set it server-side only.
        await base44.asServiceRole.entities.User.update(user.id, { referral_code });

        return Response.json({ referral_code });
    } catch (error) {
        console.error('generateReferralCode error:', error.message);
        return Response.json({ error: 'Unable to create a referral code.' }, { status: 500 });
    }
});