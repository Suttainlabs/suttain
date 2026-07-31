import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table2 } from 'lucide-react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import { base44 } from '@/api/base44Client';
import AuthContext from '../components/auth/AuthContext';
import { Section, SectionHeader } from '@/components/shared/Section';
import ComparisonTable from '@/components/pricing/ComparisonTable';
import { PRODUCT_LINES } from '@/components/pricing/productPlans';
import ProductTabs from '@/components/pricing/ProductTabs';
import PlanCard from '@/components/pricing/PlanCard';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

export default function Pricing() {
  const { user, refreshUser } = useContext(AuthContext);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activeLineId, setActiveLineId] = useState(PRODUCT_LINES[0].id);
  const [showComparison, setShowComparison] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true' && refreshUser) {
      const delays = [1500, 4000, 8000];
      delays.forEach(delay => setTimeout(() => refreshUser(), delay));
    }
  }, []);

  // Open on the tab matching what the user already signed up for.
  useEffect(() => {
    const first = Array.isArray(user?.product_access) ? user.product_access[0] : null;
    if (first && PRODUCT_LINES.some(l => l.id === first)) setActiveLineId(first);
  }, [user]);

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
        promoCode: promoCode.trim() || undefined,
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

  const activeLine = PRODUCT_LINES.find(l => l.id === activeLineId) || PRODUCT_LINES[0];

  return (
    <div className="min-h-screen bg-white">
      {isSuccess && (
        <div className="bg-green-50 border-b border-green-200 py-3 px-4 text-center">
          <p className="text-green-800 font-medium text-sm">Payment successful. Your subscription is now active.</p>
        </div>
      )}
      {isCanceled && (
        <div className="bg-yellow-50 border-b border-yellow-200 py-3 px-4 text-center">
          <p className="text-yellow-800 font-medium text-sm">Checkout was canceled. You can try again anytime.</p>
        </div>
      )}

      <Section spacing="default" width="wide">
        <motion.div {...fadeIn()}>
          <SectionHeader
            as="h1"
            eyebrow={
              <span className="inline-block text-xs font-medium uppercase tracking-widest text-[#0F6E56] border border-[#0F6E56]/25 bg-[#0F6E56]/6 px-4 py-1.5 rounded-full">
                Pricing
              </span>
            }
            headingClassName="text-slate-900"
            heading="Plans for every part of Suttain"
            subtextClassName="text-slate-500 text-base sm:text-lg"
            subtext="Pick the product line you need. Upgrade, downgrade, or cancel anytime."
          />
        </motion.div>

        {/* Product line tabs */}
        <motion.div {...fadeIn(0.08)} style={{ marginTop: "var(--space-6)" }}>
          <ProductTabs lines={PRODUCT_LINES} activeId={activeLineId} onChange={setActiveLineId} />
          <p className="text-center text-sm text-slate-500" style={{ marginTop: "var(--space-2)" }}>
            {activeLine.tagline}
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div {...fadeIn(0.1)} className="flex items-center justify-center" style={{ marginTop: "var(--space-4)", marginBottom: "var(--space-5)" }}>
          <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`text-sm font-medium px-5 py-2 rounded-full transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`text-sm font-medium px-5 py-2 rounded-full transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Yearly
              <span className="text-[10px] font-medium bg-[#0F6E56] text-white px-2 py-0.5 rounded-full">20% off</span>
            </button>
          </div>
        </motion.div>

        {/* Promo code input */}
        <motion.div {...fadeIn(0.12)} className="flex flex-col items-center gap-2" style={{ marginBottom: "var(--space-5)" }}>
          <div className="flex items-center gap-2 max-w-xs w-full">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="PROMO CODE"
              className="flex-1 h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-mono tracking-wider text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00695C] focus:border-transparent"
            />
            {promoCode && (
              <button
                onClick={() => setPromoCode('')}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 px-2"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">Have a promo code? Enter it here and it will be applied at checkout.</p>
        </motion.div>

        {/* Plans for the active product line */}
        <motion.div key={activeLine.id} {...fadeIn(0.05)}>
          <div className="grid sm:grid-cols-2 max-w-3xl mx-auto" style={{ gap: "var(--space-3)" }}>
            {activeLine.plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                accent={activeLine.color}
                onUpgrade={handleUpgrade}
                checkoutLoading={checkoutLoading}
                billingCycle={billingCycle}
              />
            ))}
          </div>
        </motion.div>

        {/* Comparison table toggle */}
        <motion.div {...fadeIn(0.3)} className="text-center" style={{ marginTop: "var(--space-8)" }}>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0F6E56] hover:underline"
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
            <a href="mailto:contact@suttain.com" className="text-[#0F6E56] font-medium hover:underline">Contact our team</a>
          </p>
        </motion.div>
      </Section>
    </div>
  );
}