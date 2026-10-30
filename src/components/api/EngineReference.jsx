import React, { useMemo, useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';

const MODE = {
  hosted: { label: 'Hosted', tone: 'bg-research-accent/10 text-research-accent border-research-accent/30' },
  input_file: { label: 'Input file', tone: 'bg-research-soft text-research-muted border-research-border' },
};

function Chips({ items = [], max = 3 }) {
  const shown = items.slice(0, max);
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map(item => <span key={item} className="font-mono text-[11px] rounded border border-research-border bg-research-card px-1.5 py-0.5 text-research-text">{item}</span>)}
      {items.length > max && <span className="font-mono text-[11px] text-research-muted px-1 py-0.5">+{items.length - max}</span>}
    </div>
  );
}

function EngineRow({ engine }) {
  const [open, setOpen] = useState(false);
  const mode = MODE[engine.deployment] || MODE.input_file;
  return (
    <li className="border-b border-research-border last:border-0">
      <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="w-full grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[200px_110px_minmax(0,1fr)_minmax(0,1fr)_24px] gap-x-4 gap-y-2 items-center px-4 sm:px-5 py-4 text-left hover:bg-research-soft/60 transition-colors">
        <span className="font-medium text-research-text truncate">{engine.label}</span>
        <span className={`justify-self-end md:justify-self-start inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${mode.tone}`}>{mode.label}</span>
        <span className="col-span-2 md:col-span-1 min-w-0"><span className="md:hidden research-label block mb-1">Methods</span><Chips items={engine.methods} /></span>
        <span className="col-span-2 md:col-span-1 min-w-0"><span className="md:hidden research-label block mb-1">Tasks</span><Chips items={engine.tasks} max={2} /></span>
        <ChevronDown className={`hidden md:block h-4 w-4 text-research-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-5 grid gap-5 md:grid-cols-2 text-sm">
          <dl className="space-y-3">
            <div><dt className="research-label mb-1">Function</dt><dd className="font-mono text-xs text-research-text">{engine.endpoint || '—'}</dd></div>
            <div><dt className="research-label mb-1">Version</dt><dd className="text-research-muted">{engine.version}</dd></div>
            <div><dt className="research-label mb-1">License / requirements</dt><dd className="text-research-muted">{engine.license}</dd></div>
            <div><dt className="research-label mb-1">Execution</dt><dd className="text-research-muted">{engine.hosting_note || (engine.deployment === 'input_file' ? 'Suttain prepares input files; the calculation runs on your own computer or cluster.' : 'Runs on the hosted provider; results carry provider attribution.')}</dd></div>
          </dl>
          <div className="space-y-3 min-w-0">
            <div><p className="research-label mb-1">Citation</p><p className="text-research-muted">{engine.citation}</p></div>
            {engine.docs_url && <a href={engine.docs_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-research-accent hover:underline">Official documentation<ExternalLink className="h-3.5 w-3.5" /></a>}
            {engine.parameter_schema && (
              <details className="rounded-lg border border-research-border">
                <summary className="cursor-pointer px-3 py-2 text-xs text-research-muted">Parameter schema</summary>
                <pre className="max-h-64 overflow-auto px-3 pb-3 text-[11px] leading-relaxed">{JSON.stringify(engine.parameter_schema, null, 2)}</pre>
              </details>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

export default function EngineReference({ engines = [], isLoading, error }) {
  const [filter, setFilter] = useState('all');
  const visible = useMemo(() => engines.filter(e => filter === 'all' || e.deployment === filter), [engines, filter]);
  return (
    <div>
      <div role="group" aria-label="Filter engines" className="flex flex-wrap gap-2 mb-4">
        {[['all', 'All engines'], ['hosted', 'Hosted'], ['input_file', 'Input file']].map(([value, label]) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}
            className={`min-h-9 rounded-lg border px-3 text-sm transition-colors ${filter === value ? 'bg-research-accent text-research-card border-research-accent' : 'bg-research-card text-research-muted border-research-border hover:border-research-accent'}`}>
            {label} <span className="font-mono text-xs opacity-80">{value === 'all' ? engines.length : engines.filter(e => e.deployment === value).length}</span>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-research-border bg-research-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[200px_110px_minmax(0,1fr)_minmax(0,1fr)_24px] gap-x-4 px-5 py-3 border-b border-research-border bg-research-soft/60">
          {['Engine', 'Mode', 'Methods', 'Tasks', ''].map(h => <span key={h} className="research-label">{h}</span>)}
        </div>
        {isLoading && <p role="status" className="px-5 py-6 text-sm text-research-muted">Loading engine reference…</p>}
        {error && <p role="alert" className="px-5 py-6 text-sm text-destructive">The engine reference could not load. Refresh to retry.</p>}
        <ul>{visible.map(engine => <EngineRow key={engine.id} engine={engine} />)}</ul>
      </div>
    </div>
  );
}
