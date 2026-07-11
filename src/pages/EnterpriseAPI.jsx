import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Database, ShieldCheck, Leaf, BookOpen, Webhook, Code2,
  ArrowRight, Copy, Check, Activity, Zap, Cloud,
} from 'lucide-react';
import {
  EnterpriseThemeProvider,
  ThemeToggle,
  MolecularBackground,
  useEnterpriseTheme,
} from '@/components/enterprise/EnterpriseTheme';

/* ── Nav ── */
function Nav() {
  const { colors } = useEnterpriseTheme();
  const navLinkStyle = { color: colors.textMuted };
  return (
    <nav className="relative z-10 border-b" style={{ borderColor: colors.border }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-base font-bold tracking-tight" style={{ color: colors.text }}>
          Suttain
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm font-medium">
          <a href="#features" style={navLinkStyle} className="hover:opacity-80 transition-opacity">Features</a>
          <a href="#pricing" style={navLinkStyle} className="hover:opacity-80 transition-opacity">Pricing</a>
          <Link to="/APIPortal" style={navLinkStyle} className="hover:opacity-80 transition-opacity">Docs</Link>
          <a href="#cta" style={navLinkStyle} className="hover:opacity-80 transition-opacity">Get Started</a>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/APIPortal"
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-semibold transition-colors"
            style={{ backgroundColor: colors.text, color: colors.bg }}
          >
            Get API Key
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ── */
function Hero() {
  const { colors } = useEnterpriseTheme();
  const [copied, setCopied] = useState(false);
  const curlCmd = 'curl https://api.suttain.com/v1/hazard-score?name=sodium+hypochlorite';

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative px-6 pt-20 pb-16">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <p
          className="text-xs font-semibold uppercase mb-5"
          style={{ color: colors.textSubtle, letterSpacing: '0.18em' }}
        >
          Chemical Intelligence &middot; One API Call
        </p>
        <h1
          className="font-bold mb-6"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: colors.text,
          }}
        >
          Chemical safety intelligence,<br />in one API call.
        </h1>
        <p
          className="mx-auto mb-10"
          style={{
            fontSize: '1.0625rem',
            lineHeight: 1.65,
            color: colors.textMuted,
            maxWidth: '38rem',
          }}
        >
          Suttain queries 130M+ chemical profiles and returns hazards, interactions, and
          sustainability scores &mdash; every result with source citations and confidence
          scores. No black box.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/APIPortal"
            className="inline-flex items-center gap-2 px-6 h-12 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: colors.accent, color: '#ffffff' }}
          >
            Get your free API key
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2.5 px-4 h-12 rounded-xl border text-sm transition-colors"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.bgElevated,
              fontFamily: "'JetBrains Mono', monospace",
              color: colors.textMuted,
            }}
          >
            <span style={{ color: colors.textSubtle }}>$</span>
            <span style={{ color: colors.text }}>{curlCmd.replace('curl ', '')}</span>
            {copied ? <Check className="w-3.5 h-3.5" style={{ color: colors.accent }} /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── JSON Response Panel ── */
const SAMPLE_JSON = `{
  "query": "sodium hypochlorite",
  "cas_number": "7681-52-9",
  "pubchem_cid": 2438,
  "hazard_score": 72,
  "confidence": 95,
  "signal_word": "Danger",
  "ghs_classes": ["Oxidizer", "Corrosive", "Aquatic Toxicity"],
  "interactions": [
    {
      "with": "Ammonia",
      "severity": "critical",
      "type": "chloramine_release",
      "confidence": 98
    }
  ],
  "sustainability": {
    "biodegradability": 85,
    "aquatic_toxicity": 30,
    "score": 52,
    "confidence": 88
  },
  "sources": [
    { "field": "hazard_score", "source": "EPA CompTox", "url": "comptox.epa.gov" },
    { "field": "ghs_classes", "source": "PubChem", "url": "pubchem.ncbi.nlm.nih.gov" },
    { "field": "sustainability", "source": "Suttain Model + EPA", "url": "comptox.epa.gov" }
  ],
  "overall_confidence": 93,
  "timestamp": "2026-07-11T12:00:00Z"
}`;

function JsonResponsePanel() {
  const { colors } = useEnterpriseTheme();
  return (
    <section className="relative px-6 pb-20">
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase mb-3" style={{ color: colors.accent, letterSpacing: '0.15em' }}>
            No Black Box
          </p>
          <h2 className="text-2xl font-semibold mb-3" style={{ color: colors.text }}>
            Every field carries a source and a confidence score.
          </h2>
          <p className="text-sm" style={{ color: colors.textMuted, maxWidth: '32rem', margin: '0 auto' }}>
            One call returns structured hazard data, interaction flags, and sustainability metrics &mdash;
            each with provenance so you can cite it in your own work.
          </p>
        </div>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: colors.codeBorder, backgroundColor: colors.codeBg }}
        >
          <div className="flex items-center gap-2 px-4 h-9 border-b" style={{ borderColor: colors.codeBorder }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10b981' }} />
            <span className="ml-2 text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: colors.textSubtle }}>
              GET /v1/hazard-score
            </span>
          </div>
          <pre
            className="p-4 overflow-x-auto text-[12px] leading-relaxed"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: colors.text }}
          >
            {SAMPLE_JSON}
          </pre>
        </div>
      </div>
    </section>
  );
}

/* ── Features ── */
const FEATURES = [
  {
    icon: Database,
    label: 'Chemical Intelligence',
    title: 'Query 130M+ compounds',
    desc: 'Properties, toxicity, and regulatory data via a single REST endpoint.',
  },
  {
    icon: ShieldCheck,
    label: 'Interaction & Safety',
    title: 'Detect incompatibilities',
    desc: 'Chemical-chemical interaction flags and GHS hazard scoring in real time.',
  },
  {
    icon: Leaf,
    label: 'Sustainability Scoring',
    title: 'Biodegradability and carbon',
    desc: 'LCA-backed sustainability scores with sub-metrics for every compound.',
  },
  {
    icon: BookOpen,
    label: 'Citations + Confidence',
    title: 'No black box outputs',
    desc: 'Every quantitative value includes a source citation and a confidence score.',
  },
  {
    icon: Webhook,
    label: 'Webhooks',
    title: 'Real-time events',
    desc: 'Stream regulatory changes, safety alerts, and simulation completions.',
  },
  {
    icon: Code2,
    label: 'SDKs',
    title: 'Python / JavaScript / R',
    desc: 'Native SDKs with full type support and auto-complete from day one.',
  },
];

function FeatureCard({ feature }) {
  const { colors } = useEnterpriseTheme();
  const Icon = feature.icon;
  return (
    <div
      className="rounded-xl border p-6 transition-colors"
      style={{ borderColor: colors.border, backgroundColor: colors.bgElevated }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: colors.accent + '15' }}
      >
        <Icon className="w-5 h-5" style={{ color: colors.accent }} />
      </div>
      <p className="text-[11px] font-semibold uppercase mb-2" style={{ color: colors.textSubtle, letterSpacing: '0.12em' }}>
        {feature.label}
      </p>
      <h3 className="text-[18px] font-semibold mb-2" style={{ color: colors.text }}>
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
        {feature.desc}
      </p>
    </div>
  );
}

function Features() {
  const { colors } = useEnterpriseTheme();
  return (
    <section id="features" className="relative px-6 py-20 border-t" style={{ borderColor: colors.border }}>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase mb-3" style={{ color: colors.textSubtle, letterSpacing: '0.15em' }}>
            API Capabilities
          </p>
          <h2 className="text-[2rem] font-semibold" style={{ color: colors.text }}>
            Built for researchers who need to cite their data.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => <FeatureCard key={f.label} feature={f} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ── */
const PRICING = [
  {
    name: 'Academic',
    price: 'Free',
    desc: 'For verified school and university emails.',
    limit: '1,000 req/day',
    features: ['Compound lookup', 'Basic hazard score', 'Confidence scores', 'Source citations'],
    cta: 'Get free access',
    highlighted: false,
  },
  {
    name: 'Student / Public',
    price: '$5',
    period: '/mo',
    desc: 'For independent researchers and hobbyists.',
    limit: '5,000 req/day',
    features: ['All endpoints', 'Interaction checks', 'Sustainability scores', 'Community support'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    desc: 'All endpoints, SDKs, and higher limits.',
    limit: '50,000 req/day',
    features: ['Everything in Student', 'Python / JS / R SDKs', 'Webhooks', 'Priority support'],
    cta: 'Get API key',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'SLA, volume, and dedicated support.',
    limit: 'Unlimited',
    features: ['Dedicated infrastructure', 'Custom integrations', 'Volume pricing', '24/7 SLA'],
    cta: 'Contact us',
    highlighted: false,
  },
];

function PricingCard({ tier }) {
  const { colors } = useEnterpriseTheme();
  return (
    <div
      className="rounded-xl border p-6 flex flex-col"
      style={{
        borderColor: tier.highlighted ? colors.accent : colors.border,
        backgroundColor: tier.highlighted ? colors.accent + '08' : colors.bgElevated,
      }}
    >
      {tier.highlighted && (
        <span
          className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mb-3 self-start"
          style={{ backgroundColor: colors.accent + '20', color: colors.accent, letterSpacing: '0.1em' }}
        >
          Most Popular
        </span>
      )}
      <h3 className="text-base font-semibold mb-1" style={{ color: colors.text }}>{tier.name}</h3>
      <p className="text-xs mb-4" style={{ color: colors.textMuted }}>{tier.desc}</p>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-bold" style={{ color: colors.text }}>{tier.price}</span>
        {tier.period && <span className="text-sm" style={{ color: colors.textMuted }}>{tier.period}</span>}
      </div>
      <p className="text-xs font-mono mb-5" style={{ color: colors.textSubtle }}>{tier.limit}</p>
      <ul className="space-y-2 mb-6 flex-1">
        {tier.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm" style={{ color: colors.textMuted }}>
            <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/APIPortal"
        className="inline-flex items-center justify-center gap-1.5 h-10 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
        style={{
          backgroundColor: tier.highlighted ? colors.accent : 'transparent',
          color: tier.highlighted ? '#ffffff' : colors.text,
          border: tier.highlighted ? 'none' : `1px solid ${colors.border}`,
        }}
      >
        {tier.cta}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function Pricing() {
  const { colors } = useEnterpriseTheme();
  return (
    <section id="pricing" className="relative px-6 py-20 border-t" style={{ borderColor: colors.border }}>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase mb-3" style={{ color: colors.textSubtle, letterSpacing: '0.15em' }}>
            Pricing
          </p>
          <h2 className="text-[2rem] font-semibold mb-3" style={{ color: colors.text }}>
            Priced for schools and the public.
          </h2>
          <p className="text-sm" style={{ color: colors.textMuted, maxWidth: '30rem', margin: '0 auto' }}>
            Start free with a verified academic email. Upgrade when your research scales.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRICING.map(t => <PricingCard key={t.name} tier={t} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Reliability Strip ── */
function ReliabilityStrip() {
  const { colors } = useEnterpriseTheme();
  const items = [
    { icon: Zap, value: '<200ms', label: 'typical response' },
    { icon: Cloud, value: '99.9%', label: 'uptime target' },
    { icon: Activity, value: '130M+', label: 'chemical records' },
  ];
  return (
    <section className="relative px-6 py-12 border-t" style={{ borderColor: colors.border }}>
      <div className="max-w-3xl mx-auto relative z-10 flex flex-col sm:flex-row items-center justify-center gap-8">
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="hidden sm:block w-px h-8" style={{ backgroundColor: colors.border }} />}
            <div className="flex items-center gap-2.5">
              <item.icon className="w-4 h-4" style={{ color: colors.accent }} />
              <span className="text-lg font-bold" style={{ color: colors.text }}>{item.value}</span>
              <span className="text-sm" style={{ color: colors.textMuted }}>{item.label}</span>
            </div>
          </React.Fragment>
        ))}
        <a
          href="https://status.suttain.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline"
          style={{ color: colors.accent }}
        >
          Status page
        </a>
      </div>
    </section>
  );
}

/* ── Final CTA ── */
function FinalCTA() {
  const { colors } = useEnterpriseTheme();
  return (
    <section id="cta" className="relative px-6 py-24 border-t" style={{ borderColor: colors.border }}>
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <h2 className="text-[2rem] font-semibold mb-4" style={{ color: colors.text }}>
          Start free, upgrade when you scale.
        </h2>
        <p className="text-sm mb-8" style={{ color: colors.textMuted }}>
          Get an API key in seconds. No credit card required for Academic tier.
        </p>
        <Link
          to="/APIPortal"
          className="inline-flex items-center gap-2 px-7 h-12 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: colors.accent, color: '#ffffff' }}
        >
          Get your free API key
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  const { colors } = useEnterpriseTheme();
  return (
    <footer className="relative px-6 py-10 border-t" style={{ borderColor: colors.border }}>
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold" style={{ color: colors.text }}>Suttain</span>
          <span className="text-xs" style={{ color: colors.textSubtle }}>
            &copy; {new Date().getFullYear()} Suttain. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs" style={{ color: colors.textMuted }}>
          <Link to="/APIPortal" className="hover:underline">Docs</Link>
          <a href="#pricing" className="hover:underline">Pricing</a>
          <Link to="/" className="hover:underline">Home</Link>
          <a href="mailto:contact@suttain.com" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ── */
export default function EnterpriseAPI() {
  return (
    <EnterpriseThemeProvider defaultTheme="dark">
      <div className="relative">
        <MolecularBackground />
        <Nav />
        <Hero />
        <JsonResponsePanel />
        <Features />
        <Pricing />
        <ReliabilityStrip />
        <FinalCTA />
        <Footer />
      </div>
    </EnterpriseThemeProvider>
  );
}