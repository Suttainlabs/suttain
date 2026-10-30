import React from 'react';
import ReportedValues, { reportedValue } from '@/components/binding/ReportedValues';

export default function HostedMetrics({ job }) {
  const result = job.result || {};
  const task = result.task || job.sim_type;
  return <div className="space-y-3">
    <p className="text-xs text-research-muted">Reported by {job.engine}; not an AI estimate.</p>
    {task === 'binding' && (result.metrics?.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><caption className="sr-only">Binding metrics reported by {job.engine}</caption><thead><tr className="border-b border-research-border text-left"><th scope="col" className="py-2 pr-4 font-medium">Metric</th><th scope="col" className="py-2 font-medium">Value</th></tr></thead><tbody>{result.metrics.map((metric, index) => <tr key={`${metric.key}-${index}`} className="border-b border-research-border last:border-0"><th scope="row" className="py-2 pr-4 font-normal break-words">{metric.key}</th><td className="py-2 font-mono break-all">{reportedValue(metric.value)}</td></tr>)}</tbody></table></div> : <p className="text-sm text-research-muted">No binding metrics were reported by the engine.</p>)}
    {task === 'adme' && (result.adme?.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><caption className="sr-only">ADME results by molecule</caption><thead><tr className="border-b border-research-border text-left">{['SMILES', 'Status', 'Error', 'Properties'].map(label => <th key={label} scope="col" className="py-2 pr-4 font-medium">{label}</th>)}</tr></thead><tbody>{result.adme.map((item, index) => <tr key={index} className="border-b border-research-border align-top last:border-0"><th scope="row" className="min-w-28 max-w-40 py-3 pr-4 font-mono text-xs font-normal break-all">{reportedValue(item.smiles)}</th><td className="py-3 pr-4">{reportedValue(item.status)}</td><td className="py-3 pr-4">{item.error || '—'}</td><td className="min-w-40 py-3"><ReportedValues values={item.properties || {}} /></td></tr>)}</tbody></table></div> : <p className="text-sm text-research-muted">No per-molecule ADME results were reported by the engine.</p>)}
  </div>;
}