import React from 'react';
import { ShieldAlert, ShieldCheck, ShieldQuestion, AlertTriangle } from 'lucide-react';

// Sourced hazard badge for the Chemical entity.
// Shows the safety_level with a consistent color + the data_source attribution
// so every chemical record surfaces its hazard classification and where it came from.

const LEVEL_CONFIG = {
  safe: {
    label: 'Safe',
    icon: ShieldCheck,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  moderate: {
    label: 'Moderate',
    icon: ShieldQuestion,
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  hazardous: {
    label: 'Hazardous',
    icon: AlertTriangle,
    classes: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
  },
  highly_hazardous: {
    label: 'Highly hazardous',
    icon: ShieldAlert,
    classes: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  unknown: {
    label: 'Unknown',
    icon: ShieldQuestion,
    classes: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
};

const SOURCE_LABELS = {
  pubchem: 'PubChem',
  chemspider: 'ChemSpider',
  drugbank: 'DrugBank',
  manual: 'Curated',
  imported: 'Imported',
  ai_enriched: 'AI',
};

export default function HazardBadge({ safetyLevel, dataSource, size = 'sm', showSource = true }) {
  const level = safetyLevel || 'unknown';
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.unknown;
  const Icon = config.icon;
  const sourceLabel = SOURCE_LABELS[dataSource] || (dataSource ? dataSource : null);

  const sizeClasses = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2 py-0.5 gap-1.5';

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={`inline-flex items-center rounded-md border font-semibold ${config.classes} ${sizeClasses}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <Icon className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        {config.label}
      </span>
      {showSource && sourceLabel && (
        <span className="text-[10px] text-slate-400 font-medium">
          {sourceLabel}
        </span>
      )}
    </div>
  );
}