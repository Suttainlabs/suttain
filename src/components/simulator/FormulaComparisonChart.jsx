import React, { useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2, ChevronDown, ChevronUp, Info, Plus, Trash2 } from 'lucide-react';

const VERSION_STORAGE_KEY = 'suttain_formula_versions';

function loadVersions() {
  try {
    const raw = localStorage.getItem(VERSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const METRICS = [
  { key: 'environmental_impact', label: 'Environmental Impact', color: '#10b981' },
  { key: 'health_impact', label: 'Health Impact', color: '#f59e0b' },
  { key: 'overall_risk', label: 'Overall Risk', color: '#ef4444' },
];

const COST_COLORS = ['#6366f1', '#0ea5e9', '#f43f5e', '#8b5cf6', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-bold text-slate-800 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function FormulaComparisonChart({ currentChemicals, currentMetrics }) {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeMetrics, setActiveMetrics] = useState(['environmental_impact', 'health_impact', 'overall_risk']);
  const [costEntries, setCostEntries] = useState([]);
  const [newCostLabel, setNewCostLabel] = useState('');
  const [newCostValue, setNewCostValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVersions(loadVersions());
    }
  }, [isOpen]);

  const toggleVersion = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const toggleMetric = (key) => {
    setActiveMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Build chart data: current run + selected saved versions
  const currentEntry = currentMetrics
    ? {
        name: 'Current Run',
        environmental_impact: currentMetrics.environmental_impact ?? 0,
        health_impact: currentMetrics.health_impact ?? 0,
        overall_risk: currentMetrics.overall_risk ?? 0,
      }
    : null;

  const selectedVersionData = versions
    .filter(v => selectedIds.includes(v.id))
    .map(v => ({
      name: v.label,
      environmental_impact: v.metrics.environmental_impact ?? 0,
      health_impact: v.metrics.health_impact ?? 0,
      overall_risk: v.metrics.overall_risk ?? 0,
    }));

  const impactChartData = currentEntry
    ? [currentEntry, ...selectedVersionData]
    : selectedVersionData;

  // Cost chart data (manually entered)
  const costChartData = costEntries.map(e => ({ name: e.label, cost: parseFloat(e.value) || 0 }));

  const addCostEntry = () => {
    if (!newCostLabel.trim() || !newCostValue) return;
    setCostEntries(prev => [...prev, { id: Date.now(), label: newCostLabel.trim(), value: newCostValue }]);
    setNewCostLabel('');
    setNewCostValue('');
  };

  const removeCostEntry = (id) => setCostEntries(prev => prev.filter(e => e.id !== id));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <BarChart2 className="w-5 h-5 text-teal-500" />
          <span className="font-semibold text-slate-800 text-sm">Formula Version Comparison Chart</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-5 py-5 space-y-6">

          {/* --- Environmental / Risk Chart --- */}
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-700">Environmental Impact vs Risk Scores</h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                {METRICS.map(m => (
                  <button
                    key={m.key}
                    onClick={() => toggleMetric(m.key)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                      activeMetrics.includes(m.key)
                        ? 'text-white border-transparent'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                    style={activeMetrics.includes(m.key) ? { backgroundColor: m.color, borderColor: m.color } : {}}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Version selector */}
            {versions.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="text-xs text-slate-400 font-medium pt-1">Compare with saved versions:</span>
                {versions.map(v => (
                  <button
                    key={v.id}
                    onClick={() => toggleVersion(v.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                      selectedIds.includes(v.id)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}

            {impactChartData.length === 0 ? (
              <div className="flex items-center justify-center h-40 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-center text-slate-400">
                  <Info className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
                  <p className="text-sm">Run a simulation to see impact scores here.</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={impactChartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    {METRICS.filter(m => activeMetrics.includes(m.key)).map(m => (
                      <Bar key={m.key} dataKey={m.key} name={m.label} fill={m.color} radius={[4, 4, 0, 0]} maxBarSize={48} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* --- Cost Comparison Chart --- */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Cost Comparison Across Formula Versions</h3>
            <div className="flex items-end gap-2 mb-3 flex-wrap">
              <div className="flex-1 min-w-32">
                <label className="text-xs text-slate-500 font-medium block mb-1">Version Label</label>
                <input
                  type="text"
                  value={newCostLabel}
                  onChange={e => setNewCostLabel(e.target.value)}
                  placeholder="e.g. Version A"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div className="w-32">
                <label className="text-xs text-slate-500 font-medium block mb-1">Cost (USD)</label>
                <input
                  type="number"
                  value={newCostValue}
                  onChange={e => setNewCostValue(e.target.value)}
                  placeholder="e.g. 12.50"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  min="0"
                  step="0.01"
                />
              </div>
              <button
                onClick={addCostEntry}
                disabled={!newCostLabel.trim() || !newCostValue}
                className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg disabled:opacity-40 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {costEntries.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {costEntries.map(e => (
                  <div key={e.id} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                    {e.label}: <strong>${parseFloat(e.value).toFixed(2)}</strong>
                    <button onClick={() => removeCostEntry(e.id)} className="text-red-400 hover:text-red-600 ml-0.5">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {costEntries.length === 0 ? (
              <div className="flex items-center justify-center h-36 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-center text-slate-400">
                  <BarChart2 className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                  <p className="text-sm">Add cost entries above to compare formula versions.</p>
                </div>
              </div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costChartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Cost']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="cost" name="Cost (USD)" radius={[4, 4, 0, 0]} maxBarSize={56}>
                      {costChartData.map((_, i) => (
                        <Cell key={i} fill={COST_COLORS[i % COST_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}