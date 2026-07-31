import Stripe from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { accessForPriceKey } from '../../shared/productAccess.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Unified price IDs (USD)
const PRICE_MAP = {
  starter_monthly: 'price_1Tn2eSI9tsZ7WvXe3JMrHrYf',   // $4.99/month
  starter_yearly: 'price_1Tn2eSI9tsZ7WvXeVksFLuTl',     // $47.88/year
  pro_monthly: 'price_1Tn2eSI9tsZ7WvXeJuOqhhJa',       // $49.99/month
  pro_yearly: 'price_1Tn2eSI9tsZ7WvXePJt1xh7M',        // $479.90/year
  academic_monthly: 'price_1Tn2eSI9tsZ7WvXemMKTBrgC',  // $199.00/month
  academic_yearly: 'price_1Tn2eSI9tsZ7WvXePwoaGUvP',   // $1,910.00/year
  lifetime: 'price_1Tn2eSI9tsZ7WvXe702tFhHX',          // $999.99 one-time
  // Per-product-line plans
  consumer_monthly: 'price_1Tz4tdI9tsZ7WvXeTLjCI6Us',  // $4.99/month
  consumer_yearly: 'price_1Tz4tdI9tsZ7WvXezqEVGeuU',   // $47.88/year
  research_monthly: 'price_1Tz4tdI9tsZ7WvXeftDZEprF',  // $49.99/month
  research_yearly: 'price_1Tz4tdI9tsZ7WvXetqVuOYzj',   // $479.90/year
  api_monthly: 'price_1Tz4tdI9tsZ7WvXelfg0FZ1O',       // $199.00/month
  api_yearly: 'price_1Tz4tdI9tsZ7WvXeBChhEueQ',        // $1,910.00/year
  farm_monthly: 'price_1Tz4tdI9tsZ7WvXeOUt3PmIU',      // $9.99/month
  farm_yearly: 'price_1Tz4tdI9tsZ7WvXeeJcZwTd3',       // $95.88/year
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { priceKey, promoCode, successUrl, cancelUrl } = body;

    if (!priceKey || !PRICE_MAP[priceKey]) {
      return Response.json({ error: 'Invalid price key' }, { status: 400 });
    }

    let userEmail = null;
    let userId = null;
    try {
      const user = await base44.auth.me();
      if (user) { userEmail = user.email; userId = user.id; }
    } catch (_) {}

    const isLifetime = priceKey === 'lifetime';

    const sessionConfig = {
      mode: isLifetime ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_MAP[priceKey], quantity: 1 }],
      success_url: successUrl || `${req.headers.get('origin')}/Pricing?success=true`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/Pricing?canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        price_key: priceKey,
        user_id: userId || '',
        promo_code: promoCode || '',
        product_access: accessForPriceKey(priceKey) || '',
      },
      allow_promotion_codes: true,
    };

    // Pre-apply a specific promo code if provided
    if (promoCode) {
      try {
        const promoCodes = await stripe.promotionCodes.list({ code: promoCode, active: true });
        if (promoCodes.data.length > 0) {
          sessionConfig.discounts = [{ promotion_code: promoCodes.data[0].id }];
          console.log(`Promo code applied: ${promoCode} -> ${promoCodes.data[0].id}`);
        } else {
          console.log(`Promo code not found or inactive: ${promoCode}`);
        }
      } catch (promoErr) {
        console.error('Promo code lookup failed:', promoErr.message);
      }
    }

    if (userEmail) sessionConfig.customer_email = userEmail;

    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log(`Checkout created: ${priceKey}`);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});