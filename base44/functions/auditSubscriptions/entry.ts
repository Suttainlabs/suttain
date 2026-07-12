import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin auth check
    let user;
    try {
      user = await base44.auth.me();
    } catch (e) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    // Parse dry_run from query string
    const url = new URL(req.url);
    const dryRun = url.searchParams.get('dry_run') === 'true';

    // Stripe REST API setup
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return Response.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 500 });
    }
    const stripeAuth = 'Basic ' + btoa(stripeKey + ':');

    async function stripeGet(endpoint) {
      const resp = await fetch('https://api.stripe.com/v1/' + endpoint, {
        headers: { 'Authorization': stripeAuth }
      });
      return resp.json();
    }

    // Fetch all users
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);

    const audit = {
      total_users: allUsers.length,
      legitimate: [],
      revoked: [],
      errors: [],
      skipped_admins: [],
      trial_users: 0,
      dry_run: dryRun,
    };

    const updatesToApply = [];

    for (const u of allUsers) {
      if (u.role === 'admin') {
        audit.skipped_admins.push({ id: u.id, email: u.email, plan: u.subscription_plan });
        continue;
      }

      if (!u.subscription_plan || u.subscription_plan === 'trial') {
        audit.trial_users++;
        continue;
      }

      const hasSubId = !!u.stripe_subscription_id;
      const hasCustomerId = !!u.stripe_customer_id;

      // CASE 1: No Stripe records — manually granted, revoke
      if (!hasSubId && !hasCustomerId) {
        audit.revoked.push({
          id: u.id, email: u.email, full_name: u.full_name,
          plan: u.subscription_plan, status: u.subscription_status,
          reason: 'NO_STRIPE_RECORD — manually granted, no payment proof'
        });
        updatesToApply.push({
          id: u.id,
          subscription_plan: 'trial',
          subscription_status: 'trialing',
          subscription_billing: null,
          stripe_subscription_id: null,
          subscription_end_date: null,
          trial_start_date: new Date().toISOString(),
        });
        continue;
      }

      // CASE 2: Has subscription ID — verify with Stripe
      if (hasSubId) {
        try {
          const sub = await stripeGet('subscriptions/' + u.stripe_subscription_id);
          if (sub.error) throw new Error(sub.error.message || 'Stripe error');
          const isActive = sub.status === 'active' || sub.status === 'trialing';

          if (isActive) {
            const updateData = {};
            if (sub.current_period_end) {
              updateData.subscription_end_date = new Date(sub.current_period_end * 1000).toISOString();
            }
            if (sub.status) {
              updateData.subscription_status = sub.cancel_at_period_end ? 'canceling' : sub.status;
            }
            if (Object.keys(updateData).length > 0 && !dryRun) {
              await base44.asServiceRole.entities.User.update(u.id, updateData);
            }
            audit.legitimate.push({
              id: u.id, email: u.email, plan: u.subscription_plan,
              stripe_status: sub.status, cancel_at_period_end: sub.cancel_at_period_end,
              end_date: updateData.subscription_end_date || u.subscription_end_date
            });
          } else {
            audit.revoked.push({
              id: u.id, email: u.email, full_name: u.full_name,
              plan: u.subscription_plan, db_status: u.subscription_status,
              stripe_status: sub.status,
              reason: 'STRIPE_INACTIVE — subscription status is "' + sub.status + '"'
            });
            updatesToApply.push({
              id: u.id, subscription_plan: 'trial', subscription_status: 'trialing',
              subscription_billing: null, stripe_subscription_id: null,
              subscription_end_date: null, trial_start_date: new Date().toISOString(),
            });
          }
        } catch (stripeErr) {
          const errMsg = (stripeErr && stripeErr.message) ? stripeErr.message : String(stripeErr);
          audit.revoked.push({
            id: u.id, email: u.email, full_name: u.full_name,
            plan: u.subscription_plan, sub_id: u.stripe_subscription_id,
            error: errMsg, reason: 'STRIPE_NOT_FOUND — subscription ID no longer exists'
          });
          updatesToApply.push({
            id: u.id, subscription_plan: 'trial', subscription_status: 'trialing',
            subscription_billing: null, stripe_subscription_id: null,
            subscription_end_date: null, trial_start_date: new Date().toISOString(),
          });
        }
        continue;
      }

      // CASE 3: Has customer ID but no subscription ID
      if (hasCustomerId && !hasSubId) {
        if (u.subscription_plan === 'lifetime') {
          try {
            const charges = await stripeGet('charges?customer=' + u.stripe_customer_id + '&limit=5');
            const hasSuccess = charges.data && charges.data.some(function(c) {
              return c.status === 'succeeded' && c.paid;
            });
            if (hasSuccess) {
              audit.legitimate.push({ id: u.id, email: u.email, plan: 'lifetime', reason: 'Verified one-time charge' });
            } else {
              audit.revoked.push({ id: u.id, email: u.email, plan: u.subscription_plan, reason: 'LIFETIME_NO_CHARGE' });
              updatesToApply.push({
                id: u.id, subscription_plan: 'trial', subscription_status: 'trialing',
                subscription_billing: null, stripe_customer_id: null,
                subscription_end_date: null, trial_start_date: new Date().toISOString(),
              });
            }
          } catch (chargeErr) {
            audit.errors.push({ id: u.id, email: u.email, error: String(chargeErr) });
          }
        } else {
          audit.revoked.push({
            id: u.id, email: u.email, full_name: u.full_name, plan: u.subscription_plan,
            reason: 'ORPHANED_CUSTOMER — has customer ID but no active subscription'
          });
          updatesToApply.push({
            id: u.id, subscription_plan: 'trial', subscription_status: 'trialing',
            subscription_billing: null, stripe_subscription_id: null, stripe_customer_id: null,
            subscription_end_date: null, trial_start_date: new Date().toISOString(),
          });
        }
      }
    }

    // Apply revocations
    if (updatesToApply.length > 0 && !dryRun) {
      await base44.asServiceRole.entities.User.bulkUpdate(updatesToApply);
    }

    // Admin notification
    if (!dryRun && audit.revoked.length > 0) {
      try {
        await base44.asServiceRole.entities.Notification.create({
          title: 'Subscription Audit Complete',
          message: audit.revoked.length + ' user(s) revoked. ' + audit.legitimate.length + ' verified.',
          type: 'subscription', severity: 'warning', is_read: false,
          target_user: Deno.env.get('ADMIN_EMAIL') || 'contact@suttain.com',
          metadata: { revoked_emails: audit.revoked.map(function(r) { return r.email; }) }
        });
      } catch (e) { console.error('Notification failed:', e); }
    }

    return Response.json({
      success: true,
      dry_run: dryRun,
      total_users_scanned: audit.total_users,
      legitimate_paid_users: audit.legitimate.length,
      revoked_users: audit.revoked.length,
      errors: audit.errors.length,
      trial_users: audit.trial_users,
      admins_skipped: audit.skipped_admins.length,
      revoked_details: audit.revoked,
      legitimate_details: audit.legitimate,
      error_details: audit.errors,
    });
  } catch (error) {
    const errMsg = (error && error.message) ? error.message : String(error);
    console.error('Audit error:', errMsg);
    return Response.json({ error: errMsg }, { status: 500 });
  }
});