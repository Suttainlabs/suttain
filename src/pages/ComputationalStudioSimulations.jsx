import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gauge, ArrowRight, Hexagon } from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';
import AuthContext from '@/components/auth/AuthContext';
import useTrialStatus from '@/hooks/useTrialStatus';
import { createPageUrl } from '@/utils';
import {
  SIM_TYPES, DOMAIN_SIM_MAP, DOMAIN_TAGS, DOMAIN_COLORS, DOMAIN_DESCRIPTIONS,
} from './ComputationalSimulation';

export default function ComputationalStudioSimulations() {
  const { user } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const navigate = useNavigate();
  const [domain, setDomain] = useState('Pharma');

  const canAccess = !user || trialStatus.isPro || trialStatus.trialDaysLeft > 0;

  if (user && !canAccess) {
    return (
      <StudioLayout>
        <div className="flex items-center justify-center py-16 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-violet-100 p-8 text-center">
            <div className="w-16 h-16 bg-[#534AB7] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Gauge className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Pro feature</h2>
            <p className="text-slate-600 mb-1">Computational simulations require a <span className="font-semibold text-violet-700">Pro subscription</span>.</p>
            <p className="text-slate-500 text-sm mb-6">Access drug discovery, molecular dynamics and quantum chemistry workflows.</p>
            <Link to={createPageUrl('Pricing')} className="block w-full bg-[#534AB7] hover:bg-[#4538a0] text-white font-bold py-3 px-6 rounded-xl transition-all text-center">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </StudioLayout>
    );
  }

  const filteredSims = SIM_TYPES.filter(s => DOMAIN_SIM_MAP[domain]?.includes(s.id));

  const handleSelectSim = (simId) => {
    navigate(`/SimulationRunner?type=${simId}&domain=${encodeURIComponent(domain)}`);
  };

  return (
    <StudioLayout>
      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200">
              <Gauge className="w-5 h-5 text-[#0F6E56]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Simulations</h1>
              <p className="text-sm text-slate-500">Drug discovery, molecular dynamics and quantum chemistry for companies and research laboratories.</p>
            </div>
          </div>
        </div>

        {/* Domain tabs */}
        <div className="flex flex-wrap gap-2">
          {DOMAIN_TAGS.map(d => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                domain === d
                  ? DOMAIN_COLORS[d] || 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Domain description banner */}
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
            <Hexagon className="w-5 h-5 text-[#534AB7]" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{domain}</p>
            <p className="text-slate-500 text-xs">{DOMAIN_DESCRIPTIONS[domain]}</p>
          </div>
          <div className="ml-auto text-xs text-slate-400 font-medium hidden sm:block">
            {filteredSims.length} simulation types available
          </div>
        </div>

        {/* Simulation cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSims.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => handleSelectSim(s.id)}
                className="group text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-violet-300 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 leading-tight group-hover:text-violet-700 transition-colors">
                  {s.label}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{s.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.engines.slice(0, 3).map(e => (
                    <span key={e} className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {e}
                    </span>
                  ))}
                  {s.engines.length > 3 && (
                    <span className="inline-block bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">
                      +{s.engines.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          })}



        </div>
      </div>
    </StudioLayout>
  );
}