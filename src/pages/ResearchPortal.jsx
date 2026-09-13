import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import AuthContext from '../components/auth/AuthContext';
import ElementCell from '@/components/landing/ElementCell';
import {
  Atom, Cpu, FlaskConical, Code2, BarChart2,
  Database, ChevronRight, BookOpen, Shield,
  Microscope, GitBranch, Dna, ArrowRight,
} from 'lucide-react';

const modules = [
  {
    id: 'molecular',
    label: 'Molecule Analysis',
    route: 'MoleculeAnalysis',
    idx: '01',
    sym: 'Ma',
    variant: 'teal',
    badge: 'Live',
    description: 'Query any compound for hazard classification, toxicity profiling, environmental fate, and regulatory status, then visualize its 3D structure and inspect full physical, toxicity, and environmental properties in one unified workspace.',
    metrics: ['PubChem', 'ChEMBL', 'EPA CompTox', '3Dmol.js'],
  },
  {
    id: 'simulation',
    label: 'Computational Simulation',
    route: 'ComputationalStudio',
    idx: '02',
    sym: 'Cs',
    variant: 'purple',
    badge: 'Pro',
    description: 'Semi-empirical and DFT-tier simulations. Upload PDB, SDF, MOL2, or SMILES. 3D WebGL viewer with ESP mapping, NCI detection, and trajectory playback. Run real quantum chemistry with IBM Qiskit, search open materials databases, and build/convert crystal structures.',
    metrics: ['GFN2-xTB', 'B3LYP/6-31G*', 'OpenMM MD', 'IBM Qiskit VQE'],
  },
];

const structuralBiologyTools = [
  { id: 'protein-explorer', label: 'Protein Structure Explorer', route: 'StructuralBiology', idx: '03', sym: 'Pe', variant: 'blue', description: 'Search any human protein by UniProt ID or gene. 3D structures, pLDDT confidence, PAE heatmaps.', tags: ['AlphaFold API', '3Dmol.js', 'pLDDT'], tier: 'Free' },
  { id: 'binding-scanner', label: 'Chemical Binding Risk Scanner', route: 'StructuralBiology', idx: '04', sym: 'Bs', variant: 'purple', description: 'Analyze chemical-protein binding against 10 toxicology target proteins.', tags: ['AlphaFold', 'Toxicology', 'AI'], tier: 'Pro' },
  { id: 'mutation-analyzer', label: 'Mutation Sensitivity Analyzer', route: 'StructuralBiology', idx: '05', sym: 'Ma', variant: 'purple', description: 'AlphaMissense pathogenicity analysis for amino acid variants.', tags: ['AlphaMissense', 'Pathogenicity'], tier: 'Pro' },
  { id: 'domain-heatmap', label: 'Domain Reliability Heatmap', route: 'StructuralBiology', idx: '06', sym: 'Dh', variant: 'teal', description: 'Visualize PAE matrix to assess structural domain reliability. AI interpretation.', tags: ['PAE Matrix', 'AI'], tier: 'Pro' },
  { id: 'population-profiler', label: 'Population Safety Profiler', route: 'StructuralBiology', idx: '07', sym: 'Sp', variant: 'teal', description: 'Personalized ingredient safety warnings from AlphaFold + your health profile.', tags: ['Health Profile', 'Personalized'], tier: 'Pro' },
];

const dataSources = [
  { name: 'PubChem', org: 'NCBI / NIH', records: '130M+', type: 'Compound identity, bioassay, properties' },
  { name: 'ChEMBL', org: 'EMBL-EBI', records: '2.4M+', type: 'Bioactivity, drug-likeness, target data' },
  { name: 'EPA CompTox', org: 'US EPA', records: '900k+', type: 'Toxicity, environmental fate, regulatory' },
  { name: 'AlphaFold DB', org: 'EMBL-EBI / DeepMind', records: '200k+', type: 'Protein structures, pLDDT, PAE, AlphaMissense' },
];

const platformPromises = [
  { icon: Shield, label: 'No black box outputs', desc: 'Every number includes its data source and a confidence score.' },
  { icon: BookOpen, label: 'Citation-ready exports', desc: 'APA, ACS, and Vancouver formats. Export to CSV, JSON, or PDF.' },
  { icon: GitBranch, label: 'Simulation to formula pipeline', desc: 'Transfer any compound directly from simulation into the formula engine.' },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
});

export default function ResearchPortal() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>

      {/* Status strip — light, matches homepage top-band pattern */}
      <div className="border-b" style={{ borderColor: '#E5E7EB', background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-3">
          <Microscope className="w-3.5 h-3.5" style={{ color: '#02988C' }} />
          <span className="font-mono text-[11px] font-bold tracking-widest uppercase" style={{ color: '#5B6168' }}>Research Portal</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px]" style={{ color: '#6B7280' }}>
            <span className="px-1.5 py-0.5 rounded font-mono" style={{ background: '#F0FDFA', color: '#027A70' }}>PubChem</span>
            <span className="px-1.5 py-0.5 rounded font-mono" style={{ background: '#F0FDFA', color: '#027A70' }}>ChEMBL</span>
            <span className="px-1.5 py-0.5 rounded font-mono" style={{ background: '#F5EEFF', color: '#7A3FE0' }}>AlphaFold DB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block ml-1" />
            <span>All systems operational</span>
          </span>
        </div>
      </div>

      {/* Hero — same shape as the homepage hero: eyebrow, heading, sub, CTAs */}
      <section className="px-6 pt-14 pb-10 text-center">
        <motion.div {...fade(0)} className="flex justify-center mb-5">
          <ElementCell index="00" symbol="Rp" variant="purple" />
        </motion.div>
        <motion.span {...fade(0.05)} className="block font-mono text-xs tracking-[0.04em] mb-3" style={{ color: '#7A3FE0' }}>
          MOLECULAR INTELLIGENCE OS
        </motion.span>
        <motion.h1 {...fade(0.1)} className="font-heading font-semibold text-[clamp(26px,4vw,38px)] mb-4 max-w-2xl mx-auto" style={{ color: '#0A1F1D' }}>
          One platform for the complete chemical research workflow.
        </motion.h1>
        <motion.p {...fade(0.15)} className="text-[15px] leading-[1.65] max-w-xl mx-auto mb-8" style={{ color: '#3F4651' }}>
          Query any compound. Run simulations. Generate and validate formulas. Export publication-ready citations.
          Powered by PubChem, ChEMBL, and EPA CompTox — every output includes a source citation and confidence score.
        </motion.p>
        <motion.div {...fade(0.2)} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={createPageUrl(user ? 'ResearchDashboard' : 'ComputationalStudio')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[7px] text-sm font-medium text-white transition-colors"
            style={{ background: '#9531F5' }}
          >
            {user ? <BarChart2 className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
            {user ? 'Open research dashboard' : 'Open computational studio'}
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to={createPageUrl('APIPortal')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[7px] text-sm font-medium border-[1.5px] transition-colors"
            style={{ borderColor: '#E5E7EB', color: '#3F4651' }}
          >
            <Code2 className="w-4 h-4" />
            Browse API docs
          </Link>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">

        {/* General tools */}
        <div className="mb-14">
          <span className="block font-mono text-xs tracking-[0.04em] mb-4" style={{ color: '#027A70' }}>GENERAL TOOLS</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod, i) => (
              <motion.div key={mod.id} {...fade(i * 0.05)}>
                <Link
                  to={createPageUrl(mod.route)}
                  className="group block bg-white border rounded-[10px] p-5 h-full transition-colors"
                  style={{ borderColor: '#E5E7EB' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#02988C')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                >
                  <div className="flex items-start justify-between mb-3.5">
                    <ElementCell index={mod.idx} symbol={mod.sym} variant={mod.variant} />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: '#F0FDFA', color: '#027A70' }}>
                        {mod.badge}
                      </span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" style={{ color: '#9AA3A0' }} />
                    </div>
                  </div>
                  <h3 className="font-medium text-[15px] mb-1.5" style={{ color: '#0A1F1D' }}>{mod.label}</h3>
                  <p className="text-[13px] leading-[1.6] mb-4" style={{ color: '#3F4651' }}>{mod.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mod.metrics.map((m) => (
                      <span key={m} className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: '#F7F6F2', color: '#5B6168', border: '1px solid #E5E7EB' }}>{m}</span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Structural biology */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs tracking-[0.04em]" style={{ color: '#027A70' }}>STRUCTURAL BIOLOGY — ALPHAFOLD INTEGRATION</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#F0FDFF', color: '#0A8AA6' }}>CC BY 4.0</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {structuralBiologyTools.map((tool, i) => (
              <motion.div key={tool.id} {...fade(i * 0.04)}>
                <Link
                  to={createPageUrl(tool.route)}
                  className="group block bg-white border rounded-[10px] p-5 h-full transition-colors"
                  style={{ borderColor: '#E5E7EB' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#02988C')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <ElementCell index={tool.idx} symbol={tool.sym} variant={tool.variant} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: '#F7F6F2', color: '#5B6168' }}>{tool.tier}</span>
                  </div>
                  <h3 className="font-medium text-[14px] mb-1.5" style={{ color: '#0A1F1D' }}>{tool.label}</h3>
                  <p className="text-[13px] leading-[1.6] mb-3" style={{ color: '#3F4651' }}>{tool.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tool.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: '#F7F6F2', color: '#5B6168', border: '1px solid #E5E7EB' }}>{t}</span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Integrated data sources */}
        <div className="mb-14">
          <span className="flex items-center gap-2 font-mono text-xs tracking-[0.04em] mb-4" style={{ color: '#5B6168' }}>
            <Database className="w-3.5 h-3.5" /> INTEGRATED DATA SOURCES
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dataSources.map((src) => (
              <div key={src.name} className="bg-white border rounded-[10px] p-4" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: '#0A1F1D' }}>{src.name}</span>
                  <span className="text-[10px] font-mono" style={{ color: '#027A70' }}>{src.records}</span>
                </div>
                <p className="text-[10px] mb-1" style={{ color: '#9AA3A0' }}>{src.org}</p>
                <p className="text-[12px] leading-snug" style={{ color: '#3F4651' }}>{src.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform promise */}
        <div className="border rounded-[10px] p-6 bg-white mb-14" style={{ borderColor: '#E5E7EB' }}>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {platformPromises.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-[8px] flex items-center justify-center" style={{ background: '#F0FDFA', border: '1px solid #02988C33' }}>
                  <Icon className="w-4 h-4" style={{ color: '#02988C' }} />
                </div>
                <p className="text-[13px] font-medium" style={{ color: '#0A1F1D' }}>{label}</p>
                <p className="text-[11.5px] leading-snug max-w-xs" style={{ color: '#3F4651' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Research API callout */}
        <div className="border rounded-[10px] p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-start gap-4">
            <ElementCell index="08" symbol="Ap" variant="purple" />
            <div>
              <h3 className="text-[15px] font-medium mb-1" style={{ color: '#0A1F1D' }}>Research API</h3>
              <p className="text-[13px] leading-relaxed max-w-md" style={{ color: '#3F4651' }}>
                REST endpoints for compound lookup, hazard scoring, interaction checking, and formula generation. Python, JavaScript, and R SDKs available.
              </p>
            </div>
          </div>
          <Link
            to={createPageUrl('APIPortal')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[7px] text-sm font-medium text-white flex-shrink-0 transition-colors"
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
