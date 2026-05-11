import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

const statusColors = {
    excellent: 'bg-emerald-500',
    good: 'bg-teal-400',
    low: 'bg-amber-400',
    very_low: 'bg-red-400',
};

export default function MolecularFingerprint({ fingerprint, keyNutrients }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="space-y-3">
            {/* Key Nutrients */}
            {keyNutrients?.length > 0 && (
                <Card className="border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <span className="text-lg">🔬</span>
                            Key Micronutrients
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                        {keyNutrients.map((n, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-xs text-slate-700 font-medium w-28 flex-shrink-0">{n.name}</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${statusColors[n.status] || 'bg-slate-400'}`}
                                        style={{ width: `${Math.min(n.daily_pct, 100)}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500 w-10 text-right flex-shrink-0">{n.daily_pct}%</span>
                                <span className="text-xs text-slate-400 w-14 text-right flex-shrink-0">{n.amount}</span>
                            </div>
                        ))}
                        <p className="text-[10px] text-slate-400">% of daily recommended value</p>
                    </CardContent>
                </Card>
            )}

            {/* Molecular Fingerprint — expandable */}
            {fingerprint && (
                <Card className="border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                        <button
                            className="flex items-center justify-between w-full"
                            onClick={() => setExpanded(v => !v)}
                        >
                            <CardTitle className="text-sm flex items-center gap-2">
                                <span className="text-lg">⚗️</span>
                                Molecular Food Fingerprint™
                            </CardTitle>
                            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                    </CardHeader>
                    {expanded && (
                        <CardContent className="space-y-4">
                            {/* Fatty acids */}
                            {fingerprint.fatty_acids && (
                                <div>
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Fatty Acid Profile</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: 'Omega-3', value: `${fingerprint.fatty_acids.omega3_mg}mg` },
                                            { label: 'Omega-6', value: `${fingerprint.fatty_acids.omega6_mg}mg` },
                                            { label: 'Saturated', value: `${fingerprint.fatty_acids.saturated_g}g` },
                                            { label: 'Trans Fat', value: `${fingerprint.fatty_acids.trans_g}g` },
                                        ].map(f => (
                                            <div key={f.label} className="bg-slate-50 rounded-lg p-2.5 text-center">
                                                <p className="text-sm font-bold text-slate-800">{f.value}</p>
                                                <p className="text-xs text-slate-500">{f.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Carb breakdown */}
                            {fingerprint.carb_breakdown && (
                                <div>
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Carbohydrate Breakdown</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: 'Resistant Starch', value: `${fingerprint.carb_breakdown.resistant_starch_g}g` },
                                            { label: 'Soluble Fiber', value: `${fingerprint.carb_breakdown.soluble_fiber_g}g` },
                                            { label: 'Fructose', value: `${fingerprint.carb_breakdown.fructose_g}g` },
                                            { label: 'Glucose', value: `${fingerprint.carb_breakdown.glucose_g}g` },
                                        ].map(f => (
                                            <div key={f.label} className="bg-slate-50 rounded-lg p-2.5 text-center">
                                                <p className="text-sm font-bold text-slate-800">{f.value}</p>
                                                <p className="text-xs text-slate-500">{f.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Scores */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-extrabold text-teal-700">{fingerprint.amino_acid_score}</p>
                                    <p className="text-xs text-teal-600">Amino Acid Score</p>
                                </div>
                                <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-extrabold text-violet-700">{fingerprint.bioavailability_score}</p>
                                    <p className="text-xs text-violet-600">Bioavailability Score</p>
                                </div>
                            </div>

                            {/* Anti-nutrients */}
                            {fingerprint.anti_nutrients?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Anti-Nutrients Detected</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {fingerprint.anti_nutrients.map((an, i) => (
                                            <span key={i} className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">{an}</span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Anti-nutrients can reduce mineral absorption. Usually harmless in normal amounts.</p>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>
            )}
        </div>
    );
}