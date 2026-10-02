import React from 'react';
import { CheckCircle2 } from 'lucide-react';
export default function DatabaseSearchResult({ compound, onSelect }) {
  return <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-research-border bg-research-soft p-4">
    <div className="min-w-0 flex-1"><p className="font-medium">{compound.name}</p><p className="research-label">{compound.source_db || 'Built-in library'}{compound.molecular_formula && ` · ${compound.molecular_formula}`}{compound.molecular_weight && ` · MW: ${compound.molecular_weight}`}</p>
      {compound.smiles && <p className="research-label mt-2 break-all">SMILES: {compound.smiles}</p>}</div>
    <button type="button" className="research-secondary" onClick={() => onSelect({ ...compound, formula: compound.molecular_formula })}><CheckCircle2 className="h-4 w-4" />Use this molecule</button>
  </div>;
}