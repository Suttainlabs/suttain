import React from 'react';
import { FlaskConical, TestTube, QrCode } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const stats_config = [
    {
        icon: FlaskConical,
        title: 'Formulas',
        key: 'totalFormulas',
        gradient: 'from-purple-500 to-violet-500',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
    },
    {
        icon: TestTube,
        title: 'Simulations',
        key: 'totalSimulations',
        gradient: 'from-teal-500 to-cyan-500',
        bg: 'bg-teal-50',
        text: 'text-teal-700',
    },
    {
        icon: QrCode,
        title: 'Scans',
        key: 'totalScans',
        gradient: 'from-sky-500 to-blue-500',
        bg: 'bg-sky-50',
        text: 'text-sky-700',
    },
];

export default function UserStats({ stats, isLoading }) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {stats_config.map(({ icon: Icon, title, key, gradient, bg, text }) => (
                <div key={key} className={`${bg} rounded-2xl p-4 flex items-center gap-3 border border-white shadow-sm`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className={`text-xs font-semibold ${text} uppercase tracking-wide`}>{title}</p>
                        {isLoading ? (
                            <Skeleton className="h-6 w-10 mt-1" />
                        ) : (
                            <p className="text-2xl font-bold text-slate-900 leading-tight">{stats[key] ?? 0}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}