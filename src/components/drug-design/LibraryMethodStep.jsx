import { LIBRARIES, METHODS } from '@/components/drug-design/discoveryData';
export default function LibraryMethodStep({ state: s }) {
  return <section>
    <p className="text-sm mb-4">Target: <span className="font-medium">{s.selectedTarget?.name || 'No target selected'}</span> <button onClick={() => s.setStep(0)} className="text-primary underline ml-2">{s.selectedTarget ? 'Change' : 'Select a target'}</button></p>
    <div className="grid sm:grid-cols-2 gap-4">
      <div><label htmlFor="drug-library" className="block text-sm mb-1">Compound library</label><select id="drug-library" value={s.library} onChange={e => s.setLibrary(e.target.value)} className="simulation-control">{Object.entries(LIBRARIES).map(([value, label]) => <option key={value} value={value} disabled={value !== 'chembl_bioactive'}>{label}{value !== 'chembl_bioactive' ? ' — unavailable' : ''}</option>)}</select></div>
      <div><label htmlFor="drug-method" className="block text-sm mb-1">Screening method</label><select id="drug-method" value={s.method} onChange={e => s.setMethod(e.target.value)} className="simulation-control">{Object.entries(METHODS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div><label htmlFor="drug-max" className="block text-sm mb-1">Max candidates</label><input id="drug-max" type="number" min="1" max="250" step="1" value={s.maxCandidates} onChange={e => s.setMaxCandidates(e.target.value)} className="simulation-control" /></div>
      <div><label htmlFor="drug-admet" className="block text-sm mb-1">Estimated property filter</label><select id="drug-admet" value={s.admetFilter} onChange={e => s.setAdmetFilter(e.target.value)} className="simulation-control"><option value="standard">Exclude high rule risk</option><option value="strict">No rule violations</option><option value="none">Keep all compounds</option></select></div>
    </div>
    <p className="text-xs text-muted-foreground mt-4">Screens up to 250 clinical-stage ChEMBL small molecules, ordered by ChEMBL ID. Similarity uses known IC50 actives; property-only screening does not calculate similarity. LogP/TPSA and Lipinski/Veber rules use reduced-fragment estimates—not validated ADMET or toxicity predictions. Unsupported structures are skipped.</p>
    {!s.validCount && <p role="alert" className="text-sm text-destructive mt-3">Enter a whole number from 1 to 250.</p>}
    <div className="flex flex-wrap justify-between gap-3 mt-6"><button onClick={() => s.setStep(0)} className="research-secondary">← Back</button><button onClick={() => s.setStep(2)} disabled={!s.ready} className="research-primary bg-primary text-primary-foreground disabled:opacity-40">Continue to review →</button></div>
  </section>;
}