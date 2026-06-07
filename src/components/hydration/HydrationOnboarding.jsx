import { useState } from 'react';
import { ChevronRight, Droplets, Activity, Thermometer, Brain } from 'lucide-react';

const ACTIVITY_OPTIONS = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', bonus: 0 },
    { value: 'light', label: 'Light', desc: '1-3 days exercise per week', bonus: 150 },
    { value: 'moderate', label: 'Moderate', desc: '3-5 days per week', bonus: 300 },
    { value: 'active', label: 'Active', desc: '6-7 days per week', bonus: 500 },
    { value: 'very_active', label: 'Very Active', desc: 'Hard daily exercise or physical job', bonus: 700 },
];

const CLIMATE_OPTIONS = [
    { value: 'cool', label: 'Cool', desc: 'Below 15°C / 59°F', bonus: 0 },
    { value: 'moderate', label: 'Moderate', desc: '15-25°C / 59-77°F', bonus: 100 },
    { value: 'hot', label: 'Hot', desc: '25-35°C / 77-95°F', bonus: 300 },
    { value: 'humid', label: 'Humid', desc: 'High humidity environment', bonus: 250 },
];

function calcGoal(weight, activity, climate) {
    const base = weight * 35;
    const actBonus = ACTIVITY_OPTIONS.find(a => a.value === activity)?.bonus || 0;
    const climBonus = CLIMATE_OPTIONS.find(c => c.value === climate)?.bonus || 0;
    return Math.round(base + actBonus + climBonus);
}

export default function HydrationOnboarding({ onComplete }) {
    const [step, setStep] = useState(1);
    const [weight, setWeight] = useState('');
    const [activity, setActivity] = useState('');
    const [climate, setClimate] = useState('');
    const [biologicalMode, setBiologicalMode] = useState(true);
    const [saving, setSaving] = useState(false);

    const goal = weight && activity && climate ? calcGoal(parseFloat(weight), activity, climate) : null;

    const handleFinish = async () => {
        setSaving(true);
        const base_goal_ml = calcGoal(parseFloat(weight), activity, climate);
        await onComplete({ weight_kg: parseFloat(weight), activity_level: activity, climate, biological_mode: biologicalMode, base_goal_ml, onboarding_complete: true, current_streak: 0, longest_streak: 0 });
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Droplets className="w-8 h-8 text-teal-600" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Hydration Intelligence</h1>
                    <p className="text-slate-500 text-sm mt-1">Let's personalise your plan</p>
                    <div className="flex justify-center gap-2 mt-4">
                        {[1,2,3,4].map(s => (
                            <div key={s} className={`w-2 h-2 rounded-full transition-all ${s === step ? 'bg-teal-500 w-6' : s < step ? 'bg-teal-300' : 'bg-slate-200'}`} />
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6">
                    {step === 1 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-teal-500" />
                                <h2 className="text-lg font-bold text-slate-800">Your Weight</h2>
                            </div>
                            <p className="text-slate-500 text-sm mb-4">We use this to calculate your base hydration requirement (35ml per kg).</p>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                    placeholder="e.g. 70"
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-2xl font-bold text-center text-slate-800 focus:border-teal-400 focus:outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">kg</span>
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!weight || parseFloat(weight) < 20 || parseFloat(weight) > 300}
                                className="w-full mt-5 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                Continue <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-teal-500" />
                                <h2 className="text-lg font-bold text-slate-800">Activity Level</h2>
                            </div>
                            <div className="space-y-2">
                                {ACTIVITY_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setActivity(opt.value)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left
                                            ${activity === opt.value ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}
                                    >
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{opt.label}</p>
                                            <p className="text-xs text-slate-500">{opt.desc}</p>
                                        </div>
                                        {opt.bonus > 0 && <span className="text-xs font-bold text-teal-600">+{opt.bonus}ml</span>}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!activity}
                                className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                Continue <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Thermometer className="w-5 h-5 text-teal-500" />
                                <h2 className="text-lg font-bold text-slate-800">Your Climate</h2>
                            </div>
                            <div className="space-y-2">
                                {CLIMATE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setClimate(opt.value)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left
                                            ${climate === opt.value ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}
                                    >
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{opt.label}</p>
                                            <p className="text-xs text-slate-500">{opt.desc}</p>
                                        </div>
                                        {opt.bonus > 0 && <span className="text-xs font-bold text-teal-600">+{opt.bonus}ml</span>}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setStep(4)}
                                disabled={!climate}
                                className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                Continue <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Brain className="w-5 h-5 text-violet-500" />
                                <h2 className="text-lg font-bold text-slate-800">Biological Mode</h2>
                            </div>
                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                When enabled, Suttain connects your food scans and nutrition data to your hydration goal in real time. This is what makes your plan truly personal.
                            </p>
                            <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Enable Biological Mode</p>
                                        <p className="text-xs text-slate-500">Sync with your food and scan data</p>
                                    </div>
                                    <button
                                        onClick={() => setBiologicalMode(!biologicalMode)}
                                        className={`w-12 h-6 rounded-full transition-all relative ${biologicalMode ? 'bg-violet-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${biologicalMode ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                            {goal && (
                                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-4 text-center">
                                    <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider mb-1">Your Daily Goal</p>
                                    <p className="text-3xl font-extrabold text-teal-700">{goal}ml</p>
                                    <p className="text-xs text-teal-600 mt-1">{weight}kg x 35ml + activity & climate</p>
                                </div>
                            )}
                            <button
                                onClick={handleFinish}
                                disabled={saving}
                                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold py-3 rounded-xl transition-opacity disabled:opacity-50"
                            >
                                {saving ? 'Setting up...' : 'Start Tracking'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}