import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Hexagon, Circle, Layers, Gauge, AlertTriangle, ListChecks, ArrowRight, Users } from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';
import Studio3DViewer from '@/components/studio/Studio3DViewer';
import { SourcedBadge } from '@/components/studio/StudioShared';

const TOOL_CARDS = [
  { path: '/ComputationalStudio/Simulations', title: 'Simulations', description: 'Run DFT, MD, docking, QM, materials, and Monte Carlo simulations across scientific domains', icon: Gauge },
  { path: '/ComputationalStudio/Proteins', title: 'Proteins', description: 'Predict, visualize, and analyze protein structures from sequence to property', icon: Hexagon },
  { path: '/ComputationalStudio/SmallMolecules', title: 'Small Molecules', description: 'Look up, compute, and compare molecular properties and descriptors', icon: Circle },
  { path: '/ComputationalStudio/Materials', title: 'Materials', description: 'Build structures and generate inputs for external simulation engines', icon: Layers },
  { path: '/ComputationalStudio/HazardSafety', title: 'Hazard & Safety', description: 'Run validated hazard classification with confidence scores and source citations', icon: AlertTriangle },
  { path: '/ComputationalStudio/Jobs', title: 'Jobs', description: 'Track all submitted jobs across single run, batch, and pipeline modes', icon: ListChecks },
];

export default function ComputationalStudio() {
  return (
    <StudioLayout>
      {/* Hero */}
      <section className="grid lg:grid-cols-2 gap-8 items-center py-6 lg:py-10">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full mb-4">
            <LayoutGrid className="w-3.5 h-3.5 text-[#0F6E56]" />
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">Computational Studio</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Design, predict, and analyze molecules and proteins in one workspace
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-4 max-w-lg mx-auto lg:mx-0">
            A unified computational science platform for structural biology, molecular intelligence, materials, and hazard prediction with full source traceability.
          </p>
          <div className="flex items-center gap-3 justify-center lg:justify-start mt-6">
            <Link to="/ComputationalStudio/Proteins" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors bg-[#0F6E56] hover:bg-[#0d5c47]">
              Explore tools <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/ComputationalStudio/Jobs" className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-white transition-colors">
              View jobs
            </Link>
          </div>
          <div className="mt-4 flex justify-center lg:justify-start">
            <SourcedBadge />
          </div>
        </div>
        <div className="relative">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <Studio3DViewer mode="protein" height={420} />
          </div>
        </div>
      </section>

      {/* Tool cards grid */}
      <section className="py-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Tool pages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOL_CARDS.map(card => (
            <Link key={card.path} to={card.path}
              className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#0F6E56]/40 hover:shadow-sm transition-all flex flex-col">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-[#F7F6F2] border border-slate-200">
                <card.icon className="w-5 h-5 text-[#0F6E56]" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
              <p className="text-sm text-slate-500 mt-1 flex-1">{card.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <SourcedBadge />
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F6E56] group-hover:gap-1.5 transition-all">
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="text-center py-8 border-t border-slate-200 mt-4">
        <div className="inline-flex items-center gap-2 text-slate-500">
          <Users className="w-4 h-4 text-[#0F6E56]" />
          <p className="text-sm">Built for researchers, formulators, and students, from independent labs to institutions.</p>
        </div>
      </section>
    </StudioLayout>
  );
}