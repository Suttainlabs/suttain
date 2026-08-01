import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Search, Loader2, ShieldCheck, FlaskConical,
  QrCode, TestTube, Leaf, BarChart3, Sparkles,
  Microscope, Cpu, Atom, Code2, Globe, ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import SEOHead from "../components/shared/SEOHead";
import { Section, SectionHeader } from "../components/shared/Section";
import AnalyzeProductModal from "../components/home/AnalyzeProductModal";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

const CONSUMER_PATHWAYS = [
  { icon: QrCode, label: "Scan a product", desc: "Barcode to full ingredient breakdown in seconds.", href: "BarcodeScanner" },
  { icon: TestTube, label: "Test interactions", desc: "Simulate chemical mixing before you blend.", href: "Simulator" },
  { icon: Sparkles, label: "Build a formula", desc: "AI-guided formulation with safety scoring.", href: "generator" },
  { icon: BarChart3, label: "Score sustainability", desc: "Carbon footprint and eco-impact per formula.", href: "SustainabilityImpact" },
];

const RESEARCH_PATHWAYS = [
  { icon: Atom, label: "Molecule analysis", desc: "Query compounds, visualize 3D structure, inspect properties.", href: "MoleculeAnalysis" },
  { icon: Cpu, label: "Computational studio", desc: "Semi-empirical and DFT-tier simulations with 3D viewers.", href: "ComputationalStudio" },
  { icon: Microscope, label: "Structural biology", desc: "AlphaFold-powered protein structure analysis.", href: "StructuralBiology" },
  { icon: Code2, label: "Research API", desc: "REST endpoints with Python and JavaScript SDKs.", href: "APIPortal" },
];

const DATA_SOURCES = [
  { name: "PubChem", desc: "130M+ compounds with structures and bioassay data" },
  { name: "ChEMBL", desc: "Bioactivity data for 2M+ drug discovery compounds" },
  { name: "EPA CompTox", desc: "Toxicity and environmental fate predictions" },
  { name: "RCSB PDB", desc: "3D biomolecular structures for binding analysis" },
];

export default function LandingHub() {
  const navigate = useNavigate();
  const [chemSearch, setChemSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);

  const handleChemSearch = (e) => {
    e.preventDefault();
    if (!chemSearch.trim() || isSearching) return;
    setIsSearching(true);
    setTimeout(() => {
      navigate(createPageUrl("MoleculeAnalysis") + "?q=" + encodeURIComponent(chemSearch.trim()));
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] font-body">
      <SEOHead
        title="Suttain — Molecular Intelligence for Consumer Safety and Professional Research"
        description="One platform for chemical safety analysis, formula generation, product scanning, computational simulation, and research-grade API access."
      />

      {/* Split-persona hero gateway */}
      <Section spacing="default" width="default" className="hero-offset">
        <SectionHeader
          as="h1"
          align="center"
          headingClassName="text-2xl sm:text-3xl lg:text-4xl font-medium text-slate-900 tracking-tight"
          heading="One platform. Two ways to work."
          subtextClassName="text-sm sm:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto"
          subtext="Suttain serves both consumers and brands who want safer products, and researchers who need molecular intelligence. Choose your path below."
        />

        {/* Chemical search — shared utility */}
        <motion.div {...fade(0.15)} className="max-w-xl mx-auto relative mt-8">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3 text-center">
            Search 130M+ chemicals
          </p>
          <form onSubmit={handleChemSearch} className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-5 py-3 shadow-sm hover:shadow-md transition-shadow">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={chemSearch}
              onChange={(e) => setChemSearch(e.target.value)}
              placeholder="Search by IUPAC name, CAS number, or chemical name..."
              className="flex-1 text-sm text-slate-700 placeholder-slate-400 bg-transparent outline-none"
            />
            <button
              type="submit"
              disabled={isSearching || !chemSearch.trim()}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00695C] focus-visible:ring-offset-2"
              style={{ background: "#00695C" }}
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </form>
        </motion.div>

        {/* Persona gateway cards */}
        <div className="grid md:grid-cols-2 gap-5 mt-12 max-w-4xl mx-auto">
          {/* Consumer / Brand pathway */}
          <motion.div {...fade(0.25)}>
            <Link
              to={createPageUrl("Simulator")}
              className="block bg-white rounded-2xl border border-slate-200 overflow-hidden h-full group hover:shadow-lg hover:border-[#007850]/30 transition-all"
            >
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #007850, #00B478)" }} />
              <div className="p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#E1F5EE" }}>
                    <ShieldCheck className="w-5 h-5" style={{ color: "#007850" }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#007850]">Consumer and Brand</p>
                    <h2 className="text-lg font-medium text-slate-900">Safer, greener products</h2>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Scan products, generate validated formulas, and check compliance. No lab required.
                </p>
                <div className="space-y-3">
                  {CONSUMER_PATHWAYS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 group/item">
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "#007850" }} />
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        <span className="text-xs text-slate-400 hidden sm:inline">— {item.desc}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1 mt-6 text-sm font-semibold" style={{ color: "#007850" }}>
                  Explore consumer tools
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Professional Research pathway */}
          <motion.div {...fade(0.35)}>
            <Link
              to={createPageUrl("ComputationalStudio")}
              className="block bg-white rounded-2xl border border-slate-200 overflow-hidden h-full group hover:shadow-lg hover:border-[#534AB7]/30 transition-all"
            >
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #534AB7, #00A8C8)" }} />
              <div className="p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#EEEDFE" }}>
                    <FlaskConical className="w-5 h-5" style={{ color: "#534AB7" }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#534AB7]">Professional Research</p>
                    <h2 className="text-lg font-medium text-slate-900">Computational chemistry</h2>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Simulation, structural biology, and API access for research chemists and scientists.
                </p>
                <div className="space-y-3">
                  {RESEARCH_PATHWAYS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 group/item">
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "#534AB7" }} />
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        <span className="text-xs text-slate-400 hidden sm:inline">— {item.desc}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1 mt-6 text-sm font-semibold" style={{ color: "#534AB7" }}>
                  Enter computational studio
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div {...fade(0.45)} className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowAnalyzeModal(true)}>
            Analyze a product
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Link to={createPageUrl("Pricing")}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View pricing
            </Button>
          </Link>
        </motion.div>
      </Section>

      {/* Data infrastructure */}
      <Section spacing="default" width="default" background="muted" className="border-y border-slate-100">
        <SectionHeader
          align="center"
          eyebrow={<span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Data Infrastructure</span>}
          headingClassName="text-xl sm:text-2xl font-medium text-slate-900"
          heading="Powered by trusted scientific databases"
          subtextClassName="text-slate-500 text-sm sm:text-base"
          subtext="Suttain integrates with the world's leading chemical and biological data sources for accurate, citation-ready results."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8 max-w-4xl mx-auto">
          {DATA_SOURCES.map((src, i) => (
            <motion.div key={i} {...fade(i * 0.05)}>
              <div className="bg-white rounded-xl p-5 border border-slate-200 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-900">{src.name}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{src.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Footer CTA */}
      <Section spacing="default" width="narrow" background="light">
        <motion.div {...fade()} className="relative rounded-2xl overflow-hidden text-center px-8 py-12 sm:px-12 sm:py-16 bg-white border border-slate-200">
          <SectionHeader
            headingClassName="text-xl sm:text-2xl font-medium text-slate-900"
            heading="Start with the right tool"
            subtextClassName="text-slate-500 text-sm sm:text-base"
            subtext="Join thousands of formulators, brands, and researchers using Suttain. Free to start, no credit card required."
          >
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowAnalyzeModal(true)}>
                Analyze a product
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Link to={createPageUrl("ComputationalStudio")}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-[#534AB7]/30 text-[#534AB7] hover:bg-[#534AB7]/5">
                  Enter computational studio
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </SectionHeader>
        </motion.div>
      </Section>

      <AnalyzeProductModal open={showAnalyzeModal} onOpenChange={setShowAnalyzeModal} />
    </div>
  );
}