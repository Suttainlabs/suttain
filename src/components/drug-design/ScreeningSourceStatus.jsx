export default function ScreeningSourceStatus({ statuses = [] }) {
  if (!statuses.length) return null;
  return <ul className="text-xs space-y-2" aria-label="Compound source availability">{statuses.map(s => <li key={s.source} className="rounded border border-border px-3 py-2"><span className="font-medium">{s.source}: {s.status}</span><span className="text-muted-foreground"> · {s.reason}{s.records_reviewed !== undefined ? ` · ${s.records_reviewed} records reviewed` : ''}</span></li>)}</ul>;
}