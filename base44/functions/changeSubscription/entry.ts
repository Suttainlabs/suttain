import Stripe from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { planFromSubscription } from '../../shared/stripePlans.ts';

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

    // A higher tier or a switch to yearly bills immediately. Those changes use
    // pending_if_incomplete: Stripe applies the new price only once the invoice is paid.
    const tierRank = { starter: 1, pro: 2, academic: 3 };
    const currentPlan = user.subscription_plan || 'starter';
    const newPlanName = PLAN_NAMES[targetPlan];
    const newBilling = BILLING_CYCLES[targetPlan];
    const currentInterval = subscription.items.data[0]?.price?.recurring?.interval;
    const chargesNow = (tierRank[newPlanName] || 0) > (tierRank[currentPlan] || 0)
      || (newBilling === 'yearly' && currentInterval !== 'year');

    if (!chargesNow) {
      // Downgrades take effect without an immediate charge; credit applies to the next invoice.
      const updated = await stripe.subscriptions.update(stripeSubscriptionId, {
        items: [{ id: itemId, price: PRICE_MAP[targetPlan] }],
        proration_behavior: 'create_prorations',
      });
      await base44.asServiceRole.entities.User.update(user.id, {
        subscription_plan: newPlanName,
        subscription_billing: newBilling,
        ...(updated.current_period_end && {
          subscription_end_date: new Date(updated.current_period_end * 1000).toISOString(),
        }),
      });
      console.log(`Subscription downgraded to ${targetPlan} for user ${user.id}`);
      return Response.json({ success: true, status: 'applied', plan: newPlanName, billing: newBilling });
    }

    const updated = await stripe.subscriptions.update(stripeSubscriptionId, {
      items: [{ id: itemId, price: PRICE_MAP[targetPlan] }],
      proration_behavior: 'always_invoice',
      payment_behavior: 'pending_if_incomplete',
      expand: ['latest_invoice'],
    });

    const current = planFromSubscription(updated);
    if (current && current.plan === newPlanName && current.billing === newBilling) {
      // Stripe collected payment and applied the change; the webhook confirms the same state.
      await base44.asServiceRole.entities.User.update(user.id, {
        subscription_plan: current.plan,
        subscription_billing: current.billing,
        ...(updated.current_period_end && {
          subscription_end_date: new Date(updated.current_period_end * 1000).toISOString(),
        }),
      });
      console.log(`Upgrade to ${targetPlan} paid and applied for user ${user.id}`);
      return Response.json({ success: true, status: 'applied', plan: current.plan, billing: current.billing });
    }

    // Payment failed or needs the customer's confirmation. The current plan stays in place;
    // paying the invoice applies the upgrade, and the webhook then switches the plan.
    const invoice = updated.latest_invoice;
    console.log(`Upgrade to ${targetPlan} awaiting payment for user ${user.id}, invoice ${invoice?.id}`);
    return Response.json({
      success: false,
      status: 'payment_required',
      invoice_url: invoice?.hosted_invoice_url || null,
    });
  } catch (error) {
    console.error('changeSubscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});