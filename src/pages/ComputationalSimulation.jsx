import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../components/auth/AuthContext";
import useTrialStatus from "../hooks/useTrialStatus";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Cpu, FlaskConical, Dna, Pill, Leaf, Zap, Atom,
  Microscope, Globe, Beaker, Activity, Eye, ExternalLink, ArrowRight, Layers, Boxes, Thermometer
} from "lucide-react";

export const SIM_TYPES = [
  {
    id: "dft",
    label: "DFT / Quantum Chemistry",
    icon: Atom,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    engines: ["ORCA", "Gaussian", "Psi4", "NWChem", "CP2K"],
    description: "Electronic structure, energies, molecular orbitals, geometry optimization",
    fields: [
      { key: "molecule", label: "Molecule / SMILES / Formula", placeholder: "e.g. H2O, C6H6, caffeine" },
      { key: "functional", label: "DFT Functional", type: "select", options: ["B3LYP","PBE","PBE0","M06-2X","M06-L","ωB97X-D","CAM-B3LYP","BP86","BLYP","B97-D3","HSE06","TPSSh","B2-PLYP","DLPNO-CCSD(T)","HF"], default: "B3LYP" },
      { key: "basis_set", label: "Basis Set", type: "select", options: ["STO-3G","3-21G","6-31G","6-31G*","6-31G**","6-311G*","6-311G**","6-311+G**","6-311++G**","cc-pVDZ","cc-pVTZ","cc-pVQZ","aug-cc-pVDZ","aug-cc-pVTZ","def2-SVP","def2-TZVP","def2-QZVP","def2-TZVPP","LANL2DZ","SDD"], default: "6-31G*" },
      { key: "task", label: "Calculation Task", placeholder: "e.g. geometry optimization, frequency, NMR, single point" },
    ]
  },
  {
    id: "quantum_vqe",
    label: "Quantum VQE (IBM Qiskit)",
    icon: Atom,
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    engines: ["Qiskit Statevector", "IBM Hardware"],
    description: "Variational Quantum Eigensolver for ground state energy using IBM Qiskit. Run on simulator or real quantum hardware.",
    fields: [
      { key: "molecule", label: "Molecule (name, SMILES, or formula)", placeholder: "e.g. H2, LiH, H2O, or SMILES" },
    ]
  },
  {
    id: "molecular_dynamics",
    label: "Molecular Dynamics (MD)",
    icon: Activity,
    color: "from-teal-500 to-cyan-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    engines: ["GROMACS", "AMBER", "NAMD", "OpenMM", "LAMMPS"],
    description: "Protein folding, membrane dynamics, ligand binding, trajectory analysis",
    fields: [
      { key: "system", label: "System Description", placeholder: "e.g. Lysozyme in water box, 50ns NPT simulation" },
      { key: "force_field", label: "Force Field", type: "select", options: ["AMBER99SB-ILDN","CHARMM36","OPLS-AA","GROMOS54A7","ff14SB","CHARMM36m","AMBER14SB","TraPPE"], default: "AMBER99SB-ILDN" },
      { key: "temperature", label: "Temperature (K)", type: "select", options: ["298","300","310","273","320","350","400"], default: "300" },
      { key: "simulation_time", label: "Simulation Time", type: "select", options: ["1 ns","10 ns","50 ns","100 ns","500 ns","1 µs","Custom"], default: "100 ns" },
    ]
  },
  {
    id: "drug_discovery",
    label: "Drug Discovery / Docking",
    icon: Pill,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    engines: ["AutoDock Vina", "Glide", "DOCK6", "RDKit", "OpenBabel"],
    description: "Ligand-receptor docking, ADMET prediction, binding affinity, pharmacophore",
    fields: [
      { key: "ligand", label: "Ligand (drug candidate)", placeholder: "e.g. Ibuprofen, aspirin, or SMILES" },
      { key: "receptor", label: "Target Receptor / Protein", placeholder: "e.g. COX-2, ACE2, PDB: 1CX2" },
      { key: "binding_site", label: "Binding Site / Region", placeholder: "e.g. active site, allosteric pocket" },
      { key: "properties", label: "Properties to Predict", placeholder: "e.g. binding affinity, ADMET, LogP, toxicity" },
    ]
  },
  {
    id: "protein_modeling",
    label: "Protein / Biomolecular",
    icon: Dna,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    engines: ["GROMACS", "AMBER", "Modeller", "AlphaFold", "Rosetta"],
    description: "Protein structure prediction, homology modeling, folding, MD refinement",
    fields: [
      { key: "sequence", label: "Protein / Sequence / PDB ID", placeholder: "e.g. MKTIIALSYIFCLVFA... or UniProt: P12345" },
      { key: "analysis_type", label: "Analysis Type", placeholder: "e.g. secondary structure, RMSD, binding site, stability" },
      { key: "environment", label: "Environment / Solvent", placeholder: "e.g. physiological pH 7.4, lipid bilayer, vacuum" },
      { key: "mutations", label: "Mutations (optional)", placeholder: "e.g. G12V, K45R" },
    ]
  },
  {
    id: "quantum_mechanics",
    label: "QM / Excited States",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    engines: ["ORCA", "Gaussian", "Q-Chem", "Turbomole", "Molpro"],
    description: "Excited states, TDDFT, reaction pathways, transition states, photochemistry",
    fields: [
      { key: "system", label: "Chemical System", placeholder: "e.g. photocatalytic water splitting, A→B→C reaction" },
      { key: "method", label: "QM Method", type: "select", options: ["TDDFT/B3LYP","TDDFT/CAM-B3LYP","EOM-CCSD","CASPT2","CASSCF","ADC(2)","CC2","MP2","DLPNO-CCSD(T)"], default: "TDDFT/B3LYP" },
      { key: "properties", label: "Properties of Interest", type: "select", options: ["Excitation energies","Oscillator strengths","Reaction barrier","Dipole moment","Transition state","IRC path","Natural transition orbitals","Spin-orbit coupling"], default: "Excitation energies" },
      { key: "environment", label: "Environment", type: "select", options: ["Gas phase","Water (PCM)","Solvent (COSMO)","DMSO (PCM)","Benzene (PCM)","Ethanol (PCM)"], default: "Gas phase" },
    ]
  },
  {
    id: "materials",
    label: "Materials Science / DFT",
    icon: Beaker,
    color: "from-slate-500 to-gray-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    engines: ["VASP", "Quantum ESPRESSO", "CP2K", "FHI-aims", "Wien2k"],
    description: "Solid-state DFT, band structure, density of states, surface reactions",
    fields: [
      { key: "material", label: "Material / Crystal", placeholder: "e.g. TiO2 rutile, graphene, perovskite BaTiO3" },
      { key: "property", label: "Property to Calculate", type: "select", options: ["Band gap","Density of States (DOS)","Band structure","Phonons","Adsorption energy","Formation energy","Magnetic moment","Dielectric constant"], default: "Band gap" },
      { key: "kpoints", label: "k-point Sampling", type: "select", options: ["2x2x2","4x4x4","6x6x6","8x8x8","10x10x10","Gamma only","Custom"], default: "4x4x4" },
      { key: "functional", label: "Functional / Method", type: "select", options: ["PBE","PBE+U","HSE06","vdW-DF","SCAN","r2SCAN","PBEsol","LDA"], default: "PBE" },
    ]
  },
  {
    id: "materials_informatics",
    label: "Materials Informatics",
    icon: Layers,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    engines: ["Materials Project", "OPTIMADE", "AFLOW"],
    description: "Search open materials databases for crystal structures, formation energies, band gaps, and electronic properties.",
    fields: [
      { key: "formula", label: "Chemical Formula", placeholder: "e.g. SiO2, BaTiO3, Fe2O3" },
      { key: "elements", label: "Elements (comma-separated, optional)", placeholder: "e.g. Si, O" },
      { key: "property_filter", label: "Property Filter", type: "select", options: ["None", "Semiconductors (band gap 0.1-3 eV)", "Insulators (band gap > 3 eV)", "Metals (band gap = 0)", "Stable materials (on hull)"], default: "None" },
    ]
  },
  {
    id: "structure_builder",
    label: "Structure Builder & 3D Viewer",
    icon: Boxes,
    color: "from-cyan-500 to-teal-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    engines: ["ASE", "Three.js", "CIF", "POSCAR", "XYZ", "PDB"],
    description: "Upload or build crystal structures, convert between CIF/POSCAR/XYZ/PDB, and visualize in 3D with measurement tools.",
    fields: []
  },
  {
    id: "monte_carlo",
    label: "Monte Carlo / Statistical",
    icon: FlaskConical,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    engines: ["RASPA", "CASSANDRA", "Faunus", "GOMC", "BOSS"],
    description: "Phase equilibria, adsorption isotherms, grand canonical MC, free energy",
    fields: [
      { key: "system", label: "System Description", placeholder: "e.g. CO2 adsorption in MOF-5 at 298K" },
      { key: "ensemble", label: "Ensemble", type: "select", options: ["GCMC","NPT","NVT","Gibbs","NPT-GEMC","µVT"], default: "GCMC" },
      { key: "temperature", label: "Temperature (K)", type: "select", options: ["273","298","300","310","350","400","500"], default: "298" },
      { key: "property", label: "Property to Calculate", type: "select", options: ["Adsorption isotherm","Henry constant","Selectivity","Heat of adsorption","Radial distribution function","Free energy","Phase diagram"], default: "Adsorption isotherm" },
    ]
  },
  {
    id: "environmental",
    label: "Environmental / Green Chem",
    icon: Globe,
    color: "from-lime-500 to-green-600",
    bgColor: "bg-lime-50",
    borderColor: "border-lime-200",
    engines: ["ORCA", "RDKit", "OpenBabel", "EPI Suite", "ECOSAR"],
    description: "Pollutant degradation, atmospheric chemistry, ecotoxicology, fate & transport",
    fields: [
      { key: "compound", label: "Compound / Pollutant", placeholder: "e.g. atrazine herbicide, PFAS, CO2" },
      { key: "environment", label: "Environmental Matrix", type: "select", options: ["Aquatic (freshwater)","Aquatic (marine)","Atmospheric","Soil / sediment","Groundwater","Air-water interface"], default: "Aquatic (freshwater)" },
      { key: "process", label: "Process to Model", type: "select", options: ["Photodegradation","Biodegradation","Sorption","Hydrolysis","Atmospheric OH oxidation","Volatilization","Bioaccumulation"], default: "Photodegradation" },
      { key: "metrics", label: "Metrics / Outputs", type: "select", options: ["Half-life","Degradation products","Ecotoxicity LC50","LogKow / LogKoc","Henry's law constant","BCF (bioconcentration)"], default: "Half-life" },
    ]
  },
  {
    id: "visualization",
    label: "Visualization & Analysis",
    icon: Eye,
    color: "from-fuchsia-500 to-pink-600",
    bgColor: "bg-fuchsia-50",
    borderColor: "border-fuchsia-200",
    engines: ["VMD", "PyMOL", "Avogadro", "VESTA", "ChimeraX"],
    description: "Molecular visualization, trajectory analysis, electrostatic potential maps, 3D rendering",
    fields: [
      { key: "molecule_or_trajectory", label: "Molecule / Trajectory / PDB", placeholder: "e.g. protein.pdb, trajectory.xtc, C6H6 benzene" },
      { key: "viz_type", label: "Visualization Type", type: "select", options: ["Electrostatic potential map","Orbital density","RMSD plot","Ramachandran plot","Surface representation","Cartoon/ribbon","Space-filling model","Electron density map"], default: "Electrostatic potential map" },
      { key: "tool_preference", label: "Preferred Tool", type: "select", options: ["VMD","PyMOL","Avogadro","VESTA","ChimeraX"], default: "VMD" },
      { key: "output_format", label: "Output Format", type: "select", options: ["PNG image","High-res TIFF","Movie (MP4)","Interactive session","Script only","PDF report"], default: "PNG image" },
    ]
  },
  {
    id: "surface_chemistry",
    label: "Surface Chemistry & Catalysis",
    icon: Beaker,
    color: "from-red-500 to-orange-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    engines: ["VASP", "CP2K", "ORCA", "Quantum ESPRESSO", "FHI-aims"],
    description: "Surface reactions, catalyst design, heterogeneous catalysis, adsorption dynamics, reaction mechanisms",
    fields: [
      { key: "surface", label: "Surface / Catalyst Material", placeholder: "e.g. Pt(111), TiO2 rutile (110), Au nanoparticle, graphene" },
      { key: "reactants", label: "Reactants / Adsorbates", placeholder: "e.g. CO + O2, NH3, N2, CO2" },
      { key: "analysis_type", label: "Analysis Type", type: "select", options: ["Adsorption energy","Activation barrier","Reaction pathway (NEB)","Reaction intermediate","Transition state","Surface structure optimization","Thermodynamic stability","Electron transfer"], default: "Adsorption energy" },
      { key: "functional", label: "DFT Functional", type: "select", options: ["PBE","PBE+U","BEEF-vdW","RPBE","vdW-DF2","HSE06","SCAN"], default: "PBE" },
    ]
  },
  {
    id: "biomolecular_dynamics",
    label: "Advanced Biomolecular Dynamics",
    icon: Dna,
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    engines: ["AMBER", "GROMACS", "NAMD", "OpenMM", "DESMOND"],
    description: "Enhanced sampling, all-atom & coarse-grain, protein-protein/RNA/lipid interactions, free energy calculations",
    fields: [
      { key: "system", label: "Biomolecular System", placeholder: "e.g. SARS-CoV-2 spike protein in membrane, RNA hairpin folding" },
      { key: "method", label: "Advanced Sampling Method", type: "select", options: ["Umbrella Sampling (US)","Replica Exchange MD (REMD)","Metadynamics","Steered MD (SMD)","Accelerated MD (aMD)","REST2"], default: "Umbrella Sampling (US)" },
      { key: "property", label: "Property to Calculate", type: "select", options: ["Binding free energy (PMF)","Protein-protein interface","RNA secondary structure","Lipid diffusion","Ion permeation","Protein folding pathway","Allosteric pathway"], default: "Binding free energy (PMF)" },
      { key: "force_field", label: "Force Field", type: "select", options: ["AMBER14SB","AMBER99SB-ILDN","CHARMM36m","OPLS-AA/M","ff14SB","Slipids"], default: "AMBER14SB" },
    ]
  },
  {
    id: "electron_spectroscopy",
    label: "Electron Spectroscopy & Photochemistry",
    icon: Zap,
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    engines: ["ORCA", "Gaussian", "Q-Chem", "Molpro", "ADF"],
    description: "X-ray/UV photoelectron spectroscopy, X-ray absorption, TDDFT excited states, nonlinear optics, spin-orbit coupling",
    fields: [
      { key: "system", label: "Molecular System / Complex", placeholder: "e.g. transition metal complex, organic dye, lanthanide complex" },
      { key: "spectroscopy_type", label: "Spectroscopy Type", type: "select", options: ["XPS (X-ray photoelectron)","UPS (Ultraviolet photoelectron)","XANES (X-ray absorption)","NEXAFS","ECD (Electronic circular dichroism)","ORD (Optical rotatory dispersion)"], default: "XPS (X-ray photoelectron)" },
      { key: "theory_level", label: "Theory Level", type: "select", options: ["TDDFT/PBE","TDDFT/CAM-B3LYP","EOM-CCSD","ADC(2/3)","Bethe-Salpeter","GW-BSE"], default: "TDDFT/CAM-B3LYP" },
      { key: "spin_orbit", label: "Include Spin-Orbit Coupling?", type: "select", options: ["No","Yes (2c-DKH)","Yes (4c-DKH)"], default: "No" },
    ]
  },
  {
    id: "machine_learning_pot",
    label: "Machine Learning Potentials",
    icon: Cpu,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    engines: ["SchNet", "DimeNet", "MACE", "CHARMNET", "PaiNN"],
    description: "Fast MD with NN potentials, scalable simulations, transferable ML models, large-scale dynamics",
    fields: [
      { key: "system", label: "System Description", placeholder: "e.g. Large protein complex, nanoparticle, extended defect in crystal" },
      { key: "model_type", label: "ML Potential Model", type: "select", options: ["SchNet","DimeNet","MACE","Graph Neural Network","EquivariantNet","Transformer-based","Pre-trained Universal Model"], default: "SchNet" },
      { key: "task", label: "Task", type: "select", options: ["Molecular dynamics (10 ns to µs scale)","Structure optimization","Properties prediction (E, F, Stress)","Dataset generation for fine-tuning","Transfer learning to new systems"], default: "Molecular dynamics (10 ns to µs scale)" },
      { key: "scale", label: "System Size", type: "select", options: ["100s - 1000s atoms","1000s - 100k atoms","100k - 1M atoms","Custom (specify)"], default: "1000s - 100k atoms" },
    ]
  },
  {
    id: "process_simulation",
    label: "Process Simulation (DWSIM)",
    icon: Layers,
    color: "from-teal-600 to-emerald-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    engines: ["DWSIM", "FluentAPI", "Python", "Open Source"],
    description: "Steady-state and dynamic process flowsheet simulation. Distillation columns, reactors, heat exchangers, and full plant models.",
    fields: [],
  },
  {
    id: "thermo_phase",
    label: "Thermodynamics & Phase Diagrams",
    icon: Thermometer,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    engines: ["ThermoCalc", "CALPHAD", "NIST WebBook", "Group Contribution"],
    description: "Thermodynamic property estimation, heat capacity curves, Gibbs energy analysis, and P-T phase diagram construction.",
    fields: [
      { key: "compound", label: "Compound / System", placeholder: "e.g. H2O, CO2, NaCl, Fe-C alloy" },
      { key: "analysis_type", label: "Analysis Type", type: "select", options: ["phase_diagram", "thermodynamic_properties", "heat_capacity_curve", "gibbs_energy_curve"], default: "phase_diagram" },
      { key: "temp_min", label: "Min Temperature (K)", placeholder: "100" },
      { key: "temp_max", label: "Max Temperature (K)", placeholder: "800" },
      { key: "pressure_min", label: "Min Pressure (bar)", placeholder: "0.01" },
      { key: "pressure_max", label: "Max Pressure (bar)", placeholder: "100" },
    ]
  },
];

export const DOMAIN_SIM_MAP = {
  "Chemistry":         ["dft", "quantum_vqe", "materials_informatics", "structure_builder", "quantum_mechanics", "monte_carlo", "surface_chemistry", "electron_spectroscopy", "visualization", "process_simulation", "thermo_phase"],
  "Biochemistry":      ["molecular_dynamics", "protein_modeling", "quantum_mechanics", "biomolecular_dynamics", "electron_spectroscopy", "visualization", "thermo_phase"],
  "Drug Discovery":    ["drug_discovery", "molecular_dynamics", "protein_modeling", "biomolecular_dynamics", "machine_learning_pot", "visualization", "thermo_phase"],
  "Engineering":       ["materials", "materials_informatics", "structure_builder", "monte_carlo", "dft", "surface_chemistry", "machine_learning_pot", "visualization", "process_simulation", "thermo_phase"],
  "Biology":           ["protein_modeling", "molecular_dynamics", "biomolecular_dynamics", "machine_learning_pot", "visualization", "thermo_phase"],
  "Environmental":     ["environmental", "monte_carlo", "dft", "surface_chemistry", "visualization", "process_simulation", "thermo_phase"],
  "Materials Science": ["materials", "materials_informatics", "structure_builder", "dft", "quantum_vqe", "monte_carlo", "surface_chemistry", "electron_spectroscopy", "machine_learning_pot", "visualization", "thermo_phase"],
  "Biophysics":        ["molecular_dynamics", "protein_modeling", "quantum_mechanics", "quantum_vqe", "biomolecular_dynamics", "electron_spectroscopy", "machine_learning_pot", "visualization", "thermo_phase"],
};

export const DOMAIN_TAGS = ["Chemistry", "Biochemistry", "Drug Discovery", "Engineering", "Biology", "Environmental", "Materials Science", "Biophysics"];

export const DOMAIN_COLORS = {
  "Chemistry": "bg-violet-600 text-white border-violet-600",
  "Biochemistry": "bg-teal-600 text-white border-teal-600",
  "Drug Discovery": "bg-pink-600 text-white border-pink-600",
  "Engineering": "bg-slate-600 text-white border-slate-600",
  "Biology": "bg-blue-600 text-white border-blue-600",
  "Environmental": "bg-green-600 text-white border-green-600",
  "Materials Science": "bg-amber-600 text-white border-amber-600",
  "Biophysics": "bg-cyan-600 text-white border-cyan-600",
};

export const DOMAIN_DESCRIPTIONS = {
  "Chemistry": "Quantum chemistry, DFT, reaction mechanisms, spectroscopy and statistical simulations.",
  "Biochemistry": "Protein dynamics, biomolecular interactions, excited states and visualization.",
  "Drug Discovery": "Docking, ADMET, binding affinity, protein modeling and ML-based drug design.",
  "Engineering": "Materials DFT, band structure, Monte Carlo and ML potentials for engineering systems.",
  "Biology": "Protein folding, membrane dynamics, coarse-grain and advanced biomolecular sampling.",
  "Environmental": "Pollutant fate, photodegradation, ecotoxicology and atmospheric chemistry.",
  "Materials Science": "Solid-state DFT, surface catalysis, spectroscopy and neural network potentials.",
  "Biophysics": "Enhanced sampling, free energy, protein-RNA interactions and photophysics.",
};

export default function ComputationalSimulation() {
  const { user } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const navigate = useNavigate();
  const [domain, setDomain] = useState("Chemistry");

  const canAccess = !user || trialStatus.isPro || trialStatus.trialDaysLeft > 0;

  if (user && !canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#EDF7F2' }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-violet-100 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Pro Feature</h2>
          <p className="text-slate-600 mb-1">Computational Simulations require a <span className="font-semibold text-violet-700">Pro subscription</span>.</p>
          <p className="text-slate-500 text-sm mb-6">Run DFT, MD, drug discovery, protein modeling, materials science and more.</p>
          <Link to={createPageUrl('Pricing')} className="block w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-center">
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  const filteredSims = SIM_TYPES.filter(s => DOMAIN_SIM_MAP[domain]?.includes(s.id));

  const handleSelectSim = (simId) => {
    if (simId === "sandbox") {
      navigate("/SimulationSandbox");
      return;
    }
    if (simId === "process_simulation") {
      navigate("/DWSIMIntegration");
      return;
    }
    navigate(`/SimulationRunner?type=${simId}&domain=${encodeURIComponent(domain)}`);
  };

  return (
      <div className="min-h-screen" style={{ backgroundColor: '#EDF7F2' }}>
        <div className="max-w-6xl mx-auto px-4 py-10">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
              Computational Simulations
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
              AI-powered molecular modeling: DFT, MD, drug discovery, QM, materials science, Monte Carlo, and visualization tools.
            </p>

            {/* Capability badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200">
                <Atom className="w-3 h-3" /> Quantum-powered, IBM Qiskit VQE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
                <Layers className="w-3 h-3" /> Materials Informatics, Materials Project & OPTIMADE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold border border-cyan-200">
                <Boxes className="w-3 h-3" /> Structure Builder, ASE & 3D Crystal Viewer
              </span>
            </div>

            {/* Domain tabs */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {DOMAIN_TAGS.map(d => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    domain === d
                      ? DOMAIN_COLORS[d] || "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Domain description banner */}
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 mb-8 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Microscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{domain}</p>
              <p className="text-slate-500 text-xs">{DOMAIN_DESCRIPTIONS[domain]}</p>
            </div>
            <div className="ml-auto text-xs text-slate-400 font-medium hidden sm:block">
              {filteredSims.length} simulation types available
            </div>
          </div>

          {/* Simulation Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSims.filter(s => s.id !== 'process_simulation').map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectSim(s.id)}
                  className="group text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-violet-300 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all mt-1" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5 leading-tight group-hover:text-violet-700 transition-colors">
                    {s.label}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{s.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.engines.slice(0, 3).map(e => (
                      <span key={e} className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {e}
                      </span>
                    ))}
                    {s.engines.length > 3 && (
                      <span className="inline-block bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">
                        +{s.engines.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* DWSIM Process Simulation card */}
            {filteredSims.some(s => s.id === 'process_simulation') &&  (
              <button
                onClick={() => handleSelectSim('process_simulation')}
                className="group text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-teal-300 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 leading-tight group-hover:text-teal-700 transition-colors">
                  Process Simulation (DWSIM)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Steady-state and dynamic process flowsheet simulation. Distillation columns, reactors, heat exchangers, and full plant models.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['DWSIM', 'FluentAPI', 'Python', 'Open Source'].map(e => (
                    <span key={e} className="inline-block bg-teal-50 text-teal-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {e}
                    </span>
                  ))}
                </div>
              </button>
            )}

            {/* Sandbox card */}
            <button
              onClick={() => navigate("/SimulationSandbox")}
              className="group text-left bg-violet-50 rounded-2xl border-2 border-dashed border-violet-300 p-5 hover:bg-violet-100 hover:border-violet-500 hover:shadow-md transition-all duration-200 focus:outline-none"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <ExternalLink className="w-4 h-4 text-violet-400 group-hover:text-violet-600 transition-colors mt-1" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5 leading-tight flex items-center gap-1.5">
                3D Simulation Sandbox
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Interactive sandbox: place atoms on a 3D grid and simulate real-time physics interactions
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-block bg-violet-100 text-violet-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">Three.js</span>
                <span className="inline-block bg-violet-100 text-violet-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">Interactive</span>
              </div>
            </button>
          </div>

        </div>
      </div>
  );
}