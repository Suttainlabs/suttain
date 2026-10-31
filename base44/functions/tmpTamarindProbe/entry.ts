// TEMPORARY probe. Delete after use.
import { secrets } from 'base44:runtime';
export default async function (req) {
  if (req.headers.get('x-debug') !== '4f14453e0a1d3f7b26ca5c0b4aead3fe') return new Response('no', { status: 403 });
  const key = secrets.get('TAMARIND_API_KEY') || '';
  const u = new URL(req.url);
  const want = (u.searchParams.get('t') || '').split(',').filter(Boolean);
  const r = await fetch('https://app.tamarind.bio/api/tools', { headers: { 'x-api-key': key } });
  const tools = await r.json();
  if (!want.length) return Response.json({ status: r.status, names: tools.map((t: any) => `${t.name}|${t.displayName}|${t.taskType}`) });
  return Response.json(tools.filter((t: any) => want.includes(t.name)));
}
