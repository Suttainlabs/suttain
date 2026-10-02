import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
export default function ForcefieldAttachment({ env }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!env?.forcefield_file_uri) return null;
  const download = async () => {
    setBusy(true); setError('');
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: env.forcefield_file_uri });
      const response = await fetch(signed_url);
      if (!response.ok) throw new Error('Could not download this forcefield.');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = env.forcefield_file_name.replace(/[^a-zA-Z0-9_.-]/g, '_'); link.click(); URL.revokeObjectURL(url);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <div className="mt-4 rounded-lg border border-research-border bg-research-soft p-4"><p className="text-sm break-all">Attached forcefield: {env.forcefield_file_name}</p>
    <button type="button" disabled={busy} className="research-secondary mt-2" onClick={download}>{busy ? 'Downloading...' : 'Download forcefield'}</button>
    <p className="research-label mt-2">Place the file beside your generated inputs and verify engine compatibility before execution.</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}