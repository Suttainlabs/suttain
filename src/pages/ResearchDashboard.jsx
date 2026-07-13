import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Atom, Cpu, FlaskConical, Clock, Play,
  Database, BarChart2, ChevronRight, TrendingUp,
  FileText, Layers, Loader2, Plus, FolderOpen, Share2,
  Lock, Sparkles
} from 'lucide-react';
import NewProjectModal from '../components/research/NewProjectModal';
import KanbanBoard from '../components/research/KanbanBoard';
import ShareProjectModal from '../components/research/ShareProjectModal';

function StatCard({ label, value, sub, color = '#007850' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function RecentQueryRow({ item, onRerun }) {
  const typeColor = {
    name: '#007850',
    smiles: '#6B3FA0',
    inchi: '#00A8C8',
    ingredient_list: '#00B478',
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 group">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ backgroundColor: (typeColor[item.type] || '#007850') + '15', color: typeColor[item.type] || '#007850' }}
        >
          {item.type}
        </span>
        <span className="text-xs font-mono text-slate-600 truncate">{item.query}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
        <button
          onClick={() => onRerun(item)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-teal-50 text-[#007850]"
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
  const [viewMode, setViewMode] = useState('list');
  const [shareProject, setShareProject] = useState(null);

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

    base44.entities.ChemicalProject.filter({ created_by_id: user.id }, '-created_date', 50)
      .then(data => setProjects(data || []))
      .catch(() => {});
  }, [user]);

  const handleCreateProject = async (projectData) => {
    const created = await base44.entities.ChemicalProject.create(projectData);
    setProjects(prev => [created, ...prev]);
  };

  const handleStatusChange = async (projectId, newStatus) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    try {
      await base44.entities.ChemicalProject.update(projectId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update project status:', err);
    }
  };

  const handleRerun = (item) => {
    navigate(`${createPageUrl('MolecularIntelligence')}?q=${encodeURIComponent(item.query)}&type=${item.type}`);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#EDF7F2] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#6B3FA0] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#EDF7F2] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto text-center bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#6B3FA0] to-[#8B5CF6] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Unlock the Research Dashboard</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Your personal research hub — saved compounds, usage metrics, active simulations, and a scientific feed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="lg"
              className="flex-1 bg-white"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/register')}
              size="lg"
              className="flex-1 bg-gradient-to-r from-[#007850] to-[#00A8C8] hover:opacity-90 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Sign Up Free
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalQueries = queryHistory.length;

  return (
    <div className="min-h-screen bg-[#EDF7F2] text-slate-800">
      {/* Sub-header — breadcrumb, no back button */}
      <div className="border-b border-slate-200 bg-white/80 sticky top-[68px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-2">
          <Link to={createPageUrl('ResearchPortal')} className="text-[11px] font-semibold text-slate-400 hover:text-[#6B3FA0] transition-colors uppercase tracking-widest">
            Suttain Research
          </Link>
          <span className="text-slate-300 text-[11px]">/</span>
          <BarChart2 className="w-3.5 h-3.5 text-[#007850]" />
          <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">Dashboard</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Greeting */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">
              {user.full_name?.split(' ')[0] ? `Welcome back, ${user.full_name.split(' ')[0]}.` : 'Research Dashboard'}
            </h1>
            <p className="text-sm text-slate-500">Your molecular intelligence workspace.</p>
          </div>
          <Button
            onClick={() => setShowNewProject(true)}
            className="bg-[#6B3FA0] hover:bg-violet-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Project
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard label="Queries Run" value={totalQueries} sub="all time" color="#007850" />
          <StatCard label="Saved Formulas" value={savedFormulas.length} sub="in workspace" color="#6B3FA0" />
          <StatCard label="Data Sources" value="3" sub="PubChem · ChEMBL · EPA" color="#00A8C8" />
          <StatCard label="Export Formats" value="4" sub="JSON · CSV · PDF · APA" color="#00B478" />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* Recent queries */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Recent Queries</span>
                </div>
                <Link to={createPageUrl('MolecularIntelligence')} className="flex items-center gap-1 text-[#007850] text-xs font-semibold hover:underline">
                  New Query <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {queryHistory.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No queries yet. Run your first compound analysis.</p>
              ) : (
                queryHistory.slice(0, 8).map((item, i) => (
                  <RecentQueryRow key={i} item={item} onRerun={handleRerun} />
                ))
              )}
            </div>

            {/* Projects */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Projects</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('board')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${viewMode === 'board' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Board
                    </button>
                  </div>
                  <button
                    onClick={() => setShowNewProject(true)}
                    className="flex items-center gap-1 text-[#6B3FA0] text-xs font-semibold hover:underline"
                  >
                    <Plus className="w-3 h-3" /> New
                  </button>
                </div>
              </div>
              {viewMode === 'board' ? (
                <KanbanBoard
                  projects={projects}
                  onStatusChange={handleStatusChange}
                  onNewProject={() => setShowNewProject(true)}
                  onShare={setShareProject}
                />
              ) : projects.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400 mb-2">No projects yet.</p>
                  <button onClick={() => setShowNewProject(true)} className="text-xs text-[#6B3FA0] font-semibold hover:underline">
                    Start a project from a template
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map(p => (
                    <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || '#6B3FA0' }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                        {p.project_type && (
                          <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{p.project_type.replace(/_/g, ' ')}</p>
                        )}
                      </div>
                      {p.tags?.length > 0 && (
                        <div className="flex gap-1 flex-shrink-0">
                          {p.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{tag}</span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setShareProject(p)}
                        className="p-1.5 rounded text-slate-400 hover:text-[#6B3FA0] hover:bg-violet-50 transition-colors flex-shrink-0"
                        title="Share project"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved formulas */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Saved Formulas</span>
                </div>
                <Link to={createPageUrl('FormulaPortfolio')} className="flex items-center gap-1 text-[#007850] text-xs font-semibold hover:underline">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                </div>
              ) : savedFormulas.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400 mb-2">No formulas saved yet.</p>
                  <Link to={createPageUrl('generator')} className="text-xs text-[#007850] font-semibold hover:underline">
                    Generate your first formula
                  </Link>
                </div>
              ) : (
                savedFormulas.map((f) => (
                  <div key={f.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{f.name}</p>
                      {f.product_type && <p className="text-[10px] text-slate-400 mt-0.5">{f.product_type}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {f.safety_score != null && (
                        <span className="text-[10px] font-bold text-emerald-600">{f.safety_score} safety</span>
                      )}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${f.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
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
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Access</p>
              <div className="space-y-1">
                {[
                  { label: 'Molecular Intelligence', Icon: Atom, route: 'MolecularIntelligence', color: '#007850' },
                  { label: 'Computational Simulation', Icon: Cpu, route: 'ComputationalSimulation', color: '#00A8C8' },
                  { label: 'Formula Generator', Icon: FlaskConical, route: 'generator', color: '#6B3FA0' },
                  { label: 'SDS Analyzer', Icon: FileText, route: 'SDSAnalyzer', color: '#64748b' },
                  { label: 'Ingredient Database', Icon: Database, route: 'IngredientDatabase', color: '#00B478' },
                  { label: 'Research API', Icon: Layers, route: 'APIPortal', color: '#6B3FA0' },
                ].map(({ label, Icon, route, color }) => (
                  <Link
                    key={route}
                    to={createPageUrl(route)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
                    <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-400 ml-auto transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Scientific feed */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Scientific Feed</span>
              </div>
              <div className="space-y-3">
                {FEED_ITEMS.map((item, i) => (
                  <div key={i} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold text-[#007850] uppercase">{item.source}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[9px] text-slate-400">{item.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{item.title}</p>
                    <p className="text-[9px] text-slate-400 mt-1">{item.date}</p>
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

      <ShareProjectModal
        project={shareProject}
        isOpen={!!shareProject}
        onClose={() => setShareProject(null)}
      />
    </div>
  );
}