// TEMPORARY probe. Delete after use.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { cacheHostedStructure } from '../../shared/hostedStructure.ts';
export default async function (req) {
  if (req.headers.get('x-debug') !== '4f14453e0a1d3f7b26ca5c0b4aead3fe') return new Response('no', { status: 403 });
  try {
    const base44 = createClientFromRequest(req);
    const job = await base44.asServiceRole.entities.SimulationJob.get('6ae534b48d0d2321c79f2ee3');
    const s = job.result?.structure?.cif_uri ? job.result.structure : await cacheHostedStructure(base44, job);
    const url = s ? (await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: s.cif_uri, expires_in: 600 })).signed_url : null;
    return Response.json({ structure: s, cif_url: url });
  } catch (e) { return Response.json({ error: String(e?.message || e), stack: String(e?.stack || '').slice(0, 600) }, { status: 500 }); }
}
