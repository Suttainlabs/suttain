import React from 'react';

export default function ProductTabs({ lines, activeId, onChange }) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex flex-wrap items-center justify-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1">
        {lines.map((line) => {
          const isActive = line.id === activeId;
          return (
            <button
              key={line.id}
              onClick={() => onChange(line.id)}
              aria-pressed={isActive}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                isActive ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
              style={isActive ? { color: line.color } : undefined}
            >
              <line.icon className="w-4 h-4" />
              {line.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}