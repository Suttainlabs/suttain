import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DOMAIN_SIM_MAP } from '@/pages/ComputationalSimulation';
import SimulationDashboardHeader from '@/components/research/SimulationDashboardHeader';
import SimulationQuickAccess from '@/components/research/SimulationQuickAccess';
import RecentResearchActivity from '@/components/research/RecentResearchActivity';
import useResearchDashboardRecords from '@/components/research/useResearchDashboardRecords';
import SimulationStatusBanner from '@/components/shared/SimulationStatusBanner';

const SUPPORTED_TYPES = new Set(Object.values(DOMAIN_SIM_MAP).flat());
export default function SimulationDashboardWorkspace({ user }) {
  const { data = [], isPending, error, refetch } = useQuery({
    queryKey: ['research-simulation-workflows', user.id],
    queryFn: () => base44.entities.SimulationDraft.filter({ created_by_id: user.id, sim_type: { $in: [...SUPPORTED_TYPES] } }, '-created_date', 50),
    refetchInterval: 15000,
  });
  const { jobs, shortlist } = useResearchDashboardRecords(user.id);
  const drugJobs = jobs.data || [];
  const loading = isPending || jobs.isPending;
  const activityError = error || jobs.error;
  const stats = [
    { label: 'Recent workflows', value: data.length + drugJobs.length, detail: 'Latest 50 saved works per tool' },
    { label: 'In progress', value: data.filter(run => run.status === 'running').length + drugJobs.filter(job => ['Queued', 'Running'].includes(job.status)).length, detail: 'Running simulations and pending screening jobs' },
    { label: 'Completed', value: data.filter(run => run.status === 'completed').length + drugJobs.filter(job => job.status === 'Completed').length, detail: 'Completed works in recent activity' },
    { label: 'Drug Design shortlist', value: shortlist.data, detail: 'Saved candidates, including illustrative examples', loading: shortlist.isPending, error: shortlist.error },
  ];
  const activities = [
    ...data.map(run => ({ id: `simulation-${run.id}`, pillar: 'Atomistic Simulation', name: run.name, status: run.status || 'draft', timestamp: run.created_date, detail: `${run.sim_type_label || run.sim_type} · ${run.domain || 'Chemistry'} · ${run.engine}`, href: `/AtomisticSimulation?domain=${encodeURIComponent(run.domain || 'Chemistry')}` })),
    ...drugJobs.map(job => ({ id: `drug-${job.id}`, pillar: 'Drug Design', name: job.target_label, status: job.status, timestamp: job.submit_timestamp || job.created_date, detail: `Screening job · ${(job.compounds_screened || 0).toLocaleString()} compounds reported screened`, href: '/DrugDesign' })),
  ].sort((a, b) => (Date.parse(b.timestamp) || 0) - (Date.parse(a.timestamp) || 0)).slice(0, 50);
  const retryActivity = () => { refetch(); jobs.refetch(); };
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <SimulationDashboardHeader user={user} />
      <SimulationStatusBanner user={user} className="mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-4">
        {stats.map((stat, index) => <div key={stat.label} className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6"><p className="research-label mb-4">{stat.label}</p><p className="text-3xl font-medium text-research-accent mb-2">{(index === 3 ? stat.error : activityError) ? '—' : (index === 3 ? stat.loading : loading) ? '…' : stat.value}</p><p className="text-sm text-research-muted">{stat.detail}</p>{index === 3 && stat.error && <p role="alert" className="text-sm text-destructive mt-3">Could not load shortlist. <button onClick={() => shortlist.refetch()} className="underline">Retry</button></p>}</div>)}
      </div>
      <p className="text-xs text-research-muted mb-8">Activity totals cover the latest 50 works per tool; Drug Design counts only real compute submissions. Shortlist counts cover all saved candidates. Refreshes every 15 seconds.</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"><div className="lg:col-span-2"><RecentResearchActivity activities={activities} loading={loading} error={activityError} onRetry={retryActivity} /></div><SimulationQuickAccess /></div>
    </div>
  );
}