import {
  Cpu, LayoutDashboard, FlaskConical, History, GitCompare, Layers, Workflow,
  Atom, Microscope, Boxes, Eye, Server, ListChecks, ClipboardList,
  FileText, ShieldAlert, Sprout, MessageCircle, Camera, CloudSun, BarChart2, User as UserIcon,
} from 'lucide-react';

// ── research.suttain.com ───────────────────────────────────────────
// NOTE: the consumer Chemical Simulator (/Simulator) is intentionally NOT
// listed here. It belongs to suttain.com only and must never be grouped
// with, renamed into, or confused with the research simulation tools.
export const RESEARCH_TOOLS = [
  { path: '/ComputationalStudio', label: 'Computational studio', icon: FlaskConical, description: 'Unified workspace for molecules, proteins, materials and hazard prediction', category: 'Workspace' },

  // Simulation & Modeling Suite
  { path: '/SimulationRunner', label: 'Simulation runner', icon: Cpu, description: 'Configure and run a research simulation', category: 'Simulation & Modeling Suite' },
  { path: '/ComputationalSimulation', label: 'Computational simulation', icon: Cpu, description: 'DFT and semi-empirical simulations with 3D visualization', category: 'Simulation & Modeling Suite' },
  { path: '/SimulationDashboard', label: 'Simulation dashboard', icon: LayoutDashboard, description: 'Overview of simulation activity and results', category: 'Simulation & Modeling Suite' },
  { path: '/SimulationSandbox', label: 'Simulation sandbox', icon: Layers, description: 'Free-form sandbox for experimental runs', category: 'Simulation & Modeling Suite' },
  { path: '/SimulationHistory', label: 'Simulation history', icon: History, description: 'Full history of past simulation runs', category: 'Simulation & Modeling Suite' },
  { path: '/SimulationComparison', label: 'Simulation comparison', icon: GitCompare, description: 'Compare results across simulation runs', category: 'Simulation & Modeling Suite' },
  { path: '/BatchSimulation', label: 'Batch simulation', icon: Workflow, description: 'Run many simulations in a single batch', category: 'Simulation & Modeling Suite' },
  { path: '/DWSIMIntegration', label: 'DWSIM integration', icon: Workflow, description: 'Process modelling through the DWSIM engine', category: 'Simulation & Modeling Suite' },

  // Molecules & Materials
  { path: '/ComputationalStudio/Proteins', label: 'Proteins', icon: Microscope, description: 'Protein structure prediction and analysis', category: 'Molecules & Materials' },
  { path: '/ComputationalStudio/SmallMolecules', label: 'Small molecules', icon: Atom, description: 'Small molecule property and hazard analysis', category: 'Molecules & Materials' },
  { path: '/ComputationalStudio/Materials', label: 'Materials', icon: Boxes, description: 'Crystal structures and materials properties', category: 'Molecules & Materials' },
  { path: '/StructureComparison', label: 'Structure comparison', icon: GitCompare, description: 'Compare molecular and protein structures side by side', category: 'Molecules & Materials' },
  { path: '/MolecularVisualization', label: 'Molecular visualization', icon: Eye, description: '3D rendering, orbitals and trajectory playback', category: 'Molecules & Materials' },
  { path: '/MoleculeAnalysis', label: 'Molecule analysis', icon: Atom, description: 'Query compounds for hazard intelligence and 3D structure', category: 'Molecules & Materials' },
  { path: '/StructuralBiology', label: 'Structural biology', icon: Microscope, description: 'AlphaFold-powered protein structure exploration', category: 'Molecules & Materials' },

  // Compute & Jobs
  { path: '/HPCJobManagement', label: 'HPC job management', icon: Server, description: 'Submit and manage high performance compute jobs', category: 'Compute & Jobs' },
  { path: '/JobQueueMonitor', label: 'Job queue monitor', icon: ListChecks, description: 'Live status of running and queued jobs', category: 'Compute & Jobs' },
  { path: '/SimulationQueueManager', label: 'Simulation queue manager', icon: ClipboardList, description: 'Build and order the simulation queue', category: 'Compute & Jobs' },

  // Safety and compliance
  { path: '/SDSAnalyzer', label: 'SDS analyzer', icon: FileText, description: 'Extract hazard data and GHS classifications from SDS sheets', category: 'Safety and compliance' },
  { path: '/HazardEngine', label: 'Hazard prediction engine', icon: ShieldAlert, description: 'Validated hazard classification with confidence and sources', category: 'Safety and compliance' },
];

// ── farm.suttain.com ───────────────────────────────────────────────
export const FARM_TOOLS = [
  { path: '/AgroDashboard', label: 'Farm dashboard', icon: Sprout, description: 'Farm overview, yields and alerts' },
  { path: '/AgroChat', label: 'Farm assistant', icon: MessageCircle, description: 'Ask agronomy questions in your language' },
  { path: '/AgroPhotoDiagnosis', label: 'Photo diagnosis', icon: Camera, description: 'Diagnose crop disease and pests from a photo' },
  { path: '/AgroWeather', label: 'Weather', icon: CloudSun, description: 'Local forecast and spraying guidance' },
  { path: '/AgroReports', label: 'Reports', icon: BarChart2, description: 'Season summaries and harvest reports' },
  { path: '/AgroFarmerProfile', label: 'Farmer profile', icon: UserIcon, description: 'Farmer and farm details' },
];

export const RESEARCH_PATHS = RESEARCH_TOOLS.map(t => t.path);
export const FARM_PATHS = FARM_TOOLS.map(t => t.path);