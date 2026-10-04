import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireUser, reserveSecurityAction } from '../../shared/securityGuards.ts';
import { validateSubmission } from '../../shared/drugDiscoveryRecords.ts';
import { runLigandScreening, screeningCapability } from '../../shared/ligandScreening.ts';
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req); const user = await requireUser(base44);
    if (req.method !== 'POST') return Response.json({ error: 'Use POST.' }, { status: 405 });
    const text = await req.text(); if (text.length > 6000) return Response.json({ error: 'Request too large.' }, { status: 413 });
    let input; try { input = JSON.parse(text); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
    const problem = validateSubmission(input); if (problem) return Response.json({ error: problem }, { status: 400 });
    if (!screeningCapability().available) return Response.json({ error: 'The screening engine did not pass its startup checks.' }, { status: 503 });
    await reserveSecurityAction(base44, user, { channel: 'ligand-screening', limit: 10, hourly: true });
    const started = new Date().toISOString();
    const result = await runLigandScreening(input);
    // Receipt identifies actual local execution; it is not an external compute receipt.
    const receipt = `chembl-ligand-${crypto.randomUUID()}`;
    const job = await base44.entities.DrugDiscoveryJob.create({
      target_ref: result.target.id, target_label: result.target.name,
      library: 'chembl_bioactive', method: result.method, max_candidates: input.max_candidates,
      compounds_screened: result.compounds_screened, status: 'Completed',
      execution_mode: 'real', provider_job_id: receipt,
      submit_timestamp: started, start_timestamp: started, end_timestamp: new Date().toISOString(), result
    });
    return Response.json({ success: true, job_id: job.id, receipt, compounds_screened: result.compounds_screened, candidates_retained: result.candidates.length });
  } catch (error) {
    console.error('Ligand screening failed', error.message);
    return Response.json({ error: error.status ? error.message : 'Screening could not be completed and saved. Please try again.' }, { status: error.status || 500 });
  }
}