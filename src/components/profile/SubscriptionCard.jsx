import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Sparkles, ArrowRight, Shield, Zap, HeartPulse, Star, Infinity, AlertTriangle, Loader2, XCircle, CalendarClock, Leaf, FlaskConical, QrCode, BarChart3, Cpu, FolderOpen, FileText, Atom } from 'lucide-react';
import AuthContext from '../auth/AuthContext';
import { cancelSubscription } from '@/functions/cancelSubscription';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const PLAN_DISPLAY = {
  pro: {
    monthly: { label: 'Pro Monthly', color: 'from-teal-500 to-cyan-500', badge: 'bg-teal-600 text-white', icon: Crown, price: '$4.99/mo' },
    yearly: { label: 'Pro Yearly', color: 'from-teal-600 to-emerald-600', badge: 'bg-teal-700 text-white', icon: Crown, price: '$49.99/yr' },
    lifetime: { label: 'Pro Lifetime', color: 'from-violet-600 to-purple-700', badge: 'bg-violet-700 text-white', icon: Infinity, price: '$4.99 one-time' },
  },
  enterprise: {
    monthly: { label: 'Enterprise', color: 'from-violet-600 to-purple-700', badge: 'bg-violet-700 text-white', icon: Star, price: 'Enterprise' },
  },
  admin: { label: 'Admin', color: 'from-yellow-400 to-orange-500', badge: 'bg-yellow-500 text-white', icon: Crown, price: 'Full Access' },
};

const premiumFeatures = [
  { icon: Atom, label: 'Unlimited Chemical Simulations', description: 'No monthly limit on simulations' },
  { icon: FlaskConical, label: 'Unlimited Formula Generation', description: 'Create as many formulas as you need' },
  { icon: QrCode, label: 'Unlimited Quick Scans', description: 'Scan any product barcode instantly' },
  { icon: Cpu, label: 'Computational Simulations', description: 'DFT, MD, protein modeling & more' },
  { icon: Shield, label: 'AI Compliance Co-Pilot', description: '50+ global regulatory checks' },
  { icon: HeartPulse, label: 'Personalized Safety Alerts', description: 'Health-based ingredient warnings' },
  { icon: Leaf, label: 'Sustainability & Carbon Scoring', description: 'Full environmental impact analysis' },
  { icon: BarChart3, label: 'Comparative Impact Reports', description: 'Benchmark your eco-score' },
  { icon: FolderOpen, label: 'Unlimited Workspace Storage', description: 'Organize all your sessions' },
  { icon: FileText, label: 'PDF & Lab Report Export', description: 'Professional report generation' },
  { icon: Zap, label: 'Priority Email Support', description: 'Dedicated assistance when you need it' },
];

export default function SubscriptionCard() {
  const { user, refreshUser } = useContext(AuthContext);
  const [canceling, setCanceling] = useState(false);
  const [cancelResult, setCancelResult] = useState(null);

  // If user just came back from a Stripe checkout (success=true in URL),
  // poll refreshUser to pick up webhook-updated subscription data.
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true' && refreshUser) {
      const timers = [2000, 5000, 10000].map(d => setTimeout(() => refreshUser(), d));
      return () => timers.forEach(clearTimeout);
    }
  }, []);

  const isAdmin = user?.role === 'admin';
  const plan = isAdmin ? 'admin' : (user?.subscription_plan || 'free');
  const billing = user?.subscription_billing || 'monthly';
  const isPro = plan === 'pro' || plan === 'enterprise' || isAdmin;
  const isCanceling = user?.subscription_status === 'canceling';
  const isLifetimePlan = billing === 'lifetime';
  // Only show cancel if they have a real Stripe subscription (not lifetime, not admin-granted)
  const canCancel = isPro && !isAdmin && !isLifetimePlan && user?.stripe_subscription_id && !isCanceling;

  const planDisplay = isAdmin
    ? PLAN_DISPLAY.admin
    : (PLAN_DISPLAY[plan]?.[billing] || PLAN_DISPLAY[plan]?.monthly);

  const gradientClass = planDisplay?.color || 'from-slate-600 to-slate-700';
  const badgeClass = planDisplay?.badge || 'bg-slate-500 text-white';
  const PlanIcon = planDisplay?.icon || Crown;
  const planLabel = planDisplay?.label || 'Free';

  const cancelAt = cancelResult?.access_until || user?.subscription_cancel_at;
  const cancelAtFormatted = cancelAt
    ? new Date(cancelAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const handleCancel = async () => {
    setCanceling(true);
    try {
      const res = await cancelSubscription({});
      if (res.data?.success) {
        setCancelResult(res.data);
        if (refreshUser) refreshUser();
      }
    } catch (e) {
      console.error('Cancel failed:', e);
    } finally {
      setCanceling(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className={`bg-gradient-to-r ${gradientClass} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <PlanIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Subscription Status</CardTitle>
              <p className="text-white/80 text-xs mt-0.5">
                {isPro ? planDisplay?.price || 'Premium Access' : 'Free Tier'}
              </p>
            </div>
          </div>
          <Badge className={`${badgeClass} border-0 font-bold`}>
            {planLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isPro ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Canceling notice */}
            {(isCanceling || cancelResult) && cancelAtFormatted && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <CalendarClock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Subscription cancelled</p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    You won't be charged again. Full access remains until <strong>{cancelAtFormatted}</strong>.
                  </p>
                </div>
              </div>
            )}

            <div className={`p-4 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg`}>
              <div className="flex items-start gap-3">
                <PlanIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-teal-900 mb-1">Full Access Granted — {planLabel}</p>
                  <p className="text-xs text-teal-800">
                    You have unlimited access to all features including compliance tools, safety alerts, and sustainability scoring.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-700 mb-3">Your Premium Features:</p>
              {premiumFeatures.map((feature, idx) => {
                const FIcon = feature.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-teal-50/50 transition-colors">
                    <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FIcon className="w-3.5 h-3.5 text-teal-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-tight">{feature.label}</p>
                      <p className="text-xs text-slate-400 leading-tight">{feature.description}</p>
                    </div>
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 ml-auto" />
                  </div>
                );
              })}
            </div>

            {/* Cancel subscription */}
            {canCancel && (
              <div className="pt-2 border-t border-slate-100">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-sm"
                      disabled={canceling}
                    >
                      {canceling
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cancelling…</>
                        : <><XCircle className="w-4 h-4 mr-2" />Cancel Subscription</>
                      }
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Cancel your subscription?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2 text-sm text-slate-600">
                        <p>Your subscription will <strong>not renew</strong> and you won't be charged again.</p>
                        <p>You'll keep full Pro access until the end of your current billing period, then your account will revert to the free tier.</p>
                        <p>You can resubscribe anytime from the Pricing page.</p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <p className="text-xs text-center text-slate-400 mt-2">
                  You'll keep access until the end of your billing period.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600 mb-3">
                Unlock premium features to access advanced tools for compliance, safety, and sustainability.
              </p>
              <div className="space-y-2">
                {premiumFeatures.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{feature.label}</p>
                        <p className="text-xs text-slate-500">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <Button asChild className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg">
              <Link to={createPageUrl('Pricing')}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-center text-slate-500">View all plans and pricing options</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}