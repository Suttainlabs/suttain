// TEMPORARY probe. Delete after use.
import { secrets } from 'base44:runtime';
export default async function (req) {
  if (req.headers.get('x-debug') !== '4f14453e0a1d3f7b26ca5c0b4aead3fe') return new Response('no', { status: 403 });
  const key = secrets.get('TAMARIND_API_KEY') || '';
  const u = new URL(req.url);
  const path = u.searchParams.get('p') || 'tools';
  const r = await fetch(`https://app.tamarind.bio/api/${path}`, { headers: { 'x-api-key': key } });
  const t = await r.text();
  return new Response(JSON.stringify({ status: r.status, body: t.slice(0, 60000) }), { headers: { 'content-type': 'application/json' } });
}
