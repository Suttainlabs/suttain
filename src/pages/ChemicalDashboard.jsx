import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  ArrowLeft, Atom, TrendingUp, ShieldAlert, Leaf, Database,
  BarChart2, Activity, RefreshCw
} from 'lucide-react';

// ── Color palette ──────────────────────────────────────────────────
const COLORS = {
  teal: '#0D9E8E',
  violet: '#8B5CF6',
  amber: '#F59E0B',
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  slate: '#64748B',
};

const HAZARD_COLORS = {
  safe: '#10B981',
  moderate: '#F59E0B',
  hazardous: '#EF4444',
  highly_hazardous: '#991B1B',
  unknown: '#64748B',
};

const PIE_PALETTE = [
  COLORS.teal, COLORS.violet, COLORS.amber, COLORS.red, COLORS.blue, COLORS.green, COLORS.slate
];

// ── Custom Tooltip ─────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-slate-400 mb-1 font-mono">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill || '#CBD5E1' }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Stat card ──────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, Icon }) => (
  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div className="min-w-0">
      <p className="text-xl font-bold text-white leading-tight">{value}</p>
      <p className="text-xs text-slate-400 truncate">{label}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Section wrapper ────────────────────────────────────────────────
const Section = ({ title, children, span = 1 }) => (
  <div className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 ${span === 2 ? 'lg:col-span-2' : ''}`}>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{title}</p>
    {children}
  </div>
);

// ── Derive dashboard data from Chemical entities ───────────────────
function deriveStats(chemicals) {
  const total = chemicals.length;

  // Safety level breakdown
  const safetyCount = {};
  chemicals.forEach(c => {
    const lvl = c.safety_level || 'unknown';
    safetyCount[lvl] = (safetyCount[lvl] || 0) + 1;
  });
  const safetyPie = Object.entries(safetyCount).map(([name, value]) => ({ name, value }));

  // Chemical type breakdown (top 8)
  const typeCount = {};
  chemicals.forEach(c => {
    const t = c.chemical_type || 'other';
    typeCount[t] = (typeCount[t] || 0) + 1;
  });
  const typePie = Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Category bar
  const catCount = {};
  chemicals.forEach(c => {
    const cat = c.category || 'other';
    catCount[cat] = (catCount[cat] || 0) + 1;
  });
  const categoryBar = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }));

  // Molecular weight distribution buckets
  const mwBuckets = { '<100': 0, '100-300': 0, '300-500': 0, '500-800': 0, '>800': 0 };
  chemicals.forEach(c => {
    const mw = c.molecular_weight;
    if (!mw) return;
    if (mw < 100) mwBuckets['<100']++;
    else if (mw < 300) mwBuckets['100-300']++;
    else if (mw < 500) mwBuckets['300-500']++;
    else if (mw < 800) mwBuckets['500-800']++;
    else mwBuckets['>800']++;
  });
  const mwBar = Object.entries(mwBuckets).map(([range, count]) => ({ range, count }));

  // Scatter: molecular weight vs LogP
  const scatter = chemicals
    .filter(c => c.molecular_weight && c.physical_properties?.log_p != null)
    .slice(0, 60)
    .map(c => ({
      mw: parseFloat(c.molecular_weight.toFixed(1)),
      logP: parseFloat(c.physical_properties.log_p.toFixed(2)),
      name: c.name,
    }));

  // Radar: property coverage
  const hasField = (c, field) => {
    if (field === 'toxicity') return !!c.toxicity_data?.ld50_oral;
    if (field === 'environmental') return !!c.environmental_data?.biodegradability;
    if (field === 'spectral') return !!c.spectral_data?.ir_spectrum_url;
    if (field === 'biological') return c.biological_data?.target_proteins?.length > 0;
    if (field === 'pharmacological') return !!c.pharmacological_data?.therapeutic_class;
    if (field === 'physical') return !!c.physical_properties?.melting_point;
    return false;
  };
  const fields = ['toxicity', 'environmental', 'spectral', 'biological', 'pharmacological', 'physical'];
  const radar = fields.map(f => ({
    subject: f.charAt(0).toUpperCase() + f.slice(1),
    coverage: total > 0 ? Math.round((chemicals.filter(c => hasField(c, f)).length / total) * 100) : 0,
  }));

  // Avg MW
  const withMW = chemicals.filter(c => c.molecular_weight);
  const avgMW = withMW.length
    ? (withMW.reduce((s, c) => s + c.molecular_weight, 0) / withMW.length).toFixed(1)
    : 'N/A';

  // Hazardous count
  const hazardous = chemicals.filter(c => ['hazardous', 'highly_hazardous'].includes(c.safety_level)).length;

  return { total, safetyPie, typePie, categoryBar, mwBar, scatter, radar, avgMW, hazardous };
}

export default function ChemicalDashboard() {
  const navigate = useNavigate();
  const [chemicals, setChemicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Chemical.list('-created_date', 500);
      setChemicals(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setChemicals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = deriveStats(chemicals);

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
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Chemical Intelligence Dashboard</span>
          <div className="ml-auto flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden sm:block text-[10px] text-slate-600 font-mono">Updated {lastUpdated}</span>
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
              <p className="text-sm text-slate-500">Loading chemical database...</p>
            </div>
          </div>
        ) : chemicals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Database className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-400 font-semibold mb-1">No chemical data found</p>
            <p className="text-xs text-slate-600">Add chemicals to the database to populate dashboard charts.</p>
          </div>
        ) : (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Total Chemicals" value={stats.total} sub="in database" color={COLORS.teal} Icon={Database} />
              <StatCard label="Avg Molecular Weight" value={stats.avgMW} sub="g/mol" color={COLORS.blue} Icon={Atom} />
              <StatCard label="Hazardous Compounds" value={stats.hazardous} sub="hazardous or highly hazardous" color={COLORS.red} Icon={ShieldAlert} />
              <StatCard label="Chemical Types" value={stats.typePie.length} sub="distinct types" color={COLORS.violet} Icon={Activity} />
            </div>

            {/* Row 1: MW distribution + Safety pie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Section title="Molecular Weight Distribution" span={2}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.mwBar} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Compounds" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-slate-600 mt-2 text-center">Molecular weight ranges (g/mol)</p>
              </Section>

              <Section title="Safety Level Breakdown">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.safetyPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.safetyPie.map((entry, i) => (
                        <Cell key={i} fill={HAZARD_COLORS[entry.name] || PIE_PALETTE[i % PIE_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ fontSize: 10, color: '#94A3B8' }}>
                          {value.replace(/_/g, ' ')}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Section>
            </div>

            {/* Row 2: Category bar + Type pie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Section title="Top Categories by Count" span={2}>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.categoryBar} layout="vertical" margin={{ top: 0, right: 12, left: 60, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} width={60} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Count" fill={COLORS.violet} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Section>

              <Section title="Chemical Type Distribution">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={stats.typePie}
                      cx="50%"
                      cy="45%"
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stats.typePie.map((_, i) => (
                        <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ fontSize: 9, color: '#94A3B8' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Section>
            </div>

            {/* Row 3: LogP vs MW scatter + Data coverage radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Section title="Molecular Weight vs. LogP (Lipophilicity)">
                {stats.scatter.length < 3 ? (
                  <div className="flex items-center justify-center h-48 text-slate-600 text-xs">
                    Insufficient data — requires molecular_weight and logP values.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <ScatterChart margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis
                        dataKey="mw"
                        name="MW (g/mol)"
                        type="number"
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        label={{ value: 'MW (g/mol)', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#64748B' }}
                      />
                      <YAxis
                        dataKey="logP"
                        name="LogP"
                        type="number"
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        label={{ value: 'LogP', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748B' }}
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3', stroke: '#334155' }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
                              <p className="text-slate-300 font-semibold mb-1">{d.name}</p>
                              <p className="text-slate-400">MW: <span className="text-white">{d.mw}</span></p>
                              <p className="text-slate-400">LogP: <span className="text-white">{d.logP}</span></p>
                            </div>
                          );
                        }}
                      />
                      <Scatter data={stats.scatter} fill={COLORS.amber} fillOpacity={0.7} />
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
                <p className="text-[10px] text-slate-600 mt-2 text-center">Higher LogP = more lipophilic (fat-soluble)</p>
              </Section>

              <Section title="Data Coverage by Property Domain">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart cx="50%" cy="50%" outerRadius={80} data={stats.radar}>
                    <PolarGrid stroke="#1E293B" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fontSize: 9, fill: '#64748B' }}
                      tickCount={4}
                    />
                    <Radar
                      name="Coverage %"
                      dataKey="coverage"
                      stroke={COLORS.teal}
                      fill={COLORS.teal}
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip content={<ChartTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-slate-600 mt-2 text-center">Percentage of compounds with each data domain populated</p>
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}