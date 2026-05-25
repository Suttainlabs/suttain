import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { Shield, CheckCircle2, Leaf, AlertTriangle, ChevronRight, Zap, FlaskConical, Atom, QrCode, ShoppingBag, TrendingUp, Sparkles, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const CLARA_SYSTEM = `You are Clara, Suttain's AI assistant. Keep responses SHORT (2-4 sentences max), plain text only, no markdown. Help with formulas, compliance, ingredients, carbon exposure, sustainability, and platform navigation.`;

function ClaraInlineChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setMessages(prev => [...prev, { role: 'user', content }]);
    setInput('');
    setLoading(true);
    try {
      const history = [...messages, { role: 'user', content }]
        .map(m => `${m.role === 'user' ? 'User' : 'Clara'}: ${m.content}`).join('\n');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${CLARA_SYSTEM}\n\nConversation:\n${history}\n\nRespond as Clara:`,
        model: 'gpt_5_mini'
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Having trouble connecting. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ['Check my formula against EU REACH', 'Find greener alternatives to SLS', 'Estimated carbon tax for US market?'];

  return (
    <div className="bg-gradient-to-br from-[#1a0533] to-slate-900 rounded-xl overflow-hidden flex flex-col" style={{ height: '420px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-r from-[#02988C] to-[#09D2FF] rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Clara — AI Assistant</p>
          <p className="text-white/50 text-xs">Suttain Platform Guide</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="pt-2 space-y-1.5">
            <p className="text-white/60 text-xs mb-3 leading-relaxed">Ask about formulas, compliance, carbon exposure, or ingredient safety.</p>
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)} className="w-full text-left text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-white/80">
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              m.role === 'user' ? 'bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white' : 'bg-white/10 text-white/90'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-teal-400" />
              <span className="text-xs text-white/60">Clara is typing...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask Clara anything..."
            disabled={loading}
            className="flex-1 text-xs bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 bg-gradient-to-r from-[#02988C] to-[#09D2FF] rounded-lg flex items-center justify-center disabled:opacity-40 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score, size = 'md' }) {
  const color = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const sizes = { sm: 'w-10 h-10 text-xs', md: 'w-14 h-14 text-sm', lg: 'w-20 h-20 text-base' };
  return (
    <div className={cn('rounded-full flex items-center justify-center font-bold text-white flex-shrink-0', color, sizes[size])}>
      {score ?? '--'}
    </div>
  );
}

function MetricCard({ title, value, context, icon: Icon, borderColor, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn('bg-white rounded-xl p-5 text-left shadow-sm border border-slate-100 border-l-4 w-full', borderColor)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
          <p className="text-xs text-slate-500 mt-1 leading-snug">{context}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-slate-400">
        View detail <ChevronRight className="w-3 h-3" />
      </div>
    </motion.button>
  );
}

export default function Dashboard() {
  const { user, openAuthModal } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formulas, setFormulas] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!user) return;
    const isNew = !sessionStorage.getItem('suttain_welcome_shown');
    if (isNew && user.first_login === false) {
      const savedStep = localStorage.getItem('suttain_onboarding_progress');
      if (!savedStep) {
        setShowWelcome(true);
        sessionStorage.setItem('suttain_welcome_shown', '1');
      }
    }
    Promise.all([
      base44.entities.Formula ? base44.entities.Formula.list('-updated_date', 5).catch(() => []) : Promise.resolve([]),
      base44.entities.BarcodeHistory ? base44.entities.BarcodeHistory.list('-created_date', 5).catch(() => []) : Promise.resolve([]),
    ]).then(([f, s]) => {
      setFormulas(f);
      setScans(s);
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F0FAF5] flex items-center justify-center p-6">
        <AuthGate featureName="Dashboard" featureDescription="Sign in to access your personalised command centre." />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user.full_name?.split(' ')[0] || 'there';

  const safetyScore = user.latest_safety_score ?? null;
  const hasFormulas = formulas.length > 0;
  const complianceStatus = user.target_markets?.length ? user.target_markets.join(', ') : hasFormulas ? 'Review ready' : 'Go to dashboard';
  const complianceContext = user.target_markets?.length
    ? `Monitoring ${user.target_markets.length} market${user.target_markets.length > 1 ? 's' : ''}`
    : hasFormulas
    ? 'Open Compliance Dashboard to check your formulas'
    : 'Analyse a formula to activate compliance checks';
  const carbonExposure = user.estimated_carbon_exposure ?? null;
  const sourcingAlerts = user.sourcing_alerts_count ?? 0;

  const quickActions = [
    { label: 'Scan Product', icon: QrCode, path: '/BarcodeScanner', color: 'bg-[#02988C]' },
    { label: 'Analyse Formula', icon: FlaskConical, path: '/FormulaBuilder', color: 'bg-[#9531F5]' },
    { label: 'Run Simulation', icon: Atom, path: '/Simulator', color: 'bg-[#09D2FF] text-slate-800' },
    { label: 'Marketplace', icon: ShoppingBag, path: '/Marketplace', color: 'bg-slate-800' },
  ];

  const recentActivity = [
    ...formulas.map(f => ({ type: 'formula', name: f.name || 'Unnamed Formula', score: f.safety_score, time: f.updated_date, id: f.id })),
    ...scans.map(s => ({ type: 'scan', name: s.product_name, score: null, time: s.created_date, id: s.id })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#F0FAF5]">
      {/* Welcome overlay */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-[#02988C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-[#02988C]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your dashboard is ready, {firstName}</h2>
            <p className="text-slate-500 text-sm mb-6">Start your first analysis to see your Safety, Compliance, and Sustainability scores come to life.</p>
            <button onClick={() => { setShowWelcome(false); navigate('/FormulaBuilder'); }} className="w-full py-3 bg-[#02988C] text-white font-semibold rounded-xl hover:bg-[#027d72] transition-colors">
              Start Your First Analysis
            </button>
            <button onClick={() => setShowWelcome(false)} className="mt-3 text-sm text-slate-400 hover:text-slate-600">Explore first</button>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="text-3xl font-bold text-slate-900">{greeting}, {firstName}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map(({ label, icon: Icon, path, color }) => (
              <Link key={label} to={path} className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90', color)}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard title="Safety Score" value={safetyScore !== null ? safetyScore : '—'} context={safetyScore ? `${safetyScore >= 75 ? 'Looking good' : safetyScore >= 50 ? 'Needs review' : 'Action required'}` : 'Run your first scan to see your score'} icon={Shield} borderColor="border-l-green-500" onClick={() => navigate('/FormulaBuilder')} />
          <MetricCard title="Compliance" value={complianceStatus} context={complianceContext} icon={CheckCircle2} borderColor="border-l-blue-500" onClick={() => navigate('/ComplianceDashboard')} />
          <MetricCard title="Carbon Exposure" value={carbonExposure ? `$${carbonExposure.toLocaleString()}` : '—'} context="Estimated annual carbon tax exposure" icon={Leaf} borderColor="border-l-emerald-500" onClick={() => navigate('/CarbonTaxSimulator')} />
          <MetricCard title="Sourcing Alerts" value={sourcingAlerts} context={sourcingAlerts > 0 ? `${sourcingAlerts} ingredient${sourcingAlerts > 1 ? 's' : ''} with greener alternatives available` : 'No active sourcing alerts'} icon={AlertTriangle} borderColor="border-l-amber-500" onClick={() => navigate('/Marketplace')} />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
              <Link to="/FormulaHistory" className="text-xs text-[#02988C] font-semibold hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <FlaskConical className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No activity yet. Run your first formula analysis.</p>
                <Link to="/FormulaBuilder" className="mt-4 inline-block px-5 py-2.5 bg-[#02988C] text-white text-sm font-semibold rounded-xl hover:bg-[#027d72] transition-colors">Analyse a Formula</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F0FAF5] transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {item.type === 'formula' ? <FlaskConical className="w-4 h-4 text-[#02988C]" /> : <QrCode className="w-4 h-4 text-[#9531F5]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.type === 'formula' ? 'Formula' : 'Scan'} · {item.time ? new Date(item.time).toLocaleDateString() : 'Recently'}</p>
                    </div>
                    {item.score !== undefined && item.score !== null && <ScoreBadge score={item.score} size="sm" />}
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clara inline chatbot */}
          <div className="space-y-4">
            <ClaraInlineChat />

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#02988C]" /> Quick Tips</h3>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#02988C] mt-1.5 flex-shrink-0" />Add your target markets in Settings to activate compliance monitoring</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#9531F5] mt-1.5 flex-shrink-0" />Scan a product barcode to get an instant safety verdict</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />Use the Carbon Simulator before entering a new market</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}