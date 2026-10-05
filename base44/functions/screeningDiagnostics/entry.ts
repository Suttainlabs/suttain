import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireUser } from '../../shared/securityGuards.ts';
import { runSourceTests } from '../../shared/screeningSourceTests.ts';
import { runLigandScreening } from '../../shared/ligandScreening.ts';
import { validateSubmission } from '../../shared/drugDiscoveryRecords.ts';
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req), user = await requireUser(base44);
    if (user.role !== 'admin') return Response.json({ error: 'Administrator access required.' }, { status: 403 });
    const text = await req.text(); if (text.length > 2000) return Response.json({ error: 'Request too large.' }, { status: 400 });
    const input = JSON.parse(text || '{}');
    if (input.mode === 'live') {
      const submission = { ...input, max_candidates: Math.min(input.max_candidates || 25, 25) };
      const problem = validateSubmission(submission); if (problem) return Response.json({ error: problem }, { status: 400 });
      const result = await runLigandScreening(submission);
      return Response.json({ saved: false, source_status: result.source_status, candidates: result.candidates.slice(0, 3), processed: result.compounds_screened, retained: result.candidates.length, source: result.source, target: result.target });
    }
    return Response.json(await runSourceTests());
  } catch (e) { return Response.json({ error: e.message, source_status: e.sourceStatus || [] }, { status: e.status || 500 }); }
}