import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthGate from '../components/auth/AuthGate';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Atom, Cpu, FlaskConical, Clock, Play,
  Database, BarChart2, ChevronRight, TrendingUp,
  FileText, Layers, ArrowLeft, Loader2, Plus, FolderOpen
} from 'lucide-react';
import NewProjectModal from '../components/research/NewProjectModal';

function StatCard({ label, value, sub, color = '#0D9E8E' }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

function RecentQueryRow({ item, onRerun }) {
  const typeColor = {
    name: '#0D9E8E',
    smiles: '#6366f1',
    inchi: '#f59e0b',
    ingredient_list: '#10b981',
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0 group">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ backgroundColor: (typeColor[item.type] || '#0D9E8E') + '15', color: typeColor[item.type] || '#0D9E8E' }}
        >
          {item.type}
        </span>
        <span className="text-xs font-mono text-slate-400 truncate">{item.query}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <span className="text-[10px] text-slate-600">{new Date(item.timestamp).toLocaleDateString()}</span>
        <button
          onClick={() => onRerun(item)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#0D9E8E]/10 text-[#0D9E8E]"
          title="Re-run analysis"
        >
          <Play className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

const FEED_ITEMS = [
  { source: 'PubChem', title: 'New bioassay results for Perfluorooctanoic acid (PFOA)', date: '2026-06-12', type: 'Bioassay' },
  { source: 'EPA CompTox', title: 'Updated aquatic toxicity estimates for 14 PFAS compounds', date: '2026-06-10', type: 'Regulatory' },
  { source: 'ChEMBL', title: 'Bisphenol S added to endocrine disruption candidate list', date: '2026-06-08', type: 'Safety' },
  { source: 'PubChem', title: 'Structure-activity data expanded for titanium dioxide nanoparticles', date: '2026-06-05', type: 'Compound' },
  { source: 'EPA CompTox', title: 'IRIS toxicological review finalized for formaldehyde', date: '2026-06-03', type: 'Toxicology' },
];

export default function ResearchDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const [savedFormulas, setSavedFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [showNewProject, setShowNewProject] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setUser(null);
      setAuthChecked(true);
    }, 4000);

    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => {
        clearTimeout(timeout);
        setAuthChecked(true);
      });

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    try {
      const hist = JSON.parse(localStorage.getItem('mi_query_history') || '[]');
      setQueryHistory(hist);
    } catch {}

    base44.entities.Formula.filter({ created_by_id: user.id }, '-created_date', 5)
      .then(data => setSavedFormulas(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    base44.entities.ChemicalProject.filter({ created_by_id: user.id }, '-created_date', 10)
      .then(data => setProjects(data || []))
      .catch(() => {});
  }, [user]);

  const handleCreateProject = async (projectData) => {
    const created = await base44.entities.ChemicalProject.create(projectData);
    setProjects(prev => [created, ...prev]);
  };

  const handleRerun = (item) => {
    navigate(`${createPageUrl('MolecularIntelligence')}?q=${encodeURIComponent(item.query)}&type=${item.type}`);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 py-12">
        <AuthGate featureName="Research Dashboard" featureDescription="Your personal research hub — saved compounds, usage metrics, active simulations, and a scientific feed." />
      </div>
    );
  }

  const totalQueries = queryHistory.length;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Sub-header */}
      <div className="border-b border-slate-700/50 bg-slate-900/60 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl('ResearchPortal'))} className="text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-slate-700" />
          <BarChart2 className="w-3.5 h-3.5 text-[#0D9E8E]" />
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Research Dashboard</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Greeting */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">
              {user.full_name?.split(' ')[0] ? `Welcome back, ${user.full_name.split(' ')[0]}.` : 'Research Dashboard'}
            </h1>
            <p className="text-sm text-slate-500">Your molecular intelligence workspace.</p>
          </div>
          <Button
            onClick={() => setShowNewProject(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Project
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard label="Queries Run" value={totalQueries} sub="all time" color="#0D9E8E" />
          <StatCard label="Saved Formulas" value={savedFormulas.length} sub="in workspace" color="#6366f1" />
          <StatCard label="Data Sources" value="3" sub="PubChem · ChEMBL · EPA" color="#f59e0b" />
          <StatCard label="Export Formats" value="4" sub="JSON · CSV · PDF · APA" color="#10b981" />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* Recent queries */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Recent Queries</span>
                </div>
                <Link to={createPageUrl('MolecularIntelligence')} className="flex items-center gap-1 text-[#0D9E8E] text-xs font-semibold hover:underline">
                  New Query <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {queryHistory.length === 0 ? (
                <p className="text-xs text-slate-600 py-4 text-center">No queries yet. Run your first compound analysis.</p>
              ) : (
                queryHistory.slice(0, 8).map((item, i) => (
                  <RecentQueryRow key={i} item={item} onRerun={handleRerun} />
                ))
              )}
            </div>

            {/* Projects */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Projects</span>
                </div>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="flex items-center gap-1 text-violet-400 text-xs font-semibold hover:underline"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              {projects.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-600 mb-2">No projects yet.</p>
                  <button onClick={() => setShowNewProject(true)} className="text-xs text-violet-400 font-semibold hover:underline">
                    Start a project from a template
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map(p => (
                    <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-slate-700/30 last:border-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || '#6B3FA0' }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-300 truncate">{p.name}</p>
                        {p.project_type && (
                          <p className="text-[10px] text-slate-600 mt-0.5 capitalize">{p.project_type.replace(/_/g, ' ')}</p>
                        )}
                      </div>
                      {p.tags?.length > 0 && (
                        <div className="flex gap-1 flex-shrink-0">
                          {p.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400 font-medium">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved formulas */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Saved Formulas</span>
                </div>
                <Link to={createPageUrl('FormulaPortfolio')} className="flex items-center gap-1 text-[#0D9E8E] text-xs font-semibold hover:underline">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                </div>
              ) : savedFormulas.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-600 mb-2">No formulas saved yet.</p>
                  <Link to={createPageUrl('generator')} className="text-xs text-[#0D9E8E] font-semibold hover:underline">
                    Generate your first formula
                  </Link>
                </div>
              ) : (
                savedFormulas.map((f) => (
                  <div key={f.id} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-300 truncate">{f.name}</p>
                      {f.product_type && <p className="text-[10px] text-slate-600 mt-0.5">{f.product_type}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {f.safety_score != null && (
                        <span className="text-[10px] font-bold text-emerald-400">{f.safety_score} safety</span>
                      )}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${f.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                        {f.status || 'draft'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Quick access */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Quick Access</p>
              <div className="space-y-1">
                {[
                  { label: 'Molecular Intelligence', Icon: Atom, route: 'MolecularIntelligence', color: '#0D9E8E' },
                  { label: 'Computational Simulation', Icon: Cpu, route: 'ComputationalSimulation', color: '#6366f1' },
                  { label: 'Formula Generator', Icon: FlaskConical, route: 'generator', color: '#f59e0b' },
                  { label: 'SDS Analyzer', Icon: FileText, route: 'SDSAnalyzer', color: '#64748b' },
                  { label: 'Ingredient Database', Icon: Database, route: 'IngredientDatabase', color: '#10b981' },
                  { label: 'Research API', Icon: Layers, route: 'APIPortal', color: '#8b5cf6' },
                ].map(({ label, Icon, route, color }) => (
                  <Link
                    key={route}
                    to={createPageUrl(route)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors group"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />  {/* eslint-disable-line */}
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
                    <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-slate-500 ml-auto transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Scientific feed */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Scientific Feed</span>
              </div>
              <div className="space-y-3">
                {FEED_ITEMS.map((item, i) => (
                  <div key={i} className="border-b border-slate-700/30 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold text-[#0D9E8E] uppercase">{item.source}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-[9px] text-slate-600">{item.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{item.title}</p>
                    <p className="text-[9px] text-slate-600 mt-1">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewProjectModal
        isOpen={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}