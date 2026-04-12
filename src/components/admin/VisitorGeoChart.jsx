import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Loader2, MapPin } from 'lucide-react';
import { getVisitorGeoStats } from '@/functions/getVisitorGeoStats';

const COLORS = [
  '#02988C', '#9531F5', '#09D2FF', '#f59e0b', '#ef4444',
  '#10b981', '#6366f1', '#f97316', '#ec4899', '#14b8a6',
  '#8b5cf6', '#84cc16', '#0ea5e9', '#a855f7', '#22c55e'
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    const total = payload[0].payload.total;
    const pct = total ? ((value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-slate-800">{name}</p>
        <p className="text-slate-500">{value.toLocaleString()} visits · <span className="text-suttain-teal font-medium">{pct}%</span></p>
      </div>
    );
  }
  return null;
};

export default function VisitorGeoChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVisitorGeoStats()
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to load geo stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const total = data?.total || 0;
  const countries = (data?.countries || []).map(c => ({ ...c, total }));
  const regions = data?.regions || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart — Countries */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-suttain-teal" />
            Visitors by Country
            {!loading && <span className="ml-auto text-xs font-normal text-slate-400">{total.toLocaleString()} total</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : countries.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No visitor data yet</div>
          ) : (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countries}
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    innerRadius={45}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={2}
                  >
                    {countries.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Regions — Bar-style list */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-suttain-purple" />
            Top Regions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : regions.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No region data yet</div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {regions.map((region, i) => {
                const pct = total ? (region.value / total) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium truncate pr-2">{region.name}</span>
                      <span className="text-slate-500 flex-shrink-0">{region.value.toLocaleString()} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}