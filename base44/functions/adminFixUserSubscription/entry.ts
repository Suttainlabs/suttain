import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Strict server-side auth, role is read from the platform token, never
    // from client-supplied input. Let auth errors bubble as 401.
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, plan, status, billing, subscription_end_date } = body;

    if (!userId || typeof userId !== 'string') {
      return Response.json({ error: 'Valid userId is required' }, { status: 400 });
    }

    // An admin must not modify their own subscription via this endpoint.
    if (userId === user.id) {
      return Response.json({ error: 'Cannot modify your own subscription via this endpoint' }, { status: 403 });
    }

    // Verify the target user actually exists before performing the update.
    let targetUsers;
    try {
      targetUsers = await base44.asServiceRole.entities.User.filter({ id: userId });
    } catch {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    if (!targetUsers || targetUsers.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    // Prevent privilege escalation: admins cannot modify other admins.
    if (targetUsers[0].role === 'admin') {
      return Response.json({ error: "Cannot modify another admin's subscription" }, { status: 403 });
    }

    // Strict enum validation, reject any value outside the allowed sets.
    const ALLOWED_PLANS = ['free', 'starter', 'pro', 'academic', 'lifetime', 'enterprise'];
    const ALLOWED_STATUSES = ['none', 'active', 'canceling', 'canceled', 'past_due', 'trialing', 'paused'];
    const ALLOWED_BILLING = ['monthly', 'yearly', 'lifetime', null];

    // Whitelist only subscription-related fields with validated values.
    const update: Record<string, unknown> = {};
    if (plan !== undefined) {
      if (!ALLOWED_PLANS.includes(plan)) {
        return Response.json({ error: 'Invalid plan value' }, { status: 400 });
      }
      update.subscription_plan = plan;
    }
    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return Response.json({ error: 'Invalid status value' }, { status: 400 });
      }
      update.subscription_status = status;
    }
    if (billing !== undefined) {
      if (!ALLOWED_BILLING.includes(billing)) {
        return Response.json({ error: 'Invalid billing value' }, { status: 400 });
      }
      update.subscription_billing = billing;
    }
    if (subscription_end_date !== undefined) {
      if (subscription_end_date !== null && (typeof subscription_end_date !== 'string' || isNaN(Date.parse(subscription_end_date)))) {
        return Response.json({ error: 'Invalid subscription_end_date value' }, { status: 400 });
      }
      update.subscription_end_date = subscription_end_date;
    }

    if (Object.keys(update).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await base44.asServiceRole.entities.User.update(userId, update);

    console.log(`Admin ${user.email} updated subscription for user ${userId}:`, update);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Fix error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});