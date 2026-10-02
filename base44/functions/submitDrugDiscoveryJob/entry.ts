import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireUser } from '../../shared/securityGuards.ts';
import { computeUnavailable, validateSubmission } from '../../shared/drugDiscoveryRecords.ts';
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req); await requireUser(base44);
    const text = await req.text(); if (text.length > 6000) return Response.json({ error: 'Request too large.' }, { status: 413 });
    let input; try { input = JSON.parse(text); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
    const problem = validateSubmission(input); if (problem) return Response.json({ error: problem }, { status: 400 });
    // The existing HPC endpoint manufactures job IDs and progress. Never invoke it,
    // create a submitted record, or report requested limits as screened compounds.
    // An actual provider receipt is required before a real job may be persisted.
    return Response.json({ code: 'COMPUTE_NOT_CONNECTED', error: computeUnavailable }, { status: 503 });
  } catch (error) { return Response.json({ error: error.status === 401 ? 'Unauthorized' : 'Unable to submit screening.' }, { status: error.status || 500 }); }
}