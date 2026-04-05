import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return Response.json({ error: 'jobId required' }, { status: 400 });
    }

    // Fetch job record
    const jobs = await base44.entities.HPCJob.filter({ job_id: jobId });
    if (jobs.length === 0) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = jobs[0];

    // Mock status polling (in production, would SSH and query scheduler)
    // Example: squeue -j $jobId or similar depending on cluster scheduler
    const statusProgression = ['Submitted', 'Queued', 'Running', 'Completed'];
    const currentIndex = statusProgression.indexOf(job.status);
    let newStatus = job.status;
    let progress = 0;

    if (currentIndex < statusProgression.length - 1) {
      // Simulate progression (randomly advance state for demo)
      if (Math.random() > 0.6) {
        newStatus = statusProgression[currentIndex + 1];
      }
    }

    if (newStatus === 'Running') {
      progress = Math.random() * 0.8; // 0-80% while running
    } else if (newStatus === 'Completed') {
      progress = 1.0;
    }

    // Update job status
    const timestamp = newStatus === 'Running' && !job.start_timestamp ? new Date().toISOString() : job.start_timestamp;
    const endTimestamp = newStatus === 'Completed' ? new Date().toISOString() : job.end_timestamp;

    const updatedJob = await base44.entities.HPCJob.update(job.id, {
      status: newStatus,
      start_timestamp: timestamp,
      end_timestamp: endTimestamp,
    });

    console.log(`[HPC] Job ${jobId} status: ${newStatus} (progress: ${(progress * 100).toFixed(1)}%)`);

    return Response.json({
      jobId,
      status: newStatus,
      progress,
      job: updatedJob,
    });
  } catch (error) {
    console.error('[HPC] Poll status error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});