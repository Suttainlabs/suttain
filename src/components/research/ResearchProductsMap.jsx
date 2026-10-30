import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, ArrowUpRight, CornerDownLeft } from 'lucide-react';
import { RESEARCH_PRODUCTS, productById } from '@/components/research/researchProducts';

function List({ label, items }) {
  return <div><p className="research-label mb-2">{label}</p><ul className="space-y-1.5 text-sm text-research-text">{items.map(i => <li key={i} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-research-accent" />{i}</li>)}</ul></div>;
}

export default function ResearchProductsMap() {
  const [active, setActive] = useState('drug');
  const p = productById(active);
  const Icon = p.icon;
  return (
    <section id="research-tools" aria-labelledby="research-tools-title" className="scroll-mt-28 border-b border-research-border py-12 sm:py-16">
      <div className="mb-8 max-w-2xl">
        <p className="research-label mb-3">Three tools / One pipeline</p>
        <h2 id="research-tools-title" className="mb-3">From a target to a calculated molecule</h2>
        <p className="text-research-muted">Each tool answers one question and passes its result to the next. Start anywhere: a target, a list of molecules, or a single structure. Select a tool to see what goes in, what comes out, and where it leads.</p>
      </div>

      <ol aria-label="Research pipeline" className="grid grid-cols-1 gap-7 lg:grid-cols-3">
        {RESEARCH_PRODUCTS.map((tool, i) => {
          const ToolIcon = tool.icon;
          const on = active === tool.id;
          return (
            <li key={tool.id} className="relative min-w-0">
              <button type="button" aria-pressed={on} aria-controls="research-tool-detail" onClick={() => setActive(tool.id)}
                className={`h-full w-full rounded-xl border p-5 text-left transition-colors ${on ? 'border-research-accent bg-research-soft' : 'border-research-border bg-research-card hover:border-research-accent'}`}>
                <span className="mb-4 flex items-center justify-between"><ToolIcon className="h-5 w-5 text-research-accent" strokeWidth={1.5} aria-hidden="true" /><span className="research-label">{tool.step} · {tool.verb}</span></span>
                <span className="block text-lg font-medium text-research-text">{tool.name}</span>
                <span className="mt-2 block text-sm text-research-muted leading-relaxed">{tool.question}</span>
                <span className="mt-4 flex flex-wrap gap-1.5">{tool.engines.slice(0, 4).map(e => <span key={e} className="font-mono text-[11px] rounded border border-research-border px-2 py-0.5 text-research-muted">{e}</span>)}</span>
              </button>
              {i < RESEARCH_PRODUCTS.length - 1 && <span aria-hidden="true" className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 text-research-muted lg:-right-6 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0"><ArrowDown className="h-5 w-5 lg:hidden" strokeWidth={1.5} /><ArrowRight className="hidden h-5 w-5 lg:block" strokeWidth={1.5} /></span>}
            </li>
          );
        })}
      </ol>
      <p className="mt-4 flex items-center gap-2 text-xs text-research-muted"><CornerDownLeft className="h-3.5 w-3.5" />Atomistic Simulation can also send a molecule back to Binding &amp; ADME.</p>

      <div id="research-tool-detail" aria-live="polite" className="mt-8 rounded-xl border border-research-border bg-research-card p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:justify-between border-b border-research-border pb-5 mb-5">
          <div className="flex items-start gap-4 min-w-0">
            <div className="research-icon bg-research-soft shrink-0"><Icon className="h-5 w-5" strokeWidth={1.5} /></div>
            <div className="min-w-0"><p className="research-label mb-1">Step {p.step} · {p.verb}</p><h3 className="!text-xl mb-2">{p.name}</h3><p className="text-sm text-research-muted max-w-2xl">{p.summary}</p></div>
          </div>
          <Link to={p.route} className="research-primary shrink-0 inline-flex items-center gap-2 self-start">Open {p.name}<ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <List label="You provide" items={p.inputs} />
          <List label="You get" items={p.outputs} />
          <div>
            <p className="research-label mb-2">Connects to</p>
            <ul className="space-y-2">{p.handoffs.map(h => { const t = productById(h.to); return <li key={h.to}><button type="button" onClick={() => setActive(h.to)} className="text-left text-sm"><span className="font-medium text-research-accent">{t.name} →</span><span className="block text-xs text-research-muted">{h.why}</span></button></li>; })}</ul>
            <p className="research-label mt-5 mb-1">How to read results</p>
            <p className="text-xs text-research-muted leading-relaxed">{p.evidence}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
