import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireUser } from '../../shared/securityGuards.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    await requireUser(base44, true);
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
    const { userId } = await req.json();
    if (typeof userId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(userId)) {
      return Response.json({ error: 'Invalid userId' }, { status: 400 });
    }
    await base44.asServiceRole.entities.User.delete(userId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('adminDeleteUser error:', error.message);
    return Response.json({ error: error.status ? error.message : 'Unable to delete user' }, { status: error.status || 500 });
  }
}