import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Leaf, ShoppingCart, Award, TrendingDown, Star, Zap, Droplets, Recycle, Globe, CheckCircle2, Lock } from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { motion } from 'framer-motion';

// ─── Badge definitions ───────────────────────────────────────────────────────
const BADGES = [
    { id: 'first_scan',    icon: ShoppingCart, label: 'First Scan',        desc: 'Scanned your first product',             color: 'from-teal-400 to-teal-600',    req: (s) => s.scans >= 1 },
    { id: 'eco_5',         icon: Leaf,         label: 'Green Shopper',      desc: 'Scanned 5+ eco-rated products',          color: 'from-green-400 to-green-600',  req: (s) => s.scans >= 5 },
    { id: 'eco_20',        icon: Globe,        label: 'Earth Defender',     desc: 'Scanned 20+ products',                   color: 'from-emerald-400 to-emerald-600', req: (s) => s.scans >= 20 },
    { id: 'formula_maker', icon: Zap,          label: 'Formula Maker',      desc: 'Created your first eco formula',         color: 'from-violet-400 to-violet-600', req: (s) => s.formulas >= 1 },
    { id: 'formula_5',     icon: Star,         label: 'Master Formulator',  desc: 'Created 5+ eco formulas',               color: 'from-yellow-400 to-orange-500', req: (s) => s.formulas >= 5 },
    { id: 'carbon_10',     icon: TrendingDown, label: 'Carbon Cutter',      desc: 'Reduced carbon footprint by 10+ units',  color: 'from-blue-400 to-blue-600',    req: (s) => s.carbonReduced >= 10 },
    { id: 'carbon_50',     icon: Recycle,      label: 'Climate Champion',   desc: 'Reduced carbon footprint by 50+ units',  color: 'from-cyan-400 to-cyan-600',    req: (s) => s.carbonReduced >= 50 },
    { id: 'sustain_pro',   icon: Award,        label: 'Sustainability Pro',  desc: 'Achieved avg sustainability score 70+',  color: 'from-pink-400 to-rose-500',    req: (s) => s.avgSustainScore >= 70 },
    { id: 'water_saver',   icon: Droplets,     label: 'Water Guardian',     desc: 'Created 3+ eco-friendly formulas',       color: 'from-sky-400 to-sky-600',      req: (s) => s.formulas >= 3 },
];

const MILESTONES = [
    { threshold: 1,   label: 'First Step',        icon: '🌱' },
    { threshold: 10,  label: 'Eco Aware',          icon: '🌿' },
    { threshold: 25,  label: 'Green Advocate',     icon: '♻️' },
    { threshold: 50,  label: 'Planet Protector',   icon: '🌍' },
    { threshold: 100, label: 'Sustainability Hero', icon: '🏆' },
];

function BadgeCard({ badge, earned }) {
    const Icon = badge.icon;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                earned
                    ? 'border-transparent bg-white shadow-md'
                    : 'border-slate-200 bg-slate-50 opacity-50 grayscale'
            }`}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${badge.color} shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
            </div>
            <p className="text-xs font-bold text-slate-800 text-center leading-tight">{badge.label}</p>
            <p className="text-[10px] text-slate-500 text-center leading-tight">{badge.desc}</p>
            {earned && (
                <span className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                </span>
            )}
            {!earned && (
                <span className="absolute top-2 right-2">
                    <Lock className="w-3 h-3 text-slate-400" />
                </span>
            )}
        </motion.div>
    );
}

function StatCard({ icon: Icon, label, value, unit, color }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800">{value}<span className="text-sm font-normal text-slate-500 ml-1">{unit}</span></p>
                <p className="text-sm text-slate-500">{label}</p>
            </div>
        </div>
    );
}

export default function ImpactDashboard({ user }) {
    const { data: scans = [] } = useQuery({
        queryKey: ['barcode-history'],
        queryFn: () => base44.entities.BarcodeHistory.filter({ created_by: user.email }, '-created_date', 200),
    });

    const { data: formulas = [] } = useQuery({
        queryKey: ['formulas'],
        queryFn: () => base44.entities.Formula.filter({ created_by: user.email }, '-created_date', 100),
    });

    const { data: sustainProfiles = [] } = useQuery({
        queryKey: ['sustainability-profiles'],
        queryFn: () => base44.entities.SustainabilityProfile.filter({ created_by: user.email }, '-created_date', 100),
    });

    // ── Derived stats ──────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const carbonReduced = sustainProfiles.reduce((acc, p) => {
            const score = p.carbon_footprint?.score ?? 0;
            return acc + (score / 10);
        }, 0);

        const avgSustainScore = sustainProfiles.length
            ? Math.round(sustainProfiles.reduce((a, p) => a + (p.overall_score ?? 0), 0) / sustainProfiles.length)
            : 0;

        return {
            scans: scans.length,
            formulas: formulas.length,
            carbonReduced: Math.round(carbonReduced),
            avgSustainScore,
            profiles: sustainProfiles.length,
        };
    }, [scans, formulas, sustainProfiles]);

    // ── Timeline chart data (last 6 months) ───────────────────────────────
    const timelineData = useMemo(() => {
        const months = Array.from({ length: 6 }, (_, i) => {
            const date = subMonths(new Date(), 5 - i);
            return { month: format(date, 'MMM'), start: startOfMonth(date).toISOString(), scans: 0, formulas: 0 };
        });

        scans.forEach((s) => {
            const m = format(new Date(s.created_date), 'MMM');
            const entry = months.find((x) => x.month === m);
            if (entry) entry.scans += 1;
        });

        formulas.forEach((f) => {
            const m = format(new Date(f.created_date), 'MMM');
            const entry = months.find((x) => x.month === m);
            if (entry) entry.formulas += 1;
        });

        return months;
    }, [scans, formulas]);

    // ── Milestones ─────────────────────────────────────────────────────────
    const totalActions = stats.scans + stats.formulas;
    const currentMilestone = [...MILESTONES].reverse().find((m) => totalActions >= m.threshold);
    const nextMilestone = MILESTONES.find((m) => totalActions < m.threshold);
    const milestoneProgress = nextMilestone
        ? Math.min(100, Math.round((totalActions / nextMilestone.threshold) * 100))
        : 100;

    // ── Badges ─────────────────────────────────────────────────────────────
    const earnedBadges = BADGES.filter((b) => b.req(stats));

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-800">🌿 Your Sustainability Impact</h1>
                    <p className="text-slate-500 mt-1">Track your eco-friendly shopping journey and milestones</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={ShoppingCart} label="Products Scanned" value={stats.scans} color="bg-teal-500" />
                    <StatCard icon={Leaf} label="Formulas Created" value={stats.formulas} color="bg-violet-500" />
                    <StatCard icon={TrendingDown} label="Carbon Reduced" value={stats.carbonReduced} unit="kg eq" color="bg-blue-500" />
                    <StatCard icon={Award} label="Avg Eco Score" value={stats.avgSustainScore} unit="/100" color="bg-orange-500" />
                </div>

                {/* Milestone progress */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">
                                {currentMilestone ? `${currentMilestone.icon} ${currentMilestone.label}` : '🌱 Getting Started'}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {nextMilestone
                                    ? `${totalActions} / ${nextMilestone.threshold} actions to reach "${nextMilestone.label}"`
                                    : 'You have reached the highest milestone! 🏆'}
                            </p>
                        </div>
                        <span className="text-2xl font-bold text-teal-600">{totalActions}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${milestoneProgress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full"
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-400">
                        {MILESTONES.map((m) => (
                            <span key={m.threshold} className={totalActions >= m.threshold ? 'text-teal-600 font-bold' : ''}>
                                {m.icon} {m.threshold}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Timeline chart */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="font-bold text-slate-800 text-lg mb-4">Activity Over Time</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={timelineData}>
                            <defs>
                                <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#02988C" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#02988C" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="formulaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#9531F5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#9531F5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="scans" name="Products Scanned" stroke="#02988C" fill="url(#scanGrad)" strokeWidth={2} />
                            <Area type="monotone" dataKey="formulas" name="Formulas" stroke="#9531F5" fill="url(#formulaGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Badges */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-800 text-lg">Badges Earned</h2>
                        <span className="text-sm text-teal-600 font-semibold">{earnedBadges.length} / {BADGES.length}</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {BADGES.map((badge) => (
                            <BadgeCard key={badge.id} badge={badge} earned={badge.req(stats)} />
                        ))}
                    </div>
                </div>

                {/* Carbon footprint bar chart */}
                {sustainProfiles.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="font-bold text-slate-800 text-lg mb-4">Sustainability Scores by Formula</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={sustainProfiles.slice(0, 8).map((p, i) => ({ name: `Formula ${i + 1}`, score: p.overall_score ?? 0 }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="score" name="Eco Score" fill="#02988C" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}