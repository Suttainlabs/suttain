import { FlaskConical } from 'lucide-react';
import { NAV } from '@/components/drug-design/discoveryData';
export default function DiscoverySidebar({ view, navigate, count }) {
  return <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border p-4 flex flex-col">
    <div className="flex items-center gap-2 mb-4"><FlaskConical className="h-5 w-5 text-accent" aria-hidden="true" /><span className="font-medium">Drug Design</span></div>
    <nav aria-label="Drug Design views" className="flex md:flex-col overflow-x-auto gap-1">
      {NAV.map(([key, label]) => <button key={key} onClick={() => navigate(key)} aria-current={view === key ? 'page' : undefined} className={`min-h-11 shrink-0 text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between gap-3 ${view === key ? 'bg-secondary text-secondary-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}>{label}{key === 'shortlist' && count > 0 && <span className="text-xs font-mono bg-muted text-foreground rounded-full px-2">{count}</span>}</button>)}
    </nav>
    <p className="mt-5 md:mt-auto pt-4 text-xs text-muted-foreground border-t border-border">Drug Design supports research exploration—not clinical decisions.</p>
  </aside>;
}