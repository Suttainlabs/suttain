import { useState } from 'react';
import useDiscoveryRecords from '@/components/drug-design/useDiscoveryRecords';
import useDiscoveryActions from '@/components/drug-design/useDiscoveryActions';
import { CANDIDATES } from '@/components/drug-design/discoveryData';
import useTargetSearch from '@/components/drug-design/useTargetSearch';
export default function useDiscoveryState() {
  const search = useTargetSearch();
  const [view, setView] = useState('dashboard'); const [step, setStep] = useState(0);
  const [library, setLibrary] = useState('suttain_index'); const [method, setMethod] = useState('docking_ml_rerank');
  const [maxCandidates, setMaxCandidates] = useState(250); const [admetFilter, setAdmetFilter] = useState('standard'); const [libraryFile, setLibraryFile] = useState(null);
  const records = useDiscoveryRecords(); const actions = useDiscoveryActions(records);
  const [riskFilter, setRiskFilter] = useState('all'); const [sortBy, setSortBy] = useState('score'); const [selected, setSelected] = useState({});
  const validCount = Number.isInteger(Number(maxCandidates)) && Number(maxCandidates) >= 1 && Number(maxCandidates) <= 10000;
  const ready = !!search.selectedTarget && validCount && (library !== 'user_upload' || !!libraryFile);
  function navigate(nextView, nextStep) { setView(nextView); if (typeof nextStep === 'number') setStep(nextStep); }
  function start() { search.resetSearch(); setStep(0); setView('new'); }
  async function launchJob() {
    if (!ready) return;
    const target = search.selectedTarget;
    if (await actions.launch({ target_ref: target.pdb_id || target.chembl_id || target.uniprot_id, target_label: target.name, library, method, max_candidates: Number(maxCandidates) })) setView('queue');
  }
  function toggleSelect(id) { setSelected(prev => ({ ...prev, [id]: !prev[id] })); }
  async function addSelectedToShortlist() { if (await actions.saveSelected(selected)) { setSelected({}); setView('shortlist'); } }
  const removeFromShortlist = actions.remove;
  const visibleCandidates = CANDIDATES.filter(c => riskFilter === 'low' ? c.risk === 'low' : riskFilter === 'exclude_high' ? c.risk !== 'high' : true).sort((a, b) => sortBy === 'score' ? b.score - a.score : sortBy === 'sim' ? b.sim - a.sim : b.synth - a.synth);
  return { ...search, ...records, ...actions, view, step, setStep, navigate, start, library, setLibrary, method, setMethod, maxCandidates, setMaxCandidates, admetFilter, setAdmetFilter, libraryFile, setLibraryFile, validCount, ready, launchJob, riskFilter, setRiskFilter, sortBy, setSortBy, selected, visibleCandidates, toggleSelect, addSelectedToShortlist, removeFromShortlist };
}