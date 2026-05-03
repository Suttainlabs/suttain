import React, { useMemo } from "react";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, label: "Completed", className: "bg-emerald-100 text-emerald-700" },
  failed: { icon: XCircle, label: "Failed", className: "bg-red-100 text-red-700" },
  running: { icon: Loader2, label: "Running", className: "bg-blue-100 text-blue-700", spin: true },
  pending: { icon: Clock, label: "Pending", className: "bg-amber-100 text-amber-700" },
  draft: { icon: AlertCircle, label: "Draft", className: "bg-slate-100 text-slate-600" },
};

export default function QueueSchedulingTable({ queues, jobs }) {
  const rows = useMemo(() => {
    return queues.map(q => {
      const qJobs = jobs.filter(j => j.queue_id === q.id);
      const done = qJobs.filter(j => j.status === "completed").length;
      const failed = qJobs.filter(j => j.status === "failed").length;
      const total = qJobs.length;
      const rate = total > 0 ? Math.round((done / total) * 100) : 0;
      // Estimate compute time: assume ~5 min per completed job (proxy)
      const estMinutes = done * 5;
      return { ...q, jobCount: total, done, failed, rate, estMinutes };
    }).sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date));
  }, [queues, jobs]);

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-center text-slate-400 text-sm py-10">
        No queues found. Create a batch queue in the Simulation Queue Manager.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">Queue Scheduling Overview</h3>
        <p className="text-xs text-slate-500 mt-0.5">Optimization hints for batch scheduling</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Queue Name", "Status", "Jobs", "Done", "Failed", "Success %", "Est. Compute", "Created"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((q, i) => {
              const cfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.draft;
              const Icon = cfg.icon;
              return (
                <tr key={q.id} className={`border-b border-slate-100 hover:bg-slate-50 ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[180px] truncate">{q.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.className}`}>
                      <Icon className={`w-3 h-3 ${cfg.spin ? "animate-spin" : ""}`} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{q.jobCount}</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">{q.done}</td>
                  <td className="px-4 py-3 text-red-500">{q.failed}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${q.rate}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${q.rate >= 80 ? "text-emerald-600" : q.rate >= 50 ? "text-amber-600" : "text-red-500"}`}>{q.rate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-mono whitespace-nowrap">
                    {q.estMinutes >= 60 ? `${(q.estMinutes / 60).toFixed(1)} hr` : `${q.estMinutes} min`}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {q.created_date ? format(new Date(q.created_date), "MMM d, yyyy") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}