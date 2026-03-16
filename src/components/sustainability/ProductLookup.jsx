import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Clock, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "skincare", label: "Skincare" },
  { value: "cleaning", label: "Cleaning" },
  { value: "haircare", label: "Hair Care" },
  { value: "food", label: "Food" },
  { value: "household", label: "Household" },
];

export default function ProductLookup({ onAnalyze, recentSearches }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the sustainability of this product: "${query}" (category: ${category}).

Provide a detailed sustainability assessment using these 5 weighted metrics (scores 0-100):
1. Carbon Footprint (30%) - GHG emissions across lifecycle
2. Water Consumption (20%) - Water usage in sourcing and manufacturing
3. Packaging Sustainability (20%) - Recyclability, biodegradability, materials
4. Toxicity & Safety (20%) - Ingredient safety for humans and ecosystems
5. Ethical Sourcing (10%) - Fair trade, supply chain transparency

Calculate the overall score as a weighted average.

Also provide:
- Eco badges earned (from: "Low Carbon", "Plastic-Free", "Zero Toxins", "Water Efficient", "Ethically Sourced", "Biodegradable")
- Key reasons explaining the score
- 3 greener alternative products with their scores, why they're better, score improvement, and any certifications
- Specific improvement suggestions with percentage impact on score`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            category: { type: "string" },
            overall_score: { type: "number" },
            metrics: {
              type: "object",
              properties: {
                carbon_footprint: { type: "number" },
                water_consumption: { type: "number" },
                packaging_sustainability: { type: "number" },
                toxicity_safety: { type: "number" },
                ethical_sourcing: { type: "number" }
              }
            },
            eco_badges: { type: "array", items: { type: "string" } },
            score_reasons: { type: "array", items: { type: "string" } },
            alternatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  score: { type: "number" },
                  reason: { type: "string" },
                  score_improvement: { type: "number" },
                  certifications: { type: "array", items: { type: "string" } }
                }
              }
            },
            improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  suggestion: { type: "string" },
                  impact_percentage: { type: "number" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });
      onAnalyze(result);
    } catch (err) {
      console.error("Sustainability analysis failed:", err);
      setError("Analysis failed. Please try again with a more specific product name.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Enter product name or brand..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            className="pl-10 h-12"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44 h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAnalyze} disabled={isAnalyzing || !query.trim()} className="h-12 bg-[#02988C] hover:bg-[#027d73]">
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
          Analyze
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {isAnalyzing && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#02988C] mr-3" />
          <span className="text-slate-600">Analyzing sustainability data...</span>
        </div>
      )}

      {/* Recent Searches */}
      {recentSearches?.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 font-medium mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Recent Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s); }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}