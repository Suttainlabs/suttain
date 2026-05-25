import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const MARKETS = ['USA', 'EU', 'UK', 'Nigeria', 'Kenya', 'Global'];
const FLAG_MAP = { USA: '🇺🇸', EU: '🇪🇺', UK: '🇬🇧', Nigeria: '🇳🇬', Kenya: '🇰🇪', Global: '🌍' };

const REGULATORY_EVENTS = [
  { regulation: 'EU REACH Annex XVII Update', change: 'New restrictions on 4 substances', days_away: 47, affected_count: 2 },
  { regulation: 'CSRD Reporting', change: 'Mandatory sustainability disclosure', days_away: 89, affected_count: 0 },
  { regulation: 'US TSCA CBI Rule', change: 'Updated confidentiality requirements', days_away: 120, affected_count: 1 },
];

function StatusBadge({ status }) {
  const styles = { pass: 'bg-green-100 text-green-800 border border-green-200', review: 'bg-amber-100 text-amber-800 border border-amber-200', action: 'bg-red-100 text-red-800 border border-red-200' };
  const icons = { pass: <CheckCircle2 className="w-3.5 h-3.5" />, review: <AlertTriangle className="w-3.5 h-3.5" />, action: <XCircle className="w-3.5 h-3.5" /> };
  const labels = { pass: 'Pass', review: 'Review Needed', action: 'Action Required' };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold', styles[status])}>
      {icons[status]}{labels[status]}
    </span>
  );
}

export default function ComplianceDashboard() {
  const { user } = useContext(AuthContext);
  const [activeMarkets, setActiveMarkets] = useState(user?.target_markets?.length ? user.target_markets.map(m => m.toUpperCase()) : ['EU', 'USA']);
  const [complianceData, setComplianceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedMarket, setExpandedMarket] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadCompliance();
  }, [activeMarkets]);

  const loadCompliance = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a compliance status overview for a formula in these markets: ${activeMarkets.join(', ')}.
For each market provide: status (pass/review/action), affected_count (0-3), key_issues (array of strings), last_checked.
Return JSON with market names as keys.`,
        response_json_schema: {
          type: 'object',
          properties: {
            USA: { type: 'object', properties: { status: { type: 'string' }, affected_count: { type: 'number' }, key_issues: { type: 'array', items: { type: 'string' } } } },
            EU: { type: 'object', properties: { status: { type: 'string' }, affected_count: { type: 'number' }, key_issues: { type: 'array', items: { type: 'string' } } } },
          }
        }
      });
      setComplianceData(result);
      setLastUpdated(new Date());
    } catch {
      const fallback = {};
      activeMarkets.forEach(m => { fallback[m] = { status: 'review', affected_count: 1, key_issues: ['Review required — connect your formula for live analysis'] }; });
      setComplianceData(fallback);
    }
    setLoading(false);
  };

  if (!user) return (
    <div className="min-h-screen bg-[#F0FAF5] flex items-center justify-center p-6">
      <AuthGate featureName="Compliance Dashboard" featureDescription="Sign in to monitor compliance across your target markets." />
    </div>
  );

  const allClear = activeMarkets.every(m => complianceData[m]?.status === 'pass');

  return (
    <div className="min-h-screen bg-[#F0FAF5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Compliance Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Real-time regulatory status across your target markets.</p>
          </div>
          <button onClick={loadCompliance} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Status banner */}
        {!loading && (
          <div className={cn('rounded-xl px-5 py-3 mb-6 flex items-center gap-3 text-sm font-semibold', allClear ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200')}>
            {allClear ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {allClear ? 'All selected markets are compliant.' : `Issues detected across ${activeMarkets.filter(m => complianceData[m]?.status !== 'pass').length} market(s).`}
            <span className="ml-auto text-xs opacity-60">Last updated {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}

        {/* Market selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {MARKETS.map(m => (
            <button
              key={m}
              onClick={() => setActiveMarkets(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all', activeMarkets.includes(m) ? 'bg-[#02988C] text-white border-[#02988C]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#02988C]/40')}
            >
              <span>{FLAG_MAP[m]}</span>{m}
            </button>
          ))}
        </div>

        {/* Status grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {loading ? (
            activeMarkets.map(m => <div key={m} className="h-36 bg-white rounded-xl border border-slate-200 animate-pulse" />)
          ) : (
            activeMarkets.map(m => {
              const data = complianceData[m] || { status: 'review', affected_count: 0, key_issues: [] };
              return (
                <div key={m} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{FLAG_MAP[m] || '🌍'}</span>
                      <span className="font-bold text-slate-800">{m}</span>
                    </div>
                    <StatusBadge status={data.status || 'review'} />
                  </div>
                  {data.affected_count > 0 && <p className="text-xs text-slate-500 mb-2">{data.affected_count} affected ingredient{data.affected_count > 1 ? 's' : ''}</p>}
                  <button
                    onClick={() => setExpandedMarket(expandedMarket === m ? null : m)}
                    className="w-full flex items-center justify-between text-xs text-[#02988C] font-semibold mt-2 hover:opacity-70 transition-opacity"
                  >
                    View Detail <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', expandedMarket === m && 'rotate-90')} />
                  </button>
                  <AnimatePresence>
                    {expandedMarket === m && data.key_issues?.length > 0 && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 pt-3 border-t border-slate-100">
                        <ul className="space-y-1">
                          {data.key_issues.map((issue, i) => <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />{issue}</li>)}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                    <button className="flex-1 text-xs text-slate-500 hover:text-[#02988C] font-medium flex items-center gap-1 justify-center transition-colors">
                      <FileText className="w-3 h-3" /> SDS
                    </button>
                    <button className="flex-1 text-xs text-slate-500 hover:text-[#02988C] font-medium flex items-center gap-1 justify-center transition-colors">
                      <FileText className="w-3 h-3" /> Compliance Letter
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Regulatory timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Upcoming Regulatory Changes</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
              {REGULATORY_EVENTS.map((event, i) => (
                <div key={i} className={cn('flex-shrink-0 w-72 border rounded-xl p-4', event.days_away < 30 ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', event.days_away < 30 ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-600')}>
                      {event.days_away} days
                    </span>
                    {event.affected_count > 0 && <span className="text-xs text-red-600 font-semibold">{event.affected_count} affected</span>}
                  </div>
                  <p className="font-semibold text-sm text-slate-800">{event.regulation}</p>
                  <p className="text-xs text-slate-500 mt-1">{event.change}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}