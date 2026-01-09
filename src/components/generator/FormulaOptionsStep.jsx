import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, Leaf, Award, ChevronDown, ChevronUp, Loader2, Sparkles, Building2, ShoppingCart, Recycle, Beaker, Heart, Wallet } from "lucide-react";

export default function FormulaOptionsStep({ 
  businessMode, 
  formulaOptions, 
  onBack, 
  onSelectFormula,
  isGenerating 
}) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loadingIndex, setLoadingIndex] = useState(null);

  const modeColors = businessMode 
    ? {
        iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
        badgeBg: 'bg-violet-50',
        badgeText: 'text-violet-800',
        badgeBorder: 'border-violet-300',
        btnBg: 'from-violet-600 to-purple-600',
        btnHover: 'from-violet-700 to-purple-700'
      }
    : {
        iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-500',
        badgeBg: 'bg-teal-50',
        badgeText: 'text-teal-800',
        badgeBorder: 'border-teal-300',
        btnBg: 'from-teal-600 to-cyan-600',
        btnHover: 'from-teal-700 to-cyan-700'
      };

  const getVariantIcon = (variant, isBusinessMode) => {
    const v = variant.toLowerCase();
    if (isBusinessMode) {
      // Business mode variants
      if (v.includes('market leader') || v.includes('premium')) return Award;
      if (v.includes('mass market') || v.includes('volume')) return ShoppingCart;
      if (v.includes('clean') || v.includes('sustainable')) return Recycle;
      return Building2;
    } else {
      // Individual mode variants  
      if (v.includes('easy') || v.includes('simple') || v.includes('super')) return Heart;
      if (v.includes('natural') || v.includes('gentle')) return Leaf;
      if (v.includes('budget') || v.includes('saver')) return Wallet;
      return Beaker;
    }
  };

  const getVariantColor = (variant, isBusinessMode) => {
    const v = variant.toLowerCase();
    if (isBusinessMode) {
      if (v.includes('market leader') || v.includes('premium')) return 'bg-violet-600';
      if (v.includes('mass market') || v.includes('volume')) return 'bg-blue-500';
      if (v.includes('clean') || v.includes('sustainable')) return 'bg-emerald-500';
      return 'bg-purple-500';
    } else {
      if (v.includes('easy') || v.includes('simple') || v.includes('super')) return 'bg-pink-500';
      if (v.includes('natural') || v.includes('gentle')) return 'bg-green-500';
      if (v.includes('budget') || v.includes('saver')) return 'bg-cyan-500';
      return 'bg-teal-500';
    }
  };

  const handleSelectFormula = (formula, index) => {
    setLoadingIndex(index);
    onSelectFormula(formula);
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="flex items-center gap-2" disabled={isGenerating}>
        <ArrowLeft className="w-4 h-4" />
        Back to Description
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="text-center p-6 pb-4">
            <div className={`w-16 h-16 ${modeColors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {businessMode ? 'Commercial Formula Options' : 'Recipe Options'}
            </h1>
            <p className="text-slate-600 text-lg">
              {businessMode 
                ? 'Three market-ready formulations with full regulatory compliance and manufacturing specifications'
                : 'Three easy-to-make recipes using simple ingredients you can find at home or nearby stores'
              }
            </p>
          </div>
          
          <CardContent className="space-y-4">
            {formulaOptions.map((formula, index) => {
              const Icon = getVariantIcon(formula.variant, businessMode);
              const isExpanded = expandedIndex === index;
              const isThisLoading = loadingIndex === index;
              
              return (
                <Card key={index} className="border-2 border-slate-200 hover:border-slate-300 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${getVariantColor(formula.variant, businessMode)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {formula.variant}
                            </Badge>
                            <h3 className="font-bold text-lg text-slate-900">{formula.name}</h3>
                            <p className="text-sm text-slate-600">{formula.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedIndex(isExpanded ? null : index)}
                            disabled={isThisLoading}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </div>

                        {/* Benefits */}
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-slate-700 mb-2">
                            {businessMode ? 'Marketing Claims:' : 'Key Benefits:'}
                          </p>
                          <ul className="space-y-1">
                            {formula.benefits?.slice(0, 3).map((benefit, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                <span className={businessMode ? "text-violet-600" : "text-green-600"}>✓</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-slate-200"
                          >
                            <p className="text-xs font-semibold text-slate-700 mb-2">
                              {businessMode ? 'INCI Ingredient List:' : 'Ingredients You\'ll Need:'}
                            </p>
                            <div className="space-y-1">
                              {formula.ingredients?.slice(0, 5).map((ing, i) => (
                                <div key={i} className="flex justify-between text-xs">
                                  <span className="text-slate-600">{ing.chemical_name}</span>
                                  <span className="font-medium text-slate-700">{ing.percentage}%</span>
                                </div>
                              ))}
                              {formula.ingredients?.length > 5 && (
                                <p className="text-xs text-slate-500 italic">...and {formula.ingredients.length - 5} more ingredients</p>
                              )}
                            </div>
                            {businessMode && (
                              <p className="text-xs text-violet-600 mt-2 font-medium">
                                Full INCI list with CAS numbers available in editor
                              </p>
                            )}
                          </motion.div>
                        )}

                        {/* Badges */}
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            {formula.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Cost: {formula.cost_level}
                          </Badge>
                        </div>

                        {/* Select Button */}
                        <Button
                          onClick={() => handleSelectFormula(formula, index)}
                          disabled={isThisLoading || isGenerating}
                          className={`w-full mt-4 bg-gradient-to-r ${modeColors.btnBg} hover:${modeColors.btnHover} text-white`}
                        >
                          {isThisLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {businessMode ? 'Generating Manufacturing Specs...' : 'Creating Your Recipe...'}
                            </>
                          ) : (
                            businessMode ? 'Select & Generate Full Spec' : 'Select This Recipe'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}