import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home, Microscope, Terminal, Star, LogIn, Menu, X,
  Atom, Cpu, ShieldCheck, Layers, Dna, BarChart2,
  Code2, BookOpen, ChevronDown, FlaskConical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const TOOLS_MENU = [
  { href: "/MolecularIntelligence", label: "Molecular Intelligence", icon: Atom, desc: "Hazard scoring & toxicity profiling" },
  { href: "/ComputationalSimulation", label: "Computational Simulations", icon: Cpu, desc: "DFT, MD, drug discovery & QM/MM" },
  { href: "/MoleculeExplorer", label: "Molecule Explorer", icon: Dna, desc: "Interactive 3D molecular visualization" },
  { href: "/ChemicalComparison", label: "Chemical Comparison", icon: Layers, desc: "Side-by-side compound evaluation" },
  { href: "/SDSAnalyzer", label: "SDS Analyzer", icon: ShieldCheck, desc: "Safety data sheet hazard extraction" },
  { href: "/SimulationEngine", label: "Simulation Engine", icon: FlaskConical, desc: "Formula cost & sustainability modeling" },
  { href: "/CarbonTaxSimulator", label: "Carbon & Sustainability", icon: BarChart2, desc: "Carbon tax & ESG compliance" },
  { href: "/ResearchDashboard", label: "Research Dashboard", icon: BookOpen, desc: "Saved queries, history & workspace" },
];

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/enterprise", label: "Enterprise" },
  { href: "/Pricing", label: "Pricing" },
  { href: "/APIPortal", label: "API Docs" },
];

export default function DarkNavBar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (href) => {
    if (href === "/") return location.pathname === "/" || location.pathname === "/Home";
    if (href === "/enterprise") return location.pathname === "/enterprise" || location.pathname === "/EnterpriseAPI";
    if (href === "/research") return location.pathname === "/research" || location.pathname === "/ResearchLanding";
    return location.pathname === href;
  };

  const isToolsActive = TOOLS_MENU.some(t => location.pathname === t.href);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
              alt="Suttain"
              className="h-8 w-auto brightness-0 invert opacity-90"
            />
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400 border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 rounded hidden sm:inline">
              Research
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive(href)
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Tools dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isToolsActive || toolsOpen
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Tools
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
              </button>

              {toolsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[640px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/60 p-4 grid grid-cols-2 gap-1">
                  {TOOLS_MENU.map((tool) => {
                    const Icon = tool.icon;
                    const active = location.pathname === tool.href;
                    return (
                      <Link
                        key={tool.href}
                        to={tool.href}
                        onClick={() => setToolsOpen(false)}
                        className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-colors group ${
                          active ? "bg-violet-500/10 border border-violet-500/20" : "hover:bg-slate-800"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold leading-tight mb-0.5 ${active ? "text-violet-300" : "text-slate-200 group-hover:text-white"}`}>
                            {tool.label}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-tight">{tool.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => base44.auth.redirectToLogin()}
              className="text-slate-400 hover:text-white text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                isActive(href)
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {label}
            </Link>
          ))}

          {/* Mobile Tools collapsible */}
          <button
            onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              isToolsActive ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <span>Tools</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${mobileToolsOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileToolsOpen && (
            <div className="pl-3 flex flex-col gap-0.5">
              {TOOLS_MENU.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    to={tool.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    {tool.label}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="border-t border-slate-800 mt-2 pt-3 flex flex-col gap-2">
            <button
              onClick={() => { setMobileOpen(false); base44.auth.redirectToLogin(); }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 text-sm font-semibold transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>

          </div>
        </div>
      )}
    </nav>
  );
}