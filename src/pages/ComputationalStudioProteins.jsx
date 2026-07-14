import React from 'react';
import { Microscope } from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';
import Studio3DViewer from '@/components/studio/Studio3DViewer';
import { SourcedBadge } from '@/components/studio/StudioShared';

export default function ComputationalStudioProteins() {
  return (
    <StudioLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
              <Microscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Proteins</h1>
              <p className="text-sm text-slate-500">Predict, visualize, and analyze protein structures from sequence to property</p>
            </div>
          </div>
          <SourcedBadge />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <Studio3DViewer mode="protein" height={450} />
          <p className="text-xs text-center text-slate-400 mt-2">Live 3D protein ribbon structure. Drag to rotate, scroll to zoom.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-500">Detailed protein tools coming next: AlphaFold prediction, RCSB PDB visualization, binding analysis, and developability assessment.</p>
        </div>
      </div>
    </StudioLayout>
  );
}