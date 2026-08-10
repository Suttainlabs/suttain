import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { GitBranch, Plus, X, Play, Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { UpgradePrompt } from './StudioShared';

export default function PipelinePanel({ config, isPro }) {
  const { steps, inputPlaceholder } = config;
  const [chain, setChain] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [stepStatuses, setStepStatuses] = useState({});

  if (!isPro) {
    return <UpgradePrompt feature="Pipelines" />;
  }

  const addStep = (step) => setChain(prev => [...prev, { ...step, filter: '' }]);
  const removeStep = (idx) => setChain(prev => prev.filter((_, i) => i !== idx));
  const updateFilter = (idx, value) => setChain(prev => prev.map((s, i) => i === idx ? { ...s, filter: value } : s));

  const runChain = async () => {
    if (chain.length === 0 || !inputValue.trim()) return;
    setIsRunning(true);
    setStepStatuses({});
    let currentInput = inputValue;

    for (let i = 0; i < chain.length; i++) {
      const step = chain[i];
      setStepStatuses(prev => ({ ...prev, [i]: 'running' }));
      try {
        if (step.handler) {
          const res = await step.handler({ input: currentInput, inputType: config.inputTypes[0].value });
          currentInput = typeof res === 'string' ? res : (res.raw ? JSON.stringify(res.raw).slice(0, 500) : JSON.stringify(res).slice(0, 500));
        }
        setStepStatuses(prev => ({ ...prev, [i]: 'done' }));
      } catch {
        setStepStatuses(prev => ({ ...prev, [i]: 'failed' }));
        break;
      }
    }

    try {
      await base44.entities.SimulationJob.create({
        draft_id: 'pipeline',
        job_hash: Date.now().toString(36),
        job_name: `Pipeline: ${chain.map(s => s.label).join(' -> ')}`,
        sim_type: 'pipeline',
        sim_type_label: chain.map(s => s.label).join(' -> '),
        engine: 'Pipeline',
        inputs: { input: inputValue, mode: 'pipeline', steps: chain.map(s => s.id) },
        status: 'completed',
      });
    } catch {}
    setIsRunning(false);
  };

  const statusIcons = {
    running: <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />,
    done: <CheckCircle className="w-3.5 h-3.5 text-teal-500" />,
    failed: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Initial Input</label>
        <input value={inputValue} onChange={e => setInputValue(e.target.value)}
          placeholder={inputPlaceholder || 'Enter starting input'}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-[#007850]" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Steps</div>
        <div className="flex flex-wrap gap-2">
          {steps.map(step => (
            <button key={step.id} onClick={() => addStep(step)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <Plus className="w-3 h-3" /> {step.label}
            </button>
          ))}
        </div>
      </div>

      {chain.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Pipeline Chain</div>
          <div className="space-y-1">
            {chain.map((step, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  {statusIcons[stepStatuses[idx]] || <GitBranch className="w-3.5 h-3.5 text-slate-400" />}
                  <span className="text-sm font-semibold text-slate-700 flex-1">{step.label}</span>
                  <button onClick={() => removeStep(idx)} className="p-1 rounded hover:bg-slate-200 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {idx < chain.length - 1 && (
                  <div className="flex items-center gap-2 pl-4 py-1">
                    <ArrowRight className="w-3 h-3 text-slate-300" />
                    <input value={step.filter} onChange={e => updateFilter(idx, e.target.value)}
                      placeholder="Filter (optional)"
                      className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:border-[#007850]" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={runChain} disabled={isRunning || !inputValue.trim()}
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 text-white rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed bg-[#0F6E56] hover:bg-[#0d5c47]">
            {isRunning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running chain</> : <><Play className="w-3.5 h-3.5" /> Run chain</>}
          </button>
        </div>
      )}
    </div>
  );
}