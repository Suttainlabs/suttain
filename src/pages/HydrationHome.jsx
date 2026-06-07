import { useState, useContext, useEffect, useRef } from 'react';
import { Plus, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../components/auth/AuthContext';
import AuthGate from '../components/auth/AuthGate';
import { useHydration } from '../components/hydration/useHydration';
import ProgressRing from '../components/hydration/ProgressRing';
import QuickAddButtons from '../components/hydration/QuickAddButtons';
import TodayTimeline from '../components/hydration/TodayTimeline';
import CustomAmountModal from '../components/hydration/CustomAmountModal';
import HydrationOnboarding from '../components/hydration/HydrationOnboarding';
import HydrationBottomNav from '../components/hydration/HydrationBottomNav';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

export default function HydrationHome() {
    const { user } = useContext(AuthContext);
    const { profile, todayLogs, totalIntake, trueGoal, loading, logDrink, deleteLog, saveProfile } = useHydration(user);
    const [showCustom, setShowCustom] = useState(false);
    const [goalCelebrated, setGoalCelebrated] = useState(false);
    const prevIntakeRef = useRef(null);

    const goalReached = trueGoal > 0 && totalIntake >= trueGoal;

    useEffect(() => {
        if (!trueGoal || loading) return;
        const prev = prevIntakeRef.current;
        // Fire celebration only when crossing the threshold, not on every render
        if (prev !== null && prev < trueGoal && totalIntake >= trueGoal) {
            setGoalCelebrated(true);
        }
        prevIntakeRef.current = totalIntake;
    }, [totalIntake, trueGoal, loading]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
                <AuthGate featureName="Hydration Intelligence" featureDescription="Track your biological hydration needs personalised to your food, activity, and body." />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile?.onboarding_complete) {
        return <HydrationOnboarding onComplete={saveProfile} />;
    }

    const streak = profile?.current_streak || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 pb-28">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-3 sticky top-0 z-20">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-bold text-orange-600">{streak}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">day streak</span>
                    </div>
                    <h1 className="text-base font-bold text-slate-800">Hydration</h1>
                    <button
                        onClick={() => setShowCustom(true)}
                        className="w-9 h-9 bg-teal-500 hover:bg-teal-600 rounded-xl flex items-center justify-center transition-colors"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
                {/* Progress Ring */}
                <div className="flex justify-center">
                    <ProgressRing intake={totalIntake} goal={trueGoal} size={220} />
                </div>

                {/* Goal reached celebration */}
                <AnimatePresence>
                    {goalCelebrated && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -8 }}
                            className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-4 text-white shadow-lg"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">🎉</span>
                                    <div>
                                        <p className="font-extrabold text-sm">Goal reached!</p>
                                        <p className="text-white/80 text-xs mt-0.5">You hit {trueGoal}ml today. Great work.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setGoalCelebrated(false)}
                                    className="text-white/60 hover:text-white text-lg leading-none px-1"
                                    aria-label="Dismiss"
                                >
                                    x
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Over-goal nudge (static, shown when no celebration banner) */}
                {goalReached && !goalCelebrated && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                        <span className="text-xl">✅</span>
                        <div>
                            <p className="text-sm font-bold text-emerald-700">Daily goal complete</p>
                            <p className="text-xs text-emerald-600 mt-0.5">
                                {totalIntake - trueGoal > 0 ? `+${totalIntake - trueGoal}ml above your goal.` : 'You hit your target for today.'} Keep it up.
                            </p>
                        </div>
                    </div>
                )}

                {/* Quick Add */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Add</p>
                    <QuickAddButtons onLog={logDrink} />
                </div>

                {/* Biological Intelligence Banner */}
                <Link to="/HydrationIntelligence" className="block bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl p-4 text-white shadow-md hover:opacity-95 transition-opacity">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Your body needs more than just 8 glasses.</p>
                            <p className="text-white/75 text-xs mt-0.5">Here is why. View your biological report.</p>
                        </div>
                    </div>
                </Link>

                {/* Today's Timeline */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Today's Log</p>
                    <TodayTimeline logs={todayLogs} onDelete={deleteLog} />
                </div>
            </div>

            {showCustom && (
                <CustomAmountModal onLog={logDrink} onClose={() => setShowCustom(false)} />
            )}

            <HydrationBottomNav />
        </div>
    );
}