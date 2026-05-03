import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";

const ENGINE_COLORS = [
  "#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626",
  "#0891b2", "#7c3aed", "#16a34a", "#9333ea", "#0284c7",
];

export default function EngineSuccessChart({ jobs }) {
  const data = useMemo(() => {
    const engines = {};
    jobs.forEach(job => {
      const eng = job.engine || "Unknown";
      if (!engines[eng]) engines[eng] = { engine: eng, completed: 0, failed: 0, pending: 0 };
      if (job.status === "completed") engines[eng].completed += 1;
      else if (job.status === "failed") engines[eng].failed += 1;
      else engines[eng].pending += 1;
    });
    return Object.values(engines).map(e => ({
      ...e,
      successRate: e.completed + e.failed > 0
        ? Math.round((e.completed / (e.completed + e.failed)) * 100)
        : null,
    })).sort((a, b) => (b.completed + b.failed) - (a.completed + a.failed));
  }, [jobs]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-center h-48 text-slate-400 text-sm">
        No engine data yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-1">Success Rate by Engine</h3>
      <p className="text-xs text-slate-500 mb-4">Completed vs. failed jobs per simulation engine</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="engine" tick={{ fontSize: 10 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value, name, props) => {
              if (name === "% Success") return [`${value}%`, name];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Success rate badges */}
      <div className="flex flex-wrap gap-2 mt-3">
        {data.map((e, i) => e.successRate !== null && (
          <span key={e.engine} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: ENGINE_COLORS[i % ENGINE_COLORS.length] + "22", color: ENGINE_COLORS[i % ENGINE_COLORS.length] }}>
            {e.engine}: {e.successRate}%
          </span>
        ))}
      </div>
    </div>
  );
}