import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useResearchDashboardRecords(userId) {
  const jobs = useQuery({
    queryKey: ['research-dashboard-drug-jobs', userId],
    queryFn: () => base44.entities.DrugDiscoveryJob.filter({
      created_by_id: userId,
      status: { $in: ['Submitted', 'Queued', 'Running', 'Completed', 'Failed'] },
      execution_mode: 'real',
      provider_job_id: { $exists: true, $nin: ['', null] },
    }, '-submit_timestamp', 50),
    refetchInterval: 15000,
  });
  const shortlist = useQuery({
    queryKey: ['research-dashboard-shortlist', userId],
    queryFn: async () => {
      const candidates = new Set();
      for (let skip = 0; ; skip += 200) {
        const page = await base44.entities.DrugDiscoveryShortlist.filter({ created_by_id: userId }, 'created_date', 200, skip);
        page.forEach(row => candidates.add(row.candidate_id));
        if (page.length < 200) return candidates.size;
      }
    },
    refetchInterval: 15000,
  });
  return { jobs, shortlist };
}