import React from 'react';
import { Info } from 'lucide-react';

export default function ResearchWorkflowDetail({ step, active }) {
  const details = [
    { title: 'What happens', text: step.action },
    { title: 'Stage output', text: step.output },
    { title: 'Your role', text: step.human },
    { title: 'Evidence trail', text: step.provenance },
  ];
  return (
    <div id="research-workflow-detail" role="region" aria-label={`Step ${active + 1}: ${step.title}`} aria-live="polite" aria-atomic="true" className="mt-8 rounded-xl border border-research-border bg-research-card p-5 sm:p-7">
      <p className="research-label mb-2">Step 0{active + 1} / {step.mode}</p>
      <h3 className="mb-5">{step.title}</h3>
      <dl className="grid gap-6 sm:grid-cols-2">
        {details.map(detail => <div key={detail.title}><dt className="text-sm font-medium mb-2">{detail.title}</dt><dd className="text-sm text-research-muted leading-relaxed">{detail.text}</dd></div>)}
      </dl>
      <div className="mt-6 flex items-start gap-3 border-t border-research-border pt-5 text-sm text-research-muted">
        <Info className="mt-1 h-4 w-4 shrink-0 text-research-accent" aria-hidden="true" />
        <p><span className="font-medium text-research-text">Check before proceeding. </span>{step.uncertainty}</p>
      </div>
    </div>
  );
}