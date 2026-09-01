import React, { useState, useContext, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AuthContext from "../components/auth/AuthContext";
import AuthGate from "../components/auth/AuthGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Send, Eye, LogOut, RotateCw, Download, Trash2, Play, Pause,
  Clock, CheckCircle2, AlertCircle, Loader2, TrendingUp, FileText,
  Activity, Server, ChevronDown, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const JOB_STATUS_CONFIG = {
  Submitted: { color: "bg-slate-600", icon: Clock, label: "Submitted" },
  Queued: { color: "bg-yellow-600", icon: Clock, label: "Queued" },
  Running: { color: "bg-blue-600", icon: Activity, label: "Running" },
  Completed: { color: "bg-green-600", icon: CheckCircle2, label: "Completed" },
  Failed: { color: "bg-red-600", icon: AlertCircle, label: "Failed" },
  Cancelled: { color: "bg-gray-600", icon: LogOut, label: "Cancelled" },
};

const CLUSTER_PRESETS = [
  { name: "XSEDE (PSC Bridges)", url: "bridges.psc.edu", queues: ["gpu", "cpu", "long"] },
  { name: "NERSC (Perlmutter)", url: "perlmutter.nersc.gov", queues: ["gpu", "cpu", "interactive"] },
  { name: "TACC (Stampede3)", url: "stampede3.tacc.utexas.edu", queues: ["gpudev", "gpu", "cpu"] },
  { name: "Local Cluster", url: "localhost", queues: ["default", "gpu"] },
];

export default function HPCJobManagement() {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [pollingActive, setPollingActive] = useState({});
  const [scriptContent, setScriptContent] = useState("");
  const [jobName, setJobName] = useState("");
  const [scriptType, setScriptType] = useState("ORCA");
  const [clusterName, setClusterName] = useState("XSEDE (PSC Bridges)");
  const [clusterUrl, setClusterUrl] = useState("bridges.psc.edu");
  const [queueName, setQueueName] = useState("gpu");
  const [numCores, setNumCores] = useState(16);
  const [wallTime, setWallTime] = useState("04:00:00");
  const [gpuRequested, setGpuRequested] = useState(true);

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  // Auto-poll running jobs
  useEffect(() => {
    const interval = setInterval(() => {
      jobs.forEach(job => {
        if (["Submitted", "Queued", "Running"].includes(job.status)) {
          pollJobStatus(job.id, job.job_id);
        }
      });
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [jobs]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobList = await base44.entities.HPCJob.list('-created_date', 50);
      setJobs(jobList || []);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitJob = async () => {
    if (!jobName || !scriptContent) {
      alert("Please fill in job name and script content");
      return;
    }

    try {
      const response = await base44.functions.invoke('submitHPCJob', {
        jobName,
        scriptContent,
        scriptType,
        clusterName,
        clusterUrl,
        queueName,
        numCores: parseInt(numCores),
        wallTime,
        gpuRequested,
      });

      if (response.jobRecord) {
        setJobs([response.jobRecord, ...jobs]);
        setShowSubmitModal(false);
        // Reset form
        setJobName("");
        setScriptContent("");
        setPollingActive({ ...pollingActive, [response.jobRecord.id]: true });
      }
    } catch (error) {
      alert("Failed to submit job: " + error.message);
    }
  };

  const pollJobStatus = async (jobRecordId, jobClusterId) => {
    try {
      const response = await base44.functions.invoke('pollJobStatus', {
        jobId: jobClusterId,
      });

      if (response.job) {
        setJobs(jobs.map(j => j.id === jobRecordId ? response.job : j));
      }
    } catch (error) {
      console.error(`Failed to poll job ${jobClusterId}:`, error);
    }
  };

  const parseJobOutput = async (jobRecordId, job) => {
    if (!job.output_logs) {
      alert("No output logs available for this job");
      return;
    }

    try {
      const response = await base44.functions.invoke('parseJobOutput', {
        jobId: job.job_id,
        outputLog: job.output_logs,
      });

      if (response.job) {
        setJobs(jobs.map(j => j.id === jobRecordId ? response.job : j));
        alert("Job output parsed successfully!");
      }
    } catch (error) {
      alert("Failed to parse output: " + error.message);
    }
  };

  const deleteJob = async (jobId) => {
    if (!confirm("Delete this job record?")) return;
    try {
      await base44.entities.HPCJob.delete(jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (error) {
      alert("Failed to delete job: " + error.message);
    }
  };

  const downloadScript = (job) => {
    const ext = job.script_type === "VASP" ? "INCAR" : "sh";
    const blob = new Blob([job.script_content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${job.job_name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <AuthGate featureName="HPC Job Management">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">HPC Job Manager</h1>
              <p className="text-slate-600 text-sm">Submit, monitor & parse computational jobs on remote clusters</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowSubmitModal(true)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-2"
            >
              <Send className="w-4 h-4" /> Submit New Job
            </Button>
            <Button onClick={loadJobs} variant="outline" className="gap-2">
              <RotateCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Jobs", count: jobs.length, icon: Server, color: "text-slate-600" },
            { label: "Running", count: jobs.filter(j => j.status === "Running").length, icon: Activity, color: "text-blue-600" },
            { label: "Completed", count: jobs.filter(j => j.status === "Completed").length, icon: CheckCircle2, color: "text-green-600" },
            { label: "Failed", count: jobs.filter(j => j.status === "Failed").length, icon: AlertCircle, color: "text-red-600" },
          ].map((stat, i) => (
            <Card key={i} className="bg-gradient-to-br from-slate-50 to-slate-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Jobs List */}
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="p-8 text-center">
                <Server className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium mb-1">No HPC jobs yet</p>
                <p className="text-slate-500 text-sm mb-4">Submit a simulation script to get started</p>
                <Button onClick={() => setShowSubmitModal(true)} variant="outline">
                  <Send className="w-4 h-4 mr-2" /> Submit First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            jobs.map(job => {
              const StatusIcon = JOB_STATUS_CONFIG[job.status]?.icon || Activity;
              const statusColor = JOB_STATUS_CONFIG[job.status]?.color;
              const isExpanded = expandedJobId === job.id;

              return (
                <motion.div key={job.id} layout>
                  <Card className="border-l-4 border-l-slate-300 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      {/* Main Row */}
                      <div
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                      >
                        <div className={`w-3 h-3 rounded-full ${statusColor}`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-slate-900 truncate">{job.job_name}</h3>
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                              {job.script_type}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-slate-500">
                            <span>{job.cluster_name}</span>
                            <span>ID: {job.job_id.substring(0, 12)}...</span>
                            {job.submit_timestamp && (
                              <span>{new Date(job.submit_timestamp).toLocaleString()}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-lg">
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm font-semibold text-slate-700">{job.status}</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </div>

                      {/* Progress Bar (if running) */}
                      {job.status === "Running" && (
                        <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                          <div className="h-full bg-blue-500 rounded-full w-3/4 animate-pulse" />
                        </div>
                      )}

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-slate-200 space-y-4"
                          >
                            {/* Job Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <p className="text-xs text-slate-600">Cores</p>
                                <p className="text-sm font-semibold text-slate-900">{job.num_cores || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-600">Wall Time</p>
                                <p className="text-sm font-semibold text-slate-900">{job.wall_time || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-600">GPU</p>
                                <p className="text-sm font-semibold text-slate-900">{job.gpu_requested ? "Yes" : "No"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-600">CPU Hours</p>
                                <p className="text-sm font-semibold text-slate-900">{job.cpu_hours_used?.toFixed(2) || ":"}</p>
                              </div>
                            </div>

                            {/* Parsed Results */}
                            {job.parsed_results && (
                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span className="text-sm font-semibold text-emerald-900">Parsed Results</span>
                                </div>
                                <pre className="text-xs text-emerald-700 overflow-x-auto bg-white p-2 rounded border border-emerald-200 max-h-40 overflow-y-auto">
                                  {JSON.stringify(job.parsed_results.extractedData, null, 2)}
                                </pre>
                              </div>
                            )}

                            {/* Output Logs (truncated) */}
                            {job.output_logs && (
                              <div className="bg-slate-800 rounded-lg p-3">
                                <p className="text-xs font-semibold text-slate-300 mb-2">Output Logs</p>
                                <pre className="text-xs text-slate-400 overflow-x-auto max-h-32 overflow-y-auto">
                                  {job.output_logs.split('\n').slice(-10).join('\n')}
                                </pre>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              <Button onClick={() => downloadScript(job)} variant="outline" size="sm" className="gap-1.5">
                                <Download className="w-3.5 h-3.5" /> Script
                              </Button>
                              {job.status === "Completed" && !job.parsed_results && (
                                <Button onClick={() => parseJobOutput(job.id, job)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                                  <FileText className="w-3.5 h-3.5" /> Parse Output
                                </Button>
                              )}
                              <Button onClick={() => deleteJob(job.id)} variant="outline" size="sm" className="gap-1.5 text-red-600 hover:text-red-700">
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Send className="w-6 h-6" />
                <h2 className="text-xl font-bold">Submit HPC Job</h2>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Job Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">Job Name</label>
                <input
                  type="text"
                  value={jobName}
                  onChange={e => setJobName(e.target.value)}
                  placeholder="e.g., DFT-Optimization-01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none"
                />
              </div>

              {/* Script Type & Cluster */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Script Type</label>
                  <select value={scriptType} onChange={e => setScriptType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none">
                    {["ORCA", "GROMACS", "VASP", "Quantum ESPRESSO", "AMBER", "AutoDock", "Other"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Cluster</label>
                  <select value={clusterName} onChange={e => {
                    const preset = CLUSTER_PRESETS.find(p => p.name === e.target.value);
                    if (preset) {
                      setClusterName(preset.name);
                      setClusterUrl(preset.url);
                      setQueueName(preset.queues[0]);
                    }
                  }} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none">
                    {CLUSTER_PRESETS.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resources */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">CPU Cores</label>
                  <input type="number" value={numCores} onChange={e => setNumCores(e.target.value)} min="1" max="256"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Wall Time</label>
                  <input type="text" value={wallTime} onChange={e => setWallTime(e.target.value)} placeholder="HH:MM:SS"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={gpuRequested} onChange={e => setGpuRequested(e.target.checked)} className="w-4 h-4" />
                    <span className="text-sm font-semibold text-slate-900">GPU</span>
                  </label>
                </div>
              </div>

              {/* Script Content */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">Script Content</label>
                <textarea
                  value={scriptContent}
                  onChange={e => setScriptContent(e.target.value)}
                  placeholder="Paste your simulation script here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none font-mono text-xs"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => setShowSubmitModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={submitJob} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-2">
                  <Send className="w-4 h-4" /> Submit Job
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AuthGate>
  );
}