import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import moment from 'moment';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminAnalyticsCards({ stats }) {
  // Rating distribution
  const ratingData = (stats.ratingDistribution || []).map((count, i) => ({
    name: `${i + 1} Star`,
    value: count,
  })).reverse();

  // Formula status
  const formulaStatusData = Object.entries(stats.formulaStatuses || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  // Demo statuses
  const demoStatusData = Object.entries(stats.demoStatuses || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  const recentSignups = stats.recentSignups || [];

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      {/* Rating Overview */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Review Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-slate-900">{stats.avgRating || '0'}</div>
            <div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i <= Math.round(stats.avgRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{stats.totals?.review || 0} total reviews</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {ratingData.map((item, i) => {
              const total = stats.totals?.review || 1;
              const pct = Math.round((item.value / total) * 100) || 0;
              return (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-10 text-slate-500">{item.name}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-slate-600 font-medium">{item.value}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Formula Status */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-800">Formula Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {formulaStatusData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div style={{ width: 120, height: 120 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={formulaStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={52}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {formulaStatusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {formulaStatusData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No formulas yet</p>
          )}

          {demoStatusData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">Demo Requests</p>
              <div className="flex gap-2 flex-wrap">
                {demoStatusData.map((item) => (
                  <Badge key={item.name} variant="secondary" className="text-xs">
                    {item.name}: {item.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Signups */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Recent Signups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSignups.length > 0 ? (
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto">
              {recentSignups.map((u, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(u.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-400">{moment(u.date).fromNow()}</p>
                    {u.role === 'admin' && (
                      <Badge className="text-[10px] bg-violet-100 text-violet-700 mt-0.5">Admin</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No signups yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}