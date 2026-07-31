import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Microscope, Atom, Boxes, ShieldAlert, Briefcase, ChevronRight, FlaskConical, Cpu } from 'lucide-react';
import MolecularBackground from '@/components/shared/MolecularBackground';

const STUDIO_TABS = [
  { path: '/ComputationalStudio', label: 'Hub', icon: Home },
  { path: '/ComputationalStudio/Proteins', label: 'Proteins', icon: Microscope },
  { path: '/ComputationalStudio/SmallMolecules', label: 'Small Molecules', icon: Atom },
  { path: '/ComputationalStudio/Materials', label: 'Materials', icon: Boxes },
  { path: '/ComputationalStudio/Simulations', label: 'Simulations', icon: Cpu },
  { path: '/ComputationalStudio/HazardSafety', label: 'Hazard & Safety', icon: ShieldAlert },
  { path: '/ComputationalStudio/Jobs', label: 'Jobs', icon: Briefcase },
];

export default function StudioLayout({ children }) {
  const location = useLocation();
  const currentTab = STUDIO_TABS.find(t => t.path === location.pathname);

  return (
    <div className="min-h-screen bg-[#EDF7F2] relative">
      <MolecularBackground className="fixed inset-0 z-0" opacity={0.035} />
      <div className="relative z-10">
        {/* Sub-navigation */}
        <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 h-12">
              <Link to="/ComputationalStudio" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#007850] to-[#6B3FA0] flex items-center justify-center">
                  <FlaskConical className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-slate-800 text-sm hidden sm:block">Computational Studio</span>
              </Link>
              <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
                {STUDIO_TABS.map(tab => {
                  const isActive = location.pathname === tab.path;
                  return (
                    <Link key={tab.path} to={tab.path}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-[#E6F9F3] text-[#007850] border border-teal-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}>
                      <tab.icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </Link>
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
            {currentTab && currentTab.path !== '/ComputationalStudio' && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="font-semibold text-slate-700">{currentTab.label}</span>
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