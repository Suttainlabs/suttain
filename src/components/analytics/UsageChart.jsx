import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import moment from "moment";

export default function UsageChart({ simulations, formulas, scans }) {
  // Group all activity by month
  const monthMap = {};

  const addToMonth = (items, key) => {
    (items || []).forEach(item => {
      const month = moment(item.created_date).format("YYYY-MM");
      if (!monthMap[month]) monthMap[month] = { month, simulations: 0, formulas: 0, scans: 0 };
      monthMap[month][key]++;
    });
  };

  addToMonth(simulations, "simulations");
  addToMonth(formulas, "formulas");
  addToMonth(scans, "scans");

  const data = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)
    .map(d => ({ ...d, label: moment(d.month, "YYYY-MM").format("MMM YY") }));

  const totalActivity = (simulations?.length || 0) + (formulas?.length || 0) + (scans?.length || 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--suttain-teal)]" />
          <CardTitle className="text-lg">Activity Over Time</CardTitle>
        </div>
        <p className="text-sm text-slate-500">{totalActivity} total actions across all tools</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No activity yet. Start using tools to see your trends here.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#02988C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#02988C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="formGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9531F5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9531F5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#09D2FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#09D2FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="simulations" name="Simulations" stroke="#02988C" fill="url(#simGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="formulas" name="Formulas" stroke="#9531F5" fill="url(#formGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="scans" name="Scans" stroke="#09D2FF" fill="url(#scanGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}