export const elements = 'X H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
export function invalid(message) { const error = new Error(message); error.status = 400; throw error; }
export function validateMolecule(molecule) {
  if (!molecule || !Array.isArray(molecule.atoms) || molecule.atoms.length < 1 || molecule.atoms.length > 120) invalid('Provide a small molecule with 1–120 atoms.');
  const charge = Number(molecule.charge ?? 0), multiplicity = Number(molecule.multiplicity ?? 1);
  if (!Number.isInteger(charge) || Math.abs(charge) > 10 || !Number.isInteger(multiplicity) || multiplicity < 1 || multiplicity > 7) invalid('Invalid molecular charge or spin multiplicity.');
  const atoms = molecule.atoms.map(atom => {
    if (!Number.isInteger(atom.atomic_number) || atom.atomic_number < 1 || atom.atomic_number > 118 || !Array.isArray(atom.position) || atom.position.length !== 3 || atom.position.some(v => !Number.isFinite(v) || Math.abs(v) > 10000)) invalid('Invalid atom or Cartesian coordinates.');
    return { atomic_number: atom.atomic_number, position: atom.position };
  });
  const electrons = atoms.reduce((n, a) => n + a.atomic_number, 0) - charge;
  if (electrons < 1 || (electrons - multiplicity + 1) % 2 !== 0) invalid('Charge and spin multiplicity do not match the electron count.');
  return { atoms, charge, multiplicity };
}
export async function resolveRowanMolecule(input) {
  if (input.molecule) return validateMolecule(input.molecule);
  const smiles = String(input.smiles || '').trim();
  if (!smiles || smiles.length > 2000 || /[\s<>\x00-\x1f]/.test(smiles)) invalid('Provide valid SMILES, a compound name, or an XYZ coordinate file.');
  const lookup = await fetch('https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/cids/JSON', { method: 'POST', body: new URLSearchParams({ smiles }), signal: AbortSignal.timeout(15000) });
  if (!lookup.ok) invalid('This SMILES has no PubChem reference geometry. Upload XYZ coordinates to run it.');
  const cid = (await lookup.json()).IdentifierList?.CID?.[0];
  if (!Number.isInteger(cid)) invalid('No reference molecule was found. Upload XYZ coordinates.');
  const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/JSON?record_type=3d`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) invalid('No 3D conformer is available. Upload XYZ coordinates; 2D structures are not used for compute.');
  const record = (await response.json()).PC_Compounds?.[0], coordinates = record?.coords?.[0], conformer = coordinates?.conformers?.[0];
  if (!record || !conformer?.z || !coordinates?.aid) invalid('The reference molecule has no 3D coordinates. Upload XYZ coordinates.');
  const byId = new Map(coordinates.aid.map((id, i) => [id, [conformer.x[i], conformer.y[i], conformer.z[i]]]));
  return validateMolecule({ charge: input.charge ?? record.charge ?? 0, multiplicity: input.multiplicity ?? 1, atoms: record.atoms.aid.map((id, i) => ({ atomic_number: record.atoms.element[i], position: byId.get(id) })) });
}
export function mapRowanSettings(simType, inputs, requestedEngine, environment = {}) {
  if (!['dft', 'quantum_mechanics'].includes(simType)) return { unsupported: `${simType.replace(/_/g, ' ')} is not yet supported by this Rowan compute integration. No calculation was submitted.` };
  const tasks = { 'Geometry optimization': ['optimize','energy','charge','dipole'], 'Single-point energy': ['energy','charge','dipole'], 'Frequency analysis (IR/Raman)': ['optimize','frequencies','energy','charge','dipole'], 'Population analysis': ['energy','charge','dipole'], 'Hessian': ['hessian','energy'], 'Transition state (TS) optimization': ['optimize_ts','energy','charge','dipole'] };
  const taskLabel = inputs.task || (inputs.properties === 'Dipole moment' ? 'Single-point energy' : inputs.properties);
  if (!tasks[taskLabel]) return { unsupported: `${taskLabel || 'Requested task'} is not supported by the basic-calculation pipeline. No substitute calculation was submitted.` };
  const methods = { B3LYP:'b3lyp', PBE:'pbe', PBE0:'pbe0', 'M06-2X':'m062x', 'M06-L':'m06l', 'CAM-B3LYP':'camb3lyp', BP86:'bp86', TPSSh:'tpssh', HF:'hf', r2SCAN:'r2scan', 'GFN2-xTB':'gfn2_xtb' };
  const method = methods[inputs.functional || inputs.method];
  if (!method) return { unsupported: 'The selected electronic-structure method is not mapped to Rowan. Choose a supported method; no different method was substituted.' };
  const engine = method === 'gfn2_xtb' ? 'xtb' : requestedEngine === 'Psi4' ? 'psi4' : 'gpu4pyscf';
  const settings = { method, engine, mode:'auto', tasks:tasks[taskLabel], opt_settings:{ max_steps:100 } };
  if (method !== 'gfn2_xtb') settings.basis_set = { name: String(inputs.basis_set || 'def2-SVP') };
  const solvent = environment.solvent;
  if (solvent && !['vacuum', 'none', 'gas', 'gas_phase', 'Gas phase'].includes(solvent)) {
    const aliases = { DMSO:'dimethylsulfoxide', dmso:'dimethylsulfoxide' };
    const value = aliases[solvent] || solvent;
    if (!['water','ethanol','methanol','acetone','acetonitrile','benzene','toluene','dimethylsulfoxide','chloroform','hexane'].includes(value)) invalid('This solvent is not supported in the Rowan mapping. Choose a listed solvent or vacuum.');
    settings.solvent_settings = { solvent:value, model: engine === 'xtb' ? 'alpb' : 'cpcm' };
  }
  return { settings, taskLabel, requestedEngine };
}