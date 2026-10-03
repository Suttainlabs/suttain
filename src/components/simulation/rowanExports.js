export const elements = 'X H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
export function xyzFile(molecule) {
  if (!molecule?.atoms?.length) return '';
  return `${molecule.atoms.length}\nRowan computed geometry; coordinates in angstrom\n${molecule.atoms.map(a => `${elements[a.atomic_number]} ${a.position.map(v => v.toFixed(10)).join(' ')}`).join('\n')}\n`;
}
export function sdfFile(molecule,smiles) {
  if (!molecule?.atoms?.length) return '';
  const pad = (v,n) => String(v).padStart(n,' ');
  // stjames does not supply connectivity: export coordinates without guessing bonds.
  const atoms = molecule.atoms.map(a => `${a.position.map(v => pad(v.toFixed(4),10)).join('')} ${elements[a.atomic_number].padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`).join('\n');
  return `Rowan computed geometry\n  Suttain          3D\nCoordinates only; connectivity not inferred\n${pad(molecule.atoms.length,3)}  0  0  0  0  0            999 V2000\n${atoms}\nM  END\n>  <TOTAL_CHARGE>\n${molecule.charge ?? ''}\n\n>  <MULTIPLICITY>\n${molecule.multiplicity ?? ''}\n\n>  <SMILES>\n${smiles || ''}\n\n$$$$\n`;
}
export function downloadRowan(text,extension,id) {
  const url = URL.createObjectURL(new Blob([text],{type:extension === 'json' ? 'application/json' : extension === 'sdf' ? 'chemical/x-mdl-sdfile' : 'text/plain'}));
  const link = document.createElement('a');link.href=url;link.download=`rowan-${id || 'results'}.${extension}`;document.body.appendChild(link);link.click();link.remove();setTimeout(() => URL.revokeObjectURL(url),1000);
}