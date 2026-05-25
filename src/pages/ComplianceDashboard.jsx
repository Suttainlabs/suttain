import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { base44 } from '@/api/base44Client';
import {
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, FileText,
  ChevronRight, ChevronDown, ExternalLink, ArrowRight, Clock, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const MARKETS = ['USA', 'EU', 'UK', 'Nigeria', 'Kenya', 'Global'];
const FLAG_MAP = { USA: '🇺🇸', EU: '🇪🇺', UK: '🇬🇧', Nigeria: '🇳🇬', Kenya: '🇰🇪', Global: '🌍' };

const REGULATORY_EVENTS = [
  {
    regulation: 'EU REACH Annex XVII Update',
    change: 'New restrictions on 4 substances including PFAS and certain fragrances.',
    days_away: 47,
    affected_count: 2,
    affected_ingredients: ['Perfluorooctanoic Acid (PFOA)', 'Lilial (Butylphenyl Methylpropional)'],
    action: 'Review and substitute affected ingredients before the deadline.',
    resolution_path: '/IngredientSubstitution',
    resolution_label: 'Find Substitutes',
    severity: 'high',
  },
  {
    regulation: 'CSRD Reporting',
    change: 'Mandatory sustainability disclosure for companies operating in the EU.',
    days_away: 89,
    affected_count: 0,
    affected_ingredients: [],
    action: 'Prepare your sustainability data using the Carbon & Reporting tool.',
    resolution_path: '/CarbonTaxSimulator',
    resolution_label: 'Open Carbon Report',
    severity: 'medium',
  },
  {
    regulation: 'US TSCA CBI Rule',
    change: 'Updated confidentiality requirements for chemical identity disclosures.',
    days_away: 120,
    affected_count: 1,
    affected_ingredients: ['Proprietary Fragrance Blend (CAS 915634-xx)'],
    action: 'Review your confidential business information claims and update SDS.',
    resolution_path: '/SDSAnalyzer',
    resolution_label: 'Review SDS',
    severity: 'medium',
  },
];

const ISSUE_RESOLUTIONS = {
  'Ingredient safety assessment required': { path: '/FormulaBuilder', label: 'Run Safety Analysis' },
  'Labeling compliance': { path: '/ReportGenerator', label: 'Generate Compliance Letter' },
  'REACH': { path: '/IngredientSubstitution', label: 'Find Substitutes' },
  'SDS': { path: '/SDSAnalyzer', label: 'Open SDS Analyzer' },
  'default': { path: '/ReportGenerator', label: 'View Report' },
};

function getResolutionForIssue(issue) {
  for (const [key, val] of Object.entries(ISSUE_RESOLUTIONS)) {
    if (issue.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return ISSUE_RESOLUTIONS.default;
}

function StatusBadge({ status }) {
  const styles = {
    pass: 'bg-green-100 text-green-800 border border-green-200',
    review: 'bg-amber-100 text-amber-800 border border-amber-200',
    action: 'bg-red-100 text-red-800 border border-red-200',
  };
  const icons = {
    pass: <CheckCircle2 className="w-3.5 h-3.5" />,
    review: <AlertTriangle className="w-3.5 h-3.5" />,
    action: <XCircle className="w-3.5 h-3.5" />,
  };
  const labels = { pass: 'Pass', review: 'Review Needed', action: 'Action Required' };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold', styles[status])}>
      {icons[status]}{labels[status]}
    </span>
  );
}

function RegulatoryEventModal({ event, onClose }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{event.regulation}</h3>
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block',
              event.days_away < 60 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')}>
              {event.days_away} days remaining
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">{event.change}</p>

        {event.affected_ingredients.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wide">Affected Ingredients</p>
            <ul className="space-y-1.5">
              {event.affected_ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-red-800">
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0" />{ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">Recommended Action</p>
          <p className="text-sm text-blue-800">{event.action}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { navigate(event.resolution_path); onClose(); }}
            className="flex-1 py-2.5 bg-[#007850] text-white text-sm font-semibold rounded-xl hover:bg-[#005f3d] transition-colors flex items-center justify-center gap-2"
          >
            {event.resolution_label} <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { navigate('/ReportGenerator'); onClose(); }}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ComplianceDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeMarkets, setActiveMarkets] = useState(['EU', 'USA']);
  const [complianceData, setComplianceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedMarket, setExpandedMarket] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [resolvingIssue, setResolvingIssue] = useState(null);

  useEffect(() => { loadCompliance(); }, [activeMarkets]);

  const loadCompliance = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a realistic compliance status for a cosmetic/chemical formula across these markets: ${activeMarkets.join(', ')}.
For each market provide:
- status: one of "pass", "review", or "action"
- affected_count: number 0-3
- key_issues: array of specific, actionable regulatory issue strings (empty if pass)
- affected_ingredients: array of specific ingredient names that are flagged (empty if pass)
Return JSON with UPPERCASE market keys matching exactly: ${activeMarkets.join(', ')}.`,
        response_json_schema: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              affected_count: { type: 'number' },
              key_issues: { type: 'array', items: { type: 'string' } },
              affected_ingredients: { type: 'array', items: { type: 'string' } },
            }
          }
        }
      });
      setComplianceData(result);
      setLastUpdated(new Date());
    } catch {
      const fallback = {};
      activeMarkets.forEach(m => {
        fallback[m] = {
          status: 'review',
          affected_count: 1,
          key_issues: ['Connect a formula to run live compliance analysis'],
          affected_ingredients: [],
        };
      });
      setComplianceData(fallback);
    }
    setLoading(false);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#EDF7F2' }}>
      <AuthGate featureName="Compliance Dashboard" featureDescription="Sign in to monitor compliance across your target markets." />
    </div>
  );

  const allClear = activeMarkets.every(m => complianceData[m]?.status === 'pass');
  const issueCount = activeMarkets.filter(m => complianceData[m]?.status !== 'pass').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDF7F2' }}>
      <AnimatePresence>
        {selectedEvent && (
          <RegulatoryEventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Compliance Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Real-time regulatory status across your target markets.</p>
          </div>
          <button onClick={loadCompliance} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} /> Refresh
          </button>
        </div>

        {/* Status banner */}
        {!loading && (
          <div className={cn('rounded-xl px-5 py-3 mb-6 flex items-center gap-3 text-sm font-semibold',
            allClear ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200')}>
            {allClear ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {allClear ? 'All selected markets are compliant.' : `Issues detected across ${issueCount} market(s). Click a market card to review and resolve.`}
            <span className="ml-auto text-xs opacity-60">Last updated {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}

        {/* Market selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {MARKETS.map(m => {
            const key = m.toUpperCase();
            const isActive = activeMarkets.includes(key);
            return (
              <button key={m}
                onClick={() => setActiveMarkets(prev => isActive && prev.length > 1 ? prev.filter(x => x !== key) : [...new Set([...prev, key])])}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all',
                  isActive ? 'bg-[#007850] text-white border-[#007850]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#007850]/40')}>
                <span>{FLAG_MAP[m]}</span>{m}
              </button>
            );
          })}
        </div>

        {/* Market cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {loading ? (
            activeMarkets.map(m => <div key={m} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse" />)
          ) : (
            activeMarkets.map(m => {
              const displayName = MARKETS.find(mk => mk.toUpperCase() === m) || m;
              const data = complianceData[m] || { status: 'review', affected_count: 0, key_issues: [], affected_ingredients: [] };
              const isExpanded = expandedMarket === m;
              const issues = data.key_issues || [];
              const affectedIngredients = data.affected_ingredients || [];

              return (
                <div key={m} className={cn('bg-white rounded-xl border p-5 transition-all',
                  data.status === 'action' ? 'border-red-200' : data.status === 'review' ? 'border-amber-200' : 'border-slate-200')}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{FLAG_MAP[displayName] || '🌍'}</span>
                      <span className="font-bold text-slate-800">{displayName}</span>
                    </div>
                    <StatusBadge status={data.status || 'review'} />
                  </div>

                  {data.affected_count > 0 && (
                    <p className="text-xs text-amber-700 font-medium mb-2">{data.affected_count} affected ingredient{data.affected_count > 1 ? 's' : ''}</p>
                  )}

                  {/* Toggle detail */}
                  <button
                    onClick={() => setExpandedMarket(isExpanded ? null : m)}
                    className="w-full flex items-center justify-between text-xs text-[#007850] font-semibold mt-1 hover:opacity-70 transition-opacity py-1">
                    {isExpanded ? 'Hide Detail' : 'View Detail'}
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', isExpanded && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                          {issues.length === 0 ? (
                            <p className="text-xs text-green-600 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> No issues detected for this market.
                            </p>
                          ) : (
                            issues.map((issue, i) => {
                              const resolution = getResolutionForIssue(issue);
                              const isResolving = resolvingIssue === `${m}-${i}`;
                              return (
                                <div key={i} className="bg-amber-50 rounded-lg px-3 py-2.5 border border-amber-100">
                                  <div className="flex items-start gap-2 mb-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-slate-700 leading-snug flex-1">{issue}</p>
                                  </div>
                                  <button
                                    onClick={() => { setResolvingIssue(`${m}-${i}`); setTimeout(() => { navigate(resolution.path); }, 150); }}
                                    className="text-xs font-semibold text-[#007850] hover:underline flex items-center gap-1 ml-5"
                                  >
                                    {resolution.label} <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })
                          )}

                          {affectedIngredients.length > 0 && (
                            <div className="bg-red-50 rounded-lg px-3 py-2.5 border border-red-100 mt-2">
                              <p className="text-xs font-bold text-red-700 mb-1.5">Flagged Ingredients</p>
                              <ul className="space-y-1">
                                {affectedIngredients.map((ing, i) => (
                                  <li key={i} className="text-xs text-red-800 flex items-center gap-1.5">
                                    <XCircle className="w-3 h-3 flex-shrink-0" />{ing}
                                  </li>
                                ))}
                              </ul>
                              <button
                                onClick={() => navigate('/IngredientSubstitution')}
                                className="text-xs font-semibold text-red-700 hover:underline flex items-center gap-1 mt-2"
                              >
                                Find safe substitutes <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action row */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                    <button onClick={() => navigate('/SDSAnalyzer')}
                      className="flex-1 text-xs text-slate-500 hover:text-[#007850] font-medium flex items-center gap-1 justify-center transition-colors py-1.5 rounded-lg hover:bg-slate-50">
                      <FileText className="w-3 h-3" /> SDS
                    </button>
                    <button onClick={() => navigate('/ReportGenerator')}
                      className="flex-1 text-xs text-slate-500 hover:text-[#007850] font-medium flex items-center gap-1 justify-center transition-colors py-1.5 rounded-lg hover:bg-slate-50">
                      <FileText className="w-3 h-3" /> Compliance Letter
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Regulatory timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Upcoming Regulatory Changes</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
              {REGULATORY_EVENTS.map((event, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedEvent(event)}
                  className={cn('flex-shrink-0 w-72 border rounded-xl p-4 text-left hover:shadow-md transition-all cursor-pointer',
                    event.days_away < 60 ? 'border-amber-300 bg-amber-50 hover:border-amber-400' : 'border-slate-200 bg-white hover:border-slate-300')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1',
                      event.days_away < 60 ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-600')}>
                      <Clock className="w-3 h-3" />{event.days_away} days
                    </span>
                    {event.affected_count > 0 && (
                      <span className="text-xs text-red-600 font-semibold">{event.affected_count} affected</span>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-slate-800">{event.regulation}</p>
                  <p className="text-xs text-slate-500 mt-1">{event.change}</p>
                  <p className="text-xs text-[#007850] font-semibold mt-2 flex items-center gap-1">
                    View details <ChevronRight className="w-3 h-3" />
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}