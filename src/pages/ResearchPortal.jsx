import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '../components/auth/AuthContext';
import {
  Atom, Cpu, FlaskConical, Leaf, Code2, BarChart2,
  Database, ChevronRight, BookOpen, Shield,
  Globe, Microscope, Layers, GitBranch, FileText, Zap, Dna
} from 'lucide-react';

const modules = [
  {
    id: 'molecular',
    label: 'Molecule Analysis',
    route: 'MoleculeAnalysis',
    icon: Atom,
    color: '#6B3FA0',
    badge: 'Live',
    description: 'Query any compound for hazard classification, toxicity profiling, environmental fate, and regulatory status — then visualize its 3D structure and inspect full physical, toxicity, and environmental properties in one unified workspace.',
    metrics: ['PubChem', 'ChEMBL', 'EPA CompTox', '3Dmol.js'],
    status: 'operational',
  },
  {
    id: 'simulation',
    label: 'Computational Simulation',
    route: 'ComputationalSimulation',
    icon: Cpu,
    color: '#00A8C8',
    badge: 'Pro',
    description: 'Semi-empirical and DFT-tier simulations. Upload PDB, SDF, MOL2, or SMILES. 3D WebGL viewer with ESP mapping, NCI detection, and trajectory playback. Run real quantum chemistry with IBM Qiskit, search open materials databases (Materials Project, OPTIMADE), and build/convert crystal structures with ASE-compatible tools and 3D measurement.',
    metrics: ['GFN2-xTB', 'B3LYP/6-31G*', 'OpenMM MD', 'IBM Qiskit VQE', 'Materials Project', 'ASE Structure Tools'],
    status: 'operational',
  },
  {
    id: 'comparison',
    label: 'Chemical Comparison',
    route: 'ChemicalComparison',
    icon: GitBranch,
    color: '#007850',
    badge: 'Live',
    description: 'Side-by-side comparison of any two compounds. Contrast molecular structure, physical properties, toxicity, and environmental data with delta highlighting.',
    metrics: ['3D Structures', 'Property Deltas', 'PubChem Search'],
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

const structuralBiologyTools = [
  {
    id: 'protein-explorer',
    label: 'Protein Structure Explorer',
    route: 'StructuralBiology',
    icon: Microscope,
    color: '#00A8C8',
    description: 'Search any human protein by UniProt ID or gene. 3D structures, pLDDT confidence, PAE heatmaps.',
    tags: ['AlphaFold API', '3Dmol.js', 'pLDDT'],
    tier: 'Free',
  },
  {
    id: 'binding-scanner',
    label: 'Chemical Binding Risk Scanner',
    route: 'StructuralBiology',
    icon: FlaskConical,
    color: '#C42B2B',
    description: 'Analyze chemical-protein binding against 10 toxicology target proteins.',
    tags: ['AlphaFold', 'Toxicology', 'AI'],
    tier: 'Pro',
  },
  {
    id: 'mutation-analyzer',
    label: 'Mutation Sensitivity Analyzer',
    route: 'StructuralBiology',
    icon: Dna,
    color: '#6B3FA0',
    description: 'AlphaMissense pathogenicity analysis for amino acid variants.',
    tags: ['AlphaMissense', 'Pathogenicity'],
    tier: 'Pro',
  },
  {
    id: 'domain-heatmap',
    label: 'Domain Reliability Heatmap',
    route: 'StructuralBiology',
    icon: BarChart2,
    color: '#007850',
    description: 'Visualize PAE matrix to assess structural domain reliability. AI interpretation.',
    tags: ['PAE Matrix', 'AI'],
    tier: 'Pro',
  },
  {
    id: 'population-profiler',
    label: 'Population Safety Profiler',
    route: 'StructuralBiology',
    icon: Shield,
    color: '#007850',
    description: 'Personalized ingredient safety warnings from AlphaFold + your health profile.',
    tags: ['Health Profile', 'Personalized'],
    tier: 'Pro',
  },
];

const dataSources = [
  { name: 'PubChem', org: 'NCBI / NIH', records: '118M+', type: 'Compound identity, bioassay, properties' },
  { name: 'ChEMBL', org: 'EMBL-EBI', records: '2.4M+', type: 'Bioactivity, drug-likeness, target data' },
  { name: 'EPA CompTox', org: 'US EPA', records: '900k+', type: 'Toxicity, environmental fate, regulatory' },
  { name: 'AlphaFold DB', org: 'EMBL-EBI / DeepMind', records: '200k+', type: 'Protein structures, pLDDT, PAE, AlphaMissense' },
];

export default function ResearchPortal() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[#EDF7F2] text-slate-800">
      {/* Sub-header */}
      <div className="border-b border-slate-200 bg-white/80 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-3">
          <Microscope className="w-3.5 h-3.5 text-[#007850]" />
          <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">Research Portal</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">PubChem</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">ChEMBL</span>
            <span className="px-1.5 py-0.5 rounded bg-violet-50 text-[#6B3FA0] font-bold">AlphaFold DB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-1" />
            All systems operational
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#007850] border border-teal-200 bg-teal-50 rounded px-2 py-0.5">
              Molecular Intelligence OS
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4 max-w-3xl">
            One platform for the complete<br />
            <span style={{ color: '#007850' }}>chemical research workflow.</span>
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl leading-relaxed mb-6">
            Query any compound. Run simulations. Generate and validate formulas. Export publication-ready citations.
            Powered by PubChem, ChEMBL, and EPA CompTox — every output includes source citation and confidence score.
          </p>
          {user && (
            <Link
              to={createPageUrl('ResearchDashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#007850] text-sm font-semibold rounded-lg transition-colors"
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
                className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-violet-200 rounded-xl p-5 transition-all duration-200 flex flex-col hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: mod.color + '15', border: `1px solid ${mod.color}30` }}
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
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">{mod.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4">{mod.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {mod.metrics.map((m) => (
                    <span key={m} className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {m}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Structural Biology section */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Dna className="w-3.5 h-3.5 text-[#00A8C8]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Structural Biology — AlphaFold Integration</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-[#00A8C8] font-bold">CC BY 4.0</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {structuralBiologyTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  to={createPageUrl(tool.route)}
                  className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-violet-200 rounded-xl p-5 transition-all duration-200 flex flex-col hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: tool.color + '15', border: `1px solid ${tool.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: tool.color }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                        style={{ backgroundColor: tool.color + '15', color: tool.color }}
                      >
                        {tool.tier}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{tool.label}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-3">{tool.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tool.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Data sources */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Integrated Data Sources</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dataSources.map((src) => (
              <div key={src.name} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900">{src.name}</span>
                  <span className="text-[10px] text-[#007850] font-mono">{src.records}</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-1">{src.org}</p>
                <p className="text-xs text-slate-500 leading-snug">{src.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform promise */}
        <div className="border border-slate-200 rounded-xl p-6 bg-white">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Shield, label: 'No Black Box Outputs', desc: 'Every number includes its data source and a confidence score.' },
              { icon: BookOpen, label: 'Citation-Ready Exports', desc: 'APA, ACS, and Vancouver formats. Export to CSV, JSON, or PDF.' },
              { icon: GitBranch, label: 'Simulation to Formula Pipeline', desc: 'Transfer any compound directly from simulation into the formula engine.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#007850]" />
                </div>
                <p className="text-xs font-bold text-slate-900">{label}</p>
                <p className="text-[11px] text-slate-500 leading-snug max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}