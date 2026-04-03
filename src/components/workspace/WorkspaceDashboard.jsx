import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, ShieldCheck, Leaf, FlaskConical, ScanLine } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format, parseISO, startOfWeek } from 'date-fns';

const TOXICITY_COLORS = {
  safe: '#22c55e',
  moderate: '#f59e0b',
  hazardous: '#f97316',
  highly_hazardous: '#ef4444',
  unknown: '#94a3b8',
};

const ECO_COLORS = {
  low: '#02988C',
  medium: '#f59e0b',
  high: '#ef4444',
  unknown: '#94a3b8',
};

const TYPE_COLORS = {
  simulation: '#02988C',
  formula: '#9531F5',
  scan: '#09D2FF',
  compliance: '#f97316',
};

const TYPE_ICONS = {
  simulation: FlaskConical,
  formula: ShieldCheck,
  scan: ScanLine,
  compliance: Leaf,
};

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`} style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function WorkspaceDashboard({ sessions }) {
  // --- Stats ---
  const totalSessions = sessions.length;
  const typeCounts = useMemo(() => {
    const counts = {};
    sessions.forEach(s => { counts[s.type] = (counts[s.type] || 0) + 1; });
    return counts;
  }, [sessions]);

  // --- Toxicity breakdown from snapshots ---
  const toxicityData = useMemo(() => {
    const counts = { safe: 0, moderate: 0, hazardous: 0, highly_hazardous: 0, unknown: 0 };
    sessions.forEach(s => {
      const risk = s.snapshot?.risk_score ?? s.snapshot?.overall_risk_score;
      if (risk !== undefined) {
        if (risk <= 25) counts.safe++;
        else if (risk <= 50) counts.moderate++;
        else if (risk <= 75) counts.hazardous++;
        else counts.highly_hazardous++;
      } else {
        counts.unknown++;
      }
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ name: key.replace(/_/g, ' '), value, fill: TOXICITY_COLORS[key] }));
  }, [sessions]);

  // --- Sessions over time (weekly) ---
  const weeklyData = useMemo(() => {
    if (!sessions.length) return [];
    const byWeek = {};
    sessions.forEach(s => {
      const week = format(startOfWeek(new Date(s.created_date)), 'MMM d');
      if (!byWeek[week]) byWeek[week] = { week, simulation: 0, formula: 0, scan: 0, compliance: 0, total: 0 };
      byWeek[week][s.type] = (byWeek[week][s.type] || 0) + 1;
      byWeek[week].total++;
    });
    return Object.values(byWeek).slice(-8);
  }, [sessions]);

  // --- Risk trend over time ---
  const riskTrendData = useMemo(() => {
    return sessions
      .filter(s => s.snapshot?.risk_score !== undefined || s.snapshot?.overall_risk_score !== undefined)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      .map(s => ({
        date: format(new Date(s.created_date), 'MMM d'),
        risk: s.snapshot?.risk_score ?? s.snapshot?.overall_risk_score ?? 0,
        name: s.title,
      }));
  }, [sessions]);

  // --- Trend direction ---
  const riskTrend = useMemo(() => {
    if (riskTrendData.length < 2) return null;
    const first = riskTrendData.slice(0, Math.ceil(riskTrendData.length / 2)).reduce((a, b) => a + b.risk, 0) / Math.ceil(riskTrendData.length / 2);
    const last = riskTrendData.slice(-Math.ceil(riskTrendData.length / 2)).reduce((a, b) => a + b.risk, 0) / Math.ceil(riskTrendData.length / 2);
    return last < first ? 'improving' : last > first ? 'worsening' : 'stable';
  }, [riskTrendData]);

  const avgRisk = riskTrendData.length
    ? Math.round(riskTrendData.reduce((a, b) => a + b.risk, 0) / riskTrendData.length)
    : null;

  if (!sessions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <TrendingUp className="w-12 h-12 text-slate-200 mb-3" />
        <p className="text-slate-500 font-semibold">No data yet</p>
        <p className="text-slate-400 text-sm mt-1">Save sessions to your workspace to see trends here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 overflow-y-auto">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Sessions" value={totalSessions} icon={FlaskConical} color="#9531F5" />
        {Object.entries(typeCounts).map(([type, count]) => {
          const Icon = TYPE_ICONS[type] || FlaskConical;
          return (
            <StatCard key={type} label={`${type.charAt(0).toUpperCase() + type.slice(1)} Sessions`} value={count} icon={Icon} color={TYPE_COLORS[type]} />
          );
        })}
        {avgRisk !== null && (
          <StatCard
            label="Avg Risk Score"
            value={`${avgRisk}/100`}
            sub={riskTrend === 'improving' ? '↓ Improving' : riskTrend === 'worsening' ? '↑ Worsening' : '→ Stable'}
            icon={riskTrend === 'improving' ? TrendingDown : riskTrend === 'worsening' ? TrendingUp : Minus}
            color={riskTrend === 'improving' ? '#22c55e' : riskTrend === 'worsening' ? '#ef4444' : '#94a3b8'}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Trend Over Time */}
        {riskTrendData.length > 1 && (
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <h3 className="text-sm font-bold text-slate-700">Safety Risk Trend</h3>
              <p className="text-xs text-slate-400">Risk score per saved session (lower = safer)</p>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={riskTrendData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9531F5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#9531F5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="risk" name="Risk Score" stroke="#9531F5" fill="url(#riskGrad)" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Toxicity Breakdown */}
        {toxicityData.length > 0 && (
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <h3 className="text-sm font-bold text-slate-700">Toxicity Distribution</h3>
              <p className="text-xs text-slate-400">Breakdown of saved sessions by safety level</p>
            </CardHeader>
            <CardContent className="px-2 pb-4 flex items-center justify-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={toxicityData} cx="40%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {toxicityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Sessions by Type Over Time */}
        {weeklyData.length > 1 && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2 pt-4 px-4">
              <h3 className="text-sm font-bold text-slate-700">Sessions Over Time</h3>
              <p className="text-xs text-slate-400">Weekly activity by session type</p>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  {Object.keys(TYPE_COLORS).map(type => (
                    <Bar key={type} dataKey={type} stackId="a" fill={TYPE_COLORS[type]} name={type.charAt(0).toUpperCase() + type.slice(1)} radius={type === 'compliance' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}