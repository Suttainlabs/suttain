import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-200 text-xs">
        <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-600">{p.name}:</span>
            <span className="font-semibold text-slate-900">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminActivityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        No activity data available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorFormulas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSimulations" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#94a3b8" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false}
          interval="preserveStartEnd"
          tickMargin={8}
        />
        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          iconType="circle"
          iconSize={8}
        />
        <Area type="monotone" dataKey="Users" stroke="#3b82f6" strokeWidth={2} fill="url(#colorUsers)" dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
        <Area type="monotone" dataKey="Formulas" stroke="#10b981" strokeWidth={2} fill="url(#colorFormulas)" dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
        <Area type="monotone" dataKey="Simulations" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorSimulations)" dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
        <Area type="monotone" dataKey="Scans" stroke="#06b6d4" strokeWidth={2} fill="url(#colorScans)" dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}