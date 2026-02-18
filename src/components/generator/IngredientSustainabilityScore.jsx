import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Leaf, Loader2, RefreshCw, Droplets, Factory, 
  Recycle, Globe, TreePine, ChevronRight
} from "lucide-react";

export default function IngredientSustainabilityScore({ ingredients }) {
  const [scores, setScores] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const analyzeSustainability = async () => {
    if (!ingredients || ingredients.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const ingredientList = ingredients.map(i => i.chemical_name).join(', ');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the sustainability of these cosmetic/cleaning product ingredients:

Ingredients: ${ingredientList}

For each ingredient, provide a sustainability assessment including:
1. Overall sustainability score (0-100)
2. Sourcing score (0-100) - Is it naturally derived, renewable, or synthetic?
3. Biodegradability score (0-100) - How easily does it break down in the environment?
4. Environmental impact score (0-100) - Water pollution, ecosystem effects, carbon footprint
5. Brief sourcing description (natural, synthetic, petroleum-derived, plant-derived, etc.)
6. Biodegradability category (readily, inherently, not biodegradable)
7. Key environmental concerns (if any)
8. Sustainable alternative suggestion (if score is below 60)

Also calculate an overall formula sustainability score.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_formula_score: { type: "number" },
            overall_assessment: { type: "string" },
            ingredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  overall_score: { type: "number" },
                  sourcing_score: { type: "number" },
                  biodegradability_score: { type: "number" },
                  environmental_score: { type: "number" },
                  sourcing_type: { type: "string" },
                  biodegradability_category: { type: "string" },
                  concerns: { type: "array", items: { type: "string" } },
                  sustainable_alternative: { type: "string" }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      setScores(response);
    } catch (error) {
      console.error("Sustainability analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getSourcingIcon = (type) => {
    if (type?.toLowerCase().includes('plant') || type?.toLowerCase().includes('natural')) {
      return <TreePine className="w-3 h-3 text-green-600" />;
    }
    if (type?.toLowerCase().includes('synthetic') || type?.toLowerCase().includes('petroleum')) {
      return <Factory className="w-3 h-3 text-slate-600" />;
    }
    return <Globe className="w-3 h-3 text-blue-600" />;
  };

  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-600" />
            Sustainability Analysis
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={analyzeSustainability}
            disabled={isAnalyzing}
            className="h-8"
          >
            {isAnalyzing ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            {scores ? 'Re-analyze' : 'Analyze'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-2" />
            <span className="text-sm text-slate-600">Analyzing sustainability...</span>
          </div>
        ) : scores ? (
          <>
            {/* Overall Formula Score */}
            <div className={`p-4 rounded-lg ${
              scores.overall_formula_score >= 80 ? 'bg-green-50 border border-green-200' :
              scores.overall_formula_score >= 60 ? 'bg-amber-50 border border-amber-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Formula Eco-Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(scores.overall_formula_score)}`}>
                  {scores.overall_formula_score}/100
                </span>
              </div>
              <Progress value={scores.overall_formula_score} className="h-2 mb-2" />
              <p className="text-xs text-slate-600">{scores.overall_assessment}</p>
            </div>

            {/* Individual Ingredients */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-600 uppercase">By Ingredient</h4>
              {scores.ingredients?.map((ing, idx) => (
                <motion.div
                  key={idx}
                  className="border border-slate-200 rounded-lg overflow-hidden bg-white"
                >
                  <button
                    className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    onClick={() => setSelectedIngredient(selectedIngredient === idx ? null : idx)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        ing.overall_score >= 80 ? 'bg-green-100' :
                        ing.overall_score >= 60 ? 'bg-amber-100' : 'bg-red-100'
                      }`}>
                        <span className={`text-sm font-bold ${getScoreColor(ing.overall_score)}`}>
                          {ing.overall_score}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">{ing.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {getSourcingIcon(ing.sourcing_type)}
                          <span className="capitalize">{ing.sourcing_type}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${
                      selectedIngredient === idx ? 'rotate-90' : ''
                    }`} />
                  </button>
                  
                  {selectedIngredient === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-slate-200 p-3 bg-slate-50 space-y-3"
                    >
                      {/* Score Breakdown */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-white rounded border">
                          <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                          <p className="text-xs text-slate-500">Sourcing</p>
                          <p className={`font-bold ${getScoreColor(ing.sourcing_score)}`}>
                            {ing.sourcing_score}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <Recycle className="w-4 h-4 mx-auto mb-1 text-green-500" />
                          <p className="text-xs text-slate-500">Biodegradable</p>
                          <p className={`font-bold ${getScoreColor(ing.biodegradability_score)}`}>
                            {ing.biodegradability_score}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <Globe className="w-4 h-4 mx-auto mb-1 text-teal-500" />
                          <p className="text-xs text-slate-500">Env. Impact</p>
                          <p className={`font-bold ${getScoreColor(ing.environmental_score)}`}>
                            {ing.environmental_score}
                          </p>
                        </div>
                      </div>

                      {/* Biodegradability */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {ing.biodegradability_category} biodegradable
                        </Badge>
                      </div>

                      {/* Concerns */}
                      {ing.concerns?.length > 0 && (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                          <p className="font-semibold text-amber-700 mb-1">Concerns:</p>
                          <ul className="list-disc list-inside text-amber-600">
                            {ing.concerns.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Alternative */}
                      {ing.sustainable_alternative && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <p className="font-semibold text-green-700 mb-1">Sustainable Alternative:</p>
                          <p className="text-green-600">{ing.sustainable_alternative}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Recommendations */}
            {scores.recommendations?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-600 uppercase">Recommendations</h4>
                {scores.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                    {rec}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-slate-500 text-sm">
            Click "Analyze" to assess ingredient sustainability.
          </div>
        )}
      </CardContent>
    </Card>
  );
}