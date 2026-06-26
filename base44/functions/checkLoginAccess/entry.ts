import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Constants ────────────────────────────────────────────────────
const MAX_IP_REQUESTS = 10;       // per minute
const WINDOW_SECONDS  = 60;
const GENERIC_ERROR  = "Incorrect email or password";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return Response.json({ allowed: false, error: GENERIC_ERROR }, { status: 429 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();

    // ── Extract client IP from headers ──
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';

    // ══════════════════════════════════════════════════════════════
    // 1. IP RATE LIMIT — max 10 requests per IP per minute
    // ══════════════════════════════════════════════════════════════
    const ipRecords = await base44.asServiceRole.entities.LoginSecurity.filter({
      identifier: ip, tracker_type: 'ip_rate'
    });
    const ipTracker = ipRecords[0];

    if (ipTracker) {
      const windowStart = new Date(ipTracker.window_start);
      const windowAgeSec = (now - windowStart) / 1000;

      if (windowAgeSec < WINDOW_SECONDS) {
        // ── Within the 1-minute window ──
        if (ipTracker.attempt_count >= MAX_IP_REQUESTS) {
          console.log(`[checkLoginAccess] IP rate-limited: ${ip}`);
          return Response.json({ allowed: false, error: GENERIC_ERROR }, { status: 429 });
        }
        await base44.asServiceRole.entities.LoginSecurity.update(ipTracker.id, {
          attempt_count: ipTracker.attempt_count + 1,
          last_attempt_at: now.toISOString()
        });
      } else {
        // ── Window expired — reset ──
        await base44.asServiceRole.entities.LoginSecurity.update(ipTracker.id, {
          attempt_count: 1,
          window_start: now.toISOString(),
          last_attempt_at: now.toISOString()
        });
      }
    } else {
      await base44.asServiceRole.entities.LoginSecurity.create({
        identifier: ip,
        tracker_type: 'ip_rate',
        attempt_count: 1,
        window_start: now.toISOString(),
        last_attempt_at: now.toISOString()
      });
    }

    // ══════════════════════════════════════════════════════════════
    // 2. ACCOUNT LOCKOUT — 5 consecutive failures → 15-min lock
    // ══════════════════════════════════════════════════════════════
    const emailRecords = await base44.asServiceRole.entities.LoginSecurity.filter({
      identifier: normalizedEmail, tracker_type: 'email_lockout'
    });
    const emailTracker = emailRecords[0];

    if (emailTracker) {
      // ── Check if still locked ──
      if (emailTracker.locked_until) {
        const lockedUntil = new Date(emailTracker.locked_until);
        if (lockedUntil > now) {
          console.log(`[checkLoginAccess] Account locked: ${normalizedEmail}`);
          // Same generic error — never reveal lockout vs wrong password
          return Response.json({ allowed: false, error: GENERIC_ERROR }, { status: 429 });
        }
        // Lockout expired — reset counters
        await base44.asServiceRole.entities.LoginSecurity.update(emailTracker.id, {
          attempt_count: 0,
          locked_until: null,
          delay_until: null
        });
      }

      // ── Check progressive delay ──
      if (emailTracker.delay_until) {
        const delayUntil = new Date(emailTracker.delay_until);
        if (delayUntil > now) {
          console.log(`[checkLoginAccess] Progressive delay active: ${normalizedEmail}`);
          return Response.json({ allowed: false, error: GENERIC_ERROR }, { status: 429 });
        }
      }
    }

    return Response.json({ allowed: true });
  } catch (error) {
    console.log(`[checkLoginAccess] Error: ${error.message}`);
    // Fail open on internal errors — don't block legitimate users
    return Response.json({ allowed: true });
  }
});