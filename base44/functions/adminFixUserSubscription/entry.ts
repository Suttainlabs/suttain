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

    const update: Record<string, unknown> = {};
    if (plan !== undefined) update.subscription_plan = plan;
    if (status !== undefined) update.subscription_status = status;
    if (billing !== undefined) update.subscription_billing = billing;
    if (subscription_end_date !== undefined) update.subscription_end_date = subscription_end_date;

    await base44.asServiceRole.entities.User.update(userId, update);

    console.log(`Admin updated subscription for user ${userId}:`, update);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Fix error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});