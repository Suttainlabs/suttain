import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, CheckCircle, Loader2, RefreshCw, 
  Zap, ShieldAlert, Info, ChevronDown, ChevronUp
} from "lucide-react";

export default function IngredientInteractionAnalyzer({ ingredients, productType }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedInteraction, setExpandedInteraction] = useState(null);

  const analyzeInteractions = async () => {
    if (!ingredients || ingredients.length < 2) return;
    
    setIsAnalyzing(true);
    try {
      const ingredientList = ingredients.map(i => `${i.chemical_name} (${i.percentage}%)`).join(', ');
      
      const response = await base44.functions.invoke('runConsumerLLM', {
        operation: 'ingredientInteractions',
        data: { ingredients, productType }
      });
      
      setAnalysis(response);
    } catch (error) {
      console.error("Interaction analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getInteractionColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'beneficial': return 'bg-green-100 text-green-700 border-green-200';
      case 'neutral': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'problematic': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'dangerous': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getSeverityIcon = (severity) => {
    if (severity >= 4) return <ShieldAlert className="w-4 h-4 text-red-500" />;
    if (severity >= 3) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (severity >= 2) return <Info className="w-4 h-4 text-blue-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  if (!ingredients || ingredients.length < 2) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-4 text-center text-slate-500">
          <Zap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">Add at least 2 ingredients to analyze interactions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            Ingredient Interactions
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={analyzeInteractions}
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
            <Loader2 className="w-6 h-6 animate-spin text-amber-600 mr-2" />
            <span className="text-sm text-slate-600">Analyzing ingredient interactions...</span>
          </div>
        ) : analysis ? (
          <>
            {/* Overall Score */}
            <div className={`p-4 rounded-lg ${
              analysis.overall_score >= 80 ? 'bg-green-50 border border-green-200' :
              analysis.overall_score >= 60 ? 'bg-amber-50 border border-amber-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Compatibility Score</span>
                <span className={`text-2xl font-bold ${
                  analysis.overall_score >= 80 ? 'text-green-600' :
                  analysis.overall_score >= 60 ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {analysis.overall_score}/100
                </span>
              </div>
              <p className="text-xs text-slate-600">{analysis.overall_assessment}</p>
            </div>

            {/* Warnings */}
            {analysis.warnings?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-red-600 uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Warnings
                </h4>
                {analysis.warnings.map((warning, idx) => (
                  <div key={idx} className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    {warning}
                  </div>
                ))}
              </div>
            )}

            {/* Positive Synergies */}
            {analysis.positive_synergies?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-green-600 uppercase flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Positive Synergies
                </h4>
                {analysis.positive_synergies.map((synergy, idx) => (
                  <div key={idx} className="p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                    {synergy}
                  </div>
                ))}
              </div>
            )}

            {/* Detailed Interactions */}
            {analysis.interactions?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-600 uppercase">Detailed Interactions</h4>
                {analysis.interactions.map((interaction, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg overflow-hidden ${getInteractionColor(interaction.interaction_type)}`}
                  >
                    <button
                      className="w-full p-3 flex items-center justify-between text-left"
                      onClick={() => setExpandedInteraction(expandedInteraction === idx ? null : idx)}
                    >
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(interaction.severity)}
                        <span className="text-sm font-medium">
                          {interaction.ingredients_involved?.join(' + ')}
                        </span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {interaction.interaction_type}
                        </Badge>
                      </div>
                      {expandedInteraction === idx ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedInteraction === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t"
                        >
                          <div className="p-3 bg-white/50 space-y-2">
                            <p className="text-xs">{interaction.explanation}</p>
                            {interaction.recommendation && (
                              <div className="p-2 bg-white rounded border text-xs">
                                <span className="font-semibold">Recommendation:</span> {interaction.recommendation}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-slate-500 text-sm">
            Click "Analyze" to check for potential ingredient interactions.
          </div>
        )}
      </CardContent>
    </Card>
  );
}