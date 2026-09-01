import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, Shield, Loader2, RefreshCw, 
  ArrowRight, CheckCircle, Info, Sparkles
} from "lucide-react";

export default function HazardAlternativesPanel({ ingredients, onReplaceIngredient }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState(null);

  // Auto-analyze when ingredients change significantly
  useEffect(() => {
    if (ingredients?.length > 0 && !analysis) {
      // Don't auto-analyze, wait for user action
    }
  }, [ingredients]);

  const analyzeHazards = async () => {
    if (!ingredients || ingredients.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const ingredientList = ingredients.map(i => `${i.chemical_name} (${i.percentage}%)`).join(', ');
      
      const response = await base44.functions.invoke('runConsumerLLM', {
        operation: 'hazardAlternatives',
        data: { ingredients }
      });
      
      setAnalysis(response?.data ?? response);
    } catch (error) {
      console.error("Hazard analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReplace = (originalName, alternative) => {
    const ingredientIndex = ingredients.findIndex(i => 
      i.chemical_name.toLowerCase() === originalName.toLowerCase()
    );
    
    if (ingredientIndex !== -1) {
      setReplacingIndex(ingredientIndex);
      setTimeout(() => {
        onReplaceIngredient(ingredientIndex, {
          chemical_name: alternative.name,
          purpose: ingredients[ingredientIndex].purpose,
          percentage: ingredients[ingredientIndex].percentage
        });
        setReplacingIndex(null);
        // Re-analyze after replacement
        setAnalysis(null);
      }, 500);
    }
  };

  const getHazardColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'safe': return 'bg-green-100 text-green-700 border-green-200';
      case 'low_concern': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'moderate_concern': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'high_concern': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getHazardIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'safe': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'low_concern': return <Info className="w-4 h-4 text-blue-500" />;
      case 'moderate_concern': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'high_concern': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Shield className="w-4 h-4 text-slate-500" />;
    }
  };

  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  const flaggedIngredients = analysis?.ingredients?.filter(i => 
    i.hazard_level !== 'safe' && i.alternatives?.length > 0
  ) || [];

  return (
    <Card className="border-rose-200 bg-gradient-to-br from-rose-50/50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-600" />
            Hazard Analysis & Alternatives
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={analyzeHazards}
            disabled={isAnalyzing}
            className="h-8"
          >
            {isAnalyzing ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            {analysis ? 'Re-analyze' : 'Analyze'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-rose-600 mr-2" />
            <span className="text-sm text-slate-600">Analyzing ingredient safety...</span>
          </div>
        ) : analysis ? (
          <>
            {/* Summary */}
            <div className={`p-4 rounded-lg ${
              analysis.flagged_count === 0 ? 'bg-green-50 border border-green-200' :
              analysis.flagged_count <= 2 ? 'bg-amber-50 border border-amber-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Safety Assessment</span>
                <Badge variant="outline" className={
                  analysis.flagged_count === 0 ? 'text-green-700' :
                  analysis.flagged_count <= 2 ? 'text-amber-700' : 'text-red-700'
                }>
                  {analysis.flagged_count} flagged
                </Badge>
              </div>
              <p className="text-xs text-slate-600">{analysis.overall_safety}</p>
            </div>

            {/* Flagged Ingredients with Alternatives */}
            {flaggedIngredients.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-600 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Safer Alternatives Available
                </h4>
                
                {flaggedIngredients.map((ing, idx) => (
                  <motion.div
                    key={idx}
                    className="border border-slate-200 rounded-lg overflow-hidden bg-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {/* Original Ingredient */}
                    <div className="p-3 bg-slate-50 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getHazardIcon(ing.hazard_level)}
                          <span className="font-medium text-sm">{ing.name}</span>
                          <Badge className={`text-[10px] ${getHazardColor(ing.hazard_level)}`}>
                            {ing.hazard_level?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      {ing.hazard_types?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {ing.hazard_types.map((type, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] text-slate-500">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {ing.regulatory_notes && (
                        <p className="text-xs text-slate-500 mt-2 italic">{ing.regulatory_notes}</p>
                      )}
                    </div>

                    {/* Alternatives */}
                    <div className="p-3 space-y-2">
                      <p className="text-xs text-slate-500 font-medium">Recommended Alternatives:</p>
                      {ing.alternatives?.map((alt, altIdx) => (
                        <div 
                          key={altIdx} 
                          className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3 text-green-600 flex-shrink-0" />
                              <span className="font-medium text-sm text-green-800">{alt.name}</span>
                              <Badge className="bg-green-100 text-green-700 text-[10px]">
                                {alt.effectiveness}% effective
                              </Badge>
                            </div>
                            <p className="text-xs text-green-600 mt-1 ml-5">{alt.reason}</p>
                            {alt.tradeoffs && (
                              <p className="text-[10px] text-slate-500 mt-1 ml-5 italic">
                                Tradeoff: {alt.tradeoffs}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleReplace(ing.name, alt)}
                            disabled={replacingIndex !== null}
                            className="ml-2 bg-green-600 hover:bg-green-700 h-7 text-xs"
                          >
                            {replacingIndex !== null ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Replace'
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-green-700 font-medium">All ingredients appear safe!</p>
                <p className="text-xs text-slate-500">No concerning ingredients found in your formula.</p>
              </div>
            )}

            {/* Safe Ingredients List */}
            {analysis.ingredients?.filter(i => i.hazard_level === 'safe').length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-slate-500 mb-2">Safe ingredients:</p>
                <div className="flex flex-wrap gap-1">
                  {analysis.ingredients
                    .filter(i => i.hazard_level === 'safe')
                    .map((ing, idx) => (
                      <Badge key={idx} className="bg-green-50 text-green-700 text-[10px]">
                        <CheckCircle className="w-2 h-2 mr-1" />
                        {ing.name}
                      </Badge>
                    ))
                  }
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-slate-500 text-sm">
            Click "Analyze" to check for hazardous ingredients and get safer alternatives.
          </div>
        )}
      </CardContent>
    </Card>
  );
}