import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ListChecks, Plus, Play, Pause, Trash2, ChevronRight,
  Loader2, CheckCircle2, XCircle, Clock, BarChart2,
  FlaskConical, Layers, ArrowRight, Eye, RotateCcw
} from "lucide-react";
import QueueBuilder from "../components/simulation/queue/QueueBuilder";
import QueueJobList from "../components/simulation/queue/QueueJobList";
import QueueResultsModal from "../components/simulation/queue/QueueResultsModal";

const STATUS_STYLES = {
  draft:     { color: "bg-slate-100 text-slate-600", icon: Clock },
  running:   { color: "bg-blue-100 text-blue-700", icon: Loader2 },
  completed: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  paused:    { color: "bg-amber-100 text-amber-700", icon: Pause },
};

export default function SimulationQueueManager() {
  const [queues, setQueues] = useState([]);
  const [loadingQueues, setLoadingQueues] = useState(true);
  const [activeQueueId, setActiveQueueId] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [runningQueueId, setRunningQueueId] = useState(null);
  const [viewResultsJob, setViewResultsJob] = useState(null);

  const fetchQueues = async () => {
    setLoadingQueues(true);
    const data = await base44.entities.SimulationQueue.list("-created_date");
    setQueues(data);
    setLoadingQueues(false);
  };

  useEffect(() => { fetchQueues(); }, []);

  const handleCreateQueue = async (queueData, jobs) => {
    const queue = await base44.entities.SimulationQueue.create({
      name: queueData.name,
      description: queueData.description,
      status: "draft",
      total_jobs: jobs.length,
      completed_jobs: 0,
      failed_jobs: 0,
    });
    for (let i = 0; i < jobs.length; i++) {
      await base44.entities.SimulationJob.create({
        queue_id: queue.id,
        job_name: jobs[i].job_name,
        sim_type: jobs[i].sim_type,
        sim_type_label: jobs[i].sim_type_label,
        engine: jobs[i].engine,
        inputs: jobs[i].inputs,
        status: "pending",
        order: i,
      });
    }
    setShowBuilder(false);
    await fetchQueues();
    setActiveQueueId(queue.id);
  };

  const handleDeleteQueue = async (queueId) => {
    if (!window.confirm("Delete this queue and all its jobs?")) return;
    const jobs = await base44.entities.SimulationJob.filter({ queue_id: queueId });
    for (const job of jobs) await base44.entities.SimulationJob.delete(job.id);
    await base44.entities.SimulationQueue.delete(queueId);
    if (activeQueueId === queueId) setActiveQueueId(null);
    await fetchQueues();
  };

  const handleRunQueue = async (queue) => {
    if (runningQueueId) return;
    setRunningQueueId(queue.id);
    await base44.entities.SimulationQueue.update(queue.id, { status: "running" });
    setQueues(prev => prev.map(q => q.id === queue.id ? { ...q, status: "running" } : q));

    const jobs = await base44.entities.SimulationJob.filter({ queue_id: queue.id });
    const sorted = [...jobs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    let completed = 0;
    let failed = 0;

    for (const job of sorted) {
      if (job.status === "completed") { completed++; continue; }

      await base44.entities.SimulationJob.update(job.id, { status: "running" });

      const inputSummary = Object.entries(job.inputs || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");

      const prompt = `You are a computational chemistry expert. Run a ${job.sim_type_label} simulation using ${job.engine}.

Parameters:
${inputSummary}

Return JSON with:
1. system_overview: Brief 2-3 sentence description
2. predicted_results: { summary: string, key_values: [{property, value, unit, interpretation}] }
3. scientific_interpretation: 2-3 sentence interpretation
4. bash_script: Complete ready-to-run ${job.engine} input/bash script
5. next_steps: array of 3 next steps`;

      try {
        const result = await base44.functions.invoke('runConsumerLLM', {
          operation: 'simulationQueue',
          data: { job, inputSummary }
        });
        await base44.entities.SimulationJob.update(job.id, { status: "completed", result });
        completed++;
      } catch (e) {
        await base44.entities.SimulationJob.update(job.id, { status: "failed", error: e.message });
        failed++;
      }

      await base44.entities.SimulationQueue.update(queue.id, { completed_jobs: completed, failed_jobs: failed });
      setQueues(prev => prev.map(q => q.id === queue.id ? { ...q, completed_jobs: completed, failed_jobs: failed } : q));
    }

    const finalStatus = failed === sorted.length ? "paused" : "completed";
    await base44.entities.SimulationQueue.update(queue.id, { status: finalStatus, completed_jobs: completed, failed_jobs: failed });
    setQueues(prev => prev.map(q => q.id === queue.id ? { ...q, status: finalStatus, completed_jobs: completed, failed_jobs: failed } : q));
    setRunningQueueId(null);
  };

  const activeQueue = queues.find(q => q.id === activeQueueId);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                <ListChecks className="w-4 h-4" /> Simulation Queue Manager
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Batch Simulation Queue</h1>
              <p className="text-slate-500 mt-1 text-sm">Define multiple simulation jobs with varying parameters and run them as a batch.</p>
            </div>
            <Button
              onClick={() => setShowBuilder(true)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 text-white gap-2 font-bold">
              <Plus className="w-4 h-4" /> New Queue
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Queue List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide px-1">Your Queues</h2>
            {loadingQueues ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
              </div>
            ) : queues.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-slate-400">
                  <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No queues yet. Create one to get started.</p>
                </CardContent>
              </Card>
            ) : (
              queues.map(queue => {
                const s = STATUS_STYLES[queue.status] || STATUS_STYLES.draft;
                const Icon = s.icon;
                const progress = queue.total_jobs > 0
                  ? Math.round(((queue.completed_jobs || 0) / queue.total_jobs) * 100)
                  : 0;
                return (
                  <motion.div key={queue.id} layout>
                    <Card
                      onClick={() => setActiveQueueId(queue.id)}
                      className={`cursor-pointer transition-all border-2 ${activeQueueId === queue.id ? "border-violet-400 shadow-md" : "border-transparent hover:border-slate-200"}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{queue.name}</p>
                            {queue.description && <p className="text-xs text-slate-500 truncate">{queue.description}</p>}
                          </div>
                          <Badge className={`${s.color} flex-shrink-0 text-xs`}>
                            <Icon className={`w-3 h-3 mr-1 ${queue.status === "running" ? "animate-spin" : ""}`} />
                            {queue.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                          <FlaskConical className="w-3 h-3" />
                          {queue.total_jobs} jobs · {queue.completed_jobs || 0} done · {queue.failed_jobs || 0} failed
                        </div>
                        {queue.total_jobs > 0 && (
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${queue.status === "completed" ? "bg-green-500" : "bg-violet-500"}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          {(queue.status === "draft" || queue.status === "paused") && (
                            <Button size="sm"
                              onClick={e => { e.stopPropagation(); handleRunQueue(queue); }}
                              disabled={!!runningQueueId}
                              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1">
                              <Play className="w-3 h-3" />
                              {queue.status === "paused" ? "Resume" : "Run"}
                            </Button>
                          )}
                          {queue.status === "running" && (
                            <Button size="sm" disabled className="flex-1 text-xs gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Running…
                            </Button>
                          )}
                          {queue.status === "completed" && (
                            <Button size="sm" variant="outline"
                              onClick={e => { e.stopPropagation(); handleRunQueue(queue); }}
                              disabled={!!runningQueueId}
                              className="flex-1 text-xs gap-1">
                              <RotateCcw className="w-3 h-3" /> Re-run
                            </Button>
                          )}
                          <Button size="sm" variant="outline"
                            onClick={e => { e.stopPropagation(); handleDeleteQueue(queue.id); }}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 border-red-100 text-xs">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Queue Detail */}
          <div className="lg:col-span-2">
            {activeQueue ? (
              <QueueJobList
                queue={activeQueue}
                runningQueueId={runningQueueId}
                onViewResult={setViewResultsJob}
                onRefresh={fetchQueues}
              />
            ) : (
              <Card>
                <CardContent className="p-16 text-center text-slate-400">
                  <BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Select a queue to view its jobs and results.</p>
                  <p className="text-xs mt-1 text-slate-300">Or create a new queue with the button above.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Builder Modal */}
      <AnimatePresence>
        {showBuilder && (
          <QueueBuilder
            onClose={() => setShowBuilder(false)}
            onCreate={handleCreateQueue}
          />
        )}
      </AnimatePresence>

      {/* Results Modal */}
      <AnimatePresence>
        {viewResultsJob && (
          <QueueResultsModal
            job={viewResultsJob}
            onClose={() => setViewResultsJob(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}