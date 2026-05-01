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
  const firstName = userName ? userName.split(' ')[0] : 'there';

  const body = `
    <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;max-width:600px;margin:0 auto;color:#333;">
      
      <!-- Body -->
      <div style="padding:40px 32px;">
        
        <p style="font-size:16px;color:#333;margin:0 0 24px;line-height:1.6;">Hello ${firstName},</p>
        
        <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 24px;">
          Thank you for subscribing to Suttain Pro - we're excited to welcome you to our community.
        </p>

        <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 16px;">
          You now have access to a powerful suite of features designed to enhance your workflow:
        </p>

        <ul style="color:#555;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
          <li>Unlimited Chemical Simulations</li>
          <li>Unlimited Formula Generation</li>
          <li>AI Compliance Co-Pilot (50+ regions)</li>
          <li>Sustainability and Carbon Footprint Scoring</li>
          <li>Computational Simulations (DFT, Molecular Dynamics, Quantum Mechanics)</li>
          <li>Advanced Analytics and Reporting</li>
          <li>Personalized Safety Alerts</li>
          <li>Priority Email Support</li>
        </ul>

        <h3 style="color:#333;font-size:16px;font-weight:600;margin:24px 0 12px;">Getting Started</h3>
        <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 12px;">
          To begin using your Pro features, navigate to the Tools section within your account and run your first simulation.
        </p>
        <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 24px;">
          Our Learning Center offers comprehensive tutorials and guides to help you get the most out of your subscription.
        </p>

        <h3 style="color:#333;font-size:16px;font-weight:600;margin:24px 0 12px;">Support and Assistance</h3>
        <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 12px;">
          If you have any questions or need help, feel free to reach out:
        </p>
        <ul style="color:#555;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
          <li>Email: <a href="mailto:contact@suttain.com" style="color:#02988C;text-decoration:none;">contact@suttain.com</a></li>
          <li>Live chat: Available in the application</li>
        </ul>

        <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 32px;">
          We're committed to helping you succeed with Suttain Pro.
        </p>

        <p style="color:#333;font-size:15px;margin:0 0 4px;font-weight:500;">Best regards,</p>
        <p style="color:#333;font-size:15px;margin:0;font-weight:500;">The Suttain Team</p>

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