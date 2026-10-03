import React from 'react';
export default function MdParameterFields({engine,inputs,onChange,simType,section='all'}) {
  const fields = [
    {key:'md_steps',label:'Production steps',min:1,max:1000000000,step:1,value:10000},
    {key:'md_timestep_fs',label:'Timestep (fs)',min:0.1,max:1,step:0.1,value:1},
    {key:'md_padding_nm',label:'Cubic water box padding (nm)',min:1.1,max:20,step:0.1,value:1.2},
  ];
  return <section className="mb-7 space-y-4">
    <h3>{engine.label} molecular dynamics inputs</h3>
    {simType!=='molecular_dynamics' && <p role="alert" className="text-sm text-destructive">Select the molecular dynamics workflow; enhanced sampling is not implemented by this template.</p>}
    {section!=='advanced' && <div><label htmlFor="md-pdb">Complete PDB coordinates and residue topology</label><textarea id="md-pdb" rows={7} className="simulation-control font-mono" value={inputs.pdb_content || ''} onChange={e=>onChange('pdb_content',e.target.value)} placeholder="Paste complete PDB text, including atom records and hydrogens. Maximum 24 KB." /></div>}
    {section!=='core' && <div className="grid gap-4 sm:grid-cols-3">{fields.map(field=><div key={field.key}><label htmlFor={field.key}>{field.label}</label><input id={field.key} type="number" min={field.min} max={field.max} step={field.step} className="simulation-control" value={inputs[field.key] ?? field.value} onChange={e=>onChange(field.key,e.target.value===''?'':Number(e.target.value))} /></div>)}</div>}
    {section!=='core' && engine.id==='openmm' && <div><label htmlFor="md-atom-types">Atom types for custom overrides (JSON array)</label><textarea id="md-atom-types" rows={3} className="simulation-control font-mono" value={inputs.md_atom_types || ''} onChange={e=>onChange('md_atom_types',e.target.value)} placeholder={'["OW", "HW", "HW"]'} /><p className="text-xs text-research-muted mt-2">Required only with custom parameter tables: one exact forcefield type per input PDB atom, in order. No type guessing or ligand parameterization.</p></div>}
    <p className="text-sm text-research-muted">Temperature, pressure, forcefield and overrides below are applied by the downloaded scripts. Barostat none selects NVT; other supported barostats select NPT. Scripts minimize and equilibrate before production; review equilibration adequacy. No simulation executes in Suttain.</p>
  </section>;
}