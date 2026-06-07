import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import DrinkTypeIcon, { DRINK_LABELS } from './DrinkTypeIcon';

export default function TodayTimeline({ logs, onDelete }) {
    if (!logs.length) {
        return (
            <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No drinks logged today yet.</p>
                <p className="text-xs mt-1">Tap a quick-add button above to get started.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {logs.map(log => (
                <div key={log.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <DrinkTypeIcon type={log.drink_type} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">{log.amount_ml}ml</p>
                        <p className="text-xs text-slate-400">
                            {DRINK_LABELS[log.drink_type] || 'Water'} &middot; {log.logged_at ? format(new Date(log.logged_at), 'h:mm a') : ''}
                        </p>
                    </div>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(log.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}