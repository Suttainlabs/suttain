import React, { useState } from 'react';
import { Zap, Database, Workflow, UserCheck, FileCheck2, ArrowRight, ArrowDown } from 'lucide-react';
import { researchWorkflowStages } from '@/components/research/researchWorkflowStages';
import ResearchWorkflowDetail from '@/components/research/ResearchWorkflowDetail';

const stageIcons = { trigger: Zap, sources: Database, prepare: Workflow, review: UserCheck, output: FileCheck2 };

export default function ResearchWorkflowMap() {
  const [active, setActive] = useState(0);
  return (
    <section id="research-workflow" aria-labelledby="research-workflow-title" className="scroll-mt-20 border-b border-research-border py-12 sm:py-16">
      <div className="mb-8 max-w-2xl">
        <p className="research-label mb-3">Atomistic Simulation and Drug Design / Step by step</p>
        <h2 id="research-workflow-title" className="mb-3">From a molecular question to a reviewed next step</h2>
        <p className="text-research-muted">Choose Atomistic Simulation for molecular calculations or Drug Design for target and candidate exploration. Define inputs, review preparation, and check limitations. Select a step to see the evidence and researcher decisions involved.</p>
      </div>
      <ol aria-label="Research processing stages" className="grid grid-cols-1 gap-7 lg:grid-cols-5">
        {researchWorkflowStages.map(({ title, icon, summary, artifact, mode }, i) => {
          const Icon = stageIcons[icon];
          return (
          <li key={title} className="relative min-w-0">
            <button type="button" aria-pressed={active === i} aria-controls="research-workflow-detail" onClick={() => setActive(i)} className={`h-full w-full rounded-xl border p-4 text-left transition-colors ${active === i ? 'border-research-accent bg-research-soft' : 'border-research-border bg-research-card hover:border-research-accent'}`}>
              <span className="mb-4 flex items-center justify-between"><Icon className="h-5 w-5 text-research-accent" strokeWidth={1.5} aria-hidden="true" /><span className="research-label">0{i + 1}</span></span>
              <span className="block text-base font-medium text-research-text">{title}</span>
              <span className="mt-2 block text-sm text-research-muted leading-relaxed">{summary}</span>
              <span className="mt-4 block font-mono text-xs text-research-accent">{i === 2 ? 'Agent-led' : i === 4 ? 'Reviewable record' : 'Researcher-led'}</span>
              <span className="mt-4 block border-t border-research-border pt-3 text-xs text-research-muted"><span className="block research-label mb-1">Produces</span>{artifact}</span>
              {i === 3 && <span className="mt-3 block text-xs text-research-accent">Revise inputs → repeat preparation</span>}
            </button>
            {i < researchWorkflowStages.length - 1 && <span aria-hidden="true" className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 text-research-muted lg:-right-6 lg:bottom-auto lg:left-auto lg:top-8 lg:translate-x-0"><ArrowDown className="h-5 w-5 lg:hidden" strokeWidth={1.5} /><ArrowRight className="hidden h-5 w-5 lg:block" strokeWidth={1.5} /></span>}
          </li>
        ); })}
      </ol>
      <ResearchWorkflowDetail step={researchWorkflowStages[active]} active={active} />
      <p className="mt-5 text-sm text-research-muted">Workflow guide, not live execution status. Preparing files does not run a calculation: engine execution requires separately configured compute, and final findings require researcher validation.</p>
    </section>
  );
}