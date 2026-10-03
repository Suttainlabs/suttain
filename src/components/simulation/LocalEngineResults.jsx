import React from 'react';
import {Button} from '@/components/ui/button';
import SimulationInputFiles from '@/components/computational/SimulationInputFiles';
import EngineCitations from '@/components/simulation/EngineCitations';
import ForcefieldAttachment from '@/components/simulation/ForcefieldAttachment';
export default function LocalEngineResults({result,onReset}) {
  return <div className="space-y-5 mb-8">
    <section className="rounded-xl border border-research-border bg-research-soft p-5"><p className="research-label">Local execution pending · {result.engine}</p><h2 className="mt-2">Input package prepared</h2><p className="text-sm text-research-muted mt-2">{result.summary}</p><p className="text-sm text-research-muted">{result.method} · {result.task}. No computation was performed by Suttain.</p></section>
    {result.fallback && <p role="status" className="rounded-lg border border-research-border bg-research-card p-4 text-sm">{result.fallback.from} → {result.fallback.to}: {result.fallback.notice}<br/>{result.fallback.reason}</p>}
    <SimulationInputFiles result={result} simTypeLabel={result.simType?.label} linkedJobId={result.job_id}/>
    <ForcefieldAttachment env={result.environmental_params}/>
    <EngineCitations citations={result.citations}/><Button variant="outline" onClick={onReset}>New simulation</Button>
  </div>;
}