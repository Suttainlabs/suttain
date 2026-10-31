// TEMPORARY: inspect the shape of one Boltz prediction output. Delete after use.
import { secrets } from 'base44:runtime';
function shape(v: any, depth = 0): any {
  if (depth > 6) return '…';
  if (Array.isArray(v)) return v.length ? [`len=${v.length}`, shape(v[0], depth + 1)] : [];
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x, depth + 1)]));
  if (typeof v === 'string') return v.length > 160 ? `${v.slice(0, 160)}…(len ${v.length})` : v;
  return v;
}
Deno.serve(async (req) => {
  if (req.headers.get('x-debug') !== '4f14453e0a1d3f7b26ca5c0b4aead3fe') return new Response('no', { status: 403 });
  const id = new URL(req.url).searchParams.get('id') || 'sab_pred_zeQsl0AH74Pe7mTPzo99';
  const r = await fetch(`https://api.boltz.bio/compute/v1/predictions/structure-and-binding/${id}`, { headers: { 'x-api-key': secrets.get('BOLTZ_API_KEY') || '' } });
  const data = await r.json();
  return Response.json({ status: r.status, shape: shape(data) });
});
