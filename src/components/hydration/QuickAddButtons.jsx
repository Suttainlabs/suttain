import { useState } from 'react';
import { Droplets } from 'lucide-react';
import { DRINK_LABELS, DRINK_COLORS } from './DrinkTypeIcon';
import { mlToOz } from './useHydrationUnit';

const AMOUNTS = [150, 250, 350, 500];
const DRINK_TYPES = Object.keys(DRINK_LABELS);

export default function QuickAddButtons({ onLog, disabled, unit = 'ml' }) {
    const [pendingAmount, setPendingAmount] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAmountClick = (ml) => {
        setPendingAmount(ml);
    };

    const handleDrinkSelect = async (type) => {
        if (!pendingAmount || loading) return;
        setLoading(true);
        await onLog(pendingAmount, type);
        setPendingAmount(null);
        setLoading(false);
    };

    return (
        <div>
            <div className="grid grid-cols-4 gap-2 mb-3">
                {AMOUNTS.map(ml => (
                    <button
                        key={ml}
                        onClick={() => handleAmountClick(ml)}
                        disabled={disabled || loading}
                        className={`flex flex-col items-center gap-1 py-3 px-1 rounded-2xl border-2 transition-all font-semibold text-sm
                            ${pendingAmount === ml
                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50'
                            }`}
                    >
                        <Droplets className={`w-5 h-5 ${pendingAmount === ml ? 'text-teal-500' : 'text-blue-400'}`} />
                        <span>{unit === 'oz' ? `${mlToOz(ml)} oz` : `${ml} ml`}</span>
                    </button>
                ))}
            </div>

            {pendingAmount && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        What are you drinking? ({unit === 'oz' ? `${mlToOz(pendingAmount)} oz` : `${pendingAmount} ml`})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {DRINK_TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => handleDrinkSelect(type)}
                                disabled={loading}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all
                                    border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-700`}
                            >
                                <Droplets className={`w-4 h-4 ${DRINK_COLORS[type]}`} />
                                {DRINK_LABELS[type]}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setPendingAmount(null)}
                        className="w-full mt-2 text-xs text-slate-400 hover:text-slate-600 py-1"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}