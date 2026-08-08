import React from 'react';
import { Microscope, Boxes } from 'lucide-react';
import {
  DescriptorsPanel,
  ComparePanel,
  PubChemLookupPanel,
  ChEMBLLookupPanel,
  EngineInputPanel,
} from '@/components/studio/SmallMoleculePanels';
import MaterialsSearchPanel from '@/components/studio/MaterialsSearchPanel';

export default function QuickResearchTools() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Microscope className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Quick Research Tools</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Molecule lookups</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <DescriptorsPanel />
          <ComparePanel />
          <PubChemLookupPanel />
          <ChEMBLLookupPanel />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Boxes className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Materials and engine inputs</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <MaterialsSearchPanel />
          <EngineInputPanel />
        </div>
      </div>
    </div>
  );
}