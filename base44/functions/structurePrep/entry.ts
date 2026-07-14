import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

function parsePdbAtoms(pdbText) {
  const atoms = [];
  const lines = pdbText.split('\n');
  for (const line of lines) {
    if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
      atoms.push({
        record: line.substring(0, 6).trim(),
        serial: parseInt(line.substring(6, 11)) || 0,
        name: line.substring(12, 16).trim(),
        altLoc: line.substring(16, 17).trim(),
        resName: line.substring(17, 20).trim(),
        chainId: line.substring(21, 22).trim(),
        resSeq: parseInt(line.substring(22, 26)) || 0,
        iCode: line.substring(26, 27).trim(),
        x: parseFloat(line.substring(30, 38)),
        y: parseFloat(line.substring(38, 46)),
        z: parseFloat(line.substring(46, 54)),
        element: line.substring(76, 78).trim() || line.substring(12, 14).trim().replace(/[^A-Za-z]/g, '')
      });
    }
  }
  return atoms;
}

function atomsToPdb(atoms) {
  return atoms.map(a => {
    const record = (a.record || 'ATOM').padEnd(6);
    const serial = String(a.serial).padStart(5);
    const name = a.name.padEnd(4);
    const altLoc = (a.altLoc || '').padEnd(1);
    const resName = a.resName.padEnd(3);
    const chainId = (a.chainId || 'A').padEnd(1);
    const resSeq = String(a.resSeq).padStart(4);
    const iCode = (a.iCode || '').padEnd(1);
    const x = a.x.toFixed(3).padStart(8);
    const y = a.y.toFixed(3).padStart(8);
    const z = a.z.toFixed(3).padStart(8);
    const element = (a.element || '').padEnd(2);
    return `${record}${serial} ${name}${altLoc}${resName} ${chainId}${resSeq}${iCode}    ${x}${y}${z}  1.00  0.00          ${element}`;
  }).join('\n') + '\nEND\n';
}

function computeBoundingBox(atoms) {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const a of atoms) {
    if (a.x < minX) minX = a.x;
    if (a.y < minY) minY = a.y;
    if (a.z < minZ) minZ = a.z;
    if (a.x > maxX) maxX = a.x;
    if (a.y > maxY) maxY = a.y;
    if (a.z > maxZ) maxZ = a.z;
  }
  return { minX, minY, minZ, maxX, maxY, maxZ };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, pdb_text, residues, padding, start } = body;

    if (!action) return Response.json({ error: 'action is required' }, { status: 400 });
    if (!pdb_text && action !== 'test') return Response.json({ error: 'pdb_text is required' }, { status: 400 });

    const atoms = parsePdbAtoms(pdb_text);
    if (atoms.length === 0) return Response.json({ error: 'No ATOM/HETATM records found in PDB text.' }, { status: 400 });

    const pad = typeof padding === 'number' ? padding : 4.0;

    if (action === 'grid_params') {
      let targetAtoms = atoms;
      if (residues && Array.isArray(residues) && residues.length > 0) {
        const resSet = new Set(residues.map(r => parseInt(r)));
        targetAtoms = atoms.filter(a => resSet.has(a.resSeq));
        if (targetAtoms.length === 0) targetAtoms = atoms;
      }
      const bb = computeBoundingBox(targetAtoms);
      const center = { x: (bb.minX + bb.maxX) / 2, y: (bb.minY + bb.maxY) / 2, z: (bb.minZ + bb.maxZ) / 2 };
      const size = { x: (bb.maxX - bb.minX) + 2 * pad, y: (bb.maxY - bb.minY) + 2 * pad, z: (bb.maxZ - bb.minZ) + 2 * pad };
      return Response.json({
        source: 'Method: in-browser calc',
        center: center,
        size: size,
        padding: pad,
        ngrid: { x: Math.ceil(size.x), y: Math.ceil(size.y), z: Math.ceil(size.z) },
        residues_used: residues || 'all'
      });
    }

    if (action === 'ligand_grid_params') {
      const ligandAtoms = atoms.filter(a => a.record === 'HETATM');
      if (ligandAtoms.length === 0) return Response.json({ error: 'No HETATM (ligand) records found.' }, { status: 400 });
      const bb = computeBoundingBox(ligandAtoms);
      const center = { x: (bb.minX + bb.maxX) / 2, y: (bb.minY + bb.maxY) / 2, z: (bb.minZ + bb.maxZ) / 2 };
      const size = { x: (bb.maxX - bb.minX) + 2 * pad, y: (bb.maxY - bb.minY) + 2 * pad, z: (bb.maxZ - bb.minZ) + 2 * pad };
      return Response.json({
        source: 'Method: in-browser calc',
        center, size, padding: pad,
        ligand_atoms: ligandAtoms.length
      });
    }

    if (action === 'missing_residues') {
      const chains = {};
      for (const a of atoms) {
        if (!chains[a.chainId]) chains[a.chainId] = new Set();
        chains[a.chainId].add(a.resSeq);
      }
      const missing = [];
      for (const [chain, resSet] of Object.entries(chains)) {
        const sorted = [...resSet].sort((a, b) => a - b);
        const min = sorted[0], max = sorted[sorted.length - 1];
        for (let i = min; i <= max; i++) {
          if (!resSet.has(i)) missing.push({ chain, resSeq: i });
        }
      }
      return Response.json({
        source: 'Method: in-browser calc',
        missing_residues: missing,
        total_missing: missing.length
      });
    }

    if (action === 'split') {
      const proteinAtoms = atoms.filter(a => a.record === 'ATOM');
      const ligandAtoms = atoms.filter(a => a.record === 'HETATM');
      const protein_pdb = atomsToPdb(proteinAtoms);
      const ligand_pdb = atomsToPdb(ligandAtoms);
      return Response.json({
        source: 'Method: in-browser calc',
        protein_atoms: proteinAtoms.length,
        ligand_atoms: ligandAtoms.length,
        protein_pdb,
        ligand_pdb
      });
    }

    if (action === 'renumber') {
      const startNum = typeof start === 'number' ? start : 1;
      const chains = {};
      for (const a of atoms) {
        if (!chains[a.chainId]) chains[a.chainId] = [];
        chains[a.chainId].push(a);
      }
      let currentNum = startNum;
      const renumbered = [];
      for (const [chain, chainAtoms] of Object.entries(chains)) {
        const seenRes = new Set();
        let offset = 0;
        for (const a of chainAtoms) {
          if (!seenRes.has(a.resSeq)) {
            offset++;
            seenRes.add(a.resSeq);
          }
          a.resSeq = startNum + offset - 1;
          renumbered.push(a);
        }
      }
      return Response.json({
        source: 'Method: in-browser calc',
        start_residue: startNum,
        pdb_text: atomsToPdb(renumbered)
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});