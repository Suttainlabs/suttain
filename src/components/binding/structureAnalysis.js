// Parses a predicted complex (mmCIF or PDB) and derives per-residue confidence and ligand contacts.
// Everything here is geometry on the predicted pose: no extra modelling, no estimates.

const tokenize = line => line.match(/'[^']*'|"[^"]*"|\S+/g)?.map(t => t.replace(/^['"]|['"]$/g, '')) || [];

function parseCif(text) {
  const lines = text.split(/\r?\n/);
  const atoms = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== 'loop_' || !lines[i + 1]?.startsWith('_atom_site.')) continue;
    const fields = [];
    let j = i + 1;
    while (lines[j]?.startsWith('_atom_site.')) fields.push(lines[j++].trim().slice(11));
    const f = name => fields.indexOf(name);
    const ix = {
      group: f('group_PDB'), el: f('type_symbol'), atom: f('label_atom_id'), resn: f('label_comp_id'),
      chain: f('auth_asym_id') >= 0 ? f('auth_asym_id') : f('label_asym_id'),
      resi: f('auth_seq_id') >= 0 ? f('auth_seq_id') : f('label_seq_id'),
      x: f('Cartn_x'), y: f('Cartn_y'), z: f('Cartn_z'), b: f('B_iso_or_equiv'),
    };
    for (; j < lines.length; j++) {
      const l = lines[j];
      if (!l || l.startsWith('#') || l.startsWith('loop_') || l.startsWith('_')) break;
      const t = tokenize(l);
      if (t.length < fields.length) continue;
      atoms.push({ het: t[ix.group] === 'HETATM', el: (t[ix.el] || '').toUpperCase(), atom: t[ix.atom], resn: t[ix.resn], chain: t[ix.chain], resi: Number(t[ix.resi]) || 0, x: +t[ix.x], y: +t[ix.y], z: +t[ix.z], b: +t[ix.b] });
    }
    break;
  }
  return atoms;
}

function parsePdb(text) {
  return text.split(/\r?\n/).filter(l => /^(ATOM|HETATM)/.test(l)).map(l => ({
    het: l.startsWith('HETATM'), atom: l.slice(12, 16).trim(), resn: l.slice(17, 20).trim(), chain: l.slice(21, 22).trim() || 'A',
    resi: Number(l.slice(22, 26)) || 0, x: +l.slice(30, 38), y: +l.slice(38, 46), z: +l.slice(46, 54), b: +l.slice(60, 66),
    el: (l.slice(76, 78).trim() || l.slice(12, 14).trim()).toUpperCase(),
  }));
}

const AA_CLASS = {
  ALA: 'hydrophobic', VAL: 'hydrophobic', LEU: 'hydrophobic', ILE: 'hydrophobic', MET: 'hydrophobic', PHE: 'aromatic', TRP: 'aromatic', TYR: 'aromatic', PRO: 'hydrophobic', GLY: 'flexible',
  SER: 'polar', THR: 'polar', ASN: 'polar', GLN: 'polar', CYS: 'polar', HIS: 'positive', LYS: 'positive', ARG: 'positive', ASP: 'negative', GLU: 'negative',
};
export const CLASS_STYLE = {
  hydrophobic: { label: 'Hydrophobic', color: '#C9A227' }, aromatic: { label: 'Aromatic', color: '#9C6ADE' }, polar: { label: 'Polar', color: '#2BB3A3' },
  positive: { label: 'Positive', color: '#3D7BFA' }, negative: { label: 'Negative', color: '#E4572E' }, flexible: { label: 'Glycine', color: '#8A9A97' }, other: { label: 'Other', color: '#8A9A97' },
};
const toPct = b => (b > 1 ? b : b * 100);

export function analyseStructure(text, format = 'cif') {
  const atoms = (format === 'pdb' ? parsePdb(text) : parseCif(text)).filter(a => Number.isFinite(a.x));
  const protein = atoms.filter(a => !a.het && a.resn !== 'HOH');
  const ligand = atoms.filter(a => a.het && a.resn !== 'HOH' && a.el !== 'H');

  // Per-residue pLDDT: C-alpha value (Boltz writes the same value on every atom of a residue).
  const residues = new Map();
  for (const a of protein) {
    const key = `${a.chain}:${a.resi}`;
    if (!residues.has(key) || a.atom === 'CA') residues.set(key, { chain: a.chain, resi: a.resi, resn: a.resn, plddt: toPct(a.b) });
  }
  const chainA = [...residues.values()].filter(r => r.chain === (protein[0]?.chain || 'A')).sort((p, q) => p.resi - q.resi);

  // Contacts: protein heavy atoms within 4.5 Å of any ligand heavy atom.
  const CUT = 4.5, POLAR = 3.5;
  const contacts = new Map();
  if (ligand.length) {
    const lx = ligand.map(a => a.x), ly = ligand.map(a => a.y), lz = ligand.map(a => a.z);
    const box = [Math.min(...lx) - CUT, Math.max(...lx) + CUT, Math.min(...ly) - CUT, Math.max(...ly) + CUT, Math.min(...lz) - CUT, Math.max(...lz) + CUT];
    for (const p of protein) {
      if (p.el === 'H' || p.x < box[0] || p.x > box[1] || p.y < box[2] || p.y > box[3] || p.z < box[4] || p.z > box[5]) continue;
      for (const l of ligand) {
        const d = Math.hypot(p.x - l.x, p.y - l.y, p.z - l.z);
        if (d > CUT) continue;
        const key = `${p.chain}:${p.resi}`;
        const c = contacts.get(key) || { chain: p.chain, resi: p.resi, resn: p.resn, dist: Infinity, polar: 0, plddt: residues.get(key)?.plddt ?? null, cls: AA_CLASS[p.resn] || 'other' };
        c.dist = Math.min(c.dist, d);
        if (d <= POLAR && ['N', 'O'].includes(p.el) && ['N', 'O'].includes(l.el)) c.polar += 1;
        contacts.set(key, c);
      }
    }
  }
  const pocket = [...contacts.values()].sort((a, b) => a.dist - b.dist);
  const ligandPlddt = ligand.length ? ligand.reduce((s, a) => s + toPct(a.b), 0) / ligand.length : null;
  return { residues: chainA, pocket, ligandAtoms: ligand.length, ligandPlddt, ligandName: ligand[0]?.resn || null, ligandChain: ligand[0]?.chain || null };
}
