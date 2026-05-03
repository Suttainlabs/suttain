import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, Clock, Loader2, Eye,
  ChevronRight, FlaskConical
} from "lucide-react";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "bg-slate-100 text-slate-600", icon: Clock },
  running:   { label: "Running",   color: "bg-blue-100 text-blue-700",   icon: Loader2, spin: true },
  completed: { label: "Done",      color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  failed:    { label: "Failed",    color: "bg-red-100 text-red-600",     icon: XCircle },
};

export default function QueueJobList({ queue, runningQueueId, onViewResult, onRefresh }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    const data = await base44.entities.SimulationJob.filter({ queue_id: queue.id });
    const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setJobs(sorted);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [queue.id]);

  // Poll while queue is running
  useEffect(() => {
    if (runningQueueId !== queue.id) return;
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, [runningQueueId, queue.id]);

  const completedCount = jobs.filter(j => j.status === "completed").length;
  const failedCount = jobs.filter(j => j.status === "failed").length;
  const progress = jobs.length > 0 ? Math.round((completedCount / jobs.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Queue header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{queue.name}</h2>
            {queue.description && <p className="text-sm text-slate-500">{queue.description}</p>}
          </div>
          <div className="flex gap-4 text-sm text-slate-600">
            <div className="text-center">
              <p className="text-2xl font-bold text-violet-700">{jobs.length}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              <p className="text-xs text-slate-400">Done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{failedCount}</p>
              <p className="text-xs text-slate-400">Failed</p>
            </div>
          </div>
        </div>
        {jobs.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Job list */}
      <div className="space-y-2">
        {jobs.map((job, index) => {
          const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
          const Icon = cfg.icon;
          const keyValues = job.result?.predicted_results?.key_values || [];

          return (
            <Card key={job.id} className={`transition-all ${job.status === "running" ? "border-blue-300 shadow-blue-50 shadow-md" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="w-7 h-7 bg-slate-100 text-slate-600 text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm">{job.job_name}</p>
                      <Badge className={`${cfg.color} text-xs`}>
                        <Icon className={`w-3 h-3 mr-1 ${cfg.spin ? "animate-spin" : ""}`} />
                        {cfg.label}
                      </Badge>
                      <span className="text-xs text-slate-400">{job.sim_type_label} · {job.engine}</span>
                    </div>
                    {/* Show key input params inline */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.entries(job.inputs || {}).slice(0, 4).map(([k, v]) => (
                        <span key={k} className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                          {k}: <span className="font-semibold text-slate-700">{v}</span>
                        </span>
                      ))}
                    </div>
                    {/* Quick result preview */}
                    {job.status === "completed" && keyValues.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {keyValues.slice(0, 3).map((kv, i) => (
                          <span key={i} className="text-[10px] bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full font-mono">
                            {kv.property}: <b>{kv.value}</b> {kv.unit}
                          </span>
                        ))}
                      </div>
                    )}
                    {job.status === "failed" && job.error && (
                      <p className="text-xs text-red-500 mt-1 truncate">Error: {job.error}</p>
                    )}
                  </div>
                  {job.status === "completed" && (
                    <Button size="sm" variant="outline"
                      onClick={() => onViewResult(job)}
                      className="gap-1.5 text-violet-700 border-violet-200 hover:bg-violet-50 text-xs flex-shrink-0">
                      <Eye className="w-3.5 h-3.5" /> Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}