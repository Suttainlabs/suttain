import React, { useMemo } from "react";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function OptimizationTips({ jobs }) {
  const tips = useMemo(() => {
    const result = [];
    const total = jobs.length;
    const failed = jobs.filter(j => j.status === "failed").length;
    const failRate = total > 0 ? (failed / total) * 100 : 0;

    // Engine-level analysis
    const engineStats = {};
    jobs.forEach(j => {
      const e = j.engine || "Unknown";
      if (!engineStats[e]) engineStats[e] = { total: 0, failed: 0 };
      engineStats[e].total += 1;
      if (j.status === "failed") engineStats[e].failed += 1;
    });
    const worstEngine = Object.entries(engineStats)
      .filter(([, s]) => s.total >= 2)
      .sort((a, b) => (b[1].failed / b[1].total) - (a[1].failed / a[1].total))[0];

    if (failRate > 30) {
      result.push({ type: "warning", icon: AlertTriangle, text: `High failure rate (${Math.round(failRate)}%). Review job parameters and input files before scheduling new batches.` });
    }
    if (worstEngine && (worstEngine[1].failed / worstEngine[1].total) > 0.5) {
      result.push({ type: "warning", icon: AlertTriangle, text: `Engine "${worstEngine[0]}" has >50% failure rate. Consider switching to an alternative engine for these job types.` });
    }

    // Pending jobs
    const pending = jobs.filter(j => j.status === "pending").length;
    if (pending > 10) {
      result.push({ type: "info", icon: TrendingUp, text: `${pending} jobs are pending. Consider splitting into smaller queues of 5–8 jobs for faster turnaround and easier debugging.` });
    }

    // All good
    const successRate = total > 0 ? ((jobs.filter(j => j.status === "completed").length / total) * 100) : 0;
    if (successRate >= 80 && total > 5) {
      result.push({ type: "success", icon: CheckCircle2, text: `Excellent throughput! ${Math.round(successRate)}% success rate. Your current scheduling strategy is working well.` });
    }

    if (result.length === 0) {
      result.push({ type: "info", icon: Lightbulb, text: "Run more simulations to get personalized optimization recommendations based on your engine and job type patterns." });
    }

    return result;
  }, [jobs]);

  const styles = {
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h3 className="text-base font-bold text-slate-900">Scheduling Optimization Tips</h3>
      </div>
      <div className="space-y-3">
        {tips.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <div key={i} className={`flex items-start gap-3 border rounded-lg px-4 py-3 text-sm ${styles[tip.type]}`}>
              <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{tip.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}