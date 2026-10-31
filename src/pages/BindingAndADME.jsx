import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Crosshair, FlaskConical, Info, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AuthContext from '@/components/auth/AuthContext';
import useTrialStatus from '@/hooks/useTrialStatus';
import SubscriptionLock from '@/components/shared/SubscriptionLock';
import SimulationStatusBanner from '@/components/shared/SimulationStatusBanner';
import ResearchProductNav from '@/components/research/ResearchProductNav';
import HostedResults from '@/components/binding/HostedResults';
import useEngineRecommendation from '@/components/binding/useEngineRecommendation';
import useHostedPolling from '@/components/binding/useHostedPolling';
import SuggestInput from '@/components/binding/SuggestInput';
import { searchProteins, fetchProteinSequence, searchCompounds, fetchCompoundSmiles, checkSequence } from '@/components/binding/lookups';

const TASKS = [
  { id: 'binding', label: 'Protein–ligand binding', icon: Crosshair, blurb: 'Predict the complex structure and binding affinity of one ligand against one protein.' },
  { id: 'adme', label: 'ADME', icon: FlaskConical, blurb: 'Predict absorption, distribution, metabolism and excretion properties for up to 128 molecules.' },
];
const ADME_EXAMPLE = ['CC(=O)Oc1ccccc1C(=O)O', 'Cn1cnc2c1c(=O)n(C)c(=O)n2C', 'CC(C)Cc1ccc(cc1)C(C)C(=O)O'].join('\n');

const call = async (name, payload) => {
  try { return (await base44.functions.invoke(name, payload)).data; }
  catch (error) { const data = error?.response?.data; if (data) return data; throw error; }
};

function Section({ step, title, children }) {
  return <section className="border-b border-research-border pb-7 mb-7"><p className="research-label mb-2">{step}</p><h2 className="!text-lg mb-4">{title}</h2>{children}</section>;
}

function Choice({ active, onClick, children, disabled }) {
  return <button type="button" aria-pressed={active} disabled={disabled} onClick={onClick} className={`min-h-11 rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:opacity-50 ${active ? 'border-research-accent bg-research-soft text-research-accent' : 'border-research-border bg-research-card text-research-text hover:border-research-accent'}`}>{children}</button>;
}

export default function BindingAndADME() {
  const { user } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const initial = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return { task: p.get('task') === 'adme' ? 'adme' : 'binding', smiles: p.get('smiles') || '', ligand: p.get('ligand') || '', sequence: p.get('sequence') || '' };
  }, []);
  const [task, setTask] = useState(initial.task);
  const [goal, setGoal] = useState(null);
  const [sequence, setSequence] = useState(initial.sequence);
  const [ligand, setLigand] = useState(initial.ligand);
  const [admeText, setAdmeText] = useState(initial.smiles);
  const [provider, setProvider] = useState('auto');
  const [autoFallback, setAutoFallback] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [job, setJob] = useState(null);
  const pollError = useHostedPolling(job, setJob);
  const [picked, setPicked] = useState({ protein: '', ligand: '', adme: '' });
  const [lookupBusy, setLookupBusy] = useState('');

  // Remember a running job so leaving the page doesn't lose it.
  const RESUME_KEY = 'suttain-hosted-job';
  useEffect(() => {
    let id = null; try { id = localStorage.getItem(RESUME_KEY); } catch { /* storage unavailable */ }
    if (!id) return;
    call('pollHostedPredictions', { job_id: id }).then(data => {
      if (data?.job) { setJob(data.job); setTask(data.job.sim_type === 'adme' ? 'adme' : 'binding'); }
      else { try { localStorage.removeItem(RESUME_KEY); } catch { /* ignore */ } }
    }).catch(() => {});
  }, []);
  useEffect(() => {
    try {
      if (job?.id && ['pending', 'running'].includes(job.status)) localStorage.setItem(RESUME_KEY, job.id);
      else if (job?.id) localStorage.removeItem(RESUME_KEY);
    } catch { /* storage unavailable */ }
  }, [job?.id, job?.status]);

  const loadProtein = async item => {
    setLookupBusy('protein'); setFormError('');
    try {
      const seq = await fetchProteinSequence(item.id);
      setSequence(seq);
      setPicked(p => ({ ...p, protein: `${item.label} · ${item.id} · ${seq.length} residues${seq.length > 2900 ? ' (over the 2,900 limit: trim to the binding domain)' : ''}` }));
    } catch (e) { setFormError(e.message); } finally { setLookupBusy(''); }
  };
  const loadLigand = async item => {
    setLookupBusy('ligand'); setFormError('');
    try { const c = await fetchCompoundSmiles(item.label); setLigand(c.smiles); setPicked(p => ({ ...p, ligand: `${item.label} · ${c.formula || ''}${c.mw ? ` · ${Number(c.mw).toFixed(1)} g/mol` : ''}` })); }
    catch (e) { setFormError(e.message); } finally { setLookupBusy(''); }
  };
  const addAdme = async item => {
    setLookupBusy('adme'); setFormError('');
    try { const c = await fetchCompoundSmiles(item.label); setAdmeText(t => (t.trim() ? `${t.trim()}\n${c.smiles}` : c.smiles)); setPicked(p => ({ ...p, adme: `Added ${item.label}` })); }
    catch (e) { setFormError(e.message); } finally { setLookupBusy(''); }
  };

  const smilesList = useMemo(() => admeText.split('\n').map(s => s.trim()).filter(Boolean), [admeText]);
  const input = task === 'binding' ? { protein_sequence: sequence, ligand_smiles: ligand } : { smiles: smilesList };
  const admeCount = task === 'adme' ? smilesList.length : 0;

  const { rec, goals, recError } = useEngineRecommendation(task, goal, input, admeCount);
  const changeTask = nextTask => {
    setTask(nextTask); setGoal(null); setProvider('auto'); setJob(null); setFormError('');
  };
  const jobId = job?.id;
  useEffect(() => { if (jobId && window.innerWidth < 1024) document.getElementById('binding-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [jobId]);

  const submit = async event => {
    event.preventDefault();
    setFormError('');
    if (task === 'binding') {
      const seqProblem = checkSequence(sequence);
      if (seqProblem) { setFormError(seqProblem); document.getElementById('protein-seq')?.focus(); return; }
      if (!ligand.trim()) { setFormError('Enter a ligand SMILES, or search for a compound by name.'); return; }
    }
    if (task === 'adme' && (!smilesList.length || smilesList.length > 128)) { setFormError('Enter between 1 and 128 SMILES, one per line.'); return; }
    setSubmitting(true); setJob(null);
    try {
      const data = await call('runHostedPrediction', { task, goal: rec?.goal || goal, provider, auto_fallback: autoFallback, input });
      if (data?.job) setJob(data.job);
      else setFormError(data?.error || 'The calculation could not be submitted.');
    } catch { setFormError('The calculation could not be submitted. Check your connection and try again.'); }
    finally { setSubmitting(false); }
  };

  if (user && !trialStatus.canRunResearchSim) return <div className="research-surface min-h-screen"><ResearchProductNav /><div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12"><SimulationStatusBanner user={user} className="mb-6" /><SubscriptionLock pillar="research" featureName="Binding & ADME" limit /></div></div>;

  const engines = rec?.engines || [];
  const recommendedLabel = engines.find(e => e.provider === rec?.recommended)?.label;
  const running = job && ['pending', 'running'].includes(job.status);

  return <div className="research-surface min-h-screen">
    <ResearchProductNav />
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-research-muted mb-8"><Link to="/ResearchPortal" className="hover:text-research-accent">Research</Link><ChevronRight className="h-3 w-3" /><span aria-current="page">02 · Binding &amp; ADME</span></nav>
      {(initial.smiles || initial.ligand) && <div role="status" className="mb-6 flex gap-2 rounded-lg border border-research-border bg-research-soft p-3 text-sm"><Info className="h-4 w-4 shrink-0 mt-0.5 text-research-accent" /><p>Molecules carried over from your previous step are filled in below. Check them, choose a goal, then run.</p></div>}
      <div className="mb-9 max-w-3xl">
        <p className="research-label mb-4">Research / Step 02 · Predict</p>
        <div className="flex items-center gap-3 mb-4"><Crosshair className="h-6 w-6 text-research-accent" strokeWidth={1.5} /><h1>Binding &amp; ADME</h1></div>
        <p className="text-research-muted">Predict protein–ligand binding and ADME properties on hosted engines (Rowan, Boltz API, Tamarind Bio). Suttain recommends the best engine for your goal and switches to the next one if it is unavailable. Results are reported by the engine, never estimated. Bring candidates from your <Link to="/DrugDesign" className="underline hover:text-research-accent">Drug Design</Link> shortlist, and take the best one on to <Link to="/AtomisticSimulation" className="underline hover:text-research-accent">Atomistic Simulation</Link> for quantum chemistry.</p>
      </div>
      <SimulationStatusBanner user={user} className="mb-6" />

      <div className="grid grid-cols-12 gap-6 lg:gap-10">
        <form onSubmit={submit} className="col-span-12 lg:col-span-7 min-w-0">
          <Section step="01 / Calculation" title="What do you want to calculate?">
            <div role="group" aria-label="Calculation type" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TASKS.map(({ id, label, icon: Icon, blurb }) => <Choice key={id} active={task === id} disabled={submitting || running} onClick={() => changeTask(id)}><span className="flex items-center gap-2 font-medium"><Icon className="h-4 w-4" />{label}</span><span className="block mt-1 text-xs text-research-muted">{blurb}</span></Choice>)}
            </div>
          </Section>

          <Section step="02 / Goal" title="What do you want to find out?">
            <div role="group" aria-label="Goal" className="grid grid-cols-1 gap-2">
              {goals.map(g => <Choice key={g.id} active={(rec?.goal || goal) === g.id} disabled={task === 'adme' && admeCount > 10 && g.id === 'full_profile'} onClick={() => setGoal(g.id)}><span className="font-medium">{g.label}</span><span className="block text-xs text-research-muted">{g.hint}{task === 'adme' && admeCount > 10 && g.id === 'full_profile' ? ' (up to 10 molecules)' : ''}</span></Choice>)}
              {!goals.length && !recError && <p role="status" className="text-sm text-research-muted">Loading goals…</p>}
            </div>
          </Section>

          <Section step="03 / Input" title={task === 'binding' ? 'Protein and ligand' : 'Molecules'}>
            {task === 'binding' ? <div className="space-y-4">
              <SuggestInput label="Find a protein" placeholder="Name, gene or UniProt ID, e.g. lysozyme, EGFR, P00720" sourceNote="UniProtKB reviewed"
                hint="Suggestions from UniProt (about 150 million protein entries; reviewed Swiss-Prot entries shown). Pick one to fill the sequence."
                fetchSuggestions={searchProteins} onPick={loadProtein} />
              {lookupBusy === 'protein' && <p role="status" className="flex items-center gap-2 text-xs text-research-muted"><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading sequence from UniProt…</p>}
              {picked.protein && lookupBusy !== 'protein' && <p role="status" className="rounded-lg bg-research-soft p-2.5 text-xs text-research-text">Loaded {picked.protein}</p>}
              <div><label htmlFor="protein-seq" className="block text-sm font-medium mb-2">Protein sequence</label><textarea id="protein-seq" rows={5} value={sequence} onChange={e => setSequence(e.target.value)} placeholder="One-letter amino acid codes, e.g. MKTAYIAKQR…" className="simulation-control font-mono text-xs" spellCheck={false} /><p className="text-xs text-research-muted mt-1">Up to 2,900 residues. Trim to the domain involved in binding.</p></div>
              <SuggestInput label="Find a ligand" placeholder="Compound name, e.g. ibuprofen, benzene, imatinib" sourceNote="PubChem"
                hint="Suggestions from PubChem (about 119 million compounds). Pick one to fill the SMILES."
                fetchSuggestions={searchCompounds} onPick={loadLigand} />
              {lookupBusy === 'ligand' && <p role="status" className="flex items-center gap-2 text-xs text-research-muted"><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading structure from PubChem…</p>}
              {picked.ligand && lookupBusy !== 'ligand' && <p role="status" className="rounded-lg bg-research-soft p-2.5 text-xs text-research-text">Loaded {picked.ligand}</p>}
              <div><label htmlFor="ligand-smiles" className="block text-sm font-medium mb-2">Ligand SMILES</label><input id="ligand-smiles" value={ligand} onChange={e => setLigand(e.target.value)} placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O" className="simulation-control font-mono text-xs" spellCheck={false} /></div>
            </div> : <div>
              <div className="mb-4"><SuggestInput label="Add a molecule by name" placeholder="e.g. caffeine, paracetamol" sourceNote="PubChem"
                hint="Each pick adds its SMILES as a new line below." fetchSuggestions={searchCompounds} onPick={addAdme} />
                {picked.adme && lookupBusy !== 'adme' && <p role="status" className="mt-2 text-xs text-research-muted">{picked.adme}</p>}</div>
              <div className="flex items-center justify-between mb-2"><label htmlFor="adme-smiles" className="block text-sm font-medium">SMILES, one per line</label><button type="button" onClick={() => setAdmeText(ADME_EXAMPLE)} className="text-xs text-research-accent hover:underline">Load example</button></div>
              <textarea id="adme-smiles" rows={7} value={admeText} onChange={e => setAdmeText(e.target.value)} placeholder={'CC(=O)Oc1ccccc1C(=O)O\nCn1cnc2c1c(=O)n(C)c(=O)n2C'} className="simulation-control font-mono text-xs" spellCheck={false} />
              <p className={`text-xs mt-1 ${admeCount > 128 ? 'text-destructive' : 'text-research-muted'}`}>{admeCount} of 128 molecules</p>
            </div>}
          </Section>

          <Section step="04 / Engine" title="Compute engine">
            <label htmlFor="engine" className="block text-sm font-medium mb-2">Engine</label>
            <select id="engine" value={provider} onChange={e => setProvider(e.target.value)} className="simulation-control">
              <option value="auto">Auto (use recommendation)</option>
              {engines.map(e => <option key={e.provider} value={e.provider} disabled={!e.configured}>{e.label}{e.configured ? '' : ' (not connected)'}</option>)}
            </select>
            <label className="mt-3 flex items-start gap-2 text-sm"><input type="checkbox" checked={autoFallback} onChange={e => setAutoFallback(e.target.checked)} className="mt-1" /><span>Switch engines automatically if this one is unavailable<span className="block text-xs text-research-muted">Only out-of-credit or offline engines trigger a switch. Invalid input stops the run.</span></span></label>
          </Section>

          {formError && <p role="alert" className="mb-4 text-sm text-destructive">{formError}</p>}
          <button type="submit" disabled={submitting || running || !rec || !!recError || (task === 'adme' && admeCount > 128)} className="research-primary inline-flex items-center gap-2 disabled:opacity-50">{(submitting || running) && <Loader2 className="h-4 w-4 animate-spin" />}{submitting ? 'Submitting…' : running ? 'Running…' : 'Run calculation'}</button>
        </form>

        <aside className="col-span-12 lg:col-span-5 min-w-0 space-y-6">
          <div aria-live="polite" className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-research-accent" /><p className="research-label">Recommended engine</p></div>
            {recError ? <p className="text-sm text-research-muted">{recError}</p> : !rec ? <p role="status" className="text-sm text-research-muted">Choosing the best engine…</p> : <>
              <h3 className="!text-lg mb-2">Recommended: {recommendedLabel}</h3>
              <p className="text-sm text-research-muted mb-4">{rec.reason}</p>
              <p className="research-label mb-2">Order Auto will try</p>
              <ol className="space-y-2">{engines.map((e, i) => <li key={e.provider} className="flex items-start gap-3 text-sm"><span className="font-mono text-xs text-research-muted mt-0.5">{String(i + 1).padStart(2, '0')}</span><span className="min-w-0 flex-1"><span className={e.configured ? '' : 'text-research-muted'}>{e.label}</span><span className="block text-xs text-research-muted">{e.model}</span></span>{!e.configured && <span className="rounded border border-research-border px-2 py-0.5 text-xs text-research-muted">Not connected</span>}</li>)}</ol>
            </>}
          </div>
          <div id="binding-results" className="scroll-mt-32">
            <HostedResults job={job} />
            {pollError && <p role="alert" className="mt-3 rounded-lg border border-research-border bg-research-soft p-3 text-sm text-research-text">{pollError}</p>}
          </div>
          <p className="text-xs text-research-muted">Machine-learning predictions, not experimental measurements. Scores from different engines or model versions are not interchangeable; compare candidates within one engine.</p>
        </aside>
      </div>
    </div>
  </div>;
}