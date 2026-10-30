import React from 'react';

export const reportedValue = value => value == null ? 'Not reported' : typeof value === 'object' ? JSON.stringify(value) : String(value);

export default function ReportedValues({ values = {} }) {
  const entries = Object.entries(values);
  if (!entries.length) return <p className="text-sm text-research-muted">No properties reported.</p>;
  return <dl className="space-y-2">{entries.map(([key, value]) => <div key={key} className="min-w-0"><dt className="text-xs text-research-muted break-words">{key}</dt><dd className="font-mono text-xs whitespace-pre-wrap break-all">{reportedValue(value)}</dd></div>)}</dl>;
}