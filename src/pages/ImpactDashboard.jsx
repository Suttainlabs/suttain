import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Leaf, FlaskConical, ShieldCheck, TrendingUp, BarChart3,
  Droplets, Wind, Recycle, AlertTriangle, CheckCircle2, Loader2, Atom
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const SAFETY_COLORS = { safe: '#02988C', moderate: '#f59e0b', hazardous: '#ef4444', unknown: '#94a3b8' };
const PRODUCT_COLORS = ['#02988C', '#9531F5', '#09D2FF', '#f97316', '#ec4899', '#84cc16', '#8b5cf6'];

function ScoreRing({ score, label, color, size = 100 }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="700" fill={color}>
          {Math.round(score)}
        </text>
      </svg>
      <p className="text-xs font-semibold text-slate-600 text-center leading-tight">{label}</p>
    </div>
  );
}

function StatCard({ icon: IconComp, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
        <IconComp className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-800 mb-1 truncate max-w-[160px]">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function ImpactDashboard() {
  const navigate = useNavigate();
  const [formulas, setFormulas] = useState([]);
  const [sustainabilityProfiles, setSustainabilityProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [fList, sList] = await Promise.all([
          base44.entities.Formula.list('-created_date', 100),
          base44.entities.SustainabilityProfile.list('-created_date', 100),
        ]);
        setFormulas(fList);
        setSustainabilityProfiles(sList);
      } catch {
        // not logged in or error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived metrics ──────────────────────────────────────────────
  const totalFormulas = formulas.length;

  // Match sustainability profiles to formulas
  const profileMap = Object.fromEntries(sustainabilityProfiles.map(p => [p.formula_id, p]));

  const formulasWithProfile = formulas.filter(f => profileMap[f.id]);
  const hasProfiles = formulasWithProfile.length > 0;

  const avgGreenScore = hasProfiles
    ? Math.round(formulasWithProfile.reduce((sum, f) => sum + (profileMap[f.id]?.overall_score || 0), 0) / formulasWithProfile.length)
    : null;

  const avgCarbonScore = hasProfiles
    ? Math.round(formulasWithProfile.reduce((sum, f) => sum + (profileMap[f.id]?.carbon_footprint?.score || 0), 0) / formulasWithProfile.length)
    : null;

  const avgBioScore = hasProfiles
    ? Math.round(formulasWithProfile.reduce((sum, f) => sum + (profileMap[f.id]?.biodegradability?.score || 0), 0) / formulasWithProfile.length)
    : null;

  const avgRenewable = hasProfiles
    ? Math.round(formulasWithProfile.reduce((sum, f) => sum + (profileMap[f.id]?.renewable_content?.percentage || 0), 0) / formulasWithProfile.length)
    : null;

  // Ingredient safety breakdown across all formulas
  const safetyCount = { safe: 0, moderate: 0, hazardous: 0, unknown: 0 };
  formulas.forEach(f => {
    (f.full_recipe_data?.ingredients || f.ingredients || []).forEach(ing => {
      const sl = ing.safety_level || ing.safetyLevel || 'unknown';
      const key = sl.toLowerCase();
      if (key in safetyCount) safetyCount[key]++;
      else safetyCount.unknown++;
    });
  });
  const totalIngredients = Object.values(safetyCount).reduce((a, b) => a + b, 0);
  const safetyPieData = Object.entries(safetyCount)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v, color: SAFETY_COLORS[k] }));

  // Per-formula green scores for bar chart
  const formulaBarData = formulasWithProfile.slice(0, 10).map(f => ({
    name: f.name?.length > 14 ? f.name.slice(0, 14) + '…' : f.name,
    'Green Score': profileMap[f.id]?.overall_score || 0,
    'Carbon Score': profileMap[f.id]?.carbon_footprint?.score || 0,
    'Bio Score': profileMap[f.id]?.biodegradability?.score || 0,
  }));

  // Radar: average across dimensions
  const radarData = [
    { subject: 'Green Score', value: avgGreenScore || 0 },
    { subject: 'Carbon', value: avgCarbonScore || 0 },
    { subject: 'Biodegradability', value: avgBioScore || 0 },
    { subject: 'Renewable', value: avgRenewable || 0 },
    { subject: 'Packaging', value: hasProfiles ? Math.round(formulasWithProfile.reduce((s, f) => s + (profileMap[f.id]?.packaging_impact?.score || 0), 0) / formulasWithProfile.length) : 0 },
    { subject: 'Water', value: hasProfiles ? Math.round(formulasWithProfile.reduce((s, f) => s + (profileMap[f.id]?.water_usage?.efficiency_score || 0), 0) / formulasWithProfile.length) : 0 },
  ];

  // Product type distribution
  const typeCount = {};
  formulas.forEach(f => { const t = f.product_type || 'other'; typeCount[t] = (typeCount[t] || 0) + 1; });
  const typePieData = Object.entries(typeCount).map(([k, v], i) => ({
    name: k.replace(/_/g, ' '),
    value: v,
    color: PRODUCT_COLORS[i % PRODUCT_COLORS.length]
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/30 px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to view your Impact</h2>
          <p className="text-slate-500 mb-6 text-sm">Your sustainability dashboard is waiting. Sign in to see aggregated green chemistry insights across your formula library.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-green-50/20 pb-20">
      {/* Hero */}
      <section className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="bg-teal-100 text-teal-800 border-teal-300 mb-4">Sustainability Dashboard</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-green-500">Impact</span> Dashboard
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl">
              Aggregated sustainability, safety, and green chemistry metrics across your entire formula library.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Stat Cards */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FlaskConical} label="Total Formulas" value={totalFormulas} sub="in your library" color="#02988C" />
          <StatCard icon={Leaf} label="Avg Green Score" value={avgGreenScore !== null ? `${avgGreenScore}/100` : ':'} sub={hasProfiles ? `${formulasWithProfile.length} scored` : 'No profiles yet'} color="#22c55e" />
          <StatCard icon={Wind} label="Avg Carbon Score" value={avgCarbonScore !== null ? `${avgCarbonScore}/100` : ':'} sub="lower = better" color="#09D2FF" />
          <StatCard icon={Recycle} label="Avg Biodegradability" value={avgBioScore !== null ? `${avgBioScore}/100` : ':'} sub="decomposition score" color="#9531F5" />
        </motion.div>

        {/* Score Rings */}
        {hasProfiles && (
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-500" /> Average Environmental Metrics
            </h2>
            <div className="flex flex-wrap justify-around gap-6">
              <ScoreRing score={avgGreenScore} label="Overall Green" color="#22c55e" />
              <ScoreRing score={avgCarbonScore} label="Carbon Score" color="#09D2FF" />
              <ScoreRing score={avgBioScore} label="Biodegradability" color="#9531F5" />
              <ScoreRing score={avgRenewable} label="Renewable %" color="#f97316" />
              <ScoreRing score={radarData[4].value} label="Packaging" color="#02988C" />
              <ScoreRing score={radarData[5].value} label="Water Efficiency" color="#8b5cf6" />
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          {hasProfiles && (
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-500" /> Green Chemistry Radar
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Avg Score" dataKey="value" stroke="#02988C" fill="#02988C" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip formatter={(v) => [`${v}/100`]} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Ingredient Safety Pie */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-500" /> Ingredient Safety Ratings
            </h2>
            {safetyPieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Atom className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No ingredient data yet</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={safetyPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                      {safetyPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} ingredients`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 min-w-[130px]">
                  {safetyPieData.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-700 font-medium">{d.name}</span>
                      <span className="text-slate-400 ml-auto">{d.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
                    {totalIngredients} total ingredients
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Per-formula Bar Chart */}
        {formulaBarData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-teal-500" /> Sustainability Scores by Formula
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={formulaBarData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Green Score" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Carbon Score" fill="#09D2FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Bio Score" fill="#9531F5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Product Type Distribution */}
        {typePieData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-teal-500" /> Formula Library by Product Type
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={typePieData} cx="50%" cy="50%" outerRadius={90} paddingAngle={2} dataKey="value">
                    {typePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} formula${v !== 1 ? 's' : ''}`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 w-full sm:max-w-xs">
                {typePieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-600 capitalize truncate">{d.name}</span>
                    <span className="ml-auto font-bold text-slate-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {totalFormulas === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
            <Leaf className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No formulas in your library yet</h3>
            <p className="text-slate-400 mb-6 text-sm">Create your first formula to start tracking your sustainability impact.</p>
            <Link to="/generator"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl shadow hover:opacity-90 transition">
              <FlaskConical className="w-4 h-4" /> Create a Formula
            </Link>
          </motion.div>
        )}

        {/* No sustainability profiles yet */}
        {totalFormulas > 0 && !hasProfiles && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">No sustainability profiles yet</p>
              <p className="text-amber-700 text-xs mt-1">
                Run the Sustainability Scorer on your formulas to unlock full environmental metrics and green chemistry scores.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}