import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Leaf, DollarSign, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Cost per % of ingredient (rough $/unit heuristics)
const INGREDIENT_COST_MAP = {
  // Cheap base ingredients
  water: 0.001, aqua: 0.001, glycerin: 0.04, 'sodium chloride': 0.01,
  // Mid-range
  'aloe vera': 0.08, 'coconut oil': 0.06, 'jojoba oil': 0.15, 'vitamin e': 0.12,
  'citric acid': 0.03, 'sodium hydroxide': 0.02, 'potassium hydroxide': 0.02,
  // Premium naturals
  'argan oil': 0.35, 'rosehip oil': 0.40, 'hyaluronic acid': 0.50,
  'niacinamide': 0.25, 'retinol': 0.80, 'peptides': 0.90,
  // Synthetics (cheap but eco-penalty)
  'sodium lauryl sulfate': 0.025, 'sodium laureth sulfate': 0.025,
  'parabens': 0.02, 'dimethicone': 0.05, 'petrolatum': 0.015,
  // Default fallback
  _default: 0.05,
};

const ECO_SCORE_MAP = {
  water: 95, aqua: 95, glycerin: 72, 'aloe vera': 88, 'coconut oil': 82,
  'jojoba oil': 85, 'vitamin e': 78, 'citric acid': 70, 'argan oil': 80,
  'rosehip oil': 86, 'hyaluronic acid': 65, 'niacinamide': 60,
  'sodium lauryl sulfate': 30, 'sodium laureth sulfate': 28,
  'parabens': 15, 'dimethicone': 25, 'petrolatum': 10,
  'sodium chloride': 75, 'potassium hydroxide': 55, 'sodium hydroxide': 50,
  _default: 50,
};

function getIngredientCost(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, val] of Object.entries(INGREDIENT_COST_MAP)) {
    if (key !== '_default' && lower.includes(key)) return val;
  }
  return INGREDIENT_COST_MAP._default;
}

function getIngredientEco(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, val] of Object.entries(ECO_SCORE_MAP)) {
    if (key !== '_default' && lower.includes(key)) return val;
  }
  return ECO_SCORE_MAP._default;
}

function ScoreGauge({ value, label, color }) {
  const clamp = Math.max(0, Math.min(100, value));
  const getColor = () => {
    if (clamp >= 70) return 'text-green-600';
    if (clamp >= 45) return 'text-amber-600';
    return 'text-red-600';
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-3xl font-black ${getColor()}`}>{Math.round(clamp)}</div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
        <motion.div
          className={`h-2 rounded-full ${clamp >= 70 ? 'bg-green-500' : clamp >= 45 ? 'bg-amber-500' : 'bg-red-500'}`}
          animate={{ width: `${clamp}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

export default function SimulationEngine() {
  const [selectedFormulaId, setSelectedFormulaId] = useState('');
  const [adjustedPercentages, setAdjustedPercentages] = useState({});

  const { data: formulas = [], isLoading } = useQuery({
    queryKey: ['formulas-sim-engine'],
    queryFn: () => base44.entities.Formula.list('-created_date', 50),
  });

  const selectedFormula = useMemo(() => formulas.find(f => f.id === selectedFormulaId), [formulas, selectedFormulaId]);

  const ingredients = useMemo(() => {
    if (!selectedFormula?.ingredients?.length) return [];
    return selectedFormula.ingredients.map(ing => ({
      ...ing,
      percentage: Number(ing.percentage) || 5,
    }));
  }, [selectedFormula]);

  const handleFormulaChange = useCallback((id) => {
    setSelectedFormulaId(id);
    setAdjustedPercentages({});
  }, []);

  const handleSlider = (name, value) => {
    setAdjustedPercentages(prev => ({ ...prev, [name]: Number(value) }));
  };

  const effectiveIngredients = useMemo(() => {
    return ingredients.map(ing => ({
      ...ing,
      effectivePct: adjustedPercentages[ing.chemical_name] ?? ing.percentage,
    }));
  }, [ingredients, adjustedPercentages]);

  const totalPct = useMemo(() => effectiveIngredients.reduce((s, i) => s + i.effectivePct, 0), [effectiveIngredients]);

  const metrics = useMemo(() => {
    if (!effectiveIngredients.length) return { cost: 0, eco: 0 };
    const totalCost = effectiveIngredients.reduce((s, i) => s + getIngredientCost(i.chemical_name) * i.effectivePct, 0);
    const weightedEco = effectiveIngredients.reduce((s, i) => s + getIngredientEco(i.chemical_name) * i.effectivePct, 0);
    const eco = totalPct > 0 ? weightedEco / totalPct : 0;
    return { cost: totalCost, eco: Math.round(eco) };
  }, [effectiveIngredients, totalPct]);

  const isOver100 = totalPct > 100.5;
  const isUnder100 = totalPct < 99.5 && effectiveIngredients.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
          <Leaf className="w-4 h-4" /> Formula Simulation Engine
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Live Formula Simulator</h1>
        <p className="text-slate-500 mt-1 max-w-lg mx-auto text-sm">Adjust ingredient percentages and instantly see how cost and sustainability shift.</p>
      </div>

      {/* Formula Selector */}
      <Card>
        <CardContent className="p-5">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Select a Formula</label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
          ) : (
            <Select value={selectedFormulaId} onValueChange={handleFormulaChange}>
              <SelectTrigger className="max-w-md w-full">
                <SelectValue placeholder="Choose a formula to simulate…" />
              </SelectTrigger>
              <SelectContent>
                {formulas.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name}: {f.product_type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!isLoading && formulas.length === 0 && (
            <p className="text-sm text-slate-400 mt-2">No formulas found. Create one in the Formula Generator first.</p>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {selectedFormula && ingredients.length > 0 && (
          <motion.div key={selectedFormulaId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Live Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="col-span-1">
                <CardContent className="p-5 flex flex-col items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <div className="text-2xl font-black text-emerald-700">${metrics.cost.toFixed(2)}</div>
                  <div className="text-xs text-slate-500 font-medium text-center">Est. Cost / 100g Batch</div>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardContent className="p-5">
                  <ScoreGauge value={metrics.eco} label="Eco Score" />
                </CardContent>
              </Card>
              <Card className={`col-span-2 md:col-span-1 ${isOver100 ? 'border-red-300 bg-red-50' : isUnder100 ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'}`}>
                <CardContent className="p-5 flex flex-col items-center justify-center gap-2">
                  {isOver100 ? <AlertTriangle className="w-5 h-5 text-red-500" /> : isUnder100 ? <Info className="w-5 h-5 text-amber-500" /> : <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  <div className={`text-2xl font-black ${isOver100 ? 'text-red-600' : isUnder100 ? 'text-amber-600' : 'text-green-600'}`}>{totalPct.toFixed(1)}%</div>
                  <div className="text-xs font-medium text-center text-slate-600">
                    {isOver100 ? 'Over 100%, reduce amounts' : isUnder100 ? 'Under 100% : balance needed' : 'Total Balance ✓'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ingredient Sliders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Adjust Ingredient Percentages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {effectiveIngredients.map((ing) => {
                  const eco = getIngredientEco(ing.chemical_name);
                  const ecoColor = eco >= 70 ? 'text-green-600' : eco >= 45 ? 'text-amber-500' : 'text-red-500';
                  const changed = adjustedPercentages[ing.chemical_name] !== undefined && adjustedPercentages[ing.chemical_name] !== ing.percentage;
                  return (
                    <div key={ing.chemical_name} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-sm text-slate-800 truncate">{ing.chemical_name}</span>
                          {ing.purpose && <Badge className="bg-slate-100 text-slate-500 text-[10px] font-medium hidden sm:inline-flex">{ing.purpose}</Badge>}
                          {changed && <Badge className="bg-violet-100 text-violet-700 text-[10px]">modified</Badge>}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs font-bold ${ecoColor}`}>Eco {eco}</span>
                          <span className="font-mono font-bold text-slate-900 w-12 text-right">{(adjustedPercentages[ing.chemical_name] ?? ing.percentage).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={0.5}
                          value={adjustedPercentages[ing.chemical_name] ?? ing.percentage}
                          onChange={e => handleSlider(ing.chemical_name, e.target.value)}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-600"
                          style={{ background: `linear-gradient(to right, #9531F5 0%, #9531F5 ${adjustedPercentages[ing.chemical_name] ?? ing.percentage}%, #e2e8f0 ${adjustedPercentages[ing.chemical_name] ?? ing.percentage}%, #e2e8f0 100%)` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>0%</span>
                        <span className="text-slate-400">Original: {ing.percentage}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  );
                })}

                {Object.keys(adjustedPercentages).length > 0 && (
                  <button
                    onClick={() => setAdjustedPercentages({})}
                    className="text-xs text-violet-600 font-semibold hover:underline mt-2"
                  >
                    Reset all to original
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}