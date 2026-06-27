import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@4.0.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

        // Find users inactive for 14+ days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 14);
        const cutoffISO = cutoff.toISOString();

        const allUsers = await base44.asServiceRole.entities.User.filter({});
        const inactiveUsers = allUsers.filter(u => {
            if (!u.last_active_date) return false;
            return new Date(u.last_active_date) < new Date(cutoffISO);
        });

        console.log(`Found ${inactiveUsers.length} inactive users to re-engage`);

        let sent = 0;
        for (const u of inactiveUsers) {
            if (!u.email) continue;
            const firstName = (u.full_name || 'there').split(' ')[0];
            await resend.emails.send({
                from: 'Suttain <contact@suttain.com>',
                to: u.email,
                cc: 'contact@suttain.com',
                reply_to: 'contact@suttain.com',
                subject: `${firstName}, your formulas are waiting`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                        <div style="background: linear-gradient(135deg, #02988C, #09D2FF); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">We miss you, ${firstName}</h1>
                        </div>
                        <div style="background: white; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
                            <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                                It's been a while since your last simulation. Here's what you can do today:
                            </p>
                            <ul style="color: #475569; line-height: 2;">
                                <li>Run a new chemical safety simulation</li>
                                <li>Generate a clean formula for your next product</li>
                                <li>Scan a product barcode for ingredient insights</li>
                            </ul>
                            <div style="text-align: center; margin-top: 32px;">
                                <a href="https://suttain.com/Simulator" style="background: #02988C; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px;">
                                    Back to Suttain
                                </a>
                            </div>
                            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
                                You're receiving this because you signed up at suttain.com
                            </p>
                        </div>
                    </div>
                `
            });
            sent++;
        }

        return Response.json({ success: true, sent });
    } catch (error) {
        console.error('sendReEngagementEmail error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});