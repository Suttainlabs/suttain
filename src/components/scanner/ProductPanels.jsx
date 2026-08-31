import React, { useState } from 'react';
import { ScanLine, Brain, AlertTriangle } from 'lucide-react';
import { suttainProductData } from '@/functions/suttainProductData';
import { suttainIntelligence } from '@/functions/suttainIntelligence';
import { LoadingState, ErrorState, SourceLabel, ConfidenceBar, DataRow } from '@/components/shared/FunctionResult';

export function ProductDataPanel() {
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!barcode.trim() && !name.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const payload = {};
      if (barcode.trim()) payload.barcode = barcode.trim();
      else payload.name = name.trim();
      const res = await suttainProductData(payload);
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const n = result?.nutrition_per_100g;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <ScanLine className="w-4 h-4 text-[#02988C]" />
        <h3 className="font-bold text-slate-900 text-sm">Product Lookup</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Barcode number"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#02988C]" />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Or product name"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#02988C]" />
      </div>
      <button onClick={run} disabled={loading || (!barcode.trim() && !name.trim())}
        className="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #02988C, #9531F5)' }}>
        Lookup Product
      </button>
      {loading && <LoadingState label="Querying Open Food Facts..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source={result.source} />
          {result.image_url && (
            <img src={result.image_url} alt={result.product_name} className="w-full max-h-48 object-contain mb-3 rounded-lg" />
          )}
          <div className="space-y-1">
            <DataRow label="Product" value={result.product_name} />
            <DataRow label="Brand" value={result.brand} />
            <DataRow label="NOVA Group" value={result.nova_group} />
            <DataRow label="Nutri-Score" value={result.nutriscore ? result.nutriscore.toUpperCase() : 'N/A'} />
          </div>
          {result.ingredients && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 mb-1">Ingredients</p>
              <p className="text-sm text-slate-700">{result.ingredients}</p>
            </div>
          )}
          {result.allergens && result.allergens.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 mb-1">Allergens</p>
              <div className="flex gap-1 flex-wrap">
                {result.allergens.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded">{a.replace(/en:/g, '')}</span>
                ))}
              </div>
            </div>
          )}
          {result.additives && result.additives.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 mb-1">Additives</p>
              <div className="flex gap-1 flex-wrap">
                {result.additives.slice(0, 10).map((a, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded">{a.replace(/en:/g, '')}</span>
                ))}
              </div>
            </div>
          )}
          {n && Object.keys(n).length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 mb-1">Nutrition per 100g</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(n).slice(0, 12).map(([k, v]) => (
                  <DataRow key={k} label={k.replace(/_/g, ' ')} value={v} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function IngredientAnalysisPanel() {
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainIntelligence({ task: 'ingredient_analysis', input: input.trim(), context: context.trim() || undefined });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const r = result?.result;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-[#9531F5]" />
        <h3 className="font-bold text-slate-900 text-sm">Ingredient Safety Analysis</h3>
      </div>
      <div className="space-y-2 mb-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ingredient or product name"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#02988C]" />
        <input value={context} onChange={e => setContext(e.target.value)} placeholder="Context (optional)"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#02988C]" />
      </div>
      <button onClick={run} disabled={loading || !input.trim()}
        className="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #02988C, #9531F5)' }}>
        Analyze Safety
      </button>
      {loading && <LoadingState label="Analyzing ingredient safety..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source={result.source} />
          {result.blocked ? (
            <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-semibold">{r?.message || 'Blocked by safety guard.'}</p>
            </div>
          ) : r && typeof r === 'object' ? (
            <div className="mt-3 space-y-3">
              {r.confidence != null && <ConfidenceBar value={r.confidence} />}
              {r.risk_rating && (
                <div className={`p-3 rounded-lg ${r.risk_rating === 'high' ? 'bg-red-50' : r.risk_rating === 'medium' ? 'bg-amber-50' : 'bg-green-50'}`}>
                  <span className={`text-sm font-bold ${r.risk_rating === 'high' ? 'text-red-700' : r.risk_rating === 'medium' ? 'text-amber-700' : 'text-green-700'}`}>
                    Risk: {r.risk_rating.toUpperCase()}
                  </span>
                </div>
              )}
              {r.summary && <p className="text-sm text-slate-700">{r.summary}</p>}
              {r.concerns && r.concerns.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Concerns</p>
                  <ul className="text-sm text-slate-700 space-y-1">{r.concerns.map((c, i) => <li key={i}>- {c}</li>)}</ul>
                </div>
              )}
              {r.regulatory_notes && <p className="text-xs text-slate-500">{r.regulatory_notes}</p>}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-700">{r}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function InteractionAnalysisPanel() {
  const [molA, setMolA] = useState('');
  const [molB, setMolB] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!molA.trim() || !molB.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainIntelligence({ task: 'interaction_analysis', input: `${molA.trim()} + ${molB.trim()}` });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const r = result?.result;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-[#D4900A]" />
        <h3 className="font-bold text-slate-900 text-sm">Ingredient Interaction Check</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input value={molA} onChange={e => setMolA(e.target.value)} placeholder="Ingredient A"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#02988C]" />
        <input value={molB} onChange={e => setMolB(e.target.value)} placeholder="Ingredient B"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#02988C]" />
      </div>
      <button onClick={run} disabled={loading || !molA.trim() || !molB.trim()}
        className="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #02988C, #9531F5)' }}>
        Check Interaction
      </button>
      {loading && <LoadingState label="Analyzing interaction..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source={result.source} />
          {result.blocked ? (
            <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-semibold">{r?.message || 'Blocked by safety guard.'}</p>
            </div>
          ) : r && typeof r === 'object' ? (
            <div className="mt-3 space-y-3">
              {r.confidence != null && <ConfidenceBar value={r.confidence} />}
              {r.hazard_level && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${r.hazard_level === 'dangerous' ? 'bg-red-50' : r.hazard_level === 'caution' ? 'bg-amber-50' : 'bg-green-50'}`}>
                  <AlertTriangle className={`w-4 h-4 ${r.hazard_level === 'dangerous' ? 'text-red-600' : r.hazard_level === 'caution' ? 'text-amber-600' : 'text-green-600'}`} />
                  <span className={`text-sm font-bold ${r.hazard_level === 'dangerous' ? 'text-red-700' : r.hazard_level === 'caution' ? 'text-amber-700' : 'text-green-700'}`}>
                    {r.hazard_level.toUpperCase()}
                  </span>
                </div>
              )}
              {r.safety_warning && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-semibold">{r.safety_warning}</p>
                </div>
              )}
              {r.summary && <p className="text-sm text-slate-700">{r.summary}</p>}
              {r.reaction_products && r.reaction_products.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Reaction Products</p>
                  <ul className="text-sm text-slate-700 space-y-1">{r.reaction_products.map((p, i) => <li key={i}>- {p}</li>)}</ul>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-700">{r}</p>
          )}
        </div>
      )}
    </div>
  );
}