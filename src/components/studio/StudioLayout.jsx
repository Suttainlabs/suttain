import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Search, Hexagon, Circle, Layers, SlidersHorizontal, Gauge,
  AlertTriangle, ListChecks, ChevronRight, ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

const STUDIO_NAV = [
  { type: 'link', path: '/ComputationalStudio', label: 'Hub', icon: LayoutGrid },
  { type: 'group', label: 'Lookup', icon: Search, items: [
    { path: '/ComputationalStudio/Proteins', label: 'Proteins', icon: Hexagon },
    { path: '/ComputationalStudio/SmallMolecules', label: 'Small Molecules', icon: Circle },
    { path: '/ComputationalStudio/Materials', label: 'Materials', icon: Layers },
  ]},
  { type: 'group', label: 'Compute', icon: SlidersHorizontal, items: [
    { path: '/ComputationalStudio/Simulations', label: 'Simulations', icon: Gauge },
    { path: '/ComputationalStudio/HazardSafety', label: 'Hazard & Safety', icon: AlertTriangle },
  ]},
  { type: 'group', label: 'Operations', icon: ListChecks, items: [
    { path: '/ComputationalStudio/Jobs', label: 'Jobs', icon: ListChecks },
  ]},
];

const ALL_PAGES = STUDIO_NAV.flatMap(n => (n.type === 'link' ? [n] : n.items));

export default function StudioLayout({ children }) {
  const location = useLocation();
  const current = ALL_PAGES.find(p => p.path === location.pathname);
  const isGroupActive = (group) => group.items.some(i => i.path === location.pathname);

  return (
    <div className="min-h-screen bg-[#F7F6F2] relative">
      <div className="relative z-10">
        {/* Sub-navigation */}
        <div className="sticky top-14 z-30 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 h-12">
              <Link to="/ComputationalStudio" className="flex items-center gap-2 flex-shrink-0 pr-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <LayoutGrid className="w-3.5 h-3.5 text-[#0F6E56]" />
                </div>
                <span className="font-semibold text-slate-800 text-sm hidden sm:block">Computational Studio</span>
              </Link>
              <div className="h-5 w-px bg-slate-200 hidden sm:block" />
              <nav className="flex items-center gap-1 flex-1">
                {STUDIO_NAV.map((item, idx) => {
                  if (item.type === 'link') {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link key={idx} to={item.path}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          isActive ? 'text-[#0F6E56] bg-[#0F6E56]/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                        }`}>
                        <item.icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  }
                  const active = isGroupActive(item);
                  return (
                    <DropdownMenu key={idx}>
                      <DropdownMenuTrigger asChild>
                        <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          active ? 'text-[#0F6E56] bg-[#0F6E56]/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                        }`}>
                          <item.icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56 p-1.5">
                        {item.items.map(sub => {
                          const subActive = location.pathname === sub.path;
                          return (
                            <DropdownMenuItem asChild key={sub.path}>
                              <Link to={sub.path} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${subActive ? 'bg-[#0F6E56]/10' : 'bg-slate-50'}`}>
                                  <sub.icon className={`w-3.5 h-3.5 ${subActive ? 'text-[#0F6E56]' : 'text-slate-500'}`} />
                                </div>
                                <span className={`text-sm ${subActive ? 'font-semibold text-[#0F6E56]' : 'font-medium text-slate-700'}`}>{sub.label}</span>
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="hover:text-slate-700">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/ComputationalStudio" className="hover:text-slate-700">Computational Studio</Link>
            {current && current.path !== '/ComputationalStudio' && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="font-medium text-slate-700">{current.label}</span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          {children}
        </div>
      </div>
    </div>
  );
}