import React from 'react';
import { Boxes } from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';
import Studio3DViewer from '@/components/studio/Studio3DViewer';
import { SourcedBadge } from '@/components/studio/StudioShared';

export default function ComputationalStudioMaterials() {
  return (
    <StudioLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Materials</h1>
              <p className="text-sm text-slate-500">Build structures and generate inputs for external simulation engines</p>
            </div>
          </div>
          <SourcedBadge />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <Studio3DViewer mode="crystal" height={450} />
          <p className="text-xs text-center text-slate-400 mt-2">Live 3D crystal lattice structure. Drag to rotate, scroll to zoom.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-500">Detailed materials tools coming next: structure building, Materials Project property queries, and input file generation for LAMMPS, Quantum ESPRESSO, and GROMACS.</p>
        </div>
      </div>
    </StudioLayout>
  );
}