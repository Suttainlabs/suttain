import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AuthGate from "../components/auth/AuthGate";
import { motion } from "framer-motion";
import { BarChart3, RotateCcw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductivityStats from "../components/simulation/productivity/ProductivityStats";
import ThroughputChart from "../components/simulation/productivity/ThroughputChart";
import EngineSuccessChart from "../components/simulation/productivity/EngineSuccessChart";
import SimTypeChart from "../components/simulation/productivity/SimTypeChart";
import QueueSchedulingTable from "../components/simulation/productivity/QueueSchedulingTable";
import OptimizationTips from "../components/simulation/productivity/OptimizationTips";

export default function SimulationProductivity() {
  const [timeRange, setTimeRange] = useState("all");

  const { data: queues = [], isLoading: queuesLoading, refetch: refetchQueues } = useQuery({
    queryKey: ["sim-queues-productivity"],
    queryFn: () => base44.entities.SimulationQueue.list("-created_date", 200),
    initialData: [],
  });

  const { data: jobs = [], isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ["sim-jobs-productivity"],
    queryFn: () => base44.entities.SimulationJob.list("-created_date", 500),
    initialData: [],
  });

  const isLoading = queuesLoading || jobsLoading;

  const filteredJobs = React.useMemo(() => {
    if (timeRange === "all") return jobs;
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return jobs.filter(j => new Date(j.created_date) >= cutoff);
  }, [jobs, timeRange]);

  const refetch = () => { refetchQueues(); refetchJobs(); };

  return (
    <AuthGate featureName="Simulation Productivity" featureDescription="Analytics for your simulation batch runs.">
      <div className="max-w-7xl mx-auto space-y-6 px-4 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Simulation Productivity</h1>
              <p className="text-slate-500 text-sm mt-0.5">Throughput, success rates, compute time & scheduling insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Time range filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
              {[
                { label: "7d", value: "7d" },
                { label: "30d", value: "30d" },
                { label: "90d", value: "90d" },
                { label: "All", value: "all" },
              ].map(r => (
                <button key={r.value} onClick={() => setTimeRange(r.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${timeRange === r.value ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                  {r.label}
                </button>
              ))}
            </div>
            <Button onClick={refetch} disabled={isLoading} variant="outline" size="sm" className="gap-2">
              <RotateCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Loading simulation data…</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI stats row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <ProductivityStats jobs={filteredJobs} queues={queues} />
            </motion.div>

            {/* Throughput + Engine charts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ThroughputChart jobs={filteredJobs} />
              <EngineSuccessChart jobs={filteredJobs} />
            </motion.div>

            {/* SimType donut + optimization tips */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SimTypeChart jobs={filteredJobs} />
              <OptimizationTips jobs={filteredJobs} />
            </motion.div>

            {/* Queue scheduling table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <QueueSchedulingTable queues={queues} jobs={filteredJobs} />
            </motion.div>
          </>
        )}
      </div>
    </AuthGate>
  );
}