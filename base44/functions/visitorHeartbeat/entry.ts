import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { session_id, current_page } = await req.json();

        if (!session_id) {
            return Response.json({ error: 'session_id required' }, { status: 400 });
        }

        const now = new Date().toISOString();

        // Find existing session log
        const existing = await base44.asServiceRole.entities.VisitorLog.filter({ session_id });

        if (existing && existing.length > 0) {
            // Update last_seen and current_page on the existing record
            await base44.asServiceRole.entities.VisitorLog.update(existing[0].id, {
                last_seen: now,
                current_page: current_page || existing[0].page || '/'
            });
            return Response.json({ success: true, updated: true });
        }

        // Session not tracked yet, create a minimal record (geo data will fill in via trackVisitor)
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || '0.0.0.0';

        let country = 'Unknown';
        let country_code = 'XX';
        let region = 'Unknown';
        let city = 'Unknown';

        if (ip && ip !== '0.0.0.0' && ip !== '127.0.0.1' && !ip.startsWith('192.168') && !ip.startsWith('10.')) {
            try {
                const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
                    headers: { 'User-Agent': 'Suttain/1.0' }
                });
                if (geoRes.ok) {
                    const geo = await geoRes.json();
                    if (!geo.error) {
                        country = geo.country_name || 'Unknown';
                        country_code = geo.country_code || 'XX';
                        region = geo.region || 'Unknown';
                        city = geo.city || 'Unknown';
                    }
                }
            } catch (e) {
                console.error('Geo lookup failed:', e.message);
            }
        }

        await base44.asServiceRole.entities.VisitorLog.create({
            country,
            country_code,
            region,
            city,
            page: current_page || '/',
            current_page: current_page || '/',
            session_id,
            last_seen: now
        });

        return Response.json({ success: true, created: true });

    } catch (error) {
        console.error('visitorHeartbeat error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});