import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Flame, Zap, Leaf, Shield } from 'lucide-react';

export default function NutriScanDashboard({ dailyLog, user, onGoScan }) {
    const totals = useMemo(() => {
        return dailyLog.reduce((acc, item) => {
            acc.calories += item.calories || 0;
            acc.protein += item.protein_g || 0;
            acc.carbs += item.carbs_g || 0;
            acc.fat += item.fat_g || 0;
            acc.avgChemScore = dailyLog.length ? dailyLog.reduce((s, i) => s + (i.chemical_threat_score || 0), 0) / dailyLog.length : 0;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, avgChemScore: 0 });
    }, [dailyLog]);

    if (dailyLog.length === 0) {
        return (
            <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto">
                    <span className="text-3xl">🧬</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">No scans yet today</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Scan your meals to build your Living Biological Dashboard™ — a real-time view of what's happening in your body today.</p>
                <Button
                    onClick={onGoScan}
                    className="bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white font-bold px-6 py-2 rounded-xl"
                >
                    <Camera className="w-4 h-4 mr-2" /> Scan Your First Meal
                </Button>
            </div>
        );
    }

    const avgChemScore = Math.round(totals.avgChemScore);
    const chemColor = avgChemScore <= 30 ? 'bg-emerald-500' : avgChemScore <= 60 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className="space-y-4">
            {/* Living Biological Dashboard Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-1">Living Biological Dashboard™</p>
                <p className="text-sm text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <p className="text-sm text-slate-300 mt-1">{dailyLog.length} meal{dailyLog.length !== 1 ? 's' : ''} scanned today</p>
            </div>

            {/* Daily Totals */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-3 text-center">
                        <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                        <p className="text-2xl font-extrabold text-orange-700">{Math.round(totals.calories)}</p>
                        <p className="text-xs text-orange-600">Total Calories</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white">
                    <CardContent className="p-3 text-center">
                        <div className={`w-10 h-10 rounded-xl ${chemColor} flex items-center justify-center mx-auto mb-1`}>
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-extrabold text-slate-800">{avgChemScore}</p>
                        <p className="text-xs text-slate-500">Avg. Chem Score</p>
                    </CardContent>
                </Card>
            </div>

            {/* Macros */}
            <Card className="border-slate-200 bg-white">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Today's Macros</CardTitle></CardHeader>
                <CardContent className="space-y-2.5">
                    {[
                        { label: 'Protein', value: Math.round(totals.protein), unit: 'g', target: 150, color: 'bg-blue-500' },
                        { label: 'Carbohydrates', value: Math.round(totals.carbs), unit: 'g', target: 250, color: 'bg-amber-500' },
                        { label: 'Fat', value: Math.round(totals.fat), unit: 'g', target: 65, color: 'bg-rose-500' },
                    ].map(m => (
                        <div key={m.label} className="flex items-center gap-3">
                            <span className="text-xs text-slate-600 font-medium w-24 flex-shrink-0">{m.label}</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                                <div className={`h-2 rounded-full ${m.color}`} style={{ width: `${Math.min((m.value / m.target) * 100, 100)}%` }} />
                            </div>
                            <span className="text-xs text-slate-700 font-semibold w-14 text-right flex-shrink-0">{m.value}{m.unit}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Meal Log */}
            <Card className="border-slate-200 bg-white">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Today's Scans</CardTitle>
                        <button onClick={onGoScan} className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                            <Camera className="w-3 h-3" /> Add more
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {dailyLog.map((item, i) => {
                        const cScore = item.chemical_threat_score || 0;
                        const cColor = cScore <= 30 ? 'bg-emerald-500' : cScore <= 60 ? 'bg-amber-500' : 'bg-red-500';
                        return (
                            <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                <div className={`w-8 h-8 rounded-lg ${cColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                    {cScore}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{item.food_name}</p>
                                    <p className="text-xs text-slate-500">{item.calories} kcal · {item.protein_g}g protein</p>
                                </div>
                                <span className="text-xs text-slate-400 flex-shrink-0">
                                    {new Date(item.addedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <p className="text-center text-[10px] text-slate-400 pb-4">NutriScan data is for informational purposes only. Not medical advice.</p>
        </div>
    );
}