import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

    const { userId, plan, status, billing } = await req.json();

    await base44.asServiceRole.entities.User.update(userId, {
      subscription_plan: plan,
      subscription_status: status,
      subscription_billing: billing,
    });

    console.log(`Admin fixed subscription for user ${userId}: ${plan}/${status}/${billing}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Fix error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});