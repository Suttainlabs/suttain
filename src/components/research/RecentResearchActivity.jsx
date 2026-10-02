import { Link } from 'react-router-dom';
import { Cpu, ArrowUpRight, Loader2 } from 'lucide-react';

const STATUS_STYLE = { completed: 'bg-research-soft text-research-accent', running: 'bg-research-soft text-research-accent', queued: 'bg-research-soft text-research-accent', submitted: 'bg-research-soft text-research-accent', draft: 'bg-research-page text-research-muted', failed: 'bg-destructive/5 text-destructive' };
export default function RecentResearchActivity({ activities, loading, error, onRetry }) {
  return <section className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6"><div><p className="research-label mb-2">Run and track</p><h2 className="!text-lg">Recent research activity</h2></div><span className="research-label">Latest 50 works</span></div>
    {loading ? <div role="status" className="flex items-center justify-center gap-2 py-14 text-sm text-research-muted"><Loader2 className="h-4 w-4 animate-spin" />Loading research activity…</div> : error ? (
      <div role="alert" className="py-8 text-center"><p className="text-sm text-destructive mb-4">Unable to load all your research activity.</p><button onClick={onRetry} className="research-secondary">Try again</button></div>
    ) : activities.length === 0 ? (
      <div className="flex flex-col items-center text-center py-10"><div className="research-icon bg-research-soft mb-5"><Cpu className="h-5 w-5" strokeWidth={1.5} /></div><h3 className="mb-2">No research activity yet</h3><p className="text-sm text-research-muted max-w-sm mb-6">Saved Atomistic Simulation workflows and real Drug Design screening jobs will appear here.</p><div className="flex flex-wrap justify-center gap-3"><Link to="/AtomisticSimulation" className="research-secondary">Explore simulations<ArrowUpRight className="h-4 w-4" /></Link><Link to="/DrugDesign" className="research-secondary">Explore Drug Design<ArrowUpRight className="h-4 w-4" /></Link></div></div>
    ) : <div className="divide-y divide-research-border">{activities.map(item => <article key={item.id} className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><span className="inline-block rounded border border-research-border bg-research-soft text-research-accent px-2 py-1 text-xs mb-2">{item.pillar}</span><h3 className="!text-base break-words mb-1">{item.name}</h3><p className="text-sm text-research-muted break-words">{item.detail}</p></div><span className={`rounded border border-research-border px-2 py-1 text-xs ${STATUS_STYLE[item.status.toLowerCase()] || STATUS_STYLE.draft}`}>{item.status}</span></div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3"><p className="research-label">{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Date unavailable'}</p><Link to={item.href} className="inline-flex items-center gap-1.5 text-xs text-research-accent hover:underline">Open {item.pillar}<ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
    </article>)}</div>}
  </section>;
}