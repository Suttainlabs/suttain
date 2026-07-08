import StripeLib from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@4.0.0';

const stripe = new StripeLib(Deno.env.get('STRIPE_SECRET_KEY'));
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

async function sendEmailViaResend(to, subject, html) {
  try {
    await resend.emails.send({
      from: 'Suttain <contact@suttain.com>',
      to,
      cc: 'contact@suttain.com',
      reply_to: 'contact@suttain.com',
      subject,
      html,
    });
    console.log('Email sent via Resend to:', to);
  } catch (e) {
    console.error('Resend email failed:', e);
  }
}

const PLAN_DETAILS = {
  starter_monthly: {
    name: 'Suttain Starter (Monthly)', price: '$4.99/month', billing: 'monthly',
    features: ['10 simulations per month', 'Full Structural Biology access', 'Unlimited formula generations', 'Unlimited product scans', 'Ingredient database access'],
  },
  starter_yearly: {
    name: 'Suttain Starter (Yearly)', price: '$47.88/year', billing: 'yearly',
    features: ['10 simulations per month', 'Full Structural Biology access', 'Unlimited formula generations', 'Unlimited product scans', 'Ingredient database access', 'Save 20% vs monthly billing'],
  },
  pro_monthly: {
    name: 'Suttain Pro (Monthly)', price: '$49.99/month', billing: 'monthly',
    features: ['Unlimited simulations (DFT, MD)', 'Research API access', 'Citation-ready exports', 'Full Structural Biology access', 'Priority support'],
  },
  pro_yearly: {
    name: 'Suttain Pro (Yearly)', price: '$479.90/year', billing: 'yearly',
    features: ['Unlimited simulations (DFT, MD)', 'Research API access', 'Citation-ready exports', 'Full Structural Biology access', 'Priority support', 'Save 20% vs monthly billing'],
  },
  academic_monthly: {
    name: 'Suttain Academic (Monthly)', price: '$199.00/month', billing: 'monthly',
    features: ['Up to 10 team seats', 'Priority compute queue', 'Lab workspace', 'API included', 'Everything in Pro'],
  },
  academic_yearly: {
    name: 'Suttain Academic (Yearly)', price: '$1,910.00/year', billing: 'yearly',
    features: ['Up to 10 team seats', 'Priority compute queue', 'Lab workspace', 'API included', 'Everything in Pro', 'Save 20% vs monthly billing'],
  },
  lifetime: {
    name: 'Suttain Lifetime', price: '$999.99 one-time', billing: 'lifetime',
    features: ['Lifetime access to all Pro features', 'Unlimited simulations (DFT, MD)', 'Research API access', 'Citation-ready exports', 'No recurring payments'],
  },
};

// Reverse map: Stripe price ID -> plan name
const PRICE_ID_TO_PLAN = {
  'price_1Tn2eSI9tsZ7WvXe3JMrHrYf': 'starter',
  'price_1Tn2eSI9tsZ7WvXeVksFLuTl': 'starter',
  'price_1Tn2eSI9tsZ7WvXeJuOqhhJa': 'pro',
  'price_1Tn2eSI9tsZ7WvXePJt1xh7M': 'pro',
  'price_1Tn2eSI9tsZ7WvXemMKTBrgC': 'academic',
  'price_1Tn2eSI9tsZ7WvXePwoaGUvP': 'academic',
};

async function sendPaymentConfirmationEmail(base44, email, userName, planKey) {
  const planInfo = PLAN_DETAILS[planKey] || PLAN_DETAILS['pro_monthly'];
  const firstName = userName ? userName.split(' ')[0] : 'there';
  const featuresList = planInfo.features.map(f => `<li>${f}</li>`).join('');
  const isLifetime = planInfo.billing === 'lifetime';
  const renewalText = isLifetime
    ? 'Your lifetime access never expires — no renewal needed.'
    : `Your ${planInfo.billing} subscription is active and will renew automatically. You can manage your billing anytime from your dashboard.`;

  const body = `
    <div style="margin:0;padding:0;background:#f6fbfa;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6fbfa;margin:0;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbeafe;box-shadow:0 16px 40px rgba(2,152,140,0.12);">
              <tr>
                <td style="background:linear-gradient(135deg,#02988C 0%,#09D2FF 55%,#9531F5 100%);padding:34px 36px;text-align:center;">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:48px;width:auto;margin:0 auto 18px;display:block;" />
                  <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.25;font-weight:700;">Welcome to ${planInfo.name}</h1>
                  <p style="margin:10px 0 0;color:rgba(255,255,255,0.92);font-size:16px;line-height:1.5;">Your subscription is active and ready to use.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:38px 36px 34px;">
                  <p style="font-size:17px;line-height:1.7;margin:0 0 20px;color:#0f172a;font-weight:600;">Hello ${firstName},</p>
                  <p style="font-size:16px;line-height:1.75;margin:0 0 22px;color:#475569;">Thank you for subscribing to ${planInfo.name} — we are excited to welcome you to our community.</p>
                  <p style="font-size:16px;line-height:1.75;margin:0 0 18px;color:#475569;">${renewalText}</p>
                  <p style="font-size:16px;line-height:1.75;margin:0 0 18px;color:#475569;">You now have access to the following features:</p>
                  <div style="background:#f0fdfa;border:1px solid #b2f5ea;border-radius:14px;padding:22px 24px;margin:0 0 30px;">
                    <ul style="font-size:15px;line-height:1.9;margin:0;padding-left:20px;color:#334155;">
                      ${featuresList}
                    </ul>
                  </div>
                  <div style="text-align:center;margin:0 0 32px;">
                    <a href="https://suttain.com/Dashboard" style="display:inline-block;background:#02988C;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:999px;">Go to Your Dashboard</a>
                  </div>
                  <h2 style="font-size:20px;line-height:1.4;margin:0 0 12px;color:#0f172a;">Support and Assistance</h2>
                  <p style="font-size:16px;line-height:1.75;margin:0 0 14px;color:#475569;">If you have any questions or need help, feel free to reach out:</p>
                  <p style="font-size:16px;line-height:1.75;margin:0 0 6px;color:#475569;">Email: <a href="mailto:contact@suttain.com" style="color:#02988C;text-decoration:underline;font-weight:600;">contact@suttain.com</a></p>
                  <p style="font-size:16px;line-height:1.75;margin:0 0 28px;color:#475569;">We are committed to helping you succeed with Suttain.</p>
                  <p style="font-size:16px;line-height:1.7;margin:0;color:#0f172a;">Best regards,<br /><strong>The Suttain Team</strong></p>
                </td>
              </tr>
              <tr>
                <td style="background:#f8fafc;padding:22px 36px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">Suttain · Safer chemistry, smarter formulation<br /><a href="https://suttain.com" style="color:#02988C;text-decoration:none;font-weight:600;">suttain.com</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;

  await sendEmailViaResend(email, `Welcome to ${planInfo.name} — Your Subscription is Active`, body);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    // Reject any request bearing a user Authorization header — webhooks must
    // only be accepted from Stripe via signature-validated, unauthenticated calls.
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader) {
      console.error('Webhook called with Authorization header — rejecting');
      return Response.json({ error: 'Webhook endpoint does not accept authenticated requests' }, { status: 401 });
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    if (!signature) {
      console.error('Missing stripe-signature header');
      return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    // Enforce Stripe signature validation on every request — no bypass path.
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (verifyError) {
      console.error('Stripe signature verification failed:', verifyError.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
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

        const plan = priceKey?.startsWith('starter') ? 'starter'
          : priceKey?.startsWith('academic') ? 'academic'
          : priceKey?.startsWith('lifetime') ? 'lifetime'
          : priceKey?.startsWith('enterprise') ? 'enterprise'
          : 'pro';
        const billing = priceKey?.includes('yearly') ? 'yearly' : priceKey?.includes('lifetime') ? 'lifetime' : 'monthly';

        // Fetch subscription period end if this is a recurring subscription
        let periodEnd = null;
        if (session.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(session.subscription);
            if (sub.current_period_end) {
              periodEnd = new Date(sub.current_period_end * 1000).toISOString();
            }
          } catch (e) {
            console.error('Failed to fetch subscription period end:', e);
          }
        }

        if (userId) {
          try {
            await base44.asServiceRole.entities.User.update(userId, {
              subscription_plan: plan,
              subscription_status: 'active',
              subscription_billing: billing,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription || null,
              ...(periodEnd && { subscription_end_date: periodEnd }),
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
                ...(periodEnd && { subscription_end_date: periodEnd }),
              });
              console.log(`Updated user by email ${customerEmail} to ${plan} plan`);
            }
          } catch (e) {
            console.error('Failed to find/update user by email:', e);
          }
        }

        // Send payment confirmation email to customer
        if (customerEmail) {
          await sendPaymentConfirmationEmail(base44, customerEmail, customerName, priceKey);

          // Notify admin via email
          await sendEmailViaResend(
            Deno.env.get('ADMIN_EMAIL') || 'contact@suttain.com',
            `New Suttain Purchase: ${customerName || customerEmail}`,
            `<p>A new purchase was completed.</p><ul><li><b>Name:</b> ${customerName || '—'}</li><li><b>Email:</b> ${customerEmail}</li><li><b>Plan:</b> ${priceKey}</li><li><b>Billing:</b> ${billing}</li><li><b>Session ID:</b> ${session.id}</li></ul>`
          );

          // Create in-app admin notification
          try {
            await base44.asServiceRole.entities.Notification.create({
              title: `New Subscriber`,
              message: `${customerName || customerEmail} subscribed to ${priceKey} (${billing}).`,
              type: 'subscription',
              severity: 'info',
              is_read: false,
              target_user: Deno.env.get('ADMIN_EMAIL') || 'contact@suttain.com',
              metadata: { email: customerEmail, name: customerName, plan: priceKey, billing, session_id: session.id }
            });
          } catch (e) {
            console.error('Failed to create admin notification:', e);
          }
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
        const invoice = event.data.object;
        console.log('Invoice paid:', invoice.id, 'customer:', invoice.customer, 'email:', invoice.customer_email);

        const invoiceEmail = invoice.customer_email;
        const invoiceSubId = invoice.subscription;

        if (!invoiceSubId) {
          // One-time payment — already handled by checkout.session.completed
          break;
        }

        // Determine billing interval and plan from invoice line items
        let billing = 'monthly';
        let plan = 'pro';
        const lineItem = invoice.lines?.data?.[0];
        if (lineItem?.plan?.interval === 'year') billing = 'yearly';
        if (lineItem?.price?.id && PRICE_ID_TO_PLAN[lineItem.price.id]) {
          plan = PRICE_ID_TO_PLAN[lineItem.price.id];
        }

        let targetUserId = null;

        // First try to find by existing stripe_subscription_id
        try {
          const bySubId = await base44.asServiceRole.entities.User.filter({ stripe_subscription_id: invoiceSubId });
          if (bySubId.length > 0) targetUserId = bySubId[0].id;
        } catch (e) {
          console.error('Error finding user by subscription id:', e);
        }

        // Fallback: find by email
        if (!targetUserId && invoiceEmail) {
          try {
            const byEmail = await base44.asServiceRole.entities.User.filter({ email: invoiceEmail });
            if (byEmail.length > 0) targetUserId = byEmail[0].id;
          } catch (e) {
            console.error('Error finding user by email:', e);
          }
        }

        // Get period end from invoice
        let invoicePeriodEnd = null;
        const invoiceLineItem = invoice.lines?.data?.[0];
        if (invoiceLineItem?.period?.end) {
          invoicePeriodEnd = new Date(invoiceLineItem.period.end * 1000).toISOString();
        }

        if (targetUserId) {
          try {
            await base44.asServiceRole.entities.User.update(targetUserId, {
              subscription_plan: plan,
              subscription_status: 'active',
              subscription_billing: billing,
              stripe_subscription_id: invoiceSubId,
              stripe_customer_id: invoice.customer,
              ...(invoicePeriodEnd && { subscription_end_date: invoicePeriodEnd }),
            });
            console.log(`invoice.paid: confirmed ${plan}/active for user ${targetUserId} (${billing})`);

            // Notify admin via email
            const userName = invoice.customer_name || invoiceEmail || targetUserId;
            await sendEmailViaResend(
              Deno.env.get('ADMIN_EMAIL') || 'contact@suttain.com',
              `Subscription Renewal/New: ${userName}`,
              `<p>New subscription confirmed via invoice.paid.</p><ul><li><b>Email:</b> ${invoiceEmail}</li><li><b>Plan:</b> ${plan}</li><li><b>Billing:</b> ${billing}</li><li><b>Subscription ID:</b> ${invoiceSubId}</li><li><b>Invoice:</b> ${invoice.id}</li></ul>`
            );

            // Create in-app admin notification
            try {
              await base44.asServiceRole.entities.Notification.create({
                title: `New Subscriber`,
                message: `${invoiceEmail} subscribed to ${plan} (${billing}).`,
                type: 'subscription',
                severity: 'info',
                is_read: false,
                target_user: Deno.env.get('ADMIN_EMAIL') || 'contact@suttain.com',
                metadata: { email: invoiceEmail, billing, subscription_id: invoiceSubId }
              });
            } catch (e) {
              console.error('Failed to create admin notification (invoice.paid):', e);
            }
          } catch (e) {
            console.error('Failed to update user on invoice.paid:', e);
          }
        } else {
          console.warn('invoice.paid: could not find user for email:', invoiceEmail, 'sub:', invoiceSubId);
        }
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