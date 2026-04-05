import React, { useState } from 'react';
import { X, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LogsViewer({ job, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(job.logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const logs = job.logs.join('\n');
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.name}_logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{job.name}</h3>
            <p className="text-xs text-slate-500 mt-1">Job ID: {job.id}</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex gap-2 p-3 bg-slate-50 border-b border-slate-200">
          <Button
            onClick={handleCopy}
            size="sm"
            variant="outline"
            className="gap-2 text-xs"
          >
            {copied ? '✓ Copied' : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </Button>
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="gap-2 text-xs"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </Button>
          <div className="ml-auto text-xs text-slate-500">
            {job.logs?.length || 0} lines
          </div>
        </div>

        {/* Logs Content */}
        <div className="bg-slate-900 text-slate-100 font-mono text-xs p-4 max-h-96 overflow-y-auto">
          {job.logs && job.logs.length > 0 ? (
            <pre className="whitespace-pre-wrap break-words">
              {job.logs.map((line, idx) => (
                <div key={idx} className="hover:bg-slate-800 px-2 py-0.5">
                  <span className="text-slate-500 mr-3">{String(idx + 1).padStart(4, '0')}</span>
                  {line}
                </div>
              ))}
            </pre>
          ) : (
            <p className="text-slate-500 italic">No logs available</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Button onClick={onClose} variant="outline" className="px-6">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}