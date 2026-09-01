import React, { useState } from 'react';
import { ExternalLink, BookOpen, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TUTORIALS = [
  {
    level: 'Beginner',
    color: 'bg-green-100 text-green-700',
    items: [
      { title: 'Your First Simulation', desc: 'Creating a flowsheet, adding compounds, choosing a property package.', url: 'https://dwsim.org/tutorials/en/beginner/01-your-first-simulation.html', tags: ['flowsheet', 'basics'] },
      { title: 'Mixer Basics', desc: 'Material streams, mixer, solving, reading results.', url: 'https://dwsim.org/tutorials/en/beginner/02-mixer-basics.html', tags: ['mixer', 'streams'] },
      { title: 'Heater and Cooler', desc: 'Energy streams, heat duty, temperature specification.', url: 'https://dwsim.org/tutorials/en/beginner/03-heater-cooler.html', tags: ['energy', 'heat'] },
      { title: 'Simple Flash Drum', desc: 'Two-phase flash, vapor fraction, separator.', url: 'https://dwsim.org/tutorials/en/beginner/04-simple-flash-drum.html', tags: ['flash', 'separator'] },
    ],
  },
  {
    level: 'Intermediate',
    color: 'bg-blue-100 text-blue-700',
    items: [
      { title: 'Distillation Column', desc: 'Rigorous column, stages, condenser/reboiler specs.', url: 'https://dwsim.org/tutorials/en/intermediate/01-distillation-column.html', tags: ['distillation'] },
      { title: 'Heat Exchanger Design', desc: 'LMTD, UA, counter-current exchange.', url: 'https://dwsim.org/tutorials/en/intermediate/02-heat-exchanger-design.html', tags: ['heat exchanger'] },
      { title: 'Reaction Systems', desc: 'Conversion, equilibrium, and Gibbs reactors.', url: 'https://dwsim.org/tutorials/en/intermediate/03-reaction-systems.html', tags: ['reactor'] },
      { title: 'Recycle Loops', desc: 'Tear streams, convergence strategies.', url: 'https://dwsim.org/tutorials/en/intermediate/04-recycle-loops.html', tags: ['recycle', 'convergence'] },
      { title: 'Phase Envelope', desc: 'PT diagrams, bubble/dew curves, critical point.', url: 'https://dwsim.org/tutorials/en/intermediate/05-phase-envelope.html', tags: ['thermodynamics', 'VLE'] },
    ],
  },
  {
    level: 'Advanced',
    color: 'bg-violet-100 text-violet-700',
    items: [
      { title: 'Refrigeration Cycle', desc: 'Propane (R-290) vapor-compression refrigeration.', url: 'https://dwsim.org/tutorials/en/advanced/01-refrigeration-cycle.html', tags: ['refrigeration'] },
      { title: 'Ammonia Synthesis', desc: 'Haber-Bosch: compression, equilibrium reactor, separator.', url: 'https://dwsim.org/tutorials/en/advanced/02-ammonia-synthesis.html', tags: ['reactor', 'industrial'] },
      { title: 'Benzene/Toluene Separation', desc: 'Binary aromatic distillation.', url: 'https://dwsim.org/tutorials/en/advanced/03-benzene-toluene-separation.html', tags: ['distillation', 'aromatics'] },
      { title: 'Natural Gas Processing', desc: 'Multi-component dew point control.', url: 'https://dwsim.org/tutorials/en/advanced/04-natural-gas-processing.html', tags: ['gas processing'] },
      { title: 'Ethanol Plant', desc: 'Fermentation and purification.', url: 'https://dwsim.org/tutorials/en/advanced/05-ethanol-plant.html', tags: ['bioprocessing'] },
      { title: 'Reverse Osmosis', desc: 'Membrane desalination.', url: 'https://dwsim.org/tutorials/en/advanced/06-reverse-osmosis.html', tags: ['membrane', 'water'] },
      { title: 'Methanol Synthesis', desc: 'Syngas-to-methanol with recycle.', url: 'https://dwsim.org/tutorials/en/advanced/07-methanol-synthesis.html', tags: ['reactor', 'recycle'] },
    ],
  },
  {
    level: 'New Features',
    color: 'bg-orange-100 text-orange-700',
    items: [
      { title: 'Techno-Economic Analysis', desc: 'CAPEX, OPEX, NPV, IRR, payback period.', url: 'https://dwsim.org/tutorials/en/features/tea-techno-economic-analysis.html', tags: ['economics', 'TEA'] },
      { title: 'Life Cycle Assessment', desc: 'GWP, acidification, eutrophication, LCA inside DWSIM.', url: 'https://dwsim.org/tutorials/en/features/lca-life-cycle-assessment.html', tags: ['LCA', 'sustainability'] },
      { title: 'AI Assistant', desc: 'Natural-language simulation assistance built into DWSIM.', url: 'https://dwsim.org/tutorials/en/features/ai-assistant.html', tags: ['AI'] },
      { title: 'Phase Envelope Tool', desc: 'PT/PH/TS diagrams and lookups.', url: 'https://dwsim.org/tutorials/en/features/phase-envelope.html', tags: ['thermodynamics'] },
    ],
  },
];

export default function DWSIMTutorials() {
  const [filter, setFilter] = useState('All');
  const levels = ['All', ...TUTORIALS.map(t => t.level)];

  const filtered = filter === 'All' ? TUTORIALS : TUTORIALS.filter(t => t.level === filter);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        <BookOpen className="w-4 h-4 text-[#007850]" />
        <span className="text-sm font-semibold text-[#00281E]">Filter by level:</span>
        {levels.map(l => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              filter === l ? 'bg-[#007850] text-white border-[#007850]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#007850]'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {filtered.map(group => (
        <div key={group.level}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${group.color}`}>{group.level}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.items.map(item => (
              <a
                key={item.title}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-[#007850]/40 hover:shadow-md transition-all flex flex-col gap-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-[#00281E] text-sm group-hover:text-[#007850] transition-colors">{item.title}</h4>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-medium">{tag}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-[#EDF7F2] border border-[#007850]/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-8 h-8 bg-[#007850] rounded-xl flex items-center justify-center flex-shrink-0">
          <Star className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-[#00281E] text-sm mb-1">Reference Guides</p>
          <p className="text-xs text-slate-600 mb-3">Property package selection guide and troubleshooting documentation.</p>
          <div className="flex gap-2 flex-wrap">
            <a href="https://dwsim.org/tutorials/en/reference/property-packages-guide.html" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                Property Packages Guide <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
            <a href="https://dwsim.org/tutorials/en/reference/troubleshooting.html" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                Troubleshooting <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}