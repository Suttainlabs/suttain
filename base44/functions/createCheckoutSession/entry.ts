import Stripe from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Price IDs (USD base prices)
const PRICE_MAP = {
  pro_monthly: 'price_1TOUN1I9tsZ7WvXe30IECjgi',   // $4.99/month
  pro_yearly: 'price_1TOUN1I9tsZ7WvXemErMam6J',    // $49.99/year
  lifetime: 'price_1TTutoI9tsZ7WvXerSAlKmYE',      // $99.99 one-time
};

// Currency map by country code → { currency, symbol, monthly, yearly, lifetime }
const CURRENCY_MAP = {
  // Europe
  GB: { currency: 'gbp', symbol: '£', monthly: 3.99, yearly: 39.99, lifetime: 79.99 },
  DE: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99 },
  FR: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99 },
  IT: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99 },
  ES: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99 },
  NL: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99 },
  BE: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99 },
  AT: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99 },
  PT: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99 },
  SE: { currency: 'sek', symbol: 'kr', monthly: 52, yearly: 519, lifetime: 1049 },
  NO: { currency: 'nok', symbol: 'kr', monthly: 54, yearly: 539, lifetime: 1079 },
  DK: { currency: 'dkk', symbol: 'kr', monthly: 34, yearly: 339, lifetime: 679 },
  CH: { currency: 'chf', symbol: 'CHF', monthly: 4.59, yearly: 45.99, lifetime: 89.99 },
  PL: { currency: 'pln', symbol: 'zł', monthly: 19.99, yearly: 199, lifetime: 399 },
  // Asia-Pacific
  AU: { currency: 'aud', symbol: 'A$', monthly: 7.99, yearly: 79.99, lifetime: 149.99 },
  NZ: { currency: 'nzd', symbol: 'NZ$', monthly: 8.49, yearly: 84.99, lifetime: 159.99 },
  JP: { currency: 'jpy', symbol: '¥', monthly: 749, yearly: 7499, lifetime: 14999 },
  SG: { currency: 'sgd', symbol: 'S$', monthly: 6.79, yearly: 67.99, lifetime: 134.99 },
  HK: { currency: 'hkd', symbol: 'HK$', monthly: 38.99, yearly: 389, lifetime: 779 },
  IN: { currency: 'inr', symbol: '₹', monthly: 399, yearly: 3999, lifetime: 7999 },
  MY: { currency: 'myr', symbol: 'RM', monthly: 21.99, yearly: 219, lifetime: 439 },
  ID: { currency: 'idr', symbol: 'Rp', monthly: 74999, yearly: 749999, lifetime: 1499999 },
  PH: { currency: 'php', symbol: '₱', monthly: 279, yearly: 2799, lifetime: 5599 },
  TH: { currency: 'thb', symbol: '฿', monthly: 175, yearly: 1749, lifetime: 3499 },
  KR: { currency: 'krw', symbol: '₩', monthly: 6599, yearly: 65999, lifetime: 129999 },
  CN: { currency: 'cny', symbol: '¥', monthly: 35.99, yearly: 359, lifetime: 719 },
  // Americas
  CA: { currency: 'cad', symbol: 'CA$', monthly: 6.79, yearly: 67.99, lifetime: 134.99 },
  MX: { currency: 'mxn', symbol: 'MX$', monthly: 87.99, yearly: 879, lifetime: 1759 },
  BR: { currency: 'brl', symbol: 'R$', monthly: 24.99, yearly: 249, lifetime: 499 },
  AR: { currency: 'ars', symbol: '$', monthly: 4999, yearly: 49999, lifetime: 99999 },
  CL: { currency: 'clp', symbol: '$', monthly: 4599, yearly: 45999, lifetime: 91999 },
  CO: { currency: 'cop', symbol: '$', monthly: 19999, yearly: 199999, lifetime: 399999 },
  // Middle East & Africa
  AE: { currency: 'aed', symbol: 'AED', monthly: 18.39, yearly: 183.99, lifetime: 367.99 },
  SA: { currency: 'sar', symbol: 'SAR', monthly: 18.79, yearly: 187.99, lifetime: 375.99 },
  ZA: { currency: 'zar', symbol: 'R', monthly: 90.99, yearly: 909, lifetime: 1819 },
  NG: { currency: 'ngn', symbol: '₦', monthly: 3999, yearly: 39999, lifetime: 79999 },
  EG: { currency: 'egp', symbol: 'E£', monthly: 249, yearly: 2499, lifetime: 4999 },
  KE: { currency: 'kes', symbol: 'KSh', monthly: 649, yearly: 6499, lifetime: 12999 },
  // Default fallback
  DEFAULT: { currency: 'usd', symbol: '$', monthly: 4.99, yearly: 49.99, lifetime: 99.99 },
};

async function detectCountry(req) {
  // Check Cloudflare header first (most reliable)
  const cfCountry = req.headers.get('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX') return cfCountry;

  // Fallback: IP-based geolocation
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip');

  if (ip && ip !== '127.0.0.1' && !ip.startsWith('192.168') && !ip.startsWith('10.')) {
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/country/`, { signal: AbortSignal.timeout(2000) });
      if (geoRes.ok) {
        const country = (await geoRes.text()).trim();
        if (country.length === 2) return country;
      }
    } catch (_) {}
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { priceKey, successUrl, cancelUrl, countryCode: clientCountry } = body;

    if (!priceKey || !PRICE_MAP[priceKey]) {
      return Response.json({ error: 'Invalid price key' }, { status: 400 });
    }

    // Detect country
    const detectedCountry = clientCountry || await detectCountry(req);
    const countryKey = detectedCountry?.toUpperCase() || 'DEFAULT';
    const localPricing = CURRENCY_MAP[countryKey] || CURRENCY_MAP.DEFAULT;

    let userEmail = null;
    let userId = null;
    try {
      const user = await base44.auth.me();
      if (user) { userEmail = user.email; userId = user.id; }
    } catch (_) {}

    const isLifetime = priceKey === 'lifetime';
    const isYearly = priceKey === 'pro_yearly';

    // Determine local unit amount in smallest currency unit
    let baseAmount;
    if (isLifetime) baseAmount = localPricing.lifetime;
    else if (isYearly) baseAmount = localPricing.yearly;
    else baseAmount = localPricing.monthly;

    const currency = localPricing.currency;

    // Stripe needs amount in smallest unit (cents for USD/EUR, etc.)
    // For zero-decimal currencies (JPY, KRW, etc.), no multiplication needed
    const ZERO_DECIMAL = ['jpy', 'krw', 'vnd', 'clp', 'gnf', 'mga', 'pyg', 'rwf', 'ugx', 'xaf', 'xof'];
    const unitAmount = ZERO_DECIMAL.includes(currency)
      ? Math.round(baseAmount)
      : Math.round(baseAmount * 100);

    // Build line item with inline price (local currency)
    const lineItem = {
      price_data: {
        currency,
        unit_amount: unitAmount,
        product: isLifetime ? 'prod_USqaSZGzzQUwzm' : 'prod_UNEqSTdMlfJZxy',
        ...(isLifetime ? {} : {
          recurring: {
            interval: isYearly ? 'year' : 'month',
            interval_count: 1,
          }
        }),
      },
      quantity: 1,
    };

    const sessionConfig = {
      mode: isLifetime ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [lineItem],
      success_url: successUrl || `${req.headers.get('origin')}/Pricing?success=true`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/Pricing?canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        price_key: priceKey,
        user_id: userId || '',
        currency,
        country: countryKey,
      },
      allow_promotion_codes: true,
    };

    if (userEmail) sessionConfig.customer_email = userEmail;

    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log(`Checkout created: ${priceKey} | country: ${countryKey} | currency: ${currency} | amount: ${baseAmount}`);
    return Response.json({ url: session.url, currency, symbol: localPricing.symbol, country: countryKey });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});