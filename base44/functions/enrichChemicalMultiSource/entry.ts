import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { enrichChemicalMultiSource } from '../../shared/externalDatabaseAdapters.ts';

export default async function (req) {
  const appId = Deno.env.get('BASE44_APP_ID');
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { query, adapters } = body;
    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'query (string) is required' }, { status: 400 });
    }

    console.log(`[${appId}] enrichChemicalMultiSource: user=${user.email} query=${query} adapters=${adapters ? adapters.join(',') : 'all'}`);

    const result = await enrichChemicalMultiSource(query, { adapters });

    return Response.json({
      query: result.query,
      identity: result.identity,
      sources: result.sources,
      source_status: result.source_status,
      retrieved_at: result.retrieved_at,
    });
  } catch (error) {
    console.error(`[${appId}] enrichChemicalMultiSource error:`, error.message);
    return Response.json({ error: 'Enrichment failed', details: error.message }, { status: 500 });
  }
}