import React, { useState, useContext, useEffect } from 'react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import { base44 } from '@/api/base44Client';
import AuthContext from '../components/auth/AuthContext';
import PillarTabs from '@/components/pricing/PillarTabs';
import PillarPlanCard from '@/components/pricing/PillarPlanCard';
import { PILLARS, PLANS_BY_PILLAR } from '@/components/pricing/pillarPlans';
import useTrialStatus from '@/hooks/useTrialStatus';

export default function Pricing() {
  const { user, refreshUser } = useContext(AuthContext);
  const [activePillar, setActivePillar] = useState(() => new URLSearchParams(window.location.search).get('pillar') === 'research' ? 'research' : 'core');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [promoCode, setPromoCode] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get('success') === 'true';
  const isCanceled = urlParams.get('canceled') === 'true';

  useEffect(() => {
    if (isSuccess && refreshUser) {
      [1500, 4000, 8000].forEach(d => setTimeout(() => refreshUser(), d));
    }
  }, []);

  const handleUpgrade = async (priceKey) => {
    if (!priceKey) return;
    const isFramed = window.self !== window.top;
    const checkoutTab = isFramed ? window.open('', '_blank') : null;
    if (isFramed && !checkoutTab) { alert('Allow popups to continue to checkout.'); return; }
    if (checkoutTab) checkoutTab.opener = null;
    const isAuthed = user ? true : await base44.auth.isAuthenticated();
    if (!isAuthed) {
      checkoutTab?.close();
      sessionStorage.setItem('pendingCheckout', priceKey);
      window.location.href = '/login?returnTo=' + encodeURIComponent('/Pricing?pillar=' + activePillar);
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
      if (!res.data?.url) throw new Error('No checkout link returned');
      if (checkoutTab) checkoutTab.location.replace(res.data.url);
      else window.location.assign(res.data.url);
    } catch (error) {
      checkoutTab?.close();
      console.error('Checkout failed:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Restore the chosen pillar after login; checkout starts on a fresh buyer click.
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingCheckout');
    if (pending && user) {
      sessionStorage.removeItem('pendingCheckout');
      setActivePillar(pending.startsWith('research') ? 'research' : 'core');
    }
  }, [user]);

  const pillar = PILLARS.find(p => p.id === activePillar);
  const plans = PLANS_BY_PILLAR[activePillar] || [];
  const accessStatus = useTrialStatus(user);

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
      {isSuccess && (
        <div className="border-b py-3 px-4 text-center" style={{ background: '#E1F5EE', borderColor: '#B8D0C5' }}>
          <p className="text-sm" style={{ color: '#0F6E56' }}>Payment successful. Your access is now active.</p>
        </div>
      )}
      {isCanceled && (
        <div className="border-b py-3 px-4 text-center" style={{ background: '#FEF6E4', borderColor: '#EBD9AE' }}>
          <p className="text-sm" style={{ color: '#8A5D0A' }}>Checkout was canceled. You can try again anytime.</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1>Pricing</h1>
          <p className="mt-2" style={{ color: '#5F5F5B' }}>
            Start free. Core unlocks consumer tools; Research includes unlimited research and full Core access.
          </p>
        </div>

        <PillarTabs active={activePillar} onChange={setActivePillar} />
        <p className="text-center text-sm mt-4" style={{ color: '#5F5F5B' }}>{pillar.tagline}</p>

        <div className="flex items-center justify-center mt-6 mb-8">
          <div className="inline-flex items-center gap-1 rounded-full p-1 border" style={{ background: '#FFFFFF', borderColor: '#E5E3DC' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className="text-sm font-medium px-5 py-2 rounded-full transition-all"
              style={billingCycle === 'monthly' ? { background: pillar.fill, color: pillar.accent } : { color: '#5F5F5B' }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className="text-sm font-medium px-5 py-2 rounded-full transition-all"
              style={billingCycle === 'yearly' ? { background: pillar.fill, color: pillar.accent } : { color: '#5F5F5B' }}
            >
              Annual: save 20%
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {plans.map(plan => (
            <PillarPlanCard
              key={plan.id}
              plan={plan}
              pillar={pillar}
              billingCycle={billingCycle}
              onUpgrade={handleUpgrade}
              checkoutLoading={checkoutLoading}
              owned={!plan.free && (activePillar === 'research' ? accessStatus.hasResearchAccess : accessStatus.hasCoreAccess)}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 mt-10">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Promo code"
            className="h-10 px-4 rounded-lg border bg-white text-sm w-64 text-center"
            style={{ borderColor: '#E5E3DC', color: '#2C2C2A' }}
          />
          <p className="text-xs" style={{ color: '#8A8A85' }}>Have a promo code? It will be applied at checkout.</p>
        </div>

        <p className="text-center text-sm mt-10" style={{ color: '#5F5F5B' }}>
          Need something custom?{' '}
          <a href="mailto:contact@suttain.com" className="underline" style={{ color: pillar.accent }}>Contact our team</a>
        </p>
      </div>
    </div>
  );
}