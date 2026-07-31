import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "Docs", to: "/APIPortal" },
  { label: "Pricing", to: "/Pricing" },
  { label: "Status", to: "/APIPortal" },
];

export default function ApiNav() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="content-container flex items-center justify-between gap-4 h-16 px-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
            alt="Suttain"
            className="h-7 w-auto"
          />
          <span className="text-sm font-medium text-api-accent">suttain api</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-api-accent-light hover:text-api-accent transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button asChild size="sm" className="bg-api-accent hover:bg-api-accent/90 text-white">
          <Link to="/login">Log in</Link>
        </Button>
      </div>
    </header>
  );
}