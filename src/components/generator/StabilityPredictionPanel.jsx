import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Droplets, Shield, FlaskConical, TrendingDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';

export default function StabilityPredictionPanel({ formula, onStabilityResult }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Quick heuristic-based estimate (instant, no API call)
  const heuristicEstimate = useMemo(() => {
    const ingredients = formula.ingredients || [];
    const ingNames = ingredients.map((i) => (i.chemical_name || '').toLowerCase());

    const hasWater = ingNames.some((n) => n.includes('water') || n.includes('aqua'));
    const hasAntioxidant = ingNames.some((n) => n.includes('vitamin') || n.includes('tocopherol') || n.includes('antioxidant') || n.includes('rosemary'));
    const hasPreservative = ingNames.some((n) => n.includes('preservative') || n.includes('phenoxyethanol') || n.includes('benzyl alcohol') || n.includes('potassium sorbate') || n.includes('sodium benzoate'));
    const hasOil = ingNames.some((n) => n.includes('oil') || n.includes('butter') || n.includes('wax'));
    const hasEmulsifier = ingNames.some((n) => n.includes('emulsifier') || n.includes('polysorbate') || n.includes('cetearyl'));
    const hasAcid = ingNames.some((n) => n.includes('acid') || n.includes('aha') || n.includes('bha'));
    const hasFragrance = ingNames.some((n) => n.includes('fragrance') || n.includes('essential oil') || n.includes('parfum'));

    const factors = [
      { name: 'Water Content', status: hasWater ? 'High' : 'Low', impact: hasWater ? 'negative' : 'positive', icon: Droplets },
      { name: 'Preservative System', status: hasPreservative ? 'Present' : 'Absent', impact: hasPreservative ? 'positive' : hasWater ? 'critical' : 'neutral', icon: Shield },
      { name: 'Antioxidant', status: hasAntioxidant ? 'Present' : 'Absent', impact: hasAntioxidant ? 'positive' : 'neutral', icon: FlaskConical },
      { name: 'Oil Phase', status: hasOil ? 'Present' : 'None', impact: hasOil ? 'positive' : 'neutral', icon: Activity },
      { name: 'Emulsifier', status: hasEmulsifier ? 'Present' : 'Absent', impact: hasEmulsifier ? 'neutral' : hasWater && hasOil ? 'negative' : 'neutral', icon: Activity },
      { name: 'Acid Content', status: hasAcid ? 'Present' : 'None', impact: hasAcid ? 'negative' : 'neutral', icon: TrendingDown },
      { name: 'Fragrance', status: hasFragrance ? 'Present' : 'None', impact: hasFragrance ? 'negative' : 'neutral', icon: Activity },
    ];

    let months = 24;
    if (hasWater && !hasPreservative) months = 3;
    else if (hasWater && hasPreservative && !hasAntioxidant) months = 6;
    else if (hasWater && hasPreservative && hasAntioxidant) months = 12;
    else if (!hasWater) months = 18;

    // Fragrance can reduce shelf life slightly
    if (hasFragrance && months > 6) months -= 2;
    // Acid can reduce shelf life
    if (hasAcid && months > 6) months -= 1;

    return { months, factors, hasWater, hasPreservative, hasAntioxidant };
  }, [formula.ingredients]);

  // Chart data: shelf life comparison
  const chartData = useMemo(() => {
    const base = 24; // ideal
    const predicted = heuristicEstimate.months;
    return [
      { name: 'Ideal (24mo)', months: base, fill: '#10b981' },
      { name: 'Predicted', months: predicted, fill: predicted >= 12 ? '#02988C' : predicted >= 6 ? '#f59e0b' : '#ef4444' },
    ];
  }, [heuristicEstimate]);

  useEffect(() => {
    onStabilityResult?.(heuristicEstimate);
  }, [heuristicEstimate]);

  const runAIPrediction = async () => {
    if (!formula?.ingredients?.length) return;
    setLoading(true);

    const ingredientList = formula.ingredients.map((i) => `${i.chemical_name} (${i.percentage}%)`).join(', ');

    try {
      const result = await base44.functions.invoke('runConsumerLLM', {
        operation: 'stabilityPrediction',
        data: { ingredients: formula.ingredients }
      });
      setPrediction(result);
      onStabilityResult?.({ ...heuristicEstimate, aiPrediction: result });
    } catch (error) {
      console.error('AI stability prediction failed:', error);
    }
    setLoading(false);
  };

  const impactColor = {
    positive: 'bg-emerald-100 text-emerald-700',
    negative: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
    neutral: 'bg-slate-100 text-slate-600',
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" /> Stability Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shelf Life Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" domain={[0, 24]} tick={{ fontSize: 10 }} unit="mo" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(v) => `${v} months`} contentStyle={{ fontSize: 12 }} />
              <ReferenceLine x={12} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '12mo min', fontSize: 9, position: 'top' }} />
              <Bar dataKey="months" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stability Factors */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-600 uppercase">Stability Factors</p>
          {heuristicEstimate.factors.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-700">{f.name}</span>
                </div>
                <Badge className={`text-[10px] ${impactColor[f.impact]}`}>{f.status}</Badge>
              </div>
            );
          })}
        </div>

        {/* AI Deep Analysis */}
        {prediction ? (
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-teal-800">AI Predicted Shelf Life: {prediction.predicted_months} months</p>
              <Badge className={`text-[10px] ${prediction.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' : prediction.confidence === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                {prediction.confidence} confidence
              </Badge>
            </div>
            <div className="space-y-1">
              {prediction.degradation_risks?.map((r, i) => (
                <div key={i} className="text-xs text-slate-600">
                  <Badge className={`text-[9px] mr-1 ${r.risk === 'high' ? 'bg-red-100 text-red-700' : r.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{r.risk}</Badge>
                  <strong>{r.factor}</strong>: {r.mitigation}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 pt-1 border-t border-teal-100">
              <strong>Packaging:</strong> {prediction.packaging_recommendation}
            </p>
            <p className="text-xs text-slate-500">
              <strong>Storage:</strong> {prediction.storage_conditions}
            </p>
          </div>
        ) : (
          <button
            onClick={runAIPrediction}
            disabled={loading}
            className="w-full text-xs text-teal-600 hover:text-teal-700 font-medium py-2 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
          >
            {loading ? 'Analyzing stability...' : 'Run AI Stability Deep Analysis'}
          </button>
        )}
      </CardContent>
    </Card>
  );
}