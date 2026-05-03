import React, { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export default function ThroughputChart({ jobs }) {
  const data = useMemo(() => {
    const days = 14;
    const buckets = {};
    for (let i = days - 1; i >= 0; i--) {
      const key = format(subDays(new Date(), i), "MMM d");
      buckets[key] = { date: key, completed: 0, failed: 0, total: 0 };
    }

    jobs.forEach(job => {
      const d = job.updated_date || job.created_date;
      if (!d) return;
      const key = format(new Date(d), "MMM d");
      if (buckets[key]) {
        buckets[key].total += 1;
        if (job.status === "completed") buckets[key].completed += 1;
        if (job.status === "failed") buckets[key].failed += 1;
      }
    });

    return Object.values(buckets);
  }, [jobs]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-1">Simulation Throughput</h3>
      <p className="text-xs text-slate-500 mb-4">Jobs completed & failed over the last 14 days</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fill="url(#gradCompleted)" strokeWidth={2} />
          <Area type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" fill="url(#gradFailed)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}