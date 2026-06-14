import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Trash2, TrendingUp, Flame, Utensils, ShoppingCart, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GroceryListExport from './GroceryListExport';
import usePullToRefresh from '@/hooks/../hooks/usePullToRefresh';

const threatColors = {
  safe: 'bg-emerald-100 text-emerald-700',
  low: 'bg-blue-100 text-blue-700',
  moderate: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const novaColors = { 1: 'bg-emerald-500', 2: 'bg-lime-500', 3: 'bg-amber-500', 4: 'bg-red-500' };

export default function NutriScanHistory({ user }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGrocery, setShowGrocery] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await base44.entities.FoodScanHistory.list('-created_date', 50);
    setScans(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const { pullDistance, isRefreshing } = usePullToRefresh(load);

  const handleDelete = async (id) => {
    await base44.entities.FoodScanHistory.delete(id);
    setScans(prev => prev.filter(s => s.id !== id));
  };

  if (!user) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Utensils className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="font-semibold">Sign in to view your food history</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-teal-500" /></div>;
  }

  // Weekly stats
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekScans = scans.filter(s => new Date(s.created_date) >= oneWeekAgo);
  const weekCalories = weekScans.reduce((a, s) => a + (s.calories || 0), 0);
  const weekProtein = weekScans.reduce((a, s) => a + (s.protein_g || 0), 0);

  return (
    <div className="space-y-4">
      {/* Pull-to-refresh indicator */}
      {(isRefreshing || pullDistance > 20) && (
        <div className="flex justify-center py-2">
          <RefreshCw className={`w-5 h-5 text-teal-500 ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullDistance * 2}deg)` }} />
        </div>
      )}
      {showGrocery && (
        <GroceryListExport scans={weekScans.length > 0 ? weekScans : scans} onClose={() => setShowGrocery(false)} />
      )}

      {/* Weekly Summary Card */}
      {weekScans.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> This Week's Summary
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-orange-400">{Math.round(weekCalories)}</p>
              <p className="text-xs text-slate-400">Total kcal</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-blue-400">{Math.round(weekProtein)}g</p>
              <p className="text-xs text-slate-400">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-teal-400">{weekScans.length}</p>
              <p className="text-xs text-slate-400">Meals logged</p>
            </div>
          </div>
        </div>
      )}

      {/* Grocery List Export Button */}
      {scans.length > 0 && (
        <Button
          onClick={() => setShowGrocery(true)}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 text-white font-bold rounded-xl"
        >
          <ShoppingCart className="w-4 h-4 mr-2" /> Generate Weekly Grocery List
        </Button>
      )}

      {scans.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Utensils className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">No scans yet</p>
          <p className="text-sm mt-1">Scan your first food to start tracking</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{scans.length} scans total</p>
          {scans.map(scan => (
            <div key={scan.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${novaColors[scan.nova_score] || 'bg-slate-400'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                N{scan.nova_score || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{scan.food_name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-orange-600 font-medium flex items-center gap-0.5">
                    <Flame className="w-3 h-3" />{scan.calories} kcal
                  </span>
                  {scan.chemical_threat_level && (
                    <Badge className={`text-[10px] px-1.5 py-0 ${threatColors[scan.chemical_threat_level]}`}>
                      {scan.chemical_threat_level}
                    </Badge>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {format(new Date(scan.created_date), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(scan.id)}
                className="p-1.5 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}