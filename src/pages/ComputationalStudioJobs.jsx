import React from 'react';
import { ListChecks } from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';
import JobPanel from '@/components/studio/JobPanel';
import { SourcedBadge } from '@/components/studio/StudioShared';

export default function ComputationalStudioJobs() {
  return (
    <StudioLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200">
              <ListChecks className="w-5 h-5 text-[#0F6E56]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Jobs</h1>
              <p className="text-sm text-slate-500">Track all submitted jobs across single run, batch, and pipeline modes</p>
            </div>
          </div>
          <SourcedBadge />
        </div>

        <JobPanel />
      </div>
    </StudioLayout>
  );
}