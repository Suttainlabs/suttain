import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // This function should only be called by admins or scheduled automations
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    
    // Find all scheduled reports that need to run
    const scheduledReports = await base44.asServiceRole.entities.Report.filter({
      'schedule.enabled': true,
      status: { $ne: 'generating' }
    });

    const results = [];

    for (const report of scheduledReports) {
      const schedule = report.schedule;
      if (!schedule || !schedule.enabled) continue;

      const shouldRun = checkIfShouldRun(schedule, now);
      
      if (shouldRun) {
        try {
          // Generate the report
          await base44.asServiceRole.functions.invoke('generateReport', {
            reportId: report.id,
            sourceData: report.source_id ? await fetchSourceData(base44, report) : {},
            reportConfig: report
          });

          // Deliver the report
          await base44.asServiceRole.functions.invoke('deliverReport', {
            reportId: report.id
          });

          // Update last_run time
          await base44.asServiceRole.entities.Report.update(report.id, {
            'schedule.last_run': now.toISOString(),
            'schedule.next_run': calculateNextRun(schedule, now).toISOString()
          });

          results.push({ reportId: report.id, status: 'success' });
        } catch (err) {
          results.push({ reportId: report.id, status: 'error', error: err.message });
        }
      }
    }

    return Response.json({ 
      success: true, 
      processed: results.length,
      results 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function checkIfShouldRun(schedule, now) {
  if (!schedule.next_run) return true;
  
  const nextRun = new Date(schedule.next_run);
  return now >= nextRun;
}

function calculateNextRun(schedule, from) {
  const next = new Date(from);
  const [hours, minutes] = (schedule.time || '09:00').split(':').map(Number);
  
  next.setHours(hours, minutes, 0, 0);
  
  switch (schedule.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      if (schedule.day_of_week !== undefined) {
        const currentDay = next.getDay();
        const daysUntilTarget = (schedule.day_of_week - currentDay + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntilTarget);
      }
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      if (schedule.day_of_month) {
        next.setDate(Math.min(schedule.day_of_month, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      }
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
  }
  
  return next;
}

async function fetchSourceData(base44, report) {
  if (!report.source_id || !report.source_type) return {};
  
  try {
    switch (report.source_type) {
      case 'simulation':
        const sims = await base44.asServiceRole.entities.Simulation.filter({ id: report.source_id });
        return sims[0] || {};
      case 'formula':
        const formulas = await base44.asServiceRole.entities.Formula.filter({ id: report.source_id });
        return formulas[0] || {};
      case 'compliance_check':
        const checks = await base44.asServiceRole.entities.ComplianceCheck.filter({ id: report.source_id });
        return checks[0] || {};
      default:
        return {};
    }
  } catch {
    return {};
  }
}