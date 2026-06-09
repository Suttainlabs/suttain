import { useState } from 'react';
import { Droplets, X } from 'lucide-react';
import { DRINK_LABELS, DRINK_COLORS } from './DrinkTypeIcon';
import { ozToMl } from './useHydrationUnit';

const DRINK_TYPES = Object.keys(DRINK_LABELS);

export default function CustomAmountModal({ onLog, onClose, unit = 'ml' }) {
    const [amount, setAmount] = useState('');
    const [drinkType, setDrinkType] = useState('water');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!val || val <= 0) return;
        const ml = unit === 'oz' ? ozToMl(val) : Math.round(val);
        if (ml < 10 || ml > 2000) return;
        setLoading(true);
        await onLog(ml, drinkType);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-slate-800">Custom Amount</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                            Amount ({unit})
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder={unit === 'oz' ? 'e.g. 12' : 'e.g. 400'}
                            min={unit === 'oz' ? '0.5' : '10'}
                            max={unit === 'oz' ? '68' : '2000'}
                            step={unit === 'oz' ? '0.5' : '10'}
                            autoFocus
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-xl font-bold text-slate-800 focus:border-teal-400 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Drink Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {DRINK_TYPES.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setDrinkType(type)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all
                                        ${drinkType === type ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-700'}`}
                                >
                                    <Droplets className={`w-4 h-4 ${DRINK_COLORS[type]}`} />
                                    {DRINK_LABELS[type]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !amount}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Logging...' : 'Log Drink'}
                    </button>
                </form>
            </div>
        </div>
    );
}