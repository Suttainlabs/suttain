import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminAnalyticsChart({ stats, dateRange }) {
  const chartData = [
    { date: 'Mon', registrations: 120, apiCalls: 2400, analyses: 450 },
    { date: 'Tue', registrations: 150, apiCalls: 2210, analyses: 520 },
    { date: 'Wed', registrations: 180, apiCalls: 2290, analyses: 610 },
    { date: 'Thu', registrations: 140, apiCalls: 2000, analyses: 480 },
    { date: 'Fri', registrations: 200, apiCalls: 2181, analyses: 750 },
    { date: 'Sat', registrations: 90, apiCalls: 2500, analyses: 350 },
    { date: 'Sun', registrations: 110, apiCalls: 2100, analyses: 400 },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
          <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              background: '#0F1419',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Line type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="apiCalls" stroke="#06b6d4" strokeWidth={2} dot={false} opacity={0.7} />
          <Line type="monotone" dataKey="analyses" stroke="#8b5cf6" strokeWidth={2} dot={false} opacity={0.7} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}