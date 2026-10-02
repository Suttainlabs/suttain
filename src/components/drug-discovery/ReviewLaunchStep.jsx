import { LIBRARIES, METHODS } from '@/components/drug-discovery/discoveryData';
export default function ReviewLaunchStep({ state: s }) {
  const estimate = Number(s.maxCandidates) * (s.method === 'docking_ml_rerank' ? 19 : s.method === 'docking_only' ? 14 : 2);
  const rows = [['Target', s.selectedTarget?.name || 'No target selected'], ['Library', s.library === 'user_upload' ? s.libraryFile?.name || 'No library file selected' : LIBRARIES[s.library]], ['Method', METHODS[s.method]], ['Max candidates', s.maxCandidates], ['ADMET filter', s.admetFilter], ['Illustrative compute estimate', s.validCount ? `~${estimate.toLocaleString()} HPC job-minutes` : 'Invalid candidate limit']];
  return <section>
    <h2 className="mb-4">Review & launch</h2>
    <dl className="border border-border rounded-lg divide-y divide-border">{rows.map(([label, value]) => <div key={label} className="grid sm:grid-cols-2 gap-1 sm:gap-4 p-4 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className="font-medium break-words sm:text-right">{value}</dd></div>)}</dl>
    <p className="text-xs text-muted-foreground mt-4">This is an illustrative estimate, not a measured cost or runtime. A real screening provider is not yet connected; submission is unavailable and no job will be counted.</p>
    {s.actionError && <p role="alert" className="text-sm text-destructive mt-3">{s.actionError}</p>}
    {!s.ready && <p className="text-sm text-destructive mt-3">Choose a target and valid library settings before launching.</p>}
    <div className="flex flex-wrap justify-between gap-3 mt-6"><button onClick={() => s.setStep(1)} className="research-secondary">← Back to edit</button><button onClick={s.launchJob} disabled={!s.ready || s.submitting || !s.metrics.data?.computeAvailable} className="research-primary bg-primary text-primary-foreground disabled:opacity-40">{s.submitting ? 'Submitting…' : s.metrics.data?.computeAvailable ? 'Launch screening job →' : 'Compute connection required'}</button></div>
  </section>;
}