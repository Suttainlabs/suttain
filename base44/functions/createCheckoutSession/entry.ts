import Stripe from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PRICE_MAP = {
  pro_monthly: 'price_1TOUN1I9tsZ7WvXe30IECjgi',   // $4.99/month
  pro_yearly: 'price_1TOUN1I9tsZ7WvXemErMam6J',    // $49.99/year
  lifetime: 'price_1TRCQ8I9tsZ7WvXeBoAnMI8m',      // $4.99 one-time
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { priceKey, successUrl, cancelUrl } = await req.json();

    if (!priceKey || !PRICE_MAP[priceKey]) {
      return Response.json({ error: 'Invalid price key' }, { status: 400 });
    }

    let userEmail = null;
    let userId = null;
    try {
      const user = await base44.auth.me();
      if (user) {
        userEmail = user.email;
        userId = user.id;
      }
    } catch (_e) {
      console.log('No authenticated user');
    }

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
      },
      allow_promotion_codes: true,
    };

    if (userEmail) {
      sessionConfig.customer_email = userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});