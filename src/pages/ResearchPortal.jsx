import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import AuthContext from '../components/auth/AuthContext';
import AnimatedMolecule from '../components/research/AnimatedMolecule';
import {
  Atom, Cpu, FlaskConical, Leaf, Code2, BarChart2,
  Database, ChevronRight, BookOpen, Shield,
  Microscope, Layers, GitBranch, FileText, Dna, ArrowRight,
} from 'lucide-react';

const modules = [
  {
    id: 'molecular',
    label: 'Molecule Analysis',
    route: 'MoleculeAnalysis',
    icon: Atom,
    color: '#09D2FF',
    badge: 'Live',
    description: 'Query any compound for hazard classification, toxicity profiling, environmental fate, and regulatory status, then visualize its 3D structure and inspect full physical, toxicity, and environmental properties in one unified workspace.',
    metrics: ['PubChem', 'ChEMBL', 'EPA CompTox', '3Dmol.js'],
    status: 'operational',
  },
  {
    id: 'simulation',
    label: 'Computational Simulation',
    route: 'ComputationalStudio',
    icon: Cpu,
    color: '#9531F5',
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
    color: '#02988C',
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
    color: '#09D2FF',
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
    color: '#09D2FF',
    description: 'Search any human protein by UniProt ID or gene. 3D structures, pLDDT confidence, PAE heatmaps.',
    tags: ['AlphaFold API', '3Dmol.js', 'pLDDT'],
    tier: 'Free',
  },
  {
    id: 'binding-scanner',
    label: 'Chemical Binding Risk Scanner',
    route: 'StructuralBiology',
    icon: FlaskConical,
    color: '#9531F5',
    description: 'Analyze chemical-protein binding against 10 toxicology target proteins.',
    tags: ['AlphaFold', 'Toxicology', 'AI'],
    tier: 'Pro',
  },
  {
    id: 'mutation-analyzer',
    label: 'Mutation Sensitivity Analyzer',
    route: 'StructuralBiology',
    icon: Dna,
    color: '#9531F5',
    description: 'AlphaMissense pathogenicity analysis for amino acid variants.',
    tags: ['AlphaMissense', 'Pathogenicity'],
    tier: 'Pro',
  },
  {
    id: 'domain-heatmap',
    label: 'Domain Reliability Heatmap',
    route: 'StructuralBiology',
    icon: BarChart2,
    color: '#02988C',
    description: 'Visualize PAE matrix to assess structural domain reliability. AI interpretation.',
    tags: ['PAE Matrix', 'AI'],
    tier: 'Pro',
  },
  {
    id: 'population-profiler',
    label: 'Population Safety Profiler',
    route: 'StructuralBiology',
    icon: Shield,
    color: '#02988C',
    description: 'Personalized ingredient safety warnings from AlphaFold + your health profile.',
    tags: ['Health Profile', 'Personalized'],
    tier: 'Pro',
  },
];

const dataSources = [
  { name: 'PubChem', org: 'NCBI / NIH', records: '130M+', type: 'Compound identity, bioassay, properties' },
  { name: 'ChEMBL', org: 'EMBL-EBI', records: '2.4M+', type: 'Bioactivity, drug-likeness, target data' },
  { name: 'EPA CompTox', org: 'US EPA', records: '900k+', type: 'Toxicity, environmental fate, regulatory' },
  { name: 'AlphaFold DB', org: 'EMBL-EBI / DeepMind', records: '200k+', type: 'Protein structures, pLDDT, PAE, AlphaMissense' },
];

const platformPromises = [
  { icon: Shield, label: 'No Black Box Outputs', desc: 'Every number includes its data source and a confidence score.' },
  { icon: BookOpen, label: 'Citation-Ready Exports', desc: 'APA, ACS, and Vancouver formats. Export to CSV, JSON, or PDF.' },
  { icon: GitBranch, label: 'Simulation to Formula Pipeline', desc: 'Transfer any compound directly from simulation into the formula engine.' },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
});

export default function ResearchPortal() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[#0b0f10] text-slate-300 font-body">
      {/* Status utility strip */}
      <div className="border-b border-[#1c2428] bg-[#0b0f10]/95 backdrop-blur-md sticky top-[60px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-3">
          <Microscope className="w-3.5 h-3.5 text-[#09D2FF]" />
          <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">Research Portal</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-semibold">PubChem</span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-semibold">ChEMBL</span>
            <span className="px-1.5 py-0.5 rounded bg-[#9531F5]/10 border border-[#9531F5]/20 text-[#b694f7] font-semibold">AlphaFold DB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block ml-1 animate-pulse" style={{ boxShadow: '0 0 6px #34d399' }} />
            <span className="text-slate-500">All systems operational</span>
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Neon light pillars */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center gap-6 sm:gap-10 h-[280px] opacity-60">
          <div className="w-1 h-32 sm:h-44 rounded-full" style={{ background: 'linear-gradient(to top, #02988C, transparent)' }} />
          <div className="w-1 h-40 sm:h-56 rounded-full" style={{ background: 'linear-gradient(to top, #09D2FF, transparent)' }} />
          <div className="w-1 h-48 sm:h-64 rounded-full" style={{ background: 'linear-gradient(to top, #9531F5, transparent)' }} />
          <div className="w-1 h-40 sm:h-56 rounded-full" style={{ background: 'linear-gradient(to top, #09D2FF, transparent)' }} />
          <div className="w-1 h-32 sm:h-44 rounded-full" style={{ background: 'linear-gradient(to top, #02988C, transparent)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 text-center">
          {/* Glowing 3D molecule */}
          <motion.div {...fade(0)} className="w-full h-[200px] sm:h-[260px] mb-2">
            <AnimatedMolecule className="w-full h-full" />
          </motion.div>

          <motion.span
            {...fade(0.1)}
            className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#09D2FF] border border-[#09D2FF]/30 bg-[#09D2FF]/5 rounded px-3 py-1 mb-5"
          >
            Molecular Intelligence OS
          </motion.span>

          <motion.h1
            {...fade(0.15)}
            className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight tracking-tight mb-5"
          >
            One platform for the complete{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #02988C, #09D2FF, #9531F5)' }}>
              chemical research workflow.
            </span>
          </motion.h1>

          <motion.p
            {...fade(0.2)}
            className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto mb-8"
          >
            Query any compound. Run simulations. Generate and validate formulas. Export publication-ready citations.
            Powered by PubChem, ChEMBL, and EPA CompTox, every output includes source citation and confidence score.
          </motion.p>

          <motion.div {...fade(0.25)} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={createPageUrl(user ? 'ResearchDashboard' : 'ComputationalStudio')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: '#9531F5', boxShadow: '0 0 24px rgba(149,49,245,0.35)' }}
            >
              {user ? (
                <>
                  <BarChart2 className="w-4 h-4" />
                  Open Research Dashboard
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  Open Computational Studio
                </>
              )}
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to={createPageUrl('APIPortal')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border border-white/15 text-slate-300 bg-white/5 hover:bg-white/10 transition-all"
            >
              <Code2 className="w-4 h-4" />
              Browse API docs
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {/* General Tools */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <Atom className="w-3.5 h-3.5 text-[#09D2FF]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">General Tools</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.div key={mod.id} {...fade(i * 0.05)}>
                  <Link
                    to={createPageUrl(mod.route)}
                    className="group bg-white/[0.03] hover:bg-white/[0.06] border border-[#222a2e] hover:border-[#3a4448] rounded-lg p-5 transition-all duration-200 flex flex-col h-full hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: mod.color + '15', border: `1px solid ${mod.color}40` }}
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
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#09D2FF] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">{mod.label}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed flex-1 mb-4">{mod.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mod.metrics.map((m) => (
                        <span key={m} className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Structural Biology */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <Dna className="w-3.5 h-3.5 text-[#09D2FF]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Structural Biology, AlphaFold Integration</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#09D2FF]/10 border border-[#09D2FF]/20 text-[#09D2FF] font-semibold">CC BY 4.0</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {structuralBiologyTools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div key={tool.id} {...fade(i * 0.05)}>
                  <Link
                    to={createPageUrl(tool.route)}
                    className="group bg-white/[0.03] hover:bg-white/[0.06] border border-[#222a2e] hover:border-[#3a4448] rounded-lg p-5 transition-all duration-200 flex flex-col h-full hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: tool.color + '15', border: `1px solid ${tool.color}40` }}
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
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#09D2FF] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">{tool.label}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed flex-1 mb-3">{tool.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.tags.map((t) => (
                        <span key={t} className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Integrated Data Sources */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Integrated Data Sources</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dataSources.map((src) => (
              <div key={src.name} className="bg-white/[0.03] border border-[#222a2e] rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{src.name}</span>
                  <span className="text-[10px] text-[#02988C] font-mono">{src.records}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-1">{src.org}</p>
                <p className="text-xs text-slate-400 leading-snug">{src.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform promise */}
        <div className="border border-[#222a2e] rounded-lg p-6 bg-white/[0.02] mb-14">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {platformPromises.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#02988C]/10 border border-[#02988C]/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#02988C]" />
                </div>
                <p className="text-xs font-semibold text-white">{label}</p>
                <p className="text-[11px] text-slate-400 leading-snug max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Research API */}
        <div className="border border-[#222a2e] rounded-lg p-6 bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#9531F5]/10 border border-[#9531F5]/20">
              <Code2 className="w-5 h-5 text-[#9531F5]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Research API</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                REST endpoints for compound lookup, hazard scoring, interaction checking, and formula generation. Python, JavaScript, and R SDKs available.
              </p>
            </div>
          </div>
          <Link
            to={createPageUrl('APIPortal')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 flex-shrink-0"
            style={{ background: '#9531F5' }}
          >
            Research API
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}