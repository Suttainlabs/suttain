import React from 'react';
import { ArrowRight, TrendingDown, DollarSign, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AlternativeCard({ alt, index, onSwap }) {
  const roi = alt.cost_saving_1yr > 0 ? `$${alt.cost_saving_1yr.toLocaleString()}/yr` : 'Cost neutral';
  const difficultyColor = alt.difficulty === 'Easy' ? 'bg-green-100 text-green-700'
    : alt.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-[#02988C]/40 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#02988C]/10 text-[#02988C] flex items-center justify-center font-bold text-sm flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-slate-800 text-sm">{alt.replace_ingredient}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-semibold text-[#02988C] text-sm">{alt.alternative_ingredient}</span>
          </div>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">{alt.reason}</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <TrendingDown className="w-3 h-3" />
              {alt.carbon_reduction_pct}% less CO2e
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
              <DollarSign className="w-3 h-3" />{roi}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
              <Leaf className="w-3 h-3" />Eco score +{alt.eco_score_gain} pts
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', difficultyColor)}>
              {alt.difficulty}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}