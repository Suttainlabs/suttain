import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, ExternalLink, Copy, Check, ChevronDown, ChevronUp, Play, FlaskConical, Thermometer, Layers, ArrowRight, BookOpen, Zap, Code2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DWSIMScriptBuilder from '@/components/dwsim/DWSIMScriptBuilder';
import DWSIMTutorials from '@/components/dwsim/DWSIMTutorials';
import DWSIMSimulationAI from '@/components/dwsim/DWSIMSimulationAI';

const tabs = ['Overview', 'AI Script Generator', 'Script Builder', 'Tutorials'];

export default function DWSIMIntegration() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-[#EDF7F2]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#e0faf3] via-[#edfaf5] to-[#e0faf3] py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#00C896]/20 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-[#00C896]" />
            </div>
            <Badge className="bg-[#00C896]/20 text-[#00C896] border-0 text-xs font-semibold">Open Source</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#00C896]">DWSIM Process Simulator</h1>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mb-8 leading-relaxed">
            Industry-grade steady-state and dynamic chemical process simulation. Model distillation columns, reactors, heat exchangers, and complete flowsheets — free and open source.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://dwsim.org/index.php/download/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-[#007850] text-white hover:bg-[#005f3e] font-bold gap-2">
                <Download className="w-4 h-4" />
                Download DWSIM Free
              </Button>
            </a>
            <a
              href="https://dwsim.org/tutorials/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-[#00C896] text-[#00C896] hover:bg-[#00C896]/10 gap-2">
                <BookOpen className="w-4 h-4" />
                Official Tutorials
                <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-10">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#007850] text-[#007850]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'Overview' && <DWSIMOverview onGoToBuilder={() => setActiveTab('AI Script Generator')} />}
        {activeTab === 'AI Script Generator' && <DWSIMSimulationAI />}
        {activeTab === 'Script Builder' && <DWSIMScriptBuilder />}
        {activeTab === 'Tutorials' && <DWSIMTutorials />}
      </div>
    </div>
  );
}

function DWSIMOverview({ onGoToBuilder }) {
  const capabilities = [
    {
      icon: Thermometer,
      title: 'Rigorous Thermodynamics',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      items: ['Peng-Robinson, SRK, PRSV2 equations of state', 'NRTL, UNIQUAC, Wilson activity models', 'Steam tables & CoolProp integration', 'NIST ThermoML archive (120k+ datasets)'],
    },
    {
      icon: Layers,
      title: '35+ Unit Operations',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      items: ['Rigorous & shortcut distillation columns', 'Heat exchangers, compressors, pumps', 'CSTR, PFR, equilibrium reactors', 'Pipes with hydraulic/heat-transfer calc'],
    },
    {
      icon: Play,
      title: 'Steady-State & Dynamic',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      items: ['Design-mode steady-state solving', 'Transient dynamic simulation', 'PID controllers & event scheduling', 'Sensitivity & optimization studies'],
    },
    {
      icon: Code2,
      title: 'Python Automation',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      items: ['FluentAPI for scripted flowsheets', 'Batch sensitivity analysis', 'MCP Server (JSON-RPC) integration', 'Excel VBA & .NET COM automation'],
    },
  ];

  const steps = [
    { n: '1', title: 'Download DWSIM', desc: 'Free installer for Windows, Linux, or macOS. No license required.', href: 'https://dwsim.org/index.php/download/' },
    { n: '2', title: 'Build your script here', desc: 'Use the Script Builder tab to generate a ready-to-run Python FluentAPI script.', action: true },
    { n: '3', title: 'Run in DWSIM', desc: 'Paste or run your script via DWSIM\'s Python Script Operation or external FluentAPI.' },
    { n: '4', title: 'Analyze results', desc: 'Review stream reports, phase envelopes, and export data back to Suttain for compliance scoring.' },
  ];

  return (
    <div className="space-y-10">
      {/* Capability cards */}
      <div>
        <h2 className="text-xl font-bold text-[#00281E] mb-5">What DWSIM Can Simulate</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {capabilities.map(cap => (
            <div key={cap.title} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-9 h-9 ${cap.bg} rounded-xl flex items-center justify-center mb-3`}>
                <cap.icon className={`w-5 h-5 ${cap.color}`} />
              </div>
              <h3 className="font-bold text-[#00281E] mb-2 text-sm">{cap.title}</h3>
              <ul className="space-y-1">
                {cap.items.map(item => (
                  <li key={item} className="text-xs text-slate-500 flex items-start gap-1.5">
                    <span className="text-[#007850] mt-0.5">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow */}
      <div>
        <h2 className="text-xl font-bold text-[#00281E] mb-5">Integration Workflow</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={s.n} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
              <div className="w-8 h-8 bg-[#007850] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {s.n}
              </div>
              <div>
                <p className="font-bold text-[#00281E] text-sm mb-1">{s.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
              {s.href && (
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="text-xs gap-1.5 w-full mt-auto">
                    <ExternalLink className="w-3 h-3" /> Download
                  </Button>
                </a>
              )}
              {s.action && (
                <Button size="sm" className="text-xs gap-1.5 w-full mt-auto bg-[#007850] hover:bg-[#005f3e] text-white" onClick={onGoToBuilder}>
                  <Zap className="w-3 h-3" /> Open Builder
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Supported processes */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-[#00281E] mb-4">Supported Process Domains</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ['Oil & Gas / Refining', ['Crude distillation', 'Natural gas processing', 'LNG liquefaction', 'Pipeline hydraulics']],
            ['Petrochemicals & Chemicals', ['Methanol / ammonia synthesis', 'Aromatics separation', 'Polymer processing', 'Specialty chemicals']],
            ['Pharma & Bioprocessing', ['Fermentation modeling', 'Downstream purification', 'Solvent recovery', 'Biorefinery design']],
            ['Energy & Sustainability', ['CO2 capture / sequestration', 'Hydrogen production', 'Biogas upgrading', 'Thermal power cycles']],
            ['Food & Beverages', ['Ethanol distillation', 'Sugar & starch processing', 'Evaporation & drying', 'Crystallization']],
            ['Water & Environment', ['Reverse osmosis', 'Desalination', 'Wastewater treatment', 'Electrolyte systems']],
          ].map(([domain, items]) => (
            <div key={domain} className="bg-slate-50 rounded-xl p-4">
              <p className="font-semibold text-[#007850] text-xs mb-2">{domain}</p>
              <ul className="space-y-1">
                {items.map(item => (
                  <li key={item} className="text-xs text-slate-600">- {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}