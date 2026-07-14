const PROTEIN_IMG = 'https://media.base44.com/images/public/688eaf737ea3b621021f8bac/119b64178_generated_image.png';
const MOLECULE_IMG = 'https://media.base44.com/images/public/688eaf737ea3b621021f8bac/f815899e4_generated_image.png';
const CRYSTAL_IMG = 'https://media.base44.com/images/public/688eaf737ea3b621021f8bac/4e9da82fb_generated_image.png';
const HAZARD_IMG = 'https://media.base44.com/images/public/688eaf737ea3b621021f8bac/7df9e2e92_generated_image.png';

export const SINGLE_RUN_IMG = 'https://media.base44.com/images/public/688eaf737ea3b621021f8bac/702253f3d_generated_image.png';
export const BATCH_IMG = 'https://media.base44.com/images/public/688eaf737ea3b621021f8bac/eca99d64d_generated_image.png';
export const PIPELINE_IMG = 'https://media.base44.com/images/public/688eaf737ea3b621021f8bac/8e8285f86_generated_image.png';

export const USE_CASES = {
  proteins: {
    label: 'Proteins',
    image: PROTEIN_IMG,
    title: 'Protein Structure and Analysis',
    subtitle: 'Predict, visualize, and characterize protein structures from sequence to property',
    actions: [
      { label: 'Predict protein structure', detail: 'AlphaFold via EBI', source: 'AlphaFold EBI', sourceType: 'api', tier: 'free', route: '/StructuralBiology' },
      { label: 'Explore and visualize 3D structures', detail: 'RCSB PDB', source: 'RCSB PDB', sourceType: 'database', tier: 'free', route: '/MoleculeAnalysis' },
      { label: 'Analyze protein-ligand binding potential', detail: 'Binding site detection and docking', source: 'Computed in-browser', sourceType: 'computed', tier: 'free', route: '/StructuralBiology' },
      { label: 'Assess developability properties', detail: 'Surface charge, hydrophobicity, stability', source: 'Computed in-browser', sourceType: 'computed', tier: 'pro', route: '/StructuralBiology' },
    ],
  },
  small_molecules: {
    label: 'Small Molecules',
    image: MOLECULE_IMG,
    title: 'Molecular Intelligence and Computation',
    subtitle: 'Look up, compute, and compare small molecule properties and descriptors',
    actions: [
      { label: 'Look up compounds', detail: 'PubChem, ChEMBL', source: 'PubChem / ChEMBL', sourceType: 'database', tier: 'free', route: '/MoleculeAnalysis' },
      { label: 'Compute molecular properties and descriptors', detail: 'MW, logP, TPSA, drug-likeness', source: 'Computed in-browser', sourceType: 'computed', tier: 'free', route: '/MoleculeAnalysis' },
      { label: 'Run semi-empirical calculations', detail: 'GFN2-xTB, PM7', source: 'Computed in-browser via GFN2-xTB', sourceType: 'computed', tier: 'free', route: '/ComputationalSimulation' },
      { label: 'Compare compounds side by side', detail: 'Property delta highlighting', source: 'Computed in-browser', sourceType: 'computed', tier: 'free', route: '/ChemicalComparison' },
    ],
  },
  materials: {
    label: 'Materials',
    image: CRYSTAL_IMG,
    title: 'Materials Structure and Property Analysis',
    subtitle: 'Build, inspect, and generate inputs for materials science simulations',
    actions: [
      { label: 'Build and inspect structures', detail: 'ASE, pymatgen concepts', source: 'Computed in-browser', sourceType: 'computed', tier: 'free', route: '/ComputationalSimulation' },
      { label: 'Query material properties', detail: 'Materials Project style', source: 'Materials Project', sourceType: 'database', tier: 'free', route: '/ComputationalSimulation' },
      { label: 'Generate input files for LAMMPS', detail: 'Classical molecular dynamics', source: 'Generated input file for external run', sourceType: 'external', tier: 'pro', route: '/SimulationEngine' },
      { label: 'Generate input files for Quantum ESPRESSO', detail: 'DFT plane-wave', source: 'Generated input file for external run', sourceType: 'external', tier: 'pro', route: '/SimulationEngine' },
      { label: 'Generate input files for GROMACS', detail: 'Biomolecular MD', source: 'Generated input file for external run', sourceType: 'external', tier: 'pro', route: '/SimulationEngine' },
    ],
  },
  hazard_safety: {
    label: 'Hazard & Safety',
    image: HAZARD_IMG,
    title: 'Chemical Hazard Prediction',
    subtitle: 'Run validated hazard classification on any compound with full source traceability',
    actions: [
      { label: 'Run Hazard Prediction Engine', detail: '/v1/hazard-score endpoint', source: 'EPA CompTox / ECHA / GHS', sourceType: 'api', tier: 'free', route: '/HazardEngine' },
      { label: 'Binary hazard classification', detail: 'Hazardous or likely safe', source: 'Calibrated model', sourceType: 'computed', tier: 'free', route: '/HazardEngine' },
      { label: 'Calibrated confidence score', detail: 'Per-prediction uncertainty', source: 'Calibrated model', sourceType: 'computed', tier: 'free', route: '/HazardEngine' },
      { label: 'Hazard categories and GHS codes', detail: 'Irritant, endocrine disruptor, sensitizer, and more', source: 'EPA CompTox / ECHA / GHS', sourceType: 'database', tier: 'free', route: '/HazardEngine' },
    ],
  },
};

export const USE_CASE_ORDER = ['proteins', 'small_molecules', 'materials', 'hazard_safety'];