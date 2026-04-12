import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { session_id, page } = await req.json();

        if (!session_id) {
            return Response.json({ error: 'session_id required' }, { status: 400 });
        }

        // Check if this session was already logged to avoid duplicates
        const existing = await base44.asServiceRole.entities.VisitorLog.filter({ session_id });
        if (existing && existing.length > 0) {
            return Response.json({ message: 'Already tracked' });
        }

        // Get visitor IP from request headers
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || '0.0.0.0';

        // Use ipapi.co to get geo data (free, no API key needed)
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
            page: page || '/',
            session_id
        });

        console.log(`Tracked visitor: ${country} (${ip})`);
        return Response.json({ success: true, country, region });

    } catch (error) {
        console.error('trackVisitor error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});