import React, { useState } from 'react';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';

const MAX_ATOMS = 1000;
const MAX_BYTES = 90000;

// Keeps the first model's coordinates, drops crystallographic water (solvent is added locally),
// and reports what is left so the user knows whether the MD preparer will accept it.
function clean(text, chain) {
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    if (/^ENDMDL/.test(line)) break;
    if (!/^(ATOM  |HETATM|TER)/.test(line)) continue;
    if (/^HETATM/.test(line) && /HOH|WAT|DOD/.test(line.slice(17, 20))) continue;
    if (chain && /^(ATOM  |HETATM)/.test(line) && line[21] !== chain) continue;
    if (chain && /^TER/.test(line) && line.length > 21 && line[21] !== chain) continue;
    out.push(line);
  }
  out.push('END');
  const atoms = out.filter(l => /^(ATOM  |HETATM)/.test(l));
  const chains = [...new Set(atoms.map(l => l[21]).filter(c => c && c.trim()))];
  const ligands = [...new Set(atoms.filter(l => /^HETATM/.test(l)).map(l => l.slice(17, 20).trim()))];
  return { pdb: out.join('\n'), atoms: atoms.length, chains, ligands };
}

export default function PdbFetch({ onLoad }) {
  const [id, setId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [raw, setRaw] = useState(null);
  const [loaded, setLoaded] = useState(null);

  const apply = (text, pdbId, chain) => {
    const c = clean(text, chain);
    if (!c.atoms) { setError(`${pdbId} has no atom records${chain ? ` in chain ${chain}` : ''}.`); return; }
    if (c.atoms > MAX_ATOMS || c.pdb.length > MAX_BYTES) {
      setRaw({ text, pdbId, chains: clean(text).chains });
      setError(`${pdbId}${chain ? ` chain ${chain}` : ''} has ${c.atoms.toLocaleString()} atoms after removing water. The MD preparer accepts up to ${MAX_ATOMS.toLocaleString()}.${!chain && c.chains.length > 1 ? ' Try a single chain below.' : ' Trim it to the region you need and upload the file.'}`);
      return;
    }
    setError(''); setRaw(null);
    setLoaded({ pdbId, chain, atoms: c.atoms, ligands: c.ligands });
    onLoad(c.pdb, { pdbId, chain });
  };

  const fetchPdb = async e => {
    e?.preventDefault();
    const pdbId = id.trim().toUpperCase();
    if (!/^[0-9][A-Z0-9]{3}$/.test(pdbId)) { setError('A PDB ID is 4 characters and starts with a number, e.g. 1CRN.'); return; }
    setBusy(true); setError(''); setLoaded(null); setRaw(null);
    try {
      const res = await fetch(`https://files.rcsb.org/download/${pdbId}.pdb`, { signal: AbortSignal.timeout(20000) });
      if (res.status === 404) throw new Error(`${pdbId} was not found, or is only available as mmCIF (large structures). Upload a trimmed PDB file instead.`);
      if (!res.ok) throw new Error('RCSB PDB did not respond. Try again in a moment.');
      apply(await res.text(), pdbId);
    } catch (err) { setError(err.name === 'TimeoutError' ? 'RCSB PDB took too long to respond. Try again.' : err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={fetchPdb} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <label htmlFor="pdb-id" className="sr-only">PDB ID</label>
        <input id="pdb-id" value={id} onChange={e => setId(e.target.value.toUpperCase())} maxLength={4} placeholder="PDB ID, e.g. 1CRN" autoComplete="off"
          className="simulation-control !h-11 font-mono uppercase min-w-0" />
        <button type="submit" disabled={busy || id.trim().length !== 4} className="research-primary !h-11 !px-4 disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Fetch
        </button>
      </form>
      <p className="text-xs text-research-muted">Downloads coordinates from RCSB PDB, keeps the first model and removes crystal water. Up to {MAX_ATOMS.toLocaleString()} atoms.</p>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {raw?.chains?.length > 1 && <div className="flex flex-wrap gap-2">{raw.chains.map(c => <button key={c} type="button" onClick={() => apply(raw.text, raw.pdbId, c)} className="research-secondary !min-h-9 !px-3 text-xs">Use chain {c}</button>)}</div>}
      {loaded && <div role="status" className="rounded-lg border border-research-accent/40 bg-research-soft p-3 text-sm">
        <p className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-research-accent" /><span><span className="font-medium">{loaded.pdbId}{loaded.chain ? ` chain ${loaded.chain}` : ''}</span> loaded: {loaded.atoms.toLocaleString()} atoms.</span></p>
        {loaded.ligands.length > 0 && <p className="mt-1 text-xs text-research-muted">Contains non-protein residues ({loaded.ligands.join(', ')}). Standard protein force fields cannot parameterise these: remove them or supply parameters in Advanced settings.</p>}
      </div>}
    </div>
  );
}
