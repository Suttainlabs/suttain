import React from "react";
import { CheckCircle2, XCircle, Clock, Zap, TrendingUp, Layers } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color }) {
  if (!Icon) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function ProductivityStats({ jobs, queues }) {
  const total = jobs.length;
  const completed = jobs.filter(j => j.status === "completed").length;
  const failed = jobs.filter(j => j.status === "failed").length;
  const pending = jobs.filter(j => j.status === "pending").length;
  const running = jobs.filter(j => j.status === "running").length;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalQueues = queues.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard icon={Layers} label="Total Jobs" value={total} sub={`${totalQueues} queues`} color="bg-violet-500" />
      <StatCard icon={CheckCircle2} label="Completed" value={completed} sub="successfully" color="bg-emerald-500" />
      <StatCard icon={XCircle} label="Failed" value={failed} sub="need review" color="bg-red-500" />
      <StatCard icon={Clock} label="Pending" value={pending} sub={`${running} running`} color="bg-amber-500" />
      <StatCard icon={TrendingUp} label="Success Rate" value={`${successRate}%`} sub="of all jobs" color="bg-blue-500" />
      <StatCard icon={Zap} label="Throughput" value={`${completed}`} sub="jobs done total" color="bg-fuchsia-500" />
    </div>
  );
}