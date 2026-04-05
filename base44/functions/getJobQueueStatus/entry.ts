import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Fetches the current job queue status from external simulation runners.
 * In production, this would connect to your actual simulation runner API.
 * For now, it returns mock data based on HPCJob entity records.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch jobs from HPCJob entity filtered by current user
    const jobs = await base44.entities.HPCJob.filter(
      { created_by: user.email },
      '-submit_timestamp',
      100
    );

    // Map entity records to queue status format
    const queueStatus = {
      timestamp: new Date().toISOString(),
      summary: {
        queued: jobs.filter(j => j.status === 'Queued').length,
        running: jobs.filter(j => j.status === 'Running').length,
        completed: jobs.filter(j => j.status === 'Completed').length,
        failed: jobs.filter(j => j.status === 'Failed').length,
        total: jobs.length,
      },
      jobs: jobs.map(job => ({
        id: job.id,
        name: job.job_name,
        status: job.status,
        engine: job.script_type,
        cluster: job.cluster_name,
        progress: calculateProgress(job.status),
        submitTime: job.submit_timestamp,
        startTime: job.start_timestamp,
        endTime: job.end_timestamp,
        cpuHours: job.cpu_hours_used,
        wallTime: job.wall_time,
        numCores: job.num_cores,
        gpuRequested: job.gpu_requested,
        logs: job.output_logs ? job.output_logs.split('\n').slice(-50) : [], // Last 50 lines
        errorMessage: job.error_message,
        linkedSimulation: job.linked_simulation_id,
      })),
    };

    return Response.json(queueStatus);
  } catch (error) {
    console.error('Error fetching job queue status:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});

function calculateProgress(status) {
  const progressMap = {
    'Submitted': 10,
    'Queued': 25,
    'Running': 65,
    'Completed': 100,
    'Failed': 0,
    'Cancelled': 0,
  };
  return progressMap[status] || 0;
}