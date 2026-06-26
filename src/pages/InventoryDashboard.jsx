import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import {
  ArrowLeft, BarChart2, Boxes, AlertTriangle, Layers,
  RefreshCw, FlaskConical, Package
} from 'lucide-react';

const TYPE_COLORS = {
  solvent: '#3B82F6',
  acid: '#EF4444',
  base: '#F59E0B',
  salt: '#10B981',
  reagent: '#8B5CF6',
  catalyst: '#EC4899',
  buffer: '#0D9E8E',
  oxidizer: '#F97316',
  reducing_agent: '#06B6D4',
  indicator: '#A855F7',
  polymer: '#14B8A6',
  metal: '#94A3B8',
  gas: '#EAB308',
  biological: '#22C55E',
  other: '#64748B',
};

const BAR_PALETTE = [
  '#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6',
  '#EC4899', '#0D9E8E', '#F97316', '#06B6D4', '#A855F7',
  '#14B8A6', '#94A3B8', '#EAB308', '#22C55E', '#64748B',
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1 font-mono capitalize">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill || '#CBD5E1' }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

function StatCard({ label, value, sub, color, Icon }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-white leading-tight">{value}</p>
        <p className="text-xs text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function deriveInventoryStats(items) {
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

  // Group by chemical_type
  const typeMap = {};
  items.forEach((item) => {
    const type = item.chemical_type || 'other';
    if (!typeMap[type]) {
      typeMap[type] = { type, count: 0, totalQuantity: 0, lowStock: 0 };
    }
    typeMap[type].count += 1;
    typeMap[type].totalQuantity += item.quantity || 0;
    if (item.low_stock_threshold != null && (item.quantity || 0) <= item.low_stock_threshold) {
      typeMap[type].lowStock += 1;
    }
  });

  const byType = Object.values(typeMap).sort((a, b) => b.totalQuantity - a.totalQuantity);

  const lowStockItems = items.filter(
    (i) => i.low_stock_threshold != null && (i.quantity || 0) <= i.low_stock_threshold
  );

  return {
    totalItems,
    totalQuantity,
    distinctTypes: byType.length,
    lowStockCount: lowStockItems.length,
    byType,
    lowStockItems,
  };
}

export default function InventoryDashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ChemicalInventory.list('-created_date', 500);
      setItems(data || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = deriveInventoryStats(items);
  const chartData = stats.byType.map((t) => ({
    name: t.type.replace(/_/g, ' '),
    quantity: t.totalQuantity,
    count: t.count,
  }));

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Sub-header */}
      <div className="border-b border-slate-700/50 bg-slate-900/60 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-3">
          <button
            onClick={() => navigate(createPageUrl('ResearchPortal'))}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-slate-700" />
          <BarChart2 className="w-3.5 h-3.5 text-[#0D9E8E] flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
            Inventory Dashboard
          </span>
          <div className="ml-auto flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden sm:block text-[10px] text-slate-600 font-mono">
                Updated {lastUpdated}
              </span>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-slate-700 border-t-[#0D9E8E] rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading inventory data...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Boxes className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-400 font-semibold mb-1">No inventory items found</p>
            <p className="text-xs text-slate-600">
              Add chemicals to your inventory to see quantity summaries by type.
            </p>
          </div>
        ) : (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="Total Items"
                value={stats.totalItems}
                sub="in inventory"
                color="#0D9E8E"
                Icon={Package}
              />
              <StatCard
                label="Total Quantity"
                value={stats.totalQuantity.toLocaleString()}
                sub="all units combined"
                color="#3B82F6"
                Icon={Boxes}
              />
              <StatCard
                label="Chemical Types"
                value={stats.distinctTypes}
                sub="distinct categories"
                color="#8B5CF6"
                Icon={Layers}
              />
              <StatCard
                label="Low Stock Alerts"
                value={stats.lowStockCount}
                sub="at or below threshold"
                color="#EF4444"
                Icon={AlertTriangle}
              />
            </div>

            {/* Bar chart: Quantity by Chemical Type */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-slate-500" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Total Quantity by Chemical Type
                </p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    angle={-35}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#1E293B40' }} />
                  <Bar dataKey="quantity" name="Total Quantity" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={TYPE_COLORS[entry.name.replace(/ /g, '_')] || BAR_PALETTE[i % BAR_PALETTE.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary table */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-4 h-4 text-slate-500" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Breakdown by Chemical Type
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50 text-left">
                      <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Type
                      </th>
                      <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                        Items
                      </th>
                      <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                        Total Quantity
                      </th>
                      <th className="py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                        Low Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byType.map((t) => (
                      <tr
                        key={t.type}
                        className="border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20 transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  TYPE_COLORS[t.type] || '#64748B',
                              }}
                            />
                            <span className="text-xs font-semibold text-slate-300 capitalize">
                              {t.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right text-xs text-slate-400">
                          {t.count}
                        </td>
                        <td className="py-2.5 px-3 text-right text-xs font-semibold text-slate-200">
                          {t.totalQuantity.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {t.lowStock > 0 ? (
                            <span className="text-xs font-bold text-red-400">
                              {t.lowStock}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600">0</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low stock items */}
            {stats.lowStockItems.length > 0 && (
              <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    Low Stock Items
                  </p>
                </div>
                <div className="space-y-2">
                  {stats.lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b border-red-900/30 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-300 truncate">
                          {item.name}
                        </p>
                        {item.location && (
                          <p className="text-[10px] text-slate-600 mt-0.5">
                            {item.location}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <span className="text-[10px] text-slate-500">
                          Threshold: {item.low_stock_threshold}
                        </span>
                        <span className="text-xs font-bold text-red-400">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}