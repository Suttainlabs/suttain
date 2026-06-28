import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check, Sparkles, Building2, Zap, Loader2, Atom,
  GraduationCap, Microscope, Table2
} from 'lucide-react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import { base44 } from '@/api/base44Client';
import AuthContext from '../components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Section, SectionHeader } from '@/components/shared/Section';
import ComparisonTable from '@/components/pricing/ComparisonTable';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

// ── Unified Plans ────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceSuffix: '',
    priceNote: 'No credit card required',
    description: 'Core tools for casual exploration.',
    features: [
      'Molecular queries',
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
    id: 'starter',
    name: 'Starter',
    priceMonthly: '$4.99',
    priceYearly: '$3.99',
    priceSuffix: '/month',
    priceNote: 'Cancel anytime',
    priceNoteYearly: 'Billed $47.88/year — save 20%',
    description: 'For active researchers getting started.',
    features: [
      'Everything in Free',
      '10 simulations per month',
      'Full Structural Biology access',
      'Unlimited formula generations',
      'No DFT or MD simulations',
    ],
    cta: 'Upgrade to Starter',
    priceKey: 'starter_monthly',
    priceKeyYearly: 'starter_yearly',
    color: '#00A8C8',
    icon: Atom,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: '$49.99',
    priceYearly: '$39.99',
    priceSuffix: '/month',
    priceNote: 'Cancel anytime',
    priceNoteYearly: 'Billed $479.90/year — save 20%',
    description: 'Unlimited computational access for professionals.',
    features: [
      'Everything in Starter',
      'Unlimited simulations (DFT, MD)',
      'Research API access',
      'Citation-ready exports',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
    priceKey: 'pro_monthly',
    priceKeyYearly: 'pro_yearly',
    color: '#6B3FA0',
    icon: Sparkles,
  },
  {
    id: 'academic',
    name: 'Academic',
    priceMonthly: '$199',
    priceYearly: '$159',
    priceSuffix: '/month',
    priceNote: 'Cancel anytime',
    priceNoteYearly: 'Billed $1,910/year — save 20%',
    description: 'For research labs and university departments.',
    features: [
      'Everything in Pro',
      'Up to 10 team seats',
      'Priority compute queue',
      'Lab workspace',
      'API included',
    ],
    cta: 'Upgrade to Academic',
    priceKey: 'academic_monthly',
    priceKeyYearly: 'academic_yearly',
    color: '#0D9E8E',
    icon: GraduationCap,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$999.99',
    priceNote: 'One-time payment, forever',
    description: 'Everything in Pro — pay once, own it forever.',
    features: [
      'All Pro features forever',
      'Unlimited simulations (DFT, MD)',
      'Research API access',
      'Citation-ready exports',
      'No recurring payments',
    ],
    cta: 'Get Lifetime Access',
    badge: 'Best Value',
    priceKey: 'lifetime',
    color: '#f59e0b',
    icon: Building2,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    priceNote: 'Contact us for a quote',
    description: 'Dedicated infrastructure for organizations.',
    features: [
      'White-label deployment',
      'Dedicated infrastructure',
      'SSO and unlimited seats',
      'SLA support',
    ],
    cta: 'Contact Sales',
    contactSales: true,
    color: '#1e1b4b',
    icon: Building2,
  },
];

function PlanCard({ plan, onUpgrade, checkoutLoading, billingCycle }) {
  const isYearly = billingCycle === 'yearly';
  const activeKey = (isYearly && plan.priceKeyYearly) ? plan.priceKeyYearly : plan.priceKey;
  const isBusy = checkoutLoading === activeKey;
  const displayPrice = (isYearly && plan.priceYearly) ? plan.priceYearly : (plan.price || plan.priceMonthly);
  const displayNote = (isYearly && plan.priceNoteYearly) ? plan.priceNoteYearly : plan.priceNote;

  const handleClick = () => {
    if (plan.ctaDisabled) return;
    if (plan.contactSales) {
      window.location.href = 'mailto:contact@suttain.com?subject=' + encodeURIComponent(plan.name + ' Plan Inquiry');
      return;
    }
    if (activeKey) onUpgrade(activeKey);
  };

  return (
    <div className={`relative flex flex-col rounded-2xl border p-6 h-full transition-shadow hover:shadow-lg ${
      plan.popular
        ? 'border-2 border-[#6B3FA0] shadow-xl'
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
        <h3 className="font-bold text-base text-slate-900">{plan.name}</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-900">{displayPrice}</span>
          {plan.priceSuffix && displayPrice !== 'Custom' && <span className="text-sm text-slate-500">{plan.priceSuffix}</span>}
        </div>
        <p className="text-xs mt-1 text-slate-500">{displayNote}</p>
      </div>

      <p className="text-sm mb-5 leading-relaxed text-slate-600">{plan.description}</p>

      <button
        onClick={handleClick}
        disabled={plan.ctaDisabled || isBusy}
        className={`w-full h-10 rounded-lg font-semibold text-sm mb-5 transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00695C] focus-visible:ring-offset-2 ${
          plan.ctaDisabled
            ? 'bg-slate-100 text-slate-400 cursor-default'
            : 'bg-[#00695C] text-white shadow-md hover:bg-[#005048] hover:shadow-lg'
        }`}
      >
        {isBusy ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span> : plan.cta}
      </button>

      <ul className="space-y-2 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
            <span className="text-xs text-slate-600">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing() {
  const { user, refreshUser } = useContext(AuthContext);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showComparison, setShowComparison] = useState(false);

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
    // Require an authenticated session before hitting Stripe
    const isAuthed = user ? true : await base44.auth.isAuthenticated();
    if (!isAuthed) {
      sessionStorage.setItem('pendingCheckout', priceKey);
      window.location.href = '/login?redirect=' + encodeURIComponent('/Pricing');
      return;
    }
    setCheckoutLoading(priceKey);
    try {
      const res = await createCheckoutSession({
        priceKey,
        successUrl: window.location.origin + '/Pricing?success=true',
        cancelUrl: window.location.origin + '/Pricing?canceled=true',
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Resume a pending checkout once the user is authenticated after login/signup
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingCheckout');
    if (pending && user) {
      sessionStorage.removeItem('pendingCheckout');
      handleUpgrade(pending);
    }
  }, [user]);

  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get('success') === 'true';
  const isCanceled = urlParams.get('canceled') === 'true';

  return (
    <div className="min-h-screen bg-white">
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

      <Section spacing="default" width="wide">
        <motion.div {...fadeIn()}>
          <SectionHeader
            as="h1"
            eyebrow={
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#007850] border border-[#007850]/25 bg-[#007850]/6 px-4 py-1.5 rounded-full">
                Pricing
              </span>
            }
            headingClassName="text-3xl sm:text-5xl font-bold text-slate-900"
            heading="One platform. Plans for everyone."
            subtextClassName="text-slate-500 text-base sm:text-lg"
            subtext="From free exploration to enterprise-grade compute. Upgrade, downgrade, or cancel anytime."
          />
        </motion.div>

        {/* Billing toggle */}
        <motion.div {...fadeIn(0.1)} className="flex items-center justify-center" style={{ marginTop: "var(--space-6)", marginBottom: "var(--space-6)" }}>
          <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`text-sm font-semibold px-5 py-2 rounded-full transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`text-sm font-semibold px-5 py-2 rounded-full transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Yearly
              <span className="text-[10px] font-bold bg-[#007850] text-white px-2 py-0.5 rounded-full">20% off</span>
            </button>
          </div>
        </motion.div>

        {/* Plan cards */}
        <motion.div {...fadeIn(0.15)}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "var(--space-3)" }}>
            {PLANS.map((plan, i) => (
              <motion.div key={plan.id} {...fadeIn(0.05 * i)}>
                <PlanCard plan={plan} onUpgrade={handleUpgrade} checkoutLoading={checkoutLoading} billingCycle={billingCycle} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Comparison table toggle */}
        <motion.div {...fadeIn(0.3)} className="text-center" style={{ marginTop: "var(--space-8)" }}>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#007850] hover:underline"
          >
            <Table2 className="w-4 h-4" />
            {showComparison ? 'Hide' : 'Compare'} all features
          </button>
        </motion.div>

        {showComparison && (
          <motion.div {...fadeIn(0.1)} style={{ marginTop: "var(--space-4)" }}>
            <ComparisonTable />
          </motion.div>
        )}

        {/* Bottom contact */}
        <motion.div {...fadeIn(0.4)} className="text-center" style={{ marginTop: "var(--space-8)" }}>
          <p className="text-slate-500 text-sm">
            Questions about which plan is right for you?{' '}
            <a href="mailto:contact@suttain.com" className="text-[#007850] font-semibold hover:underline">Contact our team</a>
          </p>
        </motion.div>
      </Section>
    </div>
  );
}