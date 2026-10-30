import React from 'react';
import { Shield, BookOpen, GitBranch } from 'lucide-react';

const PRINCIPLES = [
  { icon: Shield, title: 'Methods and limitations in view', detail: 'Every result names the engine or database it came from. Screening ranks, prepared input files and engine-computed predictions are labelled differently, so you always know what was actually calculated.' },
  { icon: BookOpen, title: 'Research context you can retain', detail: 'Keep available inputs, references, and exports with your work. Review original sources and validate findings before sharing or publishing.' },
  { icon: GitBranch, title: 'Three connected tools', detail: 'Drug Design finds candidates, Binding & ADME predicts how they bind and behave, and Atomistic Simulation calculates them in detail. Results carry over from one tool to the next.' },
];
export default function ResearchPrinciples() {
  return (
    <section className="grid grid-cols-12 gap-8 py-12 sm:py-14" aria-label="Research principles">
      {PRINCIPLES.map(({ icon: Icon, title, detail }, i) => (
        <div key={title} className="col-span-12 md:col-span-4">
          <div className="flex items-center justify-between mb-5"><Icon className="h-5 w-5 text-research-accent" strokeWidth={1.5} /><span className="research-label">0{i + 1}</span></div>
          <h3 className="mb-3">{title}</h3><p className="text-sm text-research-muted leading-relaxed">{detail}</p>
        </div>
      ))}
    </section>
  );
}