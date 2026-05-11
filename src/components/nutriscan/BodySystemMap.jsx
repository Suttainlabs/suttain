import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusConfig = {
    supported: { color: 'bg-emerald-500', textColor: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: '🟢', label: 'Supported' },
    neutral: { color: 'bg-amber-400', textColor: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: '🟡', label: 'Neutral' },
    stressed: { color: 'bg-red-500', textColor: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: '🔴', label: 'Stressed' },
};

export default function BodySystemMap({ bodySystems }) {
    if (!bodySystems?.length) return null;

    const supported = bodySystems.filter(s => s.status === 'supported').length;
    const stressed = bodySystems.filter(s => s.status === 'stressed').length;

    return (
        <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-lg">🫀</span>
                    Body System Intelligence Map™
                </CardTitle>
                <div className="flex gap-3 text-xs text-slate-500">
                    <span className="text-emerald-600 font-semibold">{supported} supported</span>
                    {stressed > 0 && <span className="text-red-600 font-semibold">{stressed} stressed</span>}
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {bodySystems.map((sys, i) => {
                    const cfg = statusConfig[sys.status] || statusConfig.neutral;
                    return (
                        <div key={i} className={`p-3 rounded-xl border ${cfg.border} ${cfg.bg} flex items-start gap-3`}>
                            <span className="text-xl flex-shrink-0">{sys.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm text-slate-800">{sys.system}</span>
                                    <span className={`text-xs font-medium ${cfg.textColor}`}>{cfg.dot} {cfg.label}</span>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5">{sys.reason}</p>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}