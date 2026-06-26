import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Atom, Cpu, Leaf, BarChart2, FlaskConical, Dna,
  Microscope, BookOpen, ShieldCheck, Zap, ArrowRight,
  Layers, Binary, Globe, Server, Cloud, Lock, Database,
  Terminal, Code2, GitBranch, Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeader } from "@/components/shared/Section";


const RESEARCH_TOOLS = [
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
    title: "Computational Simulation",
    description: "DFT calculations, molecular dynamics, protein modeling, and QM/MM hybrid simulations.",
    icon: Cpu,
    href: "ComputationalSimulation",
    gradient: "from-cyan-500 to-blue-600",
    tags: ["DFT", "MD", "GROMACS"],
    status: "pro"
  },
  {
    title: "Formula Intelligence",
    description: "Real-time ingredient percentage adjustment with live cost, safety, and sustainability shift visualization.",
    icon: FlaskConical,
    href: "SimulationEngine",
    gradient: "from-amber-500 to-orange-600",
    tags: ["Simulation", "Cost", "Safety"],
    status: "pro"
  },
  {
    title: "Sustainability Intelligence",
    description: "Carbon tax modeling, lifecycle assessment, and ESG compliance reporting for formulations.",
    icon: Leaf,
    href: "CarbonTaxSimulator",
    gradient: "from-emerald-500 to-teal-600",
    tags: ["LCA", "ESG", "Carbon"],
    status: "live"
  },
  {
    title: "Research API",
    description: "REST endpoints for compound lookup, hazard scoring, interaction checking, and formula generation.",
    icon: Terminal,
    href: "APIPortal",
    gradient: "from-slate-600 to-slate-700",
    tags: ["REST", "Python", "JavaScript"],
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
    <div className="text-slate-100">
      {/* ── Ambient background effects ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-96 -left-96 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[180px]" />
        <div className="absolute top-1/3 -right-96 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[150px]" />
        <div className="absolute -bottom-96 left-1/3 w-[700px] h-[700px] bg-emerald-500/6 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10">
        {/* ── Hero Section ── */}
        <Section spacing="default" width="wide" className="hero-offset">
          <div className="max-w-5xl">
            <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 px-3 py-1 text-[11px] tracking-widest uppercase font-semibold mb-6">
              Molecular Intelligence OS
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              One platform for the complete{" "}
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                chemical research workflow
              </span>
              .
            </h1>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl">
              Query any compound. Run simulations. Generate and validate formulas. Export publication-ready citations. Powered by PubChem, ChEMBL, and EPA CompTox — every output includes source citation and confidence score.
            </p>
          </div>
        </Section>



        {/* ── Research Tools Grid ── */}
        <Section spacing="default" width="wide">
          <div style={{ marginTop: "0" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESEARCH_TOOLS.map((module, i) => (
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
        </Section>

        {/* ── Data Infrastructure ── */}
        <Section spacing="default" width="wide">
          <div className="mb-12">
            <p className="text-xs text-teal-400 uppercase tracking-[0.2em] font-semibold mb-3">Infrastructure</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Data Sources & Compute</h2>
            <p className="text-slate-400 text-base max-w-2xl">Every analysis is backed by authoritative public databases and validated against regulatory standards.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {STACK_SECTION.map((src, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-slate-700 transition-colors">
                  <src.icon className="w-5 h-5 text-teal-400" />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{src.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{src.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── CTA Section ── */}
        <Section spacing="default" width="wide" className="border-t border-slate-800">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to accelerate your research?</h2>
            <p className="text-slate-400 text-base mb-8">Join thousands of researchers using Suttain for molecular intelligence, computational simulation, and chemical safety analysis.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/ResearchDashboard">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white h-12 px-8 text-base font-semibold rounded-lg shadow-lg shadow-violet-500/20 active:scale-[0.97]">
                  <Zap className="mr-2 w-5 h-5" />
                  Launch Research Dashboard
                </Button>
              </Link>
              <Link to={createPageUrl("APIPortal")}>
                <Button variant="outline" size="lg" className="bg-transparent border-slate-500 text-white hover:bg-slate-800 hover:border-slate-400 h-12 px-8 text-base rounded-lg active:scale-[0.97]">
                  <Code2 className="mr-2 w-5 h-5" />
                  API Docs
                </Button>
              </Link>
            </div>
          </div>
        </Section>

        {/* Research Footer */}
        <div className="border-t border-slate-800 bg-slate-950/60">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Research</p>
                <ul className="space-y-2">
                  {[
                    { label: "Molecular Intelligence", href: "MolecularIntelligence" },
                    { label: "Molecule Explorer", href: "MoleculeExplorer" },
                    { label: "Chemical Comparison", href: "ChemicalComparison" },
                    { label: "SDS Analyzer", href: "SDSAnalyzer" },
                  ].map(({ label, href }) => (
                    <li key={href}>
                      <Link to={createPageUrl(href)} className="text-sm text-slate-400 hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Simulations</p>
                <ul className="space-y-2">
                  {[
                    { label: "Computational Simulations", href: "ComputationalSimulation" },
                    { label: "Simulation Engine", href: "SimulationEngine" },
                    { label: "Research Dashboard", href: "ResearchDashboard" },
                  ].map(({ label, href }) => (
                    <li key={href}>
                      <Link to={createPageUrl(href)} className="text-sm text-slate-400 hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Science</p>
                <ul className="space-y-2">
                  {[
                    { label: "Methodology", href: "LearningSuite" },
                    { label: "Publications", href: "ExternalDatabases" },
                    { label: "API Docs", href: "APIPortal" },
                    { label: "Academic Access", href: "LearningSuite" },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link to={createPageUrl(href)} className="text-sm text-slate-400 hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">API Access</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Access the Research API via Python, JavaScript, and R SDKs.
                </p>
                <Link to={createPageUrl("APIPortal")}>
                  <span className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                    View API Documentation
                  </span>
                </Link>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <p>© {new Date().getFullYear()} Suttain. Suttain Research is a separate product from Suttain Consumer.</p>
              <Link to="/" className="text-slate-500 hover:text-slate-300 transition-colors">
                Back to Consumer Platform
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}