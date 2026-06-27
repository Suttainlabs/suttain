import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Atom, Cpu, Leaf, FlaskConical, Dna,
  Microscope, Zap, ArrowRight,
  Layers, Binary, ShieldCheck, Globe, Database,
  Terminal, Code2
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
    gradient: "from-[#6B3FA0] to-[#8B5CF6]",
    tags: ["PubChem", "ChEMBL", "Toxicity"],
    status: "live"
  },
  {
    title: "Computational Simulation",
    description: "DFT calculations, molecular dynamics, protein modeling, and QM/MM hybrid simulations.",
    icon: Cpu,
    href: "ComputationalSimulation",
    gradient: "from-[#00A8C8] to-[#0096B7]",
    tags: ["DFT", "MD", "GROMACS"],
    status: "pro"
  },
  {
    title: "Formula Intelligence",
    description: "Real-time ingredient percentage adjustment with live cost, safety, and sustainability shift visualization.",
    icon: FlaskConical,
    href: "SimulationEngine",
    gradient: "from-[#007850] to-[#009970]",
    tags: ["Simulation", "Cost", "Safety"],
    status: "pro"
  },
  {
    title: "Sustainability Intelligence",
    description: "Carbon tax modeling, lifecycle assessment, and ESG compliance reporting for formulations.",
    icon: Leaf,
    href: "CarbonTaxSimulator",
    gradient: "from-[#007850] to-[#00B478]",
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
    gradient: "from-[#6B3FA0] to-[#9333EA]",
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
    <div className="text-slate-800">
      <div className="relative z-10">
        {/* ── Hero Section ── */}
        <Section spacing="default" width="wide" className="hero-offset">
          <div className="max-w-5xl">
            <Badge className="bg-violet-100 text-violet-700 border-violet-200 px-3 py-1 text-[11px] tracking-widest uppercase font-semibold mb-6">
              Molecular Intelligence OS
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              One platform for the complete{" "}
              <span className="bg-gradient-to-r from-[#007850] to-[#00A8C8] bg-clip-text text-transparent">
                chemical research workflow
              </span>
              .
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl">
              Query any compound. Run simulations. Generate and validate formulas. Export publication-ready citations. Powered by PubChem, ChEMBL, and EPA CompTox — every output includes source citation and confidence score.
            </p>
          </div>
        </Section>

        {/* ── Research Tools Grid ── */}
        <Section spacing="default" width="wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESEARCH_TOOLS.map((module, i) => (
              <Link
                key={i}
                to={createPageUrl(module.href)}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-500 hover:border-violet-200 hover:shadow-lg ${
                  hoveredCard === i ? "shadow-lg -translate-y-1" : ""
                }`}
              >
                {/* Gradient accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${module.gradient} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-violet-700 transition-colors">
                        {module.title}
                      </h3>
                      {module.status === "pro" && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-violet-100 text-violet-700 rounded">PRO</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{module.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {module.tags.map((tag, t) => (
                        <span key={t} className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-600 rounded-md font-medium">
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
        <Section spacing="default" width="wide" background="muted">
          <div className="mb-12">
            <p className="text-xs text-[#007850] uppercase tracking-[0.2em] font-semibold mb-3">Infrastructure</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Data Sources & Compute</h2>
            <p className="text-slate-600 text-base max-w-2xl">Every analysis is backed by authoritative public databases and validated against regulatory standards.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {STACK_SECTION.map((src, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-violet-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-4 group-hover:bg-violet-100 transition-colors">
                  <src.icon className="w-5 h-5 text-[#6B3FA0]" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{src.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{src.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── CTA Section ── */}
        <Section spacing="default" width="wide" className="border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Ready to accelerate your research?</h2>
            <p className="text-slate-600 text-base mb-8">Join thousands of researchers using Suttain for molecular intelligence, computational simulation, and chemical safety analysis.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/ResearchDashboard">
                <Button size="lg" className="bg-gradient-to-r from-[#007850] to-[#00A8C8] hover:opacity-90 text-white h-12 px-8 text-base font-semibold rounded-lg shadow-md active:scale-[0.97]">
                  <Zap className="mr-2 w-5 h-5" />
                  Launch Research Dashboard
                </Button>
              </Link>
              <Link to={createPageUrl("APIPortal")}>
                <Button variant="outline" size="lg" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 h-12 px-8 text-base rounded-lg active:scale-[0.97]">
                  <Code2 className="mr-2 w-5 h-5" />
                  API Docs
                </Button>
              </Link>
            </div>
          </div>
        </Section>

        {/* Research Footer */}
        <div className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Research</p>
                <ul className="space-y-2">
                  {[
                    { label: "Molecular Intelligence", href: "MolecularIntelligence" },
                    { label: "Molecule Explorer", href: "MoleculeExplorer" },
                    { label: "Chemical Comparison", href: "ChemicalComparison" },
                    { label: "SDS Analyzer", href: "SDSAnalyzer" },
                  ].map(({ label, href }) => (
                    <li key={href}>
                      <Link to={createPageUrl(href)} className="text-sm text-slate-600 hover:text-[#007850] transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Simulations</p>
                <ul className="space-y-2">
                  {[
                    { label: "Computational Simulations", href: "ComputationalSimulation" },
                    { label: "Simulation Engine", href: "SimulationEngine" },
                    { label: "Research Dashboard", href: "ResearchDashboard" },
                  ].map(({ label, href }) => (
                    <li key={href}>
                      <Link to={createPageUrl(href)} className="text-sm text-slate-600 hover:text-[#007850] transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Science</p>
                <ul className="space-y-2">
                  {[
                    { label: "Methodology", href: "LearningSuite" },
                    { label: "Publications", href: "ExternalDatabases" },
                    { label: "API Docs", href: "APIPortal" },
                    { label: "Academic Access", href: "LearningSuite" },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link to={createPageUrl(href)} className="text-sm text-slate-600 hover:text-[#007850] transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">API Access</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Access the Research API via Python, JavaScript, and R SDKs.
                </p>
                <Link to={createPageUrl("APIPortal")}>
                  <span className="text-xs font-semibold text-[#6B3FA0] hover:text-violet-700 transition-colors">
                    View API Documentation
                  </span>
                </Link>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <p>© {new Date().getFullYear()} Suttain. Suttain Research is a separate product from Suttain Consumer.</p>
              <Link to="/" className="text-slate-500 hover:text-[#007850] transition-colors">
                Back to Consumer Platform
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}