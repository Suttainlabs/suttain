export const PRESETS = [
  {
    id: 'catalyst-ts-search', label: 'Catalytic cycle transition-state search', category: 'catalysis', tag: 'Enterprise', tagColor: 'bg-secondary text-secondary-foreground', simType: 'dft', engine: 'ORCA',
    description: 'Transition-state search, IRC verification and coupled-cluster energy refinement with ORCA.',
    fields: { molecule: 'Pd-catalyzed Buchwald-Hartwig amination catalytic cycle', functional: 'wB97X-D', basis_set: 'def2-TZVP', task: 'transition-state search, IRC, DLPNO-CCSD(T) single-point energy refinement' },
  },
  {
    id: 'qmmm-enzyme-mechanism', label: 'QM/MM enzyme catalysis mechanism', category: 'biomolecular', tag: 'Enterprise', tagColor: 'bg-secondary text-secondary-foreground', simType: 'quantum_mechanics', engine: 'Q-Chem',
    description: 'Active-site reaction pathway, energy barrier and charge transfer with embedded QM/MM.',
    fields: { system: 'Citrate synthase active site with oxaloacetate substrate, QM region = catalytic residues + substrate', method: 'TDDFT/CAM-B3LYP (QM region) + AMBER ff14SB (MM region)', properties: 'Reaction pathway, energy barrier, charge transfer', environment: 'QM/MM embedding, physiological pH 7.4' },
  },
  {
    id: 'cathode-band-structure', label: 'Battery cathode band structure', category: 'solid_state', tag: 'Enterprise', tagColor: 'bg-secondary text-secondary-foreground', simType: 'materials', engine: 'VASP',
    description: 'Periodic HSE06 band structure and density of states for a layered battery cathode.',
    fields: { material: 'LiCoO2 layered cathode', property: 'Band structure + DOS', kpoints: '8x8x8', functional: 'HSE06' },
  },
];