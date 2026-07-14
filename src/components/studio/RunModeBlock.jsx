import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { TierBadge } from './StudioShared';

export default function RunModeBlock({ title, description, image, tier, isReversed, onOpen, learnMoreUrl }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 items-center">
      {/* Image side */}
      <div className={isReversed ? 'md:order-2' : 'md:order-1'}>
        <div className="bg-gradient-to-br from-slate-50 to-[#EDF7F2] border border-slate-200 rounded-2xl p-4 overflow-hidden">
          <img src={image} alt={title} className="w-full rounded-xl" />
        </div>
      </div>
      {/* Text side */}
      <div className={isReversed ? 'md:order-1' : 'md:order-2'}>
        <div className="flex items-center gap-2 mb-2">
          <TierBadge tier={tier} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-1 mb-5">{description}</p>
        <div className="flex items-center gap-3">
          <button onClick={onOpen}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#007850] text-white rounded-lg text-sm font-semibold hover:bg-[#005a3a] transition-colors">
            Open tool <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <a href={learnMoreUrl || '/APIPortal'}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
            <BookOpen className="w-3.5 h-3.5" /> Learn more
          </a>
        </div>
      </div>
    </div>
  );
}