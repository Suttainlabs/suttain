import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowUpRight, Loader2 } from 'lucide-react';

const STATUS_STYLE = { completed: 'bg-research-soft text-research-accent', running: 'bg-research-soft text-research-accent', draft: 'bg-research-page text-research-muted', failed: 'bg-destructive/5 text-destructive' };
export default function RecentSimulationRuns({ runs, loading, error, onRetry }) {
  return (
    <section className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6"><div><p className="research-label mb-2">Run and track</p><h2 className="!text-lg">Recent simulation workflows</h2></div><span className="research-label">Latest 50 workflows</span></div>
      {loading ? <div role="status" className="flex items-center justify-center gap-2 py-14 text-sm text-research-muted"><Loader2 className="h-4 w-4 animate-spin" />Loading simulations...</div> : error ? (
        <div role="alert" className="py-8 text-center"><p className="text-sm text-destructive mb-4">Unable to load your simulation workflows.</p><button onClick={onRetry} className="research-secondary">Try again</button></div>
      ) : runs.length === 0 ? (
        <div className="flex flex-col items-center text-center py-10"><div className="research-icon bg-research-soft mb-5"><Cpu className="h-5 w-5" strokeWidth={1.5} /></div><h3 className="mb-2">No simulation workflows yet</h3><p className="text-sm text-research-muted max-w-sm mb-6">Choose a compute field and configure your first calculation. Your saved simulation activity will appear here.</p><Link to="/ComputationalStudio/Simulations" className="research-secondary">Explore simulations<ArrowUpRight className="h-4 w-4" /></Link></div>
      ) : (
        <div className="divide-y divide-research-border">
          {runs.map(run => <article key={run.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><h3 className="!text-base break-words mb-1">{run.name}</h3><p className="text-sm text-research-muted">{run.sim_type_label || run.sim_type} · {run.domain || 'Chemistry'}</p></div><span className={`rounded border border-research-border px-2 py-1 text-xs ${STATUS_STYLE[run.status] || STATUS_STYLE.draft}`}>{run.status || 'draft'}</span></div>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3"><p className="research-label">{run.engine} · {new Date(run.created_date).toLocaleDateString()}</p><Link to={`/SimulationRunner?type=${encodeURIComponent(run.sim_type)}&domain=${encodeURIComponent(run.domain || 'Chemistry')}`} className="inline-flex items-center gap-1.5 text-xs text-research-accent hover:underline">Configure new run<ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
          </article>)}
        </div>
      )}
    </section>
  );
}