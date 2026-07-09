import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Thermometer, Snowflake, Moon, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, Legend
} from 'recharts';

const STORAGE_CONDITIONS = {
  room_temp:    { label: 'Room Temperature (25C)', multiplier: 1.0,  icon: Thermometer, color: '#ef4444' },
  refrigerated: { label: 'Refrigerated (4C)',      multiplier: 0.4,  icon: Snowflake,   color: '#3b82f6' },
  cool_dark:    { label: 'Cool Dark (15C, no light)', multiplier: 0.65, icon: Moon,      color: '#8b5cf6' },
};

function buildTimeline(rate, multiplier, maxMonths = 24) {
  const adjustedRate = rate * multiplier;
  const timeline = [];
  for (let m = 0; m <= maxMonths; m++) {
    timeline.push({
      month: m,
      active_percentage: Math.max(0, Math.round((100 - adjustedRate * m) * 10) / 10)
    });
  }
  return timeline;
}

function calcShelfLife(rate, multiplier, threshold = 90) {
  const adjustedRate = rate * multiplier;
  if (adjustedRate <= 0) return 24;
  return Math.min(24, Math.floor((100 - threshold) / adjustedRate));
}

function findCriticalPoints(timeline) {
  const thresholds = [
    { pct: 90, label: '10% potency loss', severity: 'low' },
    { pct: 75, label: '25% potency loss', severity: 'medium' },
    { pct: 50, label: '50% potency loss (critical)', severity: 'high' },
  ];
  const points = [];
  thresholds.forEach(({ pct, label, severity }) => {
    const point = timeline.find(p => p.active_percentage <= pct);
    if (point) points.push({ month: point.month, percentage: point.active_percentage, label, severity });
  });
  return points;
}

export default function ShelfLifePredictor({ degradationRate, baseShelfLifeMonths, criticalPoints: backendCriticalPoints, storageRecommendations }) {
  const [condition, setCondition] = useState('room_temp');

  const rate = degradationRate || 2.5;
  const config = STORAGE_CONDITIONS[condition];

  const timeline = useMemo(() => buildTimeline(rate, config.multiplier), [rate, config.multiplier]);
  const shelfLife = useMemo(() => calcShelfLife(rate, config.multiplier), [rate, config.multiplier]);
  const criticalPoints = useMemo(() => findCriticalPoints(timeline), [timeline]);

  // Build comparison data for all conditions
  const comparisonData = useMemo(() => {
    return timeline.map(point => {
      const entry = { month: point.month };
      Object.entries(STORAGE_CONDITIONS).forEach(([key, cfg]) => {
        const adjustedRate = rate * cfg.multiplier;
        entry[key] = Math.max(0, Math.round((100 - adjustedRate * point.month) * 10) / 10);
      });
      return entry;
    });
  }, [rate, timeline]);

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" /> Shelf-Life Predictor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Condition Selector */}
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Storage Condition</label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STORAGE_CONDITIONS).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                        {cfg.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Predicted Shelf Life</p>
            <p className="text-2xl font-bold" style={{ color: config.color }}>{shelfLife} months</p>
          </div>
        </div>

        {/* Degradation Timeline Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                label={{ value: 'Months', position: 'insideBottom', offset: -5, fontSize: 11 }}
                tick={{ fontSize: 10 }}
                domain={[0, 24]}
              />
              <YAxis
                label={{ value: 'Active %', angle: -90, position: 'insideLeft', fontSize: 11 }}
                tick={{ fontSize: 10 }}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(v) => `${v}%`}
                labelFormatter={(m) => `Month ${m}`}
                contentStyle={{ fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '90% threshold', fontSize: 9, position: 'right' }} />
              <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '50% critical', fontSize: 9, position: 'right' }} />
              {Object.entries(STORAGE_CONDITIONS).map(([key, cfg]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={cfg.color}
                  strokeWidth={key === condition ? 3 : 1.5}
                  strokeOpacity={key === condition ? 1 : 0.4}
                  dot={false}
                  name={cfg.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Critical Degradation Points */}
        {criticalPoints.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-600 uppercase">Critical Degradation Points ({config.label})</p>
            {criticalPoints.map((cp, i) => {
              const colors = cp.severity === 'high' ? 'bg-red-50 border-red-200 text-red-700' :
                             cp.severity === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                             'bg-emerald-50 border-emerald-200 text-emerald-700';
              return (
                <div key={i} className={`flex items-center gap-2 p-2 rounded-md border ${colors}`}>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs">Month {cp.month}: {cp.label} ({cp.percentage}% remaining)</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Storage Recommendations */}
        {storageRecommendations && (
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
            <p className="text-xs font-semibold text-teal-800 mb-1">Storage Recommendations</p>
            <p className="text-xs text-teal-700">{storageRecommendations}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}