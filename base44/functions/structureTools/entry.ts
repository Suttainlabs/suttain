import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Structure parsers ──────────────────────────────────────────────

function parseXYZ(content) {
  const lines = content.trim().split('\n');
  const nAtoms = parseInt(lines[0].trim());
  const comment = (lines[1] || '').trim();
  const atoms = [];
  for (let i = 2; i < 2 + nAtoms && i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 4) {
      atoms.push({
        element: parts[0],
        position: [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]
      });
    }
  }
  return { atoms, lattice: null, is_crystal: false, source_format: 'xyz', comment };
}

function parsePOSCAR(content) {
  const lines = content.trim().split('\n');
  const comment = (lines[0] || '').trim();
  const scale = parseFloat((lines[1] || '1').trim()) || 1;
  const lat = [];
  for (let i = 2; i < 5; i++) {
    const parts = (lines[i] || '').trim().split(/\s+/);
    lat.push([parseFloat(parts[0]) * scale, parseFloat(parts[1]) * scale, parseFloat(parts[2]) * scale]);
  }
  const elements = (lines[5] || '').trim().split(/\s+/).filter(Boolean);
  const counts = (lines[6] || '').trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
  const coordFlag = (lines[7] || '').trim().toLowerCase();
  const isFractional = coordFlag.startsWith('d') || coordFlag.startsWith('f');

  const atoms = [];
  let lineIdx = 8;
  for (let i = 0; i < elements.length; i++) {
    for (let j = 0; j < counts[i]; j++) {
      const parts = (lines[lineIdx] || '').trim().split(/\s+/);
      let pos = [parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])];
      if (isFractional) {
        pos = [
          pos[0] * lat[0][0] + pos[1] * lat[1][0] + pos[2] * lat[2][0],
          pos[0] * lat[0][1] + pos[1] * lat[1][1] + pos[2] * lat[2][1],
          pos[0] * lat[0][2] + pos[1] * lat[1][2] + pos[2] * lat[2][2],
        ];
      }
      atoms.push({ element: elements[i], position: pos });
      lineIdx++;
    }
  }
  return { atoms, lattice: { matrix: lat }, is_crystal: true, source_format: 'poscar', comment };
}

function parsePDB(content) {
  const lines = content.trim().split('\n');
  const atoms = [];
  let lattice = null;
  for (const line of lines) {
    if (line.startsWith('CRYST1')) {
      const a = parseFloat(line.substring(6, 15));
      const b = parseFloat(line.substring(15, 24));
      const c = parseFloat(line.substring(24, 33));
      const alpha = parseFloat(line.substring(33, 40));
      const beta = parseFloat(line.substring(40, 47));
      const gamma = parseFloat(line.substring(47, 54));
      lattice = { a, b, c, alpha, beta, gamma };
    }
    if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
      const element = (line.substring(76, 78) || line.substring(12, 16)).trim().replace(/[0-9]/g, '').charAt(0).toUpperCase();
      const x = parseFloat(line.substring(30, 38));
      const y = parseFloat(line.substring(38, 46));
      const z = parseFloat(line.substring(46, 54));
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        atoms.push({ element: element || 'C', position: [x, y, z] });
      }
    }
  }
  return { atoms, lattice, is_crystal: !!lattice, source_format: 'pdb' };
}

function parseCIF(content) {
  const lines = content.split('\n');
  let a, b, c, alpha = 90, beta = 90, gamma = 90;
  const atoms = [];
  let inAtomLoop = false;
  let atomCols = {};
  let atomDataStarted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('_cell_length_a')) a = parseFloat(line.split(/\s+/)[1]);
    if (line.startsWith('_cell_length_b')) b = parseFloat(line.split(/\s+/)[1]);
    if (line.startsWith('_cell_length_c')) c = parseFloat(line.split(/\s+/)[1]);
    if (line.startsWith('_cell_angle_alpha')) alpha = parseFloat(line.split(/\s+/)[1]);
    if (line.startsWith('_cell_angle_beta')) beta = parseFloat(line.split(/\s+/)[1]);
    if (line.startsWith('_cell_angle_gamma')) gamma = parseFloat(line.split(/\s+/)[1]);

    if (line.startsWith('_atom_site_')) {
      inAtomLoop = true;
      const colName = line.replace('_atom_site_', '');
      atomCols[colName] = Object.keys(atomCols).length;
      continue;
    }
    if (inAtomLoop && !line.startsWith('_') && line.length > 0) {
      if (line.startsWith('loop_') || line.startsWith('data_') || line.startsWith('_')) {
        inAtomLoop = false;
        atomCols = {};
        continue;
      }
      const parts = line.split(/\s+/);
      const maxCol = Math.max(...Object.values(atomCols));
      if (parts.length >= maxCol + 1 && !isNaN(parseFloat(parts[maxCol]))) {
        const symbol = atomCols['type_symbol'] !== undefined ? parts[atomCols['type_symbol']] : parts[0];
        const xIdx = atomCols['fract_x'] !== undefined ? atomCols['fract_x'] : atomCols['Cartn_x'] !== undefined ? atomCols['Cartn_x'] : 1;
        const yIdx = atomCols['fract_y'] !== undefined ? atomCols['fract_y'] : atomCols['Cartn_y'] !== undefined ? atomCols['Cartn_y'] : 2;
        const zIdx = atomCols['fract_z'] !== undefined ? atomCols['fract_z'] : atomCols['Cartn_z'] !== undefined ? atomCols['Cartn_z'] : 3;
        let x = parseFloat(parts[xIdx]);
        let y = parseFloat(parts[yIdx]);
        let z = parseFloat(parts[zIdx]);
        const isFract = atomCols['fract_x'] !== undefined;
        if (isFract && a && b && c) {
          // Convert fractional to cartesian (simplified, assumes orthogonal for now)
          x = x * a;
          y = y * b;
          z = z * c;
        }
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          atoms.push({ element: symbol.replace(/[0-9]/g, ''), position: [x, y, z] });
        }
      }
    }
  }
  const lattice = (a && b && c) ? { a, b, c, alpha, beta, gamma } : null;
  return { atoms, lattice, is_crystal: !!lattice, source_format: 'cif' };
}

function parseStructure(content, format) {
  format = (format || '').toLowerCase();
  if (format === 'xyz') return parseXYZ(content);
  if (format === 'poscar') return parsePOSCAR(content);
  if (format === 'pdb') return parsePDB(content);
  if (format === 'cif') return parseCIF(content);
  // Auto-detect
  if (content.includes('_cell_length_a')) return parseCIF(content);
  if (content.includes('ATOM  ')) return parsePDB(content);
  if (content.trim().split('\n').length > 5 && /^\d+\s*$/.test(content.trim().split('\n')[0])) return parseXYZ(content);
  return parsePOSCAR(content);
}

// ── Structure writers ──────────────────────────────────────────────

function latticeToMatrix(lat) {
  if (!lat) return null;
  if (lat.matrix) return lat.matrix;
  const { a = 1, b = 1, c = 1, alpha = 90, beta = 90, gamma = 90 } = lat;
  const ar = alpha * Math.PI / 180, br = beta * Math.PI / 180, gr = gamma * Math.PI / 180;
  const cosG = Math.cos(gr);
  const omega = Math.sqrt(1 - Math.cos(ar)**2 - Math.cos(br)**2 - Math.cos(gr)**2 + 2 * Math.cos(ar) * Math.cos(br) * Math.cos(gr));
  return [
    [a, 0, 0],
    [b * cosG, b * Math.sin(gr), 0],
    [c * Math.cos(br), c * (Math.cos(ar) - Math.cos(br) * cosG) / Math.sin(gr), c * omega / Math.sin(gr)]
  ];
}

function writeXYZ(structure) {
  const { atoms } = structure;
  let out = `${atoms.length}\nConverted by Suttain Structure Tools\n`;
  for (const atom of atoms) {
    const el = atom.element || 'C';
    out += `${el} ${atom.position[0].toFixed(6)} ${atom.position[1].toFixed(6)} ${atom.position[2].toFixed(6)}\n`;
  }
  return out;
}

function writePOSCAR(structure) {
  const { atoms, lattice } = structure;
  const matrix = latticeToMatrix(lattice) || [[10,0,0],[0,10,0],[0,0,10]];
  const elemMap = {};
  for (const a of atoms) {
    const el = a.element || 'C';
    elemMap[el] = (elemMap[el] || 0) + 1;
  }
  const elements = Object.keys(elemMap);
  const counts = elements.map(e => elemMap[e]);

  let out = `Converted by Suttain Structure Tools\n1.0\n`;
  for (const row of matrix) {
    out += `${row[0].toFixed(6)} ${row[1].toFixed(6)} ${row[2].toFixed(6)}\n`;
  }
  out += elements.join(' ') + '\n';
  out += counts.join(' ') + '\n';
  out += 'Direct\n';

  // Convert cartesian to fractional
  const inv = invertMatrix(matrix);
  for (const e of elements) {
    for (const atom of atoms.filter(a => a.element === e)) {
      const f = matVec(inv, atom.position);
      out += `${f[0].toFixed(6)} ${f[1].toFixed(6)} ${f[2].toFixed(6)}\n`;
    }
  }
  return out;
}

function writeCIF(structure) {
  const { atoms, lattice } = structure;
  const lat = lattice || {};
  let out = `data_Suttain\n`;
  if (lat.a) out += `_cell_length_a ${lat.a}\n`;
  if (lat.b) out += `_cell_length_b ${lat.b}\n`;
  if (lat.c) out += `_cell_length_c ${lat.c}\n`;
  if (lat.alpha) out += `_cell_angle_alpha ${lat.alpha}\n`;
  if (lat.beta) out += `_cell_angle_beta ${lat.beta}\n`;
  if (lat.gamma) out += `_cell_angle_gamma ${lat.gamma}\n`;
  out += `_symmetry_space_group_name_H-M 'P 1'\n`;
  out += `loop_\n_atom_site_type_symbol\n_atom_site_fract_x\n_atom_site_fract_y\n_atom_site_fract_z\n`;
  const matrix = latticeToMatrix(lattice);
  const inv = matrix ? invertMatrix(matrix) : null;
  for (const atom of atoms) {
    let x = atom.position[0], y = atom.position[1], z = atom.position[2];
    if (inv) {
      const f = matVec(inv, atom.position);
      x = f[0]; y = f[1]; z = f[2];
    }
    out += `${atom.element || 'C'} ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}\n`;
  }
  return out;
}

function writePDB(structure) {
  const { atoms } = structure;
  let out = '';
  let i = 1;
  for (const atom of atoms) {
    const e = (atom.element || 'C').padEnd(2);
    out += `ATOM  ${String(i).padStart(5)}  ${e}   RES A   1    `;
    out += `${atom.position[0].toFixed(3).padStart(8)}${atom.position[1].toFixed(3).padStart(8)}${atom.position[2].toFixed(3).padStart(8)}`;
    out += `  1.00  0.00           ${e}\n`;
    i++;
  }
  out += 'END\n';
  return out;
}

function writeStructure(structure, format) {
  format = (format || '').toLowerCase();
  if (format === 'xyz') return writeXYZ(structure);
  if (format === 'poscar') return writePOSCAR(structure);
  if (format === 'pdb') return writePDB(structure);
  if (format === 'cif') return writeCIF(structure);
  return writeXYZ(structure);
}

// ── Matrix utilities ───────────────────────────────────────────────

function invertMatrix(m) {
  const [a,b,c,d,e,f,g,h,i] = [m[0][0],m[0][1],m[0][2],m[1][0],m[1][1],m[1][2],m[2][0],m[2][1],m[2][2]];
  const det = a*(e*i-f*h) - b*(d*i-f*g) + c*(d*h-e*g);
  if (Math.abs(det) < 1e-10) return [[1,0,0],[0,1,0],[0,0,1]];
  const inv = 1/det;
  return [
    [(e*i-f*h)*inv, (c*h-b*i)*inv, (b*f-c*e)*inv],
    [(f*g-d*i)*inv, (a*i-c*g)*inv, (c*d-a*f)*inv],
    [(d*h-e*g)*inv, (b*g-a*h)*inv, (a*e-b*d)*inv]
  ];
}

function matVec(m, v) {
  return [
    m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2],
    m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2],
    m[2][0]*v[0] + m[2][1]*v[1] + m[2][2]*v[2],
  ];
}

// ── Structure builder ──────────────────────────────────────────────

function buildStructure(params) {
  const { structure_type, lattice_constant, elements } = params;
  const a = lattice_constant || 5.43;
  const lat = [[a,0,0],[0,a,0],[0,0,a]];
  const elem = (elements && elements[0]) || 'Si';
  let atoms = [];

  if (structure_type === 'sc') {
    atoms = [{ element: elem, position: [0,0,0] }];
  } else if (structure_type === 'bcc') {
    atoms = [
      { element: elem, position: [0,0,0] },
      { element: elem, position: [a/2, a/2, a/2] },
    ];
  } else if (structure_type === 'fcc') {
    atoms = [
      { element: elem, position: [0,0,0] },
      { element: elem, position: [a/2, a/2, 0] },
      { element: elem, position: [a/2, 0, a/2] },
      { element: elem, position: [0, a/2, a/2] },
    ];
  } else if (structure_type === 'diamond') {
    atoms = [
      { element: elem, position: [0,0,0] },
      { element: elem, position: [a/2, a/2, 0] },
      { element: elem, position: [a/2, 0, a/2] },
      { element: elem, position: [0, a/2, a/2] },
      { element: elem, position: [a/4, a/4, a/4] },
      { element: elem, position: [3*a/4, 3*a/4, a/4] },
      { element: elem, position: [3*a/4, a/4, 3*a/4] },
      { element: elem, position: [a/4, 3*a/4, 3*a/4] },
    ];
  } else if (structure_type === 'nacl') {
    const na = elements && elements[0] ? elements[0] : 'Na';
    const cl = elements && elements[1] ? elements[1] : 'Cl';
    atoms = [
      { element: na, position: [0,0,0] },
      { element: na, position: [a/2, a/2, 0] },
      { element: na, position: [a/2, 0, a/2] },
      { element: na, position: [0, a/2, a/2] },
      { element: cl, position: [a/2, 0, 0] },
      { element: cl, position: [0, a/2, 0] },
      { element: cl, position: [0, 0, a/2] },
      { element: cl, position: [a/2, a/2, a/2] },
    ];
  }

  return {
    atoms,
    lattice: { matrix: lat, a, b: a, c: a, alpha: 90, beta: 90, gamma: 90 },
    is_crystal: true,
    source_format: 'built',
    structure_type,
  };
}

// ── Formula and property helpers ───────────────────────────────────

function computeFormula(atoms) {
  const counts = {};
  for (const a of atoms) {
    counts[a.element] = (counts[a.element] || 0) + 1;
  }
  return Object.entries(counts).map(([e, n]) => `${e}${n > 1 ? n : ''}`).join('');
}

function computeDistances(atoms, maxDist = 3.0) {
  const bonds = [];
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const dx = atoms[i].position[0] - atoms[j].position[0];
      const dy = atoms[i].position[1] - atoms[j].position[1];
      const dz = atoms[i].position[2] - atoms[j].position[2];
      const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (d > 0.1 && d < maxDist) {
        bonds.push({ a: i, b: j, distance: d });
      }
    }
  }
  return bonds;
}

function explainStructure(structure) {
  if (!structure) return '';
  const n = structure.atoms.length;
  const formula = computeFormula(structure.atoms);
  const isCrystal = structure.is_crystal;
  const lat = structure.lattice;
  let text = `This structure contains ${n} atom${n !== 1 ? 's' : ''} with the formula ${formula}. `;
  if (isCrystal && lat) {
    const latStr = lat.a ? `lattice parameters a=${lat.a.toFixed(2)}, b=${(lat.b||lat.a).toFixed(2)}, c=${(lat.c||lat.a).toFixed(2)} Angstroms` : 'a crystal lattice';
    text += `It is a crystalline solid with ${latStr}. The repeating unit cell defines the periodic arrangement of atoms in 3D space.`;
  } else {
    text += `It is a molecule (no periodic crystal lattice). The atoms are arranged in a finite cluster.`;
  }
  return text;
}

// ── Main handler ───────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, file_content, format_in, format_out, build_params, pdb_id } = body;

    let result = {};

    if (action === 'parse') {
      if (!file_content) {
        return Response.json({ error: 'No file content provided for parsing.' }, { status: 400 });
      }
      const structure = parseStructure(file_content, format_in);
      if (!structure.atoms || structure.atoms.length === 0) {
        return Response.json({ error: 'No atoms found in the input structure. Check the file content or input format.' }, { status: 422 });
      }
      // Skip bond computation for very large structures (>500 atoms) to avoid timeouts
      const bonds = structure.atoms.length <= 500 ? computeDistances(structure.atoms) : [];
      result = {
        structure,
        bonds,
        formula: computeFormula(structure.atoms),
        plain_language: explainStructure(structure),
        source: `Parsed from ${structure.source_format.toUpperCase()}`,
        method_note: 'Structure parsed using Suttain structure tools (ASE-compatible)',
      };
    } else if (action === 'convert') {
      if (!file_content) {
        return Response.json({ error: 'No file content provided for conversion.' }, { status: 400 });
      }
      if (!format_out || !['xyz', 'poscar', 'cif', 'pdb'].includes(format_out.toLowerCase())) {
        return Response.json({ error: `Invalid output format: ${format_out}. Supported: XYZ, POSCAR, CIF, PDB.` }, { status: 400 });
      }
      const structure = parseStructure(file_content, format_in);
      if (!structure.atoms || structure.atoms.length === 0) {
        return Response.json({ error: 'No atoms found in the input structure. Check the file content or input format.' }, { status: 422 });
      }
      const output = writeStructure(structure, format_out);
      const inLabel = (format_in || structure.source_format || 'auto').toUpperCase();
      result = {
        structure,
        output_content: output,
        output_format: format_out,
        formula: computeFormula(structure.atoms),
        source: `Converted from ${inLabel} to ${format_out.toUpperCase()}`,
        method_note: 'Format conversion using Suttain structure tools (ASE-compatible)',
      };
    } else if (action === 'build') {
      const structure = buildStructure(build_params);
      const bonds = computeDistances(structure.atoms);
      result = {
        structure,
        bonds,
        formula: computeFormula(structure.atoms),
        plain_language: explainStructure(structure),
        source: `Built: ${build_params.structure_type} structure`,
        method_note: 'Structure built from lattice parameters using Suttain structure tools',
      };
    } else if (action === 'rcsb_lookup') {
      const id = (pdb_id || '').trim().toUpperCase();
      if (!/^[1-9][A-Z0-9]{3}$/.test(id)) {
        return Response.json({ error: 'Invalid PDB ID. Must be 4 characters starting with a digit (e.g. 1CRN, 4HHB).' }, { status: 400 });
      }
      const metaRes = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${id}`);
      if (!metaRes.ok) {
        return Response.json({ error: `PDB lookup failed: ${metaRes.status}. Check the PDB ID and try again.` }, { status: 404 });
      }
      const metadata = await metaRes.json();
      let pdbText = '';
      try {
        const pdbRes = await fetch(`https://files.rcsb.org/download/${id}.pdb`);
        if (pdbRes.ok) pdbText = await pdbRes.text();
      } catch (e) {
        // PDB file download failed, but metadata is still valid
      }
      const structure = pdbText ? parseStructure(pdbText, 'pdb') : null;
      const bonds = structure ? computeDistances(structure.atoms) : [];
      result = {
        pdbId: id,
        structure,
        bonds,
        formula: structure ? computeFormula(structure.atoms) : 'N/A',
        plain_language: structure ? explainStructure(structure) : '',
        output_content: pdbText,
        output_format: 'pdb',
        metadata: {
          title: metadata.struct?.title || 'N/A',
          resolution: metadata.rcsb_entry_info?.resolution_combined?.[0] || null,
          methods: Array.isArray(metadata.rcsb_entry_info?.experimental_method)
            ? metadata.rcsb_entry_info.experimental_method
            : (metadata.rcsb_entry_info?.experimental_method ? [metadata.rcsb_entry_info.experimental_method] : []),
          organism: metadata.rcsb_entry_info?.source_organism_taxonomy_names?.[0] || 'N/A',
        },
        source: `RCSB PDB: ${id}`,
        method_note: 'Fetched from RCSB Protein Data Bank',
      };
    } else {
      return Response.json({ error: 'Unknown action. Use parse, convert, build, or rcsb_lookup.' }, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('structureTools error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});