import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { FlaskConical, Upload, BookOpen, Plus, X, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPLATES = [
  { id: 'liquid_cleaner', name: 'Liquid Cleaner Base', ingredients: ['Water', 'Sodium Lauryl Sulfate', 'Cocamidopropyl Betaine', 'Citric Acid', 'Sodium Chloride'] },
  { id: 'shampoo', name: 'Shampoo Base', ingredients: ['Water', 'Sodium Laureth Sulfate', 'Cocamidopropyl Betaine', 'Glycerin', 'Panthenol'] },
  { id: 'moisturiser', name: 'Moisturiser Base', ingredients: ['Water', 'Glycerin', 'Cetyl Alcohol', 'Dimethicone', 'Phenoxyethanol'] },
  { id: 'hand_sanitiser', name: 'Hand Sanitiser', ingredients: ['Ethanol', 'Water', 'Glycerin', 'Hydrogen Peroxide'] },
];

function ScoreRing({ label, score, color }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn('w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white', score !== null ? color : 'bg-slate-200 text-slate-400')}>
        {score !== null ? score : '—'}
      </div>
      <span className="text-xs text-slate-500 font-medium text-center leading-tight">{label}</span>
    </div>
  );
}

export default function FormulaBuilder() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState('manual');
  const [formulaName, setFormulaName] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [scores, setScores] = useState({ safety: null, compliance: null, sustainability: null, carbon: null });
  const fileRef = useRef();
  const debounceRef = useRef();

  if (!user) return (
    <div className="min-h-screen bg-[#F0FAF5] flex items-center justify-center p-6">
      <AuthGate featureName="Formula Builder" featureDescription="Sign in to build and analyse formulas." />
    </div>
  );

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    if (val.length < 2) { setSuggestions([]); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `List 6 real chemical/ingredient names that match "${val}" for cosmetic/cleaning formulas. Return JSON: {"results": ["name1","name2",...]}`,
          response_json_schema: { type: 'object', properties: { results: { type: 'array', items: { type: 'string' } } } }
        });
        setSuggestions(res.results || []);
      } catch { setSuggestions([]); }
      setSearching(false);
    }, 300);
  };

  const addIngredient = (name) => {
    if (!ingredients.find(i => i.name.toLowerCase() === name.toLowerCase())) {
      setIngredients(prev => [...prev, { name, concentration: '' }]);
    }
    setSearch(''); setSuggestions([]);
  };

  const removeIngredient = (idx) => setIngredients(prev => prev.filter((_, i) => i !== idx));
  const updateConc = (idx, val) => setIngredients(prev => prev.map((item, i) => i === idx ? { ...item, concentration: val } : item));

  const applyTemplate = (t) => {
    setFormulaName(t.name);
    setIngredients(t.ingredients.map(name => ({ name, concentration: '' })));
    setTab('manual');
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: 'Extract the full ingredient list from this product label or SDS document. Return JSON with ingredient names.',
        file_urls: [file_url],
        response_json_schema: { type: 'object', properties: { ingredients: { type: 'array', items: { type: 'string' } } } }
      });
      setIngredients((result.ingredients || []).map(name => ({ name, concentration: '' })));
      setTab('manual');
    } catch { alert('Could not read this file. Try manual entry.'); }
    setUploading(false);
  };

  const handleAnalyse = async () => {
    if (ingredients.length === 0) return;
    if (!formulaName.trim()) {
      document.getElementById('formula-name-input')?.focus();
      return;
    }
    setAnalysing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyse this formula for safety, compliance (REACH, FDA, GHS), sustainability, and carbon footprint. Ingredients: ${ingredients.map(i => i.name + (i.concentration ? ` ${i.concentration}%` : '')).join(', ')}. 
        Return scores 0-100 and brief explanations. Also list any flagged ingredients with severity.`,
        response_json_schema: {
          type: 'object',
          properties: {
            safety_score: { type: 'number' },
            compliance_score: { type: 'number' },
            sustainability_score: { type: 'number' },
            carbon_score: { type: 'number' },
            safety_summary: { type: 'string' },
            flagged_ingredients: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, severity: { type: 'string' }, reason: { type: 'string' }, regulation: { type: 'string' } } } },
          }
        }
      });

      const savedFormula = {
        name: formulaName || 'Untitled Formula',
        ingredients: ingredients.map(i => i.name),
        safety_score: result.safety_score,
        compliance_score: result.compliance_score,
        sustainability_score: result.sustainability_score,
        analysis_result: result,
      };

      try {
        const entity = await base44.entities.Formula.create(savedFormula);
        navigate(`/FormulaResults?id=${entity.id}`, { state: { formula: { ...savedFormula, id: entity.id }, analysis: result } });
      } catch {
        navigate('/FormulaResults', { state: { formula: savedFormula, analysis: result } });
      }
    } catch (e) {
      alert('Analysis failed. Please try again.');
    }
    setAnalysing(false);
  };

  return (
    <div className="min-h-screen bg-[#F0FAF5]">
      {analysing && (
        <div className="fixed inset-0 z-50 bg-white/90 flex flex-col items-center justify-center gap-4">
          <div className="flex gap-4">
            {['Safety', 'Compliance', 'Sustainability', 'Carbon'].map((l, i) => (
              <div key={l} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full border-4 border-[#02988C]/20 border-t-[#02988C] animate-spin" style={{ animationDelay: `${i * 0.15}s` }} />
                <span className="text-xs text-slate-500">{l}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-600 font-semibold">Analysing your formula...</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Formula Builder</h1>
          <p className="text-slate-500 mt-1">Build your formula, then get instant Safety, Compliance, Sustainability and Carbon scores.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input panel */}
          <div className="lg:col-span-3 space-y-4">
            <input
              id="formula-name-input"
              value={formulaName}
              onChange={e => setFormulaName(e.target.value)}
              placeholder="Formula name (e.g. Daily Cleanser v2) — required"
              className={cn("w-full px-4 py-3 rounded-xl border-2 bg-white focus:border-[#02988C] outline-none text-slate-800 font-semibold", !formulaName.trim() && ingredients.length > 0 ? "border-amber-400" : "border-slate-200")}
            />

            {/* Method tabs */}
            <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1">
              {[{ id: 'manual', label: 'Enter Manually', icon: FlaskConical }, { id: 'upload', label: 'Upload Label / SDS', icon: Upload }, { id: 'template', label: 'Start from Template', icon: BookOpen }].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all', tab === t.id ? 'bg-[#02988C] text-white' : 'text-slate-500 hover:text-slate-700')}>
                  <t.icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            {tab === 'manual' && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="relative">
                  <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search 1M+ ingredients (e.g. Sodium Lauryl Sulfate)" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#02988C] outline-none text-sm" />
                  {searching && <Loader2 className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 animate-spin" />}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-52 overflow-y-auto">
                      {suggestions.map(s => (
                        <button key={s} onClick={() => addIngredient(s)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F0FAF5] text-slate-700 first:rounded-t-xl last:rounded-b-xl">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {ingredients.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 p-3 bg-[#F0FAF5] rounded-xl">
                      <span className="flex-1 text-sm font-medium text-slate-700 truncate">{item.name}</span>
                      <input value={item.concentration} onChange={e => updateConc(i, e.target.value)} placeholder="%" className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs text-center outline-none focus:border-[#02988C] bg-white" />
                      <span className="text-xs text-slate-400">%</span>
                      <button onClick={() => removeIngredient(i)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {ingredients.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">Search and add ingredients above to build your formula.</p>
                )}
              </div>
            )}

            {tab === 'upload' && (
              <div
                className="bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-[#02988C] transition-colors p-10 text-center cursor-pointer"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files[0]); }}
              >
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
                {uploading ? (
                  <><Loader2 className="w-8 h-8 text-[#02988C] animate-spin mx-auto mb-2" /><p className="text-sm text-slate-500">Extracting ingredients...</p></>
                ) : (
                  <><Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-sm font-semibold text-slate-600">Drop a product label or SDS here</p><p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG — AI extracts the ingredient list automatically</p></>
                )}
              </div>
            )}

            {tab === 'template' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)} className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-[#02988C] hover:bg-[#F0FAF5] transition-all">
                    <p className="font-semibold text-sm text-slate-800 mb-1">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.ingredients.length} base ingredients</p>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleAnalyse} disabled={ingredients.length === 0 || analysing} className={cn('flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base transition-all', ingredients.length > 0 ? 'bg-[#02988C] text-white hover:bg-[#027d72]' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}>
                Analyse Formula <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {ingredients.length > 0 && ingredients.length < 3 && (
              <p className="text-xs text-slate-400 text-center">Add at least 3 ingredients for a more accurate analysis.</p>
            )}
          </div>

          {/* Live score panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-5 text-center">Live Score Preview</h3>
              <div className="grid grid-cols-2 gap-6">
                <ScoreRing label="Safety" score={scores.safety} color="bg-green-500" />
                <ScoreRing label="Compliance" score={scores.compliance} color="bg-blue-500" />
                <ScoreRing label="Sustainability" score={scores.sustainability} color="bg-emerald-500" />
                <ScoreRing label="Carbon" score={scores.carbon} color="bg-teal-500" />
              </div>
              <p className="text-xs text-slate-400 text-center mt-5">Scores appear after you click Analyse Formula</p>
            </div>

            <div className="bg-[#F0FAF5] rounded-xl border border-[#02988C]/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#02988C]" />
                <span className="text-xs font-bold text-[#00281E]">How it works</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li>Add ingredients to your formula</li>
                <li>Click Analyse — results appear in 15 seconds</li>
                <li>Review flagged ingredients and swap for safer alternatives</li>
                <li>Generate compliance reports with one click</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}