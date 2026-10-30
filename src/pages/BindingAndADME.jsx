import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Crosshair, FlaskConical, Info, Loader2, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AuthContext from '@/components/auth/AuthContext';
import useTrialStatus from '@/hooks/useTrialStatus';
import SubscriptionLock from '@/components/shared/SubscriptionLock';
import SimulationStatusBanner from '@/components/shared/SimulationStatusBanner';

const TASKS = [
  { id: 'binding', label: 'Protein–ligand binding', icon: Crosshair, blurb: 'Predict the complex structure and binding affinity of one ligand against one protein.' },
  { id: 'adme', label: 'ADME prediction', icon: FlaskConical, blurb: 'Predict absorption, distribution, metabolism and excretion properties for up to 128 molecules.' },
];
const ADME_EXAMPLE = ['CC(=O)Oc1ccccc1C(=O)O', 'Cn1cnc2c1c(=O)n(C)c(=O)n2C', 'CC(C)Cc1ccc(cc1)C(C)C(=O)O'].join('\n');
const POLL_MS = 15000;

const call = async (name, payload) => {
  try { return (await base44.functions.invoke(name, payload)).data; }
  catch (error) { const data = error?.response?.data; if (data) return data; throw error; }
};
const fmt = value => typeof value === 'number' ? (Number.isInteger(value) ? String(value) : value.toFixed(3)) : String(value ?? '—');
const prettyKey = key => key.split('.').pop().replace(/_/g, ' ');

function Section({ step, title, children }) {
  return <section className="border-b border-research-border pb-7 mb-7"><p className="research-label mb-2">{step}</p><h2 className="!text-lg mb-4">{title}</h2>{children}</section>;
}

function Choice({ active, onClick, children, disabled }) {
  return <button type="button" aria-pressed={active} disabled={disabled} onClick={onClick} className={`min-h-11 rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:opacity-50 ${active ? 'border-research-accent bg-research-soft text-research-accent' : 'border-research-border bg-research-card text-research-text hover:border-research-accent'}`}>{children}</button>;
}

function Results({ job }) {
  const r = job?.result || {};
  if (!job) return null;
  if (job.status === 'failed') return <div role="alert" className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6"><div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-5 w-5 text-destructive" /><h3 className="!text-lg">Calculation did not run</h3></div><p className="text-sm text-research-muted">{job.error || 'The provider reported a failure.'}</p>{!!r.attempts?.length && <ul className="mt-3 space-y-1 text-xs text-research-muted">{r.attempts.map((a, i) => <li key={i}><span className="font-mono">{a.provider}</span>: {a.message}</li>)}</ul>}</div>;
  if (job.status !== 'completed') return <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-research-border bg-research-card p-5 sm:p-6"><Loader2 className="h-5 w-5 animate-spin text-research-accent" /><div><p className="text-sm font-medium">Running on {job.engine}…</p><p className="text-xs text-research-muted">{r.model}. This page checks for results every 15 seconds; you can leave and come back.</p></div></div>;
  return <div className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6 space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="research-label mb-1">Result</p><h3 className="!text-lg">{job.job_name}</h3></div>
      <div className="text-right"><span className="inline-flex items-center gap-1.5 rounded-full border border-research-accent bg-research-soft px-3 py-1 text-xs text-research-accent"><CheckCircle2 className="h-3.5 w-3.5" />Ran on {job.engine}</span><p className="mt-1 text-xs text-research-muted">{r.model}</p></div>
    </div>
    {r.fallback && <div className="flex gap-2 rounded-lg border border-research-border bg-research-soft p-3 text-sm"><Info className="h-4 w-4 shrink-0 mt-0.5 text-research-accent" /><p>{r.fallback.notice}</p></div>}
    {r.task === 'binding' && (r.metrics?.length
      ? <div className="overflow-x-auto"><table className="w-full text-sm"><caption className="text-left text-xs text-research-muted mb-2">Reported by {job.engine}; not an AI estimate.</caption><thead><tr className="border-b border-research-border text-left text-xs text-research-muted"><th className="py-2 pr-4 font-medium">Metric</th><th className="py-2 pr-4 font-medium">Value</th><th className="py-2 font-medium">Field</th></tr></thead><tbody>{r.metrics.map(m => <tr key={m.key} className="border-b border-research-border last:border-0"><td className="py-2 pr-4 capitalize">{prettyKey(m.key)}</td><td className="py-2 pr-4 font-mono">{fmt(m.value)}</td><td className="py-2 font-mono text-xs text-research-muted">{m.key}</td></tr>)}</tbody></table></div>
      : <p className="text-sm text-research-muted">The provider completed the job but returned no affinity or confidence values. The full output is saved with this job.</p>)}
    {r.task === 'adme' && <div className="space-y-3">{(r.adme || []).map((row, i) => <div key={i} className="rounded-lg border border-research-border p-3"><p className="font-mono text-xs break-all mb-2">{row.smiles}</p>{row.status === 'failed' ? <p className="text-sm text-destructive">{row.error || 'Prediction failed for this molecule.'}</p> : <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">{Object.entries(row.properties || {}).map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-xs text-research-muted truncate">{k.replace(/_/g, ' ')}</dt><dd className="font-mono">{fmt(v)}</dd></div>)}</dl>}</div>)}<p className="text-xs text-research-muted">Reported by {job.engine}; not an AI estimate. Property names differ between engines.</p></div>}
    {r.limitations && <p className="text-xs text-research-muted">{r.limitations}</p>}
    {!!r.citations?.length && <div className="border-t border-research-border pt-3"><p className="research-label mb-1">Cite</p>{r.citations.map((c, i) => <p key={i} className="text-xs text-research-muted">{c.text}</p>)}</div>}
  </div>;
}

export default function BindingAndADME() {
  const { user } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const [task, setTask] = useState('binding');
  const [goal, setGoal] = useState(null);
  const [sequence, setSequence] = useState('');
  const [ligand, setLigand] = useState('');
  const [admeText, setAdmeText] = useState('');
  const [provider, setProvider] = useState('auto');
  const [autoFallback, setAutoFallback] = useState(true);
  const [rec, setRec] = useState(null);
  const [recError, setRecError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [job, setJob] = useState(null);
  const pollRef = useRef(null);

  const smilesList = useMemo(() => admeText.split('\n').map(s => s.trim()).filter(Boolean), [admeText]);
  const input = task === 'binding' ? { protein_sequence: sequence, ligand_smiles: ligand } : { smiles: smilesList };
  const admeCount = task === 'adme' ? smilesList.length : 0;

  // Recommendation follows task, goal and (for ADME) batch size. No compute is run.
  useEffect(() => {
    let cancelled = false;
    setRecError('');
    const t = setTimeout(async () => {
      try {
        const data = await call('recommendEngine', { task, goal, input: task === 'adme' ? { smiles: smilesList } : {} });
        if (cancelled) return;
        if (data?.error) { setRecError(data.error); return; }
        setRec(data);
        if (!goal && data.goal) setGoal(data.goal);
      } catch { if (!cancelled) setRecError('Engine recommendation could not load. You can still choose an engine.'); }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [task, goal, admeCount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setGoal(null); setProvider('auto'); setJob(null); setFormError(''); }, [task]);
  useEffect(() => () => clearInterval(pollRef.current), []);

  const startPolling = jobId => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const data = await call('pollHostedPredictions', { job_id: jobId });
        if (data?.job) { setJob(data.job); if (['completed', 'failed'].includes(data.job.status)) clearInterval(pollRef.current); }
      } catch { /* transient network error: keep polling */ }
    }, POLL_MS);
  };

  const submit = async event => {
    event.preventDefault();
    setFormError('');
    if (task === 'binding' && (!sequence.trim() || !ligand.trim())) { setFormError('Enter a protein sequence and one ligand SMILES.'); return; }
    if (task === 'adme' && (!smilesList.length || smilesList.length > 128)) { setFormError('Enter between 1 and 128 SMILES, one per line.'); return; }
    setSubmitting(true); setJob(null);
    try {
      const data = await call('runHostedPrediction', { task, goal, provider, auto_fallback: autoFallback, input });
      if (data?.job) { setJob(data.job); if (['pending', 'running'].includes(data.job.status)) startPolling(data.job.id); }
      else setFormError(data?.error || 'The calculation could not be submitted.');
    } catch { setFormError('The calculation could not be submitted. Check your connection and try again.'); }
    finally { setSubmitting(false); }
  };

  if (user && !trialStatus.canRunResearchSim) return <div className="research-surface min-h-screen"><div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12"><SimulationStatusBanner user={user} className="mb-6" /><SubscriptionLock pillar="research" featureName="Binding & ADME" limit /></div></div>;

  const engines = rec?.engines || [];
  const recommendedLabel = engines.find(e => e.provider === rec?.recommended)?.label;
  const running = job && ['pending', 'running'].includes(job.status);

  return <div className="research-surface min-h-screen">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-research-muted mb-8"><Link to="/ResearchPortal" className="hover:text-research-accent">Research</Link><ChevronRight className="h-3 w-3" /><span aria-current="page">Binding &amp; ADME</span></nav>
      <div className="mb-9 max-w-3xl">
        <p className="research-label mb-4">Research / Binding &amp; ADME</p>
        <div className="flex items-center gap-3 mb-4"><Crosshair className="h-6 w-6 text-research-accent" strokeWidth={1.5} /><h1>Binding &amp; ADME</h1></div>
        <p className="text-research-muted">Predict protein–ligand binding and ADME properties on hosted engines (Rowan, Boltz API, Tamarind Bio). Suttain recommends the best engine for your goal and switches to the next one if it is unavailable. Results are reported by the engine, never estimated. For quantum chemistry, use <Link to="/AtomisticSimulation" className="underline hover:text-research-accent">Atomistic Simulation</Link>.</p>
      </div>
      <SimulationStatusBanner user={user} className="mb-6" />

      <div className="grid grid-cols-12 gap-6 lg:gap-10">
        <form onSubmit={submit} className="col-span-12 lg:col-span-7 min-w-0">
          <Section step="01 / Calculation" title="What do you want to calculate?">
            <div role="group" aria-label="Calculation type" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TASKS.map(({ id, label, icon: Icon, blurb }) => <Choice key={id} active={task === id} onClick={() => setTask(id)}><span className="flex items-center gap-2 font-medium"><Icon className="h-4 w-4" />{label}</span><span className="block mt-1 text-xs text-research-muted">{blurb}</span></Choice>)}
            </div>
          </Section>

          <Section step="02 / Goal" title="What do you want to find out?">
            <div role="group" aria-label="Goal" className="grid grid-cols-1 gap-2">
              {(rec?.goals || []).map(g => <Choice key={g.id} active={rec?.goal === g.id} disabled={task === 'adme' && admeCount > 10 && g.id === 'full_profile'} onClick={() => setGoal(g.id)}><span className="font-medium">{g.label}</span><span className="block text-xs text-research-muted">{g.hint}{task === 'adme' && admeCount > 10 && g.id === 'full_profile' ? ' (up to 10 molecules)' : ''}</span></Choice>)}
              {!rec && !recError && <p role="status" className="text-sm text-research-muted">Loading goals…</p>}
            </div>
          </Section>

          <Section step="03 / Input" title={task === 'binding' ? 'Protein and ligand' : 'Molecules'}>
            {task === 'binding' ? <div className="space-y-4">
              <div><label htmlFor="protein-seq" className="block text-sm font-medium mb-2">Protein sequence</label><textarea id="protein-seq" rows={5} value={sequence} onChange={e => setSequence(e.target.value)} placeholder="One-letter amino acid codes, e.g. MKTAYIAKQR…" className="simulation-control font-mono text-xs" spellCheck={false} /><p className="text-xs text-research-muted mt-1">Up to 2,900 residues. Trim to the domain involved in binding.</p></div>
              <div><label htmlFor="ligand-smiles" className="block text-sm font-medium mb-2">Ligand SMILES</label><input id="ligand-smiles" value={ligand} onChange={e => setLigand(e.target.value)} placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O" className="simulation-control font-mono text-xs" spellCheck={false} /></div>
            </div> : <div>
              <div className="flex items-center justify-between mb-2"><label htmlFor="adme-smiles" className="block text-sm font-medium">SMILES, one per line</label><button type="button" onClick={() => setAdmeText(ADME_EXAMPLE)} className="text-xs text-research-accent hover:underline">Load example</button></div>
              <textarea id="adme-smiles" rows={7} value={admeText} onChange={e => setAdmeText(e.target.value)} placeholder={'CC(=O)Oc1ccccc1C(=O)O\nCn1cnc2c1c(=O)n(C)c(=O)n2C'} className="simulation-control font-mono text-xs" spellCheck={false} />
              <p className={`text-xs mt-1 ${admeCount > 128 ? 'text-destructive' : 'text-research-muted'}`}>{admeCount} of 128 molecules</p>
            </div>}
          </Section>

          <Section step="04 / Engine" title="Compute engine">
            <label htmlFor="engine" className="block text-sm font-medium mb-2">Engine</label>
            <select id="engine" value={provider} onChange={e => setProvider(e.target.value)} className="simulation-control">
              <option value="auto">Auto (use recommendation{recommendedLabel ? `: ${recommendedLabel}` : ''})</option>
              {engines.map(e => <option key={e.provider} value={e.provider} disabled={!e.configured}>{e.label}{e.configured ? '' : ' (not connected)'}</option>)}
            </select>
            <label className="mt-3 flex items-start gap-2 text-sm"><input type="checkbox" checked={autoFallback} onChange={e => setAutoFallback(e.target.checked)} className="mt-1" /><span>Switch engines automatically if this one is unavailable<span className="block text-xs text-research-muted">Only out-of-credit or offline engines trigger a switch. Invalid input stops the run.</span></span></label>
          </Section>

          {formError && <p role="alert" className="mb-4 text-sm text-destructive">{formError}</p>}
          <button type="submit" disabled={submitting || running || (task === 'adme' && admeCount > 128)} className="research-primary inline-flex items-center gap-2 disabled:opacity-50">{(submitting || running) && <Loader2 className="h-4 w-4 animate-spin" />}{submitting ? 'Submitting…' : running ? 'Running…' : 'Run calculation'}</button>
        </form>

        <aside className="col-span-12 lg:col-span-5 min-w-0 space-y-6">
          <div aria-live="polite" className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-research-accent" /><p className="research-label">Recommended engine</p></div>
            {recError ? <p className="text-sm text-research-muted">{recError}</p> : !rec ? <p role="status" className="text-sm text-research-muted">Choosing the best engine…</p> : <>
              <h3 className="!text-lg mb-2">{recommendedLabel}</h3>
              <p className="text-sm text-research-muted mb-4">{rec.reason}</p>
              <p className="research-label mb-2">Order Auto will try</p>
              <ol className="space-y-2">{engines.map((e, i) => <li key={e.provider} className="flex items-start gap-3 text-sm"><span className="font-mono text-xs text-research-muted mt-0.5">{String(i + 1).padStart(2, '0')}</span><span className="min-w-0 flex-1"><span className={e.configured ? '' : 'text-research-muted'}>{e.label}</span><span className="block text-xs text-research-muted">{e.model}</span></span>{!e.configured && <span className="rounded border border-research-border px-2 py-0.5 text-xs text-research-muted">Not connected</span>}</li>)}</ol>
            </>}
          </div>
          <Results job={job} />
          <p className="text-xs text-research-muted">Machine-learning predictions, not experimental measurements. Scores from different engines or model versions are not interchangeable; compare candidates within one engine.</p>
        </aside>
      </div>
    </div>
  </div>;
}
