import React, { useEffect, useRef, useState } from 'react';
import { FileText, Atom, Activity, Zap, Compass, FileCode2, Terminal, Database, Check, Loader2, Clock } from 'lucide-react';

const PREVIEW = {
  Rowan: { title: 'A computed result from Rowan', items: [[Atom, 'Optimised 3D geometry you can rotate and download'], [Activity, 'Energy at every optimisation step'], [Zap, 'Atomic charges and spin densities'], [Compass, 'Dipole moment and citations']] },
  PubChem: { title: 'Existing data from PubChem', items: [[Database, 'Recorded properties for the compound'], [FileText, 'Identifiers and source links']] },
  default: { title: 'A ready-to-run input package', items: [[FileCode2, 'Input files for your chosen engine'], [Terminal, 'Run commands for your computer or cluster'], [FileText, 'Method notes and citations']] },
};
const STAGES = [['submitted', 'Submitted'], ['pending', 'Queued'], ['running', 'Running'], ['completed', 'Results ready']];

function Elapsed({ since }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const s = Math.max(0, Math.round((now - since) / 1000));
  return <span className="font-mono tabular-nums">{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</span>;
}

export default function SimulationResultsRail({ children, hasOutput, isRunning, engine, jobStatus }) {
  const ref = useRef(null);
  const startedAt = useRef(null);
  const had = useRef(hasOutput);
  if (isRunning && !startedAt.current) startedAt.current = Date.now();
  if (!isRunning) startedAt.current = null;

  // Phones: the results sit below the setup panel, so bring them into view when a run starts or finishes.
  useEffect(() => {
    const arrived = (hasOutput && !had.current) || isRunning;
    had.current = hasOutput;
    if (arrived && window.innerWidth < 1024) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hasOutput, isRunning]);

  const preview = PREVIEW[engine] || PREVIEW.default;
  const hosted = engine === 'Rowan';
  const current = jobStatus === 'running' ? 2 : jobStatus === 'pending' ? 1 : 0;

  return (
    <section ref={ref} aria-label="Workflow results" className="min-w-0 space-y-5 scroll-mt-32">
      <div className="flex items-center justify-between gap-3"><h2 className="!text-lg">Results &amp; activity</h2><span className="research-label">{engine}</span></div>

      {!hasOutput && !isRunning && (
        <div className="rounded-xl border border-dashed border-research-border bg-research-card px-5 py-8 sm:px-8 sm:py-10">
          <FileText className="h-7 w-7 text-research-muted mb-4" />
          <h3 className="mb-1">Your results will appear here</h3>
          <p className="text-sm text-research-muted max-w-md">Add a structure on the left, check the method, then {hosted ? 'run it' : engine === 'PubChem' ? 'look it up' : 'prepare the workflow'}. You will get:</p>
          <p className="research-label mt-6 mb-3">{preview.title}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {preview.items.map(([Icon, text]) => <li key={text} className="flex items-start gap-3 text-sm"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-research-soft text-research-accent"><Icon className="h-4 w-4" /></span><span className="pt-1.5">{text}</span></li>)}
          </ul>
        </div>
      )}

      {isRunning && (
        <div role="status" aria-live="polite" className="rounded-xl border border-research-border bg-research-card p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="flex items-center gap-2 text-sm font-medium"><Loader2 className="h-4 w-4 animate-spin text-research-accent" />
              {hosted ? 'Your Rowan calculation is in progress' : engine === 'PubChem' ? 'Retrieving compound data' : 'Preparing your input files'}</p>
            {startedAt.current && <span className="flex items-center gap-1.5 text-xs text-research-muted"><Clock className="h-3.5 w-3.5" /><Elapsed since={startedAt.current} /></span>}
          </div>
          {hosted && <ol className="grid grid-cols-4 gap-2" aria-label="Calculation progress">
            {STAGES.map(([id, label], i) => {
              const done = i < current; const active = i === current;
              return <li key={id} className="min-w-0">
                <span className={`block h-1.5 rounded-full ${done ? 'bg-research-accent' : active ? 'bg-research-accent/50 animate-pulse' : 'bg-research-soft'}`} />
                <span className={`mt-2 flex items-center gap-1 text-xs ${active ? 'font-medium text-research-text' : 'text-research-muted'}`}>{done && <Check className="h-3 w-3 text-research-accent" />}{label}</span>
              </li>;
            })}
          </ol>}
          {hosted && <p className="mt-4 text-xs text-research-muted">Most small molecules take a few minutes. You can leave this page: the job keeps running and appears in Simulation history when it finishes.</p>}
        </div>
      )}

      {children}
    </section>
  );
}
