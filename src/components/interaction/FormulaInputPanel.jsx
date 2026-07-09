import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Plus, X, FlaskConical, Loader2, Beaker, Upload } from 'lucide-react';

export default function FormulaInputPanel({ ingredients, onIngredientsChange, onAnalyze, loading }) {
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState('');
  const [recentFormulas, setRecentFormulas] = useState([]);
  const [loadingFormulas, setLoadingFormulas] = useState(false);

  useEffect(() => {
    loadRecentFormulas();
  }, []);

  const loadRecentFormulas = async () => {
    setLoadingFormulas(true);
    try {
      const formulas = await base44.entities.Formula.list('-created_date', 10);
      setRecentFormulas((formulas || []).filter(f => f.ingredients?.length));
    } catch (err) {
      console.error('Failed to load formulas:', err);
    }
    setLoadingFormulas(false);
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    onIngredientsChange([...ingredients, { name: name.trim(), percentage: parseFloat(percentage) || 0 }]);
    setName('');
    setPercentage('');
  };

  const handleRemove = (idx) => {
    onIngredientsChange(ingredients.filter((_, i) => i !== idx));
  };

  const handleLoadFormula = (formulaId) => {
    const formula = recentFormulas.find(f => f.id === formulaId);
    if (formula?.ingredients) {
      const loaded = formula.ingredients.map(item => {
        if (typeof item === 'string') return { name: item, percentage: 0 };
        return item;
      });
      onIngredientsChange(loaded);
    }
  };

  const totalPct = ingredients.reduce((sum, i) => sum + (i.percentage || 0), 0);
  const totalWeight = ingredients.reduce((sum, i) => sum + (i.percentage || 0), 0);

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-teal-600" /> Formula Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Load Recent Formula */}
        {recentFormulas.length > 0 && (
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Auto-populate from Recent Formulas</label>
            <Select onValueChange={handleLoadFormula}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select a saved formula..." />
              </SelectTrigger>
              <SelectContent>
                {recentFormulas.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Manual Entry */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Ingredient Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Glycerin"
              className="text-sm"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div className="w-20">
            <label className="text-xs font-medium text-slate-600 mb-1 block">%</label>
            <Input
              type="number"
              value={percentage}
              onChange={e => setPercentage(e.target.value)}
              placeholder="5"
              className="text-sm"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <Button size="sm" onClick={handleAdd} disabled={!name.trim()} className="h-9">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Ingredient List */}
        {ingredients.length > 0 && (
          <div className="space-y-1.5">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                  <Beaker className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-800 truncate">{ing.name}</span>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">{ing.percentage}%</Badge>
                </div>
                <button onClick={() => handleRemove(idx)} className="text-slate-400 hover:text-red-500 flex-shrink-0 ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Ingredients: <strong className="text-slate-700">{ingredients.length}</strong></span>
          <span>Total weight: <strong className={totalPct === 100 ? 'text-emerald-600' : 'text-amber-600'}>{totalPct}%</strong></span>
        </div>

        {/* Analyze Button */}
        <Button
          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          onClick={onAnalyze}
          disabled={loading || ingredients.length < 2}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Analyzing interactions...</>
          ) : (
            `Analyze Interactions (${ingredients.length} ingredients)`
          )}
        </Button>
        {ingredients.length < 2 && (
          <p className="text-xs text-center text-slate-400">Add at least 2 ingredients to analyze interactions</p>
        )}
      </CardContent>
    </Card>
  );
}