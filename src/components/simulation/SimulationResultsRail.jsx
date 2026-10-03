import React from 'react';
import { FileText } from 'lucide-react';
export default function SimulationResultsRail({children,hasOutput,isRunning,engine}) {
  return <section aria-label="Workflow results" className="min-w-0 space-y-5">
    <div className="flex items-center justify-between gap-3"><h2 className="!text-lg">Results & activity</h2><span className="research-label">{engine}</span></div>
    {!hasOutput && !isRunning && <div className="rounded-xl border border-dashed border-research-border bg-research-card px-6 py-16 text-center"><FileText className="h-7 w-7 text-research-muted mx-auto mb-4"/><h3>Your results will appear here</h3><p className="text-sm text-research-muted mt-2 max-w-sm mx-auto">Choose an engine, add your input, then run or prepare your workflow. Saved runs are available below.</p></div>}
    {isRunning && <div role="status" className="rounded-xl border border-research-border bg-research-soft p-5 text-sm">{engine==='Rowan'?'Submitting or tracking your Rowan calculation…':engine==='PubChem'?'Retrieving compound data…':'Preparing your local input files…'}</div>}
    {children}
  </section>;
}