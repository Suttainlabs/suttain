import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, TestTube, Microscope, Terminal, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { href: "Home", label: "Home", icon: Home },
  { href: "Simulator", label: "Tools", icon: TestTube },
  { href: "/research", label: "Research", icon: Microscope },
  { href: "/enterprise", label: "Enterprise", icon: Terminal },
];

export default function DarkNavBar() {
  const location = useLocation();

  const isActive = (href) => {
    if (href === "/enterprise") return location.pathname === "/enterprise" || location.pathname === "/EnterpriseAPI";
    if (href === "/research") return location.pathname === "/research" || location.pathname === "/ResearchLanding";
    return location.pathname === createPageUrl(href);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
              alt="Suttain"
              className="h-8 w-auto brightness-0 invert opacity-90"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              const to = href.startsWith("/") ? href : createPageUrl(href);
              return (
                <Link
                  key={href}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Sign In CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to={createPageUrl("Home")}>
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0 rounded-full px-5 font-semibold text-sm shadow-lg shadow-violet-500/20"
              >
                Launch App
              </Button>
            </Link>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-700">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const to = href.startsWith("/") ? href : createPageUrl(href);
                  return (
                    <DropdownMenuItem key={href} asChild>
                      <Link to={to} className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}