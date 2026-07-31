import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export default function PlanCard({ plan, accent, onUpgrade, checkoutLoading, billingCycle }) {
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
    <div
      className={`relative flex flex-col rounded-2xl border p-6 h-full bg-white transition-shadow hover:shadow-lg ${
        plan.popular ? 'border-2 shadow-xl' : 'border-slate-200'
      }`}
      style={plan.popular ? { borderColor: accent } : undefined}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full text-white whitespace-nowrap" style={{ background: accent }}>
            Most popular
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: accent + '18' }}>
          <plan.icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        <h3 className="font-medium text-base text-slate-900">{plan.name}</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-medium text-slate-900">{displayPrice}</span>
          {plan.priceSuffix && displayPrice !== 'Custom' && (
            <span className="text-sm text-slate-500">{plan.priceSuffix}</span>
          )}
        </div>
        <p className="text-xs mt-1 text-slate-500">{displayNote}</p>
      </div>

      <p className="text-sm mb-5 leading-relaxed text-slate-600">{plan.description}</p>

      <button
        onClick={handleClick}
        disabled={plan.ctaDisabled || isBusy}
        className={`w-full h-10 rounded-lg font-medium text-sm mb-5 transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          plan.ctaDisabled
            ? 'bg-slate-100 text-slate-400 cursor-default'
            : 'text-white shadow-md hover:opacity-90'
        }`}
        style={plan.ctaDisabled ? undefined : { background: accent }}
      >
        {isBusy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
          </span>
        ) : (
          plan.cta
        )}
      </button>

      <ul className="space-y-2 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: accent }} />
            <span className="text-xs text-slate-600">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}