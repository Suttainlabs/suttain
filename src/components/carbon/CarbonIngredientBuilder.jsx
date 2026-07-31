import React, { useState } from 'react';
import { Loader2, Plus, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import IngredientCarbonRow from '@/components/carbon/IngredientCarbonRow';
import { CARBON_LIBRARY, MARKETS } from '@/components/carbon/carbonData';

export default function CarbonIngredientBuilder({
  ingredients, onAdd, onRemove, onQuantityChange, addLoading,
  unitsPerMonth, setUnitsPerMonth, carbonPrice, setCarbonPrice,
  selectedMarkets, toggleMarket,
}) {
  const [newName, setNewName] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const submit = () => {
    setSuggestions([]);
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-[#02988C]" /> Ingredients
        </h2>

        <div className="divide-y divide-slate-50">
          {ingredients.map(ing => (
            <IngredientCarbonRow key={ing.id} ingredient={ing} onRemove={onRemove} onQuantityChange={onQuantityChange} />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <div className="flex-1 relative">
            <input
              value={newName}
              onChange={e => {
                const val = e.target.value;
                setNewName(val);
                setSuggestions(val.trim().length >= 2
                  ? Object.keys(CARBON_LIBRARY).filter(k => k.includes(val.toLowerCase())).slice(0, 6)
                  : []);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') submit();
                if (e.key === 'Escape') setSuggestions([]);
              }}
              onBlur={() => setTimeout(() => setSuggestions([]), 150)}
              placeholder="Add ingredient..."
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02988C]"
              disabled={addLoading}
            />
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onMouseDown={() => { setNewName(s.replace(/\b\w/g, c => c.toUpperCase())); setSuggestions([]); }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-[#F0FAF5] hover:text-[#02988C] flex items-center justify-between group transition-colors"
                  >
                    <span className="capitalize">{s}</span>
                    <span className="text-xs text-slate-500 group-hover:text-[#02988C]">{CARBON_LIBRARY[s]} kg CO2e/kg</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={submit}
            disabled={addLoading || !newName.trim()}
            className={cn('px-3 py-2 rounded-lg text-white flex items-center gap-1 text-sm font-semibold transition-all', newName.trim() && !addLoading ? 'bg-[#02988C] hover:bg-[#027d72]' : 'bg-slate-200 text-slate-400 cursor-not-allowed')}
          >
            {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Unknown ingredients are estimated via AI automatically.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-bold text-slate-800 mb-1">Configuration</h2>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Units per Month</label>
          <input
            type="number" min="1"
            value={unitsPerMonth}
            onChange={e => setUnitsPerMonth(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#02988C]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Carbon Price ($/tonne)</label>
          <div className="flex items-center gap-3">
            <input
              type="range" min="10" max="200" step="5"
              value={carbonPrice}
              onChange={e => setCarbonPrice(parseInt(e.target.value))}
              className="flex-1 accent-[#02988C]"
            />
            <span className="text-sm font-bold text-slate-700 w-12 text-right">${carbonPrice}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">EU ETS ~$65 | UK ETS ~$55 | CA ~$45</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-2">Target Markets</label>
          <div className="flex flex-wrap gap-1.5">
            {MARKETS.map(m => (
              <button
                key={m.id}
                onClick={() => toggleMarket(m.id)}
                className={cn('px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all', selectedMarkets.includes(m.id) ? 'border-[#02988C] bg-[#F0FAF5] text-[#02988C]' : 'border-slate-200 text-slate-600 hover:border-[#02988C]/40')}
              >
                {m.name}
                {m.cbam && <span className="ml-1 text-amber-600 text-[9px]">CBAM</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}