import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Globe, Monitor, RefreshCw, Users, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ACTIVE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes = "active right now"
const POLL_INTERVAL_MS = 15000;

const TIME_RANGES = [
  { label: '30 min', value: '30min' },
  { label: '24 hours', value: '24h' },
  { label: '7 days', value: '7d' },
];

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function buildBuckets(logs, range) {
  const now = Date.now();

  if (range === '30min') {
    // 30 buckets of 1 minute each
    const buckets = {};
    for (let i = 29; i >= 0; i--) {
      const t = new Date(now - i * 60000);
      const key = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      buckets[key] = 0;
    }
    logs.forEach(log => {
      const ts = new Date(log.last_seen || log.created_date).getTime();
      const diffMin = Math.floor((now - ts) / 60000);
      if (diffMin < 0 || diffMin > 29) return;
      const t = new Date(now - diffMin * 60000);
      const key = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (key in buckets) buckets[key]++;
    });
    return Object.entries(buckets).map(([time, visitors]) => ({ time, visitors }));
  }

  if (range === '24h') {
    // 24 buckets of 1 hour each
    const buckets = {};
    for (let i = 23; i >= 0; i--) {
      const t = new Date(now - i * 3600000);
      const key = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      buckets[key] = 0;
    }
    const cutoff = now - 24 * 3600000;
    logs.forEach(log => {
      const ts = new Date(log.last_seen || log.created_date).getTime();
      if (ts < cutoff || ts > now) return;
      const diffHr = Math.floor((now - ts) / 3600000);
      if (diffHr < 0 || diffHr > 23) return;
      const t = new Date(now - diffHr * 3600000);
      const key = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (key in buckets) buckets[key]++;
    });
    return Object.entries(buckets).map(([time, visitors]) => ({ time, visitors }));
  }

  // 7 days — 7 buckets of 1 day each
  const buckets = {};
  for (let i = 6; i >= 0; i--) {
    const t = new Date(now - i * 86400000);
    const key = t.toLocaleDateString([], { month: 'short', day: 'numeric' });
    buckets[key] = 0;
  }
  const cutoff7 = now - 7 * 86400000;
  logs.forEach(log => {
    const ts = new Date(log.last_seen || log.created_date).getTime();
    if (ts < cutoff7 || ts > now) return;
    const diffDay = Math.floor((now - ts) / 86400000);
    if (diffDay < 0 || diffDay > 6) return;
    const t = new Date(now - diffDay * 86400000);
    const key = t.toLocaleDateString([], { month: 'short', day: 'numeric' });
    if (key in buckets) buckets[key]++;
  });
  return Object.entries(buckets).map(([time, visitors]) => ({ time, visitors }));
}

function getLogsInRange(logs, range) {
  const now = Date.now();
  const cutoffs = { '30min': ACTIVE_WINDOW_MS, '24h': 86400000, '7d': 7 * 86400000 };
  const cutoff = now - cutoffs[range];
  return logs.filter(log => {
    const ts = new Date(log.last_seen || log.created_date).getTime();
    return ts >= cutoff;
  });
}

function getActiveLogs(logs) {
  const cutoff = Date.now() - ACTIVE_WINDOW_MS;
  return logs.filter(log => new Date(log.last_seen || log.created_date).getTime() >= cutoff);
}

function topPages(filteredLogs) {
  const counts = {};
  filteredLogs.forEach(log => {
    const p = log.current_page || log.page || '/';
    counts[p] = (counts[p] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([page, count]) => ({ page, count }));
}

function topCountries(filteredLogs) {
  const counts = {};
  filteredLogs.forEach(log => {
    const c = log.country || 'Unknown';
    counts[c] = (counts[c] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([country, count]) => ({ country, count }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-teal-600 font-bold">{payload[0].value} visitors</p>
    </div>
  );
};

const rangeLabels = { '30min': '30 Minutes', '24h': '24 Hours', '7d': '7 Days' };
const sessionLabels = { '30min': 'last 30 min', '24h': 'last 24 hours', '7d': 'last 7 days' };

export default function RealTimeTrafficPanel() {
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [range, setRange] = useState('30min');
  const intervalRef = useRef(null);

  const fetchLogs = async () => {
    try {
      const logs = await base44.entities.VisitorLog.list('-updated_date', 2000);
      setAllLogs(logs || []);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('RealTimeTrafficPanel fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    intervalRef.current = setInterval(fetchLogs, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  const activeLogs = getActiveLogs(allLogs);
  const filteredLogs = getLogsInRange(allLogs, range);
  const sparkline = buildBuckets(allLogs, range);
  const pages = topPages(filteredLogs);
  const countries = topCountries(filteredLogs);
  const maxPageCount = pages[0]?.count || 1;
  const activeCount = activeLogs.length;
  const totalSessions = sparkline.reduce((a, b) => a + b.visitors, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Traffic Analytics</h2>
          <span className="text-xs text-slate-400 font-medium">— updates every 15s</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {TIME_RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  range === r.value
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {lastUpdated && <span className="cursor-default select-none">Updated {formatTime(lastUpdated)}</span>}
            <button onClick={fetchLogs} className="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-xs text-slate-400">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200 shadow-sm bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-teal-100 text-sm font-medium">Active Right Now</p>
              <Wifi className="w-5 h-5 text-teal-200" />
            </div>
            {loading ? (
              <div className="h-12 w-20 bg-white/20 rounded-lg animate-pulse" />
            ) : (
              <p className="text-5xl font-bold tracking-tight">{activeCount}</p>
            )}
            <p className="text-teal-100 text-xs mt-1">visitors in last 5 minutes</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-500 text-sm font-medium">Sessions ({rangeLabels[range]})</p>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            {loading ? (
              <div className="h-10 w-16 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <p className="text-4xl font-bold text-slate-900">{totalSessions}</p>
            )}
            <p className="text-slate-400 text-xs mt-1">{sessionLabels[range]}</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-500 text-sm font-medium">Countries ({rangeLabels[range]})</p>
              <Globe className="w-5 h-5 text-violet-400" />
            </div>
            {loading ? (
              <div className="h-10 w-12 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <p className="text-4xl font-bold text-slate-900">{countries.length}</p>
            )}
            <p className="text-slate-400 text-xs mt-1">unique countries</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-500" />
            Visitor Activity — Last {rangeLabels[range]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Loading...</div>
          ) : (
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkline} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={range === '7d' ? 0 : range === '24h' ? 3 : 4} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#trafficGradient)"
                    dot={range === '7d'}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pages + Countries breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-400" />
              Top Pages — Last {rangeLabels[range]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-7 bg-slate-100 rounded animate-pulse" />)}
              </div>
            ) : pages.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No data for this period</p>
            ) : (
              <div className="space-y-2.5">
                {pages.map(({ page, count }) => (
                  <div key={page}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium truncate pr-2 max-w-[75%]">{page || '/'}</span>
                      <span className="text-slate-500 flex-shrink-0 font-semibold">{count} {count === 1 ? 'visitor' : 'visitors'}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                        style={{ width: `${(count / maxPageCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-400" />
              Top Countries — Last {rangeLabels[range]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-7 bg-slate-100 rounded animate-pulse" />)}
              </div>
            ) : countries.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No data for this period</p>
            ) : (
              <div className="space-y-3">
                {countries.map(({ country, count }, i) => (
                  <div key={country} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-700">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-violet-500 transition-all duration-700"
                          style={{ width: `${(count / (countries[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}