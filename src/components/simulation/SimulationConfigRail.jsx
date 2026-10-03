import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import DatabaseSearch from '@/components/computational/DatabaseSearch';
import SimulationPresets from '@/components/computational/SimulationPresets';
import SimulationEngineSelector from '@/components/research/SimulationEngineSelector';
import SimulationWorkflowField from '@/components/research/SimulationWorkflowField';
import EngineParameterFields from '@/components/simulation/EngineParameterFields';
import SimulationRunActions from '@/components/simulation/SimulationRunActions';
export default function SimulationConfigRail({sim,engine,catalogue,inputs,onChange,onEngine,fields,onCompound,onPreset,onUpload,onDraw,uploadKeys,drawKeys,onAdvanced,summary,actions}) {
  return <aside className="min-w-0 rounded-xl border border-research-border bg-research-card p-5 self-start lg:sticky lg:top-20 space-y-6">
    <div><p className="research-label mb-1">Configuration</p><h2 className="!text-lg">Set up your workflow</h2></div>
    <SimulationEngineSelector compact engines={sim.engines} selected={engine} onSelect={onEngine} simType={sim.id}/>
    <section className="space-y-4"><h3>Input source</h3>
      {fields.filter(f=>uploadKeys.includes(f.key)).map(field=><SimulationWorkflowField key={field.key} field={field} value={inputs[field.key]} onChange={value=>onChange(field.key,value)} canUpload canDraw={drawKeys.includes(field.key)} onUpload={()=>onUpload(field.key)} onDraw={()=>onDraw(field.key)}/>)}
      <details><summary className="cursor-pointer text-sm text-research-accent py-2">Search a database</summary><DatabaseSearch onSelect={onCompound}/></details>
    </section>
    <section><EngineParameterFields section="core" engine={catalogue} inputs={inputs} onChange={onChange} simType={sim.id}/>
      <div className="space-y-4">{fields.filter(f=>!uploadKeys.includes(f.key)).map(field=><SimulationWorkflowField key={field.key} field={field} value={inputs[field.key]} onChange={value=>onChange(field.key,value)}/>)}</div>
    </section>
    <button type="button" onClick={onAdvanced} className="w-full flex items-start gap-3 rounded-lg border border-research-border p-4 text-left hover:bg-research-soft"><SlidersHorizontal className="h-4 w-4 mt-1 shrink-0"/><span><span className="block text-sm font-medium">Advanced settings</span><span className="block text-xs text-research-muted mt-1">{summary}</span></span></button>
    <details><summary className="cursor-pointer text-sm text-research-muted py-2">Start from a preset</summary><SimulationPresets onSelectPreset={onPreset}/></details>
    <div className="hidden lg:block"><SimulationRunActions {...actions}/></div>
    <div className="h-20 lg:hidden" aria-hidden="true"/>
  </aside>;
}