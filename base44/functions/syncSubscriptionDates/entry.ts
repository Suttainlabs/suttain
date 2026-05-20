import StripeLib from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stripe = new StripeLib(Deno.env.get('STRIPE_SECRET_KEY'));

    // Get all users with a stripe_subscription_id
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const proUsers = allUsers.filter(u => u.stripe_subscription_id);

    const results = { updated: 0, skipped: 0, errors: 0 };

    for (const u of proUsers) {
      try {
        const sub = await stripe.subscriptions.retrieve(u.stripe_subscription_id);
        if (sub.current_period_end) {
          const endDate = new Date(sub.current_period_end * 1000).toISOString();
          await base44.asServiceRole.entities.User.update(u.id, {
            subscription_end_date: endDate,
          });
          console.log(`Synced ${u.email}: ends ${endDate}`);
          results.updated++;
        } else {
          results.skipped++;
        }
      } catch (e) {
        console.error(`Failed for user ${u.email}:`, e.message);
        results.errors++;
      }
    }

    return Response.json({ success: true, ...results, total: proUsers.length });
  } catch (error) {
    console.error('syncSubscriptionDates error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});