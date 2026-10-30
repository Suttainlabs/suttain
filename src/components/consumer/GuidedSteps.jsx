import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Numbered step navigation for results, matching Atomistic Simulation's guided results:
// steps on the left (a scrollable row on phones), the active step's content on the right, Prev/Next below.
export default function GuidedSteps({ steps, value, onChange, children, label = 'Result steps', className = '' }) {
  const index = Math.max(0, steps.findIndex(step => step.value === value));
  const root = useRef(null);
  const first = useRef(true);
  // When the step changes, bring the start of the step back into view if it scrolled off the top (common on phones).
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = root.current; if (!el) return;
    if (el.getBoundingClientRect().top < 64) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [value]);
  const go = i => {
    const next = steps[i];
    if (!next) return;
    onChange(next.value);
  };
  return (
    <div ref={root} className={`guided-steps scroll-mt-32 ${className}`}>
      <nav aria-label={label} className="guided-steps-nav">
        {steps.map((step, i) => (
          <button key={step.value} type="button" onClick={() => onChange(step.value)} aria-current={value === step.value ? 'step' : undefined} className="guided-steps-item">
            <span className="font-mono text-xs guided-steps-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="truncate">{step.label}</span>
          </button>
        ))}
      </nav>
      <div className="guided-steps-body">
        {steps[index]?.intro && <p className="guided-steps-intro">{steps[index].intro}</p>}
        {children}
        <div className="guided-steps-pager">
          <button type="button" className="guided-steps-prev" disabled={index === 0} onClick={() => go(index - 1)}><ChevronLeft size={16} />{index > 0 ? steps[index - 1].label : 'Prev'}</button>
          <button type="button" className="guided-steps-next" disabled={index === steps.length - 1} onClick={() => go(index + 1)}>{index < steps.length - 1 ? steps[index + 1].label : 'Next'}<ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
