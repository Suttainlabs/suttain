import React, { useState, useContext } from 'react';
import { Gauge, Hexagon } from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';
import AuthContext from '@/components/auth/AuthContext';
import useTrialStatus from '@/hooks/useTrialStatus';
import SimulationCatalogCard from '@/components/research/SimulationCatalogCard';
import SubscriptionLock from '@/components/shared/SubscriptionLock';
import { SIM_TYPES, DOMAIN_SIM_MAP, DOMAIN_TAGS, DOMAIN_DESCRIPTIONS } from '@/pages/ComputationalSimulation';

const domainLabel = value => value.charAt(0) + value.slice(1).toLowerCase();
export default function ComputationalStudioSimulations() {
  const { user } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const [domain, setDomain] = useState(() => {
    const requestedDomain = new URLSearchParams(window.location.search).get('domain');
    return DOMAIN_TAGS.includes(requestedDomain) ? requestedDomain : 'Chemistry';
  });
  const canAccess = trialStatus.canRunResearchSim;
  const filteredSims = SIM_TYPES.filter(simulation => DOMAIN_SIM_MAP[domain]?.includes(simulation.id));
  if (user && !canAccess) return <StudioLayout><SubscriptionLock pillar="research" featureName="Research simulations" limit /></StudioLayout>;
  return (
    <StudioLayout>
      <section className="pt-3 sm:pt-5">
        <div className="grid grid-cols-12 gap-4 mb-9">
          <div className="col-span-12 lg:col-span-9">
            <p className="research-label mb-4">Computational studio / Workflow catalog</p>
            <div className="flex items-center gap-3 mb-4"><Gauge className="h-6 w-6 text-research-accent" strokeWidth={1.5} /><h1>Simulations</h1></div>
            <p className="text-research-muted max-w-2xl">Advanced QM/MM, quantum chemistry and materials workflows for independent, enterprise and academic research.</p>
          </div>
          <p className="col-span-12 lg:col-span-3 research-label lg:text-right lg:self-end">{trialStatus.hasResearchAccess ? 'Unlimited research access' : `${trialStatus.usage.researchSimulations} / 3 research simulations this month`}</p>
        </div>
        <div role="group" aria-label="Filter by compute field" className="flex flex-wrap gap-2 border-b border-research-border pb-6 mb-6">
          {DOMAIN_TAGS.map(value => <button key={value} type="button" aria-pressed={domain === value} onClick={() => setDomain(value)} className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${domain === value ? 'bg-research-accent text-research-card border-research-accent' : 'bg-research-card text-research-muted border-research-border hover:border-research-accent'}`}>{domainLabel(value)}</button>)}
        </div>
        <div aria-live="polite" className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-research-border bg-research-card p-5 sm:p-6 mb-6">
          <div className="research-icon"><Hexagon className="h-5 w-5" strokeWidth={1.5} /></div>
          <div className="flex-1"><h2 className="!text-lg mb-1">{domainLabel(domain)}</h2><p className="text-sm text-research-muted">{DOMAIN_DESCRIPTIONS[domain]}</p></div>
          <p className="font-mono text-xs text-research-muted sm:text-right shrink-0">{String(filteredSims.length).padStart(2, '0')} workflows available</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSims.map((simulation, index) => <SimulationCatalogCard key={simulation.id} simulation={simulation} domain={domain} index={index} />)}
        </div>
        {filteredSims.length === 0 && <p className="py-12 text-center text-research-muted">No workflows are available for this compute field.</p>}
      </section>
    </StudioLayout>
  );
}