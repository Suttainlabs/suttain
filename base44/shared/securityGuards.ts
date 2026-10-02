export function deny(message, status = 403) {
  const error = new Error(message);
  error.status = status;
  throw error;
}
export async function requireUser(base44, adminOnly = false) {
  const user = await base44.auth.me().catch(() => null);
  if (!user?.id || !user.email) deny('Unauthorized', 401);
  if (adminOnly && user.role !== 'admin') deny('Forbidden', 403);
  return user;
}
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
export async function registeredRecipient(base44, actor, value) {
  const email = String(value ?? '').trim().toLowerCase();
  if (!/^[^\s@<>"\r\n]+@[^\s@<>"\r\n]+\.[^\s@<>"\r\n]+$/.test(email) || email.length > 254) deny('Invalid recipient', 400);
  if (email === actor.email.toLowerCase()) return actor;
  // Authenticated mail features may resolve registered recipients only; never return the user list.
  const users = await base44.asServiceRole.entities.User.filter({ email }, undefined, 1);
  if (!users.length) deny('Recipient must be a registered app user', 403);
  return users[0];
}
export async function reserveSecurityAction(base44, user, { channel = 'email', limit = 10, recipient = '', dedupeKey = '', hourly = false } = {}) {
  if (!user?.id) deny('Unauthorized', 401);
  const log = base44.asServiceRole.entities.SecurityActionLog;
  if (dedupeKey && (await log.filter({ channel, dedupe_key: dedupeKey }, undefined, 1)).length) return false;
  const bucket = new Date().toISOString().slice(0, hourly ? 13 : 10);
  const used = await log.filter({ actor_id: user.id, channel, bucket }, undefined, limit);
  if (used.length >= limit) deny('Request limit reached; try again later', 429);
  if (recipient && (await log.filter({ channel, recipient, bucket }, undefined, 3)).length >= 3) deny('Recipient request limit reached', 429);
  await log.create({ actor_id: user.id, channel, recipient, bucket, dedupe_key: dedupeKey });
  return true;
}