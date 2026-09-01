import Stripe from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Unified price IDs, must match createCheckoutSession
const PRICE_MAP = {
  starter_monthly: 'price_1Tn2eSI9tsZ7WvXe3JMrHrYf',
  starter_yearly: 'price_1Tn2eSI9tsZ7WvXeVksFLuTl',
  pro_monthly: 'price_1Tn2eSI9tsZ7WvXeJuOqhhJa',
  pro_yearly: 'price_1Tn2eSI9tsZ7WvXePJt1xh7M',
  academic_monthly: 'price_1Tn2eSI9tsZ7WvXemMKTBrgC',
  academic_yearly: 'price_1Tn2eSI9tsZ7WvXePwoaGUvP',
};

const PLAN_NAMES = {
  starter_monthly: 'starter', starter_yearly: 'starter',
  pro_monthly: 'pro', pro_yearly: 'pro',
  academic_monthly: 'academic', academic_yearly: 'academic',
};

const BILLING_CYCLES = {
  starter_monthly: 'monthly', starter_yearly: 'yearly',
  pro_monthly: 'monthly', pro_yearly: 'yearly',
  academic_monthly: 'monthly', academic_yearly: 'yearly',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetPlan } = await req.json();

    if (!targetPlan || !PRICE_MAP[targetPlan]) {
      return Response.json({ error: 'Invalid plan. Valid options: ' + Object.keys(PRICE_MAP).join(', ') }, { status: 400 });
    }

    const stripeSubscriptionId = user.stripe_subscription_id;
    if (!stripeSubscriptionId) {
      return Response.json({ error: 'No active recurring subscription found. Lifetime and Free plans cannot be switched.' }, { status: 400 });
    }

    // Fetch current subscription to get the subscription item ID
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const itemId = subscription.items.data[0]?.id;

    if (!itemId) {
      return Response.json({ error: 'Subscription item not found' }, { status: 400 });
    }

    // Determine if this is an upgrade or downgrade for proration behavior
    // Upgrades: charge immediately (always_invoice)
    // Downgrades: apply at next cycle (create_prorations) to avoid immediate charge
    const tierRank = { starter: 1, pro: 2, academic: 3 };
    const currentPlan = user.subscription_plan || 'starter';
    const targetPlanName = PLAN_NAMES[targetPlan];
    const isUpgrade = (tierRank[targetPlanName] || 0) > (tierRank[currentPlan] || 0);

    // Update subscription to new price, Stripe handles pro-rata credit automatically
    const updated = await stripe.subscriptions.update(stripeSubscriptionId, {
      items: [{ id: itemId, price: PRICE_MAP[targetPlan] }],
      proration_behavior: isUpgrade ? 'always_invoice' : 'create_prorations',
    });

    const newBilling = BILLING_CYCLES[targetPlan];
    const newPlanName = PLAN_NAMES[targetPlan];

    // Update user record
    await base44.asServiceRole.entities.User.update(user.id, {
      subscription_plan: newPlanName,
      subscription_billing: newBilling,
      subscription_status: 'active',
      subscription_cancel_at: null,
      ...(updated.current_period_end && {
        subscription_end_date: new Date(updated.current_period_end * 1000).toISOString(),
      }),
    });

    console.log(`Subscription changed to ${targetPlan} for user ${user.id} (upgrade: ${isUpgrade})`);
    return Response.json({
      success: true,
      plan: newPlanName,
      billing: newBilling,
      prorated: isUpgrade,
    });
  } catch (error) {
    console.error('changeSubscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});