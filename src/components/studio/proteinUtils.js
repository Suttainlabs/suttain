// Protein computation utilities for Computational Studio

// Amino acid molecular weights (residue weights, monoisotopic average)
export const AA_WEIGHTS = {
  A: 71.08, R: 156.19, N: 114.10, D: 115.09, C: 103.14,
  E: 129.12, Q: 128.13, G: 57.05, H: 137.14, I: 113.16,
  L: 113.16, K: 128.17, M: 131.19, F: 147.18, P: 97.12,
  S: 87.08, T: 101.10, W: 186.21, Y: 163.18, V: 99.13,
};

// Kyte-Doolittle hydropathy values
export const KD_HYDROPATHY = {
  A: 1.8, R: -4.5, N: -3.5, D: -3.5, C: 2.5,
  E: -3.5, Q: -3.5, G: -0.4, H: -3.2, I: 4.5,
  L: 3.8, K: -3.9, M: 1.9, F: 2.8, P: -1.6,
  S: -0.8, T: -0.7, W: -0.9, Y: -1.3, V: 4.2,
};

// pKa values for theoretical pI calculation
const PKA = {
  N_term: 9.0, C_term: 3.1,
  D: 3.65, E: 4.25, C: 8.33, Y: 10.07,
  H: 6.00, K: 10.53, R: 12.48,
};

// DIWV (Dipeptide Instability Weight Values) from Guruprasad et al. (1990)
const DIWV_ORDER = 'ARNDCQEGHILKMFPSTWYV';
const DIWV = {
  A: [1,-1,0,-2,-1,-1,-1,0,-1,-1,-1,-1,-1,-2,-1,-1,-1,-7,-4,-1],
  R: [-1,1,0,-1,-1,-1,-1,0,-1,-1,-1,1,-1,-2,-1,-1,-1,-4,-4,-2],
  N: [0,0,1,0,-2,0,0,1,0,-2,-2,0,-2,-3,1,1,0,-4,-2,-2],
  D: [-2,-1,0,1,-2,0,0,1,0,-2,-2,0,-3,-5,0,1,0,-7,-4,-2],
  C: [-1,-1,-2,-2,1,-2,-2,-3,-3,-2,-2,-3,-2,-2,-3,-2,-2,-6,-3,-2],
  Q: [-1,-1,0,0,-2,1,1,-1,-1,-2,-2,0,-1,-3,-1,0,-1,-3,-2,-2],
  E: [-1,-1,0,0,-2,1,1,-2,-1,-2,-2,0,-2,-3,-1,-1,-1,-3,-2,-2],
  G: [0,0,1,1,-3,-1,-2,1,-2,-3,-3,-2,-3,-4,0,1,1,-3,-3,-2],
  H: [-1,-1,0,0,-3,-1,-1,-2,1,-2,-2,-1,-2,-2,-1,0,-1,-2,-2,-2],
  I: [-1,-1,-2,-2,-2,-2,-2,-3,-2,1,1,-2,1,-1,-2,-2,-1,-3,-2,1],
  L: [-1,-1,-2,-2,-2,-2,-2,-3,-2,1,1,-2,1,-1,-2,-2,-1,-2,-2,1],
  K: [-1,1,0,0,-3,0,0,-2,-1,-2,-2,1,-1,-3,-1,-1,-1,-3,-2,-2],
  M: [-1,-1,-2,-3,-2,-1,-2,-3,-2,1,1,-1,1,0,-2,-1,-1,-1,0,1],
  F: [-2,-2,-3,-5,-2,-3,-3,-4,-2,-1,-1,-3,0,1,-3,-2,-2,-5,3,-1],
  P: [-1,-1,1,0,-3,-1,-1,0,-1,-2,-2,-1,-2,-3,1,1,0,-4,-3,-2],
  S: [-1,-1,1,1,-2,0,-1,1,0,-2,-2,-1,-1,-2,1,1,1,-4,-2,-1],
  T: [-1,-1,0,0,-2,-1,-1,1,-1,-1,-1,-1,-1,-2,0,1,1,-3,-2,0],
  W: [-7,-4,-4,-7,-6,-3,-3,-3,-2,-3,-2,-3,-1,-5,-4,-4,-3,1,-4,-6],
  Y: [-4,-4,-2,-4,-3,-2,-2,-3,-2,-2,-2,-2,0,3,-3,-2,-2,-4,1,-2],
  V: [-1,-2,-2,-2,-2,-2,-2,-2,-2,1,1,-2,1,-1,-2,-1,0,-6,-2,1],
};

export function computeInstabilityIndex(seq) {
  let sum = 0;
  for (let i = 0; i < seq.length - 1; i++) {
    const a = seq[i], b = seq[i + 1];
    const idxA = DIWV_ORDER.indexOf(a);
    const idxB = DIWV_ORDER.indexOf(b);
    if (idxA >= 0 && idxB >= 0) {
      sum += DIWV[a][idxB];
    }
  }
  return (10.0 / Math.max(seq.length, 1)) * sum;
}

export function computeTheoreticalPI(seq) {
  const counts = {};
  for (const aa of seq) {
    if (AA_WEIGHTS[aa]) counts[aa] = (counts[aa] || 0) + 1;
  }
  let lo = 0, hi = 14;
  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    let charge = 0;
    charge += 1 / (1 + Math.pow(10, mid - PKA.N_term));
    charge += (counts.K || 0) * 1 / (1 + Math.pow(10, mid - PKA.K));
    charge += (counts.R || 0) * 1 / (1 + Math.pow(10, mid - PKA.R));
    charge += (counts.H || 0) * 1 / (1 + Math.pow(10, mid - PKA.H));
    charge -= 1 / (1 + Math.pow(10, PKA.C_term - mid));
    charge -= (counts.D || 0) * 1 / (1 + Math.pow(10, PKA.D - mid));
    charge -= (counts.E || 0) * 1 / (1 + Math.pow(10, PKA.E - mid));
    charge -= (counts.C || 0) * 1 / (1 + Math.pow(10, PKA.C - mid));
    charge -= (counts.Y || 0) * 1 / (1 + Math.pow(10, PKA.Y - mid));
    if (charge > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function computeProteinProperties(seq) {
  let mw = 18.02;
  let gravy = 0;
  let gravyCount = 0;
  const counts = {};
  for (const aa of seq) {
    if (AA_WEIGHTS[aa]) {
      mw += AA_WEIGHTS[aa];
      counts[aa] = (counts[aa] || 0) + 1;
    }
    if (KD_HYDROPATHY[aa] !== undefined) {
      gravy += KD_HYDROPATHY[aa];
      gravyCount++;
    }
  }
  const pI = computeTheoreticalPI(seq);
  const instability = computeInstabilityIndex(seq);
  const aromatic = (counts.F || 0) + (counts.W || 0) + (counts.Y || 0);
  const aromaticity = aromatic / Math.max(seq.length, 1);
  const validAAs = Object.values(counts).reduce((a, b) => a + b, 0);
  return {
    length: seq.length,
    molecularWeight: mw,
    gravy: gravyCount > 0 ? gravy / gravyCount : 0,
    pI,
    instabilityIndex: instability,
    aromaticity,
    aromaticCount: aromatic,
    cysteineCount: counts.C || 0,
    prolineCount: counts.P || 0,
    validAAs,
    composition: counts,
  };
}

export function parsePDBAtoms(pdbText) {
  const atoms = [];
  const lines = pdbText.split('\n');
  for (const line of lines) {
    if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
      const atomName = (line.substring(12, 16) || '').trim();
      let element = (line.substring(76, 78) || '').trim().replace(/[0-9]/g, '');
      if (!element) {
        element = atomName.replace(/[0-9]/g, '').charAt(0);
      }
      const x = parseFloat(line.substring(30, 38));
      const y = parseFloat(line.substring(38, 46));
      const z = parseFloat(line.substring(46, 54));
      const resSeq = parseInt(line.substring(22, 26)) || 0;
      if (!isNaN(x) && !isNaN(y) && !isNaN(z) && element) {
        atoms.push({
          element: element.toUpperCase().charAt(0),
          position: [x, y, z],
          resSeq,
          is_alpha: atomName === 'CA',
        });
      }
    }
  }
  return atoms;
}