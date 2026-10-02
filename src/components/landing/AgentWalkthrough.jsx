import React, { useState } from 'react';
import { ArrowRight, SlidersHorizontal, FileCode2, UserCheck, FileSearch } from 'lucide-react';
import { agentWorkflowSteps } from '@/components/landing/agentWorkflowSteps';
import { consumerWorkflowSteps } from '@/components/landing/consumerWorkflowSteps';

const icons = [SlidersHorizontal, FileCode2, UserCheck, FileSearch];
export default function AgentWalkthrough() {
  const [track, setTrack] = useState('consumer');
  const [active, setActive] = useState(0);
  const steps = track === 'consumer' ? consumerWorkflowSteps : agentWorkflowSteps;
  const step = steps[active];
  return (
    <section id="agent-walkthrough" className={`${track === 'consumer' ? 'home-consumer' : 'home-research'} scroll-mt-20 border-y border-research-border bg-research-page px-4 py-14 sm:px-6 sm:py-20`} aria-labelledby="walkthrough-title">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2 mb-10">
          <div><p className="research-label mb-3">From trigger to output / Two separate tracks</p><h2 id="walkthrough-title">Different users. Different journeys.</h2></div>
          <p className="text-research-muted md:self-end">Choose a track to see what runs automatically, what you review and what the result means for that audience.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 mb-6" role="group" aria-label="Choose a walkthrough track">
          {[{ id: 'consumer', label: 'Consumer and brands', audience: 'Product safety, formulation and impact' }, { id: 'research', label: 'Research workflows', audience: 'Computational scientists and R&D teams' }].map(item => <button key={item.id} type="button" aria-pressed={track === item.id} aria-controls="workflow-detail" onClick={() => { setTrack(item.id); setActive(0); }} className={`${item.id === 'consumer' ? 'home-consumer' : 'home-research'} rounded-lg border p-4 text-left transition-colors ${track === item.id ? 'border-research-accent bg-research-soft' : 'border-research-border bg-research-card'}`}><span className="block font-medium text-research-accent">{item.label}</span><span className="block text-sm text-research-muted">{item.audience}</span></button>)}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Workflow steps">
          {steps.map((item, i) => { const Icon = icons[i]; return (
            <button key={item.title} type="button" aria-pressed={active === i} aria-controls="workflow-detail" onClick={() => setActive(i)} className={`min-w-0 rounded-xl border p-5 text-left transition-colors ${active === i ? 'border-research-accent bg-research-card' : 'border-research-border bg-research-page hover:bg-research-card'}`}>
              <div className="mb-5 flex items-center justify-between"><span className="research-label">0{i + 1}</span><Icon className="h-5 w-5 text-research-accent" strokeWidth={1.5} /></div>
              <span className="block text-lg font-medium mb-2">{item.title}</span><span className="block text-sm text-research-muted">{item.summary}</span>
              <span className="mt-5 flex items-center justify-between text-xs font-mono text-research-accent">{item.mode}<ArrowRight className="h-4 w-4 shrink-0 ml-2" /></span>
            </button>
          ); })}
        </div>
        <div id="workflow-detail" aria-live="polite" aria-atomic="true" className="mt-5 rounded-xl border border-research-border bg-research-card p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div><p className="research-label mb-3">Step 0{active + 1} / {step.mode}</p><h3 className="mb-3">{step.title}</h3><p className="text-research-muted mb-6">{step.action}</p><div className="border-l-2 border-research-accent pl-4"><p className="text-sm font-medium mb-2">Your decision</p><p className="text-sm text-research-muted">{step.human}</p></div></div>
            <dl className="space-y-5"><div><dt className="text-sm font-medium mb-1">Sources and provenance</dt><dd className="text-sm text-research-muted">{step.provenance}</dd></div><div><dt className="text-sm font-medium mb-1">When it is uncertain or wrong</dt><dd className="text-sm text-research-muted">{step.uncertainty}</dd></div><div className="rounded-lg bg-research-soft p-4"><dt className="research-label mb-2">Output</dt><dd className="text-sm">{step.output}</dd></div></dl>
          </div>
        </div>
        <p className="mt-5 text-sm text-research-muted">{track === 'consumer' ? 'Consumer track: a product-scanning example. Formulation and sustainability tools are separate entry points for makers and brands.' : 'Research track: workflow preparation in the computational studio. Generated inputs require review and configured compute before engine execution.'}</p>
      </div>
    </section>
  );
}