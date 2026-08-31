import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Plus, Loader2, ChevronDown, ChevronUp,
  Lightbulb, Shield, DollarSign, Beaker, AlertTriangle,
  Leaf, RefreshCw, Check, Droplets
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDebounce } from "../shared/useDebounce";

export default function AISuggestionsPanel({ 
  formula, 
  productType, 
  businessMode,
  onAddIngredient,
  onApplyFormulation 
}) {
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState('complementary');
  const [lastAnalyzedIngredients, setLastAnalyzedIngredients] = useState('');
  
  // Debounce the ingredient list to avoid too many API calls
  const ingredientList = formula?.ingredients?.map(i => i.chemical_name).filter(Boolean).join(', ') || '';
  const debouncedIngredients = useDebounce(ingredientList, 1500);

  const modeColors = businessMode 
    ? {
        gradient: 'from-violet-500 to-purple-500',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        text: 'text-violet-700',
        badgeBg: 'bg-violet-100',
        badgeText: 'text-violet-800'
      }
    : {
        gradient: 'from-teal-500 to-cyan-500',
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        text: 'text-teal-700',
        badgeBg: 'bg-teal-100',
        badgeText: 'text-teal-800'
      };

  const fetchSuggestions = useCallback(async () => {
    if (!formula?.ingredients || formula.ingredients.length < 1) {
      setSuggestions(null);
      return;
    }

    const currentIngredients = formula.ingredients.map(i => i.chemical_name).filter(Boolean).join(', ');
    
    // Don't re-fetch if ingredients haven't changed
    if (currentIngredients === lastAnalyzedIngredients) return;
    
    setIsLoading(true);
    setLastAnalyzedIngredients(currentIngredients);

    try {
      const ingredientDetails = formula.ingredients.map(i => 
        `${i.chemical_name} (${i.percentage}%, ${i.purpose || 'general'})`
      ).join(', ');

      const prompt = `You are an expert cosmetic/product chemist. Analyze this ${productType || 'product'} formula and provide intelligent suggestions.

Current Ingredients: ${ingredientDetails}
Product Type: ${productType || 'General product'}
Context: ${businessMode ? 'Commercial/B2B production' : 'DIY/Home formulation'}

Provide comprehensive suggestions in JSON format:
1. complementary_ingredients: 3-5 ingredients that would enhance this formula (name, purpose, suggested_percentage, why_add, safety_notes)
2. potential_formulations: 2-3 complete formula variations based on current ingredients (name, description, key_changes, benefits)
3. safety_considerations: Important safety notes for current ingredient combinations
4. improvement_tips: 3-4 specific tips to improve safety, efficacy, or cost-effectiveness
5. synergy_notes: How current ingredients work together and any potential issues`;

      const response = await base44.functions.invoke('runConsumerLLM', {
        operation: 'aiSuggestions',
        data: { ingredients: formula.ingredients, productType, businessMode }
      });

      setSuggestions(response);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions(null);
    } finally {
      setIsLoading(false);
    }
  }, [formula, productType, businessMode, lastAnalyzedIngredients]);

  // Auto-fetch when ingredients change (debounced)
  useEffect(() => {
    if (debouncedIngredients && debouncedIngredients.length > 0) {
      fetchSuggestions();
    }
  }, [debouncedIngredients]);

  const handleAddIngredient = (ingredient) => {
    if (onAddIngredient) {
      onAddIngredient({
        chemical_name: ingredient.name,
        percentage: ingredient.suggested_percentage || 2,
        purpose: ingredient.purpose
      });
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!formula?.ingredients || formula.ingredients.length === 0) {
    return (
      <Card className={`${modeColors.bg} ${modeColors.border} border`}>
        <CardContent className="p-6 text-center">
          <Sparkles className={`w-8 h-8 ${modeColors.text} mx-auto mb-3 opacity-50`} />
          <p className="text-sm text-slate-600">
            Add ingredients to get intelligent suggestions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${modeColors.bg} ${modeColors.border} border overflow-hidden`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className={`w-8 h-8 bg-gradient-to-br ${modeColors.gradient} rounded-lg flex items-center justify-center`}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Smart Suggestions
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchSuggestions}
            disabled={isLoading}
            className="h-8 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400 mr-2" />
            <span className="text-sm text-slate-600">Analyzing formula...</span>
          </div>
        )}

        {!isLoading && suggestions && (
          <>
            {/* Complementary Ingredients */}
            {suggestions.complementary_ingredients?.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleSection('complementary')}
                  className="w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Complementary Ingredients</span>
                    <Badge className={`${modeColors.badgeBg} ${modeColors.badgeText} text-[10px]`}>
                      {suggestions.complementary_ingredients.length}
                    </Badge>
                  </div>
                  {expandedSection === 'complementary' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedSection === 'complementary' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100"
                    >
                      <div className="p-3 space-y-2">
                        {suggestions.complementary_ingredients.map((ing, idx) => (
                          <div key={idx} className="p-2 bg-slate-50 rounded-lg">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm text-slate-900">{ing.name}</span>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {ing.suggested_percentage}%
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-1">{ing.purpose}</p>
                                <p className="text-[10px] text-emerald-700 mt-1">
                                  <Lightbulb className="w-3 h-3 inline mr-1" />
                                  {ing.why_add}
                                </p>
                                {ing.safety_notes && (
                                  <p className="text-[10px] text-amber-700 mt-1">
                                    <Shield className="w-3 h-3 inline mr-1" />
                                    {ing.safety_notes}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAddIngredient(ing)}
                                className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 flex-shrink-0"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Safety Considerations */}
            {suggestions.safety_considerations?.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleSection('safety')}
                  className="w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Safety Considerations</span>
                  </div>
                  {expandedSection === 'safety' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedSection === 'safety' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100"
                    >
                      <div className="p-3">
                        <ul className="space-y-2">
                          {suggestions.safety_considerations.map((note, idx) => (
                            <li key={idx} className="text-xs text-amber-800 flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                              <Shield className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Improvement Tips */}
            {suggestions.improvement_tips?.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleSection('tips')}
                  className="w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Improvement Tips</span>
                  </div>
                  {expandedSection === 'tips' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedSection === 'tips' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100"
                    >
                      <div className="p-3 space-y-2">
                        {suggestions.improvement_tips.map((tip, idx) => (
                          <div key={idx} className="p-2 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                {tip.category === 'cost' && <DollarSign className="w-2.5 h-2.5 mr-0.5" />}
                                {tip.category === 'safety' && <Shield className="w-2.5 h-2.5 mr-0.5" />}
                                {tip.category === 'efficacy' && <Beaker className="w-2.5 h-2.5 mr-0.5" />}
                                {tip.category === 'sustainability' && <Leaf className="w-2.5 h-2.5 mr-0.5" />}
                                {tip.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-700">{tip.tip}</p>
                            {tip.impact && (
                              <p className="text-[10px] text-blue-700 mt-1">
                                <Check className="w-3 h-3 inline mr-1" />
                                Impact: {tip.impact}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Potential Formulations */}
            {suggestions.potential_formulations?.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleSection('formulations')}
                  className="w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 bg-gradient-to-br ${modeColors.gradient} rounded-lg flex items-center justify-center`}>
                      <Beaker className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Formula Variations</span>
                    <Badge className={`${modeColors.badgeBg} ${modeColors.badgeText} text-[10px]`}>
                      {suggestions.potential_formulations.length}
                    </Badge>
                  </div>
                  {expandedSection === 'formulations' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedSection === 'formulations' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100"
                    >
                      <div className="p-3 space-y-3">
                        {suggestions.potential_formulations.map((form, idx) => (
                          <div key={idx} className={`p-3 ${modeColors.bg} rounded-lg border ${modeColors.border}`}>
                            <h4 className="font-medium text-sm text-slate-900 mb-1">{form.name}</h4>
                            <p className="text-[11px] text-slate-600 mb-2">{form.description}</p>
                            
                            {form.key_changes?.length > 0 && (
                              <div className="mb-2">
                                <p className="text-[10px] font-medium text-slate-700 mb-1">Key Changes:</p>
                                <ul className="space-y-0.5">
                                  {form.key_changes.map((change, i) => (
                                    <li key={i} className="text-[10px] text-slate-600 flex items-start gap-1">
                                      <span className={modeColors.text}>•</span>
                                      <span>{change}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {form.benefits?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {form.benefits.map((benefit, i) => (
                                  <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0">
                                    ✓ {benefit}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Synergy Notes */}
            {suggestions.synergy_notes && (
              <div className="p-3 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200">
                <div className="flex items-start gap-2">
                  <Droplets className={`w-4 h-4 ${modeColors.text} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-1">Ingredient Synergy</p>
                    <p className="text-[11px] text-slate-600">{suggestions.synergy_notes}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!isLoading && !suggestions && formula?.ingredients?.length > 0 && (
          <div className="text-center py-4">
            <Button 
              onClick={fetchSuggestions}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Get Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}