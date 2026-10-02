import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CustomForcefieldManager from '@/components/simulation/CustomForcefieldManager';
import ForcefieldUploadDialog from '@/components/simulation/ForcefieldUploadDialog';
const BUILTINS = ['AMBER99SB-ILDN', 'CHARMM36', 'CHARMM36m', 'OPLS-AA', 'OPLS-AA/M', 'GROMOS54A7', 'ff14SB', 'AMBER14SB', 'TraPPE', 'Slipids'];
export default function ForcefieldPicker({ env, onChange }) {
  const [creating, setCreating] = useState(false);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const client = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['forcefield-user'], queryFn: () => base44.auth.me() });
  const { data: saved = [], isLoading, error } = useQuery({ queryKey: ['forcefields', user?.id], enabled: !!user, queryFn: () => base44.entities.CustomForcefield.filter({ created_by_id: user.id }, '-created_date', 500) });
  const select = ff => {
    onChange({ ...env, forcefield: ff.name, forcefield_file_uri: ff.file_uri || '', forcefield_file_name: ff.file_name || '', custom_forcefield_id: ff.id || '', custom_forcefield: ff.id ? ff : null, environment_id: null });
    client.invalidateQueries({ queryKey: ['forcefields'] });
  };
  const value = env.custom_forcefield_id ? `saved:${env.custom_forcefield_id}` : env.forcefield || '';
  const known = !value || BUILTINS.includes(value) || saved.some(ff => `saved:${ff.id}` === value);
  return <div className="min-w-0">
    <label htmlFor="environment-forcefield" className="block text-sm font-medium text-research-text mb-2">Forcefield</label>
    <select id="environment-forcefield" value={value} className="simulation-control" onChange={e => {
      const ff = saved.find(item => `saved:${item.id}` === e.target.value);
      if (ff) select(ff); else onChange({ ...env, forcefield: e.target.value, forcefield_file_uri: '', forcefield_file_name: '', custom_forcefield_id: '', custom_forcefield: null, environment_id: null });
    }}><option value="">Default / not specified</option>{!known && <option value={value}>{env.forcefield}</option>}
      <optgroup label="Built-in forcefields">{BUILTINS.map(ff => <option key={ff}>{ff}</option>)}</optgroup>
      {saved.length > 0 && <optgroup label="My forcefields">{saved.map(ff => <option key={ff.id} value={`saved:${ff.id}`}>{ff.name}</option>)}</optgroup>}
    </select>
    <div className="flex flex-wrap gap-2 mt-2"><button type="button" disabled={!user} className="research-secondary !px-3 !py-2 disabled:opacity-50" onClick={() => fileRef.current.click()}>Upload forcefield</button><button type="button" disabled={!user} className="research-secondary !px-3 !py-2 disabled:opacity-50" onClick={() => setCreating(true)}>Create new</button></div>
    {isLoading && <p className="research-label mt-1">Loading library...</p>}{error && <p role="alert" className="text-sm text-destructive">Could not load your forcefield library.</p>}
    {env.forcefield_file_name && <p className="research-label mt-2 break-all">File: {env.forcefield_file_name}</p>}
    <input ref={fileRef} type="file" accept=".itp,.top,.xml,.prmtop" className="hidden" onChange={e => { setFile(e.target.files[0] || null); e.target.value = ''; }} />
    {file && <ForcefieldUploadDialog file={file} onClose={() => setFile(null)} onSelect={select} />}
    <CustomForcefieldManager isOpen={creating} onClose={() => setCreating(false)} onSelect={select} initialView="new" selectOnSave />
  </div>;
}