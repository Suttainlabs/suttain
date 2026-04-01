import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import AuthGate from "../components/auth/AuthGate";
import AuthContext from "../components/auth/AuthContext";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Cpu, FlaskConical, Dna, Pill, Leaf, Zap, Atom, ChevronRight,
  Download, Copy, CheckCircle2, Loader2, RotateCcw, BookOpen,
  Microscope, Globe, Beaker, Activity, AlertTriangle, Eye
} from "lucide-react";

const DFT_FUNCTIONALS = [
  "B3LYP", "PBE", "PBE0", "M06-2X", "M06-L", "ωB97X-D", "CAM-B3LYP",
  "BP86", "BLYP", "B97-D3", "HSE06", "TPSSh", "B2-PLYP", "DLPNO-CCSD(T)", "HF"
];

const BASIS_SETS = [
  "STO-3G", "3-21G", "6-31G", "6-31G*", "6-31G**", "6-311G*", "6-311G**",
  "6-311+G**", "6-311++G**", "cc-pVDZ", "cc-pVTZ", "cc-pVQZ",
  "aug-cc-pVDZ", "aug-cc-pVTZ", "def2-SVP", "def2-TZVP", "def2-QZVP",
  "def2-TZVPP", "LANL2DZ", "SDD"
];

const SIM_TYPES = [
  {
    id: "dft",
    label: "DFT / Quantum Chemistry",
    icon: Atom,
    color: "from-violet-500 to-purple-600",
    engines: ["ORCA", "Gaussian", "Psi4", "NWChem", "CP2K"],
    description: "Electronic structure, energies, molecular orbitals, geometry optimization",
    fields: [
      { key: "molecule", label: "Molecule / SMILES / Formula", placeholder: "e.g. H2O, C6H6, caffeine" },
      { key: "functional", label: "DFT Functional", type: "select", options: DFT_FUNCTIONALS, default: "B3LYP" },
      { key: "basis_set", label: "Basis Set", type: "select", options: BASIS_SETS, default: "6-31G*" },
      { key: "task", label: "Calculation Task", placeholder: "e.g. geometry optimization, frequency, NMR, single point" },
    ]
  },
  {
    id: "molecular_dynamics",
    label: "Molecular Dynamics (MD)",
    icon: Activity,
    color: "from-teal-500 to-cyan-600",
    engines: ["GROMACS", "AMBER", "NAMD", "OpenMM", "LAMMPS"],
    description: "Protein folding, membrane dynamics, ligand binding, trajectory analysis",
    fields: [
      { key: "system", label: "System Description", placeholder: "e.g. Lysozyme in water box, 50ns NPT simulation" },
      { key: "force_field", label: "Force Field", placeholder: "e.g. AMBER99SB-ILDN, CHARMM36, OPLS-AA", default: "AMBER99SB-ILDN" },
      { key: "temperature", label: "Temperature (K)", placeholder: "e.g. 300", default: "300" },
      { key: "simulation_time", label: "Simulation Time", placeholder: "e.g. 100 ns, 10 ns NPT" },
    ]
  },
  {
    id: "drug_discovery",
    label: "Drug Discovery / Docking",
    icon: Pill,
    color: "from-pink-500 to-rose-600",
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
    engines: ["ORCA", "Gaussian", "Q-Chem", "Turbomole", "Molpro"],
    description: "Excited states, TDDFT, reaction pathways, transition states, photochemistry",
    fields: [
      { key: "system", label: "Chemical System", placeholder: "e.g. photocatalytic water splitting, A→B→C reaction" },
      { key: "method", label: "QM Method", placeholder: "e.g. CCSD(T), MP2, TDDFT, EOM-CCSD", default: "TDDFT/B3LYP" },
      { key: "properties", label: "Properties of Interest", placeholder: "e.g. excitation energies, reaction barrier, dipole moment" },
      { key: "environment", label: "Environment", placeholder: "e.g. gas phase, solvent water (PCM/COSMO)" },
    ]
  },
  {
    id: "materials",
    label: "Materials Science / DFT",
    icon: Beaker,
    color: "from-slate-500 to-gray-700",
    engines: ["VASP", "Quantum ESPRESSO", "CP2K", "FHI-aims", "Wien2k"],
    description: "Solid-state DFT, band structure, density of states, surface reactions",
    fields: [
      { key: "material", label: "Material / Crystal", placeholder: "e.g. TiO2 rutile, graphene, perovskite BaTiO3" },
      { key: "property", label: "Property to Calculate", placeholder: "e.g. band gap, DOS, phonons, adsorption energy" },
      { key: "kpoints", label: "k-point Sampling", placeholder: "e.g. 4x4x4 Monkhorst-Pack", default: "4x4x4" },
      { key: "functional", label: "Functional / Method", placeholder: "e.g. PBE, PBE+U, HSE06, vdW-DF" },
    ]
  },
  {
    id: "monte_carlo",
    label: "Monte Carlo / Statistical",
    icon: FlaskConical,
    color: "from-green-500 to-emerald-600",
    engines: ["RASPA", "CASSANDRA", "Faunus", "GOMC", "BOSS"],
    description: "Phase equilibria, adsorption isotherms, grand canonical MC, free energy",
    fields: [
      { key: "system", label: "System Description", placeholder: "e.g. CO2 adsorption in MOF-5 at 298K" },
      { key: "ensemble", label: "Ensemble", placeholder: "e.g. GCMC, NPT, NVT, Gibbs", default: "GCMC" },
      { key: "temperature", label: "Temperature (K)", placeholder: "e.g. 298", default: "298" },
      { key: "property", label: "Property to Calculate", placeholder: "e.g. adsorption isotherm, Henry constant, selectivity" },
    ]
  },
  {
    id: "environmental",
    label: "Environmental / Green Chem",
    icon: Globe,
    color: "from-lime-500 to-green-600",
    engines: ["ORCA", "RDKit", "OpenBabel", "EPI Suite", "ECOSAR"],
    description: "Pollutant degradation, atmospheric chemistry, ecotoxicology, fate & transport",
    fields: [
      { key: "compound", label: "Compound / Pollutant", placeholder: "e.g. atrazine herbicide, PFAS, CO2" },
      { key: "environment", label: "Environmental Matrix", placeholder: "e.g. aquatic system pH 7, atmospheric OH radical" },
      { key: "process", label: "Process to Model", placeholder: "e.g. photodegradation, biodegradation, sorption" },
      { key: "metrics", label: "Metrics / Outputs", placeholder: "e.g. half-life, degradation products, ecotoxicity LC50" },
    ]
  },
  {
    id: "visualization",
    label: "Visualization & Analysis",
    icon: Eye,
    color: "from-fuchsia-500 to-pink-600",
    engines: ["VMD", "PyMOL", "Avogadro", "VESTA", "ChimeraX"],
    description: "Molecular visualization, trajectory analysis, electrostatic potential maps, 3D rendering",
    fields: [
      { key: "molecule_or_trajectory", label: "Molecule / Trajectory / PDB", placeholder: "e.g. protein.pdb, trajectory.xtc, C6H6 benzene" },
      { key: "viz_type", label: "Visualization Type", placeholder: "e.g. electrostatic potential map, orbital density, RMSD plot" },
      { key: "tool_preference", label: "Preferred Tool", placeholder: "e.g. VMD, PyMOL, Avogadro, VESTA, ChimeraX" },
      { key: "output_format", label: "Output Format", placeholder: "e.g. PNG image, movie, interactive session, script" },
    ]
  },
];

const DOMAIN_TAGS = ["Chemistry", "Biochemistry", "Drug Discovery", "Engineering", "Biology", "Environmental", "Materials Science", "Biophysics"];

function SelectField({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function ComputationalSimulation() {
  const { user } = useContext(AuthContext);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [inputs, setInputs] = useState({});
  const [domain, setDomain] = useState("Chemistry");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");

  const handleInputChange = (key, value) => setInputs(prev => ({ ...prev, [key]: value }));

  const handleSelectType = (typeId) => {
    setSelectedType(typeId);
    setInputs({});
    setResults(null);
    const sim = SIM_TYPES.find(s => s.id === typeId);
    setSelectedEngine(sim?.engines[0] || null);
    // Pre-fill defaults
    const defaults = {};
    sim?.fields.forEach(f => { if (f.default) defaults[f.key] = f.default; });
    setInputs(defaults);
  };

  const handleRun = async () => {
    if (!selectedType) return;
    const sim = SIM_TYPES.find(s => s.id === selectedType);
    const inputSummary = sim.fields.map(f => `${f.label}: ${inputs[f.key] || 'not specified'}`).join('\n');

    setIsRunning(true);
    setResults(null);

    const prompt = `You are a computational chemistry expert. A researcher wants to run a ${sim.label} simulation using ${selectedEngine} for ${domain}.

Parameters:
${inputSummary}

Provide a focused, technical analysis. Return JSON with:
1. system_overview: Brief 2-3 sentence description
2. computational_approach: Method justification (3-4 sentences)  
3. predicted_results: { summary: string, key_values: [{property, value, unit, interpretation}] } — include 4-6 realistic numerical results
4. scientific_interpretation: What results mean (3-4 sentences)
5. bash_script: Complete, ready-to-run ${selectedEngine} input file or bash script with comments
6. visualization_commands: ${selectedEngine === 'VMD' || selectedEngine === 'PyMOL' || selectedEngine === 'Avogadro' ? 'Specific visualization commands/scripts' : 'VMD/PyMOL/Avogadro commands to visualize output'}
7. limitations: 2-3 sentence limitation note
8. next_steps: array of 3 concise next steps
9. references: array of 2-3 real paper citations`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            system_overview: { type: "string" },
            computational_approach: { type: "string" },
            predicted_results: {
              type: "object",
              properties: {
                summary: { type: "string" },
                key_values: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      property: { type: "string" },
                      value: { type: "string" },
                      unit: { type: "string" },
                      interpretation: { type: "string" }
                    }
                  }
                }
              }
            },
            scientific_interpretation: { type: "string" },
            bash_script: { type: "string" },
            visualization_commands: { type: "string" },
            limitations: { type: "string" },
            next_steps: { type: "array", items: { type: "string" } },
            references: { type: "array", items: { type: "string" } }
          }
        }
      });

      setResults({ ...response, simType: sim, engine: selectedEngine, domain, inputs: { ...inputs } });
      setActiveTab("analysis");
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyScript = () => {
    if (results?.bash_script) {
      navigator.clipboard.writeText(results.bash_script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadScript = () => {
    if (!results?.bash_script) return;
    const ext = results.engine === "VASP" ? "INCAR" : results.engine === "Quantum ESPRESSO" ? "in" : "sh";
    const blob = new Blob([results.bash_script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suttain_${results.simType.id}_${results.engine}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => { setSelectedType(null); setInputs({}); setResults(null); setSelectedEngine(null); };
  const sim = selectedType ? SIM_TYPES.find(s => s.id === selectedType) : null;

  return (
    <AuthGate featureName="Computational Simulation" featureDescription="AI-powered computational chemistry simulations.">
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Cpu className="w-4 h-4" /> Computational Science Lab
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Computational Simulations</h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-base">
              AI-powered molecular modeling — DFT, MD, drug discovery, QM, materials science, Monte Carlo, and visualization tools.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {DOMAIN_TAGS.map(d => (
                <button key={d} onClick={() => setDomain(d)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${domain === d ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}>
                  {d}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results View */}
          {results && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit mx-auto">
                {[
                  { id: "analysis", label: "Analysis", icon: Microscope },
                  { id: "script", label: `${results.engine} Script`, icon: Cpu },
                  { id: "viz", label: "Visualization", icon: Eye },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-violet-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`}>
                    <tab.icon className="w-4 h-4" />{tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "analysis" && (
                <div className="space-y-5">
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-violet-600" /> System Overview</h3>
                      <p className="text-slate-700 text-sm leading-relaxed">{results.system_overview}</p>
                    </CardContent>
                  </Card>

                  {results.predicted_results?.key_values?.length > 0 && (
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-teal-600" /> Predicted Results</h3>
                        <p className="text-slate-600 text-sm mb-4">{results.predicted_results.summary}</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                {["Property","Value","Unit","Interpretation"].map(h => (
                                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-slate-600 uppercase">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {results.predicted_results.key_values.map((row, i) => (
                                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                  <td className="px-3 py-2 font-medium text-slate-800">{row.property}</td>
                                  <td className="px-3 py-2 font-mono text-violet-700 font-bold">{row.value}</td>
                                  <td className="px-3 py-2 text-slate-500">{row.unit}</td>
                                  <td className="px-3 py-2 text-slate-600 text-xs">{row.interpretation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Beaker className="w-4 h-4 text-blue-600" /> Computational Approach</h3>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{results.computational_approach}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Dna className="w-4 h-4 text-pink-600" /> Scientific Interpretation</h3>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{results.scientific_interpretation}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {results.limitations && (
                    <Card className="border-amber-200 bg-amber-50">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Limitations</h3>
                        <p className="text-amber-700 text-sm">{results.limitations}</p>
                      </CardContent>
                    </Card>
                  )}

                  {results.next_steps?.length > 0 && (
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-600" /> Next Steps</h3>
                        <ul className="space-y-2">
                          {results.next_steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {results.references?.length > 0 && (
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-slate-600" /> References</h3>
                        <ul className="space-y-1">{results.references.map((ref,i) => <li key={i} className="text-xs text-slate-600 font-mono">{ref}</li>)}</ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "script" && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-violet-600" /> {results.engine} Script
                        <Badge className="bg-green-100 text-green-700 text-xs">Ready to Run</Badge>
                      </h3>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleCopyScript} className="gap-2">
                          {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                        <Button size="sm" onClick={handleDownloadScript} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                          <Download className="w-4 h-4" /> Download
                        </Button>
                      </div>
                    </div>
                    <pre className="bg-slate-900 text-green-300 rounded-xl p-5 overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap">
                      {results.bash_script}
                    </pre>
                    <p className="text-xs text-slate-500 mt-3">⚠️ Review paths, resource allocations, and parameters before running on your HPC cluster.</p>
                  </CardContent>
                </Card>
              )}

              {activeTab === "viz" && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-fuchsia-600" /> Visualization & Analysis Commands</h3>
                    <pre className="bg-slate-900 text-cyan-300 rounded-xl p-5 overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap">
                      {results.visualization_commands}
                    </pre>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-center mt-6 gap-3">
                <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="w-4 h-4" />New Simulation</Button>
                <Button onClick={handleRun} disabled={isRunning} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                  Re-run Analysis
                </Button>
              </div>
            </motion.div>
          )}

          {/* Sim Type Cards */}
          {!results && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {SIM_TYPES.map(s => {
                  const Icon = s.icon;
                  const isSelected = selectedType === s.id;
                  return (
                    <motion.button key={s.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectType(s.id)}
                      className={`text-left p-5 rounded-2xl border-2 transition-all ${isSelected ? "border-violet-500 bg-violet-50 shadow-lg" : "border-slate-200 bg-white hover:border-violet-300 hover:shadow"}`}>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1">{s.label}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">{s.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {s.engines.slice(0, 3).map(e => (
                          <span key={e} className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{e}</span>
                        ))}
                        {s.engines.length > 3 && <span className="inline-block bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">+{s.engines.length - 3}</span>}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Config Form */}
              <AnimatePresence>
                {selectedType && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Card className="border-2 border-violet-200">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sim.color} flex items-center justify-center`}>
                            <sim.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h2 className="font-bold text-slate-900">{sim.label}</h2>
                            <p className="text-xs text-slate-500">{domain}</p>
                          </div>
                        </div>

                        {/* Engine selector */}
                        <div className="mb-5">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Software / Engine</label>
                          <div className="flex flex-wrap gap-2">
                            {sim.engines.map(e => (
                              <button key={e} onClick={() => setSelectedEngine(e)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selectedEngine === e ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}>
                                {e}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                          {sim.fields.map(field => (
                            field.type === "select" ? (
                              <SelectField key={field.key} label={field.label} options={field.options}
                                value={inputs[field.key] || field.default || field.options[0]}
                                onChange={v => handleInputChange(field.key, v)} />
                            ) : (
                              <div key={field.key}>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">{field.label}</label>
                                <input type="text" value={inputs[field.key] ?? ""}
                                  onChange={e => handleInputChange(field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white" />
                              </div>
                            )
                          ))}
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Additional Notes (optional)</label>
                            <input type="text" value={inputs.notes ?? ""}
                              onChange={e => handleInputChange("notes", e.target.value)}
                              placeholder="Any special requirements or context..."
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button onClick={handleRun} disabled={isRunning}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold px-8 py-2 rounded-xl gap-2">
                            {isRunning
                              ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
                              : <><Cpu className="w-4 h-4" /> Run Simulation</>}
                          </Button>
                          <p className="text-xs text-slate-500">AI analysis + {selectedEngine} script · ~5-10 seconds</p>
                        </div>

                        {isRunning && (
                          <div className="mt-4 bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-violet-600 animate-spin flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-violet-800">Computing {sim.label}…</p>
                              <p className="text-xs text-violet-600">Generating {selectedEngine} script, predicted results & analysis…</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {!selectedType && (
                <div className="text-center py-12 text-slate-400">
                  <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a simulation type above to get started</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGate>
  );
}