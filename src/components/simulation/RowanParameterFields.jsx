import React from 'react';
import BasisSetSelect from '@/components/simulation/BasisSetSelect';
export default function RowanParameterFields({engine,inputs,onChange,simType}) {
  if(!['dft','quantum_mechanics'].includes(simType)) return null;
  if(!engine) return <p role="status" className="mb-7 text-sm text-research-muted">Loading supported Rowan methods…</p>;
  const methodKey=simType==='dft'?'functional':'method';
  const method=inputs[methodKey] || 'B3LYP';
  const task=inputs.task || (inputs.properties==='Dipole moment'?'Single-point energy':inputs.properties) || (simType==='dft'?'Geometry optimization':'Single-point energy');
  const supportedMethod=engine.methods.includes(method), supportedTask=engine.tasks.includes(task);
  const warning=!supportedMethod ? `${method} is not supported by this Rowan integration. Choose a supported method explicitly; wB97X-D3 is a different functional from wB97X-D.` : !supportedTask ? `${task} is not supported by this basic-calculation integration. Choose a supported task explicitly.` : '';
  return <section className="mb-7 space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      <div><label htmlFor="rowan-method">Rowan method</label><select id="rowan-method" className="simulation-control" value={method} onChange={e=>onChange(methodKey,e.target.value)}>
        {!supportedMethod && <option value={method} disabled>{method} (unsupported — choose a method)</option>}
        {engine.methods.map(value=><option key={value} value={value}>{value}</option>)}
      </select></div>
      <div><label htmlFor="rowan-task">Calculation task</label><select id="rowan-task" className="simulation-control" value={task} onChange={e=>onChange('task',e.target.value)}>
        {!supportedTask && <option value={task} disabled>{task} (unsupported — choose a task)</option>}
        {engine.tasks.map(value=><option key={value} value={value}>{value}</option>)}
      </select></div>
      {method!=='GFN2-xTB' && <div><label htmlFor="rowan-basis">Basis set</label><BasisSetSelect id="rowan-basis" engineId="rowan" value={inputs.basis_set} onChange={value=>onChange('basis_set',value)}/></div>}
    </div>
    {warning && <p role="alert" className="text-sm text-destructive">{warning}</p>}
    {method==='wB97X-D3' && <p className="text-sm text-research-muted">Rowan executes wB97X-D3 with Psi4. This is not the original wB97X-D functional.</p>}
  </section>;
}