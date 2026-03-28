import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Building2, Zap, Shield, Leaf, HeartPulse, MessageSquare, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import useTrialStatus from '../hooks/useTrialStatus';
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
      '2 Product Scans per month',
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
      'AI Compliance Co-Pilot',
      'Personalized Safety Alerts',
      'Sustainability Scoring',
      'Priority Email Support',
      'Export to PDF/Print'
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
  { icon: Shield, title: 'AI Compliance Co-Pilot', description: 'Automated regulatory checks across 50+ regions' },
  { icon: HeartPulse, title: 'Personalized Safety Alerts', description: 'Custom alerts based on your health profile' },
  { icon: Leaf, title: 'Sustainability Scoring', description: 'Detailed eco-impact analysis for your formulas' },
  { icon: MessageSquare, title: 'Priority Support', description: '24/7 support with < 4 hour response time' }
];

export default function Pricing() {
  const { user } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const [isYearly, setIsYearly] = useState(false); // kept for future use

  const [checkoutLoading, setCheckoutLoading] = useState(null);

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
          <div className="flex items-center justify-center gap-4">


          </div>
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
                          <span className="text-4xl font-bold text-slate-900">${plan.lifetimePrice}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">One-time payment, access forever</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-slate-900">$4.99</span>
                          <span className="text-slate-500">/month</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Cancel anytime</p>
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
          className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
        >
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Premium Features Explained
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureDetails.map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)] mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
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