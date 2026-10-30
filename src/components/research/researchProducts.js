import { Crosshair, Gauge, Microscope } from 'lucide-react';

// Single source of truth for the three Suttain Research products and how they hand off to each other.
// Keep claims here in line with what each page actually does.
export const RESEARCH_PRODUCTS = [
  {
    id: 'drug', step: '01', verb: 'Discover', name: 'Drug Design', route: '/DrugDesign', icon: Microscope,
    question: 'Which target, and which molecules are worth a closer look?',
    summary: 'Search biological targets in RCSB PDB, ChEMBL and UniProt, screen candidate molecules against known ligands, and keep a private shortlist.',
    inputs: ['Target name, gene or UniProt / PDB ID', 'Library and screening method'],
    outputs: ['Live target records', 'Ranked candidates with SMILES and descriptors', 'Private shortlist (CSV export)'],
    engines: ['RCSB PDB', 'ChEMBL', 'UniProt'],
    evidence: 'Live database records. Candidate ranks are similarity-based screening, not binding affinity.',
    handoffs: [{ to: 'binding', why: 'Send shortlisted SMILES for computed binding and ADME' }],
  },
  {
    id: 'binding', step: '02', verb: 'Predict', name: 'Binding & ADME', route: '/BindingAndADME', icon: Crosshair,
    question: 'Does it bind, and does it behave like a drug?',
    summary: 'Predict protein–ligand complex structure and binding affinity, and ADME properties for up to 128 molecules, on hosted engines. Suttain recommends the engine for your goal and falls back if one is unavailable.',
    inputs: ['Protein sequence + ligand SMILES (binding)', '1–128 SMILES, one per line (ADME)'],
    outputs: ['Engine-reported affinity and confidence', 'Per-molecule ADME properties', 'Model name and citation'],
    engines: ['Rowan', 'Boltz API', 'Tamarind Bio'],
    evidence: 'Computed by the engine. Machine-learning predictions, not experimental measurements.',
    handoffs: [{ to: 'atomistic', why: 'Run quantum chemistry on the most promising ligand' }],
  },
  {
    id: 'atomistic', step: '03', verb: 'Calculate', name: 'Atomistic Simulation', route: '/AtomisticSimulation', icon: Gauge,
    question: 'What does the molecule look like at the electronic level?',
    summary: 'Run small-molecule quantum chemistry on Rowan (geometry, energies, frequencies and more), or prepare input files for ORCA, Gaussian, GROMACS, OpenMM and CP2K.',
    inputs: ['Molecule name, SMILES or formula', 'Method, basis set and task'],
    outputs: ['Computed geometry and properties (hosted runs)', 'Engine-specific input files', 'Citations for every engine'],
    engines: ['Rowan (hosted)', 'ORCA', 'Gaussian', 'GROMACS', 'OpenMM', 'CP2K'],
    evidence: 'Hosted runs are computed. Input files are prepared for you to run elsewhere.',
    handoffs: [{ to: 'binding', why: 'Check binding or ADME for the same molecule' }],
  },
];

export const productById = id => RESEARCH_PRODUCTS.find(p => p.id === id);

// Build hand-off URLs that pre-fill the next tool.
export const handoffUrl = {
  bindingAdme: (smilesList = []) => `/BindingAndADME?task=adme&smiles=${encodeURIComponent(smilesList.filter(Boolean).slice(0, 128).join('\n'))}`,
  bindingLigand: (smiles, sequence = '') => `/BindingAndADME?task=binding&ligand=${encodeURIComponent(smiles || '')}${sequence ? `&sequence=${encodeURIComponent(sequence)}` : ''}`,
  atomistic: (molecule, type = 'dft') => `/SimulationRunner?type=${type}&domain=Chemistry&molecule=${encodeURIComponent(molecule || '')}`,
};
