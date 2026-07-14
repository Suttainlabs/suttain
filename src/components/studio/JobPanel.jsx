import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Eye, RefreshCw, Download, Briefcase, Loader2, FileOutput, Cpu } from 'lucide-react';
import { ExecutionTag } from './StudioShared';

export default function JobPanel() {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['studio-jobs'],
    queryFn: async () => {
      try {
        return await base44.entities.SimulationJob.list('-created_date', 20);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Jobs</h3>
          <p className="text-sm text-slate-500">All submitted jobs across single run, batch, and pipeline modes</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3" />
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
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Execution</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Submitted</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => {
                const isExternal = job.engine && ['LAMMPS', 'Quantum ESPRESSO', 'GROMACS', 'VASP', 'ORCA'].includes(job.engine);
                const status = job.status || 'pending';
                return (
                  <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{job.job_name || job.sim_type_label || 'Untitled'}</td>
                    <td className="px-4 py-3 text-slate-600">{job.sim_type_label || job.engine || '-'}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{job.draft_id ? 'Single' : 'Batch'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded border text-xs font-semibold capitalize ${statusStyles[status] || statusStyles.pending}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ExecutionTag type={isExternal ? 'external' : 'computed'} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                      {job.created_date ? new Date(job.created_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500" title="View results"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500" title="Re-run"><RefreshCw className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500" title="Download"><Download className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Cpu className="w-3.5 h-3.5" />
        <span>In-browser jobs compute directly in your browser. External input file jobs generate downloadable files for execution on your own infrastructure.</span>
      </div>
    </div>
  );
}