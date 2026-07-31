import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const RESEARCH_NAV_LINKS = [
  { label: "Molecules", to: "/ResearchMolecules" },
  { label: "Simulation", to: "/ResearchSimulation" },
  { label: "Compute", to: "/ResearchCompute" },
  { label: "Safety data", to: "/ResearchSafety" },
];

export default function ResearchNav() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="content-container flex items-center justify-between gap-4 h-16 px-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
            alt="Suttain"
            className="h-7 w-auto"
          />
          <span className="text-sm font-medium text-research-accent">suttain research</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {RESEARCH_NAV_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-research-accent-light hover:text-research-accent transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button asChild size="sm" className="bg-research-accent hover:bg-research-accent/90 text-white">
          <Link to="/login">Log in</Link>
        </Button>
      </div>
    </header>
  );
}