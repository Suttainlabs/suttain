import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check, Sparkles, Building2, Zap, Shield, Leaf, MessageSquare,
  Loader2, Cpu, BarChart3, Atom, FlaskConical, FileText, Globe,
  FolderOpen, Microscope, Code2, Database, GraduationCap
} from 'lucide-react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import useTrialStatus from '../hooks/useTrialStatus';
import useLocalPricing from '../hooks/useLocalPricing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthContext from '../components/auth/AuthContext';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

// ── Consumer Plans ────────────────────────────────────────────────────
const CONSUMER_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'Free',
    priceNote: 'No credit card required',
    description: 'Get started with core tools — no commitment.',
    features: [
      '3 simulations per month',
      '5 formula generations per month',
      'Unlimited product scans',
      'Ingredient database access',
      'Community support',
    ],
    cta: 'Get Started Free',
    ctaDisabled: true,
    color: '#007850',
    icon: Zap,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$4.99',
    priceSuffix: '/month',
    priceNote: 'Cancel anytime',
    description: 'Unlimited access to all consumer tools.',
    features: [
      'Unlimited simulations',
      'Unlimited formula generation',
      'Unlimited product scans',
      'Sustainability scoring',
      'AI Compliance Co-Pilot',
      'Hydration Intelligence',
      'PDF export',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
    priceKey: 'pro_monthly',
    color: '#0D9E8E',
    icon: Sparkles,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$99.99',
    priceNote: 'One-time payment, forever',
    description: 'Everything in Pro — all future consumer updates included.',
    features: [
      'All Pro features forever',
      'All future consumer updates',
      'PDF & report export',
      'Priority support for life',
    ],
    cta: 'Get Lifetime Access',
    badge: 'Best Value',
    priceKey: 'lifetime',
    color: '#f59e0b',
    icon: Building2,
  },
  {
    id: 'business',
    name: 'Business',
    price: '$29.99',
    priceSuffix: '/month',
    priceNote: 'Up to 5 team seats',
    description: 'For small brands and formulation teams.',
    features: [
      'Everything in Pro',
      'Up to 5 team seats',
      'Bulk ingredient validation',
      'White-label report export',
      'Compliance documentation',
      'Priority support',
    ],
    cta: 'Contact Sales',
    contactSales: true,
    color: '#6366f1',
    icon: Building2,
  },
];

// ── Research Plans ────────────────────────────────────────────────────
const RESEARCH_PLANS = [
  {
    id: 'researcher_free',
    name: 'Researcher Free',
    price: 'Free',
    priceNote: 'Public database access',
    description: 'Basic molecular queries and limited simulations.',
    features: [
      'Basic molecular queries',
      'Limited simulations',
      'Public database access (PubChem)',
      'Community support',
    ],
    cta: 'Get Started Free',
    ctaDisabled: true,
    color: '#6366f1',
    icon: Microscope,
  },
  {
    id: 'researcher_pro',
    name: 'Researcher Pro',
    price: '$49.99',
    priceSuffix: '/month',
    priceNote: 'Cancel anytime',
    description: 'Full molecular intelligence and computational access.',
    features: [
      'Unlimited molecular intelligence queries',
      'Full computational simulations (DFT, MD, QM/MM)',
      'Research API access',
      'Citation-ready PDF export (APA/ACS/Vancouver)',
      'Unlimited workspace storage',
    ],
    cta: 'Start Researcher Pro',
    popular: true,
    contactSales: true,
    color: '#6366f1',
    icon: Atom,
  },
  {
    id: 'academic',
    name: 'Academic / Institution',
    price: '$299',
    priceSuffix: '/month per lab',
    priceNote: '.edu verified discount available',
    description: 'For research labs and university departments.',
    features: [
      'Up to 10 team seats',
      'Bulk compound export (CSV, JSON)',
      'Priority DFT and MD compute queue',
      'Dedicated lab workspace with version history',
      'API included',
      '.edu verified discount',
    ],
    cta: 'Contact Sales',
    badge: 'Lab Ready',
    contactSales: true,
    color: '#0D9E8E',
    icon: GraduationCap,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    priceNote: 'Tailored to your infrastructure',
    description: 'White-label deployment, dedicated infrastructure, and SLA-backed support.',
    features: [
      'White-label deployment',
      'Custom API integrations',
      'Dedicated infrastructure',
      'SSO and unlimited seats',
      'SLA-backed support',
    ],
    cta: 'Contact Sales',
    contactSales: true,
    color: '#1e1b4b',
    icon: Building2,
  },
];

function PlanCard({ plan, onUpgrade, checkoutLoading, dark }) {
  const isBusy = checkoutLoading === plan.priceKey;

  const handleClick = () => {
    if (plan.ctaDisabled) return;
    if (plan.contactSales) {
      window.location.href = 'mailto:contact@suttain.com?subject=' + encodeURIComponent(plan.name + ' Plan Inquiry');
      return;
    }
    if (plan.priceKey) onUpgrade(plan.priceKey);
  };

  return (
    <div className={`relative flex flex-col rounded-2xl border p-6 h-full transition-shadow hover:shadow-lg ${
      plan.popular
        ? dark
          ? 'border-violet-500 bg-violet-950/40 shadow-xl'
          : 'border-2 border-[#0D9E8E] shadow-xl'
        : dark
          ? 'border-slate-700 bg-slate-800/60'
          : 'border-slate-200 bg-white'
    }`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full text-white" style={{ background: plan.color }}>
            Most Popular
          </span>
        </div>
      )}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-amber-500 text-white">
            {plan.badge}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: plan.color + '18' }}>
          <plan.icon className="w-4.5 h-4.5" style={{ color: plan.color }} />
        </div>
        <h3 className={`font-bold text-base ${dark ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
          {plan.priceSuffix && <span className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{plan.priceSuffix}</span>}
        </div>
        <p className={`text-xs mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{plan.priceNote}</p>
      </div>

      <p className={`text-sm mb-5 leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{plan.description}</p>

      <button
        onClick={handleClick}
        disabled={plan.ctaDisabled || isBusy}
        className={`w-full py-2.5 rounded-xl font-semibold text-sm mb-5 transition-all ${
          plan.ctaDisabled
            ? dark ? 'bg-slate-700 text-slate-500 cursor-default' : 'bg-slate-100 text-slate-400 cursor-default'
            : 'text-white hover:opacity-90 active:scale-[0.98]'
        }`}
        style={!plan.ctaDisabled ? { background: plan.color } : undefined}
      >
        {isBusy ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span> : plan.cta}
      </button>

      <ul className="space-y-2 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
            <span className={`text-xs ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing() {
  const { user, refreshUser } = useContext(AuthContext);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const { pricing, countryCode, loading: pricingLoading, formatPrice } = useLocalPricing();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true' && refreshUser) {
      const delays = [1500, 4000, 8000];
      delays.forEach(delay => setTimeout(() => refreshUser(), delay));
    }
  }, []);

  const handleUpgrade = async (priceKey) => {
    if (window.self !== window.top) {
      alert('Checkout works only from the published app. Please open the app in a new tab.');
      return;
    }
    setCheckoutLoading(priceKey);
    try {
      const res = await createCheckoutSession({
        priceKey,
        successUrl: window.location.origin + '/Pricing?success=true',
        cancelUrl: window.location.origin + '/Pricing?canceled=true',
        countryCode: countryCode || undefined,
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get('success') === 'true';
  const isCanceled = urlParams.get('canceled') === 'true';

  return (
    <div className="min-h-screen bg-white">
      {/* Banners */}
      {isSuccess && (
        <div className="bg-green-50 border-b border-green-200 py-3 px-4 text-center">
          <p className="text-green-800 font-semibold text-sm">Payment successful. Your subscription is now active.</p>
        </div>
      )}
      {isCanceled && (
        <div className="bg-yellow-50 border-b border-yellow-200 py-3 px-4 text-center">
          <p className="text-yellow-800 font-semibold text-sm">Checkout was canceled. You can try again anytime.</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Page header */}
        <motion.div {...fadeIn()} className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#007850] border border-[#007850]/25 bg-[#007850]/6 px-4 py-1.5 rounded-full mb-4">
            Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Two products. One platform.
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto">
            Suttain Consumer is built for formulators and brands. Suttain Research is built for scientists and institutions. Both start free.
          </p>
        </motion.div>

        {/* ── SECTION 1: Consumer ── */}
        <motion.div {...fadeIn(0.1)} className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">For Consumers and Small Brands</h2>
              <p className="text-slate-500 text-sm mt-1">Formula generation, product scanning, safety alerts, and sustainability tools — for creators and brands.</p>
            </div>
            <div className="flex-1 h-px bg-slate-100 hidden sm:block" />
            <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-widest text-[#007850] border border-[#007850]/25 bg-[#007850]/6 px-3 py-1 rounded-full flex-shrink-0">
              Consumer
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONSUMER_PLANS.map((plan, i) => (
              <motion.div key={plan.id} {...fadeIn(0.05 * i)}>
                <PlanCard plan={plan} onUpgrade={handleUpgrade} checkoutLoading={checkoutLoading} dark={false} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="relative my-4 mb-20">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-6 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 border border-slate-200 rounded-full">
              Suttain Research — For Scientists and Institutions
            </span>
          </div>
        </div>

        {/* ── SECTION 2: Research ── */}
        <motion.div {...fadeIn(0.2)}>
          <div className="flex items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">For Researchers and Institutions</h2>
              <p className="text-slate-500 text-sm mt-1">Molecular intelligence, computational simulations, Research API, and citation-ready exports — for scientists.</p>
            </div>
            <div className="flex-1 h-px bg-violet-100 hidden sm:block" />
            <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-widest text-violet-600 border border-violet-200 bg-violet-50 px-3 py-1 rounded-full flex-shrink-0">
              Research
            </span>
          </div>

          <div className="rounded-3xl bg-slate-950 p-6 sm:p-10">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {RESEARCH_PLANS.map((plan, i) => (
                <motion.div key={plan.id} {...fadeIn(0.05 * i)}>
                  <PlanCard plan={plan} onUpgrade={handleUpgrade} checkoutLoading={checkoutLoading} dark={true} />
                </motion.div>
              ))}
            </div>
            <p className="text-center text-slate-500 text-xs mt-8">
              Research Pro and above include API access. Academic plans include .edu verified discounts.{' '}
              <a href="mailto:contact@suttain.com" className="text-violet-400 hover:underline">Contact us</a> for custom arrangements.
            </p>
          </div>
        </motion.div>

        {/* Bottom contact */}
        <motion.div {...fadeIn(0.3)} className="text-center mt-16">
          <p className="text-slate-500 text-sm">
            Questions about which plan is right for you?{' '}
            <a href="mailto:contact@suttain.com" className="text-[#007850] font-semibold hover:underline">Contact our team</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}