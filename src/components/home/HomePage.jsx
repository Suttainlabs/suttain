import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, FlaskConical, Sparkles, ShieldCheck,
  Leaf, BarChart3, Zap, TestTube, QrCode, Droplets,
  Database, Star, Users,
  Microscope, Search, Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import AuthContext from "../auth/AuthContext";
import SEOHead from "../shared/SEOHead";
import { Section, SectionHeader } from "../shared/Section";

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

// ── Consumer features only — Research is NOT shown here ──────────────
const CONSUMER_TOOLS = [
  {
    icon: TestTube,
    label: "Chemical Simulator",
    desc: "Test chemical interactions, predict hazards, and analyze safety data sheets with AI-powered risk scoring.",
    href: "Simulator",
    color: "#007850",
  },
  {
    icon: Sparkles,
    label: "Formula Generator",
    desc: "Build fully validated formulas with safety scoring, compliance flags, and sustainability ratings built in.",
    href: "generator",
    color: "#007850",
  },
  {
    icon: QrCode,
    label: "SuttainScan",
    desc: "Scan any product barcode for a full ingredient breakdown, toxicity profile, and eco-impact score.",
    href: "BarcodeScanner",
    color: "#0D9E8E",
  },
  {
    icon: Database,
    label: "Ingredient Database",
    desc: "Explore 250k+ chemicals by toxicity, INCI name, eco-impact, regulatory status, and origin.",
    href: "IngredientDatabase",
    color: "#0D9E8E",
  },
  {
    icon: Leaf,
    label: "Sustainability Scoring",
    desc: "Detailed eco-impact analysis, biodegradability scores, and carbon footprint per formula.",
    href: "SustainabilityImpact",
    color: "#007850",
  },
  {
    icon: ShieldCheck,
    label: "AI Compliance Co-Pilot",
    desc: "Automated regulatory checks across 50+ global regions including EU, FDA, and ASEAN.",
    href: "ComplianceDashboard",
    color: "#6366f1",
  },
  {
    icon: Droplets,
    label: "Hydration Intelligence",
    desc: "Track daily water intake with biological food-linked adjustments and personalized smart reminders.",
    href: "HydrationHome",
    color: "#0D9E8E",
  },
  {
    icon: BarChart3,
    label: "Comparative Impact Report",
    desc: "Benchmark your formula's environmental score against industry averages with exportable reports.",
    href: "ComparativeImpactReport",
    color: "#6366f1",
  },
];


export default function HomePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [chemSearch, setChemSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Common chemicals for autocomplete
  const commonChemicals = [
    'Benzene', 'Ethanol', 'Acetone', 'Water', 'Sodium Chloride',
    'Glucose', 'Caffeine', 'Aspirin', 'Methane', 'Formaldehyde',
    'Phenol', 'Toluene', 'Xylene', 'Propanol', 'Butanol',
    'Acetaldehyde', 'Acetic Acid', 'Formic Acid', 'Citric Acid', 'Oxalic Acid'
  ];

  const handleChemChange = (value) => {
    setChemSearch(value);
    if (value.trim().length > 0) {
      const filtered = commonChemicals.filter(chem => 
        chem.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (chemical) => {
    setChemSearch(chemical);
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(createPageUrl('MoleculeExplorer') + '?q=' + encodeURIComponent(chemical));
  };

  const handleChemSearch = (e) => {
    e.preventDefault();
    if (!chemSearch.trim() || isSearching) return;
    setShowSuggestions(false);
    setIsSearching(true);
    setTimeout(() => {
      navigate(createPageUrl('MoleculeExplorer') + '?q=' + encodeURIComponent(chemSearch.trim()));
    }, 400);
  };

  return (
    <div className="min-h-screen bg-white font-gilroy">
      <SEOHead
        title="Suttain — Chemical Safety, Formula Generation and Product Scanning"
        description="Scan products, generate safe formulas, and validate ingredients. Suttain gives consumers, DIY creators, and small brands the tools to make safer, more sustainable products."
      />

      {/* ── Hero ── */}
      <Section spacing="default" width="default" className="relative overflow-hidden bg-white hero-offset"
        overlay={
          <>
            <div
              className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-[0.07]"
              style={{ background: "radial-gradient(circle, #007850 0%, transparent 70%)" }}
            />
            <div
              className="pointer-events-none absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-[0.06]"
              style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
            />
          </>
        }
      >
        <SectionHeader
          as="h1"
          align="center"
          eyebrow={
            <span className="inline-flex items-center gap-2 border border-[#007850]/25 bg-[#007850]/6 text-[#007850] text-sm font-semibold px-4 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Chemical Safety for Everyone
            </span>
          }
          headingClassName="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900"
          heading={
            <>
              Analyze your product.{" "}
              <span style={{ color: "#007850" }}>Understand every ingredient.</span>
              {" "}Make safer, greener choices.
            </>
          }
          subtextClassName="text-sm sm:text-xl text-slate-500 leading-relaxed"
          subtext="Suttain gives consumers, DIY creators, and small brands the tools to scan products, generate validated formulas, and check compliance — all in one place. No lab required."
        >
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center flex-wrap">
            <Link to={createPageUrl("Simulator")}>
              <Button size="lg" className="w-full sm:w-auto">
                Analyze Your Product Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("generator")}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Sparkles className="w-4 h-4 mr-2" />
                Build a Formula
              </Button>
            </Link>

          </div>
        </SectionHeader>

        {/* Chemical search bar */}
        <motion.div {...fade(0.28)} style={{ marginTop: "var(--space-5)" }} className="max-w-2xl mx-auto relative">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3 text-center">Search 130M+ chemicals</p>
            <form onSubmit={handleChemSearch} className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-5 py-3 shadow-sm hover:shadow-md transition-shadow relative">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={chemSearch}
                onChange={(e) => handleChemChange(e.target.value)}
                onFocus={() => chemSearch.trim().length > 0 && setShowSuggestions(true)}
                placeholder="Search by IUPAC name, CAS number, or chemical name..."
                className="flex-1 text-sm text-slate-700 placeholder-slate-400 bg-transparent outline-none"
              />
              <button
                type="submit"
                disabled={isSearching || !chemSearch.trim()}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00695C] focus-visible:ring-offset-2"
                style={{ background: '#00695C' }}
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </form>
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-10">
                {suggestions.map((chem, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(chem)}
                    className="w-full text-left px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                  >
                    {chem}
                  </button>
                ))}
              </div>
            )}
            {showSuggestions && chemSearch.trim().length > 0 && suggestions.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-10">
                <p className="px-5 py-4 text-sm text-slate-500 text-center">
                  No chemicals found matching "{chemSearch}". Try a different name or CAS number.
                </p>
              </div>
            )}
          </motion.div>

          {/* Trust stats */}
          <motion.div {...fade(0.32)} style={{ marginTop: "var(--space-5)" }}>
            <div className="relative flex flex-wrap justify-center rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden divide-x divide-slate-100 w-full max-w-2xl mx-auto">
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #02988C60, #9531F560, transparent)" }} />
              {[
                { value: "130M+", label: "Chemicals", color: "#007850" },
                { value: "8", label: "Consumer Tools", color: "#0D9E8E" },
                { value: "<1s", label: "Analysis Time", color: "#6366f1" },
                { value: "Free", label: "To Start", color: "#007850" },
              ].map(({ value, label, color }) => (
                <div key={label} className="flex flex-col items-center justify-center px-5 py-4 flex-1 min-w-[120px] text-center">
                  <p className="text-2xl font-bold leading-none tabular-nums" style={{ color }}>{value}</p>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
      </Section>

      {/* ── Pillar strip ── */}
      <Section spacing="default" width="default" background="muted" className="border-y border-slate-100">
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: ShieldCheck, label: "Safety Analysis", color: "#007850" },
              { icon: Sparkles, label: "Formula Generation", color: "#0D9E8E" },
              { icon: QrCode, label: "Product Scanning", color: "#007850" },
              { icon: Leaf, label: "Sustainability", color: "#007850" },
              { icon: BarChart3, label: "Compliance", color: "#6366f1" },
              { icon: Users, label: "Team Collaboration", color: "#0D9E8E" },
            ].map(({ icon: Icon, label, color }, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                <Icon className="w-4 h-4" style={{ color }} />
                {label}
              </div>
            ))}
          </div>
      </Section>

      {/* ── Consumer Tools — auto-scrolling marquee ── */}
      <Section spacing="default" width="wide" background="light" className="overflow-hidden">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#007850]">Consumer Tools</span>
        </div>
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee 28s linear infinite;
          }
          .marquee-track:hover { animation-play-state: paused; }
        `}</style>
        <div className="relative">
          <div className="marquee-track">
            {[...CONSUMER_TOOLS, ...CONSUMER_TOOLS].map(({ icon: Icon, label, href, color }, i) => (
              <Link
                key={i}
                to={createPageUrl(href)}
                className="flex items-center gap-2.5 mx-3 px-5 py-3 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all whitespace-nowrap group flex-shrink-0"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + "14" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{label}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" style={{ color }} />
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* ── How it works ── */}
      <Section spacing="default" width="default" background="muted" className="border-y border-slate-100">
          <motion.div {...fadeIn()}>
            <SectionHeader
              headingClassName="text-2xl sm:text-4xl font-bold text-slate-900"
              heading="From ingredient scan to production-ready formula"
              subtextClassName="text-slate-500 text-sm sm:text-lg"
              subtext="Every step in a single workflow. No lab required."
            />
          </motion.div>

          <div style={{ marginTop: "var(--space-6)" }} className="grid md:grid-cols-4 gap-6">
            {[
              { n: "01", title: "Scan any product", body: "Scan a barcode or enter an ingredient list. Get a full toxicity profile, eco-impact score, and safety breakdown instantly.", color: "#007850" },
              { n: "02", title: "Simulate interactions", body: "Test how ingredients interact. Get hazard scores, pH estimates, and compliance flags before you ever mix a batch.", color: "#0D9E8E" },
              { n: "03", title: "Generate a formula", body: "Get AI-generated formula options with INCI names, safety scores, and sustainability ratings in plain language.", color: "#6366f1" },
              { n: "04", title: "Export and share", body: "Export professional PDF reports with full compliance documentation and sustainability scores for your brand or clients.", color: "#007850" },
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
          </Section>

          {/* ── Research callout — subtle, not promotional ── */}
          <Section spacing="default" width="default" background="muted" className="border-y border-slate-100">
          <motion.div {...fadeIn()} className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <Microscope className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Are you a researcher or scientist?</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Suttain Research offers molecular intelligence, computational simulations, DFT, and API access for institutions.
                </p>
              </div>
            </div>
            <Link to="/research" className="flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="border-2 border-violet-300 text-violet-600 hover:bg-violet-50 rounded-full px-6 font-semibold whitespace-nowrap bg-transparent"
              >
                Go to Research Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
      </Section>

      {/* ── CTA ── */}
      <Section spacing="default" width="narrow" background="light">
          <motion.div
            {...fadeIn()}
            className="relative rounded-3xl overflow-hidden text-center px-8 py-16 sm:px-16 sm:py-20"
            style={{ background: "linear-gradient(135deg, #007850 0%, #0D9E8E 60%, #6366f1 100%)" }}
          >
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="relative z-10">
              <SectionHeader
                headingClassName="text-2xl sm:text-4xl font-bold text-white"
                heading="Chemical safety tools. Free to start."
                subtextClassName="text-white/70 text-base"
                subtext="Join thousands of formulators and brands using Suttain. No credit card required for core tools."
              >
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to={createPageUrl("Simulator")}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-[#00695C] hover:bg-white/90 shadow-lg"
                  >
                    Analyze Your Product Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("Pricing")}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-transparent text-white border-2 border-white/50 hover:bg-white/10"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    View Pricing
                  </Button>
                </Link>
                </div>
              </SectionHeader>
            </div>
          </motion.div>
      </Section>
    </div>
  );
}