import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, Search, Sparkles } from 'lucide-react';
import DatabaseSearch from '@/components/computational/DatabaseSearch';
import SimulationPresets from '@/components/computational/SimulationPresets';
import SimulationEngineSelector from '@/components/research/SimulationEngineSelector';
import SimulationWorkflowField from '@/components/research/SimulationWorkflowField';
import EngineParameterFields from '@/components/simulation/EngineParameterFields';
import SimulationRunActions from '@/components/simulation/SimulationRunActions';
import PdbFetch from '@/components/simulation/PdbFetch';

function Step({ n, title, hint, children }) {
  return (
    <section className="space-y-3 border-t border-research-border pt-5 first:border-0 first:pt-0">
      <div className="flex items-baseline gap-2"><span className="font-mono text-xs text-research-accent">{n}</span><h3 className="!text-base">{title}</h3></div>
      {hint && <p className="-mt-1 text-xs text-research-muted">{hint}</p>}
      {children}
    </section>
  );
}

// Setup rail for one Atomistic Simulation workflow: engine → structure → method → run.
export default function SimulationConfigRail({ sim, engine, catalogue, inputs, onChange, onEngine, fields, onCompound, onPreset, onUpload, onDraw, uploadKeys, drawKeys, onAdvanced, summary, actions }) {
  const md = !!actions?.isMdEngine;
  // Classical MD needs PDB coordinates with residue topology, not a name or SMILES.
  const inputFields = fields.filter(f => uploadKeys.includes(f.key)).map(f => md && f.key === 'system'
    ? { ...f, label: 'Structure (PDB coordinates)', keepLabel: true, multiline: true, rows: 6, placeholder: 'Paste PDB text (ATOM/HETATM lines), upload a .pdb file, or fetch by PDB ID below', hint: 'Molecular dynamics needs atom coordinates with residue names. A name, SMILES or description is not enough.' }
    : f);
  const methodFields = fields.filter(f => !uploadKeys.includes(f.key));
  const [searchOpen, setSearchOpen] = useState(true);
  const [presetsOpen, setPresetsOpen] = useState(false);
  return (
    <aside className="min-w-0 rounded-xl border border-research-border bg-research-card p-5 self-start lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto space-y-5">
      <div><p className="research-label mb-1">Configuration</p><h2 className="!text-lg">Set up your workflow</h2></div>

      <Step n="01" title="Compute engine">
        <SimulationEngineSelector compact engines={sim.engines} selected={engine} onSelect={onEngine} simType={sim.id} />
      </Step>

      <Step n="02" title="Structure" hint={md ? 'Fetch a protein from RCSB PDB, upload a .pdb file, or paste coordinates.' : 'Type a name or SMILES, upload a file, draw it, or find it in a database.'}>
        {md && <SimulationWorkflowField field={{ key: 'pdb_content', label: 'Structure (PDB coordinates)', keepLabel: true, multiline: true, rows: 6, placeholder: 'Paste PDB text with ATOM/HETATM records, or fetch by PDB ID below', hint: 'Molecular dynamics needs atom coordinates with residue names. A name, SMILES or description is not enough.' }}
          value={inputs.pdb_content} onChange={value => onChange('pdb_content', value)} canUpload onUpload={() => onUpload('pdb_content')} />}
        {inputFields.map(field => (
          <SimulationWorkflowField key={field.key} field={field} value={inputs[field.key]} onChange={value => onChange(field.key, value)}
            canUpload canDraw={drawKeys.includes(field.key)} onUpload={() => onUpload(field.key)} onDraw={() => onDraw(field.key)} />
        ))}
        {md ? (
          <div className="rounded-lg border border-research-border p-3 space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium"><Search className="h-4 w-4 text-research-accent" />Fetch from RCSB PDB</p>
            <PdbFetch onLoad={pdb => onChange('pdb_content', pdb)} />
          </div>
        ) : (
        <div className="rounded-lg border border-research-border">
          <button type="button" onClick={() => setSearchOpen(o => !o)} aria-expanded={searchOpen}
            className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left text-sm font-medium">
            <span className="flex items-center gap-2"><Search className="h-4 w-4 text-research-accent" />Find in a database</span>
            <ChevronDown className={`h-4 w-4 text-research-muted transition-transform ${searchOpen ? 'rotate-180' : ''}`} />
          </button>
          {searchOpen && <div className="border-t border-research-border p-3"><DatabaseSearch compact onSelect={onCompound} /></div>}
        </div>
        )}
      </Step>

      <Step n="03" title="Method and conditions">
        <EngineParameterFields section="core" engine={catalogue} inputs={inputs} onChange={onChange} simType={sim.id} hidePdb={md} />
        {methodFields.length > 0 && <div className="space-y-4">{methodFields.map(field => <SimulationWorkflowField key={field.key} field={field} value={inputs[field.key]} onChange={value => onChange(field.key, value)} />)}</div>}
        <button type="button" onClick={onAdvanced} className="w-full flex items-start gap-3 rounded-lg border border-research-border p-3 text-left hover:bg-research-soft">
          <SlidersHorizontal className="h-4 w-4 mt-0.5 shrink-0 text-research-accent" />
          <span className="min-w-0"><span className="block text-sm font-medium">Advanced settings</span><span className="block text-xs text-research-muted mt-0.5 break-words">{summary}</span></span>
        </button>
        <div className="rounded-lg border border-research-border">
          <button type="button" onClick={() => setPresetsOpen(o => !o)} aria-expanded={presetsOpen} className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left text-sm">
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-research-accent" />Start from a preset</span>
            <ChevronDown className={`h-4 w-4 text-research-muted transition-transform ${presetsOpen ? 'rotate-180' : ''}`} />
          </button>
          {presetsOpen && <div className="border-t border-research-border p-3"><SimulationPresets onSelectPreset={onPreset} /></div>}
        </div>
      </Step>

      <div className="hidden lg:block border-t border-research-border pt-5"><SimulationRunActions {...actions} /></div>
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </aside>
  );
}
