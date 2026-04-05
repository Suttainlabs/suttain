import React from 'react';
import { Cpu, CheckCircle2, AlertCircle, Clock, Zap, Server, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_STYLES = {
  Queued: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Clock, accent: 'bg-blue-100' },
  Running: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: Zap, accent: 'bg-purple-100' },
  Completed: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle2, accent: 'bg-green-100' },
  Failed: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertCircle, accent: 'bg-red-100' },
};

export default function JobQueueCard({ job, onViewLogs, isExpanded, onToggleExpand }) {
  const style = STATUS_STYLES[job.status] || STATUS_STYLES.Queued;
  const StatusIcon = style.icon;

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime) return '-';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const hours = Math.floor((end - start) / (1000 * 60 * 60));
    const mins = Math.floor(((end - start) % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={`border-2 rounded-lg p-4 transition-all ${style.bg} ${style.border}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-2 rounded-lg ${style.accent}`}>
            <StatusIcon className={`w-5 h-5 ${style.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 truncate">{job.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{job.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${style.text} ${style.accent}`}>
            {job.status}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleExpand}
            className="h-7 px-2 text-slate-500 hover:text-slate-700"
          >
            {isExpanded ? '▼' : '▶'}
          </Button>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="text-xs">
          <span className="text-slate-500">Engine:</span>
          <p className="font-semibold text-slate-700">{job.engine}</p>
        </div>
        <div className="text-xs">
          <span className="text-slate-500">Cluster:</span>
          <p className="font-semibold text-slate-700">{job.cluster}</p>
        </div>
        <div className="text-xs">
          <span className="text-slate-500">Resources:</span>
          <p className="font-semibold text-slate-700">{job.numCores} cores {job.gpuRequested ? '+ GPU' : ''}</p>
        </div>
        <div className="text-xs">
          <span className="text-slate-500">Duration:</span>
          <p className="font-semibold text-slate-700">{formatDuration(job.startTime, job.endTime)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-slate-600">Progress</span>
          <span className="text-xs font-mono text-slate-600">{job.progress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              job.status === 'Completed' ? 'bg-green-500' :
              job.status === 'Failed' ? 'bg-red-500' :
              job.status === 'Running' ? 'bg-purple-500' : 'bg-blue-500'
            }`}
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 space-y-3 border-t border-slate-300 pt-3">
          {/* Timeline */}
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Submitted:</span>
              <span className="font-mono text-slate-700">{formatTime(job.submitTime)}</span>
            </div>
            {job.startTime && (
              <div className="flex justify-between">
                <span className="text-slate-600">Started:</span>
                <span className="font-mono text-slate-700">{formatTime(job.startTime)}</span>
              </div>
            )}
            {job.endTime && (
              <div className="flex justify-between">
                <span className="text-slate-600">Completed:</span>
                <span className="font-mono text-slate-700">{formatTime(job.endTime)}</span>
              </div>
            )}
            {job.cpuHours && (
              <div className="flex justify-between">
                <span className="text-slate-600">CPU Hours Used:</span>
                <span className="font-mono text-slate-700">{job.cpuHours.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {job.errorMessage && (
            <div className="bg-red-100 border border-red-300 rounded p-2 text-xs text-red-700">
              <p className="font-semibold mb-1">Error:</p>
              <p className="break-words">{job.errorMessage}</p>
            </div>
          )}

          {/* View Logs Button */}
          <Button
            onClick={() => onViewLogs(job)}
            className="w-full gap-2 bg-slate-700 hover:bg-slate-800 text-white text-xs"
          >
            <FileText className="w-4 h-4" /> View Logs ({job.logs?.length || 0} lines)
          </Button>
        </div>
      )}
    </div>
  );
}