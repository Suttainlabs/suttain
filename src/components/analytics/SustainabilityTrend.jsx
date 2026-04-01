import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { Leaf } from "lucide-react";
import moment from "moment";

export default function SustainabilityTrend({ profiles }) {
  const data = (profiles || [])
    .filter(p => p.overall_score != null && p.created_date)
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .slice(-20)
    .map(p => ({
      label: moment(p.created_date).format("MMM D"),
      score: p.overall_score,
    }));

  const avg = data.length
    ? Math.round(data.reduce((s, d) => s + d.score, 0) / data.length)
    : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            <CardTitle className="text-lg">Sustainability Score Trend</CardTitle>
          </div>
          {avg !== null && (
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              avg >= 70 ? "bg-green-100 text-green-700" :
              avg >= 40 ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              Avg: {avg}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500">How eco-friendly your formulas are over time</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No sustainability data yet. Generate formulas to track your eco progress.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}/100`, "Score"]} />
              {avg !== null && (
                <ReferenceLine y={avg} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: `Avg ${avg}`, position: "right", fontSize: 11, fill: "#94a3b8" }} />
              )}
              <Line
                type="monotone"
                dataKey="score"
                name="Eco Score"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#22c55e" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}