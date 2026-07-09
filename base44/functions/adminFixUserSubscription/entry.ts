import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, plan, status, billing, subscription_end_date } = await req.json();

    if (!userId || typeof userId !== 'string') {
      return Response.json({ error: 'Valid userId is required' }, { status: 400 });
    }

    // Verify the target user actually exists before performing the update.
    // This prevents blind IDOR attempts against non-existent or arbitrary IDs.
    let targetUsers;
    try {
      targetUsers = await base44.asServiceRole.entities.User.filter({ id: userId });
    } catch {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    if (!targetUsers || targetUsers.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Whitelist only subscription-related fields — prevent arbitrary field writes.
    const update: Record<string, unknown> = {};
    if (plan !== undefined) update.subscription_plan = plan;
    if (status !== undefined) update.subscription_status = status;
    if (billing !== undefined) update.subscription_billing = billing;
    if (subscription_end_date !== undefined) update.subscription_end_date = subscription_end_date;

    if (Object.keys(update).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await base44.asServiceRole.entities.User.update(userId, update);

    console.log(`Admin updated subscription for user ${userId}:`, update);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Fix error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});