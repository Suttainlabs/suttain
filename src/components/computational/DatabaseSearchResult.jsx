import React from 'react';
import { ArrowDownToLine } from 'lucide-react';

export default function DatabaseSearchResult({ compound, onSelect, best = false }) {
  const mw = compound.molecular_weight ? Number(compound.molecular_weight).toFixed(2) : null;
  return (
    <div className={`rounded-lg border p-3 ${best ? 'border-research-accent bg-research-soft' : 'border-research-border bg-research-card'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm break-words">{compound.name}{best && <span className="ml-2 align-middle rounded border border-research-accent px-1.5 py-0.5 text-[11px] font-medium text-research-accent">Best match</span>}</p>
          <p className="mt-0.5 text-xs text-research-muted">
            {[compound.source_db || 'Suttain library', compound.molecular_formula, mw && `${mw} g/mol`, compound.cas_number && `CAS ${compound.cas_number}`].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
      {compound.smiles && <p className="mt-2 font-mono text-[11px] text-research-muted break-all line-clamp-2" title={compound.smiles}>{compound.smiles}</p>}
      <button type="button" onClick={() => onSelect({ ...compound, formula: compound.molecular_formula })}
        className={`${best ? 'research-primary' : 'research-secondary'} mt-3 w-full !min-h-10 justify-center text-sm`}>
        <ArrowDownToLine className="h-4 w-4" />Use this molecule
      </button>
    </div>
  );
}
