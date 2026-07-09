import React from 'react';
import { ShieldCheck } from 'lucide-react';

function getScoreColor(score) {
  if (score >= 80) return { stroke: '#10b981', text: '#059669', label: 'Stable' };
  if (score >= 50) return { stroke: '#f59e0b', text: '#d97706', label: 'Moderate' };
  return { stroke: '#ef4444', text: '#dc2626', label: 'Unstable' };
}

export default function StabilityScoreBadge({ score }) {
  if (score == null || isNaN(score)) return null;

  const colors = getScoreColor(score);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <div className="relative" style={{ width: 100, height: 100 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <text x="50" y="52" textAnchor="middle" fontSize="22" fontWeight="bold" fill={colors.text}>
            {Math.round(score)}
          </text>
          <text x="50" y="66" textAnchor="middle" fontSize="9" fill="#94a3b8">/ 100</text>
        </svg>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-bold text-slate-800">Formula Stability Score</p>
        </div>
        <p className="text-lg font-bold" style={{ color: colors.text }}>{colors.label}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Computed from pairwise ingredient interactions, oxidation risk, and preservative efficacy
        </p>
      </div>
    </div>
  );
}