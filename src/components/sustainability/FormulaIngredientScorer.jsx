import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Plus, Trash2, Loader2, ChevronDown, ChevronUp, Sparkles, RefreshCw, X } from "lucide-react";
import AuthContext from "../auth/AuthContext";

const SCORE_COLOR = (score) => {
  if (score >= 75) return { text: "text-green-600", bg: "bg-green-100", bar: "bg-green-500", label: "Excellent" };
  if (score >= 50) return { text: "text-yellow-600", bg: "bg-yellow-100", bar: "bg-yellow-500", label: "Moderate" };
  if (score >= 25) return { text: "text-orange-600", bg: "bg-orange-100", bar: "bg-orange-500", label: "Poor" };
  return { text: "text-red-600", bg: "bg-red-100", bar: "bg-red-500", label: "Harmful" };
};

const ScoreBar = ({ score, label }) => {
  const colors = SCORE_COLOR(score);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className={`font-semibold ${colors.text}`}>{score}/100</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${colors.bar}`}
        />
      </div>
    </div>
  );
};

const CircleScore = ({ score, size = 120 }) => {
  const colors = SCORE_COLOR(score);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <motion.circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={score >= 75 ? "#22c55e" : score >= 50 ? "#eab308" : score >= 25 ? "#f97316" : "#ef4444"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className={`text-2xl font-bold ${colors.text}`}>{score}</div>
        <div className="text-xs text-slate-400">/100</div>
      </div>
    </div>
  );
};

const IngredientCard = ({ ingredient, expanded, onToggle }) => {
  const colors = SCORE_COLOR(ingredient.eco_score);
  return (
    <motion.div layout className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
          <span className={`font-bold text-sm ${colors.text}`}>{ingredient.eco_score}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm">{ingredient.name}</span>
            <Badge className={`text-xs border-0 ${colors.bg} ${colors.text}`}>{colors.label}</Badge>
          </div>
          <p className="text-xs text-slate-500 truncate">{ingredient.summary}</p>
        </div>
        <span className="text-slate-400 flex-shrink-0">{expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ScoreBar score={ingredient.biodegradability} label="Biodegradability" />
              <ScoreBar score={ingredient.aquatic_safety} label="Aquatic Safety" />
              <ScoreBar score={ingredient.renewable_sourcing} label="Renewable Source" />
            </div>
            {ingredient.concerns?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Environmental Concerns</p>
                <ul className="space-y-1">
                  {ingredient.concerns.map((c, i) => (
                    <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                      <span className="text-orange-400 mt-0.5">•</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ingredient.greener_alternative && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Greener Alternative</p>
                <p className="text-xs text-green-600">{ingredient.greener_alternative}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function FormulaIngredientScorer() {
  const { user } = useContext(AuthContext);
  const [ingredients, setIngredients] = useState([{ name: "", percentage: "" }]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);

  const addIngredient = () => setIngredients(prev => [...prev, { name: "", percentage: "" }]);
  const removeIngredient = (i) => setIngredients(prev => prev.filter((_, idx) => idx !== i));
  const updateIngredient = (i, field, value) =>
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing));

  const handleAnalyze = async () => {
    const valid = ingredients.filter(i => i.name.trim());
    if (valid.length === 0) return;
    setIsLoading(true);
    setResult(null);
    setExpandedIdx(null);

    try {
      const ingredientList = valid.map(i => `${i.name.trim()}${i.percentage ? ` (${i.percentage}%)` : ""}`).join(", ");

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an environmental chemist. Analyze the sustainability and eco-impact of these formula ingredients: ${ingredientList}.

For each ingredient, provide:
- eco_score (0-100, higher = greener)
- biodegradability (0-100)
- aquatic_safety (0-100)
- renewable_sourcing (0-100)
- summary (one sentence)
- concerns (array of 1-3 strings about environmental issues)
- greener_alternative (string or null if already green)

Also provide:
- overall_score (0-100, weighted average)
- overall_summary (2-3 sentences about the formula's eco-profile)
- top_recommendation (single most impactful change to improve sustainability)
- certifications_possible (array of certifications this formula could achieve, e.g. "ECOCERT", "COSMOS")

Return JSON only.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            overall_summary: { type: "string" },
            top_recommendation: { type: "string" },
            certifications_possible: { type: "array", items: { type: "string" } },
            ingredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  eco_score: { type: "number" },
                  biodegradability: { type: "number" },
                  aquatic_safety: { type: "number" },
                  renewable_sourcing: { type: "number" },
                  summary: { type: "string" },
                  concerns: { type: "array", items: { type: "string" } },
                  greener_alternative: { type: "string" }
                }
              }
            }
          }
        }
      });

      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const overallColors = result ? SCORE_COLOR(result.overall_score) : null;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      {!result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-1">Enter Your Formula Ingredients</h3>
          <p className="text-sm text-slate-500 mb-5">Add the ingredients you're using — we'll score each one for environmental impact.</p>

          <div className="space-y-3 mb-4">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Ingredient name (e.g. Sodium Lauryl Sulfate)"
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, "name", e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <input
                  type="number"
                  placeholder="%"
                  value={ing.percentage}
                  onChange={(e) => updateIngredient(i, "percentage", e.target.value)}
                  className="w-16 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                {ingredients.length > 1 && (
                  <button onClick={() => removeIngredient(i)} className="text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={addIngredient} className="gap-2">
              <Plus className="w-4 h-4" /> Add Ingredient
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !ingredients.some(i => i.name.trim())}
              className="gap-2 bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white hover:opacity-90"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isLoading ? "Analyzing..." : "Analyze Sustainability"}
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Overall Score Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Formula Eco-Score</h3>
                <p className={`text-sm font-semibold ${overallColors.text}`}>{overallColors.label} Sustainability</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setResult(null)} className="gap-2">
                <RefreshCw className="w-3 h-3" /> New Analysis
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <CircleScore score={result.overall_score} size={130} />
              <div className="flex-1 space-y-2">
                <p className="text-sm text-slate-600 leading-relaxed">{result.overall_summary}</p>
                {result.certifications_possible?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {result.certifications_possible.map((cert, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <Leaf className="w-3 h-3" />{cert}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {result.top_recommendation && (
              <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4 flex gap-3">
                <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-teal-800 mb-0.5">Top Recommendation</p>
                  <p className="text-sm text-teal-700">{result.top_recommendation}</p>
                </div>
              </div>
            )}
          </div>

          {/* Ingredient Breakdown */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3">Ingredient Breakdown</h3>
            <div className="space-y-2">
              {result.ingredients?.map((ing, i) => (
                <IngredientCard
                  key={i}
                  ingredient={ing}
                  expanded={expandedIdx === i}
                  onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}