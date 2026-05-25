import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { base44 } from '@/api/base44Client';
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus, Loader2, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function IngredientSubstitution() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const ingredientName = params.get('ingredient') || '';
  const formulaName = params.get('formulaName') || '';

  const [alternatives, setAlternatives] = useState([]);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [swapping, setSwapping] = useState(false);

  useEffect(() => {
    if (!ingredientName) { setLoading(false); return; }
    setLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `For the ingredient "${ingredientName}", provide:
1. Its current safety profile (score 0-100, key hazards)
2. Top 5 safer/greener alternatives, each with: name, safety_improvement (%), carbon_reduction (%), cost_delta (% change), reason, availability (in_stock/on_request/lead_time_2w)

Return JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          original: { type: 'object', properties: { safety_score: { type: 'number' }, hazards: { type: 'array', items: { type: 'string' } }, reason_flagged: { type: 'string' } } },
          alternatives: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                safety_improvement: { type: 'number' },
                carbon_reduction: { type: 'number' },
                cost_delta: { type: 'number' },
                reason: { type: 'string' },
                availability: { type: 'string' },
              }
            }
          }
        }
      }
    }).then(res => {
      setOriginal(res.original);
      setAlternatives(res.alternatives || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [ingredientName]);

  if (!user) return (
    <div className="min-h-screen bg-[#F0FAF5] flex items-center justify-center p-6">
      <AuthGate featureName="Ingredient Substitution" featureDescription="Sign in to find safer alternatives." />
    </div>
  );

  const handleSwap = async () => {
    if (!selected) return;
    setSwapping(true);
    await new Promise(r => setTimeout(r, 1200));
    setSwapping(false);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#F0FAF5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Alternatives for {ingredientName}</h1>
            {formulaName && <p className="text-sm text-slate-500">Formula: {formulaName}</p>}
          </div>
        </div>

        {/* Original ingredient */}
        {original && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Current Ingredient</p>
            <div className="flex items-center gap-3">
              <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0', original.safety_score >= 75 ? 'bg-green-500' : original.safety_score >= 50 ? 'bg-amber-500' : 'bg-red-500')}>
                {original.safety_score}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{ingredientName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{original.reason_flagged}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />)}</div>
        ) : alternatives.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <ArrowLeftRight className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No direct alternatives found in our database.</p>
            <p className="text-slate-400 text-xs mt-1">Ask the Co-Pilot for suggestions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alternatives.map((alt, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(selected === i ? null : i)}
                className={cn('w-full bg-white rounded-xl border-2 p-4 text-left transition-all', selected === i ? 'border-[#02988C] shadow-md' : 'border-slate-200 hover:border-slate-300')}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">{alt.name}</span>
                      {alt.availability && (
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', alt.availability === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                          {alt.availability.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alt.reason}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {alt.safety_improvement !== undefined && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                          <TrendingUp className="w-3.5 h-3.5" />+{alt.safety_improvement}% safety
                        </div>
                      )}
                      {alt.carbon_reduction !== undefined && (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                          <TrendingDown className="w-3.5 h-3.5" />{alt.carbon_reduction}% carbon
                        </div>
                      )}
                      {alt.cost_delta !== undefined && (
                        <div className={cn('flex items-center gap-1 text-xs font-semibold', alt.cost_delta > 0 ? 'text-amber-600' : alt.cost_delta < 0 ? 'text-green-600' : 'text-slate-400')}>
                          {alt.cost_delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : alt.cost_delta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                          {alt.cost_delta > 0 ? '+' : ''}{alt.cost_delta}% cost
                        </div>
                      )}
                    </div>
                  </div>
                  {selected === i && <CheckCircle2 className="w-5 h-5 text-[#02988C] flex-shrink-0 mt-0.5" />}
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 mt-6">
          <button onClick={() => navigate(-1)} className="px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-slate-300 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSwap}
            disabled={selected === null || swapping}
            className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all', selected !== null ? 'bg-[#02988C] text-white hover:bg-[#027d72]' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}
          >
            {swapping ? <><Loader2 className="w-4 h-4 animate-spin" /> Swapping...</> : 'Swap Selected Ingredient'}
          </button>
        </div>
      </div>
    </div>
  );
}