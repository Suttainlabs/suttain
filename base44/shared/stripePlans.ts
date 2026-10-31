// Server-owned map of recurring Stripe prices to app plans.
export const PRICE_ID_TO_PLAN: Record<string, string> = {
  'price_1Tn2eSI9tsZ7WvXe3JMrHrYf': 'starter',
  'price_1Tn2eSI9tsZ7WvXeVksFLuTl': 'starter',
  'price_1Tn2eSI9tsZ7WvXeJuOqhhJa': 'pro',
  'price_1Tn2eSI9tsZ7WvXePJt1xh7M': 'pro',
  'price_1Tn2eSI9tsZ7WvXemMKTBrgC': 'academic',
  'price_1Tn2eSI9tsZ7WvXePwoaGUvP': 'academic',
};

// Plan and billing a subscription is actually on in Stripe right now.
// Returns null while a change is still waiting for payment, or for unknown prices.
export function planFromSubscription(subscription: any) {
  if (!subscription || subscription.pending_update) return null;
  if (!['active', 'trialing'].includes(subscription.status)) return null;
  const price = subscription.items?.data?.[0]?.price;
  const plan = price?.id && PRICE_ID_TO_PLAN[price.id];
  if (!plan) return null;
  return { plan, billing: price.recurring?.interval === 'year' ? 'yearly' : 'monthly' };
}