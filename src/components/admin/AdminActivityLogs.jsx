import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader, MapPin, Clock, Monitor, Search, Calendar } from 'lucide-react';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await base44.asServiceRole.entities.VisitorLog.list('-last_seen', 200);
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch visitor logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventType = (log) => {
    const page = (log.current_page || log.page || '').toLowerCase();
    if (page.includes('admin') || page.includes('billing')) return 'warning';
    if (page.includes('error') || page.includes('404')) return 'critical';
    if (page.includes('login') || page.includes('register')) return 'auth';
    return 'info';
  };

  const getEventConfig = (type) => {
    switch (type) {
      case 'critical':
        return { color: 'text-red-700', bg: 'bg-red-100', label: 'Critical' };
      case 'warning':
        return { color: 'text-amber-700', bg: 'bg-amber-100', label: 'Warning' };
      case 'auth':
        return { color: 'text-violet-700', bg: 'bg-violet-100', label: 'Auth' };
      default:
        return { color: 'text-teal-700', bg: 'bg-teal-100', label: 'Info' };
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      const searchText = search.toLowerCase();
      const page = (log.current_page || log.page || '').toLowerCase();
      const location = [log.city, log.region, log.country].filter(Boolean).join(', ').toLowerCase();
      const sessionId = (log.session_id || '').toLowerCase();
      const matchSearch = !searchText ||
        page.includes(searchText) ||
        location.includes(searchText) ||
        sessionId.includes(searchText);

      // Event type filter
      const eventType = getEventType(log);
      const matchType = typeFilter === 'all' || eventType === typeFilter;

      // Date filter
      let matchDate = true;
      if (dateFilter !== 'all' && log.last_seen) {
        const logDate = new Date(log.last_seen);
        const now = new Date();
        const diffMs = now - logDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (dateFilter === 'today') matchDate = diffDays < 1;
        else if (dateFilter === '7d') matchDate = diffDays < 7;
        else if (dateFilter === '30d') matchDate = diffDays < 30;
      }

      return matchSearch && matchType && matchDate;
    });
  }, [logs, search, typeFilter, dateFilter]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Chronological history of user actions and system events</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by page, location, or session..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        {/* Event Type Filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-teal-500"
        >
          <option value="all">All Events</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
          <option value="auth">Auth</option>
        </select>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-500">
        Showing {filteredLogs.length} of {logs.length} entries
      </div>

      {/* Activity Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
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
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Event Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Page</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Location</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Session</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => {
                  const eventType = getEventType(log);
                  const cfg = getEventConfig(eventType);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-3.5 h-3.5 text-slate-400" />
                          {log.current_page || log.page || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {[log.city, log.region, log.country].filter(Boolean).join(', ') || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                        {log.session_id ? log.session_id.substring(0, 8) + '...' : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
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