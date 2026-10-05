import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { submitDrugDiscoveryJob } from '@/functions/submitDrugDiscoveryJob';
export default function useDiscoveryActions(records, candidateJob) {
  const [sourceFailures, setSourceFailures] = useState([]);
  const [saving, setSaving] = useState(false); const [submitting, setSubmitting] = useState(false); const [actionError, setActionError] = useState('');
  async function launch(payload) {
    if (submitting) return false; setSubmitting(true); setActionError(''); setSourceFailures([]);
    try { await submitDrugDiscoveryJob(payload); await records.refresh(); return true; }
    catch (error) { setActionError(error.response?.data?.error || 'Could not submit this screening. No confirmed job is available.'); setSourceFailures(error.response?.data?.source_status || []); return false; }
    finally { setSubmitting(false); }
  }
  async function saveSelected(selected) {
    if (!records.user?.id || saving || records.shortlistLoading || records.shortlistError) return false;
    setSaving(true); setActionError('');
    try {
      const chosen = (candidateJob?.result?.candidates || []).filter(c => selected[c.id]);
      if (!chosen.length || !candidateJob?.id) return false;
      const existing = await base44.entities.DrugDiscoveryShortlist.filter({ created_by_id: records.user.id, candidate_id: { $in: chosen.map(c => c.id) } }, undefined, 250);
      const rows = chosen.map(({ id, is_reference, rank, ...data }) => Object.fromEntries(Object.entries({ ...data, candidate_id: id, score: data.ranking_score ?? data.binding_proxy_score ?? 0, sim: (data.binding_proxy_score ?? 0) * 100, source_job_id: candidateJob.id, target_chembl_id: candidateJob.result.target?.chembl_id || (/^CHEMBL/.test(candidateJob.target_ref) ? candidateJob.target_ref : undefined), target_uniprot_id: candidateJob.result.target?.uniprot_id, descriptor_method: candidateJob.result.descriptor_method, screening_provenance: { source_status: candidateJob.result.source_status || [], target_match: candidateJob.result.target?.match_basis, ranking_explanation: candidateJob.result.ranking_explanation, retrieved_at: candidateJob.result.retrieved_at }, added_timestamp: new Date().toISOString(), is_illustrative: false }).filter(([, value]) => value !== null && value !== undefined)));
      const fresh = rows.filter(row => !existing.some(old => old.candidate_id === row.candidate_id));
      const updates = rows.flatMap(row => { const old = existing.find(item => item.candidate_id === row.candidate_id); return old ? [{ ...row, id: old.id }] : []; });
      if (fresh.length) await base44.entities.DrugDiscoveryShortlist.bulkCreate(fresh);
      if (updates.length) await base44.entities.DrugDiscoveryShortlist.bulkUpdate(updates);
      await records.refresh(); return true;
    } catch { setActionError('Could not save your shortlist. Please try again.'); return false; }
    finally { setSaving(false); }
  }
  async function remove(id) {
    if (!records.user?.id || saving) return; setSaving(true); setActionError('');
    try { await base44.entities.DrugDiscoveryShortlist.deleteMany({ created_by_id: records.user.id, candidate_id: id }); await records.refresh(); }
    catch { setActionError('Could not remove the candidate. Please try again.'); }
    finally { setSaving(false); }
  }
  return { saving, submitting, actionError, sourceFailures, launch, saveSelected, remove };
}