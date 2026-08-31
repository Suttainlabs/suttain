import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, Gauge, Radar, BarChart3 } from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis, RadarChart as RechartsRadar, PolarGrid, PolarRadiusAxis, Radar as RadarSeries, BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const scoreColor = (score) => (score >= 70 ? "#02988C" : score >= 40 ? "#D4900A" : "#DC2626");

function deriveScores(productData, ingredientAnalysis) {
  const risk = ingredientAnalysis?.result?.risk_rating;
  const nova = productData?.nova_group;
  const allergens = productData?.allergens?.length || 0;

  const chemicalSafety = risk === "low" ? 90 : risk === "medium" ? 55 : risk === "high" ? 25 : 50;
  const sustainability = nova === 1 ? 85 : nova === 2 ? 70 : nova === 3 ? 45 : nova === 4 ? 25 : 50;
  const allergenRisk = allergens === 0 ? 90 : allergens <= 2 ? 65 : 30;
  const processingLevel = nova === 1 ? 90 : nova === 2 ? 70 : nova === 3 ? 45 : nova === 4 ? 25 : 50;

  const overall = Math.round((chemicalSafety + sustainability + allergenRisk + processingLevel) / 4);

  return { chemicalSafety, sustainability, allergenRisk, processingLevel, overall };
}

function getConcerns(ingredientAnalysis) {
  const concerns = ingredientAnalysis?.result?.concerns || [];
  return concerns.map((c) => {
    const lower = c.toLowerCase();
    const level = lower.includes("carcinogen") || lower.includes("toxic") || lower.includes("endocrine") ? 90
      : lower.includes("irritant") || lower.includes("sensitiz") || lower.includes("allergen") ? 65 : 45;
    return { name: c.length > 30 ? c.slice(0, 30) + "..." : c, level, color: scoreColor(level) };
  });
}

export default function ScanResultsCharts() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(null); setData(null);
    try {
      const [productRes, ingredientRes] = await Promise.all([
        base44.functions.invoke("suttainProductData", { name: query.trim() }).catch(() => null),
        base44.functions.invoke("suttainIntelligence", { task: "ingredient_analysis", input: query.trim() }).catch(() => null),
      ]);
      if (!productRes && !ingredientRes) throw new Error("No data found for this product.");
      const scores = deriveScores(productRes, ingredientRes);
      const concerns = getConcerns(ingredientRes);
      setData({ product: productRes, ingredient: ingredientRes, scores, concerns });
    } catch (e) {
      setError(e.message || "Analysis failed.");
    } finally { setLoading(false); }
  };

  const radarData = data ? [
    { dimension: "Chemical Safety", score: data.scores.chemicalSafety },
    { dimension: "Sustainability", score: data.scores.sustainability },
    { dimension: "Allergen Risk", score: data.scores.allergenRisk },
    { dimension: "Processing Level", score: data.scores.processingLevel },
  ] : [];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="w-5 h-5 text-[#02988C]" />
        <h3 className="font-bold text-[#0A1F1D] text-sm">Safety score visualization</h3>
      </div>

      <div className="flex gap-2 mb-4">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          placeholder="Enter product name to visualize..." className="flex-1 h-10 border-[#E5E7EB] focus-visible:ring-[#02988C]" />
        <Button onClick={handleAnalyze} loading={loading} size="sm" className="h-10"><Search className="w-4 h-4" /> Analyze</Button>
      </div>

      {loading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#02988C]" /></div>}
      {error && <p className="text-[#DC2626] text-sm">{error}</p>}

      {data && (
        <div className="space-y-5">
          {/* Radial Gauge */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Gauge className="w-4 h-4 text-[#02988C]" />
              <span className="text-xs font-semibold text-[#0A1F1D]">Overall safety score</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "score", value: data.scores.overall, fill: scoreColor(data.scores.overall) }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: "#E5E7EB" }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center -mt-24 mb-12">
              <span className="text-4xl font-bold" style={{ color: scoreColor(data.scores.overall) }}>{data.scores.overall}</span>
              <span className="text-sm text-[#6B7280]">/100</span>
            </div>
          </div>

          {/* Radar Chart */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Radar className="w-4 h-4 text-[#9531F5]" />
              <span className="text-xs font-semibold text-[#0A1F1D]">Score breakdown by dimension</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <RechartsRadar data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: "#4B5563" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#6B7280" }} />
                <RadarSeries name="Score" dataKey="score" stroke="#02988C" fill="#02988C" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip />
              </RechartsRadar>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Flagged Ingredients */}
          {data.concerns.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart3 className="w-4 h-4 text-[#02988C]" />
                <span className="text-xs font-semibold text-[#0A1F1D]">Flagged concerns ({data.concerns.length})</span>
              </div>
              <ResponsiveContainer width="100%" height={Math.max(120, data.concerns.length * 36)}>
                <BarChart data={data.concerns} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#6B7280" }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 9, fill: "#4B5563" }} />
                  <Tooltip cursor={{ fill: "#F0FDFA" }} />
                  <Bar dataKey="level" radius={[0, 6, 6, 0]}>
                    {data.concerns.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Text summary */}
          {data.ingredient?.result?.summary && (
            <div className="bg-[#F0FDFA] border border-[#02988C]/10 rounded-xl p-3">
              <p className="text-xs text-[#0A1F1D]"><span className="font-semibold">Summary: </span>{data.ingredient.result.summary}</p>
              {data.ingredient.result.risk_rating && (
                <p className="text-xs mt-1">
                  <span className="font-semibold text-[#0A1F1D]">Risk rating: </span>
                  <span className="font-bold" style={{ color: scoreColor(data.ingredient.result.risk_rating === "low" ? 90 : data.ingredient.result.risk_rating === "medium" ? 55 : 25) }}>
                    {data.ingredient.result.risk_rating.toUpperCase()}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}