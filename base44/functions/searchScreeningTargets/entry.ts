import { operationClient } from '../../shared/researchApiContext.ts';
import { requireUser, reserveSecurityAction } from '../../shared/securityGuards.ts';
import { searchEvidenceTargets } from '../../shared/screeningTargetSearch.ts';
export default async function(req) {
  try {
    const base44 = await operationClient(req,'searchScreeningTargets'), user = await requireUser(base44);
    const text = await req.text(); if (text.length > 1000) return Response.json({ error: 'Search request too large.' }, { status: 400 });
    const { query } = JSON.parse(text);
    if (typeof query !== 'string' || !query.trim() || query.length > 150) return Response.json({ error: 'Enter a target name or identifier (up to 150 characters).' }, { status: 400 });
    await reserveSecurityAction(base44, user, { channel: 'screening-target-search', limit: 120, hourly: true });
    return Response.json(await searchEvidenceTargets(query));
  } catch (e) { return Response.json({ error: e.status ? e.message : 'Target search could not be completed.' }, { status: e.status || 500 }); }
}