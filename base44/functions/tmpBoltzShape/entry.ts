// TEMPORARY: inspect one Boltz prediction output. Delete after use.
import { secrets } from 'base44:runtime';
Deno.serve(async (req) => {
  if (req.headers.get('x-debug') !== '4f14453e0a1d3f7b26ca5c0b4aead3fe') return new Response('no', { status: 403 });
  const id = new URL(req.url).searchParams.get('id') || 'sab_pred_zeQsl0AH74Pe7mTPzo99';
  const r = await fetch(`https://api.boltz.bio/compute/v1/predictions/structure-and-binding/${id}`, { headers: { 'x-api-key': secrets.get('BOLTZ_API_KEY') || '' } });
  const data = await r.json();
  const out: any = {};
  for (const k of ['structure', 'ligand_structure']) {
    const s = await fetch(data.output.best_sample[k].url);
    const t = await s.text();
    out[k] = { ct: s.headers.get('content-type'), len: t.length, head: t.slice(0, 700), atomLines: t.split('\n').filter(l => /^(ATOM|HETATM)/.test(l)).slice(0, 3), tail: t.slice(-300) };
  }
  const a = await fetch(data.output.archive.url); const buf = new Uint8Array(await a.arrayBuffer()); out.archive = { ct: a.headers.get('content-type'), len: buf.byteLength, names: new TextDecoder('latin1').decode(buf).match(/[\w\-\/]+\.(cif|pdb|json|npz|sdf|mol2|txt)/g)?.slice(0, 20) };
  return Response.json(out);
});
