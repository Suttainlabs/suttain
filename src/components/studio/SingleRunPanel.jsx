import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Play, Loader2, Download, FileUp, AlertCircle, RotateCcw, Info } from 'lucide-react';
import Studio3DViewer from './Studio3DViewer';
import ToolCombobox from './ToolCombobox';
import { SourcedBadge, TrustLabel, ExecutionTag, downloadTextFile } from './StudioShared';

export default function SingleRunPanel({ config }) {
  const { inputTypes, tools, viewerMode } = config;
  const [inputType, setInputType] = useState(inputTypes[0].value);
  const [inputValue, setInputValue] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [selectedTool, setSelectedTool] = useState(tools[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const fileRef = useRef(null);

  const currentTool = tools.find(t => t.id === selectedTool);
  const canRun = inputType === 'file' ? !!fileName : !!inputValue.trim();

  const validate = () => {
    if (!canRun) {
      setValidationError(inputType === 'file'
        ? 'Please choose a file first.'
        : 'Please enter a value before running.');
      return false;
    }
    if (inputType !== 'file' && currentTool.validate) {
      const msg = currentTool.validate({ input: inputValue, inputType, fileName });
      if (msg) { setValidationError(msg); return false; }
    }
    setValidationError(null);
    return true;
  };

  const handleRun = async () => {
    if (!validate()) return;
    setIsRunning(true);
    setError(null);
    setResult(null);

    let job = null;
    try {
      job = await base44.entities.SimulationJob.create({
        draft_id: 'single',
        job_hash: Date.now().toString(36),
        job_name: `${currentTool.label}: ${(inputValue || fileName).slice(0, 30)}`,
        sim_type: currentTool.id,
        sim_type_label: currentTool.label,
        engine: currentTool.engine || 'In-browser',
        inputs: { input: inputValue || fileName, inputType, mode: 'single' },
        status: 'running',
      });
    } catch {}

    try {
      const res = await currentTool.handler({ input: inputValue, inputType, fileName, fileContent });
      setResult(res);
      if (job) {
        await base44.entities.SimulationJob.update(job.id, {
          status: 'completed',
          result: res.raw || res,
        });
      }
    } catch (e) {
      const msg = e?.message || e?.response?.data?.error || 'An error occurred during execution';
      setError(msg);
      if (job) {
        await base44.entities.SimulationJob.update(job.id, { status: 'failed', error: msg });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadTextFile(
      `suttain_${selectedTool}_result.json`,
      JSON.stringify(result.raw || result, null, 2),
      'application/json'
    );
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      setFileContent(text);
    } catch {
      setFileContent('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Input Type</label>
            <select value={inputType} onChange={e => { setInputType(e.target.value); setInputValue(''); setFileName(''); setFileContent(''); setValidationError(null); }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#007850] bg-white">
              {inputTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Tool</label>
            <ToolCombobox tools={tools} value={selectedTool} onChange={(id) => {
              const tool = tools.find(t => t.id === id);
              setSelectedTool(id);
              setResult(null); setError(null); setValidationError(null);
              if (tool?.requiredInput?.type) {
                setInputType(tool.requiredInput.type);
                setInputValue(''); setFileName(''); setFileContent('');
              }
            }} />
          </div>
        </div>

        {currentTool?.requiredInput?.hint && (
          <div className="mt-3 flex items-start gap-2 bg-[#E1F5EE] border border-[#0F6E56]/20 rounded-lg px-3 py-2.5">
            <Info className="w-3.5 h-3.5 flex-shrink-0 text-[#0F6E56] mt-0.5" />
            <div className="text-xs leading-snug">
              <span className="font-semibold text-[#0F6E56]">Required input: </span>
              <span className="text-slate-700">{currentTool.requiredInput.hint}</span>
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Input</label>
          {inputType === 'file' ? (
            <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-[#007850] transition-colors">
              <FileUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">{fileName || 'Choose a file'}</span>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
            </label>
          ) : (
            <textarea value={inputValue} onChange={e => { setInputValue(e.target.value); setValidationError(null); }}
              placeholder={inputTypes.find(t => t.value === inputType)?.placeholder}
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-[#007850] resize-none" />
          )}
        </div>

        {validationError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {currentTool.description && <p className="text-xs text-slate-500 mt-3">{currentTool.description}</p>}

        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ExecutionTag type={currentTool.sourceType === 'external' ? 'external' : 'computed'} />
            <TrustLabel source={currentTool.source} type={currentTool.sourceType} />
          </div>
          <button onClick={handleRun} disabled={!canRun || isRunning}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 bg-[#0F6E56] hover:bg-[#0d5c47]">
            {isRunning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running</> : <><Play className="w-3.5 h-3.5" /> Run</>}
          </button>
        </div>
      </div>

      {isRunning && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#007850' }} />
          <p className="text-sm font-semibold text-slate-600">Fetching real data from {currentTool.source}...</p>
          <p className="text-xs text-slate-400">This may take a few seconds depending on the external API.</p>
        </div>
      )}

      {error && !isRunning && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">Execution failed</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
            <button onClick={handleRun} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <RotateCcw className="w-3 h-3" /> Try again
            </button>
          </div>
        </div>
      )}

      {result && !isRunning && (
        currentTool.renderResult
          ? currentTool.renderResult(result)
          : <DefaultResultDisplay result={result} viewerMode={viewerMode} onDownload={handleDownload} />
      )}
    </div>
  );
}

function DefaultResultDisplay({ result, viewerMode, onDownload }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="grid md:grid-cols-2">
        <div className="border-b md:border-b-0 md:border-r border-slate-200">
          <Studio3DViewer mode={viewerMode} height={350} />
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <SourcedBadge />
            <TrustLabel source={result.source} type={result.sourceType} />
          </div>
          {result.confidence != null && (
            <div className="mb-4">
              <div className="text-xs text-slate-400 mb-1">Confidence</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#0F6E56]" style={{ width: `${result.confidence}%` }} />
                </div>
                <span className="font-mono font-bold text-sm text-slate-700">{result.confidence}%</span>
              </div>
            </div>
          )}
          {result.label && <p className="text-sm font-bold text-slate-800 mb-3">{result.label}</p>}
          {result.data && result.data.length > 0 && (
            <div className="space-y-1.5">
              {result.data.map(([key, value], i) => (
                <div key={i} className="flex justify-between text-sm gap-2">
                  <span className="text-slate-500">{key}</span>
                  <span className="font-mono text-slate-800 text-right">{value}</span>
                </div>
              ))}
            </div>
          )}
          {result.categories && result.categories.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-400 mb-1">Categories</div>
              <div className="flex flex-wrap gap-1">
                {result.categories.map((cat, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded text-xs">{cat}</span>
                ))}
              </div>
            </div>
          )}
          <button onClick={onDownload} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Download result
          </button>
        </div>
      </div>
    </div>
  );
}