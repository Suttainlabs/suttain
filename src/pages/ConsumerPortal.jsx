import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, ArrowUpRight, Database, Shield, BookOpen, GitBranch, Users, Building2, CornerDownRight } from 'lucide-react';
import SEOHead from '@/components/shared/SEOHead';
import AuthContext from '@/components/auth/AuthContext';
import { CONSUMER_TOOLS, toolById } from '@/components/consumer/consumerTools';
import { sourceById, sourcesFor } from '@/data/dataSources';

const PRINCIPLES = [
  { icon: Shield, title: 'Sourced, then explained', detail: 'Hazard classes, identifiers and properties come from public databases first. Plain-language guidance is written on top of that evidence, never instead of it.' },
  { icon: BookOpen, title: 'Limits stated up front', detail: 'Results support decisions; they are not lab tests, legal compliance certificates or medical advice. Each tool says what it can and cannot tell you.' },
  { icon: GitBranch, title: 'One connected workflow', detail: 'Tools hand off to each other: a scan becomes a formula, an SDS becomes an interaction check, a risky mix becomes a safer alternative.' },
];

function ToolDetail({ tool }) {
  const Icon = tool.icon;
  return (
    <div id="consumer-tool-detail" aria-live="polite" className="mt-8 rounded-xl border border-research-border bg-research-card p-5 sm:p-7 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <div className="flex items-center gap-3 mb-4"><div className="research-icon bg-research-soft"><Icon className="h-5 w-5" strokeWidth={1.5} /></div><div><p className="research-label">Step {tool.step}</p><h3 className="!text-lg">{tool.name}</h3></div></div>
        <p className="text-sm text-research-muted leading-relaxed">{tool.summary}</p>
        <Link to={tool.route} className="research-primary mt-5">Open {tool.name}<ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-5">
        <div><p className="research-label mb-2">You provide</p><ul className="space-y-1.5 text-sm">{tool.inputs.map(i => <li key={i} className="flex gap-2"><span className="text-research-accent">·</span>{i}</li>)}</ul></div>
        <div><p className="research-label mb-2">You get</p><ul className="space-y-1.5 text-sm">{tool.outputs.map(o => <li key={o} className="flex gap-2"><span className="text-research-accent">·</span>{o}</li>)}</ul></div>
      </div>
      <div className="space-y-5">
        <div><p className="research-label mb-2">Connects to</p>
          {tool.handoffs.length ? <ul className="space-y-2">{tool.handoffs.map(h => <li key={h.label}><Link to={toolById(h.to).route} className="flex gap-2 text-sm hover:text-research-accent"><CornerDownRight className="h-4 w-4 mt-0.5 shrink-0 text-research-accent" /><span>{h.label}</span></Link></li>)}</ul>
            : <p className="text-sm text-research-muted">Standalone: use the numbers it returns in your own planning.</p>}
        </div>
        <div><p className="research-label mb-2">Data sources</p>
          {tool.sources.length ? <div className="flex flex-wrap gap-1.5">{tool.sources.map(id => <span key={id} className="font-mono text-[11px] rounded border border-research-border px-1.5 py-0.5 text-research-muted">{sourceById(id)?.name}</span>)}</div>
            : <p className="text-sm text-research-muted">Built-in emission-factor library.</p>}
        </div>
      </div>
    </div>
  );
}

export default function ConsumerPortal() {
  const { user } = useContext(AuthContext);
  const [active, setActive] = useState(0);
  const sources = sourcesFor('consumer');

  return (
    <div className="research-surface consumer-theme min-h-screen">
      <SEOHead title="Consumer & Brand | Suttain" description="Scan products, check chemical interactions, decode safety data sheets, build safer formulas and estimate carbon cost: how Suttain's consumer and brand tools work together." />

      <div className="border-b border-research-border bg-research-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-12 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="research-label">Suttain / Consumer &amp; Brand</span>
          <nav aria-label="Consumer tools" className="flex items-center gap-5 text-sm text-research-muted overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {CONSUMER_TOOLS.map(tool => <Link key={tool.id} to={tool.route} className="shrink-0 hover:text-research-accent">{tool.name}</Link>)}
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
        <section className="grid grid-cols-12 gap-8 border-b border-research-border py-12 sm:py-16 lg:py-20">
          <div className="col-span-12 lg:col-span-8">
            <p className="research-label mb-4">For everyone · For brands</p>
            <h1 className="max-w-2xl mb-5">Five connected tools for safer products.</h1>
            <p className="max-w-xl text-research-muted leading-relaxed">Scan what you buy, check what you mix, decode safety data sheets, build safer formulas and estimate carbon cost. Each tool answers one question and hands its result to the next, so a single scan can end as a cleaner formula.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to={user ? '/Dashboard' : '/BarcodeScanner'} className="research-primary">{user ? 'Open my dashboard' : 'Scan a product'}<ArrowRight className="h-4 w-4" /></Link>
              <a href="#consumer-workflow" className="research-secondary">See how they connect</a>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 flex items-center lg:justify-end">
            <ol className="w-full max-w-xs space-y-2" aria-label="Tools at a glance">
              {CONSUMER_TOOLS.map(tool => { const Icon = tool.icon; return (
                <li key={tool.id}><Link to={tool.route} className="flex items-center gap-3 rounded-lg border border-research-border bg-research-card px-3 py-2.5 hover:border-research-accent transition-colors"><Icon className="h-4 w-4 text-research-accent shrink-0" strokeWidth={1.5} /><span className="text-sm font-medium flex-1">{tool.verb}</span><span className="text-xs text-research-muted truncate">{tool.name}</span></Link></li>
              ); })}
            </ol>
          </div>
        </section>

        <section id="consumer-workflow" aria-labelledby="consumer-workflow-title" className="scroll-mt-20 border-b border-research-border py-12 sm:py-16">
          <div className="mb-8 max-w-2xl">
            <p className="research-label mb-3">Consumer &amp; Brand / How the tools connect</p>
            <h2 id="consumer-workflow-title" className="mb-3">From a question about a product to a safer formula</h2>
            <p className="text-research-muted">Each step answers one question. Select a step to see what you provide, what you get back, which databases it uses and where its result can go next.</p>
          </div>
          <ol aria-label="Consumer workflow" className="grid grid-cols-1 gap-7 lg:grid-cols-5">
            {CONSUMER_TOOLS.map((tool, i) => { const Icon = tool.icon; return (
              <li key={tool.id} className="relative min-w-0">
                <button type="button" aria-pressed={active === i} aria-controls="consumer-tool-detail" onClick={() => setActive(i)} className={`h-full w-full rounded-xl border p-4 text-left transition-colors ${active === i ? 'border-research-accent bg-research-soft' : 'border-research-border bg-research-card hover:border-research-accent'}`}>
                  <span className="mb-4 flex items-center justify-between"><Icon className="h-5 w-5 text-research-accent" strokeWidth={1.5} aria-hidden="true" /><span className="research-label">{tool.step}</span></span>
                  <span className="block text-base font-medium text-research-text">{tool.verb}</span>
                  <span className="block text-sm text-research-muted">{tool.name}</span>
                  <span className="mt-3 block text-sm text-research-text leading-relaxed">“{tool.question}”</span>
                  <span className="mt-4 block border-t border-research-border pt-3 text-xs text-research-muted"><span className="block research-label mb-1">Hands off to</span>{tool.handoffs.length ? [...new Set(tool.handoffs.map(h => toolById(h.to).name))].join(', ') : '—'}</span>
                </button>
                {i < CONSUMER_TOOLS.length - 1 && <span aria-hidden="true" className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 text-research-muted lg:-right-6 lg:bottom-auto lg:left-auto lg:top-8 lg:translate-x-0"><ArrowDown className="h-5 w-5 lg:hidden" strokeWidth={1.5} /><ArrowRight className="hidden h-5 w-5 lg:block" strokeWidth={1.5} /></span>}
              </li>
            ); })}
          </ol>
          <ToolDetail tool={CONSUMER_TOOLS[active]} />
        </section>

        <section className="py-12 sm:py-16 border-b border-research-border" aria-labelledby="consumer-tools-title">
          <p className="research-label mb-3">Consumer &amp; Brand / Tools</p>
          <h2 id="consumer-tools-title" className="mb-8">What each tool does</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CONSUMER_TOOLS.map(tool => { const Icon = tool.icon; return (
              <Link key={tool.id} to={tool.route} className="group grid grid-cols-[auto_minmax(0,1fr)] gap-5 rounded-xl border border-research-border bg-research-card p-6 hover:border-research-accent transition-colors">
                <div className="research-icon"><Icon className="h-5 w-5" strokeWidth={1.5} /></div>
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3"><h3 className="!text-lg">{tool.name}</h3><span className="research-label">{tool.step}</span></div>
                  <p className="text-sm text-research-muted mt-2">{tool.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">{tool.outputs.slice(0, 3).map(o => <span key={o} className="text-[11px] rounded-full border border-research-border px-2 py-0.5 text-research-muted">{o}</span>)}</div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-research-accent">Open {tool.name}<ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ); })}
            <Link to="/SustainabilityImpact" className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 rounded-xl border border-dashed border-research-border p-6 hover:border-research-accent transition-colors">
              <div className="research-icon"><Database className="h-5 w-5" strokeWidth={1.5} /></div>
              <div><h3 className="!text-lg">Sustainability Impact</h3><p className="text-sm text-research-muted mt-2">Your running record across all five tools: products scanned, formulas built and milestones reached.</p><span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-research-accent">View your impact<ArrowUpRight className="h-4 w-4" /></span></div>
            </Link>
          </div>
        </section>

        <section className="py-10 sm:py-12 border-b border-research-border" aria-labelledby="consumer-sources">
          <h2 id="consumer-sources" className="flex items-center gap-2 mb-2 !text-sm"><Database className="w-4 h-4 text-research-accent" />Databases behind the answers</h2>
          <p className="text-sm text-research-muted mb-6 max-w-2xl">Live integrations the consumer tools query. Figures are the providers' published totals.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sources.map(source => (
              <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-research-border bg-research-card p-4 hover:border-research-accent transition-colors">
                <div className="flex items-baseline justify-between gap-2"><h3 className="!text-sm">{source.name}</h3>{source.count && <span className="font-mono text-xs text-research-accent">{source.count}</span>}</div>
                <p className="research-label mt-1">{source.count ? source.unit : source.org}</p>
                <p className="text-xs text-research-muted mt-2">{source.detail}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-12 gap-8 py-12 sm:py-14" aria-label="How results are produced">
          {PRINCIPLES.map(({ icon: Icon, title, detail }, i) => (
            <div key={title} className="col-span-12 md:col-span-4">
              <div className="flex items-center justify-between mb-5"><Icon className="h-5 w-5 text-research-accent" strokeWidth={1.5} /><span className="research-label">0{i + 1}</span></div>
              <h3 className="mb-3">{title}</h3><p className="text-sm text-research-muted leading-relaxed">{detail}</p>
            </div>
          ))}
        </section>

        <section className="grid md:grid-cols-2 gap-5 pb-4" aria-label="Who it is for">
          <div className="rounded-xl border border-research-border bg-research-card p-6"><Users className="h-5 w-5 text-research-accent mb-4" strokeWidth={1.5} /><h3 className="mb-2">For individuals</h3><p className="text-sm text-research-muted">Check products before you buy, avoid dangerous combinations at home and make simple, safer DIY products.</p></div>
          <div className="rounded-xl border border-research-border bg-research-card p-6"><Building2 className="h-5 w-5 text-research-accent mb-4" strokeWidth={1.5} /><h3 className="mb-2">For brands</h3><p className="text-sm text-research-muted">Screen ingredients, decode supplier SDSs, build formulas with INCI names and batch scaling, and estimate carbon exposure.</p></div>
        </section>

        <footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-8 mt-8 border-t border-research-border text-sm text-research-muted">
          <p>Looking for molecular simulation or drug design? Those live in the Research workspace.</p>
          <Link to="/ResearchPortal" className="research-secondary">Go to Research<ArrowRight className="h-4 w-4" /></Link>
        </footer>
      </div>
    </div>
  );
}
