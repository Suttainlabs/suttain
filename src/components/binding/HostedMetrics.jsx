import React from 'react';
import ReportedValues, { reportedValue } from '@/components/binding/ReportedValues';
import BindingInterpretation from '@/components/binding/BindingInterpretation';

const round = v => (typeof v === 'number' && Number.isFinite(v) ? Number(v.toPrecision(4)).toString() : reportedValue(v));

export default function HostedMetrics({ job }) {
  const result = job.result || {};
  const task = result.task || job.sim_type;
  return <div className="space-y-3">
    <p className="text-xs text-research-muted">Computed by {job.engine}{result.model ? ` (${result.model})` : ''}. Machine-learning predictions, not lab measurements.</p>
    {task === 'binding' && (result.metrics?.length ? <>
      <BindingInterpretation job={job} />
      <details className="rounded-lg border border-research-border"><summary className="cursor-pointer px-3 py-2.5 text-sm">All values reported by {job.engine}{result.provider_version ? ` (${result.provider_version})` : ''}</summary>
        <div className="overflow-x-auto border-t border-research-border px-3"><table className="w-full text-sm"><caption className="sr-only">Raw binding metrics reported by {job.engine}</caption><thead><tr className="border-b border-research-border text-left"><th scope="col" className="py-2 pr-4 font-medium">Field</th><th scope="col" className="py-2 font-medium text-right">Value</th></tr></thead><tbody>{result.metrics.map((metric, index) => <tr key={`${metric.key}-${index}`} className="border-b border-research-border last:border-0"><th scope="row" className="py-2 pr-4 font-mono text-xs font-normal break-all">{metric.key}</th><td className="py-2 font-mono text-right tabular-nums">{round(metric.value)}</td></tr>)}</tbody></table>
        <p className="py-2 text-xs text-research-muted">Exactly as returned by the engine, rounded to 4 significant figures. The full response is stored with this job.</p></div>
      </details>
    </> : <p className="text-sm text-research-muted">No binding metrics were reported by the engine.</p>)}
    {task === 'adme' && (result.adme?.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><caption className="sr-only">ADME results by molecule</caption><thead><tr className="border-b border-research-border text-left">{['SMILES', 'Status', 'Error', 'Properties'].map(label => <th key={label} scope="col" className="py-2 pr-4 font-medium">{label}</th>)}</tr></thead><tbody>{result.adme.map((item, index) => <tr key={index} className="border-b border-research-border align-top last:border-0"><th scope="row" className="min-w-28 max-w-40 py-3 pr-4 font-mono text-xs font-normal break-all">{reportedValue(item.smiles)}</th><td className="py-3 pr-4">{reportedValue(item.status)}</td><td className="py-3 pr-4">{item.error || '—'}</td><td className="min-w-40 py-3"><ReportedValues values={item.properties || {}} /></td></tr>)}</tbody></table></div> : <p className="text-sm text-research-muted">No per-molecule ADME results were reported by the engine.</p>)}
  </div>;
}