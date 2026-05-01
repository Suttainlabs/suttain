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
  const featuresHtml = planInfo.features.map(f => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
        <span style="color:#02988C;font-weight:bold;margin-right:8px;">✓</span>
        <span style="color:#1e293b;">${f}</span>
      </td>
    </tr>`).join('');

  const isLifetime = planInfo.billing === 'lifetime';
  const billingNote = isLifetime
    ? 'One-time payment · Access forever'
    : `Billed ${planInfo.billing} · Cancel anytime`;

  const body = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#02988C 0%,#09D2FF 100%);padding:40px 32px;border-radius:16px 16px 0 0;text-align:center;">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:44px;margin-bottom:20px;" />
        <div style="font-size:48px;margin-bottom:12px;">🎉</div>
        <h1 style="color:white;margin:0 0 8px;font-size:28px;font-weight:700;">Welcome to ${planInfo.name}!</h1>
        <p style="color:rgba(255,255,255,0.85);margin:0;font-size:16px;">Your account has been upgraded successfully</p>
      </div>

      <!-- Body -->
      <div style="background:#ffffff;padding:36px 32px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;">
        
        <p style="font-size:17px;color:#1e293b;margin:0 0 8px;">Hi ${userName || 'there'} 👋</p>
        <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 28px;">
          Thank you for your subscription! You now have full Pro access to everything Suttain has to offer. 
          Your account is active and ready to use.
        </p>

        <!-- Plan Summary Box -->
        <div style="background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1px solid #6ee7b7;border-radius:12px;padding:20px 24px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <p style="margin:0 0 4px;font-weight:700;font-size:17px;color:#064e3b;">${planInfo.name}</p>
            <p style="margin:0;color:#059669;font-size:13px;">${billingNote}</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0;font-weight:800;font-size:22px;color:#064e3b;">${planInfo.price}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#10b981;font-weight:600;">● ACTIVE</p>
          </div>
        </div>

        <!-- Features -->
        <h3 style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 12px;">Everything unlocked in your plan:</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tbody>
            ${featuresHtml}
          </tbody>
        </table>

        <!-- CTA -->
        <div style="text-align:center;margin:32px 0 24px;">
          <a href="https://suttain.com/Simulator" style="display:inline-block;background:linear-gradient(135deg,#02988C,#09D2FF);color:white;text-decoration:none;font-weight:700;font-size:16px;padding:14px 40px;border-radius:50px;box-shadow:0 4px 15px rgba(2,152,140,0.3);">
            Start Using Pro Now →
          </a>
        </div>

        <!-- Footer note -->
        <p style="color:#94a3b8;font-size:13px;margin:0;padding-top:20px;border-top:1px solid #f1f5f9;text-align:center;line-height:1.6;">
          Questions? We're here to help.<br/>
          Reply to this email or reach us at <a href="mailto:contact@suttain.com" style="color:#02988C;font-weight:600;">contact@suttain.com</a>
        </p>
      </div>

      <!-- Bottom branding -->
      <p style="text-align:center;color:#cbd5e1;font-size:12px;margin:16px 0 0;">
        © ${new Date().getFullYear()} Suttain · Formulate Safer. Smarter.
      </p>
    </div>
  `;

  try {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: `🎉 You're now on ${planInfo.name} — Welcome to Pro!`,
      body,
      from_name: 'Suttain'
    });
    console.log('Subscription welcome email sent to:', email);
  } catch (e) {
    console.error('Failed to send subscription welcome email:', e);
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
          // Map the price_key directly to PLAN_DETAILS keys, with fallback
          let planKey = priceKey; // e.g. 'pro_monthly', 'pro_yearly', 'lifetime'
          if (planKey === 'lifetime') planKey = 'pro_lifetime';
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