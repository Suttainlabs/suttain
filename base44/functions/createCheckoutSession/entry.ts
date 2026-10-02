import Stripe from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Initialize Stripe only while handling a request.

// Unified price IDs (USD)
const PRICE_MAP = {
  // Product lines
  core_monthly: 'price_1Tz4tdI9tsZ7WvXeTLjCI6Us',      // $4.99/month
  core_yearly: 'price_1Tz4tdI9tsZ7WvXezqEVGeuU',       // $47.88/year
  research_monthly: 'price_1Tz4tdI9tsZ7WvXeftDZEprF',  // $49.99/month
  research_yearly: 'price_1Tz4tdI9tsZ7WvXetqVuOYzj',   // $479.90/year
  // Legacy plans
  starter_monthly: 'price_1Tn2eSI9tsZ7WvXe3JMrHrYf',   // $4.99/month
  starter_yearly: 'price_1Tn2eSI9tsZ7WvXeVksFLuTl',     // $47.88/year
  pro_monthly: 'price_1Tn2eSI9tsZ7WvXeJuOqhhJa',       // $49.99/month
  pro_yearly: 'price_1Tn2eSI9tsZ7WvXePJt1xh7M',        // $479.90/year
  academic_monthly: 'price_1Tn2eSI9tsZ7WvXemMKTBrgC',  // $199.00/month
  academic_yearly: 'price_1Tn2eSI9tsZ7WvXePwoaGUvP',   // $1,910.00/year
  lifetime: 'price_1Tn2eSI9tsZ7WvXe702tFhHX',          // $999.99 one-time
};

export default async function(req) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const base44 = createClientFromRequest(req);
    const { priceKey, promoCode } = await req.json();
    if (!priceKey || !PRICE_MAP[priceKey]) return Response.json({ error: 'Invalid price key' }, { status: 400 });
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    const isLifetime = priceKey === 'lifetime';
    const metadata = { base44_app_id: Deno.env.get('BASE44_APP_ID'), price_key: priceKey,
      product_line: ['core', 'research'].find(p => priceKey.startsWith(p)) || '', user_id: user?.id || '', promo_code: promoCode || '' };
    const sessionConfig = {
      mode: isLifetime ? 'payment' : 'subscription', payment_method_types: ['card'],
      line_items: [{ price: PRICE_MAP[priceKey], quantity: 1 }],
      // Never trust caller-supplied redirect URLs or the Origin header.
      success_url: 'https://suttain.base44.app/Pricing?success=true',
      cancel_url: 'https://suttain.base44.app/Pricing?canceled=true',
      metadata, allow_promotion_codes: true,
      ...(!isLifetime && { subscription_data: { metadata } }),
    };
    if (user?.stripe_customer_id) sessionConfig.customer = user.stripe_customer_id;
    else if (user?.email) sessionConfig.customer_email = user.email;
    if (promoCode) {
      const codes = await stripe.promotionCodes.list({ code: promoCode, active: true });
      if (codes.data.length) {
        sessionConfig.discounts = [{ promotion_code: codes.data[0].id }];
        delete sessionConfig.allow_promotion_codes;
      }
    }
    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log(`Checkout created: ${priceKey}`);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}