import { MASSES, isRingBond } from './screeningSmiles.ts';
export const DESCRIPTOR_METHOD = 'Suttain JS reduced-fragment estimates v1 (not RDKit; not validated ADMET)';
// Reduced Crippen-style and Ertl-style fragments, not complete published atom typing.
// All LogP/TPSA and rule-based counts are explicitly exposed as estimates.
export function descriptors(graph) {
  let mw = 0, logp = 0, tpsa = 0, hbd = 0, hba = 0;
  const amide = atom => atom.element === 'N' && atom.neighbors.some(n => graph.atoms[n.atom].element === 'C' && graph.atoms[n.atom].neighbors.some(e => e.order === 2 && ['O', 'S'].includes(graph.atoms[e.atom].element)));
  for (const atom of graph.atoms) {
    const { element: el, hydrogens: h, aromatic, charge } = atom;
    mw += MASSES[el] + h * MASSES.H;
    const heteroNeighbor = atom.neighbors.some(n => !['C', 'H'].includes(graph.atoms[n.atom].element));
    const doubleBond = atom.neighbors.some(n => n.order === 2), tripleBond = atom.neighbors.some(n => n.order === 3);
    if (el === 'C') logp += (aromatic ? (heteroNeighbor ? 0.2955 : 0.1581) : heteroNeighbor ? -0.2035 : 0.1441) + h * 0.123;
    else if (el === 'N') {
      const isAmide = amide(atom);
      logp += (charge ? -1.95 : aromatic ? -0.3239 : isAmide ? -1.019 : h ? -1.019 : -0.3187) + h * 0.2142;
      tpsa += aromatic ? (h ? 15.79 : 25.78) : tripleBond ? 23.79 : doubleBond ? (h ? 23.85 : 12.36) : h >= 2 ? 26.02 : h === 1 ? 12.03 : 3.24;
      if (h > 0) hbd++;
      if (charge <= 0 && !isAmide && !(aromatic && h > 0)) hba++;
    } else if (el === 'O') {
      logp += (charge ? -1.326 : h ? -0.2893 : doubleBond ? -0.1526 : -0.4195) + h * -0.2677;
      tpsa += charge < 0 ? 23.06 : h ? 20.23 : doubleBond ? 17.07 : 9.23;
      if (h) hbd++;
      const acidOH = h && atom.neighbors.some(n => graph.atoms[n.atom].element === 'C' && graph.atoms[n.atom].neighbors.some(e => e.order === 2 && graph.atoms[e.atom].element === 'O'));
      if (charge <= 0 && !acidOH) hba++;
    } else if (el === 'S') { logp += 0.6482 + h * 0.123; tpsa += aromatic ? 28.24 : h ? 38.8 : 25.3; if (h) hbd++; if (charge <= 0) hba++; }
    else if (el === 'P') { logp += 0.8612; tpsa += 13.59; }
    else logp += ({ H: 0.123, B: -0.3808, F: 0.4202, Cl: 0.6895, Br: 0.8456, I: 0.8857 })[el] || 0;
  }
  const rotatable = graph.bonds.filter((b, i) => {
    const a = graph.atoms[b.a], c = graph.atoms[b.b];
    if (b.order !== 1 || a.neighbors.length < 2 || c.neighbors.length < 2 || a.element === 'H' || c.element === 'H' || isRingBond(graph, i)) return false;
    if ((a.element === 'N' && c.element === 'C' && amide(a)) || (c.element === 'N' && a.element === 'C' && amide(c))) {
      const carbon = a.element === 'C' ? a : c;
      if (carbon.neighbors.some(n => n.order === 2 && ['O','S'].includes(graph.atoms[n.atom].element))) return false;
    }
    return true;
  }).length;
  const lipinski = Number(mw > 500) + Number(logp > 5) + Number(hbd > 5) + Number(hba > 10);
  const veber = Number(rotatable > 10) + Number(tpsa > 140), total = lipinski + veber;
  return { molecular_weight: +mw.toFixed(2), logp: +logp.toFixed(2), tpsa: +tpsa.toFixed(2), hbd, hba, rotatable_bonds: rotatable, lipinski_violations: lipinski, veber_violations: veber, risk: total === 0 ? 'low' : total === 1 ? 'moderate' : 'high' };
}