import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Microscope, FlaskConical, Dna, BarChart2, HeartPulse, Lock, Wrench } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProteinStructureExplorer from '../components/structural/ProteinStructureExplorer';
import ChemicalBindingScanner from '../components/structural/ChemicalBindingScanner';
import MutationSensitivityAnalyzer from '../components/structural/MutationSensitivityAnalyzer';
import DomainReliabilityHeatmap from '../components/structural/DomainReliabilityHeatmap';
import PopulationSafetyProfiler from '../components/structural/PopulationSafetyProfiler';
import StructurePrepSuite from '../components/structural/StructurePrepSuite';

function StructurePrepTab() {
  return (
    <StructurePrepSuite
      modes={['split', 'merge', 'missing_residues', 'renumber']}
    />
  );
}

const TOOLS = [
  {
    id: 'explorer',
    label: 'Protein Structure Explorer',
    icon: Microscope,
    color: '#2563eb',
    description: 'Search any human protein by UniProt ID or gene name. View 3D structures, pLDDT confidence, PAE heatmaps, and per-residue charts.',
    tags: ['AlphaFold API', '3Dmol.js', 'pLDDT'],
    tier: 'free',
    component: ProteinStructureExplorer,
  },
  {
    id: 'binding',
    label: 'Chemical Binding Risk Scanner',
    icon: FlaskConical,
    color: '#dc2626',
    description: 'Analyze chemical-protein binding against 10 toxicology target proteins using AlphaFold structural intelligence.',
    tags: ['AlphaFold', 'Toxicology', 'AI Analysis'],
    tier: 'pro',
    component: ChemicalBindingScanner,
  },
  {
    id: 'mutation',
    label: 'Mutation Sensitivity Analyzer',
    icon: Dna,
    color: '#9333ea',
    description: 'Analyze AlphaMissense pathogenicity data for amino acid variants. Identify structurally sensitive regions.',
    tags: ['AlphaMissense', 'Pathogenicity', 'Variants'],
    tier: 'pro',
    component: MutationSensitivityAnalyzer,
  },
  {
    id: 'domain',
    label: 'Domain Reliability Heatmap',
    icon: BarChart2,
    color: '#0d9e8e',
    description: 'Visualize the full PAE matrix to assess which structural domains are reliable vs uncertain. AI-powered interpretation.',
    tags: ['PAE Matrix', 'AI Interpretation', 'Domains'],
    tier: 'pro',
    component: DomainReliabilityHeatmap,
  },
  {
    id: 'population',
    label: 'Population Safety Profiler',
    icon: HeartPulse,
    color: '#f59e0b',
    description: 'Combines AlphaFold binding data with your saved health profile for personalized ingredient safety warnings.',
    tags: ['Health Profile', 'Personalized', 'Risk'],
    tier: 'pro',
    component: PopulationSafetyProfiler,
  },
  {
    id: 'prep',
    label: 'Structure Prep Utilities',
    icon: Wrench,
    color: '#0D9E8E',
    description: 'Free PDB preparation: split protein-ligand complexes, merge structures, find missing residues, and renumber residues. Powered by Biopython algorithms.',
    tags: ['Biopython', 'PDB', 'Free'],
    tier: 'free',
    component: StructurePrepTab,
  },
];

const FREE_DAILY_LIMIT = 3;

function getDailySearchCount() {
  const today = new Date().toISOString().split('T')[0];
  const data = localStorage.getItem('suttain_af_searches');
  if (!data) return 0;
  try {
    const parsed = JSON.parse(data);
    if (parsed.date !== today) return 0;
    return parsed.count || 0;
  } catch { return 0; }
}

function incrementDailySearch() {
  const today = new Date().toISOString().split('T')[0];
  const count = getDailySearchCount();
  localStorage.setItem('suttain_af_searches', JSON.stringify({ date: today, count: count + 1 }));
}

export default function StructuralBiology() {
  const [user, setUser] = useState(null);
  const [activeTool, setActiveTool] = useState('explorer');
  const [searchCount, setSearchCount] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    setSearchCount(getDailySearchCount());
  }, []);

  // Research tools require a paid Research pillar subscription (product_access).
  // Core-only subscribers are locked out of the Structural Biology suite.
  const isPro = useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin' || user.admin_granted_access) return true;
    return (user.product_access || []).includes('research');
  }, [user]);

  const handleToolSelect = (toolId) => {
    const tool = TOOLS.find(t => t.id === toolId);
    if (tool.tier === 'pro' && !isPro) return; // locked
    setActiveTool(toolId);
  };

  const activeToolObj = TOOLS.find(t => t.id === activeTool);
  const ActiveComponent = activeToolObj?.component;

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-slate-800 relative z-10">
      {/* Sub-header */}
      <div className="border-b border-slate-200 bg-white/80 sticky top-[68px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-3">
          <Dna className="w-3.5 h-3.5 text-[#2563eb]" />
          <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">Structural Biology</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-[#2563eb]/10 text-[#2563eb] font-bold">AlphaFold DB</span>
            <span className="px-1.5 py-0.5 rounded bg-[#007850]/10 text-[#007850] font-bold">CC BY 4.0</span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">Structural Biology Intelligence</h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Powered by the AlphaFold Protein Structure Database. Explore protein structures, analyze chemical binding risks,
            assess mutation sensitivity, and generate personalized safety profiles — all backed by Google DeepMind's structural predictions.
          </p>
        </div>

        {/* Tool tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            const locked = tool.tier === 'pro' && !isPro;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  isActive
                    ? 'bg-violet-100 border-violet-300 text-violet-700'
                    : locked
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? tool.color : undefined }} />
                {tool.label}
                {locked && <Lock className="w-3 h-3" />}
              </button>
            );
          })}
        </div>

        {/* Free tier limit notice for Tool 1 */}
        {activeTool === 'explorer' && !isPro && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-slate-700">
            Free tier: {FREE_DAILY_LIMIT - searchCount} of {FREE_DAILY_LIMIT} daily searches remaining.{' '}
            <Link to="/Pricing" className="text-[#007850] font-semibold hover:underline">Upgrade to Pro</Link> for unlimited access to all 5 tools.
          </div>
        )}

        {/* Active tool */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 sm:p-6 overflow-hidden relative z-10">
          {ActiveComponent && <ActiveComponent />}
        </div>

        {/* Tier info */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Free</p>
            <p className="text-xs text-slate-600">Tool 1 only — 3 searches per day</p>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-[#007850] mb-1">Researcher Pro</p>
            <p className="text-xs text-slate-600">All 5 tools — unlimited searches</p>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-violet-600 mb-1">Enterprise</p>
            <p className="text-xs text-slate-600">All tools + bulk batch + CSV export</p>
          </div>
        </div>
      </div>
    </div>
  );
}