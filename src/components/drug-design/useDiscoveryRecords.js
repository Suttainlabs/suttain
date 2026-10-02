import { useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AuthContext from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { getDrugDiscoveryMetrics } from '@/functions/getDrugDiscoveryMetrics';
export default function useDiscoveryRecords() {
  const { user } = useContext(AuthContext); const client = useQueryClient(); const root = ['drug-discovery', user?.id];
  const metrics = useQuery({ queryKey: [...root, 'metrics'], enabled: !!user?.id, queryFn: async () => (await getDrugDiscoveryMetrics({})).data, refetchInterval: 15000 });
  const saved = useQuery({ queryKey: [...root, 'shortlist'], enabled: !!user?.id, queryFn: async () => {
    const rows = []; for (let skip = 0; ; skip += 200) { const page = await base44.entities.DrugDiscoveryShortlist.filter({ created_by_id: user.id }, 'created_date', 200, skip); rows.push(...page); if (page.length < 200) break; }
    return Array.from(new Map(rows.map(row => [row.candidate_id, { ...row, recordId: row.id, id: row.candidate_id }])).values());
  }});
  const jobs = useQuery({ queryKey: [...root, 'jobs'], enabled: !!user?.id, queryFn: () => base44.entities.DrugDiscoveryJob.filter({ created_by_id: user.id, execution_mode: 'real', provider_job_id: { $exists: true, $nin: ['', null] } }, '-submit_timestamp', 50), refetchInterval: 15000 });
  const refresh = () => client.invalidateQueries({ queryKey: root });
  useEffect(() => {
    if (!user?.id) return;
    const update = () => client.invalidateQueries({ queryKey: ['drug-discovery', user.id] });
    const stopJobs = base44.entities.DrugDiscoveryJob.subscribe(update); const stopSaved = base44.entities.DrugDiscoveryShortlist.subscribe(update);
    return () => { stopJobs(); stopSaved(); };
  }, [user?.id, client]);
  return { user, metrics, jobs, shortlist: saved.data || [], shortlistLoading: saved.isPending, shortlistError: saved.error, refresh };
}