import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '../components/auth/AuthContext';
import { EnterpriseThemeProvider } from '@/components/enterprise/EnterpriseTheme';
import {
  Code2, ArrowLeft, Copy, CheckCheck, Zap, Shield,
  Globe, Layers, ChevronRight, BookOpen, Terminal, Key,
  Database, Lock, BarChart2, ArrowRight, CreditCard
} from 'lucide-react';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/v1/compound',
    title: 'Compound Lookup',
    description: 'Retrieve full compound data by name, SMILES, InChI, or CAS number.',
    params: [
      { name: 'q', type: 'string', required: true, desc: 'Query string (name, SMILES, InChI, or CAS)' },
      { name: 'type', type: 'enum', required: false, desc: 'name | smiles | inchi | cas — defaults to name' },
      { name: 'include', type: 'string', required: false, desc: 'Comma-separated: hazard,toxicology,environment,regulatory' },
    ],
    response: `{
  "compound_name": "Bisphenol A",
  "cas_number": "80-05-7",
  "pubchem_cid": 6623,
  "molecular_formula": "C15H16O2",
  "molecular_weight": 228.29,
  "confidence_overall": 94,
  "data_sources": ["PubChem", "EPA CompTox"],
  "hazard": { ... },
  "toxicology": { ... },
  "timestamp": "2026-06-15T10:00:00Z"
}`,
  },
  {
    method: 'POST',
    path: '/v1/hazard-score',
    title: 'Hazard Scoring',
    description: 'Score a compound or ingredient list against GHS, FDA, and EPA CompTox classification databases.',
    params: [
      { name: 'compounds', type: 'array', required: true, desc: 'Array of compound names or SMILES strings' },
      { name: 'framework', type: 'enum', required: false, desc: 'ghs | epa | reach | all — defaults to all' },
    ],
    response: `{
  "results": [
    {
      "input": "Bisphenol A",
      "hazard_score": 78,
      "signal_word": "Danger",
      "ghs_classes": ["Repr. 1B", "Aquatic Chronic 2"],
      "confidence": 91,
      "source": "EPA CompTox"
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/v1/interactions',
    title: 'Interaction Check',
    description: 'Detect chemical incompatibilities and interaction flags across a set of compounds.',
    params: [
      { name: 'compounds', type: 'array', required: true, desc: 'Array of compound names or SMILES' },
    ],
    response: `{
  "pairs_checked": 6,
  "interactions": [
    {
      "compound_a": "Hydrogen peroxide",
      "compound_b": "Ethanol",
      "severity": "high",
      "type": "oxidizer-fuel",
      "notes": "Exothermic reaction risk above 30% H2O2",
      "confidence": 88
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/v1/sustainability',
    title: 'Sustainability Score',
    description: 'Generate a full sustainability profile for an ingredient or formula.',
    params: [
      { name: 'compound', type: 'string', required: true, desc: 'Compound name or SMILES' },
      { name: 'context', type: 'enum', required: false, desc: 'ingredient | formula | product' },
    ],
    response: `{
  "compound": "Sodium Lauryl Sulfate",
  "sustainability_score": 42,
  "sub_scores": {
    "biodegradability": 70,
    "aquatic_toxicity": 25,
    "atmospheric_persistence": 80,
    "carbon_intensity": 38,
    "packaging_impact": 60
  },
  "benchmark_percentile": 34,
  "source": "EPA CompTox + Suttain Model"
}`,
  },
  {
    method: 'POST',
    path: '/v1/formula',
    title: 'Formula Generation',
    description: 'Generate a complete formula from a plain-language product goal.',
    params: [
      { name: 'goal', type: 'string', required: true, desc: 'Plain-language product description' },
      { name: 'constraints', type: 'object', required: false, desc: 'Optional: { vegan, preservative_free, target_ph }' },
    ],
    response: `{
  "formula_name": "Natural Gentle Face Serum",
  "ingredients": [
    { "name": "Aqua", "inci": "Water", "percent_range": "60–75%", "role": "solvent" },
    { "name": "Niacinamide", "inci": "Niacinamide", "percent_range": "5%", "role": "active" }
  ],
  "ph_range": "5.5–6.5",
  "safety_score": 92,
  "sustainability_score": 78,
  "shelf_life": "12 months"
}`,
  },
];

const TIERS = [
  { name: 'Free Academic', price: 'Free', limit: '100 req/day', color: '#64748b', features: ['Compound lookup', 'Basic hazard score', 'Rate-limited'] },
  { name: 'Pro Researcher', price: '$19.99/mo', limit: '10,000 req/day', color: '#0D9E8E', features: ['All endpoints', 'Citation export', 'SDK access', 'Confidence scores'] },
  { name: 'Institution', price: '$199/mo', limit: '100,000 req/day', color: '#6366f1', features: ['Team key management', 'Bulk export', 'Priority compute', 'SLA'] },
  { name: 'Enterprise', price: '$5,000/mo', limit: 'Unlimited', color: '#f59e0b', features: ['Dedicated infrastructure', 'Custom integrations', 'White-label', '24/7 SLA'] },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded hover:bg-slate-600 transition-colors text-slate-500 hover:text-slate-300">
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-[#0D9E8E]" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function MethodBadge({ method }) {
  const colors = { GET: 'bg-emerald-500/10 text-emerald-400', POST: 'bg-blue-500/10 text-blue-400', DELETE: 'bg-red-500/10 text-red-400' };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${colors[method] || 'bg-slate-700 text-slate-400'}`}>
      {method}
    </span>
  );
}

const PY_SNIPPET = `import suttain

client = suttain.Client(api_key="sk_suttain_...")

result = client.compound.lookup(
    q="Bisphenol A",
    include=["hazard", "toxicology", "regulatory"]
)

print(result.hazard.hazard_score)   # 78
print(result.hazard.confidence)     # 91
print(result.hazard.source)         # "EPA CompTox"`;

const JS_SNIPPET = `import { SuttainClient } from '@suttain/sdk';

const client = new SuttainClient({ apiKey: 'sk_suttain_...' });

const result = await client.compound.lookup({
  q: 'Bisphenol A',
  include: ['hazard', 'toxicology', 'regulatory'],
});

console.log(result.hazard.hazardScore);  // 78
console.log(result.hazard.source);       // "EPA CompTox"`;

export default function APIPortal() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeEndpoint, setActiveEndpoint] = useState(0);
  const [activeLang, setActiveLang] = useState('python');

  const ep = ENDPOINTS[activeEndpoint];

  return (
    <EnterpriseThemeProvider defaultTheme="dark">
    <div className="min-h-screen text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sub-header */}
      <div className="border-b border-slate-700/50 bg-slate-900/60 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl('ResearchPortal'))} className="text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-slate-700" />
          <Code2 className="w-3.5 h-3.5 text-[#8b5cf6]" />
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Research API</span>
          <Link to="/EnterpriseAPI" className="ml-auto text-[10px] font-semibold text-[#0D9E8E] hover:underline" style={{ fontFamily: "'Inter', sans-serif" }}>
            View Pricing &rarr;
          </Link>
          <span className="text-[10px] font-mono text-slate-600">v1.0 · REST · JSON</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-black text-white mb-2">Suttain Research API</h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Integrate molecular intelligence directly into your workflows. Every response includes source citations and confidence scores on every field — no black box outputs.
          </p>
        </div>

        {/* API key management */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center flex-shrink-0">
                <Key className="w-4 h-4 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">API Key Management</p>
                <p className="text-xs text-slate-500">Generate and manage your API keys below.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-xs font-mono text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>sk_suttain_••••••••••••••••</span>
              </div>
              <Link
                to="/EnterpriseAPI#pricing"
                className="px-3 py-2 bg-[#0D9E8E]/10 hover:bg-[#0D9E8E]/20 border border-[#0D9E8E]/30 text-[#0D9E8E] text-xs font-semibold rounded-lg transition-colors"
              >
                Generate Key
              </Link>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-700/40">
            {[
              { label: 'Tier', value: user?.subscription_plan === 'pro' ? 'Pro Researcher' : 'Free Academic' },
              { label: 'Daily Limit', value: user?.subscription_plan === 'pro' ? '10,000 req' : '100 req' },
              { label: 'Today Used', value: '0' },
              { label: 'Status', value: 'Active' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{label}</p>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoint docs + SDK snippets */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Endpoint list */}
          <div className="lg:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Endpoints</p>
            <div className="space-y-1">
              {ENDPOINTS.map((ep, i) => (
                <button
                  key={i}
                  onClick={() => setActiveEndpoint(i)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    activeEndpoint === i
                      ? 'bg-[#0D9E8E]/10 border border-[#0D9E8E]/30'
                      : 'hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <MethodBadge method={ep.method} />
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-slate-400 truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{ep.path}</p>
                    <p className="text-[10px] text-slate-600 truncate">{ep.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint detail */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <MethodBadge method={ep.method} />
                <span className="text-sm font-mono text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{ep.path}</span>
              </div>
              <p className="text-xs text-slate-500 mb-5">{ep.description}</p>

              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Parameters</p>
                <div className="space-y-2">
                  {ep.params.map((p) => (
                    <div key={p.name} className="flex items-start gap-3 py-2 border-b border-slate-700/30 last:border-0">
                      <span className="text-xs font-mono text-[#0D9E8E] flex-shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.name}</span>
                      <span className="text-[10px] text-slate-600 flex-shrink-0">{p.type}</span>
                      {p.required && <span className="text-[9px] text-red-400 font-bold flex-shrink-0">required</span>}
                      <span className="text-xs text-slate-500">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Example Response</p>
                  <CopyButton text={ep.response} />
                </div>
                <pre className="text-[10px] font-mono text-slate-400 bg-slate-900/80 rounded-lg p-3 overflow-x-auto leading-relaxed" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {ep.response}
                </pre>
              </div>
            </div>

            {/* SDK snippets */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">SDK Examples</span>
                </div>
                <div className="flex gap-1">
                  {['python', 'javascript'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${
                        activeLang === lang
                          ? 'bg-[#0D9E8E]/15 text-[#0D9E8E] border border-[#0D9E8E]/30'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {lang === 'python' ? 'Python' : 'JavaScript'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <pre className="text-[10px] font-mono text-slate-400 bg-slate-900/80 rounded-lg p-3 overflow-x-auto leading-relaxed" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {activeLang === 'python' ? PY_SNIPPET : JS_SNIPPET}
                </pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={activeLang === 'python' ? PY_SNIPPET : JS_SNIPPET} />
                </div>
              </div>
              <p className="text-[10px] text-slate-600 mt-3">
                SDK packages are in preview. Install via: <span className="font-mono text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>pip install suttain</span> or <span className="font-mono text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>npm install @suttain/sdk</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Pricing CTA ── */}
        <div className="mt-8 rounded-xl border border-slate-700/50 p-5 flex items-center justify-between gap-4 flex-wrap"
             style={{ backgroundColor: 'rgba(13, 158, 142, 0.05)' }}>
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-[#0D9E8E]" />
            <div>
              <p className="text-sm font-bold text-white">Need higher limits or SLA?</p>
              <p className="text-xs text-slate-400">View pricing tiers from $5/mo. Academic access is free with a verified email.</p>
            </div>
          </div>
          <Link to="/EnterpriseAPI#pricing" className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-xs font-semibold bg-[#0D9E8E] hover:bg-[#0b8a7d] text-white transition-colors">
            View Pricing <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
    </EnterpriseThemeProvider>
  );
}