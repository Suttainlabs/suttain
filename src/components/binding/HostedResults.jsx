import React from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import HostedMetrics from '@/components/binding/HostedMetrics';
import { reportedValue } from '@/components/binding/ReportedValues';
import { NextStepLink } from '@/components/research/ResearchProductNav';
import { handoffUrl } from '@/components/research/researchProducts';

export default function HostedResults({ job }) {
  if (!job) return null;
  const result = job.result || {};
  const completed = job.status === 'completed', failed = job.status === 'failed';
  const firstSmiles = job.inputs?.ligand_smiles || job.inputs?.smiles?.[0];
  return <section aria-label="Calculation results" className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6 space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="research-label mb-1">Result</p><h3 className="!text-lg">{job.job_name || 'Calculation results'}</h3></div>
      {completed && <div><span className="inline-flex items-center gap-1.5 rounded-full border border-research-accent bg-research-soft px-3 py-1 text-xs text-research-accent"><CheckCircle2 className="h-3.5 w-3.5" />Ran on {job.engine}</span><p className="mt-1 text-xs text-research-muted">{result.model || 'Model not reported'}</p></div>}
    </div>
    {result.fallback?.notice && <div role="status" className="flex gap-2 rounded-lg border border-research-border bg-research-soft p-3 text-sm text-research-text"><Info className="h-4 w-4 shrink-0 mt-0.5 text-research-accent" /><p>{result.fallback.notice}</p></div>}
    {failed ? <div role="alert" className="space-y-2"><h3 className="flex items-center gap-2 !text-lg"><AlertTriangle className="h-5 w-5 text-research-accent" />Calculation failed</h3><p className="text-sm text-research-text break-words">{job.error || 'The provider reported a failure.'}</p>{!!result.attempts?.length && <ul className="space-y-1 text-xs text-research-muted">{result.attempts.map((attempt, index) => <li key={index}>{attempt.provider}: {attempt.message}</li>)}</ul>}</div> : completed ? <HostedMetrics job={job} /> : <div role="status" aria-live="polite" className="flex items-center gap-3"><Loader2 className="h-5 w-5 shrink-0 animate-spin text-research-accent" /><div><p className="text-sm font-medium">Running on {job.engine}…</p>{result.model && <p className="text-xs text-research-muted">{result.model}</p>}<p className="text-xs text-research-muted">Checking for results every 15 seconds while this page is open.</p></div></div>}
    {result.limitations && <div><h4 className="research-label mb-1">Limitations</h4><p className="text-xs text-research-muted whitespace-pre-wrap">{reportedValue(result.limitations)}</p></div>}
    {!!result.citations?.length && <div className="border-t border-research-border pt-3"><h4 className="research-label mb-1">Citations</h4>{result.citations.map((citation, index) => <p key={index} className="text-xs text-research-muted break-words">{typeof citation === 'string' ? citation : citation.text || reportedValue(citation)}</p>)}</div>}
    {completed && <div className="border-t border-research-border pt-4"><p className="research-label mb-3">Next step</p><div className="grid gap-2">
      {firstSmiles && <NextStepLink to={handoffUrl.atomistic(firstSmiles)} step="03" title="Calculate it in Atomistic Simulation" text="Run DFT geometry and energies on this ligand, pre-filled." />}
      <NextStepLink to="/DrugDesign" step="01" title="Back to Drug Design" text="Review your shortlist or screen another target." />
    </div></div>}
  </section>;
}