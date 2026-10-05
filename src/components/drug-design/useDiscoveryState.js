import { useEffect, useState } from 'react';
import useDiscoveryRecords from '@/components/drug-design/useDiscoveryRecords';
import useDiscoveryActions from '@/components/drug-design/useDiscoveryActions';

import useTargetSearch from '@/components/drug-design/useTargetSearch';
export default function useDiscoveryState() {
  const search = useTargetSearch();
  const [view, setView] = useState('dashboard'); const [step, setStep] = useState(0);
  const [library, setLibrary] = useState('chembl_bioactive'); const [method, setMethod] = useState('ligand_similarity');
  const [evidenceQuality, setEvidenceQuality] = useState('standard'); const [affinityType, setAffinityType] = useState('IC50');
  const [maxCandidates, setMaxCandidates] = useState(250); const [admetFilter, setAdmetFilter] = useState('standard'); const [libraryFile, setLibraryFile] = useState(null);
  const records = useDiscoveryRecords();
  const [selectedJobId, setSelectedJobId] = useState(null);
  const candidateJob = selectedJobId ? records.jobs.data?.find(job => job.id === selectedJobId) : records.latestJob;
  const candidates = candidateJob?.result?.candidates || [];
  const actions = useDiscoveryActions(records, candidateJob);
  const [riskFilter, setRiskFilter] = useState('all'); const [sortBy, setSortBy] = useState('score'); const [selected, setSelected] = useState({});
  useEffect(() => { setSelected({}); }, [candidateJob?.id]);
  const validCount = Number.isInteger(Number(maxCandidates)) && Number(maxCandidates) >= 1 && Number(maxCandidates) <= 250;
  const ready = !!(search.selectedTarget?.chembl_id || search.selectedTarget?.uniprot_id) && validCount && ['chembl_bioactive', 'bindingdb', 'pubchem'].includes(library);
  function openJob(id) { setSelectedJobId(id); setSelected({}); setView('candidates'); }
  function navigate(nextView, nextStep) { setView(nextView); if (typeof nextStep === 'number') setStep(nextStep); }
  function start() { search.resetSearch(); setStep(0); setView('new'); }
  async function launchJob() {
    if (!ready) return;
    const target = search.selectedTarget;
    if (await actions.launch({ target_ref: target.chembl_id || target.uniprot_id, target_chembl_id: target.chembl_id, target_uniprot_id: target.uniprot_id, target_label: target.name, library, method, max_candidates: Number(maxCandidates), admet_filter: admetFilter, evidence_quality: evidenceQuality, affinity_type: affinityType })) { setSelectedJobId(null); setSelected({}); setView('queue'); }
  }
  function toggleSelect(id) { setSelected(prev => ({ ...prev, [id]: !prev[id] })); }
  async function addSelectedToShortlist() { if (await actions.saveSelected(selected)) { setSelected({}); setView('shortlist'); } }
  const removeFromShortlist = actions.remove;
  const visibleCandidates = candidates.filter(c => riskFilter === 'low' ? c.risk === 'low' : riskFilter === 'exclude_high' ? c.risk !== 'high' : true).sort((a, b) => sortBy === 'mw' ? a.molecular_weight - b.molecular_weight : sortBy === 'risk' ? (a.lipinski_violations + a.veber_violations) - (b.lipinski_violations + b.veber_violations) : (a.rank ?? 999) - (b.rank ?? 999) || (b.ranking_score ?? b.binding_proxy_score ?? -1) - (a.ranking_score ?? a.binding_proxy_score ?? -1));
  return { ...search, ...records, ...actions, candidateJob, openJob, view, step, setStep, navigate, start, library, setLibrary, method, setMethod, maxCandidates, setMaxCandidates, admetFilter, setAdmetFilter, libraryFile, setLibraryFile, validCount, ready, evidenceQuality, setEvidenceQuality, affinityType, setAffinityType, launchJob, riskFilter, setRiskFilter, sortBy, setSortBy, selected, visibleCandidates, toggleSelect, addSelectedToShortlist, removeFromShortlist };
}