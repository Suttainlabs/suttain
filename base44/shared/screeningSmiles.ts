// Bounded organic SMILES subset. Unsupported syntax is rejected, never guessed.
export const MASSES = { H: 1.008, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.9984, P: 30.9738, S: 32.06, Cl: 35.45, Br: 79.904, I: 126.9045 };
export function parseSmiles(smiles) {
  if (typeof smiles !== 'string' || !smiles.length || smiles.length > 2000) throw new Error('SMILES length unsupported');
  const atoms = [], bonds = [], stack = [], rings = new Map();
  let current = -1, pending = null, i = 0;
  const connect = (a, b, order) => {
    if (a === b || atoms[a].neighbors.some(n => n.atom === b)) throw new Error('Invalid bond');
    const id = bonds.length; bonds.push({ a, b, order });
    atoms[a].neighbors.push({ atom: b, order, id }); atoms[b].neighbors.push({ atom: a, order, id });
  };
  while (i < smiles.length) {
    const c = smiles[i];
    if (c === '(') { if (current < 0 || pending !== null) throw new Error('Invalid branch'); stack.push(current); i++; continue; }
    if (c === ')') { if (!stack.length || pending !== null) throw new Error('Invalid branch'); current = stack.pop(); i++; continue; }
    if (c === '.') { if (current < 0 || pending !== null) throw new Error('Invalid fragment'); current = -1; i++; continue; }
    if ('-=#:/\\'.includes(c)) { if (current < 0 || pending !== null) throw new Error('Invalid bond'); pending = ({ '=': 2, '#': 3, ':': 1.5 })[c] || 1; i++; continue; }
    if (/\d/.test(c) || c === '%') {
      if (current < 0) throw new Error('Invalid ring');
      const label = c === '%' ? smiles.slice(i + 1, i + 3) : c;
      if (!/^\d{1,2}$/.test(label) || (c === '%' && label.length !== 2)) throw new Error('Unsupported ring');
      i += c === '%' ? 3 : 1;
      if (rings.has(label)) {
        const previous = rings.get(label); rings.delete(label);
        if (pending !== null && previous.order !== null && pending !== previous.order) throw new Error('Conflicting ring bond');
        connect(previous.atom, current, pending ?? previous.order ?? (atoms[current].aromatic && atoms[previous.atom].aromatic ? 1.5 : 1));
      } else rings.set(label, { atom: current, order: pending });
      pending = null; continue;
    }
    let symbol, hydrogens = null, charge = 0;
    if (c === '[') {
      const end = smiles.indexOf(']', i); if (end < 0) throw new Error('Invalid bracket');
      const match = smiles.slice(i + 1, end).match(/^(Cl|Br|[BCNOFPSIHbcnops])(@@?)?(H\d?)?([+-]\d?|\+\+|--)?$/);
      if (!match) throw new Error('Unsupported bracket atom, isotope, or atom mapping');
      symbol = match[1]; hydrogens = match[3] ? Number(match[3].slice(1) || 1) : 0;
      const q = match[4]; if (q) charge = (q[0] === '+' ? 1 : -1) * (/\d/.test(q) ? Number(q.slice(1)) : q.length);
      i = end + 1;
    } else {
      const match = smiles.slice(i).match(/^(Cl|Br|[BCNOFPSIbcnops])/);
      if (!match) throw new Error('Unsupported SMILES token'); symbol = match[0]; i += symbol.length;
    }
    const element = symbol[0].toUpperCase() + symbol.slice(1), aromatic = symbol === symbol.toLowerCase();
    if (!MASSES[element] || atoms.length >= 150) throw new Error('Unsupported element or more than 150 atoms');
    const next = atoms.length; atoms.push({ element, aromatic, hydrogens, charge, neighbors: [] });
    if (current >= 0) connect(current, next, pending ?? (aromatic && atoms[current].aromatic ? 1.5 : 1));
    current = next; pending = null;
  }
  if (!atoms.length || stack.length || rings.size || pending !== null || current < 0) throw new Error('Incomplete SMILES');
  for (const atom of atoms) {
    const used = atom.neighbors.reduce((sum, n) => sum + n.order, 0);
    if (atom.hydrogens === null) {
      if (atom.aromatic) atom.hydrogens = ['C', 'B'].includes(atom.element) ? Math.max(0, 3 - atom.neighbors.length) : 0;
      else {
        const valences = ({ B: [3], C: [4], N: [3], O: [2], F: [1], P: [3, 5], S: [2, 4, 6], Cl: [1], Br: [1], I: [1] })[atom.element];
        const valence = valences?.find(v => v >= used);
        if (valence === undefined || !Number.isInteger(used)) throw new Error('Unsupported valence');
        atom.hydrogens = valence - used;
      }
    }
    if (atom.aromatic && (atom.neighbors.length < 2 || atom.neighbors.length > 3)) throw new Error('Unsupported aromatic connectivity');
    if (!atom.aromatic && used + atom.hydrogens > ({ H: 1, B: 4, C: 4, N: atom.charge > 0 ? 4 : 3, O: atom.charge > 0 ? 3 : 2, F: 1, P: 5, S: 6, Cl: 1, Br: 1, I: 1 })[atom.element]) throw new Error('Unsupported valence');
  }
  return { atoms, bonds };
}
export function isRingBond(graph, bondIndex) {
  const bond = graph.bonds[bondIndex], seen = new Set([bond.a]), queue = [bond.a];
  while (queue.length) for (const n of graph.atoms[queue.pop()].neighbors) {
    if (n.id === bondIndex || seen.has(n.atom)) continue;
    if (n.atom === bond.b) return true; seen.add(n.atom); queue.push(n.atom);
  }
  return false;
}