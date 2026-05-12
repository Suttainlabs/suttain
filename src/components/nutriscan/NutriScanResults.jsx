import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, ChevronLeft, Plus, Shield, Leaf, Brain, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BodySystemMap from './BodySystemMap';
import ChemicalThreatPanel from './ChemicalThreatPanel';
import MolecularFingerprint from './MolecularFingerprint';
import PlanetaryImpactPanel from './PlanetaryImpactPanel';
import MealCoachPanel from './MealCoachPanel';

const threatConfig = {
    safe: { label: 'Chemically Safe', color: 'bg-emerald-500', textColor: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    low: { label: 'Low Chemical Risk', color: 'bg-blue-500', textColor: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    moderate: { label: 'Moderate Risk', color: 'bg-amber-500', textColor: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    high: { label: 'High Chemical Risk', color: 'bg-red-500', textColor: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
};

const novaColors = { 1: 'bg-emerald-500', 2: 'bg-lime-500', 3: 'bg-amber-500', 4: 'bg-red-500' };

export default function NutriScanResults({ result, onAddToDay, onNewScan, user }) {
    const threat = threatConfig[result.chemical_threat_level] || threatConfig.safe;
    const novaColor = novaColors[result.nova_score] || 'bg-slate-400';

    return (
        <div className="space-y-4">
            {/* Nav */}
            <div className="flex items-center justify-between">
                <button onClick={onNewScan} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                    <ChevronLeft className="w-4 h-4" /> New Scan
                </button>
                <Button
                    onClick={() => onAddToDay(result)}
                    className="bg-[#02988C] hover:bg-[#017a70] text-white text-sm h-8 px-4 rounded-lg"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add to Today
                </Button>
            </div>

            {/* Food Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{result.food_name}</h2>
                        <p className="text-sm text-slate-500 mt-0.5">{result.portion_estimate}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge className={`${novaColor} text-white text-xs`}>NOVA {result.nova_score}</Badge>
                            <Badge variant="outline" className="text-xs">{result.nova_label}</Badge>
                            {result.confidence && (
                                <Badge variant="outline" className="text-xs">
                                    {Math.round(result.confidence)}% confidence
                                </Badge>
                            )}
                        </div>
                    </div>
                    {/* Chemical Threat Score */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${threat.color} flex flex-col items-center justify-center text-white`}>
                        <span className="text-xl font-extrabold">{result.chemical_threat_score}</span>
                        <span className="text-[9px] opacity-80 font-medium">CHEM SCORE</span>
                    </div>
                </div>

                {/* Quick macros */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                    {[
                        { label: 'Calories', value: result.calories, unit: 'kcal', color: 'text-orange-600' },
                        { label: 'Protein', value: result.protein_g, unit: 'g', color: 'text-blue-600' },
                        { label: 'Carbs', value: result.carbs_g, unit: 'g', color: 'text-amber-600' },
                        { label: 'Fat', value: result.fat_g, unit: 'g', color: 'text-rose-600' },
                    ].map(m => (
                        <div key={m.label} className="text-center p-2 bg-slate-50 rounded-xl">
                            <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                            <p className="text-[10px] text-slate-500">{m.unit}</p>
                            <p className="text-[10px] text-slate-400">{m.label}</p>
                        </div>
                    ))}
                </div>

                {/* Chemical threat banner */}
                <div className={`mt-3 p-3 rounded-xl ${threat.bg} border ${threat.border} flex items-center gap-2`}>
                    {result.chemical_threat_level === 'safe' || result.chemical_threat_level === 'low' ? (
                        <CheckCircle className={`w-4 h-4 ${threat.textColor} flex-shrink-0`} />
                    ) : (
                        <AlertTriangle className={`w-4 h-4 ${threat.textColor} flex-shrink-0`} />
                    )}
                    <div>
                        <span className={`text-sm font-bold ${threat.textColor}`}>{threat.label}</span>
                        <span className="text-xs text-slate-500 ml-2">Chemical Threat Score: {result.chemical_threat_score}/100</span>
                    </div>
                </div>
            </div>

            {/* Tabs for deep analysis */}
            <Tabs defaultValue="nourish">
                <TabsList className="w-full bg-white border border-slate-200 rounded-xl p-1">
                    <TabsTrigger value="nourish" className="flex-1 text-xs data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-lg">
                        🌱 Nourish
                    </TabsTrigger>
                    <TabsTrigger value="protect" className="flex-1 text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg">
                        🛡 Protect
                    </TabsTrigger>
                    <TabsTrigger value="planet" className="flex-1 text-xs data-[state=active]:bg-green-700 data-[state=active]:text-white rounded-lg">
                        🌍 Planet
                    </TabsTrigger>
                    <TabsTrigger value="coach" className="flex-1 text-xs data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg">
                        🤖 Coach
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="nourish" className="mt-3 space-y-3">
                    <BodySystemMap bodySystems={result.body_systems} />
                    <MolecularFingerprint fingerprint={result.molecular_fingerprint} keyNutrients={result.key_nutrients} />
                </TabsContent>

                <TabsContent value="protect" className="mt-3">
                    <ChemicalThreatPanel
                        chemicalFlags={result.chemical_flags}
                        threatScore={result.chemical_threat_score}
                        threatLevel={result.chemical_threat_level}
                        novaScore={result.nova_score}
                        novaLabel={result.nova_label}
                    />
                </TabsContent>

                <TabsContent value="planet" className="mt-3">
                    <PlanetaryImpactPanel planetaryImpact={result.planetary_impact} foodName={result.food_name} />
                </TabsContent>

                <TabsContent value="coach" className="mt-3">
                    <MealCoachPanel coachInsights={result.coach_insights} summary={result.overall_summary} />
                </TabsContent>
            </Tabs>

            <p className="text-center text-[10px] text-slate-400 pb-4">For informational purposes only. Not medical or dietary advice.</p>
        </div>
    );
}