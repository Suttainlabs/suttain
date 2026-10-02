import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { submitDrugDiscoveryJob } from '@/functions/submitDrugDiscoveryJob';
import { CANDIDATES } from '@/components/drug-discovery/discoveryData';
export default function useDiscoveryActions(records) {
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
      const ids = CANDIDATES.filter(c => selected[c.id]).map(c => c.id);
      if (!ids.length) return false;
      const existing = await base44.entities.DrugDiscoveryShortlist.filter({ created_by_id: records.user.id, candidate_id: { $in: ids } }, undefined, 100);
      const rows = CANDIDATES.filter(c => selected[c.id] && !existing.some(row => row.candidate_id === c.id)).map(({ id, ...data }) => ({ ...data, candidate_id: id, added_timestamp: new Date().toISOString(), is_illustrative: true }));
      if (rows.length) await base44.entities.DrugDiscoveryShortlist.bulkCreate(rows);
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