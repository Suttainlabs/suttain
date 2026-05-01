import Stripe from 'npm:stripe@17.7.0';
import StripeLib from 'npm:stripe@15.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new StripeLib(Deno.env.get('STRIPE_SECRET_KEY'));

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

  const isLifetime = planInfo.billing === 'lifetime';
  const billingNote = isLifetime
    ? 'One-time payment · Access forever'
    : `Billed ${planInfo.billing} · Cancel anytime`;

  const body = `
    <div style="font-family:'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:0;">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#02988C 0%,#09D2FF 100%);padding:60px 40px;text-align:center;">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:48px;margin-bottom:24px;display:block;" />
        <h1 style="color:white;margin:0;font-size:32px;font-weight:700;letter-spacing:-0.5px;">Welcome to Suttain Pro</h1>
        <p style="color:rgba(255,255,255,0.90);margin:12px 0 0;font-size:18px;font-weight:300;">Your subscription is now active</p>
      </div>

      <!-- Body -->
      <div style="background:#ffffff;padding:48px 40px;">
        
        <!-- Greeting -->
        <p style="font-size:18px;color:#1e293b;margin:0 0 24px;font-weight:500;">Hello ${userName || 'User'},</p>
        
        <!-- Introduction -->
        <p style="color:#475569;font-size:16px;line-height:1.8;margin:0 0 32px;">
          Thank you for subscribing to Suttain Pro. We are thrilled to welcome you to our community of formulators and chemists who trust Suttain for safety, compliance, and sustainability.
        </p>

        <!-- Plan Summary Box -->
        <div style="background:#f0fdf4;border-left:4px solid #02988C;padding:24px;margin-bottom:40px;border-radius:8px;">
          <p style="margin:0 0 12px;font-weight:700;font-size:16px;color:#1e293b;">Your Subscription Details</p>
          <table style="width:100%;font-size:15px;color:#475569;line-height:1.8;">
            <tr>
              <td style="padding:6px 0;">Plan:</td>
              <td style="text-align:right;font-weight:600;color:#1e293b;">${planInfo.name}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;">Billing:</td>
              <td style="text-align:right;font-weight:600;color:#1e293b;">${billingNote}</td>
            </tr>
            <tr style="border-top:1px solid rgba(2,152,140,0.2);">
              <td style="padding:12px 0 0;">Amount:</td>
              <td style="text-align:right;padding:12px 0 0;font-size:20px;font-weight:700;color:#02988C;">${planInfo.price}</td>
            </tr>
          </table>
        </div>



        <!-- Getting Started Section -->
        <div style="background:#ecfdf5;padding:24px;border-radius:8px;margin-bottom:40px;">
          <h3 style="color:#1e293b;font-size:16px;font-weight:700;margin:0 0 12px;">Getting Started</h3>
          <p style="color:#475569;font-size:15px;line-height:1.8;margin:0;">
            Log in to your account and navigate to the Tools section to begin your first chemical simulation. Our comprehensive learning center provides tutorials and guides to help you maximize your investment.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align:center;margin-bottom:40px;">
          <a href="https://suttain.com/Simulator" style="display:inline-block;background:linear-gradient(135deg,#02988C,#09D2FF);color:white;text-decoration:none;font-weight:600;font-size:16px;padding:16px 48px;border-radius:6px;box-shadow:0 4px 15px rgba(2,152,140,0.3);transition:transform 0.2s ease;">
            Access Your Account
          </a>
        </div>

        <!-- Support Section -->
        <div style="border-top:1px solid #e2e8f0;padding-top:32px;margin-top:32px;">
          <p style="color:#1e293b;font-size:15px;font-weight:600;margin:0 0 12px;">Need Assistance?</p>
          <p style="color:#475569;font-size:15px;line-height:1.8;margin:0;">
            Our support team is available to assist you. Contact us at <a href="mailto:contact@suttain.com" style="color:#02988C;text-decoration:none;font-weight:600;">contact@suttain.com</a> or use the live chat feature in your account.
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div style="background:#f8fafc;padding:32px 40px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
          Best regards,<br/>
          <span style="font-weight:600;color:#1e293b;">The Suttain Team</span><br/>
          <a href="https://suttain.com" style="color:#02988C;text-decoration:none;">suttain.com</a>
        </p>
        <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;">
          © ${new Date().getFullYear()} Suttain. All rights reserved.
        </p>
      </div>

    </div>
  `;

  try {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: `Welcome to ${planInfo.name} - Account Activation Confirmation`,
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
        console.log('Subscription fully ended:', subscription.id);
        try {
          const users = await base44.asServiceRole.entities.User.filter({
            stripe_subscription_id: subscription.id
          });
          if (users.length > 0) {
            await base44.asServiceRole.entities.User.update(users[0].id, {
              subscription_plan: null,
              subscription_status: 'canceled',
              subscription_billing: null,
              stripe_subscription_id: null,
              subscription_cancel_at: null,
            });
            console.log(`Downgraded user ${users[0].id} to free after subscription ended`);
          }
        } catch (e) {
          console.error('Failed to handle subscription deletion:', e);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id, 'status:', subscription.status, 'cancel_at_period_end:', subscription.cancel_at_period_end);
        try {
          const users = await base44.asServiceRole.entities.User.filter({
            stripe_subscription_id: subscription.id
          });
          if (users.length > 0) {
            let newStatus = subscription.status;
            if (subscription.cancel_at_period_end) {
              newStatus = 'canceling';
            }
            const updateData = {
              subscription_status: newStatus,
              subscription_cancel_at: subscription.cancel_at_period_end && subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
            };
            await base44.asServiceRole.entities.User.update(users[0].id, updateData);
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