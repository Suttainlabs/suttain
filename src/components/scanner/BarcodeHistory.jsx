import React from 'react';
import { motion } from 'framer-motion';
import { History, ImageOff } from 'lucide-react';

const BarcodeHistory = ({ history, onSelect }) => {
    if (!history || history.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <History className="w-8 h-8 mx-auto mb-2" />
                <p>No recent scans found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 -mr-2">
            {history.map((item, index) => (
                <motion.button
                    key={item.id}
                    onClick={() => onSelect(item.barcode)}
                    className="w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors hover:bg-slate-100 border border-slate-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <div className="w-12 h-12 rounded-md bg-white flex-shrink-0 flex items-center justify-center border shadow-sm">
                        {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain p-1" onError={(e) => e.currentTarget.style.display = 'none'} />
                        ) : (
                            <ImageOff className="w-6 h-6 text-slate-400" />
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-slate-800 truncate">{item.product_name}</p>
                        <p className="text-sm text-slate-500">{item.barcode}</p>
                    </div>
                </motion.button>
            ))}
        </div>
    );
};

export default BarcodeHistory;