// Maps a checkout price key to the User.product_access value it unlocks.
// Shared by createCheckoutSession (writes it into session metadata) and
// stripeWebhook (applies it to the user after payment succeeds).
export const PRICE_KEY_ACCESS: Record<string, string> = {
  consumer_monthly: 'consumer',
  consumer_yearly: 'consumer',
  research_monthly: 'research',
  research_yearly: 'research',
  api_monthly: 'api',
  api_yearly: 'api',
  farm_monthly: 'farm',
  farm_yearly: 'farm',
};

export function accessForPriceKey(priceKey?: string | null): string | null {
  if (!priceKey) return null;
  return PRICE_KEY_ACCESS[priceKey] || null;
}

// Adds the purchased product to whatever the user already had, without
// dropping existing selections or creating duplicates.
export function mergeProductAccess(existing: unknown, value: string | null): string[] | null {
  if (!value) return null;
  const current = Array.isArray(existing) ? existing.filter((v) => typeof v === 'string') : [];
  if (current.includes(value)) return null;
  return [...current, value];
}