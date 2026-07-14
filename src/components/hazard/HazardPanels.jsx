import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, Brain } from 'lucide-react';
import { suttainHazardData } from '@/functions/suttainHazardData';
import { suttainIntelligence } from '@/functions/suttainIntelligence';
import { LoadingState, ErrorState, SourceLabel, ConfidenceBar, DataRow } from '@/components/shared/FunctionResult';

export function HazardDataPanel() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainHazardData({ query: input.trim() });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-4 h-4 text-[#007850]" />
        <h3 className="font-bold text-slate-900 text-sm">Chemical Identity Lookup</h3>
      </div>
      <p className="text-xs text-slate-500 mb-3">Enter a chemical name or CAS number to retrieve identity data from EPA CompTox and PubChem.</p>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="e.g. bisphenol A or 80-05-7"
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <button onClick={run} disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
          Lookup
        </button>
      </div>
      {loading && <LoadingState label="Querying EPA CompTox + PubChem..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source={result.source} />
          <div className="mt-3 space-y-1">
            <DataRow label="Preferred Name" value={result.preferred_name} />
            <DataRow label="DTXSID" value={result.dtxsid || 'N/A'} />
            <DataRow label="CAS Number" value={result.cas_number || 'N/A'} />
            <DataRow label="Molecular Formula" value={result.molecular_formula || 'N/A'} />
            <DataRow label="Molecular Weight" value={result.molecular_weight || 'N/A'} unit="g/mol" />
            <DataRow label="SMILES" value={result.smiles || 'N/A'} />
          </div>
          {result.dashboard_url && (
            <a href={result.dashboard_url} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50">
              <ExternalLink className="w-4 h-4" /> View on EPA Dashboard
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function HazardExplanationPanel() {
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainIntelligence({ task: 'hazard_explanation', input: input.trim(), context: context.trim() || undefined });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const r = result?.result;
  const isObj = r && typeof r === 'object';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-[#6B3FA0]" />
        <h3 className="font-bold text-slate-900 text-sm">Why This Prediction? (Hazard Explanation)</h3>
      </div>
      <div className="space-y-2 mb-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Chemical name"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <input value={context} onChange={e => setContext(e.target.value)} placeholder="Additional context (optional)"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
      </div>
      <button onClick={run} disabled={loading || !input.trim()}
        className="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
        Explain
      </button>
      {loading && <LoadingState label="Generating hazard explanation..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source={result.source} />
          {result.blocked ? (
            <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-semibold">{r?.message || 'This query was blocked by the safety guard.'}</p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {isObj ? (
                <>
                  {r.confidence != null && <ConfidenceBar value={r.confidence} />}
                  {r.ghs_classification && <div><p className="text-xs font-semibold text-slate-500">GHS Classification</p><p className="text-sm text-slate-700">{r.ghs_classification}</p></div>}
                  {r.toxicity_summary && <div><p className="text-xs font-semibold text-slate-500">Toxicity Summary</p><p className="text-sm text-slate-700">{r.toxicity_summary}</p></div>}
                  {r.environmental_fate && <div><p className="text-xs font-semibold text-slate-500">Environmental Fate</p><p className="text-sm text-slate-700">{r.environmental_fate}</p></div>}
                  {r.safe_handling && <div><p className="text-xs font-semibold text-slate-500">Safe Handling</p><p className="text-sm text-slate-700">{r.safe_handling}</p></div>}
                </>
              ) : (
                <p className="text-sm text-slate-700">{r}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}