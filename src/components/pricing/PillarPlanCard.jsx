import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export default function PillarPlanCard({ plan, pillar, billingCycle, onUpgrade, checkoutLoading, owned }) {
  const isYearly = billingCycle === 'yearly';
  const activeKey = isYearly ? plan.priceKeyYearly : plan.priceKey;
  const isBusy = checkoutLoading === activeKey;
  const price = isYearly ? plan.priceYearly : plan.priceMonthly;
  const note = isYearly ? plan.noteYearly : plan.noteMonthly;
  const disabled = plan.free || owned || isBusy || plan.custom;

  return (
    <div className="relative flex flex-col rounded-2xl border bg-white p-6 h-full"
      style={{ borderColor: plan.popular ? pillar.accent : '#E5E3DC' }}>
      {plan.popular && (
        <span className="absolute -top-3 left-6 text-xs font-medium px-3 py-1 rounded-full"
          style={{ background: pillar.fill, color: pillar.accent }}>
          Recommended
        </span>
      )}

      <h3 className="text-lg font-medium" style={{ color: '#2C2C2A' }}>{plan.name}</h3>
      <p className="text-sm mt-1 mb-4" style={{ color: '#5F5F5B' }}>{plan.description}</p>

      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-medium" style={{ color: '#2C2C2A' }}>{price}</span>
          {plan.priceSuffix && <span className="text-sm" style={{ color: '#5F5F5B' }}>{plan.priceSuffix}</span>}
        </div>
        <p className="text-xs mt-1" style={{ color: '#8A8A85' }}>{note}</p>
      </div>

      {plan.custom ? (
        <a
          href="mailto:contact@suttain.com?subject=Small%20business%20plan%20inquiry"
          className="w-full h-10 rounded-lg text-sm font-medium transition-opacity flex items-center justify-center"
          style={{ background: pillar.accent, color: '#FFFFFF' }}
        >
          {plan.cta}
        </a>
      ) : (
        <button
          onClick={() => !disabled && onUpgrade(activeKey)}
          disabled={disabled}
          className="w-full h-10 rounded-lg text-sm font-medium transition-opacity"
          style={disabled
            ? { background: '#F1F0EC', color: '#8A8A85' }
            : { background: pillar.accent, color: '#FFFFFF' }}
        >
          {owned
            ? 'Active on your account'
            : plan.free
              ? plan.cta
              : isBusy
                ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing</span>
                : plan.cta}
        </button>
      )}

      <ul className="space-y-2 mt-5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: pillar.accent }} />
            <span className="text-sm" style={{ color: '#5F5F5B' }}>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}