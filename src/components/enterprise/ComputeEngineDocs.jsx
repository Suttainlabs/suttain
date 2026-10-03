import React from 'react';
import useEngineRegistry from '@/components/simulation/useEngineRegistry';
import EngineApiCard from '@/components/enterprise/EngineApiCard';
export default function ComputeEngineDocs() {
  const {data,isLoading,error}=useEngineRegistry();
  return <section id="compute-engines" className="research-surface rounded-xl border border-research-border p-5 sm:p-8 mb-14 scroll-mt-20"><p className="research-label mb-2">Compute library / live implementation reference</p><h2>Engine workflows and API reference</h2><p className="text-sm text-research-muted mt-3 mb-6">This index comes directly from the same registry used to prepare inputs. Only listed methods/tasks are implemented; unsupported workflows are rejected rather than silently replaced. Rowan is the default. Credit fallback prepares compatible local files without pretending another calculation completed.</p>
    {isLoading && <p role="status">Loading engine reference…</p>}{error && <p role="alert" className="text-destructive">The engine reference could not load. Refresh to retry.</p>}
    <div className="space-y-3">{data?.engines?.map(engine=><EngineApiCard key={engine.id} engine={engine}/>)}</div>
    <p className="text-sm text-research-muted mt-6">Simmate is an orchestration framework for your own infrastructure, not a configured Suttain compute endpoint. <a className="underline text-research-accent" href="https://simmate.org/" target="_blank" rel="noopener noreferrer">Simmate documentation</a>. Independent hosted xtb/RDKit execution and advanced workflow/output-parser coverage require a subsequent compute-service setup.</p>
  </section>;
}