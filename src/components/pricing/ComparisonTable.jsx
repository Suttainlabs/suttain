import React from 'react';
import { Check, Minus } from 'lucide-react';

const FEATURES = [
  { label: 'Molecular queries', tiers: { free: true, starter: true, pro: true, academic: true, lifetime: true } },
  { label: 'PubChem access', tiers: { free: true, starter: true, pro: true, academic: true, lifetime: true } },
  { label: 'Product scans (unlimited)', tiers: { free: true, starter: true, pro: true, academic: true, lifetime: true } },
  { label: 'Ingredient database', tiers: { free: true, starter: true, pro: true, academic: true, lifetime: true } },
  { label: 'Community support', tiers: { free: true, starter: true, pro: true, academic: true, lifetime: true } },
  { label: 'Simulations per month', tiers: { free: '3', starter: '10', pro: 'Unlimited', academic: 'Unlimited', lifetime: 'Unlimited' } },
  { label: 'Formula generations per month', tiers: { free: '5', starter: 'Unlimited', pro: 'Unlimited', academic: 'Unlimited', lifetime: 'Unlimited' } },
  { label: 'Structural Biology access', tiers: { free: false, starter: true, pro: true, academic: true, lifetime: true } },
  { label: 'DFT & MD simulations', tiers: { free: false, starter: false, pro: true, academic: true, lifetime: true } },
  { label: 'Research API', tiers: { free: false, starter: false, pro: true, academic: true, lifetime: true } },
  { label: 'Citation-ready exports', tiers: { free: false, starter: false, pro: true, academic: true, lifetime: true } },
  { label: 'Team seats', tiers: { free: '1', starter: '1', pro: '1', academic: 'Up to 10', lifetime: '1' } },
  { label: 'Priority compute queue', tiers: { free: false, starter: false, pro: false, academic: true, lifetime: false } },
  { label: 'Lab workspace', tiers: { free: false, starter: false, pro: false, academic: true, lifetime: false } },
  { label: 'One-time payment (no renewal)', tiers: { free: false, starter: false, pro: false, academic: false, lifetime: true } },
];

const TIER_COLUMNS = [
  { key: 'free', label: 'Free' },
  { key: 'starter', label: 'Starter' },
  { key: 'pro', label: 'Pro' },
  { key: 'academic', label: 'Academic' },
  { key: 'lifetime', label: 'Lifetime' },
];

export default function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left font-bold text-slate-900 px-4 py-4 sticky left-0 bg-slate-50 z-10 min-w-[200px]">
              Features
            </th>
            {TIER_COLUMNS.map((col) => (
              <th key={col.key} className="text-center font-bold text-slate-900 px-4 py-4 min-w-[120px]">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURES.map((feature, idx) => (
            <tr
              key={idx}
              className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
            >
              <td className="text-left font-medium text-slate-700 px-4 py-3 sticky left-0 bg-inherit z-10 border-r border-slate-100">
                {feature.label}
              </td>
              {TIER_COLUMNS.map((col) => {
                const value = feature.tiers[col.key];
                return (
                  <td key={col.key} className="text-center px-4 py-3">
                    {value === true ? (
                      <Check className="w-4 h-4 text-[#007850] mx-auto" />
                    ) : value === false ? (
                      <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                    ) : (
                      <span className="text-slate-700 font-medium text-xs">{value}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}