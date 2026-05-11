import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const gradeColors = {
    A: 'bg-emerald-500', B: 'bg-teal-500', C: 'bg-amber-500', D: 'bg-orange-500', F: 'bg-red-500'
};

export default function PlanetaryImpactPanel({ planetaryImpact, foodName }) {
    if (!planetaryImpact) return (
        <Card className="border-slate-200 bg-white">
            <CardContent className="p-8 text-center text-slate-500 text-sm">
                Planetary impact data unavailable for this food.
            </CardContent>
        </Card>
    );

    const gradeColor = gradeColors[planetaryImpact.grade] || 'bg-slate-400';

    return (
        <div className="space-y-3">
            {/* Overall */}
            <Card className="border-slate-200 bg-white">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${gradeColor} text-white flex-shrink-0`}>
                            <span className="text-3xl font-extrabold">{planetaryImpact.grade}</span>
                            <span className="text-[10px] opacity-80">{planetaryImpact.overall_score}/100</span>
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">Planetary Impact Score™</p>
                            <p className="text-sm text-slate-500 mt-1">{planetaryImpact.notes}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-3 text-center">
                        <span className="text-2xl">💧</span>
                        <p className="text-xl font-extrabold text-blue-700 mt-1">{planetaryImpact.water_usage_liters}L</p>
                        <p className="text-xs text-blue-600">Water Usage</p>
                        <p className="text-[10px] text-blue-500">per serving</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 bg-slate-50">
                    <CardContent className="p-3 text-center">
                        <span className="text-2xl">🌫️</span>
                        <p className="text-xl font-extrabold text-slate-700 mt-1">{planetaryImpact.carbon_footprint_kg}kg</p>
                        <p className="text-xs text-slate-600">CO₂ Equivalent</p>
                        <p className="text-[10px] text-slate-500">per serving</p>
                    </CardContent>
                </Card>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-center text-slate-400">
                Planetary impact estimates are based on average production data and may vary by region and farming method.
            </p>
        </div>
    );
}