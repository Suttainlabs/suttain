import React from 'react';
import { Link } from 'react-router-dom';
import { Gauge, ArrowRight, Users } from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';

const TOOL_CARDS = [
  { path: '/ComputationalStudio/Simulations', title: 'Simulations', description: 'Configure QM/MM, quantum chemistry, biomolecular dynamics and materials calculations across five compute fields', icon: Gauge },
];

export default function ComputationalStudio() {
  return (
    <StudioLayout>
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
              <div className="mt-3 flex items-center justify-end">
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