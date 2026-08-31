import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LogIn, Menu, X,
  Atom, Cpu, Layers, Dna, Microscope,
  ChevronDown, FlaskConical, LogOut, User as UserIcon
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const TOOLS_MENU = [
  { href: "/MolecularIntelligence", label: "Molecular Intelligence", icon: Atom, desc: "Hazard scoring & toxicity profiling" },
  { href: "/ComputationalSimulation", label: "Computational Simulations", icon: Cpu, desc: "DFT, MD, drug discovery & QM/MM" },
  { href: "/MoleculeExplorer", label: "Molecule Explorer", icon: Dna, desc: "Interactive 3D molecular visualization" },
  { href: "/ChemicalComparison", label: "Chemical Comparison", icon: Layers, desc: "Side-by-side compound evaluation" },
  { href: "/SimulationEngine", label: "Simulation Engine", icon: FlaskConical, desc: "Formula cost & sustainability modeling" },
  { href: "/StructuralBiology", label: "Structural Biology", icon: Microscope, desc: "AlphaFold protein structures & binding analysis" },
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
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [user, setUser] = useState(undefined);
  const dropdownRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isActive = (href) => {
    if (href === "/") return location.pathname === "/" || location.pathname === "/Home";
    if (href === "/enterprise") return location.pathname === "/enterprise" || location.pathname === "/EnterpriseAPI";
    if (href === "/research") return location.pathname === "/research" || location.pathname === "/ResearchPortal";
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
    <>
      {/* Research Portal header */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Microscope className="w-4 h-4 text-[#007850]" />
            <span className="text-[#007850] font-semibold uppercase tracking-wider">Research Portal</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-500">
            <a href="#" className="hover:text-[#007850] transition-colors">PubChem</a>
            <a href="#" className="hover:text-[#007850] transition-colors">ChEMBL</a>
            <a href="#" className="hover:text-[#007850] transition-colors">AlphaFold DB</a>
            <span className="text-slate-400">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="sticky top-14 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
              alt="Suttain"
              className="h-8 w-auto"
            />
            <span className="text-xs font-bold uppercase tracking-widest text-[#6B3FA0] border border-violet-200 bg-violet-50 px-2 py-0.5 rounded hidden sm:inline">
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
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-600 hover:text-violet-700 hover:bg-violet-50"
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
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-600 hover:text-violet-700 hover:bg-violet-50"
                }`}
              >
                Tools
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
              </button>

              {toolsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[640px] bg-white border border-slate-200 rounded-2xl shadow-xl p-4 grid grid-cols-2 gap-1">
                  {TOOLS_MENU.map((tool) => {
                    const Icon = tool.icon;
                    const active = location.pathname === tool.href;
                    return (
                      <Link
                        key={tool.href}
                        to={tool.href}
                        onClick={() => setToolsOpen(false)}
                        className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-colors group ${
                          active ? "bg-violet-50 border border-violet-200" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-[#6B3FA0]" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold leading-tight mb-0.5 ${active ? "text-violet-700" : "text-slate-800 group-hover:text-violet-700"}`}>
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
            {user === null && (
              <button
                onClick={() => navigate('/login')}
                className="text-slate-600 hover:text-violet-700 text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
            {user && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-700 font-semibold">
                  <div className="w-7 h-7 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <span className="hidden lg:inline">{user.full_name?.split(" ")[0] || user.email}</span>
                </div>
                <button
                  onClick={() => base44.auth.logout()}
                  className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-violet-700 rounded-lg hover:bg-violet-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                isActive(href)
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-600 hover:text-violet-700 hover:bg-violet-50"
              }`}
            >
              {label}
            </Link>
          ))}

          {/* Mobile Tools collapsible */}
          <button
            onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              isToolsActive ? "bg-violet-100 text-violet-700" : "text-slate-600 hover:text-violet-700 hover:bg-violet-50"
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
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-600 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[#6B3FA0] flex-shrink-0" />
                    {tool.label}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="border-t border-slate-200 mt-2 pt-3 flex flex-col gap-2">
            {user === null && (
              <button
                onClick={() => { setMobileOpen(false); navigate('/login'); }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-slate-600 hover:text-violet-700 hover:bg-violet-50 text-sm font-semibold transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
            {user && (
              <button
                onClick={() => { setMobileOpen(false); base44.auth.logout(); }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-slate-600 hover:text-violet-700 hover:bg-violet-50 text-sm font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
      </nav>
    </>
  );
}