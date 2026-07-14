import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Play, Loader2, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { UpgradePrompt, ExecutionTag, TrustLabel } from './StudioShared';

export default function BatchPanel({ config, isPro }) {
  const { tools, inputPlaceholder } = config;
  const [inputText, setInputText] = useState('');
  const [selectedTool, setSelectedTool] = useState(tools[0].id);
  const [rows, setRows] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  if (!isPro) {
    return <UpgradePrompt feature="Batch workflows" />;
  }

  const currentTool = tools.find(t => t.id === selectedTool);

  const parseInput = () => inputText.split('\n').map(l => l.trim()).filter(Boolean);

  const handleStart = async () => {
    const items = parseInput();
    if (items.length === 0) return;
    setRows(items.map((input, i) => ({ id: i, input, status: 'queued', result: null, error: null })));
    setIsRunning(true);

    for (let i = 0; i < items.length; i++) {
      setRows(prev => prev.map(r => r.id === i ? { ...r, status: 'running' } : r));
      try {
        const res = await currentTool.handler({ input: items[i], inputType: config.inputTypes[0].value });
        setRows(prev => prev.map(r => r.id === i ? { ...r, status: 'done', result: res } : r));
        try {
          await base44.entities.SimulationJob.create({
            draft_id: 'batch',
            job_hash: `${Date.now()}-${i}`,
            job_name: `${currentTool.label}: ${items[i].slice(0, 20)}`,
            sim_type: currentTool.id,
            sim_type_label: currentTool.label,
            engine: currentTool.engine || 'In-browser',
            inputs: { input: items[i], mode: 'batch', batchIndex: i },
            status: 'completed',
            result: res.raw || res,
          });
        } catch {}
      } catch (e) {
        setRows(prev => prev.map(r => r.id === i ? { ...r, status: 'failed', error: e.message } : r));
      }
    }
    setIsRunning(false);
  };

  const handleBulkDownload = () => {
    const results = rows.filter(r => r.result).map(r => ({ input: r.input, result: r.result.raw || r.result }));
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suttain_batch_${selectedTool}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusIcons = {
    queued: <Clock className="w-3.5 h-3.5 text-amber-500" />,
    running: <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />,
    done: <CheckCircle className="w-3.5 h-3.5 text-teal-500" />,
    failed: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Input Method</label>
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700">Paste list</button>
              <label className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-400 cursor-pointer hover:bg-slate-50">
                Upload CSV
                <input type="file" accept=".csv" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => setInputText(ev.target.result);
                    reader.readAsText(file);
                  }
                }} />
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Tool</label>
            <select value={selectedTool} onChange={e => setSelectedTool(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#007850] bg-white">
              {tools.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <textarea value={inputText} onChange={e => setInputText(e.target.value)}
          placeholder={inputPlaceholder || 'Enter one input per line'}
          rows={5}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-[#007850] resize-none" />
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ExecutionTag type={currentTool.sourceType === 'external' ? 'external' : 'computed'} />
            <TrustLabel source={currentTool.source} type={currentTool.sourceType} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{parseInput().length} rows ready</span>
            <button onClick={handleStart} disabled={parseInput().length === 0 || isRunning}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-white rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
              {isRunning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running batch</> : <><Play className="w-3.5 h-3.5" /> Run all</>}
            </button>
          </div>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Input</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="px-4 py-2.5 text-slate-400 font-mono">{row.id + 1}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-700 max-w-xs truncate">{row.input}</td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5 capitalize text-xs font-semibold text-slate-600">
                      {statusIcons[row.status]} {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 max-w-xs truncate">
                    {row.result?.label || row.result?.data?.[0]?.[1] || row.error || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.some(r => r.status === 'done') && (
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <button onClick={handleBulkDownload} className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-white transition-colors">
                <Download className="w-3.5 h-3.5" /> Download all results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}