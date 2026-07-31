import React from 'react';
import { PILLARS } from './pillarPlans';

export default function PillarTabs({ active, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {PILLARS.map(p => {
        const isActive = p.id === active;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className="px-6 h-10 rounded-full text-sm font-medium border transition-all"
            style={isActive
              ? { background: p.fill, color: p.accent, borderColor: p.accent }
              : { background: '#FFFFFF', color: '#5F5F5B', borderColor: '#E5E3DC' }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}