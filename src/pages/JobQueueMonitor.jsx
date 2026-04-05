import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuthGate from '../components/auth/AuthGate';
import JobQueueCard from '../components/job-queue/JobQueueCard';
import LogsViewer from '../components/job-queue/LogsViewer';
import { Button } from '@/components/ui/button';
import { Cpu, RotateCcw, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_FILTERS = ['All', 'Queued', 'Running', 'Completed', 'Failed'];

export default function JobQueueMonitor() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedJobs, setExpandedJobs] = useState(new Set());
  const [selectedJobForLogs, setSelectedJobForLogs] = useState(null);

  // Fetch queue status with auto-refresh
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['jobQueue'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getJobQueueStatus', {});
      return response;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    initialData: { summary: { queued: 0, running: 0, completed: 0, failed: 0, total: 0 }, jobs: [] },
  });

  // Filter jobs based on selected status
  const filteredJobs = selectedFilter === 'All'
    ? data.jobs
    : data.jobs.filter(j => j.status === selectedFilter);

  const toggleJobExpand = (jobId) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleViewLogs = (job) => {
    setSelectedJobForLogs(job);
  };

  return (
    <AuthGate featureName="Job Queue Monitor" featureDescription="Monitor real-time status of computational jobs running on HPC clusters.">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Job Queue Monitor</h1>
              <p className="text-slate-600 text-sm mt-1">Real-time status for simulation runners across clusters</p>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: data.summary.total, color: 'from-slate-500 to-slate-600' },
            { label: 'Queued', value: data.summary.queued, color: 'from-blue-500 to-blue-600' },
            { label: 'Running', value: data.summary.running, color: 'from-purple-500 to-purple-600' },
            { label: 'Completed', value: data.summary.completed, color: 'from-green-500 to-green-600' },
            { label: 'Failed', value: data.summary.failed, color: 'from-red-500 to-red-600' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br ${stat.color} rounded-lg p-4 text-white shadow-lg`}
            >
              <p className="text-xs font-semibold opacity-90">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-600" />
            {STATUS_FILTERS.map(status => (
              <Button
                key={status}
                onClick={() => setSelectedFilter(status)}
                variant={selectedFilter === status ? 'default' : 'outline'}
                size="sm"
                className={selectedFilter === status ? 'bg-violet-600 hover:bg-violet-700' : ''}
              >
                {status}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* Jobs List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-600">Loading job queue...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              <p className="font-semibold mb-1">Error loading queue</p>
              <p>{error.message || 'Failed to fetch job status'}</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
              <Cpu className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No jobs found</p>
              <p className="text-slate-500 text-sm mt-1">
                {selectedFilter === 'All'
                  ? 'Submit a simulation to get started'
                  : `No ${selectedFilter.toLowerCase()} jobs at the moment`}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {filteredJobs.map(job => (
                <JobQueueCard
                  key={job.id}
                  job={job}
                  onViewLogs={handleViewLogs}
                  isExpanded={expandedJobs.has(job.id)}
                  onToggleExpand={() => toggleJobExpand(job.id)}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Logs Modal */}
        {selectedJobForLogs && (
          <LogsViewer
            job={selectedJobForLogs}
            onClose={() => setSelectedJobForLogs(null)}
          />
        )}

        {/* Info Footer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">💡 Queue Updates</p>
          <p>This dashboard refreshes automatically every 30 seconds. Click job cards to expand and view detailed information, timelines, and logs.</p>
        </div>
      </div>
    </AuthGate>
  );
}