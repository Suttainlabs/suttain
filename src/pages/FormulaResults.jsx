import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import AuthContext from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Shield, CheckCircle2, Leaf, Zap, AlertTriangle, ChevronDown, ChevronRight, FileText, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function ScoreBadge({ score, size = 'md' }) {
  const color = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const sizes = { sm: 'w-10 h-10 text-xs', md: 'w-14 h-14 text-sm', lg: 'w-20 h-20 text-lg' };
  return <div className={cn('rounded-full flex items-center justify-center font-bold text-white', color, sizes[size])}>{score ?? '--'}</div>;
}

const SEVERITY_STYLES = {
  informational: 'bg-blue-50 text-blue-700 border-blue-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
  critical: 'bg-red-100 text-red-900 border-red-300',
};

export default function FormulaResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formula, setFormula] = useState(location.state?.formula || null);
  const [analysis, setAnalysis] = useState(location.state?.analysis || null);
  const [expandedBreakdown, setExpandedBreakdown] = useState(null);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    if (!location.state) {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) {
        base44.entities.Formula.filter({ id }).then(res => {
          if (res[0]) {
            setFormula(res[0]);
            setAnalysis(res[0].analysis_result);
          }
          setLoading(false);
        }).catch(() => setLoading(false));
      } else setLoading(false);
    }
  }, []);

  if (loading) return <div className="min-h-screen bg-[#F0FAF5] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#02988C]/20 border-t-[#02988C] rounded-full animate-spin" /></div>;
  if (!formula || !analysis) return (
    <div className="min-h-screen bg-[#F0FAF5] flex flex-col items-center justify-center gap-4">
      <p className="text-slate-500">No formula results found.</p>
      <Link to="/FormulaBuilder" className="px-5 py-2.5 bg-[#02988C] text-white rounded-xl font-semibold">Build a Formula</Link>
    </div>
  );

  const flagged = analysis.flagged_ingredients || [];
  const maxScore = Math.max(analysis.safety_score || 0, analysis.compliance_score || 0, analysis.sustainability_score || 0);
  const bannerStatus = flagged.some(f => f.severity === 'critical' || f.severity === 'high') ? 'red' : flagged.length > 0 ? 'amber' : 'green';

  const scores = [
    { label: 'Safety', value: analysis.safety_score, icon: Shield, color: 'bg-green-500' },
    { label: 'Compliance', value: analysis.compliance_score, icon: CheckCircle2, color: 'bg-blue-500' },
    { label: 'Sustainability', value: analysis.sustainability_score, icon: Leaf, color: 'bg-emerald-500' },
    { label: 'Carbon', value: analysis.carbon_score, icon: Zap, color: 'bg-teal-500' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDF7F2' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{formula.name || 'Formula Analysis'}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Analysis complete — review your scores and flagged ingredients below.</p>
          </div>
          <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Edit Formula
          </button>
        </div>

        {/* Status banner */}
        <div className={cn('rounded-xl px-5 py-3 mb-6 flex items-center gap-3 text-sm font-semibold', bannerStatus === 'green' ? 'bg-green-50 text-green-800 border border-green-200' : bannerStatus === 'amber' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-red-50 text-red-800 border border-red-200')}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {bannerStatus === 'green' ? 'Your formula passed all checks.' : bannerStatus === 'amber' ? `${flagged.length} ingredient${flagged.length > 1 ? 's' : ''} need${flagged.length === 1 ? 's' : ''} your attention.` : 'Action required before this formula can be sold in some markets.'}
        </div>

        {/* Score summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {scores.map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0', s.value >= 75 ? 'bg-green-500' : s.value >= 50 ? 'bg-amber-500' : 'bg-red-500')}>
                {s.value ?? '--'}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                <p className="text-xs font-semibold text-slate-600">{s.value >= 75 ? 'Good' : s.value >= 50 ? 'Review needed' : 'Action required'}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Flagged ingredients */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              {flagged.length > 0 ? `${flagged.length} Flagged Ingredient${flagged.length > 1 ? 's' : ''}` : 'All Ingredients Clear'}
            </h2>
            {flagged.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-800 font-semibold text-sm">No flagged ingredients found.</p>
              </div>
            )}
            {flagged.map((item, i) => (
              <div key={i} className={cn('border rounded-xl p-4', SEVERITY_STYLES[item.severity?.toLowerCase()] || SEVERITY_STYLES.informational)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{item.name}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold border', SEVERITY_STYLES[item.severity?.toLowerCase()] || SEVERITY_STYLES.informational)}>
                        {item.severity || 'Informational'}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-80">{item.reason}</p>
                    {item.regulation && <p className="text-xs mt-1 opacity-60">Regulation: {item.regulation}</p>}
                  </div>
                </div>
                <Link to={`/IngredientSubstitution?ingredient=${encodeURIComponent(item.name)}&formulaName=${encodeURIComponent(formula.name || '')}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity">
                  <ArrowLeftRight className="w-3.5 h-3.5" /> See Alternatives
                </Link>
              </div>
            ))}

            {/* All ingredients list */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <button onClick={() => setExpandedBreakdown(expandedBreakdown === 'ingredients' ? null : 'ingredients')} className="w-full flex items-center justify-between text-sm font-semibold text-slate-700">
                All Ingredients ({(formula.ingredients || []).length})
                <ChevronDown className={cn('w-4 h-4 transition-transform', expandedBreakdown === 'ingredients' && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {expandedBreakdown === 'ingredients' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-3 space-y-1.5">
                      {(formula.ingredients || []).map((name, i) => {
                        const flag = flagged.find(f => f.name?.toLowerCase() === name?.toLowerCase());
                        return (
                          <div key={i} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm', flag ? 'border-l-2 border-red-400 bg-red-50' : 'bg-slate-50')}>
                            <span className="flex-1 text-slate-700">{name}</span>
                            {flag && <span className="text-xs text-red-600 font-medium">{flag.severity}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Score breakdown + actions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Analysis Summary</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{analysis.safety_summary || 'Your formula has been analysed against global safety and compliance standards.'}</p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Based on REACH, FDA, GHS, TSCA databases — High confidence</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Link to={`/ReportGenerator?formulaName=${encodeURIComponent(formula.name || '')}`} className="flex items-center justify-between w-full px-5 py-3 bg-[#02988C] text-white rounded-xl text-sm font-semibold hover:bg-[#027d72] transition-colors">
                Generate Report <FileText className="w-4 h-4" />
              </Link>
              {flagged.length > 0 && (
                <Link to={`/IngredientSubstitution?ingredient=${encodeURIComponent(flagged[0].name)}&formulaName=${encodeURIComponent(formula.name || '')}`} className="flex items-center justify-between w-full px-5 py-3 bg-white border-2 border-[#02988C] text-[#02988C] rounded-xl text-sm font-semibold hover:bg-[#F0FAF5] transition-colors">
                  Find Alternatives <ArrowLeftRight className="w-4 h-4" />
                </Link>
              )}
              <Link to="/Simulator" className="flex items-center justify-between w-full px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-[#F0FAF5] transition-colors">
                Open in Simulator <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}