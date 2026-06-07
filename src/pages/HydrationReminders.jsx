import { useState, useEffect, useContext } from 'react';
import { ChevronLeft, Bell, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthContext from '../components/auth/AuthContext';
import { useHydration } from '../components/hydration/useHydration';
import HydrationBottomNav from '../components/hydration/HydrationBottomNav';
import ProUpgradeCard from '../components/hydration/ProUpgradeCard';
import useTrialStatus from '../hooks/useTrialStatus';

const FREQ_OPTIONS = [
    { value: '30min', label: 'Every 30 minutes' },
    { value: '45min', label: 'Every 45 minutes' },
    { value: '60min', label: 'Every hour' },
    { value: '90min', label: 'Every 90 minutes' },
    { value: '120min', label: 'Every 2 hours' },
];

const STYLE_OPTIONS = [
    { value: 'gentle', label: 'Gentle nudge', preview: 'Time for a sip.' },
    { value: 'motivational', label: 'Motivational', preview: 'You are 3 glasses away from your goal. Keep going.' },
    { value: 'scientific', label: 'Scientific fact', preview: 'Your brain is 75% water. A 2% drop in hydration reduces focus by up to 20%.' },
    { value: 'biological', label: 'Biological alert', preview: 'Your sodium intake from lunch increases your filtration demand. Drink now.' },
];

export default function HydrationReminders() {
    const { user } = useContext(AuthContext);
    const { profile, saveProfile, totalIntake, trueGoal } = useHydration(user);
    const trialStatus = useTrialStatus(user);
    const isPro = trialStatus?.isPro || trialStatus?.isLifetime || trialStatus?.isTrialing;

    const [settings, setSettings] = useState({
        smart_reminders: true,
        reminder_start: '07:00',
        reminder_end: '22:00',
        reminder_frequency: '60min',
        pace_based_reminders: true,
        reminder_style: 'gentle',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (profile) {
            setSettings({
                smart_reminders: profile.smart_reminders ?? true,
                reminder_start: profile.reminder_start || '07:00',
                reminder_end: profile.reminder_end || '22:00',
                reminder_frequency: profile.reminder_frequency || '60min',
                pace_based_reminders: profile.pace_based_reminders ?? true,
                reminder_style: profile.reminder_style || 'gentle',
            });
        }
    }, [profile]);

    const pct = trueGoal > 0 ? totalIntake / trueGoal : 0;
    const freqMins = parseInt(settings.reminder_frequency) || 60;
    const adjustedMins = settings.pace_based_reminders && isPro
        ? pct < 0.5 ? Math.max(15, freqMins - 15) : pct > 0.8 ? freqMins + 20 : freqMins
        : freqMins;

    const handleSave = async () => {
        setSaving(true);
        await saveProfile(settings);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const update = (key, val) => setSettings(s => ({ ...s, [key]: val }));

    const currentStyle = STYLE_OPTIONS.find(s => s.value === settings.reminder_style);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 pb-28">
            <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-3 sticky top-0 z-20">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <Link to="/HydrationHome" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <h1 className="text-base font-bold text-slate-800">Reminder Settings</h1>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
                {/* Smart Reminders Toggle */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-teal-500" />
                            <span className="font-bold text-slate-800">Smart Reminders</span>
                        </div>
                        <button
                            onClick={() => update('smart_reminders', !settings.smart_reminders)}
                            className={`w-12 h-6 rounded-full transition-all relative ${settings.smart_reminders ? 'bg-teal-500' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${settings.smart_reminders ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                    <p className="text-sm text-slate-500">We will remind you based on your pace, not just the clock.</p>
                </div>

                {settings.smart_reminders && (
                    <>
                        {/* Reminder Window */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <span className="font-bold text-slate-800">Reminder Window</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Start Time</label>
                                    <input
                                        type="time"
                                        value={settings.reminder_start}
                                        onChange={e => update('reminder_start', e.target.value)}
                                        className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:border-teal-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">End Time</label>
                                    <input
                                        type="time"
                                        value={settings.reminder_end}
                                        onChange={e => update('reminder_end', e.target.value)}
                                        className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:border-teal-400 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Frequency */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                            <p className="font-bold text-slate-800 mb-3">Reminder Frequency</p>
                            <div className="space-y-2">
                                {FREQ_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => update('reminder_frequency', opt.value)}
                                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                                            ${settings.reminder_frequency === opt.value ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-700 hover:border-teal-300'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pace-Based Intelligence */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-violet-500" />
                                    <span className="font-bold text-slate-800">Pace-Based Intelligence</span>
                                </div>
                                {isPro ? (
                                    <button
                                        onClick={() => update('pace_based_reminders', !settings.pace_based_reminders)}
                                        className={`w-12 h-6 rounded-full transition-all relative ${settings.pace_based_reminders ? 'bg-violet-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${settings.pace_based_reminders ? 'left-7' : 'left-1'}`} />
                                    </button>
                                ) : <span className="text-xs bg-violet-100 text-violet-700 font-bold px-2 py-1 rounded-lg">Pro</span>}
                            </div>
                            <p className="text-sm text-slate-500 mb-3">Adjusts reminder frequency automatically based on your progress pace.</p>
                            {isPro && settings.pace_based_reminders && (
                                <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                                    <p className="text-sm text-teal-700 font-medium">
                                        At your current pace, your next reminder is in <strong>{adjustedMins} minutes</strong>.
                                    </p>
                                </div>
                            )}
                            {!isPro && <ProUpgradeCard featureName="Pace-Based Reminder Intelligence" />}
                        </div>

                        {/* Reminder Style */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                            <p className="font-bold text-slate-800 mb-3">Reminder Style</p>
                            <div className="space-y-2 mb-4">
                                {STYLE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => update('reminder_style', opt.value)}
                                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                                            ${settings.reminder_style === opt.value ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-700 hover:border-teal-300'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            {currentStyle && (
                                <div className="bg-slate-50 rounded-xl px-4 py-3 italic text-slate-600 text-sm border border-slate-200">
                                    "{currentStyle.preview}"
                                </div>
                            )}
                        </div>
                    </>
                )}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
                </button>
            </div>

            <HydrationBottomNav />
        </div>
    );
}