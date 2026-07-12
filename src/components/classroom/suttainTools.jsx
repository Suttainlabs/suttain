import { TestTube, Atom, QrCode, BarChart2, Cpu, FileText, Microscope, FlaskConical, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export const SUTTAIN_TOOLS = [
  // Consumer tools
  { id: 'simulator', label: 'Chemical Simulator', path: '/Simulator', Icon: TestTube, category: 'consumer', description: 'Test chemical interactions safely before mixing' },
  { id: 'formula_generator', label: 'Formula Generator', path: '/generator', Icon: Atom, category: 'consumer', description: 'Create formulas with AI assistance and safety scoring' },
  { id: 'barcode_scanner', label: 'SuttainScan', path: '/BarcodeScanner', Icon: QrCode, category: 'consumer', description: 'Scan products for ingredient toxicity analysis' },
  { id: 'carbon_tax', label: 'Carbon Tax Simulator', path: '/CarbonTaxSimulator', Icon: BarChart2, category: 'consumer', description: 'Simulate carbon tax exposure and find greener alternatives' },
  // Research tools
  { id: 'molecule_analysis', label: 'Molecule Analysis', path: '/MoleculeAnalysis', Icon: Atom, category: 'research', description: 'Query compounds for hazard intelligence and 3D structure' },
  { id: 'computational_sim', label: 'Computational Simulation', path: '/ComputationalSimulation', Icon: Cpu, category: 'research', description: 'DFT and semi-empirical simulations with 3D visualization' },
  { id: 'sds_analyzer', label: 'SDS Analyzer', path: '/SDSAnalyzer', Icon: FileText, category: 'research', description: 'Extract hazard data and GHS classifications from SDS sheets' },
  { id: 'structural_biology', label: 'Structural Biology', path: '/StructuralBiology', Icon: Microscope, category: 'research', description: 'AlphaFold-powered protein structure analysis' },
  { id: 'chemical_comparison', label: 'Chemical Comparison', path: '/ChemicalComparison', Icon: FlaskConical, category: 'research', description: 'Compare compounds side-by-side with delta highlighting' },
  { id: 'chemical_library', label: 'Chemical Library', path: '/ChemicalLibrary', Icon: BookOpen, category: 'research', description: 'Browse and manage your chemical database' },
];

export function getToolById(id) {
  return SUTTAIN_TOOLS.find(t => t.id === id);
}

const MODULE_TEMPLATES = {
  chemistry: [
    {
      title: 'Chemical Interaction Analysis',
      description: 'Explore how different chemicals interact when mixed. Use the Chemical Simulator to test combinations safely, then compare properties using the Chemical Comparison tool. Document your findings and predict reaction outcomes.',
      learning_objectives: 'Understand chemical reactivity, identify hazardous combinations, predict reaction outcomes, and apply safety protocols.',
      tool_ids: ['simulator', 'chemical_comparison']
    },
    {
      title: 'Molecular Structure Exploration',
      description: 'Investigate molecular structures and properties. Query compounds by name or SMILES, visualize 3D structures, and analyze physical, toxicological, and environmental properties using the Molecule Analysis and Chemical Library tools.',
      learning_objectives: 'Understand molecular geometry, interpret physical properties, relate structure to function, and navigate chemical databases.',
      tool_ids: ['molecule_analysis', 'chemical_library']
    },
    {
      title: 'Safety and Compliance Review',
      description: 'Analyze safety data sheets and product labels. Upload SDS documents to extract hazard data and GHS classifications. Scan commercial products to identify ingredient hazards and recommend safe handling procedures.',
      learning_objectives: 'Interpret SDS documents, understand GHS classifications, assess product safety, and apply safety protocols.',
      tool_ids: ['sds_analyzer', 'barcode_scanner']
    }
  ],
  biology: [
    {
      title: 'Protein Structure Analysis',
      description: 'Explore protein structures using AlphaFold data. Analyze binding sites, domain reliability, and predict mutation effects. Use the Molecule Analysis tool to investigate related biochemical compounds.',
      learning_objectives: 'Understand protein folding, interpret structural data, predict functional impacts of mutations, and analyze biomolecular interactions.',
      tool_ids: ['structural_biology', 'molecule_analysis']
    },
    {
      title: 'Biochemical Safety Review',
      description: 'Evaluate the safety of biochemicals used in laboratory settings. Review SDS documents for reagents and test chemical interactions using the simulator. Document safety assessments for your lab protocols.',
      learning_objectives: 'Identify biosafety levels, understand chemical hazards in biological contexts, and apply appropriate safety protocols.',
      tool_ids: ['sds_analyzer', 'simulator']
    },
    {
      title: 'Product Ingredient Analysis',
      description: 'Analyze commercial products for their chemical composition and safety profiles. Scan product barcodes, compare ingredients across products, and assess potential biological impacts.',
      learning_objectives: 'Decode ingredient lists, assess product safety, compare alternative products, and understand biological impacts of chemicals.',
      tool_ids: ['barcode_scanner', 'chemical_comparison']
    }
  ],
  biochemistry: [
    {
      title: 'Protein Structure and Molecular Analysis',
      description: 'Explore protein structures using AlphaFold data and analyze molecular properties of biomolecules. Understand how structure relates to biochemical function.',
      learning_objectives: 'Understand protein-ligand interactions, interpret structural data, and analyze molecular properties of biochemical compounds.',
      tool_ids: ['structural_biology', 'molecule_analysis']
    },
    {
      title: 'Biochemical Reaction Lab',
      description: 'Test biochemical reactions and interactions using the Chemical Simulator. Document predicted outcomes and safety assessments for each reaction.',
      learning_objectives: 'Predict reaction outcomes, identify hazards in biochemical reactions, and understand metabolic pathways.',
      tool_ids: ['simulator', 'chemical_comparison']
    },
    {
      title: 'Reagent Safety Data Analysis',
      description: 'Review safety data sheets for biochemical reagents and analyze product formulations for their biochemical implications.',
      learning_objectives: 'Interpret SDS documents for biochemical reagents, understand GHS classifications, and assess formulation safety.',
      tool_ids: ['sds_analyzer', 'barcode_scanner']
    }
  ],
  materials_science: [
    {
      title: 'Crystal Structure Analysis',
      description: 'Investigate molecular and crystal structures. Query compounds, visualize 3D arrangements, and analyze physical properties relevant to materials science.',
      learning_objectives: 'Understand crystal structures, interpret physical properties of materials, and use computational tools for materials research.',
      tool_ids: ['molecule_analysis', 'chemical_library']
    },
    {
      title: 'Materials Simulation Lab',
      description: 'Run computational simulations to predict material properties and behavior. Test chemical interactions relevant to materials synthesis.',
      learning_objectives: 'Apply computational methods to materials science problems and understand chemical interactions in synthesis.',
      tool_ids: ['computational_sim', 'simulator']
    },
    {
      title: 'Materials Safety Assessment',
      description: 'Analyze safety data for materials and chemicals used in synthesis. Review SDS documents for precursor chemicals.',
      learning_objectives: 'Understand hazards of materials synthesis, interpret safety data, and apply appropriate handling protocols.',
      tool_ids: ['sds_analyzer', 'barcode_scanner']
    }
  ],
  environmental_science: [
    {
      title: 'Environmental Chemical Analysis',
      description: 'Analyze chemical interactions in environmental systems and assess sustainability impacts. Use the Carbon Tax Simulator to evaluate environmental costs.',
      learning_objectives: 'Understand environmental chemistry, assess chemical impacts on ecosystems, and evaluate sustainability metrics.',
      tool_ids: ['simulator', 'carbon_tax']
    },
    {
      title: 'Product Sustainability Review',
      description: 'Scan and analyze commercial products for their environmental and safety profiles. Compare ingredients and assess sustainability.',
      learning_objectives: 'Assess product sustainability, understand ingredient environmental impacts, and compare alternative products.',
      tool_ids: ['barcode_scanner', 'chemical_comparison']
    },
    {
      title: 'Environmental Chemical Database',
      description: 'Research chemical compounds and their environmental fate using the chemical library and molecule analysis tools.',
      learning_objectives: 'Understand environmental fate of chemicals, use scientific databases for research, and interpret toxicological data.',
      tool_ids: ['molecule_analysis', 'chemical_library']
    }
  ],
  pharmacology: [
    {
      title: 'Drug Molecule Analysis',
      description: 'Investigate pharmaceutical compounds using molecular analysis tools. Query drug molecules, analyze structures, and assess properties.',
      learning_objectives: 'Understand drug molecular structure, interpret pharmacological properties, and analyze structure-activity relationships.',
      tool_ids: ['molecule_analysis', 'chemical_library']
    },
    {
      title: 'Drug Interaction Simulation',
      description: 'Test drug interactions and chemical compatibility using the simulator. Document predicted outcomes and safety assessments.',
      learning_objectives: 'Predict drug interactions, identify contraindications, and understand pharmacokinetic interactions.',
      tool_ids: ['simulator', 'chemical_comparison']
    },
    {
      title: 'Pharmaceutical Safety Review',
      description: 'Analyze safety data sheets for pharmaceutical compounds and review product formulations for safety compliance.',
      learning_objectives: 'Interpret pharmaceutical SDS documents, understand GHS classifications, and assess drug safety profiles.',
      tool_ids: ['sds_analyzer', 'barcode_scanner']
    }
  ],
  chemical_engineering: [
    {
      title: 'Process Chemistry Simulation',
      description: 'Run computational simulations to model chemical processes. Test reaction conditions and predict outcomes at scale.',
      learning_objectives: 'Apply computational methods to process engineering, optimize reaction conditions, and predict scale-up outcomes.',
      tool_ids: ['computational_sim', 'simulator']
    },
    {
      title: 'Chemical Property Analysis',
      description: 'Investigate molecular and physical properties of process chemicals. Query compounds and compare alternatives.',
      learning_objectives: 'Understand chemical properties relevant to engineering, compare alternative materials, and optimize processes.',
      tool_ids: ['molecule_analysis', 'chemical_comparison']
    },
    {
      title: 'Process Safety Assessment',
      description: 'Review safety data for process chemicals and analyze product formulations for compliance.',
      learning_objectives: 'Interpret SDS documents for industrial chemicals, understand process safety, and apply regulatory compliance.',
      tool_ids: ['sds_analyzer', 'barcode_scanner']
    }
  ],
  _default: [
    {
      title: 'Chemical Interaction Analysis',
      description: 'Explore how different chemicals interact when mixed. Use the simulator to test combinations safely and document your findings.',
      learning_objectives: 'Understand chemical reactivity and identify hazardous combinations.',
      tool_ids: ['simulator', 'chemical_comparison']
    },
    {
      title: 'Molecular Structure Exploration',
      description: 'Investigate molecular structures and properties using the analysis tools. Query compounds and visualize 3D structures.',
      learning_objectives: 'Understand molecular geometry and interpret physical properties.',
      tool_ids: ['molecule_analysis', 'chemical_library']
    },
    {
      title: 'Safety and Compliance Review',
      description: 'Analyze safety data sheets and product labels for hazard information. Identify GHS classifications and safe handling procedures.',
      learning_objectives: 'Interpret SDS documents and understand GHS classifications.',
      tool_ids: ['sds_analyzer', 'barcode_scanner']
    }
  ]
};

export function getDefaultModules(subject) {
  const templates = MODULE_TEMPLATES[subject] || MODULE_TEMPLATES._default;
  return templates.map((t, i) => ({ ...t, order: i }));
}

export async function autoGenerateModules(classroom) {
  const templates = getDefaultModules(classroom.subject);
  const modules = templates.map(t => ({
    ...t,
    classroom_id: classroom.id,
    classroom_name: classroom.name,
    is_auto_generated: true,
    status: 'active'
  }));
  return await base44.entities.ExperimentModule.bulkCreate(modules);
}