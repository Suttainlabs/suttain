import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import StripeLib from 'npm:stripe@17.7.0';

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

    // Fetch all users
    const users = await base44.asServiceRole.entities.User.list('-created_date', 200);

    // ── Sync stale subscription data from Stripe ──
    // Only sync users whose subscription_end_date is missing, in the past,
    // or within 3 days of expiring — avoids excessive Stripe API calls.
    const stripe = new StripeLib(Deno.env.get('STRIPE_SECRET_KEY'));
    const now = Date.now();
    const STALE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
    let syncedCount = 0;

    for (const u of users) {
      if (!u.stripe_subscription_id) continue;

      const endDateMs = u.subscription_end_date ? new Date(u.subscription_end_date).getTime() : 0;
      const isStale = !u.subscription_end_date || endDateMs < now || (endDateMs - now) < STALE_THRESHOLD_MS;
      if (!isStale) continue;

      try {
        const sub = await stripe.subscriptions.retrieve(u.stripe_subscription_id);
        const updateData = {};
        if (sub.current_period_end) {
          updateData.subscription_end_date = new Date(sub.current_period_end * 1000).toISOString();
        }
        if (sub.status) {
          updateData.subscription_status = sub.cancel_at_period_end ? 'canceling' : sub.status;
        }
        if (Object.keys(updateData).length > 0) {
          await base44.asServiceRole.entities.User.update(u.id, updateData);
          Object.assign(u, updateData);
          syncedCount++;
          console.log(`Synced ${u.email}: ${JSON.stringify(updateData)}`);
        }
      } catch (e) {
        console.error(`Failed to sync subscription for ${u.email}:`, e.message);
      }
    }

    if (syncedCount > 0) {
      console.log(`getAdminUsers: synced ${syncedCount} stale subscriptions from Stripe`);
    }

    return Response.json({ users, synced: syncedCount });
  } catch (error) {
    console.error('getAdminUsers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});