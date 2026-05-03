import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuthGate from '../components/auth/AuthGate';
import SimulationMetricsChart from '../components/simulation/SimulationMetricsChart';
import JobQueueCard from '../components/job-queue/JobQueueCard';
import LogsViewer from '../components/job-queue/LogsViewer';
import { motion } from 'framer-motion';
import { BarChart3, Activity, RotateCcw, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function SimulationDashboard() {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [expandedJobs, setExpandedJobs] = useState(new Set());
  const [selectedJobForLogs, setSelectedJobForLogs] = useState(null);

  // Fetch active jobs
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['activeSims'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getJobQueueStatus', {});
      return response.jobs || [];
    },
    refetchInterval: 30000,
    initialData: [],
  });

  const activeJobs = data.filter(j => ['Running', 'Queued'].includes(j.status));
  
  // Auto-select first job if available
  React.useEffect(() => {
    if (!selectedJobId && activeJobs.length > 0) {
      setSelectedJobId(activeJobs[0].id);
    }
  }, [activeJobs, selectedJobId]);

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

  return (
    <AuthGate featureName="Simulation Dashboard" featureDescription="Monitor and analyze active simulation metrics in real-time.">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Simulation Dashboard</h1>
                <p className="text-slate-600 text-sm mt-1">Real-time energy, stability, and convergence metrics</p>
              </div>
            </div>
            <Link to="/SimulationProductivity">
              <Button variant="outline" size="sm" className="gap-2 border-violet-200 text-violet-700 hover:bg-violet-50">
                <TrendingUp className="w-4 h-4" /> Productivity
              </Button>
            </Link>
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
        </motion.div>

        {/* Metrics Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SimulationMetricsChart
            jobs={activeJobs}
            selectedJobId={selectedJobId}
            onJobSelect={setSelectedJobId}
          />
        </motion.div>

        {/* Active Jobs List */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Active Simulations ({activeJobs.length})
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-600">Loading jobs…</p>
              </div>
            </div>
          ) : activeJobs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
              <Activity className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No active simulations</p>
              <p className="text-slate-500 text-sm mt-1">Submit a job to see real-time metrics</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {activeJobs.map(job => (
                <JobQueueCard
                  key={job.id}
                  job={job}
                  onViewLogs={setSelectedJobForLogs}
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
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 text-sm text-cyan-900">
          <p className="font-semibold mb-1">📊 Dashboard Features</p>
          <ul className="text-xs space-y-1 text-cyan-800">
            <li>• <strong>Metrics Chart:</strong> View energy, RMSD, forces, and temperature over simulation steps</li>
            <li>• <strong>Job Selection:</strong> Click any active job above to load its metrics into the chart</li>
            <li>• <strong>Visualization:</strong> Toggle between line and area chart views</li>
            <li>• <strong>Auto-Refresh:</strong> Updates every 30 seconds</li>
          </ul>
        </div>
      </div>
    </AuthGate>
  );
}