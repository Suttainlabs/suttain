import { useState, useEffect, useContext } from 'react';
import { ChevronLeft, TrendingUp, Target, Flame, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, subDays } from 'date-fns';
import AuthContext from '../components/auth/AuthContext';
import { useHydration } from '../components/hydration/useHydration';
import HydrationBottomNav from '../components/hydration/HydrationBottomNav';
import ProUpgradeCard from '../components/hydration/ProUpgradeCard';
import useTrialStatus from '../hooks/useTrialStatus';
import { base44 } from '@/api/base44Client';
import { useHydrationUnit } from '../components/hydration/useHydrationUnit';
import { mlToOz } from '../components/hydration/useHydrationUnit';

function buildWeekData(allLogs, trueGoal) {
    return Array.from({ length: 7 }, (_, i) => {
        const day = subDays(new Date(), 6 - i);
        const dateStr = format(day, 'yyyy-MM-dd');
        const intake = allLogs
            .filter(l => l.log_date === dateStr)
            .reduce((s, l) => s + (l.amount_ml || 0), 0);
        return { day: format(day, 'EEE'), date: dateStr, intake, goal: trueGoal, met: intake >= trueGoal };
    });
}

function buildMonthData(allLogs, trueGoal) {
    return Array.from({ length: 30 }, (_, i) => {
        const day = subDays(new Date(), 29 - i);
        const dateStr = format(day, 'yyyy-MM-dd');
        const intake = allLogs
            .filter(l => l.log_date === dateStr)
            .reduce((s, l) => s + (l.amount_ml || 0), 0);
        const pct = trueGoal > 0 ? intake / trueGoal : 0;
        return { date: dateStr, label: format(day, 'd'), intake, pct };
    });
}

function heatColor(pct) {
    if (pct === 0) return 'bg-slate-100';
    if (pct >= 1) return 'bg-teal-600';
    if (pct >= 0.75) return 'bg-teal-400';
    if (pct >= 0.5) return 'bg-teal-200';
    return 'bg-amber-300';
}

export default function HydrationProgress() {
    const { user } = useContext(AuthContext);
    const { profile, trueGoal, loading } = useHydration(user);
    const trialStatus = useTrialStatus(user);
    const isPro = trialStatus?.isPro || trialStatus?.isLifetime || trialStatus?.isTrialing;
    const [allLogs, setAllLogs] = useState([]);
    const [insights, setInsights] = useState([]);
    const [logsLoaded, setLogsLoaded] = useState(false);
    const { unit } = useHydrationUnit();

    const fetchLogs = async () => {
        const [logs, ins] = await Promise.all([
            base44.entities.HydrationLog.list('-log_date', 500),
            base44.entities.HydrationInsight.list('-insight_date', 20)
        ]);
        setAllLogs(logs);
        setInsights(ins);
        setLogsLoaded(true);
    };

    useEffect(() => {
        if (!user) return;
        fetchLogs().catch(() => setLogsLoaded(true));

        // Real-time subscription — update whenever a log is added/deleted/updated
        const unsubscribe = base44.entities.HydrationLog.subscribe((event) => {
            if (event.type === 'create') {
                setAllLogs(prev => [event.data, ...prev]);
            } else if (event.type === 'update') {
                setAllLogs(prev => prev.map(l => l.id === event.id ? event.data : l));
            } else if (event.type === 'delete') {
                setAllLogs(prev => prev.filter(l => l.id !== event.id));
            }
        });

        return () => unsubscribe();
    }, [user]);

    if (loading || !logsLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
        );
    }

    const weekData = buildWeekData(allLogs, trueGoal);
    const monthData = buildMonthData(allLogs, trueGoal);

    const weekIntakes = weekData.map(d => d.intake).filter(v => v > 0);
    const weekAvg = weekIntakes.length ? Math.round(weekIntakes.reduce((a, b) => a + b, 0) / weekIntakes.length) : 0;
    const goalHitRate = weekData.filter(d => d.met).length;
    const streak = profile?.current_streak || 0;
    const longestStreak = profile?.longest_streak || 0;

    const severityColors = { info: 'border-blue-200 bg-blue-50', warning: 'border-amber-200 bg-amber-50', critical: 'border-red-200 bg-red-50', positive: 'border-teal-200 bg-teal-50' };
    const severityText = { info: 'text-blue-700', warning: 'text-amber-700', critical: 'text-red-700', positive: 'text-teal-700' };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/20 pb-28">
            <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-3 sticky top-0 z-20">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <Link to="/HydrationHome" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <h1 className="text-base font-bold text-slate-800">Progress Tracker</h1>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
                {/* 7-Day Bar Chart */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                    <p className="font-bold text-slate-800 mb-4">7-Day Overview</p>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={weekData} barSize={28}>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <ReferenceLine y={trueGoal} stroke="#94a3b8" strokeDasharray="4 2" />
                            <Bar dataKey="intake" radius={[6, 6, 0, 0]}>
                                {weekData.map((entry, i) => (
                                    <Cell key={i} fill={entry.met ? '#0d9488' : '#f59e0b'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-4 mt-2 justify-center">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <div className="w-3 h-3 rounded bg-teal-500" /> Goal met
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <div className="w-3 h-3 rounded bg-amber-400" /> Below goal
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'Weekly Avg', value: unit === 'oz' ? `${mlToOz(weekAvg)} oz` : `${weekAvg} ml`, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
                        { label: 'Goal Hit Rate', value: `${goalHitRate}/7 days`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Current Streak', value: `${streak} days`, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
                        { label: 'Longest Streak', value: `${longestStreak} days`, icon: Trophy, color: 'text-violet-600', bg: 'bg-violet-50' },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <p className="text-xl font-extrabold text-slate-800">{value}</p>
                            <p className="text-xs text-slate-500 font-medium">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Monthly Calendar Heatmap */}
                {isPro ? (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                        <p className="font-bold text-slate-800 mb-4">30-Day Heatmap</p>
                        <div className="grid grid-cols-7 gap-1.5">
                            {monthData.map(d => (
                                <div
                                    key={d.date}
                                    title={`${d.date}: ${d.intake}ml`}
                                    className={`aspect-square rounded-lg ${heatColor(d.pct)} flex items-center justify-center`}
                                >
                                    <span className="text-[9px] text-slate-500 font-medium">{d.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 mt-3 flex-wrap justify-center">
                            {[
                                { color: 'bg-teal-600', label: '100%+' },
                                { color: 'bg-teal-400', label: '75-99%' },
                                { color: 'bg-teal-200', label: '50-74%' },
                                { color: 'bg-amber-300', label: '<50%' },
                                { color: 'bg-slate-100', label: 'No data' },
                            ].map(({ color, label }) => (
                                <div key={label} className="flex items-center gap-1 text-xs text-slate-500">
                                    <div className={`w-3 h-3 rounded ${color}`} /> {label}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <ProUpgradeCard featureName="Monthly Heatmap" />
                )}

                {/* Insights Feed */}
                {insights.length > 0 && (
                    <div className="space-y-3">
                        <p className="font-bold text-slate-800 px-1">Insights</p>
                        {insights.map(insight => (
                            <div key={insight.id} className={`rounded-2xl border p-4 ${severityColors[insight.severity] || 'border-slate-200 bg-white'}`}>
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className={`font-bold text-sm ${severityText[insight.severity] || 'text-slate-800'}`}>{insight.title}</p>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">{insight.insight_date}</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{insight.message}</p>
                                {insight.recommendation && (
                                    <p className="text-xs text-slate-500 mt-2 italic">{insight.recommendation}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <HydrationBottomNav />
        </div>
    );
}