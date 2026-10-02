import React, { useState } from 'react';
import { ArrowRight, SlidersHorizontal, FileCode2, UserCheck, FileSearch } from 'lucide-react';
import { agentWorkflowSteps } from '@/components/landing/agentWorkflowSteps';
import { consumerWorkflowSteps } from '@/components/landing/consumerWorkflowSteps';
import ConsumerWorkflowTools from '@/components/landing/ConsumerWorkflowTools';

const icons = [SlidersHorizontal, FileCode2, UserCheck, FileSearch];
export default function AgentWalkthrough() {
  const [track, setTrack] = useState('consumer');
  const [active, setActive] = useState(0);
  const steps = track === 'consumer' ? consumerWorkflowSteps : agentWorkflowSteps;
  const step = steps[active];
  return (
    <section id="agent-walkthrough" className="quiet-walkthrough quiet-section scroll-mt-20" aria-labelledby="walkthrough-title">
      <div className="quiet-container">
        <div className="quiet-section-heading"><p className="quiet-eyebrow">Walkthrough</p><h2 id="walkthrough-title">Different users. Different journeys.</h2></div>
        <div className="quiet-track-toggle" role="group" aria-label="Choose a walkthrough track">
          {[{ id: 'consumer', label: 'Consumer', audience: 'Product safety, formulation and impact' }, { id: 'research', label: 'Research', audience: 'Computational scientists and R&D teams' }].map(item => <button key={item.id} type="button" aria-label={`${item.label}: ${item.audience}`} aria-pressed={track === item.id} aria-controls="workflow-detail" onClick={() => { setTrack(item.id); setActive(0); }} className={`quiet-track ${track === item.id ? 'is-selected' : ''}`}>{item.label}</button>)}
        </div>
        <div className="quiet-steps grid grid-cols-2 md:grid-cols-4" aria-label="Workflow steps">
          {steps.map((item, i) => (
            <button key={item.title} type="button" aria-pressed={active === i} aria-controls="workflow-detail" onClick={() => setActive(i)} className={`quiet-step ${active === i ? 'is-selected' : ''}`}>
              <span className="quiet-step-number">{i + 1}</span>{i < steps.length - 1 && <ArrowRight className="quiet-step-arrow" strokeWidth={1} />}
              <span className="quiet-step-title">{item.title}</span><span className="quiet-step-summary">{item.summary}</span>
            </button>
          ))}
        </div>
        <div id="workflow-detail" aria-live="polite" aria-atomic="true" className="quiet-step-detail">
          <div className="grid gap-8 lg:grid-cols-2">
            <div><p className="research-label mb-3">Step 0{active + 1} / {step.mode}</p><h3 className="mb-3">{step.title}</h3><p className="text-research-muted mb-6">{step.action}</p>{track === 'consumer' && active === 0 && <ConsumerWorkflowTools />}<div className="border-l-2 border-research-accent pl-4"><p className="text-sm font-medium mb-2">Your decision</p><p className="text-sm text-research-muted">{step.human}</p></div></div>
            <dl className="space-y-5"><div><dt className="text-sm font-medium mb-1">Sources and provenance</dt><dd className="text-sm text-research-muted">{step.provenance}</dd></div><div><dt className="text-sm font-medium mb-1">When it is uncertain or wrong</dt><dd className="text-sm text-research-muted">{step.uncertainty}</dd></div><div className="rounded-lg bg-research-soft p-4"><dt className="research-label mb-2">Output</dt><dd className="text-sm">{step.output}</dd></div></dl>
          </div>
        </div>
        <p className="quiet-note">{track === 'consumer' ? 'Five tools, one shared journey. Each tool has its own inputs and outputs.' : 'Workflow preparation, not engine execution. Review inputs before use.'}</p>
      </div>
    </section>
  );
}