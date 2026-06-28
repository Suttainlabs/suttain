import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader, Globe, MapPin, Clock, Monitor } from 'lucide-react';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await base44.asServiceRole.entities.VisitorLog.list('-last_seen', 100);
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch visitor logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverity = (log) => {
    // Derive severity from page visited
    const page = log.current_page || log.page || '';
    if (page.includes('admin') || page.includes('billing')) return 'warning';
    if (page.includes('error') || page.includes('404')) return 'critical';
    return 'info';
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Critical' };
      case 'warning':
        return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Warning' };
      default:
        return { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', label: 'Info' };
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => getSeverity(log) === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Activity Logs</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time visitor activity from VisitorLog database</p>
        </div>
        <div className="text-sm text-slate-400">{logs.length} total entries</div>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2">
        {['all', 'info', 'warning', 'critical'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === f
                ? 'bg-[#007850] text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity Table */}
      <div className="bg-[#0F1419] border border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            No activity logs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30">
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Severity</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Page</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Location</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Session</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.map(log => {
                  const severity = getSeverity(log);
                  const cfg = getSeverityConfig(severity);
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-100 font-medium">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-3.5 h-3.5 text-slate-500" />
                          {log.current_page || log.page || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {[log.city, log.region, log.country].filter(Boolean).join(', ') || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                        {log.session_id ? log.session_id.substring(0, 8) + '...' : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {log.last_seen ? new Date(log.last_seen).toLocaleString() : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}