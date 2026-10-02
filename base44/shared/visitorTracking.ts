import { deny, requireUser, reserveSecurityAction } from './securityGuards.ts';

export function validIp(value) {
  if (typeof value !== 'string' || value.length > 45) return false;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return value.split('.').every(part => Number(part) <= 255 && String(Number(part)) === part);
  if (!/^[0-9a-f:]+$/i.test(value)) return false;
  const halves = value.split('::');
  if (halves.length > 2) return false;
  const groups = halves.flatMap(half => half ? half.split(':') : []);
  if (!groups.every(group => /^[0-9a-f]{1,4}$/i.test(group))) return false;
  return halves.length === 2 ? groups.length < 8 : groups.length === 8;
}

export async function prepareVisitorRequest(req, base44, pageField) {
  if (req.method !== 'POST') deny('Method not allowed', 405);
  const text = await req.text();
  if (text.length > 2048) deny('Request too large', 413);
  let body;
  try { body = JSON.parse(text); } catch { deny('Invalid JSON', 400); }
  const session = body?.session_id;
  const page = body?.[pageField] ?? '/';
  if (typeof session !== 'string' || !/^[a-zA-Z0-9_-]{12,64}$/.test(session)) deny('Invalid session_id', 400);
  if (typeof page !== 'string' || page.length > 256 || !/^\/(?!\/)[a-zA-Z0-9/_%.~-]*$/.test(page)) deny('Invalid page', 400);
  // Client-supplied headers are never an authorization or identity boundary.
  const user = await requireUser(base44);
  const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip')?.trim();
  if (rawIp && !validIp(rawIp)) deny('Invalid IP address', 400);
  const ip = rawIp || '';
  // Durable limits shared by both endpoints; a spoofed IP cannot bypass the account limit.
  await reserveSecurityAction(base44, user, { channel: 'visitor-request', limit: 120, hourly: true });
  await reserveSecurityAction(base44, { id: `visitor-ip:${ip || 'unknown'}` }, { channel: 'visitor-request', limit: 120, hourly: true });
  const bytes = new TextEncoder().encode(`${user.id}:${session}`);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  const session_id = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  return { session_id, page, ip };
}

export async function visitorGeo(ip) {
  const empty = { country: 'Unknown', country_code: 'XX', region: 'Unknown', city: 'Unknown' };
  if (!validIp(ip) || ip.includes(':') || /^(0\.|10\.|127\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip)) return empty;
  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { headers: { 'User-Agent': 'Suttain/1.0' }, redirect: 'error', signal: AbortSignal.timeout(3000) });
    if (!response.ok) return empty;
    const geo = await response.json();
    if (geo.error) return empty;
    const bounded = (value, fallback, length) => typeof value === 'string' ? value.slice(0, length) : fallback;
    return { country: bounded(geo.country_name, 'Unknown', 100), country_code: bounded(geo.country_code, 'XX', 2), region: bounded(geo.region, 'Unknown', 100), city: bounded(geo.city, 'Unknown', 100) };
  } catch { return empty; }
}