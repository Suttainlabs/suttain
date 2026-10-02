import { useState } from 'react';
import { LIBRARIES, METHODS } from '@/components/drug-discovery/discoveryData';
export default function LibraryMethodStep({ state: s }) {
  const [fileError, setFileError] = useState('');
  async function readLibrary(event) {
    const file = event.target.files?.[0]; s.setLibraryFile(null); setFileError(''); if (!file) return;
    if (!/\.(sdf|csv)$/i.test(file.name) || file.size > 5 * 1024 * 1024) { setFileError('Choose a CSV or SDF file smaller than 5 MB.'); event.target.value = ''; return; }
    try { const text = await file.text(); if (!text.trim()) throw new Error('The file is empty.'); s.setLibraryFile({ name: file.name, size: file.size }); } catch (error) { setFileError(error.message || 'Could not read this file.'); }
  }
  return <section>
    <p className="text-sm mb-4">Target: <span className="font-medium">{s.selectedTarget?.name || 'No target selected'}</span> <button onClick={() => s.setStep(0)} className="text-primary underline ml-2">{s.selectedTarget ? 'Change' : 'Select a target'}</button></p>
    <div className="grid sm:grid-cols-2 gap-4">
      <div><label htmlFor="drug-library" className="block text-sm mb-1">Compound library</label><select id="drug-library" value={s.library} onChange={e => s.setLibrary(e.target.value)} className="simulation-control">{Object.entries(LIBRARIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div><label htmlFor="drug-method" className="block text-sm mb-1">Screening method</label><select id="drug-method" value={s.method} onChange={e => s.setMethod(e.target.value)} className="simulation-control">{Object.entries(METHODS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div><label htmlFor="drug-max" className="block text-sm mb-1">Max candidates</label><input id="drug-max" type="number" min="1" max="10000" step="1" value={s.maxCandidates} onChange={e => s.setMaxCandidates(e.target.value)} className="simulation-control" /></div>
      <div><label htmlFor="drug-admet" className="block text-sm mb-1">ADMET / toxicity filter</label><select id="drug-admet" value={s.admetFilter} onChange={e => s.setAdmetFilter(e.target.value)} className="simulation-control"><option value="standard">Standard</option><option value="strict">Strict</option><option value="none">None</option></select></div>
    </div>
    {s.library === 'user_upload' && <div className="mt-4"><label htmlFor="drug-library-file" className="block text-sm mb-1">Choose a local library file (CSV or SDF, up to 5 MB)</label><input id="drug-library-file" type="file" accept=".csv,.sdf" onChange={readLibrary} className="block w-full text-sm" aria-describedby="drug-file-help" /><p id="drug-file-help" className="text-xs text-muted-foreground mt-2">Read locally only; never uploaded or stored. Your file is not used to calculate the fixed demonstration candidates.</p>{s.libraryFile && <p className="text-sm mt-2">Selected: {s.libraryFile.name}</p>}{fileError && <p role="alert" className="text-sm text-destructive mt-2">{fileError}</p>}</div>}
    <p className="text-xs text-muted-foreground mt-4">These settings illustrate a real pipeline; they do not change the example scores or perform docking, ML, or ADMET calculations.</p>
    {!s.validCount && <p role="alert" className="text-sm text-destructive mt-3">Enter a whole number from 1 to 10,000.</p>}
    <div className="flex flex-wrap justify-between gap-3 mt-6"><button onClick={() => s.setStep(0)} className="research-secondary">← Back</button><button onClick={() => s.setStep(2)} disabled={!s.ready} className="research-primary bg-primary text-primary-foreground disabled:opacity-40">Continue to review →</button></div>
  </section>;
}