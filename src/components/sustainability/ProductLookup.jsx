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
      const result = await base44.functions.invoke('runConsumerLLM', {
        operation: 'productLookup',
        data: { query, category }
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

      {/* Quick Suggestions */}
      {!isAnalyzing && !error && (
        <div>
          <p className="text-xs text-slate-500 font-medium mb-2">Try these popular products</p>
          <div className="flex flex-wrap gap-2">
            {['CeraVe Moisturizer', 'Dove Body Wash', 'Mrs. Meyers Cleaner', 'The Ordinary Niacinamide', 'Method Hand Soap', 'Olaplex Shampoo'].map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-[#02988C]/10 hover:text-[#02988C] rounded-full text-xs text-slate-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

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