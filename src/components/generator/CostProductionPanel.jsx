import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  Package,
  TrendingUp,
  Loader2,
  Download,
  Search,
  Boxes,
  ShoppingCart,
  Calculator,
  CheckCircle,
  History,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const fmt = (n) => (isFinite(n) ? `$${n.toFixed(2)}` : '$0.00');

// Convert any batch unit to grams
function toGrams(size, unit) {
  if (unit === 'g') return size;
  if (unit === 'kg') return size * 1000;
  if (unit === 'lb') return size * 453.592;
  if (unit === 'ml') return size;
  if (unit === 'L') return size * 1000;
  return size;
}

const PACKAGING_TYPES = [
  { key: 'bottle', label: 'Bottle' },
  { key: 'cap', label: 'Cap' },
  { key: 'label', label: 'Label' },
  { key: 'box', label: 'Box' },
];

const SCALE_PRESETS = [
  { label: '1x', multiplier: 1 },
  { label: '2x', multiplier: 2 },
  { label: '5x', multiplier: 5 },
  { label: '10x', multiplier: 10 },
];

const BATCH_SIZE_PRESETS = [
  { label: '50ml', ml: 50 },
  { label: '500ml', ml: 500 },
  { label: '1L', ml: 1000 },
  { label: '5L', ml: 5000 },
];

export default function CostProductionPanel({ formula, batchSize, batchUnit, costingData, onSaveCosting }) {
  const { toast } = useToast();

  // Ingredient cost state: { [ingredientName]: { price, unit, source, updated, sourceType } }
  const [ingredientCosts, setIngredientCosts] = useState({});
  const [fetchingPrice, setFetchingPrice] = useState(null);
  const [packaging, setPackaging] = useState({ bottle: '', cap: '', label: '', box: '' });
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const [customBatchMl, setCustomBatchMl] = useState(null);
  const [margin, setMargin] = useState('50');
  const [customMargin, setCustomMargin] = useState('');
  const [unitsPerBatch, setUnitsPerBatch] = useState('100');
  const [priceHistory, setPriceHistory] = useState([]);

  // Load saved costing data on mount
  useEffect(() => {
    if (costingData) {
      if (costingData.ingredientCosts) setIngredientCosts(costingData.ingredientCosts);
      if (costingData.packaging) setPackaging(costingData.packaging);
      if (costingData.margin) setMargin(String(costingData.margin));
      if (costingData.unitsPerBatch) setUnitsPerBatch(String(costingData.unitsPerBatch));
      if (costingData.priceHistory) setPriceHistory(costingData.priceHistory);
    }
  }, [costingData]);

  // Effective batch size in grams (respects scale + custom override)
  const effectiveBatchGrams = useMemo(() => {
    if (customBatchMl) return toGrams(customBatchMl, 'ml') * scaleMultiplier;
    return toGrams(batchSize, batchUnit) * scaleMultiplier;
  }, [batchSize, batchUnit, scaleMultiplier, customBatchMl]);

  // Cost per ingredient = (price / unit_grams) * grams_needed
  const ingredientCostBreakdown = useMemo(() => {
    return (formula.ingredients || []).map((ing, idx) => {
      const costEntry = ingredientCosts[ing.chemical_name] || {};
      const price = parseFloat(costEntry.price) || 0;
      const unitGrams = parseFloat(costEntry.unit) || 100; // default $/100g
      const gramsNeeded = effectiveBatchGrams * ((parseFloat(ing.percentage) || 0) / 100);
      const cost = (price / unitGrams) * gramsNeeded;
      return {
        name: ing.chemical_name,
        percentage: ing.percentage,
        gramsNeeded,
        price,
        unit: unitGrams,
        cost,
        source: costEntry.source || null,
        sourceType: costEntry.sourceType || null,
        updated: costEntry.updated || null,
      };
    });
  }, [formula.ingredients, ingredientCosts, effectiveBatchGrams]);

  const totalIngredientCost = useMemo(
    () => ingredientCostBreakdown.reduce((s, i) => s + i.cost, 0),
    [ingredientCostBreakdown]
  );

  const totalPackagingCost = useMemo(() => {
    return Object.values(packaging).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  }, [packaging]);

  const totalBatchCost = totalIngredientCost + totalPackagingCost;

  // Units per batch, how many finished product units this batch produces
  const effectiveUnits = parseInt(unitsPerBatch) || 1;
  const costPerUnit = totalBatchCost / effectiveUnits;

  // Retail price calculation
  const effectiveMargin = customMargin ? parseFloat(customMargin) / 100 : parseFloat(margin) / 100;
  const retailPrice = effectiveMargin > 0 && effectiveMargin < 1 ? costPerUnit / (1 - effectiveMargin) : costPerUnit * 1.5;
  const retailLow = costPerUnit * 1.25;
  const retailHigh = costPerUnit * 2.0;

  // Production & profit simulator
  const totalRevenue = retailPrice * effectiveUnits;
  const grossProfit = totalRevenue - totalBatchCost;
  const breakEvenUnits = costPerUnit > 0 ? Math.ceil(totalBatchCost / retailPrice) : 0;

  // Fetch price estimate from LLM
  const handleFetchPrice = async (ingredientName) => {
    setFetchingPrice(ingredientName);
    try {
      const result = await base44.functions.invoke('runConsumerLLM', {
        operation: 'ingredientCost',
        data: { ingredientName }
      });

      const newEntry = {
        price: result.price_per_100g || 0,
        unit: 100,
        source: result.supplier || 'AI Estimate',
        sourceType: result.confidence || 'medium',
        updated: new Date().toISOString(),
      };

      setIngredientCosts((prev) => {
        const updated = { ...prev, [ingredientName]: newEntry };
        // Track price history
        const historyEntry = {
          ingredient: ingredientName,
          price: newEntry.price,
          source: newEntry.source,
          date: newEntry.updated,
        };
        setPriceHistory((prevHist) => [historyEntry, ...prevHist].slice(0, 50));
        return updated;
      });

      toast({ title: 'Price fetched', description: `${ingredientName}: ${fmt(newEntry.price)} / 100g from ${newEntry.source}` });
    } catch {
      toast({ title: 'Fetch failed', description: 'Could not fetch price. Enter manually.', variant: 'destructive' });
    } finally {
      setFetchingPrice(null);
    }
  };

  const handleManualPriceChange = (ingredientName, field, value) => {
    setIngredientCosts((prev) => ({
      ...prev,
      [ingredientName]: {
        ...(prev[ingredientName] || { unit: 100 }),
        [field]: value,
        source: field === 'price' ? (prev[ingredientName]?.source || 'Manual entry') : (prev[ingredientName]?.source || 'Manual entry'),
        sourceType: 'manual',
        updated: new Date().toISOString(),
      },
    }));
  };

  const handleSaveCosting = async () => {
    const data = {
      ingredientCosts,
      packaging,
      margin: effectiveMargin * 100,
      unitsPerBatch: effectiveUnits,
      priceHistory,
      savedAt: new Date().toISOString(),
    };
    if (onSaveCosting) {
      await onSaveCosting(data);
    }
    toast({ title: 'Costing saved', description: 'Cost assumptions saved with this formula.' });
  };

  const handleExportPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const rows = ingredientCostBreakdown
      .map(
        (i) => `<tr><td>${i.name}</td><td>${i.percentage}%</td><td>${i.gramsNeeded.toFixed(1)}g</td><td>${fmt(i.price)}/${i.unit}g</td><td>${fmt(i.cost)}</td></tr>`
      )
      .join('');

    win.document.write(`
      <html><head><title>Costing Sheet - ${formula.name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
        h1 { color: #007850; } h2 { color: #0f172a; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f0fdfa; color: #007850; font-weight: 700; }
        .summary { background: #f8fafb; padding: 20px; border-radius: 12px; margin: 15px 0; }
        .summary div { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .total { font-size: 18px; font-weight: 700; color: #007850; border-top: 2px solid #007850; padding-top: 10px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
      </style></head><body>
      <h1>Cost & Production Sheet</h1>
      <p><strong>Formula:</strong> ${formula.name} | <strong>Batch:</strong> ${effectiveBatchGrams.toFixed(0)}g (${scaleMultiplier}x scale)</p>

      <h2>Ingredient Costs</h2>
      <table><thead><tr><th>Ingredient</th><th>%</th><th>Amount</th><th>Price</th><th>Cost</th></tr></thead>
      <tbody>${rows}</tbody></table>

      <div class="summary">
        <div><span>Total Ingredient Cost</span><span>${fmt(totalIngredientCost)}</span></div>
        <div><span>Total Packaging Cost</span><span>${fmt(totalPackagingCost)}</span></div>
        <div class="total"><span>Total Batch Cost</span><span>${fmt(totalBatchCost)}</span></div>
        <div><span>Units per Batch</span><span>${effectiveUnits}</span></div>
        <div><span>Cost per Unit</span><span>${fmt(costPerUnit)}</span></div>
      </div>

      <h2>Retail Pricing</h2>
      <div class="summary">
        <div><span>Margin</span><span>${(effectiveMargin * 100).toFixed(0)}%</span></div>
        <div><span>Suggested Retail Price</span><span>${fmt(retailPrice)}</span></div>
        <div><span>Price Range</span><span>${fmt(retailLow)} - ${fmt(retailHigh)}</span></div>
      </div>

      <h2>Production Simulator</h2>
      <div class="summary">
        <div><span>Revenue (${effectiveUnits} units @ ${fmt(retailPrice)})</span><span>${fmt(totalRevenue)}</span></div>
        <div><span>Total Cost</span><span>${fmt(totalBatchCost)}</span></div>
        <div><span>Gross Profit</span><span>${fmt(grossProfit)}</span></div>
        <div><span>Break-even Units</span><span>${breakEvenUnits}</span></div>
      </div>

      <p style="margin-top:40px;font-size:11px;color:#94a3b8;">Generated by Suttain Formula Generator on ${new Date().toLocaleDateString()}</p>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div className="space-y-6">
      {/* ── Component 1: Ingredient Cost Lookup ── */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-teal-600" />
            Ingredient Cost Lookup
          </CardTitle>
          <p className="text-xs text-slate-500">Enter supplier prices or fetch estimates. Cost = (price / unit) x amount needed.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {ingredientCostBreakdown.map((ing, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{ing.name}</p>
                  <p className="text-xs text-slate-500">
                    {ing.percentage}% | {ing.gramsNeeded.toFixed(1)}g needed | Cost: <strong className="text-teal-700">{fmt(ing.cost)}</strong>
                  </p>
                </div>
                {ing.source && (
                  <Badge
                    className={`text-[10px] flex-shrink-0 ml-2 ${
                      ing.sourceType === 'high'
                        ? 'bg-emerald-100 text-emerald-700'
                        : ing.sourceType === 'manual'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {ing.sourceType === 'manual' ? 'Manual' : ing.sourceType === 'high' ? 'High confidence' : 'Estimate'}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={ingredientCosts[ing.name]?.price || ''}
                    onChange={(e) => handleManualPriceChange(ing.name, 'price', e.target.value)}
                    className="h-8 w-20 text-xs"
                  />
                  <span className="text-xs text-slate-400">/</span>
                  <Input
                    type="number"
                    step="1"
                    placeholder="100"
                    value={ingredientCosts[ing.name]?.unit || '100'}
                    onChange={(e) => handleManualPriceChange(ing.name, 'unit', e.target.value)}
                    className="h-8 w-16 text-xs"
                  />
                  <span className="text-xs text-slate-400">g</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  disabled={fetchingPrice === ing.name}
                  onClick={() => handleFetchPrice(ing.name)}
                >
                  {fetchingPrice === ing.name ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Fetching...</>
                  ) : (
                    <><Search className="w-3 h-3 mr-1" /> Fetch Price</>
                  )}
                </Button>
                {ing.source && (
                  <span className="text-[10px] text-slate-400">
                    {ing.source} {ing.updated ? `| ${new Date(ing.updated).toLocaleDateString()}` : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Component 2: Formula Cost Breakdown ── */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4 text-teal-600" />
            Formula Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Packaging inputs */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Packaging Costs (per unit)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PACKAGING_TYPES.map((pkg) => (
                <div key={pkg.key}>
                  <label className="text-[10px] text-slate-400 block mb-1">{pkg.label}</label>
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs text-slate-400">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={packaging[pkg.key]}
                      onChange={(e) => setPackaging({ ...packaging, [pkg.key]: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-teal-50 rounded-xl p-4 space-y-2 border border-teal-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Ingredient Cost</span>
              <span className="font-semibold text-slate-800">{fmt(totalIngredientCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Packaging Cost</span>
              <span className="font-semibold text-slate-800">{fmt(totalPackagingCost)}</span>
            </div>
            <div className="flex justify-between text-base border-t border-teal-300 pt-2">
              <span className="font-bold text-slate-800">Total Batch Cost</span>
              <span className="font-bold text-teal-700">{fmt(totalBatchCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Units per Batch</span>
              <Input
                type="number"
                value={unitsPerBatch}
                onChange={(e) => setUnitsPerBatch(e.target.value)}
                className="h-7 w-20 text-xs text-right"
              />
            </div>
            <div className="flex justify-between text-lg border-t border-teal-300 pt-2">
              <span className="font-bold text-slate-800">Cost per Unit</span>
              <span className="font-extrabold text-teal-700">{fmt(costPerUnit)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Component 3: Scale Slider ── */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Boxes className="w-4 h-4 text-teal-600" />
            Batch Scale
          </CardTitle>
          <p className="text-xs text-slate-500">
            Current: {effectiveBatchGrams.toFixed(0)}g ({(effectiveBatchGrams / 1000).toFixed(2)}kg)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scale multiplier buttons */}
          <div className="flex flex-wrap gap-2">
            {SCALE_PRESETS.map((s) => (
              <button
                key={s.label}
                onClick={() => { setScaleMultiplier(s.multiplier); setCustomBatchMl(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  scaleMultiplier === s.multiplier && !customBatchMl
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                }`}
              >
                {s.label}
              </button>
            ))}
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs text-slate-400">Custom:</span>
              {BATCH_SIZE_PRESETS.map((b) => (
                <button
                  key={b.label}
                  onClick={() => setCustomBatchMl(b.ml)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    customBatchMl === b.ml
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-violet-300'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={scaleMultiplier}
              onChange={(e) => { setScaleMultiplier(parseFloat(e.target.value)); setCustomBatchMl(null); }}
              className="w-full accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1x</span><span>5x</span><span>10x</span>
            </div>
          </div>

          {/* Live cost update */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-600">Total Cost at {scaleMultiplier}x scale</span>
            <span className="text-lg font-bold text-teal-700">{fmt(totalBatchCost)}</span>
          </div>
        </CardContent>
      </Card>

      {/* ── Component 4: Retail Price Calculator ── */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            Retail Price Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Desired Margin:</span>
            {['25', '50', '100'].map((m) => (
              <button
                key={m}
                onClick={() => { setMargin(m); setCustomMargin(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  margin === m && !customMargin
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                }`}
              >
                {m}%
              </button>
            ))}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400">Custom:</span>
              <Input
                type="number"
                placeholder="%"
                value={customMargin}
                onChange={(e) => setCustomMargin(e.target.value)}
                className="h-8 w-16 text-xs"
              />
              <span className="text-xs text-slate-400">%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-teal-50 rounded-xl p-4 text-center border border-teal-200">
              <p className="text-xs text-slate-500 mb-1">Cost per Unit</p>
              <p className="text-xl font-bold text-slate-800">{fmt(costPerUnit)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-300">
              <p className="text-xs text-slate-500 mb-1">Suggested Retail</p>
              <p className="text-2xl font-extrabold text-emerald-700">{fmt(retailPrice)}</p>
            </div>
            <div className="bg-violet-50 rounded-xl p-4 text-center border border-violet-200">
              <p className="text-xs text-slate-500 mb-1">Price Range</p>
              <p className="text-sm font-bold text-violet-700">{fmt(retailLow)} - {fmt(retailHigh)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Component 5: Production & Profit Simulator ── */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-teal-600" />
            Production & Profit Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-[10px] text-slate-400 mb-1">Total Cost</p>
              <p className="text-lg font-bold text-slate-800">{fmt(totalBatchCost)}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-[10px] text-slate-400 mb-1">Revenue ({effectiveUnits} units)</p>
              <p className="text-lg font-bold text-blue-700">{fmt(totalRevenue)}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <p className="text-[10px] text-slate-400 mb-1">Gross Profit</p>
              <p className={`text-lg font-bold ${grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{fmt(grossProfit)}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <p className="text-[10px] text-slate-400 mb-1">Break-even Units</p>
              <p className="text-lg font-bold text-amber-700">{breakEvenUnits}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handleSaveCosting} variant="outline" size="sm" className="border-teal-300 text-teal-700 hover:bg-teal-50">
              <CheckCircle className="w-4 h-4 mr-1.5" /> Save Costing
            </Button>
            <Button onClick={handleExportPDF} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
              <Download className="w-4 h-4 mr-1.5" /> Export Costing Sheet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Price Update History ── */}
      {priceHistory.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              Supplier Price Update History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {priceHistory.slice(0, 15).map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700 truncate">{entry.ingredient}</span>
                  <span className="text-slate-500">{entry.source}</span>
                  <span className="font-semibold text-teal-700">{fmt(entry.price)}/100g</span>
                  <span className="text-slate-400">{new Date(entry.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}