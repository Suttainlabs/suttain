import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import SEOHead, { pageSEO } from '../components/shared/SEOHead';
import {
  ArrowRight,
  Atom,
  Beaker,
  Cpu,
  Database,
  Microscope,
  Code2,
  FlaskConical,
  Layers,
  ShieldCheck,
  Terminal,
  Zap,
  QrCode,
  Droplets,
  BookOpen,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-200 font-body antialiased">
      <SEOHead {...pageSEO.about} />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/5">
        {/* Ambient gradient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80rem] h-[40rem] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[40rem] h-[40rem] bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 md:py-40 text-center">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase border border-violet-400/30 bg-violet-500/10 text-violet-300">
              <Atom className="w-3.5 h-3.5" />
              Molecular Intelligence OS
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-8 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white font-heading leading-[1.05]"
          >
            The operating system for
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
              molecular intelligence
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Suttain unifies chemical databases, computational simulation, and structural biology
            into a single research portal — built for scientists who need to move from hypothesis
            to insight without leaving the browser.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-500 text-white border-0">
              <Link to="/APIPortal">
                Explore the API <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/research">Enter the Research Portal</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Platform Architecture (single-column narrative) ── */}
      <section className="relative border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
          <motion.div {...fadeUp}>
            <span className="text-xs font-medium tracking-wider uppercase text-violet-400">
              Platform Architecture
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white font-heading leading-tight">
              One platform. Two portals. A complete molecular toolkit.
            </h2>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ delay: 0.05 }}
            className="mt-8 text-lg text-slate-400 leading-relaxed"
          >
            Suttain has evolved from a consumer safety tool into a professional-grade research
            environment. The same intelligence that powers everyday product scanning now drives
            high-fidelity computational chemistry, protein structure analysis, and enterprise-scale
            API access — all from a unified data layer.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <Microscope className="w-5 h-5 text-violet-300" />
                </div>
                <h3 className="text-lg font-semibold text-white">Research Portal</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Molecular intelligence, computational simulation, structural biology, and
                enterprise API access for professional chemists and scientists.
              </p>
              <Link
                to="/research"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors"
              >
                Enter portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                  <Beaker className="w-5 h-5 text-teal-300" />
                </div>
                <h3 className="text-lg font-semibold text-white">Consumer Toolset</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Chemical safety simulation, formula generation, product scanning, and hydration
                intelligence — accessible safety tools for everyday use.
              </p>
              <Link
                to={createPageUrl('Simulator')}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal-300 hover:text-teal-200 transition-colors"
              >
                Open tools <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Feature Deep-Dive (3-column grid) ──────────────── */}
      <section className="relative border-b border-white/5 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <motion.div {...fadeUp} className="max-w-2xl">
            <span className="text-xs font-medium tracking-wider uppercase text-cyan-400">
              Capabilities
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white font-heading leading-tight">
              Research-grade tools, natively integrated
            </h2>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed">
              Every module shares the same chemical knowledge graph — so a structure queried in the
              explorer flows directly into a simulation, a compliance check, or an API response.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/10">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                {...fadeUp}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-[#0A0E17] p-8 hover:bg-white/[0.03] transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                  <feature.icon className="w-5 h-5 text-violet-300" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data Infrastructure ─────────────────────────────── */}
      <section className="relative border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-medium tracking-wider uppercase text-teal-400">
              Data Infrastructure
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white font-heading">
              Grounded in trusted scientific sources
            </h2>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed">
              Suttain integrates authoritative chemical and biological databases so your results
              are reproducible and citation-ready.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {DATA_SOURCES.map((source) => (
              <div
                key={source.name}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-6 text-center"
              >
                <p className="text-sm font-semibold text-white tracking-wide">{source.name}</p>
                <p className="mt-1 text-xs text-slate-500">{source.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[30rem] bg-violet-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-heading leading-tight">
              Build with molecular intelligence
            </h2>
            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Integrate Suttain into your research pipeline with REST endpoints and SDKs, or
              request a guided demo for your team.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-500 text-white border-0">
              <Link to="/APIPortal">
                <Terminal className="w-4 h-4 mr-2" />
                View API Documentation
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to={createPageUrl('BookADemo')}>Request a Demo</Link>
            </Button>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ delay: 0.15 }}
            className="mt-10 text-sm text-slate-500"
          >
            Looking for everyday safety tools?{' '}
            <Link
              to={createPageUrl('Simulator')}
              className="text-teal-400 hover:text-teal-300 underline-offset-4 hover:underline"
            >
              Access the consumer toolset
            </Link>
            .
          </motion.p>
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    icon: Atom,
    title: 'Molecular Intelligence',
    desc: 'Query any compound by name, SMILES, InChI, or CAS. Get hazard classification, toxicity, and regulatory status in one call.',
  },
  {
    icon: Cpu,
    title: 'Computational Simulation',
    desc: 'Run DFT, molecular dynamics, and quantum chemistry workflows with configurable forcefields and solvation models.',
  },
  {
    icon: Microscope,
    title: 'Structural Biology',
    desc: 'AlphaFold-integrated protein structure prediction, mutation pathogenicity, and binding risk assessment.',
  },
  {
    icon: Database,
    title: 'Chemical Knowledge Graph',
    desc: 'A unified data layer spanning PubChem, ChEMBL, and EPA CompTox — shared across every module.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance & SDS',
    desc: 'Automated GHS classification, regulatory checks, and Safety Data Sheet extraction and analysis.',
  },
  {
    icon: Code2,
    title: 'Enterprise API',
    desc: 'REST endpoints with Python, JavaScript, and R SDKs for integrating molecular intelligence at scale.',
  },
];

const DATA_SOURCES = [
  { name: 'PubChem', desc: 'Compound data' },
  { name: 'ChEMBL', desc: 'Bioactivity' },
  { name: 'EPA CompTox', desc: 'Toxicology' },
  { name: 'RCSB PDB', desc: '3D structures' },
];