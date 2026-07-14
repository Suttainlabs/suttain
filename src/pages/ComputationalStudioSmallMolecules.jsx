import React from 'react';
import { Atom } from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';
import Studio3DViewer from '@/components/studio/Studio3DViewer';
import { SourcedBadge } from '@/components/studio/StudioShared';

export default function ComputationalStudioSmallMolecules() {
  return (
    <StudioLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
              <Atom className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Small Molecules</h1>
              <p className="text-sm text-slate-500">Look up, compute, and compare molecular properties and descriptors</p>
            </div>
          </div>
          <SourcedBadge />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <Studio3DViewer mode="molecule" height={450} />
          <p className="text-xs text-center text-slate-400 mt-2">Live 3D ball-and-stick molecular model. Drag to rotate, scroll to zoom.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-500">Detailed small molecule tools coming next: PubChem and ChEMBL lookup, property computation, GFN2-xTB and PM7 calculations, and side-by-side comparison.</p>
        </div>
      </div>
    </StudioLayout>
  );
}