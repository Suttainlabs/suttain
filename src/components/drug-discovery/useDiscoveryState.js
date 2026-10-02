import { useEffect, useState } from 'react';
import { CANDIDATES } from '@/components/drug-discovery/discoveryData';
import useTargetSearch from '@/components/drug-discovery/useTargetSearch';
export default function useDiscoveryState() {
  const search = useTargetSearch();
  const [view, setView] = useState('dashboard'); const [step, setStep] = useState(0);
  const [library, setLibrary] = useState('suttain_index'); const [method, setMethod] = useState('docking_ml_rerank');
  const [maxCandidates, setMaxCandidates] = useState(250); const [admetFilter, setAdmetFilter] = useState('standard'); const [libraryFile, setLibraryFile] = useState(null);
  const [jobProgress, setJobProgress] = useState(0); const [jobRunning, setJobRunning] = useState(false); const [jobDone, setJobDone] = useState(false); const [jobTarget, setJobTarget] = useState(null);
  const [riskFilter, setRiskFilter] = useState('all'); const [sortBy, setSortBy] = useState('score'); const [selected, setSelected] = useState({}); const [shortlist, setShortlist] = useState([]);
  useEffect(() => {
    if (!jobRunning) return;
    const timer = setInterval(() => setJobProgress(p => Math.min(100, p + 8)), 350);
    return () => clearInterval(timer);
  }, [jobRunning]);
  useEffect(() => { if (jobRunning && jobProgress === 100) { setJobRunning(false); setJobDone(true); } }, [jobRunning, jobProgress]);
  const validCount = Number.isInteger(Number(maxCandidates)) && Number(maxCandidates) >= 1 && Number(maxCandidates) <= 10000;
  const ready = !!search.selectedTarget && validCount && (library !== 'user_upload' || !!libraryFile);
  function navigate(nextView, nextStep) { setView(nextView); if (typeof nextStep === 'number') setStep(nextStep); }
  function start() { search.resetSearch(); setStep(0); setView('new'); }
  function launchJob() { if (!ready || jobRunning) return; setJobTarget(search.selectedTarget); setJobProgress(0); setJobDone(false); setJobRunning(true); setView('queue'); }
  function toggleSelect(id) { setSelected(prev => ({ ...prev, [id]: !prev[id] })); }
  function addSelectedToShortlist() {
    const items = CANDIDATES.filter(c => selected[c.id]);
    setShortlist(prev => [...prev, ...items.filter(c => !prev.some(item => item.id === c.id))]); setSelected({}); setView('shortlist');
  }
  function removeFromShortlist(id) { setShortlist(prev => prev.filter(c => c.id !== id)); }
  const visibleCandidates = CANDIDATES.filter(c => riskFilter === 'low' ? c.risk === 'low' : riskFilter === 'exclude_high' ? c.risk !== 'high' : true).sort((a, b) => sortBy === 'score' ? b.score - a.score : sortBy === 'sim' ? b.sim - a.sim : b.synth - a.synth);
  return { ...search, view, step, setStep, navigate, start, library, setLibrary, method, setMethod, maxCandidates, setMaxCandidates, admetFilter, setAdmetFilter, libraryFile, setLibraryFile, validCount, ready, jobProgress, jobRunning, jobDone, jobTarget, launchJob, riskFilter, setRiskFilter, sortBy, setSortBy, selected, shortlist, visibleCandidates, toggleSelect, addSelectedToShortlist, removeFromShortlist };
}