import React, { useState } from "react";
import { Database, CheckCircle2, Loader2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

function parseNumber(str) {
  if (!str) return undefined;
  const n = parseFloat(String(str).replace(/[^\d.\-]/g, ""));
  return isNaN(n) ? undefined : n;
}

function mapSDSToChemical(data) {
  const physProps = data.physical_properties || {};

  // Map GHS hazard statements into ghs_classification array
  const ghsClassification = [
    ...(data.hazard_statements || []),
    ...(data.precautionary_statements || []),
  ].filter(Boolean);

  // Derive safety_level from overall_risk_score
  let safetyLevel = "unknown";
  const score = data.overall_risk_score ?? null;
  if (score !== null) {
    if (score >= 75) safetyLevel = "highly_hazardous";
    else if (score >= 50) safetyLevel = "hazardous";
    else if (score >= 25) safetyLevel = "moderate";
    else safetyLevel = "safe";
  }

  return {
    name: data.product_name || "Unknown Chemical",
    cas_number: data.cas_number || undefined,
    chemical_type: "compound",
    category: "other",
    safety_level: safetyLevel,
    description: data.summary || undefined,
    storage_requirements: (data.storage_requirements || []).join("; ") || undefined,
    data_source: "imported",
    physical_properties: {
      flash_point: parseNumber(physProps.flash_point),
      boiling_point: parseNumber(physProps.boiling_point),
      pka: parseNumber(physProps.ph),
      vapor_pressure: parseNumber(physProps.vapor_pressure),
    },
    toxicity_data: {
      ghs_classification: ghsClassification,
      signal_word: score >= 75 ? "danger" : score >= 25 ? "warning" : "none",
    },
    environmental_data: {
      persistence: (data.environmental_hazards || []).join("; ") || undefined,
    },
    synonyms: [],
    incompatibilities: [],
  };
}

export default function SDSSaveToDatabase({ data }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const mapped = mapSDSToChemical(data);

  const handleSave = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      await base44.entities.Chemical.create(mapped);
      setStatus("success");
    } catch (e) {
      setErrorMsg(e.message || "Failed to save to database.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-800 text-sm">Saved to Chemical Database</p>
          <p className="text-xs text-green-600 mt-0.5">{mapped.name} has been added to your chemical library.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-slate-50 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Database className="w-4 h-4 text-teal-600" />
          Save to Chemical Database
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs text-slate-500 flex items-center gap-1 hover:text-slate-700 transition-colors"
        >
          Preview data
          {showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {showPreview && (
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              <div><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-800">{mapped.name}</span></div>
              {mapped.cas_number && <div><span className="text-slate-500">CAS:</span> <span className="font-medium text-slate-800">{mapped.cas_number}</span></div>}
              <div><span className="text-slate-500">Safety Level:</span> <span className="font-medium text-slate-800 capitalize">{mapped.safety_level}</span></div>
              <div><span className="text-slate-500">Type:</span> <span className="font-medium text-slate-800">{mapped.chemical_type}</span></div>
              {mapped.physical_properties?.flash_point && (
                <div><span className="text-slate-500">Flash Point:</span> <span className="font-medium text-slate-800">{mapped.physical_properties.flash_point} degC</span></div>
              )}
              {mapped.physical_properties?.boiling_point && (
                <div><span className="text-slate-500">Boiling Point:</span> <span className="font-medium text-slate-800">{mapped.physical_properties.boiling_point} degC</span></div>
              )}
            </div>
            {mapped.toxicity_data?.ghs_classification?.length > 0 && (
              <div>
                <span className="text-slate-500 block mb-1">GHS / H & P Statements ({mapped.toxicity_data.ghs_classification.length}):</span>
                <div className="flex flex-wrap gap-1">
                  {mapped.toxicity_data.ghs_classification.slice(0, 5).map((s, i) => (
                    <span key={i} className="bg-red-50 text-red-700 border border-red-200 rounded px-1.5 py-0.5">{s}</span>
                  ))}
                  {mapped.toxicity_data.ghs_classification.length > 5 && (
                    <span className="text-slate-400">+{mapped.toxicity_data.ghs_classification.length - 5} more</span>
                  )}
                </div>
              </div>
            )}
            {mapped.description && (
              <div><span className="text-slate-500">Summary:</span> <span className="text-slate-700 leading-relaxed">{mapped.description}</span></div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={handleSave}
            disabled={status === "loading"}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 rounded-xl font-semibold"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Save to Database
              </>
            )}
          </Button>
          <p className="text-xs text-slate-500">
            Populates the Chemical Library with hazard data, GHS classifications, and physical constants extracted from the SDS.
          </p>
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}