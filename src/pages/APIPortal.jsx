import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import AuthContext from '../components/auth/AuthContext';
import ElementCell from '@/components/landing/ElementCell';
import { base44 } from '@/api/base44Client';
import {
  Code2, Copy, CheckCheck, Terminal, Key, Lock, ArrowRight,
  Atom, Cpu, ShieldCheck, Leaf, Radio, KeyRound, CheckCircle2, Loader2,
} from 'lucide-react';

const STATS = [
  { value: '130M+', label: 'Chemical records' },
  { value: '< 200ms', label: 'Avg. response time' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '3', label: 'Native SDKs' },
];

const CAPABILITIES = [
  { idx: '01', sym: 'Ci', variant: 'teal', icon: Atom, title: 'Chemical Intelligence API', description: 'Query 130M+ compounds with property, toxicity, and regulatory data via a single REST endpoint.', endpoints: ['GET /v1/chemicals/{cid}', 'POST /v1/chemicals/search'] },
  { idx: '02', sym: 'Se', variant: 'purple', icon: Cpu, title: 'Simulation Engine API', description: 'Submit computational jobs (DFT, MD, QM/MM) programmatically and retrieve results asynchronously.', endpoints: ['POST /v1/simulations/run', 'GET /v1/simulations/{id}'] },
  { idx: '03', sym: 'Sc', variant: 'teal', icon: ShieldCheck, title: 'Safety & Compliance API', description: 'Automated SDS parsing, GHS classification, and regulatory cross-referencing across REACH, EPA, and FDA.', endpoints: ['POST /v1/sds/analyze', 'GET /v1/compliance/{formula_id}'] },
  { idx: '04', sym: 'Su', variant: 'blue', icon: Leaf, title: 'Sustainability API', description: 'Carbon footprint calculation, LCA scoring, and sustainability benchmarking for chemical formulations.', endpoints: ['POST /v1/sustainability/score', 'GET /v1/carbon/calculate'] },
  { idx: '05', sym: 'Wh', variant: 'purple', icon: Radio, title: 'Webhooks & Events', description: 'Real-time event streaming for simulation completion, regulatory changes, and safety alert triggers.', endpoints: ['POST /v1/webhooks/register', 'GET /v1/webhooks/events'] },
  { idx: '06', sym: 'Au', variant: 'blue', icon: KeyRound, title: 'Auth & Rate Limiting', description: 'API key authentication, role-based access control, and intelligent rate limiting with burst allowances.', endpoints: ['POST /v1/auth/token', 'GET /v1/auth/limits'] },
];

const ENDPOINTS = [
  {
    method: 'GET', path: '/v1/compound', title: 'Compound Lookup',
    description: 'Retrieve full compound data by name, SMILES, InChI, or CAS number.',
    params: [
      { name: 'q', type: 'string', required: true, desc: 'Query string (name, SMILES, InChI, or CAS)' },
      { name: 'type', type: 'enum', required: false, desc: 'name | smiles | inchi | cas, defaults to name' },
      { name: 'include', type: 'string', required: false, desc: 'Comma-separated: hazard,toxicology,environment,regulatory' },
    ],
    response: `{
  "compound_name": "Bisphenol A",
  "cas_number": "80-05-7",
  "pubchem_cid": 6623,
  "confidence_overall": 94,
  "data_sources": ["PubChem", "EPA CompTox"],
  "hazard": { ... }
}`,
  },
  {
    method: 'POST', path: '/v1/hazard-score', title: 'Hazard Scoring',
    description: 'Score a compound or ingredient list against GHS, FDA, and EPA CompTox classification databases.',
    params: [
      { name: 'compounds', type: 'array', required: true, desc: 'Array of compound names or SMILES strings' },
      { name: 'framework', type: 'enum', required: false, desc: 'ghs | epa | reach | all, defaults to all' },
    ],
    response: `{
  "results": [
    { "input": "Bisphenol A", "hazard_score": 78, "signal_word": "Danger", "confidence": 91 }
  ]
}`,
  },
  {
    method: 'POST', path: '/v1/interactions', title: 'Interaction Check',
    description: 'Detect chemical incompatibilities and interaction flags across a set of compounds.',
    params: [{ name: 'compounds', type: 'array', required: true, desc: 'Array of compound names or SMILES' }],
    response: `{
  "pairs_checked": 6,
  "interactions": [
    { "compound_a": "Hydrogen peroxide", "compound_b": "Ethanol", "severity": "high", "confidence": 88 }
  ]
}`,
  },
  {
    method: 'POST', path: '/v1/formula', title: 'Formula Generation',
    description: 'Generate a complete formula from a plain-language product goal.',
    params: [
      { name: 'goal', type: 'string', required: true, desc: 'Plain-language product description' },
      { name: 'constraints', type: 'object', required: false, desc: 'Optional: { vegan, preservative_free, target_ph }' },
    ],
    response: `{
  "formula_name": "Natural Gentle Face Serum",
  "ph_range": "5.5–6.5",
  "safety_score": 92,
  "sustainability_score": 78
}`,
  },
];

const PY_SNIPPET = `import suttain

client = suttain.Client(api_key="sk_suttain_...")

result = client.compound.lookup(
    q="Bisphenol A",
    include=["hazard", "toxicology", "regulatory"]
)

print(result.hazard.hazard_score)   # 78`;

const JS_SNIPPET = `import { SuttainClient } from '@suttain/sdk';

const client = new SuttainClient({ apiKey: 'sk_suttain_...' });

const result = await client.compound.lookup({
  q: 'Bisphenol A',
  include: ['hazard', 'toxicology', 'regulatory'],
});

console.log(result.hazard.hazardScore);  // 78`;

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded transition-colors"
      style={{ color: '#9AA3A0' }}
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5" style={{ color: '#02988C' }} /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function MethodBadge({ method }) {
  const colors = { GET: { bg: '#F0FDFA', color: '#027A70' }, POST: { bg: '#F5EEFF', color: '#7A3FE0' } };
  const c = colors[method] || { bg: '#F7F6F2', color: '#5B6168' };
  return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ background: c.bg, color: c.color }}>{method}</span>;
}

function WaitlistForm() {
  const [formData, setFormData] = useState({ name: '', email: '', company_name: '', role: '', description: '' });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      await base44.entities.EnterpriseWaitlist.create({ ...formData });
      setStatus('success');
    } catch (err) {
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white rounded-[10px] border p-8 text-center max-w-lg mx-auto" style={{ borderColor: '#E5E7EB' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F0FDFA' }}>
          <CheckCircle2 className="w-7 h-7" style={{ color: '#02988C' }} />
        </div>
        <h3 className="text-lg font-medium mb-2" style={{ color: '#0A1F1D' }}>You're on the list!</h3>
        <p className="text-[13px]" style={{ color: '#3F4651' }}>We'll be in touch as we onboard new organizations in upcoming cohorts.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[10px] border p-6 sm:p-8 max-w-lg mx-auto" style={{ borderColor: '#E5E7EB' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {[
          { name: 'name', label: 'Full name', required: true, placeholder: 'Jane Doe' },
          { name: 'email', label: 'Work email', required: true, placeholder: 'jane@company.com', type: 'email' },
          { name: 'company_name', label: 'Organization', required: true, placeholder: 'Acme Corp' },
          { name: 'role', label: 'Role', placeholder: 'CTO' },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-xs font-mono mb-1.5" style={{ color: '#5B6168' }}>{f.label}{f.required && <span style={{ color: '#DC2626' }}> *</span>}</label>
            <input
              type={f.type || 'text'} name={f.name} required={f.required}
              value={formData[f.name]} onChange={handleChange} placeholder={f.placeholder}
              className="w-full px-3 py-2.5 rounded-[7px] border text-sm focus:outline-none"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
        ))}
      </div>
      <div className="mb-5">
        <label className="block text-xs font-mono mb-1.5" style={{ color: '#5B6168' }}>Tell us about your use case</label>
        <textarea
          name="description" rows={4} value={formData.description} onChange={handleChange}
          placeholder="We need to batch-screen 10,000 ingredients for EU compliance..."
          className="w-full px-3 py-2.5 rounded-[7px] border text-sm focus:outline-none resize-none"
          style={{ borderColor: '#E5E7EB' }}
        />
      </div>
      {status === 'error' && <p className="text-sm mb-3" style={{ color: '#DC2626' }}>{errorMsg}</p>}
      <button
        type="submit" disabled={status === 'submitting'}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[7px] text-white font-medium text-sm transition-colors disabled:opacity-60"
        style={{ background: '#9531F5' }}
      >
        {status === 'submitting' && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === 'submitting' ? 'Submitting...' : 'Join the waitlist'}
      </button>
    </form>
  );
}

export default function APIPortal() {
  const { user } = useContext(AuthContext);
  const [activeEndpoint, setActiveEndpoint] = useState(0);
  const [activeLang, setActiveLang] = useState('python');
  const ep = ENDPOINTS[activeEndpoint];

  const fade = (delay = 0) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay, ease: 'easeOut' } });

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>

      {/* Hero */}
      <section className="px-6 pt-14 pb-10 text-center">
        <motion.div {...fade(0)} className="flex justify-center mb-5"><ElementCell index="00" symbol="Ap" variant="purple" /></motion.div>
        <motion.span {...fade(0.05)} className="block font-mono text-xs tracking-[0.04em] mb-3" style={{ color: '#7A3FE0' }}>API ACCESS · EARLY ACCESS</motion.span>
        <motion.h1 {...fade(0.1)} className="font-heading font-semibold text-[clamp(26px,4vw,38px)] mb-4 max-w-2xl mx-auto" style={{ color: '#0A1F1D' }}>
          Integrate molecular intelligence into your stack.
        </motion.h1>
        <motion.p {...fade(0.15)} className="text-[15px] leading-[1.65] max-w-xl mx-auto mb-8" style={{ color: '#3F4651' }}>
          A production-grade REST API with native SDKs for Python, JavaScript, and R. Access 130M+ chemical records, run computational simulations, and automate safety compliance at scale.
        </motion.p>
        <motion.div {...fade(0.2)} className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#waitlist" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[7px] text-sm font-medium text-white transition-colors" style={{ background: '#9531F5' }}>
            Join the waitlist <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#docs" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[7px] text-sm font-medium border-[1.5px]" style={{ borderColor: '#E5E7EB', color: '#3F4651' }}>
            <Code2 className="w-4 h-4" /> Browse API docs
          </a>
        </motion.div>

        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white rounded-[10px] border p-5 text-center" style={{ borderColor: '#E5E7EB' }}>
              <div className="font-heading font-semibold text-2xl" style={{ color: '#02988C' }}>{s.value}</div>
              <div className="text-[11px] font-mono mt-1" style={{ color: '#6B7280' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">

        {/* Capabilities */}
        <div className="mb-14">
          <span className="block font-mono text-xs tracking-[0.04em] mb-4" style={{ color: '#027A70' }}>API CAPABILITIES</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAPABILITIES.map((cap) => (
              <div key={cap.title} className="bg-white border rounded-[10px] p-5" style={{ borderColor: '#E5E7EB' }}>
                <div className="mb-3.5"><ElementCell index={cap.idx} symbol={cap.sym} variant={cap.variant} /></div>
                <h3 className="text-[14px] font-medium mb-1.5" style={{ color: '#0A1F1D' }}>{cap.title}</h3>
                <p className="text-[13px] leading-[1.6] mb-3" style={{ color: '#3F4651' }}>{cap.description}</p>
                <div className="space-y-1">
                  {cap.endpoints.map((e) => (
                    <div key={e} className="text-[10.5px] font-mono" style={{ color: '#6B7280' }}>{e}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive docs */}
        <div id="docs" className="mb-14 scroll-mt-20">
          <span className="block font-mono text-xs tracking-[0.04em] mb-4" style={{ color: '#027A70' }}>ENDPOINT REFERENCE</span>

          {/* API key management */}
          <div className="bg-white border rounded-[10px] p-5 mb-5" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: '#F5EEFF' }}>
                  <Key className="w-4 h-4" style={{ color: '#7A3FE0' }} />
                </div>
                <div>
                  <p className="text-[13.5px] font-medium" style={{ color: '#0A1F1D' }}>API key management</p>
                  <p className="text-[12px]" style={{ color: '#6B7280' }}>Generate and manage your API keys below.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-[7px] px-3 py-2 border" style={{ background: '#F7F6F2', borderColor: '#E5E7EB' }}>
                  <Lock className="w-3.5 h-3.5" style={{ color: '#9AA3A0' }} />
                  <span className="text-xs font-mono" style={{ color: '#9AA3A0' }}>sk_suttain_••••••••••••</span>
                </div>
                <button
                  onClick={() => alert('API key generation requires an active Research plan. Contact contact@suttain.com to get access.')}
                  className="px-3 py-2 text-xs font-medium rounded-[7px] transition-colors"
                  style={{ background: '#F0FDFA', color: '#027A70', border: '1px solid #02988C40' }}
                >
                  Generate key
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>Endpoints</p>
              <div className="space-y-1">
                {ENDPOINTS.map((e, i) => (
                  <button
                    key={i} onClick={() => setActiveEndpoint(i)}
                    className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-[8px] border transition-colors"
                    style={activeEndpoint === i ? { background: '#F0FDFA', borderColor: '#02988C40' } : { borderColor: 'transparent' }}
                  >
                    <MethodBadge method={e.method} />
                    <div className="min-w-0">
                      <p className="text-xs font-mono truncate" style={{ color: '#5B6168' }}>{e.path}</p>
                      <p className="text-[10px] truncate" style={{ color: '#3F4651' }}>{e.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border rounded-[10px] p-5" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-center gap-2 mb-1">
                  <MethodBadge method={ep.method} />
                  <span className="text-sm font-mono" style={{ color: '#0A1F1D' }}>{ep.path}</span>
                </div>
                <p className="text-[12.5px] mb-5" style={{ color: '#6B7280' }}>{ep.description}</p>

                <div className="mb-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2" style={{ color: '#6B7280' }}>Parameters</p>
                  <div className="space-y-2">
                    {ep.params.map((p) => (
                      <div key={p.name} className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: '#F1F2F0' }}>
                        <span className="text-xs font-mono flex-shrink-0" style={{ color: '#027A70' }}>{p.name}</span>
                        <span className="text-[10px] flex-shrink-0" style={{ color: '#9AA3A0' }}>{p.type}</span>
                        {p.required && <span className="text-[9px] font-bold flex-shrink-0" style={{ color: '#DC2626' }}>required</span>}
                        <span className="text-xs" style={{ color: '#3F4651' }}>{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: '#6B7280' }}>Example response</p>
                    <CopyButton text={ep.response} />
                  </div>
                  <pre className="text-[10.5px] font-mono rounded-[8px] p-3 overflow-x-auto leading-relaxed border" style={{ color: '#3F4651', background: '#F7F6F2', borderColor: '#E5E7EB' }}>{ep.response}</pre>
                </div>
              </div>

              {/* SDK snippets */}
              <div className="bg-white border rounded-[10px] p-5" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" style={{ color: '#9AA3A0' }} />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: '#6B7280' }}>SDK examples</span>
                  </div>
                  <div className="flex gap-1">
                    {['python', 'javascript'].map((lang) => (
                      <button
                        key={lang} onClick={() => setActiveLang(lang)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-[6px] transition-colors"
                        style={activeLang === lang ? { background: '#F0FDFA', color: '#027A70', border: '1px solid #02988C40' } : { color: '#9AA3A0' }}
                      >
                        {lang === 'python' ? 'Python' : 'JavaScript'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <pre className="text-[10.5px] font-mono rounded-[8px] p-3 overflow-x-auto leading-relaxed border" style={{ color: '#3F4651', background: '#F7F6F2', borderColor: '#E5E7EB' }}>{activeLang === 'python' ? PY_SNIPPET : JS_SNIPPET}</pre>
                  <div className="absolute top-2 right-2"><CopyButton text={activeLang === 'python' ? PY_SNIPPET : JS_SNIPPET} /></div>
                </div>
                <p className="text-[10px] mt-3" style={{ color: '#9AA3A0' }}>
                  SDK packages are in preview. Install via <span className="font-mono">pip install suttain</span> or <span className="font-mono">npm install @suttain/sdk</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Waitlist */}
        <div id="waitlist" className="mb-14 scroll-mt-20">
          <div className="text-center mb-8">
            <span className="block font-mono text-xs tracking-[0.04em] mb-3" style={{ color: '#7A3FE0' }}>GET EARLY ACCESS</span>
            <h2 className="font-heading font-semibold text-[clamp(22px,3vw,26px)] mb-3" style={{ color: '#0A1F1D' }}>Join the enterprise waitlist</h2>
            <p className="text-[14px] max-w-xl mx-auto" style={{ color: '#3F4651' }}>Be among the first to access the Suttain API. We're onboarding organizations in cohorts.</p>
          </div>
          <WaitlistForm />
        </div>

        {/* Footer nav */}
        <div className="border rounded-[10px] p-6 bg-white flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10" style={{ borderColor: '#E5E7EB' }}>
          <Link to={createPageUrl('ResearchPortal')} className="text-sm font-medium transition-colors" style={{ color: '#3F4651' }}>Research Portal</Link>
          <Link to={createPageUrl('Pricing')} className="text-sm font-medium transition-colors" style={{ color: '#3F4651' }}>Pricing</Link>
          <a href="mailto:enterprise@suttain.com" className="text-sm font-medium transition-colors" style={{ color: '#3F4651' }}>Contact sales</a>
        </div>
      </div>
    </div>
  );
}
