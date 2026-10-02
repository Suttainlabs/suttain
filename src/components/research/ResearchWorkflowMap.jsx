import React, { useState } from 'react';
import { Zap, Workflow, UserCheck, FileCheck2, ArrowRight, ArrowDown } from 'lucide-react';
import { agentWorkflowSteps } from '@/components/landing/agentWorkflowSteps';
import ResearchWorkflowDetail from '@/components/research/ResearchWorkflowDetail';

const stages = [
  { label: 'Research trigger', icon: Zap, summary: 'You choose the question, inputs and conditions.' },
  { label: 'Workflow preparation', icon: Workflow, summary: 'The agent assembles analysis and engine-specific files.' },
  { label: 'Researcher review', icon: UserCheck, summary: 'Inspect sources and assumptions; accept, revise or stop.' },
  { label: 'Final output', icon: FileCheck2, summary: 'Trace the setup, save the record and export files.' },
];

export default function ResearchWorkflowMap() {
  const [active, setActive] = useState(0);
  return (
    <section id="research-workflow" aria-labelledby="research-workflow-title" className="scroll-mt-20 border-b border-research-border py-12 sm:py-16">
      <div className="mb-8 max-w-2xl">
        <p className="research-label mb-3">Autonomous research workflows / Step by step</p>
        <h2 id="research-workflow-title" className="mb-3">From research trigger to final output</h2>
        <p className="text-research-muted">Follow how the agent prepares your research, where you make decisions and what each stage produces. Select a stage to explore it.</p>
      </div>
      <ol aria-label="Research processing stages" className="grid grid-cols-1 gap-7 md:grid-cols-4">
        {stages.map(({ label, icon: Icon, summary }, i) => (
          <li key={label} className="relative min-w-0">
            <button type="button" aria-pressed={active === i} aria-controls="research-workflow-detail" onClick={() => setActive(i)} className={`h-full w-full rounded-xl border p-5 text-left transition-colors ${active === i ? 'border-research-accent bg-research-soft' : 'border-research-border bg-research-card hover:border-research-accent'}`}>
              <span className="mb-4 flex items-center justify-between"><Icon className="h-5 w-5 text-research-accent" strokeWidth={1.5} aria-hidden="true" /><span className="research-label">0{i + 1}</span></span>
              <span className="block text-base font-medium text-research-text">{label}</span>
              <span className="mt-2 block text-sm text-research-muted leading-relaxed">{summary}</span>
              <span className="mt-4 block font-mono text-xs text-research-accent">{i === 1 ? 'Automated preparation' : i === 2 ? 'Human decision gate' : i === 0 ? 'You initiate' : 'Reviewable record'}</span>
            </button>
            {i < stages.length - 1 && <span aria-hidden="true" className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 text-research-muted md:-right-6 md:bottom-auto md:left-auto md:top-8 md:translate-x-0"><ArrowDown className="h-5 w-5 md:hidden" strokeWidth={1.5} /><ArrowRight className="hidden h-5 w-5 md:block" strokeWidth={1.5} /></span>}
          </li>
        ))}
      </ol>
      <ResearchWorkflowDetail step={agentWorkflowSteps[active]} active={active} />
      <p className="mt-5 text-sm text-research-muted">Workflow guide, not live execution status. Preparing files does not run a calculation: engine execution requires separately configured compute, and final findings require researcher validation.</p>
    </section>
  );
}