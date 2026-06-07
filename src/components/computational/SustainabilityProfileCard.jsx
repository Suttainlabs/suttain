import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Loader2, Droplets, Wind, Zap } from "lucide-react";

const LEVEL_COLOR = {
  Low: "bg-green-100 text-green-700",
  Moderate: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
  Unknown: "bg-slate-100 text-slate-500",
};

export default function SustainabilityProfileCard({ results, molecule }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (results) generateProfile();
  }, [results]);

  const generateProfile = async () => {
    setLoading(true);
    try {
      const moleculeName = molecule || results?.inputs?.molecule || results?.inputs?.compound || results?.inputs?.ligand || "the molecule";
      const prompt = `You are an environmental chemist. Based on what is known about the molecule "${moleculeName}", estimate its sustainability profile.

Return a JSON object with these exact keys:
- biodegradability_percent: number 0-100 (estimated % biodegradability under aerobic conditions, e.g. 85)
- persistence: string, one of "Low", "Moderate", "High" (environmental persistence)
- aquatic_toxicity: string, one of "Low", "Moderate", "High" (estimated aquatic toxicity class)
- carbon_footprint: string, one of "Low", "Moderate", "High" (relative carbon footprint of production/use)
- data_available: boolean (true if real data exists, false if estimated)
- notes: string (1 sentence note, or "Sustainability data limited for this compound. Manual review recommended." if data_available is false)`;

      const resp = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            biodegradability_percent: { type: "number" },
            persistence: { type: "string" },
            aquatic_toxicity: { type: "string" },
            carbon_footprint: { type: "string" },
            data_available: { type: "boolean" },
            notes: { type: "string" },
          }
        }
      });
      setProfile(resp);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (!results) return null;

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm">
      <CardContent className="p-5">
        <h3 className="font-bold text-green-900 flex items-center gap-2 text-sm mb-4">
          <Leaf className="w-4 h-4 text-green-600" />
          Sustainability Profile
        </h3>
        {loading ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating sustainability profile...
          </div>
        ) : profile ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-white rounded-xl border border-green-100">
                <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-slate-500 mb-1">Biodegradability</p>
                <p className="font-bold text-slate-800 text-sm">{profile.biodegradability_percent ?? "N/A"}%</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-green-100">
                <Wind className="w-4 h-4 text-teal-500 mx-auto mb-1" />
                <p className="text-xs text-slate-500 mb-1">Persistence</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLOR[profile.persistence] || LEVEL_COLOR.Unknown}`}>
                  {profile.persistence || "Unknown"}
                </span>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-green-100">
                <Droplets className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
                <p className="text-xs text-slate-500 mb-1">Aquatic Toxicity</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLOR[profile.aquatic_toxicity] || LEVEL_COLOR.Unknown}`}>
                  {profile.aquatic_toxicity || "Unknown"}
                </span>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-green-100">
                <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-xs text-slate-500 mb-1">Carbon Footprint</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLOR[profile.carbon_footprint] || LEVEL_COLOR.Unknown}`}>
                  {profile.carbon_footprint || "Unknown"}
                </span>
              </div>
            </div>
            <p className="text-xs text-green-700 bg-white rounded-lg p-2.5 border border-green-100">
              {profile.notes || "Sustainability data limited for this compound. Manual review recommended."}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Sustainability data limited for this compound. Manual review recommended.</p>
        )}
      </CardContent>
    </Card>
  );
}