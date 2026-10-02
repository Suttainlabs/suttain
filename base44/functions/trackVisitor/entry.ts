import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { prepareVisitorRequest, visitorGeo } from '../../shared/visitorTracking.ts';

export default async function(req) {
    try {
        const base44 = createClientFromRequest(req);
        const { session_id, page, ip } = await prepareVisitorRequest(req, base44, 'page');
        const existing = await base44.asServiceRole.entities.VisitorLog.filter({ session_id }, undefined, 1);
        if (existing.length) return Response.json({ message: 'Already tracked' });
        const geo = await visitorGeo(ip);
        await base44.asServiceRole.entities.VisitorLog.create({ ...geo, page, session_id });
        return Response.json({ success: true, country: geo.country, region: geo.region });
    } catch (error) {
        console.error('trackVisitor error:', error.message);
        return Response.json({ error: error.status ? error.message : 'Tracking failed' }, { status: error.status || 500 });
    }
}