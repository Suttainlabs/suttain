import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
export default function RowanProperties({result}) {
  const rows = [['Energy',result.energy,'Hartree'],['Dipole vector',result.dipole,'Debye'],['Partial charges (atom order)',result.charges,'e'],['Vibrational frequencies',result.frequencies,'cm⁻¹']];
  const energies = (result.optimization_energies || []).map((energy,step) => ({step:step+1,energy})).filter(row => Number.isFinite(row.energy));
  return <div className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6 space-y-5">
    <h2 className="!text-lg">Computed properties</h2><p className="text-sm text-research-muted">Only values returned by Rowan are shown. Missing properties were not reported.</p>
    <dl className="space-y-4">{rows.map(([label,value,unit]) => <div key={label} className="border-t border-research-border pt-3"><dt className="text-sm font-medium">{label} <span className="text-research-muted">({unit})</span></dt><dd className="mt-1 text-sm font-mono break-words max-h-44 overflow-auto">{value == null ? 'Not reported' : Array.isArray(value) ? value.join(', ') : String(value)}</dd></div>)}</dl>
    {energies.length > 1 && <section><h3 className="mb-3">Optimization energy (Hartree)</h3><div className="h-64"><ResponsiveContainer><LineChart data={energies}><XAxis dataKey="step"/><YAxis domain={['auto','auto']} width={100}/><Tooltip/><Line type="linear" dataKey="energy" stroke="hsl(var(--research-accent))" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div><p className="text-xs text-research-muted">Geometry optimization steps, not molecular-dynamics time steps.</p></section>}
  </div>;
}