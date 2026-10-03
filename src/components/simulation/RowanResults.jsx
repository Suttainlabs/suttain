import React, {useEffect,useState} from 'react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import useRowanDataset from '@/components/simulation/useRowanDataset';
import RowanMoleculeViewer from '@/components/simulation/RowanMoleculeViewer';
import RowanFrameControls from '@/components/simulation/RowanFrameControls';
import RowanOptimize from '@/components/simulation/RowanOptimize';
import RowanOverview from '@/components/simulation/RowanOverview';
import RowanCharge from '@/components/simulation/RowanCharge';
import RowanDipole from '@/components/simulation/RowanDipole';
import RowanNotes from '@/components/simulation/RowanNotes';
import RowanJson from '@/components/simulation/RowanJson';
import RowanExports from '@/components/simulation/RowanExports';
import RowanCitations from '@/components/simulation/RowanCitations';
import {xyzFile} from '@/components/simulation/rowanExports';
export default function RowanResults({result,onReset,onRun,isRunning}) {
  const {dataset,loading,error,reload}=useRowanDataset(result);
  const [tab,setTab]=useState('optimize'),[frame,setFrame]=useState(0),[selectedAtom,setSelectedAtom]=useState(null),[chargeKind,setChargeKind]=useState('charge'),[notes,setNotes]=useState(result.notes || '');
  const frames=dataset?.frames || (result.optimization_energies || []).map(energy => ({energy}));
  useEffect(() => {setFrame(Math.max(0,(dataset?.frames?.length || 1)-1));setSelectedAtom(null);},[dataset]);
  useEffect(() => {setNotes(result.notes || '');setTab('optimize');},[result.provider_job_id]);
  const m=dataset?.final_molecule,updated={...result,notes},payload={...dataset,result:updated};
  const values=tab==='charge' ? (chargeKind==='charge' ? m?.mulliken_charges ?? result.charges : m?.mulliken_spin_densities ?? result.spin_densities) : null;
  const xyz=tab==='optimize' ? frames[frame]?.xyz || xyzFile(m) || result.final_xyz : xyzFile(m) || result.final_xyz;
  return <section className="mb-8 space-y-5 text-research-text">
    <div className="rounded-xl border border-research-border bg-research-card p-5 space-y-4"><div><p className="research-label mb-2">Real Rowan compute run</p><h2 className="!text-lg">Calculation completed</h2><p className="text-sm text-research-muted mt-2">{result.computational_approach}</p></div><RowanExports dataset={dataset} result={updated}/>{loading && <p role="status" className="text-sm">Loading private calculation results…</p>}{error && <div role="alert" className="text-sm text-destructive">{error} <button className="underline" onClick={reload}>Retry</button></div>}</div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 rounded-xl border border-research-border bg-research-card p-4 sm:p-5"><div className="min-w-0 space-y-4"><RowanMoleculeViewer xyz={xyz} values={values} selectedAtom={selectedAtom} onSelect={setSelectedAtom}/>{tab==='optimize' && <RowanFrameControls frames={frames} frame={frame} onFrame={setFrame}/>}<p className="research-label">Computed Rowan geometry · {result.provider_job_id}</p></div>
      <Tabs value={tab} onValueChange={setTab} className="min-w-0"><TabsList className="h-auto flex flex-wrap justify-start rounded-none bg-transparent p-0 border-b border-research-border">{['optimize','overview','charge','dipole','notes','json'].map(id => <TabsTrigger key={id} value={id} className="rounded-none px-3 py-3 border-b-2 border-transparent data-[state=active]:border-research-accent data-[state=active]:bg-research-soft data-[state=active]:text-research-accent data-[state=active]:shadow-none">{id==='json' ? 'JSON' : id.charAt(0).toUpperCase()+id.slice(1)}</TabsTrigger>)}</TabsList>
        <TabsContent value="optimize" className="pt-3"><RowanOptimize frames={frames} frame={frame} onFrame={setFrame}/></TabsContent>
        <TabsContent value="overview" className="pt-3"><RowanOverview result={updated} dataset={dataset}/></TabsContent>
        <TabsContent value="charge" className="pt-3"><RowanCharge result={updated} dataset={dataset} selectedAtom={selectedAtom} onSelect={setSelectedAtom} chargeKind={chargeKind} onKind={setChargeKind}/></TabsContent>
        <TabsContent value="dipole" className="pt-3"><RowanDipole dipole={m?.dipole ?? result.dipole}/></TabsContent>
        <TabsContent value="notes" className="pt-3"><RowanNotes result={updated} onSaved={setNotes}/></TabsContent>
        <TabsContent value="json" className="pt-3"><RowanJson payload={payload}/></TabsContent>
      </Tabs></div>
    <RowanCitations citations={dataset?.citations || result.citations}/>
    <div className="rounded-xl bg-research-soft border border-research-border p-5"><h3 className="mb-2">Interpretation limits</h3><p className="text-sm text-research-muted">{result.limitations}</p><p className="text-sm text-research-muted mt-2">{result.scientific_interpretation}</p></div>
    <div className="flex flex-wrap gap-3"><button className="research-secondary" onClick={onReset}>New simulation</button><button className="research-primary disabled:opacity-50" disabled={isRunning} onClick={onRun}>Run again</button></div>
  </section>;
}