import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, Loader2, FlaskConical } from 'lucide-react';

const unwrap = (r) => (r?.data?.data ?? r?.data ?? r);

const MODE_OPTIONS = [
  { v: 'balanced', label: 'Balanced' },
  { v: 'safety', label: 'Safety first' },
];

function ModeToggle({ mode, setMode }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
      {MODE_OPTIONS.map((opt) => (
        <button
          key={opt.v}
          onClick={() => setMode(opt.v)}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
            mode === opt.v ? 'bg-[#007850] text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function PredictTab({ mode, setMode }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showDescriptors, setShowDescriptors] = useState(false);

  const run = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowDescriptors(false);
    try {
      const res = unwrap(await base44.functions.invoke('hazardClassifier', { query: q, mode }));
      if (res?.error) throw new Error(res.error);
      setResult(res);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const hazardous = result?.verdict === 'Hazardous';

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Compound name or SMILES</label>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && run()}
              placeholder="e.g. bisphenol A, or CC(C)(c1ccc(O)cc1)c1ccc(O)cc1"
              className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007850]"
            />
            <button
              onClick={run}
              disabled={loading || !query.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
              Predict
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Operating mode</label>
          <ModeToggle mode={mode} setMode={setMode} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-red-700">
            <ShieldAlert className="w-4 h-4" />
            <p className="text-sm font-semibold">Could not get a prediction</p>
          </div>
          <p className="text-sm text-red-600 mt-1.5">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
          <div className={`rounded-xl p-4 border ${hazardous ? 'bg-red-50 border-red-200' : 'bg-teal-50 border-teal-200'}`}>
            <div className="flex items-center gap-2">
              {hazardous ? <ShieldAlert className="w-5 h-5 text-red-600" /> : <ShieldCheck className="w-5 h-5 text-teal-600" />}
              <p className={`text-xl font-bold ${hazardous ? 'text-red-700' : 'text-teal-700'}`}>{result.verdict}</p>
            </div>
            {result.honesty_note && <p className="text-xs italic text-slate-500 mt-2">{result.honesty_note}</p>}
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Hazard probability</span>
              <span className="font-mono text-slate-800">{(result.hazard_probability * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.round(result.hazard_probability * 100)}%`, background: hazardous ? '#C42B2B' : '#007850' }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Decision threshold: {result.decision_threshold}</p>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-600">Confidence</span>
              <span className="font-mono text-slate-800">{result.confidence_pct}%</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Distance from the decision boundary.</p>
          </div>

          {result.resolved_smiles && (
            <div className="border-t border-slate-100 pt-3">
              <div className="text-xs font-semibold text-slate-500 mb-1">Resolved structure (SMILES)</div>
              <code className="block text-xs font-mono bg-slate-50 border border-slate-100 rounded-lg p-2 break-all text-slate-800">
                {result.resolved_smiles}
              </code>
            </div>
          )}

          {result.descriptors_used && (
            <div className="border-t border-slate-100 pt-3">
              <button
                onClick={() => setShowDescriptors((s) => !s)}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                {showDescriptors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Descriptors used ({Object.keys(result.descriptors_used).length})
              </button>
              {showDescriptors && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(result.descriptors_used).map(([k, v]) => (
                    <div key={k} className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                      <div className="text-[11px] text-slate-500">{k}</div>
                      <div className="text-sm font-mono text-slate-800">{Number(v).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {result.provenance && (
            <div className="border-t border-slate-100 pt-3">
              <div className="text-xs font-semibold text-slate-500 mb-1.5">Provenance</div>
              <div className="space-y-1 text-xs text-slate-600">
                <div><span className="text-slate-400">Descriptor source: </span>{result.provenance.descriptor_source}</div>
                <div><span className="text-slate-400">Model: </span>{result.provenance.model}</div>
                <div><span className="text-slate-400">Training data: </span>{result.provenance.training_data}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}