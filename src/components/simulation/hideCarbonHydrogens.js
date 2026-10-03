// Change display styles only: never alter coordinates or molecular connectivity.
export default function hideCarbonHydrogens(viewer) {
  const atoms = viewer.selectedAtoms({});
  const lookup = new Map(atoms.map(atom => [`${atom.model}:${atom.index}`, atom]));
  const hidden = new Set(atoms.filter(atom => atom.elem === 'H' && atom.bonds?.some(index => lookup.get(`${atom.model}:${index}`)?.elem === 'C')));
  // An empty representation hides both H atoms and their bonds from either endpoint.
  viewer.setStyle({ predicate: atom => hidden.has(atom) }, {});
}