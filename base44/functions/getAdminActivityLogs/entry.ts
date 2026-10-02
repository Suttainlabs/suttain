import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireUser } from '../../shared/securityGuards.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    await requireUser(base44, true);
    const logs = await base44.asServiceRole.entities.VisitorLog.list('-last_seen', 200);
    return Response.json({ logs });
  } catch (error) {
    console.error('getAdminActivityLogs error:', error.message);
    return Response.json({ error: error.status ? error.message : 'Unable to load activity logs' }, { status: error.status || 500 });
  }
}