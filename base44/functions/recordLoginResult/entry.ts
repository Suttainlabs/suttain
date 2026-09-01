import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Constants ────────────────────────────────────────────────────
const MAX_ATTEMPTS    = 5;
const LOCKOUT_MINUTES = 15;
const GENERIC_ERROR  = "Incorrect email or password";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This endpoint records login outcomes and must not be callable by
    // unauthenticated users: otherwise attackers can lock out arbitrary
    // accounts by submitting repeated { success: false } payloads.
    const caller = await base44.auth.me().catch(() => null);
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { email, success } = body;

    if (!email) return Response.json({ ok: true });

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();

    const records = await base44.asServiceRole.entities.LoginSecurity.filter({
      identifier: normalizedEmail, tracker_type: 'email_lockout'
    });
    const tracker = records[0];

    // ══════════════════════════════════════════════════════════════
    // SUCCESS: reset all counters
    // ══════════════════════════════════════════════════════════════
    if (success) {
      if (tracker && (tracker.attempt_count > 0 || tracker.locked_until)) {
        await base44.asServiceRole.entities.LoginSecurity.update(tracker.id, {
          attempt_count: 0,
          locked_until: null,
          delay_until: null,
          last_attempt_at: now.toISOString()
        });
      }
      return Response.json({ ok: true });
    }

    // ══════════════════════════════════════════════════════════════
    // FAILURE: increment, apply progressive delay, maybe lock
    // ══════════════════════════════════════════════════════════════
    const currentCount = tracker ? (tracker.attempt_count || 0) + 1 : 1;

    // Progressive delay: 2^n seconds (2s, 4s, 8s, 16s, …)
    const delaySeconds = Math.pow(2, currentCount);
    const delayUntil = new Date(now.getTime() + delaySeconds * 1000);

    let lockedUntil = null;
    let shouldNotify = false;

    if (currentCount >= MAX_ATTEMPTS) {
      lockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000);
      shouldNotify = true;
    }

    if (tracker) {
      await base44.asServiceRole.entities.LoginSecurity.update(tracker.id, {
        attempt_count: currentCount,
        delay_until: delayUntil.toISOString(),
        locked_until: lockedUntil ? lockedUntil.toISOString() : null,
        last_attempt_at: now.toISOString()
      });
    } else {
      await base44.asServiceRole.entities.LoginSecurity.create({
        identifier: normalizedEmail,
        tracker_type: 'email_lockout',
        attempt_count: currentCount,
        delay_until: delayUntil.toISOString(),
        locked_until: lockedUntil ? lockedUntil.toISOString() : null,
        last_attempt_at: now.toISOString()
      });
    }

    console.log(
      `[recordLoginResult] Failed login #${currentCount} for ${normalizedEmail}` +
      (lockedUntil ? ': LOCKED' : ` : delay ${delaySeconds}s`)
    );

    // ══════════════════════════════════════════════════════════════
    // LOCKOUT NOTIFICATION EMAIL
    // ══════════════════════════════════════════════════════════════
    if (shouldNotify) {
      const origin = req.headers.get('origin') || 'https://suttain.com';
      const resetLink = `${origin}/forgot-password`;

      const emailBody = [
        '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">',
        '<h2 style="color:#C42B2B;">Security Alert: Account Access Locked</h2>',
        '<p>Your Suttain account was temporarily locked after multiple failed login attempts.</p>',
        '<p><strong>Lockout duration:</strong> 15 minutes</p>',
        '<p>If this was you, please wait for the lockout to expire, then try again or reset your password:</p>',
        `<p style="margin:24px 0;"><a href="${resetLink}" style="background:#007850;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Reset Your Password</a></p>`,
        '<p>If you did <strong>not</strong> attempt to log in, reset your password immediately and contact <a href="mailto:contact@suttain.com">contact@suttain.com</a>.</p>',
        '<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">',
        '<p style="font-size:12px;color:#999;">This is an automated security notification from Suttain.</p>',
        '</div>'
      ].join('');

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: normalizedEmail,
          subject: 'Security Alert: Account Access Locked',
          body: emailBody
        });
        console.log(`[recordLoginResult] Lockout email sent to ${normalizedEmail}`);
      } catch (emailErr) {
        console.log(`[recordLoginResult] Failed to send lockout email: ${emailErr.message}`);
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.log(`[recordLoginResult] Error: ${error.message}`);
    // Never block the login flow due to tracking errors
    return Response.json({ ok: true });
  }
});