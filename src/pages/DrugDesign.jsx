import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useDiscoveryState from '@/components/drug-design/useDiscoveryState';
import DiscoverySidebar from '@/components/drug-design/DiscoverySidebar';
import DiscoveryDashboard from '@/components/drug-design/DiscoveryDashboard';
import DiscoveryWalkthrough from '@/components/drug-design/DiscoveryWalkthrough';
import ScreeningWizard from '@/components/drug-design/ScreeningWizard';
import DiscoveryQueue from '@/components/drug-design/DiscoveryQueue';
import DiscoveryCandidates from '@/components/drug-design/DiscoveryCandidates';
import DiscoveryShortlist from '@/components/drug-design/DiscoveryShortlist';
export default function DrugDesign() {
  const s = useDiscoveryState(); const content = useRef(null); const firstRender = useRef(true);
  useEffect(() => { if (firstRender.current) { firstRender.current = false; return; } content.current?.focus({ preventScroll: true }); }, [s.view, s.step]);
  return <div className="research-surface min-h-screen px-4 sm:px-6 py-6">
    <div className="max-w-6xl mx-auto mb-4 flex flex-wrap gap-3 items-center justify-between"><Link to="/ResearchPortal" className="text-sm text-research-muted hover:text-research-accent">Research / Drug Design</Link><span className="text-xs rounded-full border border-border bg-card text-muted-foreground px-3 py-1">Drug Design · Live targets · Personal shortlists</span></div>
    <div className="flex flex-col md:flex-row min-h-[680px] border border-border rounded-xl bg-card text-card-foreground max-w-6xl mx-auto overflow-hidden">
      <DiscoverySidebar view={s.view} navigate={s.navigate} count={s.shortlist.length} />
      <div ref={content} tabIndex={-1} className="flex-1 min-w-0 p-4 sm:p-6">
        <p className="text-xs text-muted-foreground border-b border-border pb-3 mb-5">Drug Design supports target exploration and candidate review. Molecules, binding scores, and ADMET labels shown here are illustrative, not scientific predictions. Your shortlist is private; job metrics count only real compute submissions.</p>
        {s.view === 'dashboard' && <DiscoveryDashboard navigate={s.navigate} start={s.start} metrics={s.metrics} />}
        {s.view === 'how' && <DiscoveryWalkthrough navigate={s.navigate} start={s.start} />}
        {s.view === 'new' && <ScreeningWizard state={s} />}
        {s.view === 'queue' && <DiscoveryQueue state={s} />}
        {s.view === 'candidates' && <DiscoveryCandidates state={s} />}
        {s.view === 'shortlist' && <DiscoveryShortlist state={s} />}
      </div>
    </div>
  </div>;
}