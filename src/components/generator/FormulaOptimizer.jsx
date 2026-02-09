import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, Check, X, DollarSign, Shield, 
  Leaf, Droplets, Clock, Zap, ChevronRight, AlertCircle
} from "lucide-react";
import { InvokeLLM } from "@/integrations/Core";

const OPTIMIZATION_TARGETS = [
  { id: 'cost', label: 'Reduce Cost', icon: DollarSign, description: 'Find cheaper ingredient alternatives' },
  { id: 'stability', label: 'Improve Stability', icon: Shield, description: 'Enhance shelf life & formula stability' },
  { id: 'sustainability', label: 'Eco-Friendly', icon: Leaf, description: 'Use more sustainable ingredients' },
  { id: 'mildness', label: 'Increase Mildness', icon: Droplets, description: 'Make formula gentler on skin' },
  { id: 'efficacy', label: 'Boost Efficacy', icon: Zap, description: 'Improve performance & results' },
  { id: 'shelf_life', label: 'Extend Shelf Life', icon: Clock, description: 'Longer preservation period' },
];

export default function FormulaOptimizer({ formula, onApplyOptimization, businessMode }) {
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isOneClick, setIsOneClick] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);

  const modeColors = businessMode 
    ? { primary: 'violet', gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' }
    : { primary: 'teal', gradient: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' };

  const toggleTarget = (targetId) => {
    setSelectedTargets(prev => 
      prev.includes(targetId) 
        ? prev.filter(t => t !== targetId)
        : [...prev, targetId]
    );
    setSuggestions(null);
  };

  const runOptimization = async (autoApply = false) => {
    if (selectedTargets.length === 0) return;
    
    if (autoApply) {
      setIsOneClick(true);
    } else {
      setIsReviewing(true);
    }
    setError(null);
    setSuggestions(null);

    const targetDescriptions = selectedTargets.map(t => 
      OPTIMIZATION_TARGETS.find(opt => opt.id === t)?.label
    ).join(', ');

    const prompt = `You are an expert cosmetic chemist. Analyze this formula and suggest optimizations for: ${targetDescriptions}.

Current Formula: "${formula.name}"
Ingredients:
${formula.ingredients.map(i => `- ${i.chemical_name}: ${i.percentage}% (${i.purpose})`).join('\n')}

Provide specific, actionable modifications. For each change, explain the benefit.
Return JSON with suggested changes.`;

    try {
      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string", description: "Brief summary of optimization approach" },
            changes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["replace", "adjust", "add", "remove"] },
                  original_ingredient: { type: "string" },
                  new_ingredient: { type: "string" },
                  original_percentage: { type: "number" },
                  new_percentage: { type: "number" },
                  reason: { type: "string" },
                  benefit: { type: "string" }
                }
              }
            },
            expected_improvements: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["summary", "changes", "expected_improvements"]
        }
      });

      if (response && response.changes) {
        if (autoApply) {
          applyAllChanges(response.changes);
          setSuggestions(null);
        } else {
          setSuggestions(response);
        }
      }
    } catch (err) {
      console.error("Optimization failed:", err);
      setError("Failed to generate optimizations. Please try again.");
    } finally {
      setIsReviewing(false);
      setIsOneClick(false);
    }
  };

  const applyAllChanges = (changes) => {
    let newIngredients = [...formula.ingredients];

    changes.forEach(change => {
      if (change.type === 'replace') {
        const idx = newIngredients.findIndex(i => 
          i.chemical_name.toLowerCase() === change.original_ingredient?.toLowerCase()
        );
        if (idx !== -1) {
          newIngredients[idx] = {
            ...newIngredients[idx],
            chemical_name: change.new_ingredient || newIngredients[idx].chemical_name,
            percentage: change.new_percentage ?? newIngredients[idx].percentage
          };
        }
      } else if (change.type === 'adjust') {
        const idx = newIngredients.findIndex(i => 
          i.chemical_name.toLowerCase() === change.original_ingredient?.toLowerCase()
        );
        if (idx !== -1) {
          newIngredients[idx] = {
            ...newIngredients[idx],
            percentage: change.new_percentage ?? newIngredients[idx].percentage
          };
        }
      } else if (change.type === 'add' && change.new_ingredient) {
        newIngredients.push({
          chemical_name: change.new_ingredient,
          percentage: change.new_percentage || 1,
          purpose: change.reason || "Added via optimization"
        });
      } else if (change.type === 'remove') {
        newIngredients = newIngredients.filter(i => 
          i.chemical_name.toLowerCase() !== change.original_ingredient?.toLowerCase()
        );
      }
    });

    onApplyOptimization(newIngredients);
    setSuggestions(null);
    setSelectedTargets([]);
  };

  const applySingleChange = (change, index) => {
    let newIngredients = [...formula.ingredients];

    if (change.type === 'replace') {
      const idx = newIngredients.findIndex(i => 
        i.chemical_name.toLowerCase() === change.original_ingredient?.toLowerCase()
      );
      if (idx !== -1) {
        newIngredients[idx] = {
          ...newIngredients[idx],
          chemical_name: change.new_ingredient || newIngredients[idx].chemical_name,
          percentage: change.new_percentage ?? newIngredients[idx].percentage
        };
      }
    } else if (change.type === 'adjust') {
      const idx = newIngredients.findIndex(i => 
        i.chemical_name.toLowerCase() === change.original_ingredient?.toLowerCase()
      );
      if (idx !== -1) {
        newIngredients[idx] = {
          ...newIngredients[idx],
          percentage: change.new_percentage ?? newIngredients[idx].percentage
        };
      }
    } else if (change.type === 'add' && change.new_ingredient) {
      newIngredients.push({
        chemical_name: change.new_ingredient,
        percentage: change.new_percentage || 1,
        purpose: change.reason || "Added via optimization"
      });
    } else if (change.type === 'remove') {
      newIngredients = newIngredients.filter(i => 
        i.chemical_name.toLowerCase() !== change.original_ingredient?.toLowerCase()
      );
    }

    onApplyOptimization(newIngredients);
    
    // Remove applied change from suggestions
    setSuggestions(prev => ({
      ...prev,
      changes: prev.changes.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card className={`${modeColors.bg} ${modeColors.border} border`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${modeColors.text}`} />
          Formula Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Target Selection */}
        <div className="space-y-2">
          <p className="text-xs text-slate-600 font-medium">Select optimization goals:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {OPTIMIZATION_TARGETS.map(target => (
              <div
                key={target.id}
                onClick={() => toggleTarget(target.id)}
                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                  selectedTargets.includes(target.id)
                    ? `${modeColors.border} ${modeColors.bg} border-2`
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Checkbox 
                    checked={selectedTargets.includes(target.id)} 
                    className="pointer-events-none h-3.5 w-3.5 sm:h-4 sm:w-4"
                  />
                  <target.icon className={`w-3 h-3 flex-shrink-0 ${selectedTargets.includes(target.id) ? modeColors.text : 'text-slate-500'}`} />
                  <span className="text-[10px] sm:text-xs font-medium leading-tight">{target.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {selectedTargets.length > 0 && !suggestions && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => runOptimization(false)}
              disabled={isReviewing || isOneClick}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              {isReviewing ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1" />
              )}
              Review Suggestions
            </Button>
            <Button
              onClick={() => runOptimization(true)}
              disabled={isReviewing || isOneClick}
              size="sm"
              className={`flex-1 text-xs bg-gradient-to-r ${modeColors.gradient} text-white`}
            >
              {isOneClick ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Zap className="w-3 h-3 mr-1" />
              )}
              One-Click Optimize
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error}
            </p>
          </div>
        )}

        {/* Suggestions Display */}
        <AnimatePresence>
          {suggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-700">{suggestions.summary}</p>
              </div>

              {suggestions.changes?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700">Suggested Changes:</p>
                  {suggestions.changes.map((change, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              {change.type}
                            </Badge>
                            {change.type === 'replace' && (
                              <span className="text-xs">
                                <span className="line-through text-slate-400">{change.original_ingredient}</span>
                                {' → '}
                                <span className="font-medium text-slate-900">{change.new_ingredient}</span>
                              </span>
                            )}
                            {change.type === 'adjust' && (
                              <span className="text-xs">
                                {change.original_ingredient}: {change.original_percentage}% → {change.new_percentage}%
                              </span>
                            )}
                            {change.type === 'add' && (
                              <span className="text-xs font-medium text-green-700">+ {change.new_ingredient} ({change.new_percentage}%)</span>
                            )}
                            {change.type === 'remove' && (
                              <span className="text-xs font-medium text-red-700">- {change.original_ingredient}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500">{change.benefit}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => applySingleChange(change, idx)}
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {suggestions.expected_improvements?.length > 0 && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-[10px] font-medium text-emerald-800 mb-1">Expected Improvements:</p>
                  <ul className="text-[10px] text-emerald-700 space-y-0.5">
                    {suggestions.expected_improvements.map((imp, i) => (
                      <li key={i}>• {imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => applyAllChanges(suggestions.changes)}
                  size="sm"
                  className={`flex-1 bg-gradient-to-r ${modeColors.gradient} text-white`}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Apply All
                </Button>
                <Button
                  onClick={() => setSuggestions(null)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-3 h-3 mr-1" />
                  Dismiss
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}