import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const logs = await base44.asServiceRole.entities.VisitorLog.list('-created_date', 5000);

        // Aggregate by country
        const countryMap = {};
        const regionMap = {};

        for (const log of logs) {
            const country = log.country || 'Unknown';
            countryMap[country] = (countryMap[country] || 0) + 1;

            const region = log.region && log.region !== 'Unknown' ? `${log.region}, ${log.country}` : country;
            regionMap[region] = (regionMap[region] || 0) + 1;
        }

        const countries = Object.entries(countryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 15);

        const regions = Object.entries(regionMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        return Response.json({
            total: logs.length,
            countries,
            regions
        });

    } catch (error) {
        console.error('getVisitorGeoStats error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});