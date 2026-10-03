import {elements, invalid, validateMolecule, resolveRowanMolecule} from './rowanInput.ts';
export default async function inputGeometry(inputs) {
  const raw=String(inputs.molecule || inputs.compound || inputs.system || '').trim();
  if(!raw || raw.length>24000) invalid('Enter a compound name, SMILES, or XYZ coordinates (up to 120 atoms) to generate molecular input files.');
  let molecule;
  if(/^\d+\s*\n/.test(raw)) {
    const lines=raw.split(/\r?\n/),count=Number(lines[0]);
    if(count<1 || count>120 || lines.length<count+2) invalid('Invalid XYZ atom count or missing coordinates.');
    molecule=validateMolecule({charge:Number(inputs.charge ?? 0),multiplicity:Number(inputs.multiplicity ?? 1),atoms:lines.slice(2,count+2).map(line => {
      const [symbol,...coords]=line.trim().split(/\s+/);
      return {atomic_number:/^\d+$/.test(symbol) ? Number(symbol) : elements.indexOf(symbol),position:coords.map(Number)};
    })});
  } else {
    const explicit=raw.match(/\(SMILES:\s*(.+)\)\s*$/i)?.[1] || raw.match(/^SMILES:\s*(.+)$/i)?.[1];
    let smiles=explicit || (/^[BCNOPSFIbcnops0-9@+\-\[\]().=#/\\]+$/.test(raw) ? raw : null);
    if(!smiles) {
      const response=await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(raw)}/property/IsomericSMILES/JSON`,{signal:AbortSignal.timeout(15000)});
      if(!response.ok) invalid('No compound match was found. Supply explicit SMILES or XYZ coordinates.');
      const compound=(await response.json()).PropertyTable?.Properties?.[0];
      smiles=compound?.SMILES || compound?.IsomericSMILES || compound?.ConnectivitySMILES || compound?.CanonicalSMILES;
    }
    molecule=await resolveRowanMolecule({smiles,...(inputs.charge !== undefined ? {charge:Number(inputs.charge)} : {}),multiplicity:Number(inputs.multiplicity ?? 1)});
  }
  return {...molecule,coordinates:molecule.atoms.map(atom => `${elements[atom.atomic_number]} ${atom.position.map(v => v.toFixed(8)).join(' ')}`).join('\n')};
}