import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, outputLog } = body;

    if (!jobId || !outputLog) {
      return Response.json({ error: 'jobId and outputLog required' }, { status: 400 });
    }

    // Fetch job record
    const jobs = await base44.entities.HPCJob.filter({ job_id: jobId });
    if (jobs.length === 0) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = jobs[0];

    // Parse output based on script type
    const parsed = parseLog(outputLog, job.script_type);

    console.log(`[HPC] Parsed job ${jobId} output:`, JSON.stringify(parsed, null, 2));

    // Update job with parsed results
    const updated = await base44.entities.HPCJob.update(job.id, {
      output_logs: outputLog,
      parsed_results: parsed,
    });

    return Response.json({
      jobId,
      parsedResults: parsed,
      job: updated,
    });
  } catch (error) {
    console.error('[HPC] Parse output error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseLog(log, scriptType) {
  const parsed = {
    scriptType,
    parseTime: new Date().toISOString(),
    rawLines: log.split('\n').length,
    success: !log.toLowerCase().includes('error'),
    extractedData: {},
  };

  if (scriptType === 'ORCA') {
    // Extract ORCA output
    const energyMatch = log.match(/FINAL SINGLE POINT ENERGY\s+([-\d.]+)/);
    if (energyMatch) parsed.extractedData.finalEnergy = parseFloat(energyMatch[1]);

    const hfMatch = log.match(/Total SCF.*?=\s+([-\d.]+)/);
    if (hfMatch) parsed.extractedData.hfEnergy = parseFloat(hfMatch[1]);

    const geomMatch = log.match(/Geometry Convergence/i);
    parsed.extractedData.geometryConverged = !!geomMatch;
  } else if (scriptType === 'GROMACS') {
    // Extract GROMACS output
    const timeMatch = log.match(/Time\s+=\s+([\d.]+)\s+ps/);
    if (timeMatch) parsed.extractedData.simulationTime = parseFloat(timeMatch[1]);

    const tempMatch = log.match(/Temperature\s+=\s+([\d.]+)/);
    if (tempMatch) parsed.extractedData.temperature = parseFloat(tempMatch[1]);

    const pressMatch = log.match(/Pressure.*?\s+([-\d.]+)/);
    if (pressMatch) parsed.extractedData.pressure = parseFloat(pressMatch[1]);
  } else if (scriptType === 'VASP') {
    // Extract VASP output
    const eMatch = log.match(/E\s+=\s+([-\d.]+)/);
    if (eMatch) parsed.extractedData.totalEnergy = parseFloat(eMatch[1]);

    const magMatch = log.match(/magnetization.*?\s+([-\d.]+)/i);
    if (magMatch) parsed.extractedData.magnetization = parseFloat(magMatch[1]);
  }

  // Common patterns
  const warningCount = (log.match(/warning|warning/gi) || []).length;
  const errorCount = (log.match(/error|failed/gi) || []).length;

  parsed.extractedData.warnings = warningCount;
  parsed.extractedData.errors = errorCount;
  parsed.extractedData.cpuTime = extractCPUTime(log);

  return parsed;
}

function extractCPUTime(log) {
  const timeMatch = log.match(/Total.*?cpu.*?time[:\s]+([\d.]+)\s*(sec|ms|hour)/i);
  if (timeMatch) {
    let value = parseFloat(timeMatch[1]);
    const unit = timeMatch[2].toLowerCase();
    if (unit === 'ms') value /= 1000;
    else if (unit === 'hour') value *= 3600;
    return parseFloat(value.toFixed(2));
  }
  return null;
}