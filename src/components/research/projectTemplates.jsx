// Reusable research project templates.
// Each template pre-populates standard fields and initial settings
// when a user starts a new ChemicalProject.

export const PROJECT_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with no pre-filled fields.',
    project_type: 'custom',
    color: '#6B3FA0',
    tags: [],
    notes: '',
    icon: 'FilePlus',
  },
  {
    id: 'formulation',
    name: 'Product Formulation',
    description: 'Develop and optimize a new chemical or cosmetic formula with safety and compliance scoring.',
    project_type: 'formulation',
    color: '#0D9E8E',
    tags: ['formulation', 'safety', 'compliance'],
    notes: 'Objective: Develop a new formula with target pH, shelf life, and safety profile. Track ingredient percentages and run sustainability scoring on each iteration.',
    icon: 'FlaskConical',
  },
  {
    id: 'toxicology',
    name: 'Toxicology Screening',
    description: 'Assess toxicity profiles, LD50 data, and GHS classifications across a set of candidate compounds.',
    project_type: 'toxicology',
    color: '#DC2626',
    tags: ['toxicology', 'ghs', 'ld50', 'safety'],
    notes: 'Objective: Build a comparative toxicology profile for candidate compounds. Record oral/dermal LD50, carcinogenicity, mutagenicity, and reproductive toxicity data.',
    icon: 'ShieldAlert',
  },
  {
    id: 'computational',
    name: 'Computational Simulation',
    description: 'Run DFT, molecular dynamics, or quantum mechanics simulations on target molecules.',
    project_type: 'computational',
    color: '#6366F1',
    tags: ['simulation', 'dft', 'md', 'qm'],
    notes: 'Objective: Configure and run computational chemistry simulations. Track engine (GROMACS/ORCA), forcefield, solvation model, and analysis parameters for each run.',
    icon: 'Cpu',
  },
  {
    id: 'regulatory',
    name: 'Regulatory Compliance',
    description: 'Check ingredients and formulas against EU, FDA, Health Canada, and REACH requirements.',
    project_type: 'regulatory',
    color: '#D4900A',
    tags: ['regulatory', 'eu', 'fda', 'reach', 'compliance'],
    notes: 'Objective: Audit formulas for global regulatory compliance. Flag restricted or banned substances and generate submission-ready compliance reports.',
    icon: 'Scale',
  },
  {
    id: 'materials',
    name: 'Materials Research',
    description: 'Investigate material properties, structure-activity relationships, and novel compounds.',
    project_type: 'materials',
    color: '#0891B2',
    tags: ['materials', 'structure', 'properties'],
    notes: 'Objective: Characterize material properties and structure-activity relationships. Document synthesis routes, crystal structure, and measured physical properties.',
    icon: 'Atom',
  },
  {
    id: 'environmental',
    name: 'Environmental Impact',
    description: 'Assess biodegradability, bioaccumulation, aquatic toxicity, and carbon footprint.',
    project_type: 'environmental',
    color: '#16A34A',
    tags: ['environmental', 'biodegradability', 'eco', 'carbon'],
    notes: 'Objective: Evaluate the environmental fate and impact of target compounds. Record biodegradability, bioaccumulation factor, aquatic toxicity, and global warming potential.',
    icon: 'Leaf',
  },
  {
    id: 'analytical',
    name: 'Analytical Characterization',
    description: 'Compile and interpret spectral data (IR, NMR, MS, UV-Vis) for compound identification.',
    project_type: 'analytical',
    color: '#9333EA',
    tags: ['analytical', 'spectroscopy', 'nmr', 'ir', 'ms'],
    notes: 'Objective: Assemble and interpret analytical data for compound identification and purity verification. Link spectral data URLs and record key peaks/signals.',
    icon: 'Microscope',
  },
];

export function getTemplateById(id) {
  return PROJECT_TEMPLATES.find(t => t.id === id) || PROJECT_TEMPLATES[0];
}