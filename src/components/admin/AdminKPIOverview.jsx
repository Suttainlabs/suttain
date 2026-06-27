import React from 'react';
import { TrendingUp, Users, Zap, Activity } from 'lucide-react';

const KPI_ITEMS = [
  {
    icon: Users,
    label: 'Active Subscriptions',
    getValue: (stats) => stats?.activeSubscriptions || 0,
    trend: '+12%',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    icon: Activity,
    label: 'Daily Active Users',
    getValue: (stats) => stats?.dailyActiveUsers || 0,
    trend: '+8%',
    color: 'from-cyan-600 to-blue-600',
  },
  {
    icon: Zap,
    label: 'Molecular Analyses',
    getValue: (stats) => (stats?.totalAnalyses || 0).toLocaleString(),
    trend: '+24%',
    color: 'from-violet-600 to-purple-600',
  },
  {
    icon: TrendingUp,
    label: 'System Health',
    getValue: (stats) => `${stats?.systemHealth || 98}%`,
    trend: 'Operational',
    color: 'from-orange-600 to-red-600',
  },
];

export default function AdminKPIOverview({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {KPI_ITEMS.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i} className="group bg-gradient-to-br from-[#0F1419] to-[#161B26] border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                {item.trend}
              </span>
            </div>

            {/* Content */}
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-semibold">{item.label}</p>
            <p className="text-3xl font-black text-slate-100 mb-3">{item.getValue(stats)}</p>

            {/* Sparkline placeholder */}
            <div className="h-8 bg-slate-900/50 rounded flex items-end gap-1 px-2">
              {[40, 50, 35, 60, 45, 55, 48].map((h, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-t bg-gradient-to-t ${item.color}`}
                  style={{ height: `${h}%`, opacity: 0.7 }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}