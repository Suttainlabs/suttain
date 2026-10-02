import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DOMAIN_SIM_MAP } from '@/pages/ComputationalSimulation';
import SimulationDashboardHeader from '@/components/research/SimulationDashboardHeader';
import SimulationQuickAccess from '@/components/research/SimulationQuickAccess';
import RecentSimulationRuns from '@/components/research/RecentSimulationRuns';

const SUPPORTED_TYPES = new Set(Object.values(DOMAIN_SIM_MAP).flat());
export default function SimulationDashboardWorkspace({ user }) {
  const { data = [], isPending, error, refetch } = useQuery({
    queryKey: ['research-simulation-workflows', user.id],
    queryFn: () => base44.entities.SimulationDraft.filter({ created_by_id: user.id, sim_type: { $in: [...SUPPORTED_TYPES] } }, '-created_date', 50),
  });
  const stats = [
    { label: 'Recent workflows', value: data.length, detail: 'Latest saved simulation activity' },
    { label: 'In progress', value: data.filter(run => run.status === 'running').length, detail: 'Workflows being prepared' },
    { label: 'Completed', value: data.filter(run => run.status === 'completed').length, detail: 'Workflow analysis available' },
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <SimulationDashboardHeader user={user} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map(stat => <div key={stat.label} className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6"><p className="research-label mb-4">{stat.label}</p><p className="text-3xl font-medium text-research-accent mb-2">{isPending || error ? '...' : stat.value}</p><p className="text-sm text-research-muted">{stat.detail}</p></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"><div className="lg:col-span-2"><RecentSimulationRuns runs={data} loading={isPending} error={error} onRetry={refetch} /></div><SimulationQuickAccess /></div>
    </div>
  );
}