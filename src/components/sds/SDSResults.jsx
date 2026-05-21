import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Leaf, FlaskConical, ArrowRight, ChevronDown, ChevronUp, Zap, Shield, Info, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const HAZARD_COLORS = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const RiskGaugeArc = ({ score }) => {
  const label = score >= 75 ? "High Risk" : score >= 50 ? "Moderate Risk" : score >= 25 ? "Low-Moderate" : "Low Risk";
  // Semi-circle gauge: arc goes from 180deg to 0deg (left to right)
  // We draw on a 120x70 viewBox with a half-circle arc
  const r = 50;
  const cx = 60;
  const cy = 62;
  const circumference = Math.PI * r; // half circle
  const progress = (score / 100) * circumference;
  // Gradient stops: green (left) -> yellow -> orange -> red (right)
  return (
    <div className="flex flex-col items-center">
      <svg width="130" height="80" viewBox="0 0 120 75">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="url(#gaugeGrad)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
      </svg>
      <div className="-mt-6 flex items-baseline gap-1">
        <span className="text-5xl font-bold text-white">{score}</span>
        <span className="text-lg text-white/60 font-medium">/ 100</span>
      </div>
      <span className="text-sm font-semibold text-white/80 mt-1">{label}</span>
    </div>
  );
};

const Section = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Icon className="w-4 h-4 text-teal-600" />
          {title}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 py-4">{children}</div>}
    </div>
  );
};

export default function SDSResults({ data, fileName, onReset }) {
  const navigate = useNavigate();

  const handleSimulate = () => {
    const chemicals = (data.ingredients || []).map(i => i.name || i.ingredient_name).filter(Boolean).join(",");
    navigate(`${createPageUrl("Simulator")}?chemicals=${encodeURIComponent(chemicals)}`);
  };

  const handleGenerateFormula = () => {
    navigate(createPageUrl("generator"));
  };

  return (
    <div className="space-y-5">
      {/* Header — Glassmorphism */}
      <div
        className="rounded-2xl p-7 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #133a37 0%, #0d4a46 45%, #0a5c52 100%)" }}
      >
        <div className="relative z-10 flex items-start gap-6 flex-wrap">
          {/* Left: info + summary + buttons */}
          <div className="flex-1 min-w-0">
            <p className="text-white/55 text-sm font-medium tracking-wide mb-3">SDS Analysis Complete</p>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <h2 className="text-3xl font-bold text-white">{data.product_name || "Unknown Product"}</h2>
              {data.manufacturer && (
                <span className="px-3 py-1 rounded-md text-sm font-medium text-white/75" style={{ background: "rgba(255,255,255,0.1)" }}>
                  {data.manufacturer.split(",")[0]}
                </span>
              )}
              {data.cas_number && (
                <span className="px-3 py-1 rounded-md text-sm font-medium text-white/75" style={{ background: "rgba(255,255,255,0.1)" }}>
                  CAS: {data.cas_number}
                </span>
              )}
            </div>
            {data.summary && (
              <p className="text-white/80 text-base leading-relaxed mb-6">{data.summary}</p>
            )}
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={handleSimulate}
                className="font-semibold rounded-xl px-6 py-2.5 text-sm border"
                style={{ background: "rgba(2,152,140,0.85)", color: "white", borderColor: "rgba(2,200,180,0.5)" }}
              >
                <FlaskConical className="w-4 h-4 mr-2" /> Simulate in Suttain
              </Button>
              <Button
                onClick={handleGenerateFormula}
                className="font-semibold rounded-xl px-6 py-2.5 text-sm border-0"
                style={{ background: "rgba(255,255,255,0.95)", color: "#1e293b" }}
              >
                <Zap className="w-4 h-4 mr-2" /> Generate Safer Formula
              </Button>
            </div>
          </div>
          {/* Right: gauge */}
          <div className="shrink-0">
            <RiskGaugeArc score={data.overall_risk_score ?? 0} />
          </div>
        </div>
      </div>

      {/* Hazard Classifications */}
      {data.hazard_classifications?.length > 0 && (
        <Section title="Hazard Classifications" icon={AlertTriangle}>
          <div className="flex flex-wrap gap-2">
            {data.hazard_classifications.map((h, i) => (
              <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">{h}</Badge>
            ))}
          </div>
        </Section>
      )}

      {/* Ingredients */}
      {data.ingredients?.length > 0 && (
        <Section title="Ingredients / Components" icon={FlaskConical}>
          <div className="space-y-2">
            {data.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{ing.name}</p>
                  {ing.cas && <p className="text-xs text-slate-500">CAS: {ing.cas}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {ing.concentration_percent && (
                    <span className="text-xs text-slate-500">{ing.concentration_percent}</span>
                  )}
                  {ing.hazard_level && (
                    <Badge variant="outline" className={`text-xs ${HAZARD_COLORS[ing.hazard_level] || HAZARD_COLORS.medium}`}>
                      {ing.hazard_level}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Safer Alternatives */}
      {data.safer_alternatives?.length > 0 && (
        <Section title="Safer Alternatives" icon={Leaf}>
          <div className="space-y-3">
            {data.safer_alternatives.map((alt, i) => (
              <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-700">{alt.ingredient_name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span className="font-bold text-green-700">{alt.alternative}</span>
                  </div>
                  {alt.estimated_risk_reduction_percent != null && (
                    <Badge className="bg-green-100 text-green-800 border-green-300 shrink-0">
                      -{alt.estimated_risk_reduction_percent}% risk
                    </Badge>
                  )}
                </div>
                {alt.reason && <p className="text-xs text-slate-600 mt-1.5">{alt.reason}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Formula Recommendations */}
      {data.formula_recommendations?.length > 0 && (
        <Section title="Formula Recommendations" icon={ThumbsUp}>
          <ul className="space-y-2">
            {data.formula_recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Health & Environmental Hazards */}
      <div className="grid md:grid-cols-2 gap-4">
        {data.health_hazards?.length > 0 && (
          <Section title="Health Hazards" icon={Shield} defaultOpen={false}>
            <ul className="space-y-1.5">
              {data.health_hazards.map((h, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>{h}
                </li>
              ))}
            </ul>
          </Section>
        )}
        {data.environmental_hazards?.length > 0 && (
          <Section title="Environmental Hazards" icon={Leaf} defaultOpen={false}>
            <ul className="space-y-1.5">
              {data.environmental_hazards.map((h, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>{h}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* Physical Properties */}
      {data.physical_properties && (
        <Section title="Physical Properties" icon={Info} defaultOpen={false}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(data.physical_properties).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 capitalize">{k.replace(/_/g, " ")}</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* H & P Statements */}
      {(data.hazard_statements?.length > 0 || data.precautionary_statements?.length > 0) && (
        <Section title="H & P Statements" icon={AlertTriangle} defaultOpen={false}>
          <div className="grid md:grid-cols-2 gap-4">
            {data.hazard_statements?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Hazard Statements</p>
                <ul className="space-y-1">
                  {data.hazard_statements.map((s, i) => <li key={i} className="text-xs text-red-700 bg-red-50 rounded px-2 py-1">{s}</li>)}
                </ul>
              </div>
            )}
            {data.precautionary_statements?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Precautionary Statements</p>
                <ul className="space-y-1">
                  {data.precautionary_statements.map((s, i) => <li key={i} className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-1">{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={onReset} className="rounded-full px-6">
          Analyze Another SDS
        </Button>
      </div>
    </div>
  );
}