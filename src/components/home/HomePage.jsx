import React, { useContext } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, FlaskConical, Sparkles, ShieldCheck,
  Leaf, BarChart3, Zap, TestTube, QrCode, Cpu, Droplets,
  Database, Atom, Code2, FileText, Microscope, BarChart2,
  ChevronRight, Star, Globe, Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import AuthContext from "../auth/AuthContext";
import SEOHead, { pageSEO } from "../shared/SEOHead";
import ChemicalQuickSearch from "./ChemicalQuickSearch";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: "easeOut" },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

// ── Tool categories ──────────────────────────────────────────────────
const TOOL_GROUPS = [
  {
    label: "Core Safety Tools",
    color: "#007850",
    tools: [
      {
        icon: TestTube,
        label: "Chemical Simulator",
        desc: "Test chemical interactions, predict hazards, and analyze safety data sheets with AI-powered risk scoring.",
        href: "Simulator",
      },
      {
        icon: Sparkles,
        label: "Formula Generator",
        desc: "Build fully validated formulas with safety scoring, compliance flags, and sustainability ratings built in.",
        href: "generator",
      },
      {
        icon: QrCode,
        label: "SuttainScan",
        desc: "Scan any product barcode for a full ingredient breakdown, toxicity profile, and eco-impact score.",
        href: "BarcodeScanner",
      },
      {
        icon: Database,
        label: "Ingredient Database",
        desc: "Explore 250k+ chemicals by toxicity, INCI name, eco-impact, regulatory status, and origin.",
        href: "IngredientDatabase",
      },
    ],
  },
  {
    label: "Research Portal",
    color: "#0D9E8E",
    badge: "New",
    tools: [
      {
        icon: Atom,
        label: "Molecular Intelligence",
        desc: "Query any compound by name, SMILES, or InChI. Hazard classification, toxicity, and regulatory mapping via PubChem.",
        href: "MolecularIntelligence",
      },
      {
        icon: Microscope,
        label: "Molecule Explorer",
        desc: "Browse your chemical database in 3D. Renders PubChem-sourced conformers with a full property panel alongside.",
        href: "MoleculeExplorer",
        badge: "New",
      },
      {
        icon: BarChart2,
        label: "Chemical Dashboard",
        desc: "Visualize chemical property trends, MW distributions, safety breakdowns, and data coverage — live from your database.",
        href: "ChemicalDashboard",
        badge: "New",
      },
      {
        icon: Code2,
        label: "Research API",
        desc: "REST API with endpoints for compound lookup, hazard scoring, and formula generation. Python and JS SDKs included.",
        href: "APIPortal",
      },
    ],
  },
  {
    label: "Advanced Simulation",
    color: "#6366f1",
    tools: [
      {
        icon: Cpu,
        label: "Computational Simulations",
        desc: "Run DFT, molecular dynamics, drug discovery, protein modeling, and quantum chemistry scripts.",
        href: "ComputationalSimulation",
      },
      {
        icon: Leaf,
        label: "Carbon & Reporting",
        desc: "Simulate carbon tax scenarios, model decarbonization ROI, and export sustainability reports.",
        href: "CarbonTaxSimulator",
      },
      {
        icon: BarChart3,
        label: "Comparative Impact Report",
        desc: "Benchmark your formula's environmental score against industry averages with exportable reports.",
        href: "ComparativeImpactReport",
      },
      {
        icon: Droplets,
        label: "Hydration Intelligence",
        desc: "Track daily water intake with biological food-linked adjustments and personalized smart reminders.",
        href: "HydrationHome",
      },
    ],
  },
];

// All tools flattened for the marquee
const ALL_TOOLS = TOOL_GROUPS.flatMap(g => g.tools.map(t => ({ ...t, color: g.color })));

function StatStrip() {
  return (
    <div className="relative inline-flex flex-wrap justify-center rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden divide-x divide-slate-100">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #02988C60, #9531F560, transparent)" }} />
      {[
        { value: "130M+", label: "Chemicals", color: "#007850" },
        { value: "12", label: "Research Tools", color: "#0D9E8E" },
        { value: "<1s", label: "Analysis", color: "#6366f1" },
        { value: "Free", label: "To Start", color: "#007850" },
      ].map(({ value, label, color }) => (
        <div key={label} className="flex flex-col items-center px-5 py-4">
          <p className="text-2xl font-bold leading-none tabular-nums" style={{ color }}>{value}</p>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ── What's new banner ────────────────────────────────────────────────
function WhatsNewBanner() {
  const updates = [
    "Molecule Explorer — 3D structure viewer from your database",
    "Chemical Intelligence Dashboard — property trend charts",
    "Research Portal — unified molecular intelligence OS",
    "Research API — REST endpoints with Python & JS SDKs",
  ];
  return (
    <motion.div
      {...fadeIn()}
      className="bg-[#0D9E8E]/8 border border-[#0D9E8E]/25 rounded-2xl p-5 sm:p-7 mb-16"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D9E8E] border border-[#0D9E8E]/30 rounded px-2 py-0.5">
          June 2026 Release
        </span>
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
        What's new in Suttain
      </h3>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {updates.map((u, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-[#0D9E8E] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <p className="text-sm text-slate-700">{u}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-slate-500">Full release notes sent to all registered users.</p>
        <Link to={createPageUrl("ResearchPortal")} className="flex items-center gap-1.5 text-sm font-semibold text-[#0D9E8E] hover:underline">
          Explore Research Portal <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

// ── Tool group section ───────────────────────────────────────────────
function ToolGroupSection({ group, index }) {
  return (
    <motion.div {...fadeIn(index * 0.08)} className="mb-14">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: group.color }}>
          {group.label}
        </span>
        {group.badge && (
          <span
            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
            style={{ background: group.color + "15", color: group.color }}
          >
            {group.badge}
          </span>
        )}
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {group.tools.map(({ icon: Icon, label, desc, href, badge }) => (
          <Link
            key={href}
            to={createPageUrl(href)}
            className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md p-5 flex flex-col transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: group.color + "12" }}
              >
                <Icon className="w-5 h-5" style={{ color: group.color }} />
              </div>
              {badge && (
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                  style={{ background: group.color + "15", color: group.color }}
                >
                  {badge}
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5 leading-tight">{label}</h3>
            <p className="text-xs text-slate-500 leading-relaxed flex-1">{desc}</p>
            <div className="flex items-center gap-1 mt-4 text-[11px] font-semibold" style={{ color: group.color }}>
              Open tool
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-white font-gilroy">
      <SEOHead {...pageSEO.home} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white pt-12 pb-16 sm:pt-28 sm:pb-36">
        <div
          className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #007850 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fade(0)} className="inline-flex items-center gap-2 border border-[#007850]/25 bg-[#007850]/6 text-[#007850] text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
            <Atom className="w-3.5 h-3.5" />
            Molecular Intelligence OS
          </motion.div>

          <motion.h1
            {...fade(0.08)}
            className="text-3xl sm:text-5xl lg:text-7xl font-bold text-slate-900 leading-none tracking-tight mb-4 sm:mb-6"
            style={{ textWrap: "balance", lineHeight: 1.05 }}
          >
            The complete platform for{" "}
            <span style={{ color: "#007850" }}>chemical research</span>
            {" "}and{" "}
            <span style={{ color: "#0D9E8E" }}>safe formulation</span>
          </motion.h1>

          <motion.p
            {...fade(0.16)}
            className="text-sm sm:text-xl text-slate-500 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed"
          >
            Query any compound. Run simulations. Generate validated formulas. Visualize molecular structures in 3D.
            Powered by PubChem, ChEMBL, and EPA CompTox — every output is source-cited.
          </motion.p>

          {/* Chemical Quick Search */}
          <motion.div {...fade(0.20)} className="mb-8">
            <ChemicalQuickSearch />
          </motion.div>

          <motion.div {...fade(0.22)} className="flex flex-col sm:flex-row gap-3 justify-center items-center flex-wrap">
            <Link to={createPageUrl("ResearchPortal")}>
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-base text-white shadow-lg shadow-[#007850]/20 hover:shadow-xl hover:shadow-[#007850]/30"
                style={{ background: "#007850" }}
              >
                <Atom className="w-4 h-4 mr-2" />
                Open Research Portal
              </Button>
            </Link>
            <Link to={createPageUrl("Simulator")}>
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-base text-white shadow-md"
                style={{ background: "#0D9E8E" }}
              >
                {user ? "Open Simulator" : "Analyze for Free"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("generator")}>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-base border-2"
                style={{ borderColor: "#6366f1", color: "#6366f1" }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Build a Formula
              </Button>
            </Link>
          </motion.div>

          {/* Stat strip */}
          <motion.div {...fade(0.32)} className="mt-16">
            <StatStrip />
          </motion.div>
        </div>
      </section>

      {/* ── Pillar strip ── */}
      <section className="bg-slate-50 border-y border-slate-100 py-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: ShieldCheck, label: "Safety Analysis", color: "#007850" },
              { icon: Atom, label: "Molecular Intelligence", color: "#0D9E8E" },
              { icon: Leaf, label: "Sustainability", color: "#007850" },
              { icon: BarChart3, label: "Compliance", color: "#6366f1" },
              { icon: Zap, label: "AI-Powered", color: "#0D9E8E" },
              { icon: Globe, label: "Regulatory Mapping", color: "#6366f1" },
            ].map(({ icon: Icon, label, color }, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                <Icon className="w-4 h-4" style={{ color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools marquee ── */}
      <section className="py-14 bg-white overflow-hidden">
        <motion.div {...fadeIn()} className="text-center mb-8 px-4">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">12 tools. One platform.</p>
        </motion.div>

        <style>{`
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .marquee-track { display: flex; width: max-content; animation: marquee 36s linear infinite; }
          .marquee-track:hover { animation-play-state: paused; }
        `}</style>

        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10" style={{ background: "linear-gradient(to right, white, transparent)" }} />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10" style={{ background: "linear-gradient(to left, white, transparent)" }} />
          <div className="marquee-track">
            {[...ALL_TOOLS, ...ALL_TOOLS].map(({ icon: Icon, label, href, color }, i) => (
              <Link
                key={i}
                to={createPageUrl(href)}
                className="group flex items-center gap-3 mx-3 px-5 py-3 rounded-full border border-slate-200 bg-white hover:border-transparent hover:shadow-md transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}14` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="font-semibold text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" style={{ color }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools grid ── */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn()} className="mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3">
              Everything in one platform
            </h2>
            <p className="text-slate-500 text-sm sm:text-lg max-w-xl">
              From a first chemical safety check to full molecular research workflows — Suttain covers the entire stack.
            </p>
          </motion.div>

          {/* What's new */}
          <WhatsNewBanner />

          {/* Tool groups */}
          {TOOL_GROUPS.map((group, i) => (
            <ToolGroupSection key={group.label} group={group} index={i} />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn()} className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3">
              From compound query to production-ready formula
            </h2>
            <p className="text-slate-500 text-sm sm:text-lg max-w-xl mx-auto">Every step in a single workflow. No lab required.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              { n: "01", title: "Query any compound", body: "Search by name, CAS, SMILES, or InChI. Get hazard scores, regulatory status, and toxicity data in under a second.", color: "#007850" },
              { n: "02", title: "Visualize in 3D", body: "Render PubChem-sourced 3D conformers in the browser. Inspect physical, toxicity, and environmental properties side by side.", color: "#0D9E8E" },
              { n: "03", title: "Generate a formula", body: "Get AI-generated formula options with INCI names, pH guidance, safety scores, and compliance flags — in plain language.", color: "#6366f1" },
              { n: "04", title: "Export and act", body: "Export reports to PDF, JSON, or CSV. Citation-ready outputs in APA, ACS, and Vancouver formats.", color: "#007850" },
            ].map((step, i) => (
              <motion.div key={i} {...fadeIn(i * 0.1)}>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 h-full relative overflow-hidden hover:shadow-md transition-shadow">
                  <div
                    className="absolute top-0 right-0 text-[80px] font-black leading-none opacity-[0.04] select-none"
                    style={{ color: step.color }}
                  >
                    {step.n}
                  </div>
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-white text-xs font-bold mb-4"
                    style={{ background: step.color }}
                  >
                    {step.n}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data sources ── */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn()} className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Backed by verified scientific databases</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "PubChem", org: "NCBI / NIH", records: "117M+", desc: "Compound identity, bioassay data, physical properties" },
              { name: "ChEMBL", org: "EMBL-EBI", records: "2.4M+", desc: "Bioactivity, drug-likeness, target interaction data" },
              { name: "EPA CompTox", org: "US EPA", records: "900k+", desc: "Toxicity endpoints, environmental fate, regulatory" },
              { name: "RCSB PDB", org: "Research Collaboratory", records: "220k+", desc: "Protein structures, ligand binding conformers" },
            ].map((src) => (
              <motion.div key={src.name} {...fadeIn()}>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 h-full">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">{src.name}</span>
                    <span className="text-[10px] text-[#0D9E8E] font-mono font-bold">{src.records}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-1">{src.org}</p>
                  <p className="text-xs text-slate-500 leading-snug">{src.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 sm:py-32 bg-white px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            {...fadeIn()}
            className="relative rounded-3xl overflow-hidden text-center px-8 py-16 sm:px-16 sm:py-20"
            style={{ background: "linear-gradient(135deg, #007850 0%, #0D9E8E 50%, #6366f1 100%)" }}
          >
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4" style={{ textWrap: "balance" }}>
                The most capable chemical research platform. Free to start.
              </h2>
              <p className="text-white/70 text-base mb-10 max-w-md mx-auto">
                Join thousands of formulators and researchers using Suttain. No credit card required to access the core tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to={createPageUrl("ResearchPortal")}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-base bg-white hover:bg-white/90 transition-colors"
                    style={{ color: "#007850" }}
                  >
                    Open Research Portal
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("Pricing")}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-base text-white border-2 border-white/40 bg-transparent hover:bg-white/10 transition-colors"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}