import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { suttainRegulatory } from '@/functions/suttainRegulatory';
import { LoadingState, ErrorState, SourceLabel } from '@/components/shared/FunctionResult';

export default function RegulatoryPanel() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainRegulatory({ query: input.trim() });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const isDanger = result?.signal_word?.toLowerCase().includes('danger');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-4 h-4 text-[#6B3FA0]" />
        <h3 className="font-bold text-slate-900 text-sm">Regulatory Hazard Classification (GHS)</h3>
      </div>
      <p className="text-xs text-slate-500 mb-3">Enter a chemical name or CAS number to retrieve published GHS classification data from PubChem.</p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="e.g. acetone or 67-64-1"
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]"
        />
        <button onClick={run} disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
          Lookup
        </button>
      </div>
      {loading && <LoadingState label="Fetching GHS classification from PubChem..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source={result.source} />
          {!result.ghs_available ? (
            <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <p className="text-sm text-slate-500">{result.message || 'No published GHS classification for this compound.'}</p>
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {result.signal_word && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${isDanger ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-amber-100 text-amber-700 border border-amber-300'}`}>
                  <ShieldAlert className="w-4 h-4" />
                  Signal Word: {result.signal_word}
                </div>
              )}
              {result.pictograms && result.pictograms.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Pictograms</p>
                  <div className="flex gap-2 flex-wrap">
                    {result.pictograms.map((p, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-bold rounded-lg border border-violet-200">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.hazard_statements && result.hazard_statements.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Hazard Statements</p>
                  <div className="space-y-1.5">
                    {result.hazard_statements.map((hs, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                        <span className="inline-flex items-center px-2 py-0.5 bg-slate-800 text-white text-xs font-mono font-bold rounded flex-shrink-0">
                          {hs.code}
                        </span>
                        <span className="text-sm text-slate-700">{hs.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}