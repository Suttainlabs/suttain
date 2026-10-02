import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { prepareVisitorRequest, visitorGeo } from '../../shared/visitorTracking.ts';

export default async function(req) {
    try {
        const base44 = createClientFromRequest(req);
        const { session_id, page, ip } = await prepareVisitorRequest(req, base44, 'current_page');
        const now = new Date().toISOString();
        const existing = await base44.asServiceRole.entities.VisitorLog.filter({ session_id }, undefined, 1);
        if (existing.length) {
            await base44.asServiceRole.entities.VisitorLog.update(existing[0].id, { last_seen: now, current_page: page });
            return Response.json({ success: true, updated: true });
        }
        const geo = await visitorGeo(ip);
        await base44.asServiceRole.entities.VisitorLog.create({ ...geo, page, current_page: page, session_id, last_seen: now });
        return Response.json({ success: true, created: true });
    } catch (error) {
        console.error('visitorHeartbeat error:', error.message);
        return Response.json({ error: error.status ? error.message : 'Tracking failed' }, { status: error.status || 500 });
    }
}