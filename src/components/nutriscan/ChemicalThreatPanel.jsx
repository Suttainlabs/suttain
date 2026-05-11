import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';

const severityConfig = {
    low: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🔵' },
    moderate: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🟡' },
    high: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴' },
};

const novaInfo = {
    1: { label: 'Unprocessed or Minimally Processed', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Natural foods with no or minimal processing. Ideal choice.' },
    2: { label: 'Processed Culinary Ingredients', color: 'text-lime-700', bg: 'bg-lime-50', border: 'border-lime-200', desc: 'Oils, fats, sugar, salt — used in cooking. Fine in moderation.' },
    3: { label: 'Processed Foods', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Contains added salt, sugar, or oil. Eat in moderation.' },
    4: { label: 'Ultra-Processed Food', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', desc: 'Industrial formulations with many additives. Minimize consumption.' },
};

export default function ChemicalThreatPanel({ chemicalFlags, threatScore, threatLevel, novaScore, novaLabel }) {
    const nova = novaInfo[novaScore] || novaInfo[4];
    const hasFlags = chemicalFlags?.length > 0;

    return (
        <div className="space-y-3">
            {/* Threat Score Ring */}
            <Card className="border-slate-200 bg-white">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${
                            threatLevel === 'safe' ? 'bg-emerald-500' :
                            threatLevel === 'low' ? 'bg-blue-500' :
                            threatLevel === 'moderate' ? 'bg-amber-500' : 'bg-red-500'
                        } text-white`}>
                            <span className="text-2xl font-extrabold">{threatScore}</span>
                            <span className="text-[9px] opacity-80">/100</span>
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">Suttain Chemical Threat Score™</p>
                            <p className="text-sm text-slate-500 mt-1">
                                {threatLevel === 'safe' && 'No significant chemical concerns detected.'}
                                {threatLevel === 'low' && 'Minor chemical concerns — generally considered safe.'}
                                {threatLevel === 'moderate' && 'Moderate chemical concerns. Review flags below.'}
                                {threatLevel === 'high' && 'High chemical risk. Significant concerns detected.'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">Screened against 250,000+ chemical safety profiles</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Chemical Flags */}
            <Card className="border-slate-200 bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-500" />
                        Chemical Threat Detection Engine™
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {hasFlags ? (
                        chemicalFlags.map((flag, i) => {
                            const cfg = severityConfig[flag.severity] || severityConfig.low;
                            return (
                                <div key={i} className={`p-3 rounded-xl border ${cfg.color}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-base">{cfg.icon}</span>
                                        <span className="font-semibold text-sm">{flag.name}</span>
                                        <Badge variant="outline" className="text-[10px] ml-auto">{flag.category}</Badge>
                                    </div>
                                    <p className="text-xs ml-6 opacity-80">{flag.detail}</p>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-emerald-800 text-sm">No chemical flags detected</p>
                                <p className="text-xs text-emerald-600">This food passed Suttain's chemical safety screening.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* NOVA Score */}
            <Card className={`border ${nova.border} ${nova.bg}`}>
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg ${
                            novaScore === 1 ? 'bg-emerald-500' :
                            novaScore === 2 ? 'bg-lime-500' :
                            novaScore === 3 ? 'bg-amber-500' : 'bg-red-500'
                        } text-white flex-shrink-0`}>
                            {novaScore}
                        </div>
                        <div>
                            <p className={`font-bold text-sm ${nova.color}`}>NOVA {novaScore} — {nova.label}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{nova.desc}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <p className="text-center text-[10px] text-slate-400">For informational purposes only. Not medical advice.</p>
        </div>
    );
}