import React, {useEffect,useState} from 'react';
import GuidedResultNavigation from '@/components/simulation/GuidedResultNavigation';
import GuidedResultStyles from '@/components/simulation/GuidedResultStyles';
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
  const [tab,setTab]=useState('overview'),[frame,setFrame]=useState(0),[selectedAtom,setSelectedAtom]=useState(null),[chargeKind,setChargeKind]=useState('charge'),[notes,setNotes]=useState(result.notes || '');
  const frames=dataset?.frames || (result.optimization_energies || []).map(energy => ({energy}));
  useEffect(() => {setFrame(Math.max(0,(dataset?.frames?.length || 1)-1));setSelectedAtom(null);},[dataset]);
  useEffect(() => {setNotes(result.notes || '');setTab('overview');},[result.provider_job_id]);
  const m=dataset?.final_molecule,updated={...result,notes},payload={...dataset,result:updated};
  const values=tab==='charge' ? (chargeKind==='charge' ? m?.mulliken_charges ?? result.charges : m?.mulliken_spin_densities ?? result.spin_densities) : null;
  const xyz=tab==='optimize' || tab==='overview' ? frames[frame]?.xyz || xyzFile(m) || result.final_xyz : xyzFile(m) || result.final_xyz;
  return <section className="mb-8 guided-result">
    <GuidedResultStyles/>
    <div className="guided-result-layout"><GuidedResultNavigation tab={tab} onChange={setTab}/><div className="guided-result-body">
      {loading && <p role="status" className="text-sm mb-4">Loading private calculation results…</p>}
      {error && <div role="alert" className="text-sm text-destructive mb-4">{error} <button className="underline" onClick={reload}>Retry</button></div>}
      <div hidden={tab!=='overview'}><h2>The molecule</h2><p className="guided-result-intro">Explore the computed geometry and its optimization frames.</p></div>
      <div hidden={tab!=='charge'}><h2>Where charge sits</h2><p className="guided-result-intro">Inspect the returned atomic charges and select an atom to highlight it.</p></div>
      <div hidden={tab!=='overview' && tab!=='charge'} className="space-y-4"><RowanMoleculeViewer xyz={xyz} values={values} selectedAtom={selectedAtom} onSelect={setSelectedAtom} name={`rowan-${result.provider_job_id || 'molecule'}-frame-${frame+1}`}/><div hidden={tab!=='overview'}><RowanFrameControls frames={frames} frame={frame} onFrame={setFrame}/></div><p className="research-label break-all">Computed Rowan geometry · {result.provider_job_id}</p></div>
      <div hidden={tab!=='overview'}><details className="guided-result-details"><summary>Calculation overview</summary><div><p className="text-sm text-research-muted mb-4">{result.computational_approach}</p><RowanOverview result={updated} dataset={dataset}/></div></details></div>
      <div hidden={tab!=='optimize'}><div className="guided-energy"><RowanOptimize frames={frames} frame={frame} onFrame={setFrame}/></div><dl className="guided-result-metrics">{[['Energy (Hartree)',m?.energy ?? result.energy],['HOMO–LUMO gap (eV)',m?.homo_lumo_gap],['SCF converged',m?.scf_completed == null ? null : String(m.scf_completed)]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd className="font-mono">{value ?? 'Not reported'}</dd></div>)}</dl></div>
      <div hidden={tab!=='charge'} className="mt-6 guided-charge"><RowanCharge result={updated} dataset={dataset} selectedAtom={selectedAtom} onSelect={setSelectedAtom} chargeKind={chargeKind} onKind={setChargeKind}/></div>
      <div hidden={tab!=='dipole'}><h2>Polarity</h2><p className="guided-result-intro">The dipole vector describes how charge is distributed across this geometry.</p><RowanDipole dipole={m?.dipole ?? result.dipole}/></div>
      <div hidden={tab!=='notes'}><h2>Save &amp; cite</h2><p className="guided-result-intro">Download your results, keep research notes, and reference the calculation.</p><div className="guided-result-save"><RowanExports dataset={dataset} result={updated}/><RowanNotes result={updated} onSaved={setNotes}/><RowanCitations citations={dataset?.citations || result.citations}/><div><h3 className="mb-2">Interpretation limits</h3><p className="text-sm text-research-muted">{result.limitations}</p><p className="text-sm text-research-muted mt-2">{result.scientific_interpretation}</p></div><details className="guided-result-details"><summary>Complete stored payload (JSON)</summary><div><RowanJson payload={payload}/></div></details><div className="flex flex-wrap gap-3"><button className="research-secondary" onClick={onReset}>New simulation</button><button className="research-primary disabled:opacity-50" disabled={isRunning} onClick={onRun}>Run again</button></div></div></div>
      <GuidedResultNavigation tab={tab} onChange={setTab} footer/>
    </div></div>
  </section>;
}