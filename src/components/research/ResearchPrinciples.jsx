import React from 'react';
import { Shield, BookOpen, GitBranch } from 'lucide-react';

const PRINCIPLES = [
  { icon: Shield, title: 'No black box outputs', detail: 'Review source references and confidence information alongside your results. Keep the method in view, not just the answer.' },
  { icon: BookOpen, title: 'Citation-ready exports', detail: 'Take your findings into reports with source citations and structured exports. Keep your research useful beyond the workspace.' },
  { icon: GitBranch, title: 'Simulation to formula pipeline', detail: 'Bring computational findings into formulation decisions. Continue your work in a dedicated formula workspace with safety and compliance checks.' },
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