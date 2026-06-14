import { useContext } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthContext from '../components/auth/AuthContext';
import { useHydration } from '../components/hydration/useHydration';
import BiologicalPanel from '../components/hydration/BiologicalPanel';
import HydrationBottomNav from '../components/hydration/HydrationBottomNav';
import AuthGate from '../components/auth/AuthGate';
import useTrialStatus from '../hooks/useTrialStatus';

export default function HydrationIntelligence() {
    const { user } = useContext(AuthContext);
    const { profile, bioAdjustments, trueGoal, loading } = useHydration(user);
    const trialStatus = useTrialStatus(user);
    const isPro = trialStatus?.isPro || trialStatus?.isLifetime || trialStatus?.isTrialing;

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <AuthGate featureName="Biological Intelligence" featureDescription="See how your food affects your hydration needs." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/20 pb-24 lg:pb-8">
            <div className="bg-white sticky top-0 z-20">
                <div className="border-b border-slate-100 px-4 pt-4 pb-3">
                    <div className="flex items-center gap-3 max-w-lg mx-auto">
                        <Link to="/HydrationHome" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <h1 className="text-base font-bold text-slate-800">Biological Intelligence</h1>
                    </div>
                </div>
                <HydrationBottomNav />
            </div>

            <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                    <h2 className="text-lg font-bold text-slate-800 mb-1">Why your goal changes daily</h2>
                    <p className="text-sm text-slate-500 leading-relaxed mb-5">
                        Unlike a fixed 8-glasses recommendation, Suttain reads your actual food intake, sodium load, inflammatory ingredients, and chemical additives to calculate your real hydration need.
                    </p>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <BiologicalPanel
                            bioAdj={bioAdjustments}
                            profile={profile}
                            trueGoal={trueGoal}
                            isPro={isPro}
                        />
                    )}
                </div>
            </div>

        </div>
    );
}