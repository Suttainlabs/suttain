import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '../components/auth/AuthContext';
import {
  Atom, Cpu, FlaskConical, Leaf, Code2, BarChart2,
  Database, ChevronRight, BookOpen, ExternalLink, Shield,
  Globe, Microscope, Layers, GitBranch, FileText, Zap
} from 'lucide-react';

const modules = [
  {
    id: 'molecular',
    label: 'Molecular Intelligence',
    route: 'MolecularIntelligence',
    icon: Atom,
    color: '#0D9E8E',
    badge: 'Live',
    description: 'Hazard classification, toxicity profiling, environmental fate, and regulatory status for any compound. Query by name, SMILES, InChI, or ingredient list.',
    metrics: ['PubChem', 'ChEMBL', 'EPA CompTox'],
    status: 'operational',
  },
  {
    id: 'simulation',
    label: 'Computational Simulation',
    route: 'ComputationalSimulation',
    icon: Cpu,
    color: '#6366f1',
    badge: 'Pro',
    description: 'Semi-empirical and DFT-tier simulations. Upload PDB, SDF, MOL2, or SMILES. 3D WebGL viewer with ESP mapping, NCI detection, and trajectory playback.',
    metrics: ['GFN2-xTB', 'B3LYP/6-31G*', 'OpenMM MD'],
    status: 'operational',
  },
  {
    id: 'formula',
    label: 'Formula Intelligence',
    route: 'generator',
    icon: FlaskConical,
    color: '#f59e0b',
    badge: 'Live',
    description: 'Generate complete formulas from a plain-language goal. INCI names, percentage ranges, pH guidance, preservation systems, and estimated shelf life.',
    metrics: ['Safety Score', 'Sustainability Score', 'Compliance Check'],
    status: 'operational',
  },
  {
    id: 'sustainability',
    label: 'Sustainability Intelligence',
    route: 'ComparativeImpactReport',
    icon: Leaf,
    color: '#10b981',
    badge: 'Live',
    description: 'Sustainability scoring for every ingredient and formula. Radar chart benchmarked against 500+ commercially verified products. Exportable reports.',
    metrics: ['Biodegradability', 'Aquatic Toxicity', 'Carbon Intensity'],
    status: 'operational',
  },
  {
    id: 'api',
    label: 'Research API',
    route: 'APIPortal',
    icon: Code2,
    color: '#8b5cf6',
    badge: 'Pro',
    description: 'Developer-facing REST API with endpoints for compound lookup, hazard scoring, interaction checking, and formula generation. JSON with confidence scores on every field.',
    metrics: ['Python SDK', 'JavaScript SDK', 'Interactive Docs'],
    status: 'operational',
  },
  {
    id: 'sds',
    label: 'SDS Analyzer',
    route: 'SDSAnalyzer',
    icon: FileText,
    color: '#64748b',
    badge: 'Live',
    description: 'Upload Safety Data Sheets and extract hazard data, GHS classifications, first aid measures, and regulatory information automatically.',
    metrics: ['PDF Parsing', 'GHS Extraction', 'Regulatory Mapping'],
    status: 'operational',
  },
];

const dataSources = [
  { name: 'PubChem', org: 'NCBI / NIH', records: '117M+', type: 'Compound identity, bioassay, properties' },
  { name: 'ChEMBL', org: 'EMBL-EBI', records: '2.4M+', type: 'Bioactivity, drug-likeness, target data' },
  { name: 'EPA CompTox', org: 'US EPA', records: '900k+', type: 'Toxicity, environmental fate, regulatory' },
  { name: 'RCSB PDB', org: 'Research Collaboratory', records: '220k+', type: 'Protein structures, ligand binding' },
];

export default function ResearchPortal() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Sub-header */}
      <div className="border-b border-slate-700/50 bg-slate-900/60 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-3">
          <Microscope className="w-3.5 h-3.5 text-[#0D9E8E]" />
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Research Portal</span>
          <span className="ml-auto flex items-center gap-2 text-[10px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            All systems operational
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D9E8E] border border-[#0D9E8E]/30 rounded px-2 py-0.5">
              Molecular Intelligence OS
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4 max-w-3xl">
            One platform for the complete<br />
            <span style={{ color: '#0D9E8E' }}>chemical research workflow.</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed mb-6">
            Query any compound. Run simulations. Generate and validate formulas. Export publication-ready citations.
            Powered by PubChem, ChEMBL, and EPA CompTox — every output includes source citation and confidence score.
          </p>
          {user && (
            <Link
              to={createPageUrl('ResearchDashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D9E8E]/10 hover:bg-[#0D9E8E]/20 border border-[#0D9E8E]/30 text-[#0D9E8E] text-sm font-semibold rounded-lg transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              Open Research Dashboard
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-14">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.id}
                to={createPageUrl(mod.route)}
                className="group bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 hover:border-slate-600/70 rounded-xl p-5 transition-all duration-200 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: mod.color + '18', border: `1px solid ${mod.color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: mod.color }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                      style={{ backgroundColor: mod.color + '15', color: mod.color }}
                    >
                      {mod.badge}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{mod.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4">{mod.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {mod.metrics.map((m) => (
                    <span key={m} className="text-[10px] font-mono text-slate-600 bg-slate-900/60 px-2 py-0.5 rounded">
                      {m}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Data sources */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Integrated Data Sources</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dataSources.map((src) => (
              <div key={src.name} className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-bold text-white">{src.name}</span>
                  <span className="text-[10px] text-[#0D9E8E] font-mono">{src.records}</span>
                </div>
                <p className="text-[10px] text-slate-600 mb-1">{src.org}</p>
                <p className="text-xs text-slate-500 leading-snug">{src.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform promise */}
        <div className="border border-slate-700/40 rounded-xl p-6 bg-slate-800/20">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Shield, label: 'No Black Box Outputs', desc: 'Every number includes its data source and a confidence score.' },
              { icon: BookOpen, label: 'Citation-Ready Exports', desc: 'APA, ACS, and Vancouver formats. Export to CSV, JSON, or PDF.' },
              { icon: GitBranch, label: 'Simulation to Formula Pipeline', desc: 'Transfer any compound directly from simulation into the formula engine.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#0D9E8E]/10 border border-[#0D9E8E]/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#0D9E8E]" />
                </div>
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="text-[11px] text-slate-500 leading-snug max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}