import { fetchStructure } from '@/components/simulation/moleculeSources';

export function extractSmiles(value = '') {
  return value.match(/\(SMILES:\s*(.+)\)\s*$/i)?.[1]?.trim() || value.match(/^SMILES:\s*(.+)$/i)?.[1]?.trim() || null;
}

export async function resolveMolecule(identifier, target = null) {
  const raw = String(identifier || '').trim();
  if (target?.computed && /^\d+\s*\n/.test(raw)) return {data:raw,format:'xyz',source:'Rowan computed geometry · real output'};
  // Keep uploaded coordinates intact; never turn a structure file into a name lookup.
  if (/^(ATOM  |HETATM)/m.test(raw)) return { data: raw, format: 'pdb', source: 'Input coordinates · not simulation output' };
  if (/M  END/.test(raw)) return { data: raw, format: 'sdf', source: 'Input coordinates · not simulation output' };
  if (/^\d+\s*\n[^\n]*\n\s*[A-Z][a-z]?\s+[-\d.]+\s+[-\d.]+\s+[-\d.]+/m.test(raw)) return { data: raw, format: 'xyz', source: 'Input coordinates · not simulation output' };
  const candidates = [];
  const add = (kind, value) => {
    if (typeof value === 'string' && value.trim() && value.length <= 2000) candidates.push([kind, value.trim()]);
  };
  add('smiles', target?.smiles);
  add('pdb', target?.pdb_id);
  add('name', target?.name);
  add('smiles', extractSmiles(raw));
  const name = raw.replace(/\s*\(SMILES:.*\)\s*$/i, '').replace(/^PDB:\s*/i, '');
  if (!/catalytic cycle|catalyzed|reaction pathway|simulation of/i.test(name)) add('name', name);
  if (/^[0-9][A-Za-z0-9]{3}$/.test(name)) add('pdb', name);
  if (/^[A-Za-z0-9@+\-\[\]().=#/\\]+$/.test(raw) && !/^[0-9][A-Za-z0-9]{3}$/.test(raw)) add('smiles', raw);
  const seen = new Set();
  for (const [kind, value] of candidates) {
    const key = `${kind}:${value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const result = await fetchStructure(kind, value);
    if (result) return result;
  }
  return null;
}