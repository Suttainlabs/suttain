import React from 'react';
import { motion } from 'framer-motion';
import { History, ImageOff, Trash2, Cloud, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';

const BarcodeHistory = ({ history, onSelect, onDelete }) => {
    if (!history || history.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 space-y-2">
                <History className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">No recent scans found.</p>
                <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <Cloud className="w-3.5 h-3.5" /> Scans are synced across all your devices
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-teal-600 mb-3 px-1">
                <Cloud className="w-3.5 h-3.5" />
                <span className="font-medium">Cloud-synced · {history.length} scan{history.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {history.map((item, index) => (
                    <motion.div
                        key={item.id}
                        className="w-full text-left p-3 rounded-lg flex items-center gap-3 border border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                    >
                        <button
                            className="flex items-center gap-3 flex-1 min-w-0"
                            onClick={() => onSelect(item.barcode)}
                        >
                            <div className="w-11 h-11 rounded-md bg-slate-100 flex-shrink-0 flex items-center justify-center border shadow-sm overflow-hidden">
                                {item.product_image ? (
                                    <img
                                        src={item.product_image}
                                        alt={item.product_name}
                                        className="w-full h-full object-contain p-1"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <ImageOff className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden text-left">
                                <p className="font-semibold text-slate-800 truncate text-sm">{item.product_name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-xs text-slate-400 font-mono">{item.barcode}</p>
                                    {item.created_date && (
                                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                                            <Clock className="w-2.5 h-2.5" />
                                            {formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}
                                        </span>
                                    )}
                                </div>
                                {item.ingredient_count > 0 && (
                                    <p className="text-[10px] text-slate-400">{item.ingredient_count} ingredients</p>
                                )}
                            </div>
                        </button>
                        {onDelete && (
                            <button
                                onClick={() => onDelete(item.id)}
                                className="p-1.5 rounded-md text-slate-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                title="Remove from history"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default BarcodeHistory;