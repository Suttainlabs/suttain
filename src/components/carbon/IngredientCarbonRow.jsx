import React from 'react';
import { Leaf, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const RISK_COLOR = {
  low: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  high: 'text-red-600 bg-red-50 border-red-200',
};

export default function IngredientCarbonRow({ ingredient, onRemove, onQuantityChange }) {
  const risk = ingredient.carbon_intensity > 5 ? 'high' : ingredient.carbon_intensity > 2 ? 'medium' : 'low';
  const totalKg = ((ingredient.quantity_kg || 0) * (ingredient.carbon_intensity || 0)).toFixed(2);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-800 text-sm">{ingredient.name}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', RISK_COLOR[risk])}>
            {ingredient.carbon_intensity?.toFixed(1)} kg CO2e/kg
          </span>
          {risk === 'high' && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
        </div>
        {ingredient.category && (
          <p className="text-xs text-slate-400 mt-0.5">{ingredient.category}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              step="0.1"
              value={ingredient.quantity_kg}
              onChange={e => onQuantityChange(ingredient.id, parseFloat(e.target.value) || 0)}
              className="w-20 text-right px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#02988C]"
            />
            <span className="text-xs text-slate-400">kg</span>
          </div>
          <span className="text-xs text-slate-500 mt-0.5">{totalKg} kg CO2e</span>
        </div>
        <button onClick={() => onRemove(ingredient.id)} className="p-1.5 text-slate-300 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}