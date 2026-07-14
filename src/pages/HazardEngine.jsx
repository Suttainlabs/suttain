import React, { useState, useEffect } from 'react';
import { Database, Target, BarChart3, Cpu, ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BenchmarkExplorer from '@/components/hazard/BenchmarkExplorer';
import PredictionPanel from '@/components/hazard/PredictionPanel';
import ValidationDashboard from '@/components/hazard/ValidationDashboard';
import FeasibilityDemo from '@/components/hazard/FeasibilityDemo';
import { HazardDataPanel, HazardExplanationPanel } from '@/components/hazard/HazardPanels';

const TABS = [
  { id: 'benchmark', label: 'Benchmark', icon: Database, description: 'Curated gold-standard dataset' },
  { id: 'predict', label: 'Predict', icon: Target, description: 'Run a hazard prediction' },
  { id: 'validation', label: 'Validation', icon: BarChart3, description: 'Model performance and metrics' },
  { id: 'feasibility', label: 'Feasibility', icon: Cpu, description: 'Browser-scale compute demo' },
];

export default function HazardEngine() {
  const [activeTab, setActiveTab] = useState('benchmark');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isPro = user?.role === 'admin' ||
    user?.subscription_tier === 'pro' ||
    user?.subscription_status === 'pro' ||
    user?.admin_granted_access === true;

  return (
    <div className="min-h-screen bg-[#EDF7F2]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Hazard Prediction Engine</h1>
              <p className="text-sm text-slate-500">
                Validated chemical hazard classification with confidence scores and full source traceability
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 border border-violet-200 rounded-md text-xs font-semibold text-violet-700">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
              No black box
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-md text-xs font-semibold text-teal-700">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
              Source-traceable
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-600">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
              130M+ compound coverage ambition
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-xs font-semibold text-amber-700">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              Conservative by design
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap lg:w-full text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-500 to-teal-500 text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="hidden lg:block">
                      <div>{tab.label}</div>
                      <div className={`text-xs font-normal ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {tab.description}
                      </div>
                    </div>
                    <span className="lg:hidden">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Enterprise API note */}
            <div className="hidden lg:block mt-4 bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-700 mb-1">Enterprise API</p>
              <code className="text-xs font-mono text-teal-600">POST /v1/hazard-score</code>
              <p className="text-xs text-slate-500 mt-2">
                Returns binary result, confidence, categories, and citations.
                Consistent with the no-black-box API promise.
              </p>
            </div>

            {/* Tier info */}
            <div className="hidden lg:block mt-3 bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-700 mb-1">Your Access</p>
              {isPro ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-violet-50 border border-violet-200 rounded text-xs font-semibold text-violet-700">
                  Researcher Pro / Institutional
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-600">
                  Consumer (simplified results)
                </span>
              )}
              <p className="text-xs text-slate-400 mt-2">
                {isPro
                  ? 'Full model internals, validation dashboard, and feasibility tools are unlocked.'
                  : 'Binary result with confidence is available. Upgrade for full internals.'}
              </p>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'benchmark' && <BenchmarkExplorer />}
            {activeTab === 'predict' && <PredictionPanel isPro={isPro} />}
            {activeTab === 'validation' && <ValidationDashboard isPro={isPro} />}
            {activeTab === 'feasibility' && <FeasibilityDemo isPro={isPro} />}

            {(activeTab === 'predict' || activeTab === 'benchmark') && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Chemical Identity and Explanation</h2>
                <p className="text-sm text-slate-500 mb-4">Look up chemical identity from EPA CompTox + PubChem, and get an AI-powered hazard explanation with full source transparency.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <HazardDataPanel />
                  <HazardExplanationPanel />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}