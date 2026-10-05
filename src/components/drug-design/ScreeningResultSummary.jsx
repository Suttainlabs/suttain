import { METHODS } from '@/components/drug-design/discoveryData';
import ScreeningSourceStatus from '@/components/drug-design/ScreeningSourceStatus';
export default function ScreeningResultSummary({ job }) {
  const r = job.result;
  return <div className="rounded-lg border border-border bg-muted/40 p-4 mb-5 space-y-2 text-sm">
    <p className="font-medium">{r.target?.name || job.target_label} · {job.target_ref}{r.target?.organism ? ` · ${r.target.organism}` : ''}</p>
    <p className="text-muted-foreground">{METHODS[r.method] || 'Estimated property screening'} · {r.reference_count} reference ligands · {r.source || 'ChEMBL'} · {new Date(job.end_timestamp).toLocaleString()}</p>
    <p className="text-xs text-muted-foreground">{r.fetched_count} fetched · {job.compounds_screened} processed · {r.filtered_count} excluded by property filter · {r.skipped_count} unsupported · {r.candidates.length} retained</p>
    <p className="text-xs text-muted-foreground">{r.activity_records_reviewed ?? r.fetched_count} assay records reviewed · {r.duplicate_count || 0} duplicates merged · {r.quality_excluded_count || 0} quality exclusions · {r.missing_potency_count || 0} excluded for missing exact selected-endpoint potency</p>
    <ScreeningSourceStatus statuses={r.source_status} />
    <details className="text-xs text-muted-foreground"><summary className="cursor-pointer text-primary">Method, provenance & limitations</summary><div className="mt-3 space-y-2"><p>{r.library_scope}</p><p>{r.target?.match_basis}</p><p>{r.ranking_explanation}</p><p>{r.reference_criteria}</p><p>{r.descriptor_method}</p><p>{r.fingerprint_method}</p><p>{r.limitations}</p><p className="font-mono break-all">Local execution receipt: {job.provider_job_id}</p>{r.skipped?.length > 0 && <ul>{r.skipped.map(c => <li key={c.id}>{c.id}: {c.reason}</li>)}</ul>}<a href={r.source_url} target="_blank" rel="noreferrer" className="underline text-primary">{r.source || 'ChEMBL'} data source</a></div></details>
  </div>;
}