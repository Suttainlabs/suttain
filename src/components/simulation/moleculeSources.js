export async function fetchStructure(kind, identifier) {
  if (kind === 'pdb') {
    if (!/^[0-9][A-Za-z0-9]{3}$/.test(identifier)) return null;
    const response = await fetch(`https://files.rcsb.org/download/${identifier.toUpperCase()}.pdb`, { signal: AbortSignal.timeout(12000) }).catch(() => null);
    if (!response?.ok) return null;
    const data = await response.text();
    return /^(ATOM  |HETATM)/m.test(data) ? { data, format: 'pdb', pdbId: identifier.toUpperCase(), source: `RCSB PDB: ${identifier.toUpperCase()} · deposited structure, not simulation output` } : null;
  }
  for (const coordinates of ['3d', '2d']) {
    const url = kind === 'smiles'
      ? 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/SDF'
      : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(identifier)}/SDF`;
    const options = kind === 'smiles'
      ? { method: 'POST', body: new URLSearchParams({ smiles: identifier, record_type: coordinates }) }
      : {};
    const response = await fetch(`${url}${kind === 'name' ? `?record_type=${coordinates}` : ''}`, { ...options, signal: AbortSignal.timeout(12000) }).catch(() => null);
    if (!response?.ok) continue;
    const data = await response.text();
    if (!/M  END/.test(data)) continue;
    return { data, format: 'sdf', source: `PubChem · ${coordinates === '3d' ? 'reference conformer' : '2D coordinates (3D unavailable)'} · not simulation output` };
  }
  return null;
}