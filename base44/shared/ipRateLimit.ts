import { deny } from './securityGuards.ts';

export async function reserveIpAction(base44, req, { channel, limit, hourly = false }) {
  const forwarded = req.headers.get('x-forwarded-for');
  const raw = (forwarded?.split(',')[0] || req.headers.get('cf-connecting-ip') || '').trim();
  // Bound the identifier and accept only IP-address characters; never store arbitrary header text.
  const addr = raw.length <= 45 && /^[0-9a-fA-F:.]+$/.test(raw) ? raw.toLowerCase() : 'unknown';
  const actor_id = `ip:${addr}`;
  const bucket = new Date().toISOString().slice(0, hourly ? 13 : 10);
  const log = base44.asServiceRole.entities.SecurityActionLog;
  const used = await log.filter({ actor_id, channel, bucket }, undefined, limit);
  if (used.length >= limit) deny('Request limit reached; try again later', 429);
  // Reserve before external work; failures count too. Storage failures must not bypass the limit.
  await log.create({ actor_id, channel, bucket });
}