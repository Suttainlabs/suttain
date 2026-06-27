import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';

const MOCK_LOGS = [
  { id: 1, timestamp: '2026-06-27T14:32:00Z', level: 'error', message: 'Database connection timeout on replica-2', service: 'core' },
  { id: 2, timestamp: '2026-06-27T14:28:15Z', level: 'warning', message: 'API rate limit approaching (92%)', service: 'api' },
  { id: 3, timestamp: '2026-06-27T14:15:42Z', level: 'success', message: 'Weekly backup completed', service: 'system' },
  { id: 4, timestamp: '2026-06-27T13:50:20Z', level: 'info', message: 'User 5483 upgraded to Pro tier', service: 'billing' },
  { id: 5, timestamp: '2026-06-27T13:22:05Z', level: 'warning', message: 'Stripe webhook retry queue building up', service: 'payment' },
];

export default function AdminSystemLogs() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [filter, setFilter] = useState('all');

  const getIcon = (level) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'info': return <Info className="w-4 h-4 text-cyan-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBgColor = (level) => {
    switch (level) {
      case 'error': return 'bg-red-500/5 border-l-4 border-red-500';
      case 'warning': return 'bg-yellow-500/5 border-l-4 border-yellow-500';
      case 'success': return 'bg-emerald-500/5 border-l-4 border-emerald-500';
      case 'info': return 'bg-cyan-500/5 border-l-4 border-cyan-500';
      default: return 'bg-slate-500/5 border-l-4 border-slate-500';
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.level === filter);

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'error', 'warning', 'success', 'info'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Logs */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLogs.map(log => (
          <div key={log.id} className={`${getBgColor(log.level)} border border-slate-800 rounded-lg p-4 flex items-start justify-between group`}>
            <div className="flex items-start gap-3 flex-1">
              {getIcon(log.level)}
              <div className="flex-1 min-w-0">
                <p className="text-slate-100 text-sm font-semibold">{log.message}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span className="px-2 py-0.5 bg-slate-800 rounded">{log.service}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setLogs(logs.filter(l => l.id !== log.id))} className="p-1.5 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-red-400 flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}