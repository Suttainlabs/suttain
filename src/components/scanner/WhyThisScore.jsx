import React, { useState } from 'react';
import { ChevronDown, Loader2, ExternalLink, FlaskConical, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CONFIDENCE_STYLES = {
  high: { label: 'High Confidence', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { label: 'Medium Confidence', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  low: { label: 'Low Confidence', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

export default function WhyThisScore({ ingredientName, doseAnalysis, onLoad, loading, error }) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (newExpanded && !doseAnalysis && !loading) {
      onLoad();
    }
  };

  const analysis = doseAnalysis;
  const conf = analysis ? CONFIDENCE_STYLES[analysis.confidence] || CONFIDENCE_STYLES.low : null;

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <button
        onClick={handleToggle}
        className="flex items-center justify-between w-full text-left text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5 text-[var(--suttain-teal)]" />
          Why this score?
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-2.5 space-y-2.5">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analyzing dose and regulatory data...
            </div>
          )}

          {error && !loading && (
            <div className="flex items-start gap-2 p-2.5 bg-red-50 rounded-lg text-xs text-red-700">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Could not load dose analysis. {error}</span>
            </div>
          )}

          {analysis && !loading && (
            <>
              {/* Confidence badge + dose-adjusted score */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {conf && (
                  <Badge className={`text-[10px] ${conf.bg} ${conf.text} ${conf.border} border`}>
                    {conf.label}
                  </Badge>
                )}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500">Dose-adjusted:</span>
                  <span className={`font-bold ${
                    analysis.dose_adjusted_score >= 70 ? 'text-emerald-600' :
                    analysis.dose_adjusted_score >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {analysis.dose_adjusted_score}/100
                  </span>
                </div>
              </div>

              {/* Concentration context */}
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Concentration Context</p>
                <p className="text-xs text-slate-700">{analysis.typical_concentration}</p>
                {!analysis.concentration_known && (
                  <p className="text-[10px] text-amber-600 mt-1 italic">
                    Score is based on presence only and may overstate risk.
                  </p>
                )}
              </div>

              {/* Safe-use level */}
              {analysis.safe_use_level && (
                <div className="p-2.5 bg-emerald-50 rounded-lg">
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">Safe-Use Level</p>
                  <p className="text-xs text-emerald-800">{analysis.safe_use_level}</p>
                  {analysis.regulatory_source && (
                    <p className="text-[10px] text-emerald-600 mt-0.5">{analysis.regulatory_source}</p>
                  )}
                </div>
              )}

              {/* Reasoning */}
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Reasoning</p>
                <p className="text-xs text-blue-800 leading-relaxed">{analysis.reasoning}</p>
              </div>

              {/* Source citation — per ingredient, not generic */}
              {analysis.source_citation && (
                <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                  <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{analysis.source_citation}</span>
                </div>
              )}
            </>
          )}

          {!analysis && !loading && !error && (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <AlertCircle className="w-3.5 h-3.5" />
              No dose data available for this ingredient.
            </div>
          )}
        </div>
      )}
    </div>
  );
}