import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Building2, Zap, Shield, Leaf, HeartPulse, MessageSquare, Clock, AlertTriangle, Loader2, Cpu, BarChart3, QrCode, Atom, FlaskConical, FileText, Globe, Database, FolderOpen, Layers } from 'lucide-react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import useTrialStatus from '../hooks/useTrialStatus';
import useLocalPricing from '../hooks/useLocalPricing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import AuthContext from '../components/auth/AuthContext';

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with core features every month, no credit card needed.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    lifetimePrice: 0,
    features: [
      '3 Chemical Simulations per month',
      '5 Formula Generations per month',
      'Unlimited Product Scans',
      'Community Support',
      'Learning Center Access'
    ],
    limitations: [
      'Monthly usage limits apply'
    ],
    cta: 'Current Plan',
    popular: false,
    icon: Zap
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Everything you need to formulate safely and efficiently — unlimited access.',
    monthlyPrice: 4.99,
    yearlyPrice: null,
    lifetimePrice: null,
    features: [
      'Unlimited Chemical Simulations',
      'Unlimited Formula Generation',
      'Unlimited Product Scans',
      'Computational Simulations (DFT, MD, QM)',
      'Formula Simulation Engine',
      'AI Compliance Co-Pilot (50+ regions)',
      'Personalized Safety Alerts',
      'Sustainability & Carbon Footprint Scoring',
      'Comparative Impact Reports',
      'Ingredient Database (250k+ chemicals)',
      'Unlimited Workspace Storage',
      'PDF & Lab Report Export',
      'Priority Email Support'
    ],
    limitations: [],
    cta: 'Upgrade to Pro',
    popular: true,
    icon: Sparkles
  },
  {
    id: 'lifetime',
    name: 'Lifetime Access',
    description: 'Pay once, use forever. The smartest investment for serious formulators.',
    monthlyPrice: null,
    yearlyPrice: null,
    lifetimePrice: 99.99,
    features: [
      'Everything in Pro — forever',
      'All future feature updates included',
      'Unlimited Chemical Simulations',
      'Unlimited Formula Generation',
      'Unlimited Product Scans',
      'AI Compliance Co-Pilot',
      'Priority Support for Life',
      'Export to PDF/Print'
    ],
    limitations: [],
    cta: 'Get Lifetime Access',
    popular: false,
    badge: 'Best Value',
    icon: Building2
  }
];

const featureDetails = [
  {
    icon: Cpu,
    title: 'Computational Simulations',
    description: 'Run DFT, Molecular Dynamics, ORCA, GROMACS & quantum chemistry scripts — no lab needed.',
    color: 'from-violet-500 to-purple-600',
    badge: 'Advanced'
  },
  {
    icon: Shield,
    title: 'AI Compliance Co-Pilot',
    description: 'Automated regulatory checks across 50+ global regions including EU, FDA, and ASEAN.',
    color: 'from-teal-500 to-cyan-500',
    badge: null
  },
  {
    icon: HeartPulse,
    title: 'Personalized Safety Alerts',
    description: 'Custom alerts based on your health profile, conditions, and ingredient sensitivities.',
    color: 'from-rose-500 to-pink-500',
    badge: null
  },
  {
    icon: Leaf,
    title: 'Sustainability Scoring',
    description: 'Detailed eco-impact analysis, biodegradability scores, and carbon footprint per formula.',
    color: 'from-green-500 to-emerald-500',
    badge: null
  },
  {
    icon: BarChart3,
    title: 'Comparative Impact Reports',
    description: "Benchmark your formula's eco-score vs. industry averages with exportable reports.",
    color: 'from-blue-500 to-indigo-500',
    badge: null
  },
  {
    icon: Atom,
    title: 'Formula Simulation Engine',
    description: 'Adjust ingredient percentages live and instantly see cost, pH, and sustainability shifts.',
    color: 'from-amber-500 to-orange-500',
    badge: null
  },
  {
    icon: QrCode,
    title: 'Unlimited Quick Scans',
    description: 'Scan any product barcode for full ingredient safety, toxicity & eco analysis — no limits.',
    color: 'from-cyan-500 to-teal-500',
    badge: null
  },
  {
    icon: Globe,
    title: 'Ingredient Database Access',
    description: 'Explore 250k+ chemicals with full toxicity, origin, INCI names, and eco-impact data.',
    color: 'from-slate-600 to-slate-800',
    badge: null
  },
  {
    icon: FlaskConical,
    title: 'Unlimited Simulations',
    description: 'Run as many chemical interaction simulations as you need — no monthly cap.',
    color: 'from-teal-600 to-green-600',
    badge: null
  },
  {
    icon: FileText,
    title: 'PDF & Lab Report Export',
    description: 'Export professional-grade formulas, safety reports, and lab documentation as PDFs.',
    color: 'from-indigo-500 to-blue-600',
    badge: null
  },
  {
    icon: FolderOpen,
    title: 'Unlimited Workspace',
    description: 'Save, organize, and revisit all simulations, formulas, and scans in your personal workspace.',
    color: 'from-violet-500 to-fuchsia-500',
    badge: null
  },
  {
    icon: MessageSquare,
    title: 'Priority Support',
    description: '24/7 dedicated support with under 4-hour response time and direct team access.',
    color: 'from-rose-500 to-red-500',
    badge: null
  },
];

export default function Pricing() {
  const { user, refreshUser } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const [isYearly, setIsYearly] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const { pricing, countryCode, loading: pricingLoading, formatPrice } = useLocalPricing();

  // When Stripe redirects back with ?success=true, re-fetch the user so their
  // subscription plan is reflected immediately without a manual page refresh.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true' && refreshUser) {
      // Poll a few times to account for webhook processing delay
      const delays = [1500, 4000, 8000];
      delays.forEach(delay => {
        setTimeout(() => refreshUser(), delay);
      });
    }
  }, []);

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return;

    if (window.self !== window.top) {
      alert('Checkout works only from the published app. Please open the app in a new tab.');
      return;
    }

    let priceKey;
    if (planId === 'lifetime') {
      priceKey = 'lifetime';
    } else if (planId === 'pro') {
      priceKey = isYearly ? 'pro_yearly' : 'pro_monthly';
    }

    if (!priceKey) return;
    setCheckoutLoading(priceKey);
    try {
      const res = await createCheckoutSession({
        priceKey,
        successUrl: window.location.origin + '/Pricing?success=true',
        cancelUrl: window.location.origin + '/Pricing?canceled=true',
        countryCode: countryCode || undefined,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Handle success/canceled URL params
  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get('success') === 'true';
  const isCanceled = urlParams.get('canceled') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Success/Cancel Banners */}
        {isSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-800 font-semibold">🎉 Payment successful! Your Pro subscription is now active.</p>
          </motion.div>
        )}
        {isCanceled && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-yellow-800 font-semibold">Checkout was canceled. You can try again anytime.</p>
          </motion.div>
        )}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="bg-purple-100 text-purple-700 mb-4">Pricing</Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Choose Your <span className="gradient-text">Perfect Plan</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Start free with monthly limits, or upgrade for unlimited access
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className={`text-sm font-semibold ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                isYearly ? 'bg-[var(--suttain-violet)]' : 'bg-slate-300'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                isYearly ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
            <span className={`text-sm font-semibold ${isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Save 16%</span>
            )}
          </div>
          {/* Local currency notice */}
          {!pricingLoading && pricing.country && (
            <p className="text-xs text-slate-500 mt-3">
              🌍 Prices shown in <strong>{pricing.currency.toUpperCase()}</strong> for {pricing.country}
            </p>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full ${
                plan.popular ? 'border-2 border-[var(--suttain-violet)] shadow-xl' :
                plan.id === 'lifetime' ? 'border-2 border-amber-400 shadow-xl' :
                'border border-slate-200'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[var(--suttain-violet)] to-purple-600 text-white px-4">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                    plan.popular ? 'bg-gradient-to-r from-[var(--suttain-violet)] to-purple-600' :
                    plan.id === 'lifetime' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                    'bg-slate-100'
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.id !== 'free' ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    {plan.id === 'free' ? (
                      <div>
                        <span className="text-4xl font-bold text-slate-900">Free</span>
                        <p className="text-sm text-slate-500 mt-1">No credit card required</p>
                      </div>
                    ) : plan.id === 'lifetime' ? (
                      <div>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-slate-900">
                            {pricingLoading ? '...' : formatPrice(pricing.lifetime)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">One-time payment, access forever</p>
                        {pricing.currency !== 'usd' && (
                          <p className="text-xs text-slate-400 mt-0.5">≈ $99.99 USD</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        {isYearly ? (
                          <>
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-4xl font-bold text-slate-900">
                                {pricingLoading ? '...' : formatPrice(pricing.yearly)}
                              </span>
                              <span className="text-slate-500">/year</span>
                            </div>
                            <p className="text-sm text-green-600 font-semibold mt-1">Save ~16% vs monthly</p>
                            {pricing.currency !== 'usd' && (
                              <p className="text-xs text-slate-400 mt-0.5">≈ $49.99 USD/year</p>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-4xl font-bold text-slate-900">
                                {pricingLoading ? '...' : formatPrice(pricing.monthly)}
                              </span>
                              <span className="text-slate-500">/month</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Cancel anytime</p>
                            {pricing.currency !== 'usd' && (
                              <p className="text-xs text-slate-400 mt-0.5">≈ $4.99 USD/month</p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[var(--suttain-violet)] to-purple-600 hover:opacity-90 text-white'
                        : plan.id === 'lifetime'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white'
                        : 'bg-slate-100 text-slate-500 cursor-default'
                    }`}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.id === 'free' || checkoutLoading !== null}
                  >
                    {checkoutLoading === (plan.id === 'lifetime' ? 'lifetime' : 'pro_monthly') ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                    ) : plan.cta}
                  </Button>

                  {/* Features */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">What's included:</p>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Everything in Pro, Explained</h2>
            <p className="text-slate-500">12 powerful features unlocked the moment you upgrade</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureDetails.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex gap-4 items-start"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">{feature.title}</h3>
                    {feature.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 text-violet-700 font-bold rounded">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ or Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-slate-600">
            Have questions? <a href="mailto:contact@suttain.com" className="text-[var(--suttain-violet)] font-semibold hover:underline">Contact our team</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}