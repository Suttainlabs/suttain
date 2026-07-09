import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, AlertTriangle, CheckCircle, Package, CalendarClock } from 'lucide-react';

const SAFE_RANGES = {
  // Common cosmetic ingredient safe concentration ranges
  'retinol': { min: 0.01, max: 1, unit: '%' },
  'niacinamide': { min: 1, max: 10, unit: '%' },
  'vitamin c': { min: 5, max: 20, unit: '%' },
  'hyaluronic acid': { min: 0.1, max: 2, unit: '%' },
  'salicylic acid': { min: 0.5, max: 2, unit: '%' },
  'glycolic acid': { min: 1, max: 10, unit: '%' },
  'benzyl alcohol': { min: 0, max: 1, unit: '%' },
  'phenoxyethanol': { min: 0.5, max: 1, unit: '%' },
};

const PRESETS = [
  { label: '100g', size: 100, unit: 'g' },
  { label: '500g', size: 500, unit: 'g' },
  { label: '1kg', size: 1, unit: 'kg' },
  { label: '5L', size: 5, unit: 'L' },
];

function toGrams(size, unit) {
  if (unit === 'g') return size;
  if (unit === 'kg') return size * 1000;
  if (unit === 'lb') return size * 453.592;
  if (unit === 'ml') return size;
  if (unit === 'L') return size * 1000;
  return size;
}

export default function BatchScalingPanel({ formula, batchSize, batchUnit, onBatchChange, onQuantitiesCalculated, onWarningsUpdate }) {
  const [size, setSize] = useState(batchSize || 100);
  const [unit, setUnit] = useState(batchUnit || 'g');

  const batchGrams = useMemo(() => toGrams(size, unit), [size, unit]);

  // Calculate per-ingredient quantities
  const quantities = useMemo(() => {
    return (formula.ingredients || []).map((ing, idx) => {
      const percentage = parseFloat(ing.percentage) || 0;
      const grams = batchGrams * (percentage / 100);
      const ingNameLower = (ing.chemical_name || '').toLowerCase();
      const safeRange = SAFE_RANGES[ingNameLower];
      let warning = null;

      if (safeRange && percentage > 0) {
        if (percentage > safeRange.max) {
          warning = `${ing.chemical_name} at ${percentage}% exceeds safe max of ${safeRange.max}${safeRange.unit}`;
        } else if (percentage < safeRange.min) {
          warning = `${ing.chemical_name} at ${percentage}% is below effective min of ${safeRange.min}${safeRange.unit}`;
        }
      }

      return {
        index: idx,
        name: ing.chemical_name,
        percentage,
        grams: grams.toFixed(2),
        safeRange,
        warning,
      };
    });
  }, [formula.ingredients, batchGrams]);

  const warnings = quantities.filter((q) => q.warning);

  // Notify parent of changes
  React.useEffect(() => {
    onBatchChange?.(size, unit);
    onQuantitiesCalculated?.(quantities, batchGrams);
    onWarningsUpdate?.(warnings);
  }, [size, unit, quantities, batchGrams, warnings]);

  // Estimate shelf life based on formula composition
  const estimatedShelfLife = useMemo(() => {
    const ingredients = formula.ingredients || [];
    const hasWater = ingredients.some((i) =>
      (i.chemical_name || '').toLowerCase().includes('water') ||
      (i.chemical_name || '').toLowerCase().includes('aqua')
    );
    const hasAntioxidant = ingredients.some((i) =>
      (i.chemical_name || '').toLowerCase().includes('vitamin') ||
      (i.chemical_name || '').toLowerCase().includes('antioxidant') ||
      (i.chemical_name || '').toLowerCase().includes('tocopherol')
    );
    const hasPreservative = ingredients.some((i) =>
      (i.chemical_name || '').toLowerCase().includes('preservative') ||
      (i.chemical_name || '').toLowerCase().includes('phenoxyethanol') ||
      (i.chemical_name || '').toLowerCase().includes('benzyl alcohol')
    );

    let months = 24;
    if (hasWater && !hasPreservative) months = 3;
    else if (hasWater && hasPreservative && !hasAntioxidant) months = 6;
    else if (hasWater && hasPreservative && hasAntioxidant) months = 12;
    else if (!hasWater) months = 18;

    return {
      months,
      factors: { hasWater, hasAntioxidant, hasPreservative },
      summary: hasWater
        ? !hasPreservative
          ? 'High water content without preservative — shelf life severely reduced to ~3 months'
          : !hasAntioxidant
          ? 'Water + preservative but no antioxidant — shelf life ~6 months (oxidation risk)'
          : 'Water + preservative + antioxidant — stable shelf life ~12 months'
        : 'Anhydrous formula — extended shelf life ~18-24 months',
    };
  }, [formula.ingredients]);

  const handlePreset = (preset) => {
    setSize(preset.size);
    setUnit(preset.unit);
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="w-5 h-5 text-teal-600" /> Batch Scaling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Batch Size Input */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Batch Size</label>
            <Input
              type="number"
              value={size}
              onChange={(e) => setSize(parseFloat(e.target.value) || 0)}
              className="text-sm"
              placeholder="e.g. 500"
            />
          </div>
          <div className="w-24">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Unit</label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">g</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="ml">mL</SelectItem>
                <SelectItem value="L">L</SelectItem>
                <SelectItem value="lb">lb</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1.5">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                size="sm"
                variant="outline"
                className="h-9 text-xs"
                onClick={() => handlePreset(p)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Concentration Warnings */}
        {warnings.length > 0 ? (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">Concentration Warnings ({warnings.length})</p>
            </div>
            <ul className="space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {w.warning}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <p className="text-sm text-emerald-700">All ingredient concentrations within safe ranges</p>
          </div>
        )}

        {/* Ingredient Quantities Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                <th className="text-left py-2 pr-3">Ingredient</th>
                <th className="text-right py-2 px-3">%</th>
                <th className="text-right py-2 px-3">Quantity</th>
                <th className="text-center py-2 pl-3">Safe Range</th>
              </tr>
            </thead>
            <tbody>
              {quantities.map((q) => (
                <tr key={q.index} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-medium text-slate-800">{q.name}</td>
                  <td className="text-right py-2 px-3 text-slate-600">{q.percentage}%</td>
                  <td className="text-right py-2 px-3 font-semibold text-teal-700">
                    {q.grams}g
                  </td>
                  <td className="text-center py-2 pl-3">
                    {q.safeRange ? (
                      <Badge className={`text-[10px] ${q.warning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {q.safeRange.min}-{q.safeRange.max}{q.safeRange.unit}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Shelf Life Estimate */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
          <CalendarClock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-800">Estimated Shelf Life: {estimatedShelfLife.months} months</p>
            <p className="text-xs text-slate-500 mt-0.5">{estimatedShelfLife.summary}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}