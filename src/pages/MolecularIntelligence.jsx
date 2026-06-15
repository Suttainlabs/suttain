import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '../components/auth/AuthContext';
import AuthGate from '../components/auth/AuthGate';
import CompoundAnalysisResult from '../components/research/CompoundAnalysisResult';
import { getMolecularData } from '@/functions/getMolecularData';
import {
  Search, Atom, Code, FileText, List, Loader2,
  AlertCircle, ArrowLeft, X, Microscope
} from 'lucide-react';

const QUERY_TYPES = [
  {
    id: 'name',
    label: 'Name / CAS',
    icon: Search,
    placeholder: 'e.g. Bisphenol A, 80-05-7, Titanium dioxide, Aspirin',
    multiline: false
  },
  {
    id: 'smiles',
    label: 'SMILES',
    icon: Code,
    placeholder: 'e.g. CC(=O)Oc1ccccc1C(=O)O',
    multiline: false
  },
  {
    id: 'inchi',
    label: 'InChI',
    icon: FileText,
    placeholder: 'e.g. InChI=1S/C9H8O4/c1-6(10)13-8-5-3-2-4-7(8)9(11)12/h2-5H,1H3,(H,11,12)',
    multiline: false
  },
  {
    id: 'ingredient_list',
    label: 'Ingredient List',
    icon: List,
    placeholder: 'Paste ingredient list, one per line:\nAqua\nGlycerine\nNiacinamide\nPhenoxyethanol\n...',
    multiline: true
  },
];

const EXAMPLES = [
  { label: 'Bisphenol A', type: 'name', note: 'Endocrine disruptor' },
  { label: 'Titanium dioxide', type: 'name', note: 'Possible carcinogen' },
  { label: 'Sodium lauryl sulfate', type: 'name', note: 'Common surfactant' },
  { label: 'CC(=O)Oc1ccccc1C(=O)O', type: 'smiles', note: 'Aspirin (SMILES)' },
  { label: 'Parabens', type: 'name', note: 'Preservative class' },
  { label: 'Perfluorooctanoic acid', type: 'name', note: 'PFAS / PFOA' },
];

const LOADING_STEPS = [
  'Querying PubChem compound database',
  'Retrieving bioassay and property data',
  'Cross-referencing EPA CompTox',
  'Running regulatory status check',
  'Generating hazard classification',
  'Calculating environmental fate',
];

export default function MolecularIntelligence() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [queryType, setQueryType] = useState('name');
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [queryHistory, setQueryHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mi_query_history') || '[]'); } catch { return []; }
  });

  const runAnalysis = useCallback(async (q, type) => {
    if (!q?.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => prev < LOADING_STEPS.length - 1 ? prev + 1 : prev);
    }, 1800);

    try {
      // Phase 1: full analysis (PubChem + LLM hazard)
      const response = await getMolecularData({ query: q.trim(), queryType: type || 'name', mode: 'full' });
      const data = response.data;
      setResult(data);

      const entry = { query: q.trim(), type: type || 'name', timestamp: new Date().toISOString() };
      const newHistory = [entry, ...queryHistory.filter(h => h.query !== q.trim())].slice(0, 10);
      setQueryHistory(newHistory);
      localStorage.setItem('mi_query_history', JSON.stringify(newHistory));
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed. Please try again.');
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setLoadingStep(0);
    }
  }, [queryHistory]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const type = params.get('type') || 'name';
    if (q) {
      setQuery(q);
      const matchedType = QUERY_TYPES.find(t => t.id === type);
      if (matchedType) setQueryType(type);
      runAnalysis(q, type);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    runAnalysis(query, queryType);
  };

  const activeType = QUERY_TYPES.find(t => t.id === queryType);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 py-12">
        <AuthGate
          featureName="Molecular Intelligence"
          featureDescription="Hazard scoring, toxicity profiling, and regulatory mapping for any compound. Powered by PubChem, ChEMBL, and EPA CompTox."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Sub-header */}
      <div className="border-b border-slate-700/50 bg-slate-900/60 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-3">
          <button
            onClick={() => navigate(createPageUrl('ResearchPortal'))}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-slate-700" />
          <Atom className="w-3.5 h-3.5 text-[#0D9E8E] flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Molecular Intelligence</span>
          <span className="hidden sm:flex items-center gap-2 ml-auto text-[10px] text-slate-600 font-mono">
            <span>PubChem</span><span className="text-slate-800">·</span><span>ChEMBL</span><span className="text-slate-800">·</span><span>EPA CompTox</span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Input Panel — sticky on desktop */}
          <div className="w-full lg:w-80 xl:w-96 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-28 space-y-3">

              {/* Query type + input */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
                {/* Type selector */}
                <div className="grid grid-cols-4 border-b border-slate-700/50">
                  {QUERY_TYPES.map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => { setQueryType(t.id); setQuery(''); setResult(null); setError(null); }}
                        className={`flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-semibold transition-colors ${
                          queryType === t.id
                            ? 'bg-[#0D9E8E]/10 text-[#0D9E8E] border-b-2 border-[#0D9E8E] -mb-px'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="leading-tight text-center">{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                  {activeType?.multiline ? (
                    <textarea
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder={activeType.placeholder}
                      rows={8}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-[#0D9E8E] focus:ring-1 focus:ring-[#0D9E8E]/40 text-white placeholder-slate-600 text-xs font-mono px-3 py-2.5 rounded-lg outline-none transition-colors resize-none"
                    />
                  ) : (
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder={activeType?.placeholder}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-[#0D9E8E] focus:ring-1 focus:ring-[#0D9E8E]/40 text-white placeholder-slate-600 text-sm font-mono px-3 py-2.5 rounded-lg outline-none transition-colors"
                    />
                  )}
                  <button
                    type="submit"
                    disabled={!query.trim() || isAnalyzing}
                    className="w-full mt-3 py-2.5 bg-[#0D9E8E] hover:bg-[#0b8a7b] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</>
                    ) : (
                      <><Atom className="w-4 h-4" />Analyze Compound</>
                    )}
                  </button>
                </form>
              </div>

              {/* Examples */}
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Examples</p>
                <div className="space-y-1">
                  {EXAMPLES.map(ex => (
                    <button
                      key={ex.label}
                      onClick={() => { setQuery(ex.label); setQueryType(ex.type); runAnalysis(ex.label, ex.type); }}
                      className="w-full text-left flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors group"
                    >
                      <span className="text-xs font-mono text-slate-400 group-hover:text-[#0D9E8E] truncate">{ex.label}</span>
                      <span className="text-[10px] text-slate-600 ml-2 flex-shrink-0">{ex.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Query history */}
              {queryHistory.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent</p>
                    <button
                      onClick={() => { setQueryHistory([]); localStorage.removeItem('mi_query_history'); }}
                      className="text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {queryHistory.slice(0, 6).map((h, i) => (
                      <button
                        key={i}
                        onClick={() => { setQuery(h.query); setQueryType(h.type); runAnalysis(h.query, h.type); }}
                        className="w-full text-left text-xs font-mono text-slate-500 hover:text-slate-200 truncate px-2 py-1.5 rounded hover:bg-slate-800 transition-colors"
                      >
                        {h.query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex-1 min-w-0">
            {!result && !isAnalyzing && !error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-5">
                  <Atom className="w-7 h-7 text-slate-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Enter a compound to analyze</h3>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  Query by name, SMILES, InChI, or paste an ingredient list. All outputs include source citation and confidence scoring.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0D9E8E]/10 border border-[#0D9E8E]/30 flex items-center justify-center mb-6">
                  <Atom className="w-7 h-7 text-[#0D9E8E] animate-pulse" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300 mb-5">Analyzing compound...</h3>
                <div className="space-y-2.5 text-left max-w-xs w-full">
                  {LOADING_STEPS.map((step, i) => (
                    <div key={i} className={`flex items-center gap-2.5 text-xs transition-all duration-500 ${i <= loadingStep ? 'text-slate-300' : 'text-slate-700'}`}>
                      {i < loadingStep ? (
                        <span className="w-3.5 h-3.5 rounded-full bg-[#0D9E8E] flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px] text-white font-bold">✓</span>
                        </span>
                      ) : i === loadingStep ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0D9E8E] flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0" />
                      )}
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && !isAnalyzing && (
              <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-5 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-300 mb-1">Analysis failed</p>
                  <p className="text-xs text-red-400/80">{error}</p>
                </div>
              </div>
            )}

            {result && !isAnalyzing && (
              <CompoundAnalysisResult data={result} query={query} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}