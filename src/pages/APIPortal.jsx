import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, FileCode2, Database, ArrowRight, ExternalLink, Mail } from 'lucide-react';
import SEOHead from '@/components/shared/SEOHead';
import useEngineRegistry from '@/components/simulation/useEngineRegistry';
import EngineReference from '@/components/api/EngineReference';
import { DATA_SOURCES } from '@/data/dataSources';

const SECTIONS = [
  ['architecture', 'Architecture'],
  ['engines', 'Engine reference'],
  ['data', 'Data services'],
  ['citations', 'Citations'],
  ['access', 'Access'],
];

function Metric({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 min-w-0">
      <p className="font-mono text-2xl sm:text-3xl text-white leading-none">{value}</p>
      <p className="mt-2 text-xs text-white/60">{label}</p>
    </div>
  );
}

export default function APIPortal() {
  const { data, isLoading, error } = useEngineRegistry();
  const engines = data?.engines || [];
  const hosted = engines.filter(e => e.deployment === 'hosted');
  const local = engines.filter(e => e.deployment === 'input_file');
  const lanes = [
    { icon: Cpu, title: 'Hosted compute', body: 'Calculations that run on a connected provider and return computed results with provider attribution.', items: hosted.filter(e => !/pubchem/i.test(e.id)).map(e => e.label) },
    { icon: FileCode2, title: 'Input preparation', body: 'Validated input files for engines you run on your own computer or cluster. Preparing files is not a calculation.', items: local.map(e => e.label) },
    { icon: Database, title: 'Source lookups', body: 'Live queries to public scientific databases, returned with identifiers and retrieval time.', items: DATA_SOURCES.filter(s => s.integrated).slice(0, 8).map(s => s.name) },
  ];

  return (
    <div className="research-surface min-h-screen">
      <SEOHead title="API & engine reference | Suttain" description="Engines, methods and scientific data services behind Suttain's Atomistic Simulation, Drug Design and consumer tools, with citations." />

      <section className="bg-[#0E1A19] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="font-mono text-xs text-white/50 mb-5">Suttain / API &amp; engine reference</p>
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <h1 className="!text-white text-3xl sm:text-4xl lg:text-[44px] leading-tight font-medium tracking-tight">The compute and data layer behind Suttain.</h1>
              <p className="mt-5 text-white/70 max-w-xl leading-relaxed">Every engine, method and database a Suttain result can come from, with what actually runs, what is only prepared, and how to cite it.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#engines" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-[#0E1A19] hover:bg-white/90">Browse engines<ArrowRight className="h-4 w-4" /></a>
                <Link to="/ResearchPortal" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-5 text-sm font-medium text-white hover:bg-white/5">Research overview</Link>
              </div>
            </div>
            <div className="lg:col-span-5 grid grid-cols-3 gap-3">
              <Metric value={isLoading ? '—' : String(hosted.length).padStart(2, '0')} label="Hosted services" />
              <Metric value={isLoading ? '—' : String(local.length).padStart(2, '0')} label="Input-file engines" />
              <Metric value={String(DATA_SOURCES.filter(s => s.integrated).length).padStart(2, '0')} label="Data sources" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid lg:grid-cols-[180px_minmax(0,1fr)] gap-8 lg:gap-12">
        <nav aria-label="Reference sections" className="lg:sticky lg:top-24 self-start flex lg:flex-col gap-1 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
          {SECTIONS.map(([id, label], i) => (
            <a key={id} href={`#${id}`} className="shrink-0 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-research-muted hover:bg-research-card hover:text-research-text">
              <span className="font-mono text-[11px] text-research-accent">0{i + 1}</span>{label}
            </a>
          ))}
        </nav>

        <main className="min-w-0 space-y-16">
          <section id="architecture" className="scroll-mt-24">
            <p className="research-label mb-2">01 / Architecture</p>
            <h2 className="mb-6">Three ways a result is produced</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {lanes.map(({ icon: Icon, title, body, items }) => (
                <div key={title} className="rounded-xl border border-research-border bg-research-card p-5 flex flex-col">
                  <div className="research-icon mb-4"><Icon className="h-5 w-5" strokeWidth={1.5} /></div>
                  <h3 className="!text-base mb-2">{title}</h3>
                  <p className="text-sm text-research-muted mb-4">{body}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5">{items.slice(0, 8).map(item => <span key={item} className="font-mono text-[11px] rounded border border-research-border px-1.5 py-0.5 text-research-muted">{item}</span>)}{items.length > 8 && <span className="font-mono text-[11px] text-research-muted">+{items.length - 8}</span>}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="engines" className="scroll-mt-24">
            <p className="research-label mb-2">02 / Engine reference</p>
            <h2 className="mb-2">Engines and methods</h2>
            <p className="text-sm text-research-muted mb-6 max-w-2xl">Generated from the same registry the workflows use. Only listed methods and tasks are implemented; anything else is rejected rather than silently substituted. Select a row for its version, license, schema and citation.</p>
            <EngineReference engines={engines} isLoading={isLoading} error={error} />
          </section>

          <section id="data" className="scroll-mt-24">
            <p className="research-label mb-2">03 / Data services</p>
            <h2 className="mb-6">Scientific databases</h2>
            <div className="rounded-xl border border-research-border bg-research-card overflow-hidden">
              <div className="hidden md:grid grid-cols-[minmax(0,1.2fr)_140px_minmax(0,1.6fr)_minmax(0,1fr)] gap-4 px-5 py-3 border-b border-research-border bg-research-soft/60">
                {['Source', 'Coverage', 'What it provides', 'Used by'].map(h => <span key={h} className="research-label">{h}</span>)}
              </div>
              <ul>
                {DATA_SOURCES.map(source => (
                  <li key={source.id} className="grid md:grid-cols-[minmax(0,1.2fr)_140px_minmax(0,1.6fr)_minmax(0,1fr)] gap-x-4 gap-y-1 px-5 py-4 border-b border-research-border last:border-0 text-sm">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-medium text-research-text hover:text-research-accent inline-flex items-center gap-1.5">{source.name}<ExternalLink className="h-3 w-3 text-research-muted" /></a>
                    <span className="font-mono text-xs text-research-accent md:pt-0.5">{source.count ? `${source.count} ${source.unit}` : source.unit}</span>
                    <span className="text-research-muted">{source.detail}{source.asOf && <span className="block text-[11px] mt-1">Source: {source.asOf}</span>}</span>
                    <span className="text-research-muted text-xs md:pt-0.5">{source.usedBy.join(' · ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="citations" className="scroll-mt-24">
            <p className="research-label mb-2">04 / Citations</p>
            <h2 className="mb-6">Cite the software you used</h2>
            <ol className="rounded-xl border border-research-border bg-research-card divide-y divide-research-border">
              {engines.filter(e => e.citation).map((engine, i) => (
                <li key={engine.id} className="flex gap-4 px-5 py-4 text-sm">
                  <span className="font-mono text-xs text-research-accent pt-0.5 w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0"><p className="font-medium text-research-text">{engine.label}</p><p className="text-research-muted break-words">{engine.citation}</p></div>
                </li>
              ))}
            </ol>
            <p className="text-xs text-research-muted mt-3">Also report the installed version, method, basis set, solvent model and datasets used. Preparing an input file does not establish a computed result.</p>
          </section>

          <section id="access" className="scroll-mt-24 rounded-xl border border-research-border bg-research-card p-6 sm:p-8 grid md:grid-cols-[minmax(0,1fr)_auto] gap-6 items-center">
            <div>
              <p className="research-label mb-2">05 / Access</p>
              <h2 className="!text-xl mb-2">Use these engines inside Suttain</h2>
              <p className="text-sm text-research-muted max-w-xl">All engines and data services are available through Atomistic Simulation, Drug Design and the consumer tools. Programmatic access with personal API keys is not open at the moment.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/AtomisticSimulation" className="research-primary">Open Atomistic Simulation</Link>
              <a href="mailto:contact@suttain.com?subject=Suttain%20API%20access" className="research-secondary"><Mail className="h-4 w-4" />Contact us</a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
