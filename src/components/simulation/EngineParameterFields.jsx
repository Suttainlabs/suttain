import React from 'react';
import BasisSetSelect from '@/components/simulation/BasisSetSelect';
import MdParameterFields from '@/components/simulation/MdParameterFields';
import RowanParameterFields from '@/components/simulation/RowanParameterFields';
import MaceParameterFields from '@/components/simulation/MaceParameterFields';
export default function EngineParameterFields({engine,inputs,onChange,simType,section='all'}) {
  if(!engine) return null;
  if(engine.id==='mace') return <MaceParameterFields engine={engine} inputs={inputs} onChange={onChange} simType={simType} section={section}/>;
  if(engine.id==='rowan') return section==='advanced'?null:<RowanParameterFields engine={engine} inputs={inputs} onChange={onChange} simType={simType}/>;
  const update=(key,value)=>onChange(key,value);
  if(engine.md) return <MdParameterFields engine={engine} inputs={inputs} onChange={onChange} simType={simType} section={section}/>;
  if(engine.id==='pubchem') return section==='advanced'?null: <section className="mb-7 grid gap-4 sm:grid-cols-2"><div><label htmlFor="lookup-query">Compound query</label><input id="lookup-query" className="simulation-control" value={inputs.query || ''} onChange={e=>update('query',e.target.value)} placeholder="aspirin, CID or SMILES"/></div><div><label htmlFor="lookup-namespace">Query type</label><select id="lookup-namespace" className="simulation-control" value={inputs.namespace || 'name'} onChange={e=>update('namespace',e.target.value)}>{['name','smiles','cid'].map(x=><option key={x}>{x}</option>)}</select></div><p className="sm:col-span-2 text-sm text-research-muted">PubChem retrieves existing chemical properties; it does not execute your selected simulation.</p></section>;
  return <section className="mb-7 space-y-4">
    <h3>{engine.label} preparation parameters</h3>
    {!engine.sim_types.includes(simType) && engine.id!=='rdkit' && <p role="status" className="text-sm text-destructive">This engine is not supported for the selected workflow. Supported workflows: {engine.sim_types.join(', ')}.</p>}
    <div className="grid gap-4 sm:grid-cols-2">
      {section!=='advanced' && <><div><label htmlFor="engine-method">Method</label><select id="engine-method" className="simulation-control" value={inputs.engine_method || engine.methods[0]} onChange={e=>update('engine_method',e.target.value)}>{engine.methods.map(x=><option key={x}>{x}</option>)}</select></div>
      <div><label htmlFor="engine-task">Prepared task</label><select id="engine-task" className="simulation-control" value={inputs.engine_task || engine.tasks[0]} onChange={e=>update('engine_task',e.target.value)}>{engine.tasks.map(x=><option key={x}>{x}</option>)}</select></div></>}
      {engine.id==='rdkit'?(section!=='advanced' && <div className="sm:col-span-2"><label htmlFor="rdkit-smiles">Explicit SMILES</label><input id="rdkit-smiles" className="simulation-control" value={inputs.smiles || ''} onChange={e=>update('smiles',e.target.value)} placeholder="CCO"/></div>):<>
        {section!=='core' && <div className="sm:col-span-2"><label htmlFor="engine-geometry">XYZ geometry (optional for molecular compound lookup; required for crystals)</label><textarea id="engine-geometry" rows={6} className="simulation-control font-mono" value={inputs.geometry_xyz || ''} onChange={e=>update('geometry_xyz',e.target.value)} placeholder={'3\nWater\nO 0 0 0\nH 0 0 0.9572\nH 0.9266 0 -0.2396'}/></div>}
        {section!=='advanced' && !engine.periodic && engine.id!=='xtb' && <div><label htmlFor="engine-basis">Basis set</label><BasisSetSelect engineId={engine.id} value={inputs.basis_set} onChange={value=>update('basis_set',value)}/></div>}
        {section!=='core' && engine.periodic && <div className="sm:col-span-2"><label htmlFor="engine-cell">Cell vectors in angstroms (nine components)</label><input id="engine-cell" className="simulation-control font-mono" value={inputs.cell || ''} onChange={e=>update('cell',e.target.value)} placeholder="12 0 0 0 12 0 0 0 12"/></div>}
        {section!=='core' && engine.pseudo_required && <div className="sm:col-span-2"><label htmlFor="engine-pseudos">Local pseudopotential filenames by element (JSON)</label><textarea id="engine-pseudos" className="simulation-control font-mono" value={inputs.pseudopotentials || ''} onChange={e=>update('pseudopotentials',e.target.value)} placeholder={'{"Si":"Si.pbe.UPF"}'}/></div>}
        {section!=='core' && engine.active_space && inputs.engine_method==='CASSCF' && ['active_electrons','active_orbitals'].map(key=><div key={key}><label htmlFor={key}>{key.replace('_',' ')}</label><input id={key} type="number" min="1" max="30" className="simulation-control" value={inputs[key] || ''} onChange={e=>update(key,Number(e.target.value))}/></div>)}
      </>}
    </div><p className="text-sm text-research-muted">Only the listed method and task will be prepared; no calculation runs here. Review local dependencies and citations in the downloaded README.</p>
  </section>;
}