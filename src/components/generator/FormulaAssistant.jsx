import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// This import is not used in the updated code but was in original, keeping for completeness
// This import is not used in the updated code but was in original, keeping for completeness
import { 
  Sparkles, Droplets, Beaker, AlertTriangle, 
  Lightbulb, ChevronDown, Loader2, Info, Shield, Zap
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function FormulaAssistant({ formula, productType, businessMode }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null); // Changed to a single expanded section

  const modeColors = businessMode 
    ? {
        primaryBg: 'bg-violet-500',
        primaryText: 'text-violet-600',
        primaryBorder: 'border-violet-200',
        primaryGradient: 'from-violet-500 to-purple-500'
      }
    : {
        primaryBg: 'bg-teal-500',
        primaryText: 'text-teal-600',
        primaryBorder: 'border-teal-200',
        primaryGradient: 'from-teal-500 to-cyan-500'
      };

  useEffect(() => {
    // Only attempt to analyze if a valid formula with ingredients is provided
    if (formula && formula.ingredients && formula.ingredients.length > 0) {
      analyzeFormula();
    } else {
      // Clear previous analysis if formula becomes invalid or empty
      setAnalysis(null);
      setIsAnalyzing(false); // Ensure analyzing state is false if no formula
    }
  }, [formula, productType, businessMode]); // Added productType and businessMode to dependencies

  const analyzeFormula = async () => {
    setIsAnalyzing(true);
    setAnalysis(null); // Clear previous analysis when starting a new one
    setExpandedSection(null); // Collapse all sections on new analysis
    try {
      const ingredientList = formula.ingredients.map(ing => 
        `${ing.chemical_name} (${ing.percentage}%)`
      ).join(', ');

      // Updated prompt to match new schema keys
      const prompt = `Analyze this ${productType} formula and provide comprehensive insights for a ${businessMode ? 'commercial B2B' : 'DIY home formulation'} context:

Ingredients: ${ingredientList}

Please analyze and return JSON with:
1. properties: { ph_level: string, viscosity: string, stability: string }
2. warnings: array of critical safety issues, incompatibilities, or missing essential components
3. suggestions: array of 3-4 actionable improvement recommendations for safety, efficacy, or cost-effectiveness
4. efficacy_score: number from 1-10 rating formula effectiveness
5. safety_score: number from 1-10 rating overall safety

Focus on practical, formula-specific feedback. Consider ingredient interactions, concentration safety limits, and ${businessMode ? 'regulatory compliance' : 'ease of sourcing ingredients'}. Keep responses concise and directly actionable.`;

      const response = await base44.functions.invoke('runConsumerLLM', {
        operation: 'formulaInsights',
        data: { ingredients: formula.ingredients, productType, businessMode }
      });

      const analysis = response?.data ?? response;
      setAnalysis(analysis);
      // Expand properties section by default if analysis is successful
      if (analysis && analysis.properties) {
        setExpandedSection('properties');
      }
    } catch (error) {
      console.error('Formula analysis failed:', error);
      setAnalysis(null); // Ensure analysis is null on failure
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-6"
    >
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-slate-200 shadow-lg">
        <CardHeader className="pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${modeColors.primaryGradient} rounded-xl flex items-center justify-center`}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Live Analysis</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400 mr-2" />
              <span className="text-sm text-slate-600">Analyzing formula...</span>
            </div>
          )}

          {!isAnalyzing && analysis && (
            <>
              {/* Scores */}
              {(analysis.efficacy_score || analysis.safety_score) && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {analysis.efficacy_score && (
                    <div className="p-2 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap className="w-3 h-3 text-emerald-600" />
                        <span className="text-[10px] font-medium text-emerald-800">Efficacy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={analysis.efficacy_score * 10} className="h-1.5 flex-1" />
                        <span className="text-xs font-bold text-emerald-700">{analysis.efficacy_score}/10</span>
                      </div>
                    </div>
                  )}
                  {analysis.safety_score && (
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Shield className="w-3 h-3 text-blue-600" />
                        <span className="text-[10px] font-medium text-blue-800">Safety</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={analysis.safety_score * 10} className="h-1.5 flex-1" />
                        <span className="text-xs font-bold text-blue-700">{analysis.safety_score}/10</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Predicted Properties */}
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader 
                  className="pb-2 cursor-pointer hover:bg-blue-50 transition-colors rounded-t-lg"
                  onClick={() => setExpandedSection(expandedSection === 'properties' ? null : 'properties')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Beaker className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-sm font-semibold text-slate-900">
                        Predicted Properties
                      </CardTitle>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${
                      expandedSection === 'properties' ? 'rotate-180' : ''
                    }`} />
                  </div>
                </CardHeader>
                <AnimatePresence>
                  {expandedSection === 'properties' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <CardContent className="pt-2 pb-3 space-y-2">
                        {analysis.properties?.ph_level && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 flex items-center gap-1">
                              <Droplets className="w-3 h-3" />
                              pH Level
                            </span>
                            <span className="font-medium text-slate-900">{analysis.properties.ph_level}</span>
                          </div>
                        )}
                        {analysis.properties?.viscosity && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Viscosity</span>
                            <span className="font-medium text-slate-900">{analysis.properties.viscosity}</span>
                          </div>
                        )}
                        {analysis.properties?.stability && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Stability</span>
                            <span className="font-medium text-slate-900">{analysis.properties.stability}</span>
                          </div>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Warnings & Alerts */}
              {analysis.warnings && analysis.warnings.length > 0 && (
                <Card className="border-2 border-amber-200 bg-amber-50/50">
                  <CardHeader 
                    className="pb-2 cursor-pointer hover:bg-amber-50 transition-colors rounded-t-lg"
                    onClick={() => setExpandedSection(expandedSection === 'warnings' ? null : 'warnings')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        <CardTitle className="text-sm font-semibold text-slate-900">
                          Warnings & Alerts
                        </CardTitle>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${
                        expandedSection === 'warnings' ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {expandedSection === 'warnings' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <CardContent className="pt-2 pb-3">
                          <ul className="space-y-1.5">
                            {analysis.warnings.map((warning, index) => (
                              <li key={index} className="text-xs text-amber-800 flex items-start gap-1.5">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )}

              {/* Smart Suggestions */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardHeader 
                    className="pb-2 cursor-pointer hover:bg-green-50 transition-colors rounded-t-lg"
                    onClick={() => setExpandedSection(expandedSection === 'suggestions' ? null : 'suggestions')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <Lightbulb className="w-4 h-4 text-white" />
                        </div>
                        <CardTitle className="text-sm font-semibold text-slate-900">
                          Smart Suggestions
                        </CardTitle>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${
                        expandedSection === 'suggestions' ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {expandedSection === 'suggestions' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <CardContent className="pt-2 pb-3">
                          <ul className="space-y-1.5">
                            {analysis.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-xs text-green-800 flex items-start gap-1.5">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )}
            </>
          )}

          {!isAnalyzing && !analysis && (
            <div className="text-center py-8 text-slate-500">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Add ingredients to see live analysis</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}