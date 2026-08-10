import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, RefreshCw, Download, ListChecks, Loader2, FileOutput, Zap } from 'lucide-react';
import { ExecutionTag } from './StudioShared';

export default function JobPanel() {
  const queryClient = useQueryClient();
  const [expandedJob, setExpandedJob] = useState(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['studio-jobs'],
    queryFn: async () => {
      try {
        return await base44.entities.SimulationJob.list('-created_date', 50);
      } catch {
        return [];
      }
    },
  });

  const statusStyles = {
    completed: 'bg-teal-50 text-teal-700 border-teal-200',
    running: 'bg-blue-50 text-blue-700 border-blue-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
  };

  const handleDownload = (job) => {
    const data = job.result || job.inputs || { error: job.error };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suttain_job_${job.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReRun = async (job) => {
    try {
      await base44.entities.SimulationJob.create({
        draft_id: job.draft_id || 'single',
        job_hash: Date.now().toString(36),
        job_name: `Re-run: ${job.job_name || 'Untitled'}`,
        sim_type: job.sim_type,
        sim_type_label: job.sim_type_label,
        engine: job.engine,
        inputs: job.inputs,
        status: 'pending',
      });
      queryClient.invalidateQueries({ queryKey: ['studio-jobs'] });
    } catch {}
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <ListChecks className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">No jobs yet</p>
          <p className="text-xs text-slate-400 mt-1">Submit a single run, batch workflow, or pipeline to see results here.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Job Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Tool</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Mode</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Submitted</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => {
                const isExternal = job.engine && ['LAMMPS', 'Quantum ESPRESSO', 'GROMACS', 'VASP', 'ORCA', 'AlphaFold'].includes(job.engine);
                const status = job.status || 'pending';
                const mode = job.inputs?.mode || (job.draft_id === 'batch' ? 'batch' : job.draft_id === 'pipeline' ? 'pipeline' : 'single');
                return (
                  <React.Fragment key={job.id}>
                    <tr className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{job.job_name || job.sim_type_label || 'Untitled'}</td>
                      <td className="px-4 py-3 text-slate-600">{job.sim_type_label || job.engine || '-'}</td>
                      <td className="px-4 py-3 text-slate-600 capitalize">{mode}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded border text-xs font-semibold capitalize ${statusStyles[status] || statusStyles.pending}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                        {job.created_date ? new Date(job.created_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500" title="View"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleReRun(job)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500" title="Re-run"><RefreshCw className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDownload(job)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500" title="Download"><Download className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedJob === job.id && (
                      <tr className="bg-slate-50">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            {isExternal ? <FileOutput className="w-3.5 h-3.5 text-amber-600" /> : <Zap className="w-3.5 h-3.5 text-teal-600" />}
                            <ExecutionTag type={isExternal ? 'external' : 'computed'} />
                            <span className="text-xs text-slate-500">Engine: {job.engine || 'N/A'}</span>
                          </div>
                          <pre className="text-xs font-mono text-slate-600 bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto max-h-48">
                            {JSON.stringify(job.result || job.inputs || { error: job.error }, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Zap className="w-3.5 h-3.5" />
        <span>In-browser jobs compute directly in your browser. External input file jobs generate downloadable files for execution on your own infrastructure.</span>
      </div>
    </div>
  );
}