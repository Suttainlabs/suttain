import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function is invoked by the platform scheduler (no user context).
    // Use service role directly — the scheduler is platform-internal.
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return Response.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 500 });
    }
    const stripeAuth = 'Basic ' + btoa(stripeKey + ':');

    // ── 1. Fetch ALL active/trialing subscriptions from Stripe ──
    const activeSubscriptions = [];
    let hasMore = true;
    let startingAfter = '';

    while (hasMore) {
      const endpoint = 'subscriptions?status=active&limit=100'
        + (startingAfter ? '&starting_after=' + startingAfter : '');
      const subData = await fetch('https://api.stripe.com/v1/' + endpoint, {
        headers: { 'Authorization': stripeAuth }
      }).then(r => r.json());

      if (subData.error) {
        return Response.json({ error: 'Stripe API error: ' + subData.error.message }, { status: 500 });
      }

      activeSubscriptions.push(...(subData.data || []));

      // Also fetch trialing subscriptions
      hasMore = subData.has_more;
      if (hasMore && subData.data.length > 0) {
        startingAfter = subData.data[subData.data.length - 1].id;
      }
    }

    // Fetch trialing subscriptions separately
    let hasMoreTrialing = true;
    let startingAfterTrialing = '';
    while (hasMoreTrialing) {
      const endpoint = 'subscriptions?status=trialing&limit=100'
        + (startingAfterTrialing ? '&starting_after=' + startingAfterTrialing : '');
      const subData = await fetch('https://api.stripe.com/v1/' + endpoint, {
        headers: { 'Authorization': stripeAuth }
      }).then(r => r.json());

      if (!subData.error) {
        activeSubscriptions.push(...(subData.data || []));
        hasMoreTrialing = subData.has_more;
        if (hasMoreTrialing && subData.data.length > 0) {
          startingAfterTrialing = subData.data[subData.data.length - 1].id;
        }
      } else {
        hasMoreTrialing = false;
      }
    }

    // Build lookup sets: customer IDs and subscription IDs with active status
    const activeCustomerIds = new Set();
    const activeSubIds = new Set();
    const subEndDates = {}; // sub_id -> end_date
    const subCancelAtEnd = {}; // sub_id -> bool

    for (const sub of activeSubscriptions) {
      activeCustomerIds.add(sub.customer);
      activeSubIds.add(sub.id);
      subEndDates[sub.id] = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null;
      subCancelAtEnd[sub.id] = sub.cancel_at_period_end || false;
    }

    // ── 2. Fetch all users from database ──
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);

    const results = {
      total_users: allUsers.length,
      active_stripe_subs: activeSubscriptions.length,
      verified_pro: [],
      revoked: [],
      errors: [],
      skipped_admins: [],
      already_free: 0,
    };

    const updatesToApply = [];

    for (const u of allUsers) {
      try {
        // Skip admins — they get access by role
        if (u.role === 'admin') {
          results.skipped_admins.push({ id: u.id, email: u.email });
          continue;
        }

        const plan = u.subscription_plan;
        const status = u.subscription_status;

        // Already on trial/free — skip
        if (!plan || plan === 'trial' || plan === 'free') {
          results.already_free++;
          continue;
        }

        // Lifetime users — verify via successful charge, not subscription
        if (plan === 'lifetime') {
          if (u.stripe_customer_id) {
            // Lifetime is a one-time payment — keep if customer exists in Stripe
            if (activeCustomerIds.has(u.stripe_customer_id)) {
              results.verified_pro.push({ id: u.id, email: u.email, plan: 'lifetime', reason: 'active_customer' });
              continue;
            }
            // Check charges for lifetime purchases
            const charges = await fetch(
              'https://api.stripe.com/v1/charges?customer=' + u.stripe_customer_id + '&limit=5',
              { headers: { 'Authorization': stripeAuth } }
            ).then(r => r.json());

            const hasPaid = charges.data && charges.data.some(c => c.status === 'succeeded' && c.paid);
            if (hasPaid) {
              results.verified_pro.push({ id: u.id, email: u.email, plan: 'lifetime', reason: 'paid_charge' });
              continue;
            }
          }
          // No valid lifetime purchase found — revoke
          results.revoked.push({
            id: u.id, email: u.email, full_name: u.full_name,
            plan, reason: 'LIFETIME_NO_VALID_CHARGE'
          });
          updatesToApply.push({
            id: u.id,
            subscription_plan: 'free',
            subscription_status: 'none',
            subscription_billing: null,
            stripe_subscription_id: null,
            stripe_customer_id: null,
            subscription_end_date: null,
          });
          continue;
        }

        // Pro / Starter / Academic — must have active subscription
        const hasActiveSub = u.stripe_subscription_id && activeSubIds.has(u.stripe_subscription_id);

        if (hasActiveSub) {
          // Sync end date and cancel status
          const updateData = {};
          if (subEndDates[u.stripe_subscription_id]) {
            updateData.subscription_end_date = subEndDates[u.stripe_subscription_id];
          }
          updateData.subscription_status = subCancelAtEnd[u.stripe_subscription_id] ? 'canceling' : 'active';

          if (Object.keys(updateData).length > 0) {
            await base44.asServiceRole.entities.User.update(u.id, updateData);
          }
          results.verified_pro.push({
            id: u.id, email: u.email, plan,
            stripe_status: 'active',
            end_date: updateData.subscription_end_date
          });
        } else {
          // No active subscription in Stripe — revoke Pro access
          results.revoked.push({
            id: u.id, email: u.email, full_name: u.full_name,
            plan, db_status: status,
            sub_id: u.stripe_subscription_id || 'none',
            reason: 'NO_ACTIVE_STRIPE_SUB'
          });
          updatesToApply.push({
            id: u.id,
            subscription_plan: 'free',
            subscription_status: 'none',
            subscription_billing: null,
            stripe_subscription_id: null,
            subscription_end_date: null,
          });
        }
      } catch (userErr) {
        results.errors.push({
          id: u.id, email: u.email,
          error: userErr?.message || String(userErr)
        });
      }
    }

    // ── 3. Apply all revocations ──
    for (const upd of updatesToApply) {
      try {
        const { id, ...fields } = upd;
        await base44.asServiceRole.entities.User.update(id, fields);
      } catch (updErr) {
        results.errors.push({
          id: upd.id,
          error: 'Update failed: ' + (updErr?.message || String(updErr))
        });
      }
    }

    // ── 4. Notify admin if any users were revoked ──
    if (results.revoked.length > 0) {
      try {
        await base44.asServiceRole.entities.Notification.create({
          title: 'Subscription Sync: ' + results.revoked.length + ' user(s) downgraded',
          message: results.revoked.length + ' user(s) lost Pro access (no active Stripe subscription). '
            + results.verified_pro.length + ' user(s) verified as paid.',
          type: 'subscription',
          severity: 'warning',
          is_read: false,
          target_user: Deno.env.get('ADMIN_EMAIL') || 'contact@suttain.com',
          metadata: {
            revoked_emails: results.revoked.map(r => r.email),
            verified_count: results.verified_pro.length,
          }
        });
      } catch (notifErr) {
        console.error('Notification failed:', String(notifErr));
      }
    }

    console.log('Sync complete:', JSON.stringify({
      total: results.total_users,
      verified: results.verified_pro.length,
      revoked: results.revoked.length,
      errors: results.errors.length,
    }));

    return Response.json({
      success: true,
      ...results,
    });
  } catch (error) {
    const errorInfo = {
      message: error?.message || null,
      name: error?.name || null,
      string: String(error),
    };
    console.error('syncSubscriptionStatus error:', JSON.stringify(errorInfo));
    return Response.json({ error: errorInfo }, { status: 500 });
  }
});