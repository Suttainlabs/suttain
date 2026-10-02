import React, { useState } from 'react';
import { ArrowRight, SlidersHorizontal, FileCode2, UserCheck, FileSearch } from 'lucide-react';
import { agentWorkflowSteps } from '@/components/landing/agentWorkflowSteps';

const icons = [SlidersHorizontal, FileCode2, UserCheck, FileSearch];
export default function AgentWalkthrough() {
  const [active, setActive] = useState(0);
  const step = agentWorkflowSteps[active];
  return (
    <section id="agent-walkthrough" className="scroll-mt-20 border-y border-research-border bg-research-page px-4 py-14 sm:px-6 sm:py-20" aria-labelledby="walkthrough-title">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2 mb-10">
          <div><p className="research-label mb-3">01 / From trigger to output</p><h2 id="walkthrough-title">An agent for the workflow.<br />A researcher at the controls.</h2></div>
          <p className="text-research-muted md:self-end">See what Suttain prepares, what you decide and what stays in the record. Select a step to explore the handoff.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Workflow steps">
          {agentWorkflowSteps.map((item, i) => { const Icon = icons[i]; return (
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
        <p className="mt-5 text-sm text-research-muted">Inside Suttain’s computational studio, for independent scientists, computational chemists and enterprise R&amp;D teams. Generated files can be reviewed for use in your existing engine or HPC environment.</p>
      </div>
    </section>
  );
}