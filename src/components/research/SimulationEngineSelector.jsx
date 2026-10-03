import React from 'react';
import { Info, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useEngineRegistry from '@/components/simulation/useEngineRegistry';

export default function SimulationEngineSelector({ engines=[], selected, onSelect, tooltips={}, simType }) {
  const {data,isLoading,error}=useEngineRegistry();
  const registered=data?.engines || [];
  const groups=[{title:'Hosted services',description:'Rowan performs supported quantum calculations; PubChem retrieves existing data, not substitute calculations.',items:registered.filter(e=>e.deployment==='hosted')},{title:'Run on your HPC',description:'Prepared inputs only. xtb and RDKit also require local execution until a compute worker is connected.',items:registered.filter(e=>e.deployment==='input_file')},{title:'Existing workflow engines',description:'Original input-file targets for this workflow.',items:engines.filter(label=>!registered.some(e=>e.label===label)).map(label=>({id:label,label,sim_types:[simType],deployment:'input_file'}))}];
  return <section className="border-b border-research-border pb-7 mb-7">
    <p className="research-label mb-2">01 / Compute engine</p><h2 className="!text-lg mb-4">Software / engine</h2>
    {isLoading && <p role="status" className="text-sm text-research-muted">Loading engine library…</p>}
    {error && <p role="alert" className="text-sm text-destructive">Engine library could not load. Refresh to try again.</p>}
    <TooltipProvider>{groups.filter(g=>g.items.length).map(group=><div key={group.title} className="mb-5">
      <h3 className="text-sm mb-1">{group.title}</h3><p className="text-sm text-research-muted mb-3">{group.description}</p>
      <div role="group" aria-label={group.title} className="flex flex-wrap gap-2">{group.items.map(engine=>{
        const supported=!simType || engine.id==='pubchem' || engine.id==='rdkit' || engine.sim_types.includes(simType);
        return <Tooltip key={engine.id}><TooltipTrigger asChild><button type="button" aria-pressed={selected===engine.label} onClick={()=>onSelect(engine.label)} className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${selected===engine.label?'border-research-accent bg-research-soft text-research-accent':'border-research-border bg-research-card text-research-muted hover:border-research-accent'}`}>
          {selected===engine.label && <Check className="h-4 w-4"/>}{engine.label}{engine.id==='rowan' && <span className="text-xs">Default</span>}{!supported && <Info className="h-3.5 w-3.5"/>}
        </button></TooltipTrigger><TooltipContent className="max-w-xs">{supported?(engine.hosting_note || tooltips[engine.label] || engine.license || 'Input-file preparation'): 'Not supported for this workflow. Select a supported workflow or another engine; no substitute calculation is made.'}</TooltipContent></Tooltip>;
      })}</div></div>)}</TooltipProvider>
  </section>;
}