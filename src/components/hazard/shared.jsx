import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ExternalLink, FileText, ShieldCheck } from 'lucide-react';

export function StatCard({ label, value, target, unit, met, icon: Icon, accent }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono" style={{ color: accent || '#00281E' }}>{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      {target && (
        <div className="flex items-center gap-1.5 mt-1">
          {met !== undefined && (
            met
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              : <XCircle className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className="text-xs text-slate-500">Target: {target}</span>
        </div>
      )}
    </div>
  );
}

export function ConfidenceBar({ value, label }) {
  const color = value >= 85 ? '#00B478' : value >= 60 ? '#D4900A' : '#C42B2B';
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-slate-700">{label || 'Confidence'}</span>
        <span className="text-sm font-mono font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function CitationBadge({ source, reference, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
    >
      <FileText className="w-3 h-3 text-violet-500" />
      <span>{source}</span>
      {reference && <span className="text-slate-400 font-mono">{reference}</span>}
      <ExternalLink className="w-3 h-3 text-slate-400" />
    </a>
  );
}

export function HazardCategoryChip({ category, confidence }) {
  const colors = {
    irritant: 'bg-amber-50 text-amber-700 border-amber-200',
    corrosive: 'bg-red-50 text-red-700 border-red-200',
    environmental_toxin: 'bg-purple-50 text-purple-700 border-purple-200',
    carcinogen_suspect: 'bg-rose-50 text-rose-700 border-rose-200',
    endocrine_disruptor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    sensitizer: 'bg-orange-50 text-orange-700 border-orange-200',
    none: 'bg-green-50 text-green-700 border-green-200',
  };
  const cls = colors[category] || 'bg-slate-50 text-slate-700 border-slate-200';
  const label = category.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-md text-xs font-semibold capitalize ${cls}`}>
      {label}
      {confidence !== undefined && <span className="font-mono opacity-70">{confidence}%</span>}
    </span>
  );
}

export function SectionCard({ title, subtitle, children, icon: Icon, accent, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
          {Icon && <Icon className="w-4 h-4" style={{ color: accent || '#6B3FA0' }} />}
          <div>
            {title && <h3 className="text-sm font-bold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function ProGate({ isPro, children }) {
  if (isPro) return <>{children}</>;
  return (
    <div className="rounded-xl border border-dashed border-violet-300 bg-violet-50/50 p-8 text-center">
      <ShieldCheck className="w-8 h-8 text-violet-400 mx-auto mb-3" />
      <p className="text-sm font-semibold text-violet-700">Researcher Pro or Institutional access required</p>
      <p className="text-xs text-violet-500 mt-1 max-w-sm mx-auto">
        This section contains full model internals, validation data, and feasibility tools.
        A simplified binary result with confidence is available in the Predict tab for all users.
      </p>
    </div>
  );
}

export function MoleculeImage({ smiles, name, size = 100 }) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    setError(false);
    if (!smiles) return;
    setImgSrc(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/PNG?width=${size * 2}&height=${size * 2}`);
  }, [smiles, size]);

  if (error || !imgSrc) {
    return (
      <div
        className="flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100"
        style={{ width: size, height: size }}
      >
        <span className="text-[10px] font-mono text-slate-400 px-1 text-center">{smiles ? smiles.slice(0, 20) : 'No structure'}</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={name || smiles}
      className="rounded-lg border border-slate-100 bg-white"
      style={{ width: size, height: size, objectFit: 'contain' }}
      onError={() => setError(true)}
    />
  );
}

export function SourceTraceabilityNote() {
  return (
    <div className="flex items-start gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
      <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-slate-500">
        Every prediction, metric, and data point carries a source citation or a
        "computed on held-out test set" label. Full traceability, no unexplained numbers.
      </p>
    </div>
  );
}