import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home, TestTube, Microscope, Terminal, Code2, Star, LogIn, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const RESEARCH_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/research", label: "Research", icon: Microscope },
  { href: "/ComputationalSimulation", label: "Tools", icon: TestTube },
  { href: "/enterprise", label: "Enterprise", icon: Terminal },
  { href: "/Pricing", label: "Pricing", icon: Star },
  { href: "/APIPortal", label: "API Docs", icon: Code2 },
];

export default function DarkNavBar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href) => {
    if (href === "/") return location.pathname === "/" || location.pathname === "/Home";
    if (href === "/enterprise") return location.pathname === "/enterprise" || location.pathname === "/EnterpriseAPI";
    if (href === "/research") return location.pathname === "/research" || location.pathname === "/ResearchLanding";
    return location.pathname === href || location.pathname === href.replace("/", "/");
  };

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
            {RESEARCH_NAV.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  to={href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
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
            <Link to={createPageUrl("MolecularIntelligence")}>
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0 rounded-full px-5 font-semibold text-sm shadow-lg shadow-violet-500/20"
              >
                Launch Research
              </Button>
            </Link>
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
          {RESEARCH_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                isActive(href)
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <div className="border-t border-slate-800 mt-2 pt-3 flex flex-col gap-2">
            <button
              onClick={() => { setMobileOpen(false); base44.auth.redirectToLogin(); }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 text-sm font-semibold transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <Link
              to={createPageUrl("MolecularIntelligence")}
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 rounded-xl text-center text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #0891b2)" }}
            >
              Launch Research
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}