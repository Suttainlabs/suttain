import Stripe from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Same price IDs as createCheckoutSession
const PRICE_MAP = {
  pro_monthly: 'price_1TOUN1I9tsZ7WvXe30IECjgi',
  pro_yearly: 'price_1TOUN1I9tsZ7WvXemErMam6J',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetPlan } = await req.json();

    if (!PRICE_MAP[targetPlan]) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const stripeSubscriptionId = user.stripe_subscription_id;
    if (!stripeSubscriptionId) {
      return Response.json({ error: 'No active subscription found' }, { status: 400 });
    }

    // Fetch current subscription to get the subscription item ID
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const itemId = subscription.items.data[0]?.id;

    if (!itemId) {
      return Response.json({ error: 'Subscription item not found' }, { status: 400 });
    }

    // Update subscription to new price — prorates automatically
    const updated = await stripe.subscriptions.update(stripeSubscriptionId, {
      items: [{ id: itemId, price: PRICE_MAP[targetPlan] }],
      proration_behavior: 'always_invoice',
    });

    const newBilling = targetPlan === 'pro_yearly' ? 'yearly' : 'monthly';

    // Update user record
    await base44.asServiceRole.entities.User.update(user.id, {
      subscription_billing: newBilling,
      subscription_status: 'active',
      subscription_cancel_at: null,
    });

    console.log(`Subscription changed to ${targetPlan} for user ${user.id}`);
    return Response.json({ success: true, billing: newBilling });
  } catch (error) {
    console.error('changeSubscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});