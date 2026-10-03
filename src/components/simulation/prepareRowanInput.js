const elements = 'X H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
export default async function prepareRowanInput(inputs) {
  const raw = String(inputs.molecule || inputs.compound || inputs.ligand || inputs.system || '').trim();
  if (!raw || raw.length > 24000) throw new Error('Enter SMILES, a compound name, or an XYZ file with at most 120 atoms.');
  if (/^\d+\s*\n/.test(raw)) {
    const lines = raw.split(/\r?\n/), count = Number(lines[0]);
    if (count < 1 || count > 120 || lines.length < count + 2) throw new Error('Invalid XYZ atom count (1–120 atoms supported).');
    const atoms = lines.slice(2, count + 2).map(line => { const [element, ...coords] = line.trim().split(/\s+/); const atomic_number = /^\d+$/.test(element) ? Number(element) : elements.indexOf(element); const position = coords.map(Number); if (atomic_number < 1 || atomic_number > 118 || position.length !== 3 || position.some(v => !Number.isFinite(v))) throw new Error('Invalid XYZ element or coordinates.'); return {atomic_number,position}; });
    return {molecule:{atoms,charge:Number(inputs.charge ?? 0),multiplicity:Number(inputs.multiplicity ?? 1)}};
  }
  const explicit = raw.match(/\(SMILES:\s*(.+)\)\s*$/i)?.[1] || raw.match(/^SMILES:\s*(.+)$/i)?.[1];
  if (explicit || /^[BCNOPSFIbcnops0-9@+\-\[\]().=#/\\]+$/.test(raw)) return {smiles:explicit || raw, ...(inputs.charge !== undefined ? {charge:Number(inputs.charge)} : {}), multiplicity:Number(inputs.multiplicity ?? 1)};
  const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(raw)}/property/IsomericSMILES/JSON`, {signal:AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error('No compound match was found. Select a PubChem result, enter SMILES, or upload XYZ coordinates.');
  const compound = (await response.json()).PropertyTable?.Properties?.[0];
  const smiles = compound?.SMILES || compound?.IsomericSMILES || compound?.ConnectivitySMILES || compound?.CanonicalSMILES;
  if (!smiles) throw new Error('This compound has no usable SMILES. Upload XYZ coordinates.');
  return {smiles, ...(inputs.charge !== undefined ? {charge:Number(inputs.charge)} : {}),multiplicity:Number(inputs.multiplicity ?? 1)};
}