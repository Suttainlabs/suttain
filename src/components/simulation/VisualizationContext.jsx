import React from 'react';
export default function VisualizationContext({ target, input }) {
  if (!target && !input) return null;
  return <div className="border-b border-research-border bg-research-soft px-4 py-3 text-research-text">
    {target && <p className="text-sm"><span className="font-medium">Representative structure: </span>{target.name || target.pdb_id || target.smiles || 'No specific molecule identified'}{target.reason ? ` — ${target.reason}` : ''}</p>}
    {input && <p className="text-xs text-research-muted break-words">Your system: {String(input).slice(0, 400)}</p>}
    <p className="text-xs text-research-muted">Reference or input geometry only. This view is not a computed catalytic cycle, optimized structure, or trajectory.</p>
  </div>;
}