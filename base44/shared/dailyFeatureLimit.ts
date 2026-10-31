import { reserveSecurityAction } from './securityGuards.ts';
import { planAccess } from './usageEntitlements.ts';

// Per-user hourly cap for lookups that proxy free public databases (PubChem etc.),
// generous for people, but stops scripted abuse from getting Suttain blocked upstream.
export async function limitHourlyLookups(base44, user, channel, limit = 300) {
  try {
    await reserveSecurityAction(base44, user, { channel, limit, hourly: true });
    return null;
  } catch (error) {
    if (error?.status !== 429) throw error;
    return Response.json(
      { error: 'Too many lookups this hour. Please wait a little and try again.', code: 'HOURLY_LIMIT' },
      { status: 429 }
    );
  }
}

// Per-user daily cap for features that spend AI credits or send mail.
// Paying users (and admins) get 5x the free allowance. Returns a 429 Response
// when the cap is reached, otherwise null.
export async function limitDailyUse(base44, user, channel, freeLimit) {
  const limit = planAccess(user).core ? freeLimit * 5 : freeLimit;
  try {
    await reserveSecurityAction(base44, user, { channel, limit });
    return null;
  } catch (error) {
    if (error?.status !== 429) throw error;
    return Response.json(
      { error: 'Daily limit reached for this feature. Please try again tomorrow.', code: 'DAILY_LIMIT' },
      { status: 429 }
    );
  }
}