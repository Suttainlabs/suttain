import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Building2, Zap, Shield, Leaf, HeartPulse, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import AuthContext from '../components/auth/AuthContext';

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Chemical Simulator (5 simulations/day)',
      'Formula Generator (3 formulas/day)',
      'Basic Barcode Scanner',
      'Community Support',
      'Learning Center Access'
    ],
    limitations: [
      'Limited daily usage',
      'Basic analysis only',
      'No priority support'
    ],
    cta: 'Current Plan',
    popular: false,
    icon: Zap
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious formulators',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      'Unlimited Chemical Simulations',
      'Unlimited Formula Generation',
      'AI Compliance Co-Pilot',
      'Personalized Safety Alerts',
      'Sustainability Scoring',
      'Priority Email Support',
      'Export to PDF/Print',
      'Formula History (Unlimited)'
    ],
    limitations: [],
    cta: 'Upgrade to Pro',
    popular: true,
    icon: Sparkles
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams and businesses',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      'Everything in Pro',
      'Team Collaboration (up to 10 users)',
      'API Access',
      'Custom Chemical Libraries',
      'White-label Reports',
      'Dedicated Account Manager',
      'SLA & Priority Support',
      'Custom Integrations',
      'Advanced Analytics Dashboard'
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
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
  const [isYearly, setIsYearly] = useState(true);

  const handleUpgrade = (planId) => {
    if (planId === 'enterprise') {
      window.location.href = 'mailto:contact@suttain.com?subject=Enterprise Plan Inquiry';
    } else if (planId === 'pro') {
      // For now, show an alert. In production, this would integrate with Stripe
      alert('Payment integration coming soon! Contact us at contact@suttain.com to upgrade.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
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
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Unlock powerful features to create safer, more sustainable formulations
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-[var(--suttain-violet)]"
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
              Yearly <Badge className="ml-2 bg-green-100 text-green-700">Save 17%</Badge>
            </span>
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
              <Card className={`relative h-full ${plan.popular ? 'border-2 border-[var(--suttain-violet)] shadow-xl' : 'border border-slate-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[var(--suttain-violet)] to-purple-600 text-white px-4">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                    plan.popular ? 'bg-gradient-to-r from-[var(--suttain-violet)] to-purple-600' : 'bg-slate-100'
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-slate-900">
                        ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      {plan.monthlyPrice > 0 && (
                        <span className="text-slate-500">/{isYearly ? 'year' : 'month'}</span>
                      )}
                    </div>
                    {isYearly && plan.monthlyPrice > 0 && (
                      <p className="text-sm text-slate-500 mt-1">
                        ${Math.round(plan.yearlyPrice / 12)}/month billed annually
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[var(--suttain-violet)] to-purple-600 hover:opacity-90'
                        : plan.id === 'free'
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.id === 'free'}
                  >
                    {plan.cta}
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