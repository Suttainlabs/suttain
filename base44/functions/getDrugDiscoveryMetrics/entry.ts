import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireUser } from '../../shared/securityGuards.ts';
import { eachOwnedPage, realJobFilter } from '../../shared/drugDiscoveryRecords.ts';
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req); const user = await requireUser(base44);
    let activeJobs = 0, compoundsScreened30d = 0, totalJobs = 0, durationSum = 0, completedWithTime = 0;
    const candidates = new Set(); const now = Date.now(); const cutoff = now - 30 * 24 * 60 * 60 * 1000;
    await Promise.all([
      eachOwnedPage(base44.entities.DrugDiscoveryJob, user.id, realJobFilter, ['id','status','compounds_screened','submit_timestamp','end_timestamp'], rows => {
        for (const job of rows) {
          totalJobs++;
          if (['Submitted','Queued','Running'].includes(job.status)) activeJobs++;
          const start = Date.parse(job.submit_timestamp); const end = Date.parse(job.end_timestamp);
          if (start >= cutoff && start <= now && Number.isInteger(job.compounds_screened) && job.compounds_screened >= 0) compoundsScreened30d += job.compounds_screened;
          if (job.status === 'Completed' && Number.isFinite(start) && Number.isFinite(end) && end >= start && end <= now) { durationSum += end - start; completedWithTime++; }
        }
      }),
      eachOwnedPage(base44.entities.DrugDiscoveryShortlist, user.id, {}, ['candidate_id'], rows => { for (const row of rows) candidates.add(row.candidate_id); })
    ]);
    const minutes = completedWithTime ? Math.round(durationSum / completedWithTime / 60000) : null;
    return Response.json({ activeJobs, compoundsScreened30d, candidatesShortlisted: candidates.size, avgTimeToShortlist: minutes === null ? null : `${Math.floor(minutes / 60)}h ${minutes % 60}m`, totalJobs, computeAvailable: false });
  } catch (error) { console.error('Discovery metrics failed', error.message); return Response.json({ error: 'Unable to load discovery activity.' }, { status: error.status || 500 }); }
}