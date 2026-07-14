import React from 'react';
import { USE_CASES, USE_CASE_ORDER } from './useCaseData';
import { TrustLabel, TierBadge } from './StudioShared';
import { ArrowRight, Check } from 'lucide-react';

export default function UseCaseSection({ activeTab, onTabChange }) {
  const useCase = USE_CASES[activeTab];

  return (
    <div className="space-y-5">
      {/* Pill tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {USE_CASE_ORDER.map(key => {
          const uc = USE_CASES[key];
          const isActive = activeTab === key;
          return (
            <button key={key} onClick={() => onTabChange(key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#007850] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {uc.label}
            </button>
          );
        })}
      </div>

      {/* Split card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left: visual */}
          <div className="md:w-2/5 bg-gradient-to-br from-slate-50 to-[#EDF7F2] flex items-center justify-center p-8 min-h-[280px]">
            <img src={useCase.image} alt={useCase.label} className="w-full max-w-sm rounded-xl" />
          </div>
          {/* Right: content */}
          <div className="md:w-3/5 p-8">
            <h3 className="text-xl font-bold text-slate-900">{useCase.title}</h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">{useCase.subtitle}</p>
            <ul className="space-y-3">
              {useCase.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#007850]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">{action.label}</span>
                      <TierBadge tier={action.tier} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{action.detail}</p>
                    <div className="mt-1.5">
                      <TrustLabel source={action.source} type={action.sourceType} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <a href={useCase.actions[0].route} className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-[#007850] hover:text-[#005a3a]">
              Open {useCase.label} tools <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}