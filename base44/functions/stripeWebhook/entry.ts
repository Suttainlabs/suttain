import Stripe from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event;
    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    console.log('Stripe webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const priceKey = session.metadata?.price_key;
        const customerEmail = session.customer_email || session.customer_details?.email;

        console.log('Checkout completed:', { userId, priceKey, customerEmail });

        if (userId) {
          const plan = priceKey?.startsWith('enterprise') ? 'enterprise' : 'pro';
          const billing = priceKey?.includes('yearly') ? 'yearly' : 'monthly';
          try {
            await base44.asServiceRole.entities.User.update(userId, {
              subscription_plan: plan,
              subscription_status: 'active',
              subscription_billing: billing,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
            });
            console.log(`Updated user ${userId} to ${plan} plan`);
          } catch (e) {
            console.error('Failed to update user:', e);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription canceled:', subscription.id);
        
        // Find user by stripe subscription ID and downgrade
        try {
          const users = await base44.asServiceRole.entities.User.filter({
            stripe_subscription_id: subscription.id
          });
          if (users.length > 0) {
            await base44.asServiceRole.entities.User.update(users[0].id, {
              subscription_plan: 'trial',
              subscription_status: 'canceled',
            });
            console.log(`Downgraded user ${users[0].id}`);
          }
        } catch (e) {
          console.error('Failed to handle subscription deletion:', e);
        }
        break;
      }

      case 'invoice.paid': {
        console.log('Invoice paid:', event.data.object.id);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});