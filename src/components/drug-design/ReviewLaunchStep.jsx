import { LIBRARIES, METHODS } from '@/components/drug-design/discoveryData';
export default function ReviewLaunchStep({ state: s }) {
  const rows = [['Target', s.selectedTarget?.name || 'No target selected'], ['Target identifier', s.selectedTarget?.chembl_id || s.selectedTarget?.uniprot_id || 'Choose a ChEMBL or UniProt target'], ['Library', LIBRARIES[s.library]], ['Method', METHODS[s.method]], ['Max candidates', s.maxCandidates], ['Estimated property filter', s.admetFilter], ['Execution', 'Synchronous JS screening · up to 250 compounds']];
  return <section>
    <h2 className="mb-4">Review Drug Design screening</h2>
    <dl className="border border-border rounded-lg divide-y divide-border">{rows.map(([label, value]) => <div key={label} className="grid sm:grid-cols-2 gap-1 sm:gap-4 p-4 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className="font-medium break-words sm:text-right">{value}</dd></div>)}</dl>
    <p className="text-xs text-muted-foreground mt-4">Fetches live ChEMBL structures, computes path-based similarity and estimated molecular properties, then saves the completed run. This is not docking, ML re-ranking or validated ADMET. ChEMBL must be reachable; no results are invented when a source fails. Please keep this page open while screening.</p>
    {s.actionError && <p role="alert" className="text-sm text-destructive mt-3">{s.actionError}</p>}
    {s.metrics.isError && <p role="alert" className="text-sm text-destructive mt-3">Could not load screening availability. <button onClick={() => s.metrics.refetch()} className="underline">Retry</button></p>}
    {!s.ready && <p className="text-sm text-destructive mt-3">Choose a target and valid library settings before launching.</p>}
    <div className="flex flex-wrap justify-between gap-3 mt-6"><button onClick={() => s.setStep(1)} className="research-secondary">← Back to edit</button><button onClick={s.launchJob} disabled={!s.ready || s.submitting || !s.metrics.data?.computeAvailable} className="research-primary bg-primary text-primary-foreground disabled:opacity-40">{s.submitting ? 'Fetching & screening…' : s.metrics.data?.computeAvailable ? 'Launch screening job →' : s.metrics.isPending ? 'Loading screening status…' : 'Screening status unavailable'}</button></div>
  </section>;
}