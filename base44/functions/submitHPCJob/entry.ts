import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { jobName, scriptContent, scriptType, clusterName, clusterUrl, queueName, numCores, wallTime, gpuRequested, notes } = body;

    if (!jobName || !scriptContent || !clusterName || !clusterUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mock job submission (in production, would SSH to cluster and submit)
    const mockJobId = `JOB-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    console.log(`[HPC] Submitting job ${mockJobId} to ${clusterName}`);
    console.log(`[HPC] Script type: ${scriptType}, Cores: ${numCores}, GPU: ${gpuRequested}`);

    // Create HPCJob record
    const jobRecord = await base44.entities.HPCJob.create({
      job_name: jobName,
      job_id: mockJobId,
      script_content: scriptContent,
      script_type: scriptType,
      cluster_name: clusterName,
      cluster_url: clusterUrl,
      queue_name: queueName || 'default',
      num_cores: numCores || 4,
      wall_time: wallTime || '01:00:00',
      gpu_requested: gpuRequested || false,
      status: 'Submitted',
      submit_timestamp: new Date().toISOString(),
      notes: notes || '',
    });

    // In production: SSH to cluster and submit script
    // const sshCmd = `ssh user@${clusterUrl} 'sbatch -J ${jobName} -n ${numCores} -t ${wallTime} script.sh'`;
    // Would capture real job ID from cluster scheduler response

    return Response.json({
      success: true,
      jobId: mockJobId,
      jobRecord,
      message: `Job ${mockJobId} submitted to ${clusterName}`,
    });
  } catch (error) {
    console.error('[HPC] Submission error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});