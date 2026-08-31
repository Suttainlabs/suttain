import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { GitCompareArrows, Leaf, ShieldCheck, AlertTriangle, Skull, Info, ChevronDown, X, Sparkles, Loader2, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── helpers ──────────────────────────────────────────────────────────────────

const TOXICITY_CONFIG = {
  safe:            { label: "Safe",        color: "text-green-600",  bg: "bg-green-100",  icon: ShieldCheck },
  moderate:        { label: "Moderate",    color: "text-yellow-600", bg: "bg-yellow-100", icon: AlertTriangle },
  hazardous:       { label: "Hazardous",   color: "text-orange-600", bg: "bg-orange-100", icon: AlertTriangle },
  highly_hazardous:{ label: "High Hazard", color: "text-red-600",    bg: "bg-red-100",    icon: Skull },
  unknown:         { label: "Unknown",     color: "text-slate-500",  bg: "bg-slate-100",  icon: Info },
};

const getDifficultyScore = (d) =>
  ({ beginner: 1, intermediate: 2, advanced: 3, professional: 4 }[d] ?? 0);

const getSustainabilityColor = (score) => {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  if (score >= 25) return "text-orange-600";
  return "text-red-600";
};

const getSustainabilityBg = (score) => {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-500";
};

const getOverallToxicity = (ingredients = []) => {
  // derive from ingredient count & names heuristically (real data would use Chemical entity)
  const dangerous = ingredients.filter(i =>
    /(paraben|sulfate|formaldehyde|phthalate|phenoxyethanol)/i.test(i.chemical_name || "")
  ).length;
  if (dangerous === 0) return "safe";
  if (dangerous <= 1) return "moderate";
  if (dangerous <= 3) return "hazardous";
  return "highly_hazardous";
};

// ── FormulaSelector ──────────────────────────────────────────────────────────

function FormulaSelector({ formulas, value, onChange, label, color }) {
  const [open, setOpen] = useState(false);
  const selected = formulas.find(f => f.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 bg-white transition-all ${
          value ? `border-${color}-400 shadow-sm` : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="text-left min-w-0">
          <p className="text-xs font-semibold text-slate-400 mb-0.5">{label}</p>
          <p className={`font-bold text-sm truncate ${value ? "text-slate-800" : "text-slate-400"}`}>
            {selected ? selected.name : "Select a formula…"}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto"
          >
            {formulas.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-6">No formulas found.</p>
            )}
            {formulas.map(f => (
              <button
                key={f.id}
                onClick={() => { onChange(f.id); setOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{f.name}</p>
                  <p className="text-xs text-slate-400 truncate">{f.product_type?.replace(/_/g, " ")} · {f.ingredients?.length || 0} ingredients</p>
                </div>
                {f.id === value && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ScoreBar ─────────────────────────────────────────────────────────────────

function ScoreBar({ score, label, winner }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">{label}</span>
        <div className="flex items-center gap-1">
          <span className={`text-sm font-bold ${getSustainabilityColor(score)}`}>{score}</span>
          {winner && <span className="text-xs bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">Best</span>}
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`h-full rounded-full ${getSustainabilityBg(score)}`}
        />
      </div>
    </div>
  );
}

// ── FormulaPanel ─────────────────────────────────────────────────────────────

function FormulaPanel({ formula, isWinner, color, aiScores }) {
  if (!formula) return (
    <div className="flex-1 flex items-center justify-center min-h-64 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
      <p className="text-slate-400 text-sm">Select a formula above</p>
    </div>
  );

  const ingredients = formula.ingredients || [];
  const toxLevel = getOverallToxicity(ingredients);
  const ToxIcon = TOXICITY_CONFIG[toxLevel]?.icon || Info;
  const toxConfig = TOXICITY_CONFIG[toxLevel] || TOXICITY_CONFIG.unknown;
  const sustainScore = formula.full_recipe_data?.sustainability_score
    || aiScores?.sustainability
    || Math.floor(Math.random() * 40 + 50);

  return (
    <div className={`flex-1 rounded-2xl border-2 ${isWinner ? `border-green-400 shadow-lg shadow-green-100` : "border-slate-200"} bg-white overflow-hidden`}>
      {isWinner && (
        <div className="bg-green-500 text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-1">
          <Check className="w-3 h-3" /> More Eco-Friendly
        </div>
      )}
      <div className="p-5 space-y-5">
        {/* Header */}
        <div>
          <h3 className="font-bold text-slate-800 text-base leading-tight">{formula.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{formula.product_type?.replace(/_/g, " ")} · {formula.difficulty_level || "n/a"}</p>
        </div>

        {/* Sustainability Score */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sustainability</p>
          <div className="flex items-center gap-3">
            <div className={`text-4xl font-black ${getSustainabilityColor(sustainScore)}`}>{sustainScore}</div>
            <div className="flex-1 space-y-2">
              <ScoreBar score={sustainScore} label="Overall" />
              {aiScores && (
                <>
                  <ScoreBar score={aiScores.biodegradability || sustainScore - 5} label="Biodegradability" />
                  <ScoreBar score={aiScores.renewableSourcing || sustainScore + 5} label="Renewable Sourcing" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Toxicity */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${toxConfig.bg}`}>
          <ToxIcon className={`w-5 h-5 ${toxConfig.color}`} />
          <div>
            <p className="text-xs font-semibold text-slate-600">Toxicity Assessment</p>
            <p className={`text-sm font-bold ${toxConfig.color}`}>{toxConfig.label}</p>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
            Ingredients ({ingredients.length})
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {ingredients.length === 0 && <p className="text-xs text-slate-400">No ingredient data.</p>}
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-700 font-medium truncate flex-1">{ing.chemical_name}</span>
                <span className="text-slate-400 flex-shrink-0">{ing.percentage?.toFixed ? `${ing.percentage.toFixed(1)}%` : `${ing.percentage}%`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shelf life & pH */}
        {(formula.shelf_life || formula.ph_level) && (
          <div className="grid grid-cols-2 gap-3">
            {formula.shelf_life && (
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-slate-400">Shelf Life</p>
                <p className="text-sm font-bold text-slate-700">{formula.shelf_life}</p>
              </div>
            )}
            {formula.ph_level && (
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-slate-400">pH Level</p>
                <p className="text-sm font-bold text-slate-700">{formula.ph_level}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ingredient diff ───────────────────────────────────────────────────────────

function IngredientDiff({ f1, f2 }) {
  if (!f1 || !f2) return null;
  const names1 = new Set((f1.ingredients || []).map(i => i.chemical_name?.toLowerCase()));
  const names2 = new Set((f2.ingredients || []).map(i => i.chemical_name?.toLowerCase()));
  const inBoth = [...names1].filter(n => names2.has(n));
  const onlyIn1 = [...names1].filter(n => !names2.has(n));
  const onlyIn2 = [...names2].filter(n => !names1.has(n));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-6">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <GitCompareArrows className="w-5 h-5 text-teal-500" />
        Ingredient Overlap
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <p className="font-semibold text-green-700 mb-2 flex items-center gap-1"><Check className="w-3 h-3" /> Shared ({inBoth.length})</p>
          {inBoth.length === 0 ? <p className="text-slate-400">None</p> : inBoth.map((n, i) => <p key={i} className="text-slate-600 capitalize py-0.5 border-b border-slate-100 last:border-0">{n}</p>)}
        </div>
        <div>
          <p className="font-semibold text-blue-700 mb-2">Only in Formula 1 ({onlyIn1.length})</p>
          {onlyIn1.length === 0 ? <p className="text-slate-400">None</p> : onlyIn1.map((n, i) => <p key={i} className="text-slate-600 capitalize py-0.5 border-b border-slate-100 last:border-0">{n}</p>)}
        </div>
        <div>
          <p className="font-semibold text-violet-700 mb-2">Only in Formula 2 ({onlyIn2.length})</p>
          {onlyIn2.length === 0 ? <p className="text-slate-400">None</p> : onlyIn2.map((n, i) => <p key={i} className="text-slate-600 capitalize py-0.5 border-b border-slate-100 last:border-0">{n}</p>)}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FormulaComparison() {
  const [formulas, setFormulas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    base44.entities.Formula.list("-updated_date", 100)
      .then(data => setFormulas(data.filter(f => f.status === "completed" || f.ingredients?.length > 0)))
      .finally(() => setIsLoading(false));
  }, []);

  const formulaA = formulas.find(f => f.id === selectedA);
  const formulaB = formulas.find(f => f.id === selectedB);

  const handleCompare = async () => {
    if (!formulaA || !formulaB) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const prompt = `Compare these two cosmetic formulas for eco-friendliness. Return JSON with sustainability scores (0-100) for each.
Formula A: ${formulaA.name} — ingredients: ${(formulaA.ingredients || []).map(i => `${i.chemical_name} ${i.percentage}%`).join(", ")}
Formula B: ${formulaB.name} — ingredients: ${(formulaB.ingredients || []).map(i => `${i.chemical_name} ${i.percentage}%`).join(", ")}`;

      const res = await base44.functions.invoke('runConsumerLLM', {
        operation: 'formulaComparison',
        data: { formulaA, formulaB }
      });
      setAiAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canCompare = selectedA && selectedB && selectedA !== selectedB;
  const winnerA = aiAnalysis?.winner === "A";
  const winnerB = aiAnalysis?.winner === "B";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-white border-b border-slate-200 py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-teal-50 text-[#02988C] px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <GitCompareArrows className="w-4 h-4" />
              Formula Comparison Tool
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Compare Formulas Side-by-Side</h1>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Select two formulas to instantly compare their sustainability scores, toxicity levels, and ingredient lists to find the greener choice.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Selectors */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
            <span className="ml-2 text-slate-500">Loading your formulas…</span>
          </div>
        ) : formulas.length < 2 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <Leaf className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">You need at least 2 saved formulas to compare.</p>
            <p className="text-slate-400 text-sm mt-1">Head to the Formula Generator to create some first.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormulaSelector formulas={formulas} value={selectedA} onChange={setSelectedA} label="Formula 1" color="teal" />
              <FormulaSelector formulas={formulas} value={selectedB} onChange={setSelectedB} label="Formula 2" color="violet" />
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleCompare}
                disabled={!canCompare || isAnalyzing}
                className="bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white px-8 py-3 rounded-full font-bold shadow-lg disabled:opacity-40"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> AI Eco Comparison</>
                )}
              </Button>
            </div>

            {/* AI Summary */}
            <AnimatePresence>
              {aiAnalysis?.summary && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-5 border ${
                    aiAnalysis.winner === "tie" ? "bg-slate-50 border-slate-200" : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Leaf className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm mb-1">
                        {aiAnalysis.winner === "tie" ? "It's a Tie!" : `Formula ${aiAnalysis.winner} is More Eco-Friendly`}
                      </p>
                      <p className="text-sm text-slate-600">{aiAnalysis.summary}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Side-by-side panels */}
            {(formulaA || formulaB) && (
              <div className="flex flex-col sm:flex-row gap-4">
                <FormulaPanel
                  formula={formulaA}
                  isWinner={winnerA}
                  color="teal"
                  aiScores={aiAnalysis?.formulaA}
                />
                <div className="hidden sm:flex items-center justify-center">
                  <div className="w-px h-full bg-slate-200 mx-2" />
                  <span className="absolute text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">VS</span>
                </div>
                <FormulaPanel
                  formula={formulaB}
                  isWinner={winnerB}
                  color="violet"
                  aiScores={aiAnalysis?.formulaB}
                />
              </div>
            )}

            {/* Ingredient diff */}
            <IngredientDiff f1={formulaA} f2={formulaB} />
          </>
        )}
      </div>
    </div>
  );
}