import Stripe from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PLAN_DETAILS = {
  pro_monthly: {
    name: 'Suttain Pro (Monthly)',
    price: '$19.00/month',
    billing: 'monthly',
    features: [
      'Unlimited Chemical Simulations',
      'Unlimited Formula Generation',
      'Unlimited Quick Scans',
      'AI Compliance Co-Pilot',
      'Personalized Safety Alerts',
      'Sustainability Scoring & Reports',
      'Advanced Computational Simulations',
      'Priority Support',
      'Workspace & History (Unlimited)',
    ]
  },
  pro_yearly: {
    name: 'Suttain Pro (Yearly)',
    price: '$190.00/year',
    billing: 'yearly',
    features: [
      'Unlimited Chemical Simulations',
      'Unlimited Formula Generation',
      'Unlimited Quick Scans',
      'AI Compliance Co-Pilot',
      'Personalized Safety Alerts',
      'Sustainability Scoring & Reports',
      'Advanced Computational Simulations',
      'Priority Support',
      'Workspace & History (Unlimited)',
      '2 months FREE vs monthly billing',
    ]
  },
  pro_lifetime: {
    name: 'Suttain Pro (Lifetime)',
    price: '$4.99 one-time',
    billing: 'lifetime',
    features: [
      'Lifetime access to all Pro features',
      'Unlimited Chemical Simulations',
      'Unlimited Formula Generation',
      'Unlimited Quick Scans',
      'AI Compliance Co-Pilot',
      'Personalized Safety Alerts',
      'Sustainability Scoring & Reports',
      'Advanced Computational Simulations',
      'Priority Support — Forever',
    ]
  }
};

async function sendPaymentConfirmationEmail(base44, email, userName, planKey) {
  const planInfo = PLAN_DETAILS[planKey] || PLAN_DETAILS['pro_monthly'];
  const featuresHtml = planInfo.features.map(f => `<li style="padding:4px 0;">✅ ${f}</li>`).join('');

  const body = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
      <div style="background:linear-gradient(135deg,#02988C,#09D2FF);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:48px;" />
        <h1 style="color:white;margin:16px 0 8px;">Welcome to Pro! 🎉</h1>
        <p style="color:rgba(255,255,255,0.9);margin:0;">Your subscription is now active</p>
      </div>
      <div style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;">
        <p style="font-size:16px;">Hi ${userName || 'there'},</p>
        <p>Thank you for subscribing to <strong>${planInfo.name}</strong> at <strong>${planInfo.price}</strong>. Your account has been upgraded and you now have full access to all Pro features.</p>
        
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:24px 0;">
          <h3 style="margin:0 0 12px;color:#166534;">What's included in your plan:</h3>
          <ul style="list-style:none;padding:0;margin:0;color:#15803d;">
            ${featuresHtml}
          </ul>
        </div>

        <p>You can start using all features immediately by visiting <a href="https://suttain.com" style="color:#02988C;font-weight:bold;">suttain.com</a>.</p>
        
        <p style="color:#64748b;font-size:13px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px;">
          If you have any questions, reply to this email or contact us at <a href="mailto:contact@suttain.com" style="color:#02988C;">contact@suttain.com</a>.
        </p>
      </div>
    </div>
  `;

  try {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: `🎉 Welcome to ${planInfo.name} — You're all set!`,
      body,
      from_name: 'Suttain'
    });
    console.log('Payment confirmation email sent to:', email);
  } catch (e) {
    console.error('Failed to send payment email:', e);
  }
}

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
        const customerName = session.customer_details?.name || '';

        console.log('Checkout completed:', { userId, priceKey, customerEmail });

        const plan = priceKey?.startsWith('enterprise') ? 'enterprise' : 'pro';
        const billing = priceKey?.includes('yearly') ? 'yearly' : priceKey?.includes('lifetime') ? 'lifetime' : 'monthly';

        if (userId) {
          try {
            await base44.asServiceRole.entities.User.update(userId, {
              subscription_plan: plan,
              subscription_status: 'active',
              subscription_billing: billing,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription || null,
            });
            console.log(`Updated user ${userId} to ${plan} plan (${billing})`);
          } catch (e) {
            console.error('Failed to update user:', e);
          }
        } else if (customerEmail) {
          // Try to find user by email
          try {
            const users = await base44.asServiceRole.entities.User.filter({ email: customerEmail });
            if (users.length > 0) {
              await base44.asServiceRole.entities.User.update(users[0].id, {
                subscription_plan: plan,
                subscription_status: 'active',
                subscription_billing: billing,
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription || null,
              });
              console.log(`Updated user by email ${customerEmail} to ${plan} plan`);
            }
          } catch (e) {
            console.error('Failed to find/update user by email:', e);
          }
        }

        // Send payment confirmation email
        if (customerEmail) {
          const planKey = `${plan}_${billing}`;
          await sendPaymentConfirmationEmail(base44, customerEmail, customerName, planKey);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription canceled:', subscription.id);
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

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id, 'status:', subscription.status);
        try {
          const users = await base44.asServiceRole.entities.User.filter({
            stripe_subscription_id: subscription.id
          });
          if (users.length > 0) {
            const newStatus = subscription.status === 'active' ? 'active' : subscription.status;
            await base44.asServiceRole.entities.User.update(users[0].id, {
              subscription_status: newStatus,
            });
            console.log(`Updated subscription status for user ${users[0].id} to ${newStatus}`);
          }
        } catch (e) {
          console.error('Failed to handle subscription update:', e);
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