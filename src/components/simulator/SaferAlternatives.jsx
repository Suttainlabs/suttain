import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, AlertTriangle, ArrowRight, ShieldCheck, TrendingUp, Leaf, BookOpen, FlaskConical, TestTube, Atom, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const RatingBar = ({ score, color }) => (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
        <motion.div
            className="h-2.5 rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        />
    </div>
);

const capitalize = (s) => s && s.charAt(0).toUpperCase() + s.slice(1);

export default function SaferAlternatives({
  alternatives,
  chemicals = [],
  riskAssessment = { overall_risk_score: 0 },
  onStartNew,
  onBackToAnalysis
}) {
  const navigate = useNavigate();
  const overallRiskScore = riskAssessment.overall_risk_score || 0;
  const isHighOrModerateRisk = overallRiskScore >= 40;
  const [actionPopup, setActionPopup] = useState(null);

  const validAlternatives = (alternatives || []).filter(alt =>
    alt && alt.original_chemical && alt.alternative_chemical
  );
  
  const hasValidAlternatives = validAlternatives.length > 0;

  const handleSimulateAlternative = (alt) => {
    // Navigate to Simulator with the alternative pre-filled and auto-run enabled
    const params = new URLSearchParams({ chemicals: alt.alternative_chemical, auto_simulate: 'true' });
    navigate(`${createPageUrl('Simulator')}?${params.toString()}`);
  };

  const handleGenerateFormula = (alt) => {
    // Navigate to generator with the alternative as a suggested ingredient
    const params = new URLSearchParams({ ingredient: alt.alternative_chemical });
    navigate(`${createPageUrl('generator')}?${params.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 md:space-y-8"
        >
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Safer Alternatives Analysis</h1>
                <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
                    {isHighOrModerateRisk ?
                        `Based on the high risk score of ${overallRiskScore}, here are recommended safer alternatives for "${chemicals.map(c => capitalize(c)).join(' + ')}".` :
                        `Your combination has a low risk score of ${overallRiskScore}, but here are some alternatives for enhanced safety and performance.`
                    }
                </p>
                <p className="text-sm text-teal-600 mt-2 font-medium">Click any alternative card to simulate or generate a formula with it</p>
            </div>

            {hasValidAlternatives ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {validAlternatives.map((alt, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer group border-2 hover:border-teal-300"
                                onClick={() => setActionPopup(actionPopup === index ? null : index)}
                            >
                                <CardHeader className="bg-slate-50/50 p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-500">Replace</p>
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{alt.original_chemical}</Badge>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-400 mx-2 mt-5"/>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-500">With</p>
                                            <Badge className="bg-green-100 text-green-800 border-green-200">{alt.alternative_chemical}</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600 mb-4">{alt.safety_improvement}</p>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="font-medium text-slate-700 flex items-center gap-2 whitespace-nowrap"><ShieldCheck className="w-4 h-4 text-green-500"/>Safety</span>
                                                <RatingBar score={alt.safety_rating} color="linear-gradient(to right, #6EE7B7, #10B981)" />
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="font-medium text-slate-700 flex items-center gap-2 whitespace-nowrap"><TrendingUp className="w-4 h-4 text-blue-500"/>Effectiveness</span>
                                                <RatingBar score={alt.effectiveness_rating} color="linear-gradient(to right, #93C5FD, #3B82F6)" />
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="font-medium text-slate-700 flex items-center gap-2 whitespace-nowrap"><Leaf className="w-4 h-4 text-emerald-500"/>Sustainability</span>
                                                <RatingBar score={alt.sustainability_rating} color="linear-gradient(to right, #A7F3D0, #059669)" />
                                            </div>
                                        </div>
                                        
                                        {alt.educational_value && (
                                            <div className="mt-4 pt-3 border-t border-slate-200">
                                                <h4 className="font-semibold text-sm flex items-center gap-2 mb-1"><BookOpen className="w-4 h-4 text-purple-600"/>Educational Value</h4>
                                                <p className="text-xs text-slate-600">{alt.educational_value}</p>
                                            </div>
                                        )}
                                         {alt.research_advantage && (
                                            <div className="mt-4 pt-3 border-t border-slate-200">
                                                <h4 className="font-semibold text-sm flex items-center gap-2 mb-1"><FlaskConical className="w-4 h-4 text-indigo-600"/>Research Advantage</h4>
                                                <p className="text-xs text-slate-600">{alt.research_advantage}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-200">
                                       <p className="text-xs text-slate-500">Commercial names: {alt.commercial_names?.join(', ') || 'Various'}</p>
                                    </div>

                                    {/* Action buttons: shown when card is clicked */}
                                    {actionPopup === index && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 pt-3 border-t-2 border-teal-200 space-y-2"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <p className="text-xs font-semibold text-teal-700 mb-2">Use <span className="text-teal-900">{alt.alternative_chemical}</span> in:</p>
                                            <Button
                                                size="sm"
                                                className="w-full bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)] text-white"
                                                onClick={() => handleSimulateAlternative(alt)}
                                            >
                                                <TestTube className="w-3.5 h-3.5 mr-2" />
                                                Simulate This Chemical
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full border-teal-300 text-teal-700 hover:bg-teal-50"
                                                onClick={() => handleGenerateFormula(alt)}
                                            >
                                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                                                Generate Formula
                                            </Button>
                                        </motion.div>
                                    )}

                                    {/* Hint when not expanded */}
                                    {actionPopup !== index && (
                                        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="w-3.5 h-3.5" />
                                            Click to use this alternative
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12 md:py-16">
                    <CardContent>
                        <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 text-amber-400 mx-auto mb-4" />
                        <h3 className="text-lg md:text-xl font-bold text-slate-800">No Specific Alternatives Found</h3>
                        <p className="text-slate-600 mt-2 max-w-md mx-auto text-sm md:text-base">
                            Our system could not identify a direct safer alternative for this specific combination. Please exercise extreme caution and consult official Safety Data Sheets (SDS).
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 md:pt-6">
                <Button variant="outline" onClick={onBackToAnalysis} className="flex items-center gap-2 w-full sm:w-auto"><ArrowLeft className="w-4 h-4" />Back to Analysis</Button>
                <Button onClick={onStartNew} className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto"><RotateCcw className="w-4 h-4 mr-2" />Start New Simulation</Button>
            </div>
        </motion.div>
    </div>
  );
}