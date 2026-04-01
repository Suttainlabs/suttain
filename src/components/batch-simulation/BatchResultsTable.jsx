import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, AlertTriangle, CheckCircle, Loader2, ArrowUpDown } from 'lucide-react';
import { exportResultsToCSV } from '@/utils/csvParser';

const getRiskColor = (score) => {
  if (!score) return 'bg-slate-100 text-slate-700';
  if (score < 25) return 'bg-green-100 text-green-700';
  if (score < 50) return 'bg-yellow-100 text-yellow-700';
  if (score < 75) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
};

const HazardBadge = ({ symbol }) => {
  const colors = {
    toxic: 'bg-red-100 text-red-700',
    flammable: 'bg-orange-100 text-orange-700',
    corrosive: 'bg-purple-100 text-purple-700',
    irritant: 'bg-yellow-100 text-yellow-700',
    environmental: 'bg-green-100 text-green-700'
  };
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded ${colors[symbol] || 'bg-slate-100'}`}>
      {symbol}
    </span>
  );
};

export default function BatchResultsTable({ results, isRunning }) {
  const [sortKey, setSortKey] = useState('risk_score');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...results].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const completed = results.filter(r => !r.error && r.risk_score !== undefined).length;
  const avgRisk = completed > 0
    ? (results.filter(r => r.risk_score !== undefined).reduce((s, r) => s + r.risk_score, 0) / completed).toFixed(1)
    : 0;
  const riskyCombos = results.filter(r => r.risk_score > 70).length;

  return (
    <div className="space-y-6">
      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-slate-900">{results.length}</p>
            <p className="text-xs text-slate-500">Total Combinations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-slate-900">{completed}</p>
            <p className="text-xs text-slate-500">Analyzed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className={`text-2xl font-bold ${avgRisk > 70 ? 'text-red-600' : avgRisk > 50 ? 'text-orange-600' : 'text-green-600'}`}>
              {avgRisk}
            </p>
            <p className="text-xs text-slate-500">Avg Risk Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{riskyCombos}</p>
            <p className="text-xs text-slate-500">High Risk (>70)</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>Results</CardTitle>
          {!isRunning && results.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportResultsToCSV(results)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No simulations run yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {[
                      { key: 'name', label: 'Combination' },
                      { key: 'chemicals', label: 'Chemicals' },
                      { key: 'risk_score', label: 'Risk Score' },
                      { key: 'health_impact', label: 'Health' },
                      { key: 'environmental_impact', label: 'Env' },
                      { key: 'voc_level', label: 'VOC' },
                      { key: 'reactivity', label: 'Reactivity' },
                      { key: 'hazard_symbols', label: 'Hazards' }
                    ].map((col) => (
                      <th key={col.key} className="text-left px-4 py-3 font-semibold text-slate-700">
                        <button
                          onClick={() => handleSort(col.key)}
                          className="flex items-center gap-1 hover:text-slate-900"
                          type="button"
                        >
                          {col.label}
                          {sortKey === col.key && (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                    ))}
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((result, idx) => (
                    <motion.tr
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800">{result.name}</td>
                      <td className="px-4 py-3 text-slate-600">{result.chemicals.join(', ')}</td>
                      <td className="px-4 py-3">
                        {result.risk_score !== undefined ? (
                          <span className={`px-2.5 py-1 rounded font-bold text-xs ${getRiskColor(result.risk_score)}`}>
                            {result.risk_score}
                          </span>
                        ) : (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        )}
                      </td>
                      <td className="px-4 py-3">{result.health_impact ?? '-'}</td>
                      <td className="px-4 py-3">{result.environmental_impact ?? '-'}</td>
                      <td className="px-4 py-3">{result.voc_level ?? '-'}</td>
                      <td className="px-4 py-3">{result.reactivity ?? '-'}</td>
                      <td className="px-4 py-3">
                        {result.hazard_symbols ? (
                          <div className="flex flex-wrap gap-1">
                            {result.hazard_symbols.map(sym => (
                              <HazardBadge key={sym} symbol={sym} />
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {result.error ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : result.risk_score !== undefined ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}