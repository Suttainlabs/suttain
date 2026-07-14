import React, { useState } from 'react';
import { Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { suttainNutrition } from '@/functions/suttainNutrition';
import { LoadingState, ErrorState, SourceLabel, DataRow } from '@/components/shared/FunctionResult';

export default function UsdaNutritionPanel() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(null); setSearchResults(null); setSelectedFood(null);
    try {
      const res = await suttainNutrition({ query: query.trim() });
      if (res.error) throw new Error(res.error);
      setSearchResults(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const selectFood = async (fdcId) => {
    setDetailLoading(true); setError(null);
    try {
      const res = await suttainNutrition({ fdc_id: fdcId });
      if (res.error) throw new Error(res.error);
      setSelectedFood(res);
    } catch (e) { setError(e.message); }
    finally { setDetailLoading(false); }
  };

  const n = selectedFood?.nutrition_per_100g;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-4 h-4 text-[#02988C]" />
        <h3 className="font-bold text-slate-900 text-sm">USDA Nutrition Lookup</h3>
      </div>
      <p className="text-xs text-slate-500 mb-3">Search the USDA FoodData Central database for authoritative per-100g nutrition data.</p>

      {!selectedFood && (
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="e.g. apple, chicken breast, oats"
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]"
          />
          <button onClick={search} disabled={loading || !query.trim()}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #007850, #02988C)' }}>
            Search
          </button>
        </div>
      )}

      {loading && <LoadingState label="Searching USDA FoodData Central..." />}
      {detailLoading && <LoadingState label="Fetching nutrition details..." />}
      {error && <ErrorState message={error} />}

      {searchResults && !selectedFood && !detailLoading && (
        <div className="mt-4">
          <SourceLabel source={searchResults.source} />
          {searchResults.results && searchResults.results.length > 0 ? (
            <div className="mt-3 space-y-2">
              {searchResults.results.map((f, i) => (
                <button key={i} onClick={() => selectFood(f.fdc_id)}
                  className="w-full text-left p-3 border border-slate-200 rounded-lg hover:border-[#007850] hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{f.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {f.brand && <span className="text-xs text-slate-400">{f.brand}</span>}
                        <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{f.data_type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
                      {f.kcal != null && <span>{Math.round(f.kcal)} kcal</span>}
                      {f.protein_g != null && <span>{Math.round(f.protein_g)}p</span>}
                      {f.carbs_g != null && <span>{Math.round(f.carbs_g)}c</span>}
                      {f.fat_g != null && <span>{Math.round(f.fat_g)}f</span>}
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No foods found for this search.</p>
          )}
        </div>
      )}

      {selectedFood && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <SourceLabel source={selectedFood.source} />
            <button onClick={() => setSelectedFood(null)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700">
              <ArrowLeft className="w-3 h-3" /> Back to results
            </button>
          </div>
          <p className="text-sm font-bold text-slate-800 mb-3">{selectedFood.description}</p>
          {n && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <DataRow label="Energy" value={n.energy_kcal != null ? Math.round(n.energy_kcal) : null} unit="kcal" />
              <DataRow label="Protein" value={n.protein_g != null ? n.protein_g.toFixed(1) : null} unit="g" />
              <DataRow label="Carbohydrates" value={n.carbs_g != null ? n.carbs_g.toFixed(1) : null} unit="g" />
              <DataRow label="Sugars" value={n.sugars_g != null ? n.sugars_g.toFixed(1) : null} unit="g" />
              <DataRow label="Fat" value={n.fat_g != null ? n.fat_g.toFixed(1) : null} unit="g" />
              <DataRow label="Fiber" value={n.fiber_g != null ? n.fiber_g.toFixed(1) : null} unit="g" />
              <DataRow label="Sodium" value={n.sodium_mg != null ? Math.round(n.sodium_mg) : null} unit="mg" />
              <DataRow label="Calcium" value={n.calcium_mg != null ? Math.round(n.calcium_mg) : null} unit="mg" />
              <DataRow label="Iron" value={n.iron_mg != null ? n.iron_mg.toFixed(2) : null} unit="mg" />
            </div>
          )}
          {selectedFood.ingredients && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 mb-1">Ingredients</p>
              <p className="text-sm text-slate-700">{selectedFood.ingredients}</p>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-3">All values per 100g</p>
        </div>
      )}
    </div>
  );
}