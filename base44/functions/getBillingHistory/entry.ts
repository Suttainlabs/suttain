import Stripe from 'npm:stripe@17.7.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeCustomerId = user.stripe_customer_id;
    if (!stripeCustomerId) {
      return Response.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 24,
    });

    const formatted = invoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      amount_paid: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      created: inv.created,
      period_start: inv.period_start,
      period_end: inv.period_end,
      invoice_pdf: inv.invoice_pdf,
      hosted_invoice_url: inv.hosted_invoice_url,
      description: inv.lines?.data?.[0]?.description || null,
    }));

    return Response.json({ invoices: formatted });
  } catch (error) {
    console.error('getBillingHistory error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});