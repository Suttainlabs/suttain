import React, { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { xyzFile,sdfFile,downloadRowan } from '@/components/simulation/rowanExports';
export default function RowanExports({dataset,result}) {
  const [message,setMessage] = useState('');
  const molecule = dataset?.final_molecule,xyz = xyzFile(molecule),smiles=dataset?.smiles || result.smiles || molecule?.smiles;
  const json = dataset ? JSON.stringify({...dataset,settings:dataset.settings || result.settings,citations:dataset.citations || result.citations,result},null,2) : '';
  const copy = async (value,label) => {try {await navigator.clipboard.writeText(value);setMessage(`${label} copied.`);} catch {setMessage('Clipboard access was blocked. Use the download option.');}};
  const actions = [['Structure file (SDF)',!!xyz,() => downloadRowan(sdfFile(molecule,smiles),'sdf',result.provider_job_id)],['Download XYZ',!!xyz,() => downloadRowan(xyz,'xyz',result.provider_job_id)],['Copy XYZ',!!xyz,() => copy(xyz,'XYZ'),true],['Copy SMILES',!!smiles,() => copy(smiles,'SMILES'),true],['Download JSON',!!json,() => downloadRowan(json,'json',result.provider_job_id)]];
  return <div className="space-y-2"><div className="flex flex-wrap gap-2">{actions.map(([label,enabled,action,isCopy]) => <button key={label} disabled={!enabled} onClick={action} className="research-secondary !px-3 !py-2 disabled:opacity-50">{isCopy ? <Copy className="w-4 h-4"/> : <Download className="w-4 h-4"/>}{label}</button>)}</div><p className="text-xs text-research-muted">SDF preserves final coordinates without inferred bonds. SMILES is the input identifier, not a new connectivity determination.</p><p role="status" className="text-xs text-research-accent">{message}</p></div>;
}