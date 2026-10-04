import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { submitDrugDiscoveryJob } from '@/functions/submitDrugDiscoveryJob';
export default function useDiscoveryActions(records, candidateJob) {
  const [saving, setSaving] = useState(false); const [submitting, setSubmitting] = useState(false); const [actionError, setActionError] = useState('');
  async function launch(payload) {
    if (submitting) return false; setSubmitting(true); setActionError('');
    try { await submitDrugDiscoveryJob(payload); await records.refresh(); return true; }
    catch (error) { setActionError(error.response?.data?.error || 'Could not submit this screening. No confirmed job is available.'); return false; }
    finally { setSubmitting(false); }
  }
  async function saveSelected(selected) {
    if (!records.user?.id || saving || records.shortlistLoading || records.shortlistError) return false;
    setSaving(true); setActionError('');
    try {
      const chosen = (candidateJob?.result?.candidates || []).filter(c => selected[c.id]);
      if (!chosen.length || !candidateJob?.id) return false;
      const existing = await base44.entities.DrugDiscoveryShortlist.filter({ created_by_id: records.user.id, candidate_id: { $in: chosen.map(c => c.id) } }, undefined, 250);
      const rows = chosen.map(({ id, is_reference, ...data }) => ({ ...data, candidate_id: id, score: data.binding_proxy_score ?? 0, sim: (data.binding_proxy_score ?? 0) * 100, binding_proxy_score: data.binding_proxy_score ?? undefined, most_similar_known_ligand: data.most_similar_known_ligand || undefined, reference_smiles: data.reference_smiles || undefined, source_job_id: candidateJob.id, target_chembl_id: candidateJob.target_ref, descriptor_method: candidateJob.result.descriptor_method, added_timestamp: new Date().toISOString(), is_illustrative: false }));
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
  return { saving, submitting, actionError, launch, saveSelected, remove };
}