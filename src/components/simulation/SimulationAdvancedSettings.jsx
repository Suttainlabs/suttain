import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import EngineParameterFields from '@/components/simulation/EngineParameterFields';
import EnvironmentalParametersPanel from '@/components/simulation/EnvironmentalParametersPanel';
export default function SimulationAdvancedSettings({open,onOpenChange,sim,engine,catalogue,inputs,onChange,environment,onEnvironment,autoFallback,onFallback,customForcefield,onForcefield,onRemoveForcefield,isMdEngine}) {
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="simulation-workspace research-surface w-full sm:max-w-xl overflow-y-auto p-6">
    <SheetHeader className="text-left mb-8 pr-8"><SheetTitle>Advanced settings</SheetTitle><SheetDescription>Adjust the details for this workflow. Your selections stay with the configuration.</SheetDescription></SheetHeader>
    <div className="space-y-8">
      <EngineParameterFields section="advanced" engine={catalogue} inputs={inputs} onChange={onChange} simType={sim.id}/>
      {['dft','quantum_mechanics'].includes(sim.id) && <section className="space-y-4"><h3>Molecular state</h3><div><label htmlFor="rowan-charge">Molecular charge (XYZ / SMILES override)</label><input id="rowan-charge" type="number" min="-10" max="10" step="1" placeholder="Use reference charge" value={inputs.charge ?? ''} onChange={e=>onChange('charge',e.target.value===''?undefined:Number(e.target.value))} className="simulation-control"/></div><div><label htmlFor="rowan-spin">Spin multiplicity</label><input id="rowan-spin" type="number" min="1" max="7" step="1" value={inputs.multiplicity ?? 1} onChange={e=>onChange('multiplicity',Number(e.target.value))} className="simulation-control"/></div><p className="text-sm text-research-muted">Compound names and SMILES use a PubChem 3D reference conformer. Supply XYZ coordinates for unindexed molecules.</p></section>}
      <EnvironmentalParametersPanel params={environment} onChange={onEnvironment} simType={sim.id} engine={engine}/>
      {['dft','quantum_mechanics'].includes(sim.id) && <p className="text-sm text-research-muted">Rowan applies implicit solvent only. Temperature, pressure, pH, ionic strength and classical forcefields are saved context, not quantum calculation controls.</p>}
      {sim.id==='molecular_dynamics' && !isMdEngine && <section className="space-y-3"><h3>Custom forcefield</h3><p className="text-sm text-research-muted">{customForcefield?`Using ${customForcefield.name} (${customForcefield.base_forcefield})`:'Optional saved LJ, bond, angle and dihedral overrides.'}</p><Button variant="outline" onClick={onForcefield}>{customForcefield?'Change / edit':'Load custom forcefield'}</Button>{customForcefield && <Button variant="ghost" onClick={onRemoveForcefield}>Remove</Button>}</section>}
      {engine==='Rowan' && <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={autoFallback} onChange={e=>onFallback(e.target.checked)}/><span>Automatically prepare compatible local inputs if Rowan credits run out</span></label>}
      <div><label htmlFor="simulation-notes">Additional notes (optional)</label><input id="simulation-notes" className="simulation-control" value={inputs.notes ?? ''} onChange={e=>onChange('notes',e.target.value)} placeholder="Special requirements or context"/></div>
    </div>
    <SheetClose asChild><Button className="research-primary w-full mt-8">Done</Button></SheetClose>
  </SheetContent></Sheet>;
}