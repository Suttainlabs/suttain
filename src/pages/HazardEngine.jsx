import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import PredictTab from '@/components/hazardEngine/PredictTab';
import ValidationTab from '@/components/hazardEngine/ValidationTab';

const TABS = [
  { id: 'predict', label: 'Predict' },
  { id: 'validation', label: 'Validation' },
];

export default function HazardEngine() {
  const [tab, setTab] = useState('predict');
  const [mode, setMode] = useState('balanced');

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}
        >
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HazardEngine</h1>
          <p className="text-sm text-slate-500">
            Validated hazard classification with calibrated confidence, descriptors, and full provenance.
          </p>
        </div>
      </div>

      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-[#007850] text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'predict' && <PredictTab mode={mode} setMode={setMode} />}
      {tab === 'validation' && <ValidationTab mode={mode} setMode={setMode} />}
    </div>
  );
}