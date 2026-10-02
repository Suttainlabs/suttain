import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useDiscoveryState from '@/components/drug-discovery/useDiscoveryState';
import DiscoverySidebar from '@/components/drug-discovery/DiscoverySidebar';
import DiscoveryDashboard from '@/components/drug-discovery/DiscoveryDashboard';
import DiscoveryWalkthrough from '@/components/drug-discovery/DiscoveryWalkthrough';
import ScreeningWizard from '@/components/drug-discovery/ScreeningWizard';
import DiscoveryQueue from '@/components/drug-discovery/DiscoveryQueue';
import DiscoveryCandidates from '@/components/drug-discovery/DiscoveryCandidates';
import DiscoveryShortlist from '@/components/drug-discovery/DiscoveryShortlist';
export default function DrugDiscovery() {
  const s = useDiscoveryState(); const content = useRef(null); const firstRender = useRef(true);
  useEffect(() => { if (firstRender.current) { firstRender.current = false; return; } content.current?.focus({ preventScroll: true }); }, [s.view, s.step]);
  return <div className="research-surface min-h-screen px-4 sm:px-6 py-6">
    <div className="max-w-6xl mx-auto mb-4 flex flex-wrap gap-3 items-center justify-between"><Link to="/ResearchPortal" className="text-sm text-research-muted hover:text-research-accent">Research / Drug discovery</Link><span className="text-xs rounded-full border border-border bg-card text-muted-foreground px-3 py-1">Live target data · Demonstration screening</span></div>
    <div className="flex flex-col md:flex-row min-h-[680px] border border-border rounded-xl bg-card text-card-foreground max-w-6xl mx-auto overflow-hidden">
      <DiscoverySidebar view={s.view} navigate={s.navigate} count={s.shortlist.length} />
      <div ref={content} tabIndex={-1} className="flex-1 min-w-0 p-4 sm:p-6">
        <p className="text-xs text-muted-foreground border-b border-border pb-3 mb-5">Screening, scores, and shortlist are local examples, not scientific predictions; refreshing clears this session.</p>
        {s.view === 'dashboard' && <DiscoveryDashboard navigate={s.navigate} start={s.start} />}
        {s.view === 'how' && <DiscoveryWalkthrough navigate={s.navigate} start={s.start} />}
        {s.view === 'new' && <ScreeningWizard state={s} />}
        {s.view === 'queue' && <DiscoveryQueue state={s} />}
        {s.view === 'candidates' && <DiscoveryCandidates state={s} />}
        {s.view === 'shortlist' && <DiscoveryShortlist state={s} />}
      </div>
    </div>
  </div>;
}