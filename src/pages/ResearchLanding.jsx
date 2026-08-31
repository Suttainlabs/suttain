import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, FlaskConical, Atom, Microscope, Code2,
  Cpu, BarChart3, Database, ShieldCheck, Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SEOHead from "../components/shared/SEOHead";
import { Section, SectionHeader } from "../components/shared/Section";
import AnimatedMolecule from "../components/research/AnimatedMolecule";
import ResearchPlanner from "../components/research/ResearchPlanner";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

const RESEARCH_TOOLS = [
  {
    icon: FlaskConical,
    label: "Computational Studio",
    desc: "Unified workspace for molecules, proteins, materials, and hazard prediction.",
    href: "ComputationalStudio",
    accent: "#9531F5",
  },
  {
    icon: Atom,
    label: "Molecule Analysis",
    desc: "Query compounds, visualize 3D structure, inspect physical and toxicity properties.",
    href: "MoleculeAnalysis",
    accent: "#09D2FF",
  },
  {
    icon: Microscope,
    label: "Structural Biology",
    desc: "AlphaFold-powered protein structure prediction and binding analysis.",
    href: "StructuralBiology",
    accent: "#02988C",
  },
  {
    icon: Code2,
    label: "Research API",
    desc: "REST endpoints with Python, JavaScript, and R SDKs for programmatic access.",
    href: "APIPortal",
    accent: "#9531F5",
  },
];

const CAPABILITIES = [
  { icon: Cpu, label: "Semi-empirical and DFT simulations", desc: "GFN2-xTB, PM7, and quantum chemistry via cloud compute." },
  { icon: Database, label: "130M+ compound database", desc: "PubChem, ChEMBL, EPA CompTox, and RCSB PDB integrated." },
  { icon: BarChart3, label: "Hazard and toxicity prediction", desc: "Physicochemical baselines with GHS classification and validation." },
  { icon: ShieldCheck, label: "Regulatory compliance tracking", desc: "GHS, FDA, and EU REACH documentation support." },
];

export default function ResearchLanding() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] font-body">
      <SEOHead
        title="Suttain Research — Computational Chemistry Platform"
        description="Professional research tools for molecular intelligence, computational simulation, structural biology, and API access."
      />

      {/* Hero */}
      <Section spacing="default" width="default" className="hero-offset">
        <motion.div {...fade(0)} className="w-full h-[260px] sm:h-[320px] mb-6">
          <AnimatedMolecule className="w-full h-full" />
        </motion.div>
        <SectionHeader
          as="h1"
          align="center"
          headingClassName="text-2xl sm:text-3xl lg:text-4xl font-medium text-slate-900 tracking-tight"
          heading="Computational chemistry, in your browser"
          subtextClassName="text-sm sm:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto"
          subtext="Query compounds, run simulations, predict protein structures, and access everything programmatically. Built for research chemists and scientists."
        />

        <motion.div {...fade(0.15)} className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link to={createPageUrl("ComputationalStudio")}>
            <button
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ background: "#9531F5" }}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Open Computational Studio
              </span>
            </button>
          </Link>
          <Link to={createPageUrl("APIPortal")}>
            <button className="px-6 py-3 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-all">
              Browse API docs
            </button>
          </Link>
        </motion.div>
      </Section>

      {/* Tool grid */}
      <Section spacing="default" width="default" background="muted" className="border-y border-slate-100">
        <SectionHeader
          align="center"
          eyebrow={<span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Research Tools</span>}
          headingClassName="text-xl sm:text-2xl font-medium text-slate-900"
          heading="Four tools, one platform"
          subtextClassName="text-slate-500 text-sm sm:text-base"
          subtext="Each tool is standalone but designed to work together across your research workflow."
        />
        <div className="grid sm:grid-cols-2 gap-5 mt-8 max-w-4xl mx-auto">
          {RESEARCH_TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div key={i} {...fade(i * 0.05)}>
                <Link
                  to={createPageUrl(tool.href)}
                  className="block bg-white rounded-xl border border-slate-200 p-6 h-full group hover:shadow-lg hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${tool.accent}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: tool.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-slate-900 mb-1">{tool.label}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{tool.desc}</p>
                      <div className="flex items-center gap-1 mt-3 text-sm font-semibold" style={{ color: tool.accent }}>
                        Open tool
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Capabilities */}
      <Section spacing="default" width="default">
        <SectionHeader
          align="center"
          eyebrow={<span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Platform Capabilities</span>}
          headingClassName="text-xl sm:text-2xl font-medium text-slate-900"
          heading="What you can do here"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8 max-w-4xl mx-auto">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div key={i} {...fade(i * 0.05)}>
                <div className="bg-white rounded-xl p-5 border border-slate-200 h-full">
                  <Icon className="w-5 h-5 mb-3" style={{ color: "#9531F5" }} />
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{cap.label}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{cap.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Plan Your Research */}
      <Section spacing="default" width="default">
        <ResearchPlanner />
      </Section>
    </div>
  );
}