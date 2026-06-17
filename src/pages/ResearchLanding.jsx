import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Atom, Cpu, Leaf, BarChart2, FlaskConical, Dna,
  Microscope, BookOpen, ShieldCheck, Zap, ArrowRight,
  Layers, Binary, Globe, Server, Cloud, Lock, Database,
  Terminal, Code2, Cpu as Processor, GitBranch, Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ADVANCED_MODULES = [
  {
    title: "Molecular Intelligence",
    description: "Hazard scoring, toxicity profiling, and regulatory mapping via PubChem, ChEMBL, and EPA CompTox.",
    icon: Atom,
    href: "MolecularIntelligence",
    gradient: "from-violet-600 to-indigo-600",
    tags: ["PubChem", "ChEMBL", "Toxicity"],
    status: "live"
  },
  {
    title: "Computational Simulations",
    description: "DFT calculations, molecular dynamics, protein modeling, and QM/MM hybrid simulations.",
    icon: Cpu,
    href: "ComputationalSimulation",
    gradient: "from-cyan-500 to-blue-600",
    tags: ["DFT", "MD", "GROMACS"],
    status: "pro"
  },
  {
    title: "Carbon & Sustainability",
    description: "Carbon tax modeling, decarbonization ROI, lifecycle assessment, and ESG compliance reporting.",
    icon: Leaf,
    href: "CarbonTaxSimulator",
    gradient: "from-emerald-500 to-teal-600",
    tags: ["LCA", "ESG", "Carbon Tax"],
    status: "live"
  },
  {
    title: "Formula Simulation Engine",
    description: "Real-time ingredient percentage adjustment with live cost, safety, and sustainability shift visualization.",
    icon: FlaskConical,
    href: "SimulationEngine",
    gradient: "from-amber-500 to-orange-600",
    tags: ["Simulation", "Cost", "Safety"],
    status: "pro"
  },
  {
    title: "Comparative Impact Reports",
    description: "Benchmark formulations against industry averages with detailed eco-score delta analysis.",
    icon: BarChart2,
    href: "ComparativeImpactReport",
    gradient: "from-rose-500 to-pink-600",
    tags: ["Benchmark", "Eco-Score"],
    status: "live"
  },
  {
    title: "Research Dashboard",
    description: "Centralized workspace for saved queries, formulas, simulation history, and cross-referenced results.",
    icon: BookOpen,
    href: "ResearchDashboard",
    gradient: "from-slate-600 to-slate-800",
    tags: ["Workspace", "History"],
    status: "live"
  },
  {
    title: "Molecule Explorer",
    description: "Interactive 3D molecular visualization with real-time structure search and property analysis.",
    icon: Dna,
    href: "MoleculeExplorer",
    gradient: "from-fuchsia-500 to-purple-600",
    tags: ["3Dmol.js", "PubChem"],
    status: "pro"
  },
  {
    title: "Chemical Comparison",
    description: "Side-by-side technical evaluation of two compounds with delta highlighting across all property dimensions.",
    icon: Layers,
    href: "ChemicalComparison",
    gradient: "from-amber-600 to-red-600",
    tags: ["Delta", "Compare"],
    status: "live"
  },
  {
    title: "SDS Analyzer",
    description: "Automated safety data sheet ingestion, hazard extraction, and GHS classification mapping.",
    icon: ShieldCheck,
    href: "SDSAnalyzer",
    gradient: "from-red-500 to-rose-600",
    tags: ["GHS", "SDS", "Hazard"],
    status: "live"
  }
];

const STACK_SECTION = [
  { name: "PubChem REST API", desc: "Compound identity, properties, bioassay data", icon: Database },
  { name: "ChEMBL", desc: "Bioactivity data for drug-like molecules", icon: Binary },
  { name: "EPA CompTox", desc: "Chemical safety and toxicity dashboards", icon: ShieldCheck },
  { name: "RCSB PDB", desc: "3D structural data for proteins and nucleic acids", icon: Layers },
  { name: "3Dmol.js", desc: "WebGL molecular visualization engine", icon: Globe },
];

export default function ResearchLanding() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100">
      {/* ── Ambient background effects ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-96 -left-96 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[180px]" />
        <div className="absolute top-1/3 -right-96 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[150px]" />
        <div className="absolute -bottom-96 left-1/3 w-[700px] h-[700px] bg-emerald-500/6 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10">
        {/* ── Hero Section ── */}
        <section className="px-6 pt-24 pb-20 max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 mb-6 px-4 py-1.5 text-xs tracking-widest uppercase">
              Molecular Intelligence OS
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Research Portal
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-4">
              A unified computational chemistry platform integrating public databases,
              AI-powered molecular analysis, and advanced simulation engines for professional researchers.
            </p>

            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Powered by PubChem, ChEMBL, EPA CompTox, and RCSB PDB. Built for chemists, pharmacologists, and materials scientists.
            </p>

            <div className="flex items-center justify-center gap-4 mt-10">
              <Link to={createPageUrl("MolecularIntelligence")}>
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0 h-14 px-8 text-base font-semibold rounded-xl shadow-lg shadow-violet-500/25">
                  Launch Molecular Intelligence
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("APIPortal")}>
                <Button variant="outline" size="lg" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-14 px-8 text-base rounded-xl">
                  <Terminal className="mr-2 w-5 h-5" />
                  API Access
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="border-y border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: "115M+", label: "Compounds Indexed", sub: "Across PubChem & ChEMBL" },
                { value: "12+", label: "Simulation Engines", sub: "DFT, MD, QM/MM & more" },
                { value: "8", label: "Regulatory Frameworks", sub: "GHS, REACH, EPA, FDA" },
                { value: "< 3s", label: "Average Query Time", sub: "API-backed with caching" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-slate-300 mt-1">{stat.label}</div>
                  <div className="text-xs text-slate-500">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Advanced Modules Grid ── */}
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-xs text-violet-400 uppercase tracking-[0.2em] font-semibold mb-3">Advanced Tools</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Computational Research Suite
            </h2>
            <p className="text-slate-400 max-w-2xl">
              Every module connects to live databases and runs on production-grade simulation infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ADVANCED_MODULES.map((module, i) => (
              <Link
                key={i}
                to={createPageUrl(module.href)}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 transition-all duration-500 hover:border-slate-700 hover:bg-slate-900/90 ${
                  hoveredCard === i ? "shadow-2xl shadow-violet-500/10 -translate-y-1" : ""
                }`}
              >
                {/* Gradient accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${module.gradient} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-cyan-400 transition-all">
                        {module.title}
                      </h3>
                      {module.status === "pro" && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-violet-500/20 text-violet-300 rounded">PRO</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{module.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {module.tags.map((tag, t) => (
                        <span key={t} className="px-2 py-0.5 text-[11px] bg-slate-800 text-slate-400 rounded-md font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Data Infrastructure ── */}
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-xs text-cyan-400 uppercase tracking-[0.2em] font-semibold mb-3">Infrastructure</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Data Sources & Compute
            </h2>
            <p className="text-slate-400 max-w-2xl">
              Every analysis is backed by authoritative public databases and validated against regulatory standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {STACK_SECTION.map((src, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-slate-700 transition-colors">
                  <src.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{src.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{src.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Footer ── */}
        <section className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to accelerate your research?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8">
              Join thousands of researchers using Suttain for molecular intelligence, computational simulation, and chemical safety analysis.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to={createPageUrl("MolecularIntelligence")}>
                <Button size="lg" className="bg-violet-600 hover:bg-violet-500 text-white h-14 px-10 text-base font-semibold rounded-xl">
                  Start Researching
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("APIPortal")}>
                <Button variant="outline" size="lg" className="border-slate-700 text-slate-300 hover:bg-slate-800 h-14 px-10 text-base rounded-xl">
                  <Code2 className="mr-2 w-5 h-5" />
                  API Docs
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}