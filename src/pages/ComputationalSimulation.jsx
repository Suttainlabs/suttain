import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../components/auth/AuthContext";
import useTrialStatus from "../hooks/useTrialStatus";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Cpu, FlaskConical, Dna, Zap, Atom,
  Microscope, Beaker, Activity, ArrowRight
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
      { key: "functional", label: "DFT Functional", type: "select", options: ["B3LYP","PBE","PBE0","M06-2X","M06-L","CAM-B3LYP","BP86","TPSSh","HF","r2SCAN","GFN2-xTB","wB97X-D","ωB97X-D","BLYP","B97-D3","HSE06","B2-PLYP","DLPNO-CCSD(T)"], default: "B3LYP" },
      { key: "basis_set", label: "Basis Set", type: "select", options: ["STO-3G","3-21G","6-31G","6-31G*","6-31G**","6-311G*","6-311G**","6-311+G**","6-311++G**","cc-pVDZ","cc-pVTZ","cc-pVQZ","aug-cc-pVDZ","aug-cc-pVTZ","def2-SVP","def2-TZVP","def2-QZVP","def2-TZVPP","LANL2DZ","SDD"], default: "6-31G*" },
      { key: "task", label: "Calculation Task", type: "select", options: ["Geometry optimization","Single-point energy","Frequency analysis (IR/Raman)","NMR chemical shifts","UV-Vis (TDDFT)","Population analysis","Natural bond orbital (NBO)","Transition state (TS) optimization","IRC path","Conformer search"], default: "Geometry optimization" },
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
    description: "Biomolecular dynamics, membrane dynamics, conformational sampling and trajectory analysis",
    fields: [
      { key: "system", label: "System Description", placeholder: "e.g. Lysozyme in water box, 50ns NPT simulation" },
      { key: "force_field", label: "Force Field", type: "select", options: ["AMBER99SB-ILDN","CHARMM36","OPLS-AA","GROMOS54A7","ff14SB","CHARMM36m","AMBER14SB","TraPPE"], default: "AMBER99SB-ILDN" },
      { key: "temperature", label: "Temperature (K)", type: "select", options: ["298","300","310","273","320","350","400"], default: "300" },
      { key: "simulation_time", label: "Simulation Time", type: "select", options: ["1 ns","10 ns","50 ns","100 ns","500 ns","1 µs","Custom"], default: "100 ns" },
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
      { key: "method", label: "QM Method", type: "select", options: ["B3LYP","PBE","HF","GFN2-xTB","TDDFT/B3LYP","TDDFT/CAM-B3LYP","EOM-CCSD","CASPT2","CASSCF","ADC(2)","CC2","MP2","DLPNO-CCSD(T)"], default: "B3LYP" },
      { key: "properties", label: "Properties of Interest", type: "select", options: ["Excitation energies","Oscillator strengths","Reaction barrier","Dipole moment","Transition state","IRC path","Natural transition orbitals","Spin-orbit coupling"], default: "Dipole moment" },
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
      { key: "property", label: "Property to Calculate", type: "select", options: ["Band gap","Density of States (DOS)","Band structure","Band structure + DOS","Phonons","Adsorption energy","Formation energy","Magnetic moment","Dielectric constant"], default: "Band gap" },
      { key: "kpoints", label: "k-point Sampling", type: "select", options: ["2x2x2","4x4x4","6x6x6","8x8x8","10x10x10","Gamma only","Custom"], default: "4x4x4" },
      { key: "functional", label: "Functional / Method", type: "select", options: ["PBE","PBE+U","HSE06","vdW-DF","SCAN","r2SCAN","PBEsol","LDA"], default: "PBE" },
    ]
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
];

export const DOMAIN_SIM_MAP = {
  Chemistry: ['dft', 'quantum_mechanics', 'monte_carlo', 'surface_chemistry', 'electron_spectroscopy'],
  'Quantum Chemistry': ['quantum_mechanics', 'electron_spectroscopy', 'dft', 'surface_chemistry', 'monte_carlo'],
  'Materials Science': ['materials', 'dft', 'monte_carlo', 'surface_chemistry', 'electron_spectroscopy', 'machine_learning_pot'],
  Biochemistry: ['molecular_dynamics', 'biomolecular_dynamics', 'machine_learning_pot', 'quantum_mechanics'],
  Biophysics: ['biomolecular_dynamics', 'molecular_dynamics', 'machine_learning_pot', 'quantum_mechanics', 'electron_spectroscopy'],
};
export const DOMAIN_TAGS = ['Chemistry', 'Quantum Chemistry', 'Materials Science', 'Biochemistry', 'Biophysics'];
export const DOMAIN_COLORS = Object.fromEntries(DOMAIN_TAGS.map(domain => [domain, 'bg-primary text-primary-foreground border-primary']));
export const DOMAIN_DESCRIPTIONS = {
  Chemistry: 'DFT, catalytic reaction mechanisms, transition states, spectroscopy and statistical simulations.',
  'Quantum Chemistry': 'TDDFT, coupled-cluster calculations, excited states and electronic spectroscopy.',
  'Materials Science': 'Periodic DFT, band structure, density of states, surface catalysis and interatomic potentials.',
  Biochemistry: 'QM/MM enzymatic reactions, biomolecular dynamics and protein active-site quantum regions.',
  Biophysics: 'QM/MM, enhanced sampling, free-energy calculations and spectroscopy of biomolecular systems.',
};

export default function ComputationalSimulation() {
  const { user } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const navigate = useNavigate();
  const [domain, setDomain] = useState("Chemistry");

  const canAccess = trialStatus.canRunResearchSim;

  if (user && !canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#EDF7F2' }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-violet-100 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Pro Feature</h2>
          <p className="text-slate-600 mb-1">Computational Simulations require a <span className="font-semibold text-violet-700">Pro subscription</span>.</p>
          <p className="text-slate-500 text-sm mb-6">Configure QM/MM, advanced quantum chemistry and materials calculations.</p>
          <Link to={createPageUrl('Pricing')} className="block w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-center">
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  const filteredSims = SIM_TYPES.filter(s => DOMAIN_SIM_MAP[domain]?.includes(s.id));

  const handleSelectSim = (simId) => {
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
              Advanced QM/MM, quantum chemistry and materials workflows for enterprise and academic research.
            </p>

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
            {filteredSims.map(s => {
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


          </div>

        </div>
      </div>
  );
}