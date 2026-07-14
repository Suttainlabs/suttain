import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';
import Studio3DViewer from '@/components/studio/Studio3DViewer';
import { SourcedBadge } from '@/components/studio/StudioShared';

export default function ComputationalStudioHazardSafety() {
  return (
    <StudioLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C42B2B, #D4900A)' }}>
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Hazard & Safety</h1>
              <p className="text-sm text-slate-500">Run validated hazard classification with confidence scores and source citations</p>
            </div>
          </div>
          <SourcedBadge />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 relative">
          <Studio3DViewer mode="hazard" height={450} />
          {/* Hazard readout card overlay */}
          <div className="absolute top-4 right-4 bg-white border border-red-200 rounded-xl p-4 shadow-lg max-w-[220px] z-20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-red-700">Hazardous</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between"><span>Confidence</span><span className="font-mono font-bold text-slate-800">92%</span></div>
              <div className="flex justify-between"><span>Label</span><span className="font-mono text-red-600">hazardous</span></div>
              <div className="pt-1.5 border-t border-slate-100">
                <div className="text-slate-400 mb-0.5">Categories</div>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded text-[10px]">Endocrine Disruptor</span>
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px]">Irritant</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-slate-100">
                <div className="text-slate-400 mb-0.5">GHS Codes</div>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[10px]">H317</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[10px]">H319</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[10px]">H361f</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-slate-100 text-slate-400">
                Sources: EPA CompTox, ECHA
              </div>
            </div>
          </div>
          <p className="text-xs text-center text-slate-400 mt-2">Live 3D hazard compound visualization with readout card. Drag to rotate, scroll to zoom.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-500">Detailed hazard tools coming next: submit any compound to the Hazard Prediction Engine and get binary classification, calibrated confidence, hazard categories, and full source citations.</p>
        </div>
      </div>
    </StudioLayout>
  );
}