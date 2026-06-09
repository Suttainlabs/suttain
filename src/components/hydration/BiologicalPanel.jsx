import { AlertTriangle, Zap, FlaskConical, Wind, CheckCircle2 } from 'lucide-react';
import ProUpgradeCard from './ProUpgradeCard';
import { mlToOz } from './useHydrationUnit';

const adjToOz = (ml) => `${(ml / 29.5735).toFixed(1)} oz`;

function BioCard({ icon: Icon, color, bg, title, body, adj }) {
    return (
        <div className={`${bg} border rounded-2xl p-4`}>
            <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color.replace('text-', 'bg-').replace('-700', '-100')}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1">
                    <p className={`font-bold text-sm ${color} mb-1`}>{title}</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{body}</p>
                    {adj > 0 && (
                        <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-lg text-xs font-bold ${color} ${color.replace('text-', 'bg-').replace('-700', '-100')}`}>
                            +{adjToOz(adj)} added to your goal
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BiologicalPanel({ bioAdj, profile, trueGoal, isPro }) {
    if (!isPro) {
        return (
            <div className="space-y-4">
                <div className="text-center py-4">
                    <p className="text-slate-500 text-sm">Unlock biological hydration intelligence</p>
                </div>
                <ProUpgradeCard featureName="Biological Hydration Intelligence" />
            </div>
        );
    }

    if (!profile?.biological_mode) {
        return (
            <div className="bg-slate-50 rounded-2xl p-5 text-center">
                <p className="text-slate-500 text-sm">Biological Mode is disabled. Enable it in your profile settings to get personalised adjustments.</p>
            </div>
        );
    }

    const { cards = [], totalSodium = 0, avgInflammation = 0, avgChemical = 0, activity = 0, climate = 0 } = bioAdj || {};

    const activityLabel = { sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', active: 'Active', very_active: 'Very Active' }[profile?.activity_level] || 'Unknown';
    const climateLabel = { cool: 'Cool', moderate: 'Moderate', hot: 'Hot', humid: 'Humid' }[profile?.climate] || 'Unknown';

    return (
        <div className="space-y-3">
            {cards.find(c => c.type === 'sodium') && (
                <BioCard
                    icon={AlertTriangle}
                    color="text-amber-700"
                    bg="bg-amber-50 border-amber-200"
                    title="Sodium Load Detected"
                    body={`Your sodium intake today is ${Math.round(totalSodium)}mg. Your kidneys need extra water to process this load.`}
                    adj={cards.find(c => c.type === 'sodium')?.adj || 0}
                />
            )}
            {cards.find(c => c.type === 'inflammation') && (
                <BioCard
                    icon={Zap}
                    color="text-orange-700"
                    bg="bg-orange-50 border-orange-200"
                    title="Inflammatory Food Alert"
                    body="You consumed high inflammatory ingredients today. Increasing hydration supports your body's natural filtration response."
                    adj={cards.find(c => c.type === 'inflammation')?.adj || 0}
                />
            )}
            {cards.find(c => c.type === 'chemical') && (
                <BioCard
                    icon={FlaskConical}
                    color="text-rose-700"
                    bg="bg-rose-50 border-rose-200"
                    title="Chemical Load Warning"
                    body="Some of today's scanned products contained chemical additives that increase your body's processing demand. Staying well hydrated supports liver and kidney function."
                    adj={cards.find(c => c.type === 'chemical')?.adj || 0}
                />
            )}

            <BioCard
                icon={Wind}
                color="text-blue-700"
                bg="bg-blue-50 border-blue-200"
                title={`Activity & Climate: ${activityLabel} / ${climateLabel}`}
                body={`Your activity level and climate add to your baseline hydration requirement.`}
                adj={activity + climate}
            />

            {cards.length === 0 && activity === 0 && climate === 0 && (
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <p className="text-teal-700 text-sm font-medium">No biological adjustments needed today. Your food choices are clean.</p>
                </div>
            )}

            <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-4 text-white">
                <p className="text-sm font-semibold text-white/80 mb-1">Your True Hydration Goal Today</p>
                <p className="text-3xl font-extrabold">{mlToOz(trueGoal)} oz</p>
                <p className="text-sm text-white/70 mt-1">
                    Based on what you ate and scanned today, your biological adjustments have been applied automatically.
                </p>
            </div>
        </div>
    );
}