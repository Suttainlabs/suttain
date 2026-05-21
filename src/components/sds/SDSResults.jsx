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

const RiskGauge = ({ score }) => {
  const color = score >= 75 ? "#ef4444" : score >= 50 ? "#f97316" : score >= 25 ? "#eab308" : "#22c55e";
  const label = score >= 75 ? "High Risk" : score >= 50 ? "Moderate Risk" : score >= 25 ? "Low-Moderate" : "Low Risk";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${2.513 * score} ${251.3 - 2.513 * score}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
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
    const chemicals = (data.ingredients || []).map(i => i.name).filter(Boolean).join(",");
    navigate(`${createPageUrl("Simulator")}?chemicals=${encodeURIComponent(chemicals)}`);
  };

  const handleGenerateFormula = () => {
    navigate(createPageUrl("generator"));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-teal-100 text-sm mb-1">SDS Analysis Complete</p>
            <h2 className="text-2xl font-bold">{data.product_name || "Unknown Product"}</h2>
            {data.manufacturer && <p className="text-teal-100 mt-1">{data.manufacturer}</p>}
            {data.cas_number && <p className="text-teal-200 text-sm mt-0.5">CAS: {data.cas_number}</p>}
          </div>
          <RiskGauge score={data.overall_risk_score ?? 0} />
        </div>
        {data.summary && (
          <p className="mt-4 text-teal-50 text-sm leading-relaxed bg-white/10 rounded-xl px-4 py-3">{data.summary}</p>
        )}
        <div className="flex gap-3 mt-4 flex-wrap">
          <Button onClick={handleSimulate} className="bg-white text-teal-700 hover:bg-teal-50 font-semibold rounded-full px-5">
            <FlaskConical className="w-4 h-4 mr-2" /> Simulate in Suttain
          </Button>
          <Button onClick={handleGenerateFormula} variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full px-5">
            <Zap className="w-4 h-4 mr-2" /> Generate Safer Formula
          </Button>
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