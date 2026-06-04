import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Globe, Monitor, RefreshCw, Users, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ACTIVE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes = "active right now"
const POLL_INTERVAL_MS = 15000; // poll every 15 seconds

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function buildHourlyBuckets(logs) {
  // Build a 30-minute window bucketed by minute for the sparkline
  const now = Date.now();
  const buckets = {};
  for (let i = 29; i >= 0; i--) {
    const t = new Date(now - i * 60000);
    const key = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    buckets[key] = 0;
  }

  logs.forEach(log => {
    if (!log.last_seen && !log.created_date) return;
    const ts = new Date(log.last_seen || log.created_date).getTime();
    const diffMin = Math.floor((now - ts) / 60000);
    if (diffMin < 0 || diffMin > 29) return;
    const t = new Date(now - diffMin * 60000);
    const key = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (key in buckets) buckets[key]++;
  });

  return Object.entries(buckets).map(([time, visitors]) => ({ time, visitors }));
}

function getActiveLogs(logs) {
  const cutoff = Date.now() - ACTIVE_WINDOW_MS;
  return logs.filter(log => {
    const ts = new Date(log.last_seen || log.created_date).getTime();
    return ts >= cutoff;
  });
}

function topPages(activeLogs) {
  const counts = {};
  activeLogs.forEach(log => {
    const p = log.current_page || log.page || '/';
    counts[p] = (counts[p] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([page, count]) => ({ page, count }));
}

function topCountries(activeLogs) {
  const counts = {};
  activeLogs.forEach(log => {
    const c = log.country || 'Unknown';
    counts[c] = (counts[c] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-teal-600 font-bold">{payload[0].value} active</p>
    </div>
  );
};

export default function RealTimeTrafficPanel() {
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sparkline, setSparkline] = useState([]);
  const intervalRef = useRef(null);

  const fetchLogs = async () => {
    try {
      // Fetch logs updated in last 30 minutes (using sort by updated_date desc, limit 500)
      const logs = await base44.entities.VisitorLog.list('-updated_date', 500);
      setAllLogs(logs || []);
      setSparkline(buildHourlyBuckets(logs || []));
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
  const activeCount = activeLogs.length;
  const pages = topPages(activeLogs);
  const countries = topCountries(activeLogs);
  const maxPageCount = pages[0]?.count || 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Real-Time Traffic</h2>
          <span className="text-xs text-slate-400 font-medium">— live, updates every 15s</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {lastUpdated && <span className="cursor-default select-none">Updated {formatTime(lastUpdated)}</span>}
          <button onClick={fetchLogs} className="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-xs text-slate-400">Refresh</span>
          </button>
        </div>
      </div>

      {/* Active Visitors Big Number */}
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
              <p className="text-slate-500 text-sm font-medium">Sessions (30 min)</p>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            {loading ? (
              <div className="h-10 w-16 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <p className="text-4xl font-bold text-slate-900">{sparkline.reduce((a, b) => a + b.visitors, 0)}</p>
            )}
            <p className="text-slate-400 text-xs mt-1">total sessions tracked</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-500 text-sm font-medium">Countries Active</p>
              <Globe className="w-5 h-5 text-violet-400" />
            </div>
            {loading ? (
              <div className="h-10 w-12 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <p className="text-4xl font-bold text-slate-900">{countries.length}</p>
            )}
            <p className="text-slate-400 text-xs mt-1">unique countries right now</p>
          </CardContent>
        </Card>
      </div>

      {/* Sparkline — visitors over last 30 minutes */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-500" />
            Visitor Activity — Last 30 Minutes
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
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={4} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#trafficGradient)"
                    dot={false}
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
        {/* Active Pages */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-400" />
              Active Pages Right Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-7 bg-slate-100 rounded animate-pulse" />)}
              </div>
            ) : pages.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No active visitors</p>
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

        {/* Active Countries */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-400" />
              Countries Active Right Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-7 bg-slate-100 rounded animate-pulse" />)}
              </div>
            ) : countries.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No active visitors</p>
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