import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Target, AlertTriangle, ShieldCheck, ChevronDown, ChevronRight, Zap, Loader2, Info } from 'lucide-react';
import { ConfidenceBar, CitationBadge, HazardCategoryChip, SectionCard } from './shared';

const PRESETS = [
  { name: 'Benzene', smiles: 'c1ccccc1' },
  { name: 'Aspirin', smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O' },
  { name: 'Bisphenol A', smiles: 'CC(C)(c1ccc(O)cc1)c1ccc(O)cc1' },
  { name: 'Caffeine', smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C' },
  { name: 'Triclosan', smiles: 'Oc1cc(Cl)c(cc1Cl)c1ccc(O)cc1' },
];

export default function PredictionPanel({ isPro }) {
  const [inputType, setInputType] = useState('smiles');
  const [smiles, setSmiles] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showWhy, setShowWhy] = useState(false);

  const runPrediction = async () => {
    if (!smiles && !name) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await base44.functions.invoke('hazardPrediction', {
        smiles: inputType === 'smiles' ? smiles : undefined,
        name: inputType === 'name' ? name : undefined,
        include_internals: isPro,
      });
      const data = response?.data !== undefined ? response.data : response;
      setResult(data);
    } catch (e) {
      setError(e.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setInputType('smiles');
    setSmiles(preset.smiles);
    setName(preset.name);
  };

  const p = result?.prediction;
  const isHazardous = p?.binary_result === 'hazardous';

  return (
    <div className="space-y-5">
      {/* Input */}
      <SectionCard title="Predict a Compound" subtitle="Enter a SMILES string or compound name to get a calibrated hazard prediction" icon={Target}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setInputType('smiles')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${inputType === 'smiles' ? 'bg-violet-100 text-violet-700' : 'bg-slate-50 text-slate-600'}`}
            >
              SMILES
            </button>
            <button
              onClick={() => setInputType('name')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${inputType === 'name' ? 'bg-violet-100 text-violet-700' : 'bg-slate-50 text-slate-600'}`}
            >
              Compound Name
            </button>
          </div>

          {inputType === 'smiles' ? (
            <input
              type="text"
              placeholder="e.g. CC(=O)OC1=CC=CC=C1C(=O)O"
              value={smiles}
              onChange={e => setSmiles(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-violet-400"
              onKeyDown={e => e.key === 'Enter' && runPrediction()}
            />
          ) : (
            <input
              type="text"
              placeholder="e.g. Aspirin"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
              onKeyDown={e => e.key === 'Enter' && runPrediction()}
            />
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">Quick presets:</span>
            {PRESETS.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <button
            onClick={runPrediction}
            disabled={loading || (!smiles && !name)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-teal-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:shadow-lg transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing compound...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run Hazard Prediction
              </>
            )}
          </button>
        </div>
      </SectionCard>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {p && (
        <div className="space-y-4">
          {/* Binary result banner */}
          <div
            className={`rounded-xl p-5 border-2 ${isHazardous ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}
          >
            <div className="flex items-center gap-3">
              {isHazardous ? (
                <AlertTriangle className="w-8 h-8 text-red-500" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-green-600" />
              )}
              <div>
                <div className={`text-xl font-bold ${isHazardous ? 'text-red-700' : 'text-green-700'}`}>
                  {isHazardous ? 'Hazardous' : 'Likely Safe'}
                </div>
                <p className="text-sm text-slate-600">
                  {result.compound?.name && result.compound.name !== 'Unknown' ? result.compound.name : 'Compound'}
                  {result.compound?.smiles && result.compound.smiles !== 'Unknown' && (
                    <code className="ml-2 text-xs font-mono text-slate-500">{result.compound.smiles.slice(0, 40)}</code>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence */}
          <SectionCard title="Calibrated Confidence" icon={Target}>
            <div className="space-y-3">
              <ConfidenceBar value={p.confidence} label={p.plain_language || 'Confidence'} />
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Confidence level:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  p.confidence_label === 'high' ? 'bg-green-100 text-green-700' :
                  p.confidence_label === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>{p.confidence_label}</span>
              </div>
            </div>
          </SectionCard>

          {/* False-negative safety note */}
          {p.false_negative_note && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700">False-Negative Safety Note</p>
                <p className="text-sm text-amber-600 mt-1">{p.false_negative_note}</p>
                {result.model_metrics && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-amber-700">
                    <span>Model recall: <span className="font-mono font-bold">{result.model_metrics.recall}%</span></span>
                    <span>False-negative rate: <span className="font-mono font-bold">{result.model_metrics.false_negative_rate}%</span></span>
                    <span className="text-amber-500">({result.model_metrics.computed_on})</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Uncertainty statement */}
          {p.confidence < 70 && p.uncertainty_statement && (
            <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Limited Evidence</p>
                <p className="text-sm text-slate-600 mt-1">{p.uncertainty_statement}</p>
                <p className="text-xs text-slate-500 mt-1">We recommend verifying this result against primary regulatory sources.</p>
              </div>
            </div>
          )}

          {/* Hazard categories */}
          {p.hazard_categories && p.hazard_categories.length > 0 && (
            <SectionCard title="Predicted Hazard Categories" icon={AlertTriangle}>
              <div className="space-y-3">
                {p.hazard_categories.map((cat, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <HazardCategoryChip category={cat.category} confidence={cat.sub_confidence} />
                      {cat.reasoning && <p className="text-xs text-slate-500 mt-1">{cat.reasoning}</p>}
                    </div>
                    <div className="w-24 flex-shrink-0">
                      <ConfidenceBar value={cat.sub_confidence} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Why this prediction (Pro only) */}
          {isPro && p.structural_alerts && p.structural_alerts.length > 0 && (
            <SectionCard title="Why This Prediction" subtitle="Molecular features and structural alerts that drove the classification" icon={Info}>
              <button
                onClick={() => setShowWhy(!showWhy)}
                className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                {showWhy ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {showWhy ? 'Hide details' : 'Show structural alerts and nearest neighbors'}
              </button>
              {showWhy && (
                <div className="space-y-4 mt-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Structural Alerts</p>
                    <div className="space-y-2">
                      {p.structural_alerts.map((alert, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase ${
                            alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                            alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>{alert.severity}</span>
                          <div>
                            <span className="text-sm font-semibold text-slate-700">{alert.alert_name}</span>
                            <p className="text-xs text-slate-500">{alert.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.nearest_neighbors && result.nearest_neighbors.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Nearest Labeled Compounds from Benchmark
                      </p>
                      <div className="space-y-1.5">
                        {result.nearest_neighbors.map((nn, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-slate-700">{nn.name}</span>
                              <code className="ml-2 text-xs font-mono text-slate-400">{nn.smiles?.slice(0, 30)}</code>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              nn.hazard_label === 'hazardous' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                            }`}>{nn.hazard_label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.molecular_features && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Molecular Features</p>
                      <div className="flex flex-wrap gap-2">
                        {p.molecular_features.molecular_formula && (
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">
                            Formula: {p.molecular_features.molecular_formula}
                          </span>
                        )}
                        {p.molecular_features.molecular_weight && (
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">
                            MW: {p.molecular_features.molecular_weight} g/mol
                          </span>
                        )}
                        {p.molecular_features.functional_groups?.map((fg, i) => (
                          <span key={i} className="px-2 py-1 bg-violet-50 border border-violet-200 rounded text-xs text-violet-700">{fg}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          )}

          {/* Citations */}
          {p.citations && p.citations.length > 0 && (
            <SectionCard title="Source Citations" subtitle="Every prediction is traceable to primary sources" icon={ShieldCheck}>
              <div className="flex flex-wrap gap-2">
                {p.citations.map((cite, i) => (
                  <CitationBadge key={i} source={cite.source} reference={cite.reference} url={cite.url} />
                ))}
              </div>
              {result.benchmark_match && (
                <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <p className="text-xs font-semibold text-teal-700">Benchmark Dataset Match</p>
                  <p className="text-sm text-teal-600 mt-0.5">
                    {result.benchmark_match.name} is labeled as{' '}
                    <span className="font-bold">{result.benchmark_match.hazard_label}</span> in the curated benchmark.
                  </p>
                </div>
              )}
            </SectionCard>
          )}

          {/* Methodology */}
          <div className="bg-slate-900 rounded-xl p-4">
            <p className="text-xs font-semibold text-white mb-1">Methodology</p>
            <p className="text-xs text-slate-400 leading-relaxed">{result.methodology}</p>
            {result.api_endpoint && (
              <p className="text-xs text-teal-400 font-mono mt-2">API: POST {result.api_endpoint}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}