import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
export default function ForcefieldUploadDialog({ file, onClose, onSelect }) {
  const [name, setName] = useState(file.name.replace(/\.[^.]+$/, ''));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const upload = async save => {
    setBusy(true); setError('');
    try {
      if (!/\.(itp|top|xml|prmtop)$/i.test(file.name)) throw new Error('Choose an .itp, .top, .xml or .prmtop file.');
      if (file.size > 10 * 1024 * 1024) throw new Error('Choose a file smaller than 10 MB.');
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      let ff = { name: name.trim(), base_forcefield: 'Custom (uploaded)', file_uri, file_name: file.name };
      if (save) ff = await base44.entities.CustomForcefield.create(ff);
      await onSelect(ff); onClose();
    } catch (err) { setError(err.message || 'Upload failed. Please try again.'); }
    finally { setBusy(false); }
  };
  return <Dialog open onOpenChange={open => !open && !busy && onClose()}><DialogContent className="bg-research-card text-research-text">
    <DialogHeader><DialogTitle>Upload forcefield</DialogTitle></DialogHeader>
    <p className="text-sm text-research-muted break-all">{file.name}</p>
    <label className="text-sm" htmlFor="forcefield-upload-name">Forcefield name</label><input id="forcefield-upload-name" maxLength={100} value={name} onChange={e => setName(e.target.value)} className="simulation-control" />
    <p className="text-sm text-research-muted">Use this file for the current run, or save it to your library for future runs. Files are private.</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex flex-wrap gap-2"><button disabled={busy || !name.trim()} type="button" onClick={() => upload(false)} className="research-secondary disabled:opacity-50">{busy ? 'Uploading...' : 'Use once'}</button>
      <button disabled={busy || !name.trim()} type="button" onClick={() => upload(true)} className="research-primary disabled:opacity-50">Save to library</button></div>
  </DialogContent></Dialog>;
}