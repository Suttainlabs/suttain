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
  Microscope, Globe, Beaker, Activity, AlertTriangle
} from "lucide-react";

const SIM_TYPES = [
  {
    id: "dft",
    label: "DFT / Quantum Chemistry",
    icon: Atom,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 border-violet-200",
    engine: "ORCA",
    description: "Density Functional Theory — electronic structure, energies, molecular orbitals",
    fields: [
      { key: "molecule", label: "Molecule / SMILES / Formula", placeholder: "e.g. H2O, C6H6, CC(=O)O" },
      { key: "functional", label: "DFT Functional", placeholder: "e.g. B3LYP, PBE0, M06-2X", default: "B3LYP" },
      { key: "basis_set", label: "Basis Set", placeholder: "e.g. 6-31G*, def2-TZVP", default: "6-31G*" },
      { key: "task", label: "Calculation Task", placeholder: "e.g. geometry optimization, frequency, single point, NMR" },
    ]
  },
  {
    id: "molecular_dynamics",
    label: "Molecular Dynamics",
    icon: Activity,
    color: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50 border-teal-200",
    engine: "GROMACS / AMBER",
    description: "MD simulation — protein folding, membrane dynamics, ligand binding, trajectories",
    fields: [
      { key: "system", label: "System Description", placeholder: "e.g. Lysozyme protein in water box, 50ns simulation" },
      { key: "force_field", label: "Force Field", placeholder: "e.g. AMBER99SB-ILDN, CHARMM36, GROMOS96", default: "AMBER99SB-ILDN" },
      { key: "temperature", label: "Temperature (K)", placeholder: "e.g. 300", default: "300" },
      { key: "simulation_time", label: "Simulation Time", placeholder: "e.g. 100 ns, 10 ns NPT" },
    ]
  },
  {
    id: "drug_discovery",
    label: "Drug Discovery / Docking",
    icon: Pill,
    color: "from-pink-500 to-rose-600",
    bg: "bg-pink-50 border-pink-200",
    engine: "AutoDock / ORCA",
    description: "Ligand-receptor docking, ADMET prediction, binding affinity, pharmacophore",
    fields: [
      { key: "ligand", label: "Ligand (drug candidate)", placeholder: "e.g. Ibuprofen, aspirin, or SMILES string" },
      { key: "receptor", label: "Target Receptor / Protein", placeholder: "e.g. COX-2 enzyme, ACE2 receptor, PDB: 1CX2" },
      { key: "binding_site", label: "Binding Site / Region", placeholder: "e.g. active site, allosteric pocket" },
      { key: "properties", label: "Properties to Predict", placeholder: "e.g. binding affinity, ADMET, LogP, toxicity" },
    ]
  },
  {
    id: "protein_modeling",
    label: "Protein / Biomolecular",
    icon: Dna,
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 border-blue-200",
    engine: "GROMACS / AMBER",
    description: "Protein structure prediction, homology modeling, secondary structure, folding",
    fields: [
      { key: "sequence", label: "Protein / Sequence", placeholder: "e.g. MKTIIALSYIFCLVFA... or UniProt ID: P12345" },
      { key: "analysis_type", label: "Analysis Type", placeholder: "e.g. secondary structure, stability, RMSD, binding site" },
      { key: "environment", label: "Environment / Solvent", placeholder: "e.g. physiological pH 7.4, lipid bilayer, vacuum" },
      { key: "mutations", label: "Mutations (optional)", placeholder: "e.g. G12V, K45R (comma separated)" },
    ]
  },
  {
    id: "quantum_mechanics",
    label: "Quantum Mechanics / QM-MM",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 border-amber-200",
    engine: "ORCA / NWChem",
    description: "Electronic structure, excited states, TDDFT, reaction pathways, transition states",
    fields: [
      { key: "system", label: "Chemical System", placeholder: "e.g. photocatalytic water splitting, reaction A→B→C" },
      { key: "method", label: "QM Method", placeholder: "e.g. CCSD(T), MP2, TDDFT, HF", default: "B3LYP/6-31G*" },
      { key: "properties", label: "Properties of Interest", placeholder: "e.g. excitation energies, reaction barrier, dipole moment" },
      { key: "environment", label: "Environment", placeholder: "e.g. gas phase, solvent: water (PCM)" },
    ]
  },
  {
    id: "environmental",
    label: "Environmental / Green Chem",
    icon: Globe,
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-50 border-green-200",
    engine: "ORCA / Python",
    description: "Pollutant degradation, atmospheric reactions, soil/water interactions, ecotoxicology",
    fields: [
      { key: "compound", label: "Compound / Pollutant", placeholder: "e.g. atrazine herbicide, PFAS compound, CO2" },
      { key: "environment", label: "Environmental Matrix", placeholder: "e.g. aquatic system pH 7, atmospheric OH radical reaction" },
      { key: "process", label: "Process to Model", placeholder: "e.g. photodegradation, biodegradation, sorption, fate & transport" },
      { key: "metrics", label: "Metrics / Outputs", placeholder: "e.g. half-life, degradation products, ecotoxicity LC50" },
    ]
  },
];

const DOMAIN_TAGS = ["Chemistry", "Biochemistry", "Drug Discovery", "Engineering", "Biology", "Environmental", "Materials Science", "Biophysics"];

export default function ComputationalSimulation() {
  const { user } = useContext(AuthContext);
  const [selectedType, setSelectedType] = useState(null);
  const [inputs, setInputs] = useState({});
  const [domain, setDomain] = useState("Chemistry");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");

  const handleInputChange = (key, value) => setInputs(prev => ({ ...prev, [key]: value }));

  const handleRun = async () => {
    if (!selectedType) return;
    const sim = SIM_TYPES.find(s => s.id === selectedType);
    const inputSummary = sim.fields.map(f => `${f.label}: ${inputs[f.key] || f.default || 'not specified'}`).join('\n');

    setIsRunning(true);
    setResults(null);

    const prompt = `You are a computational chemistry expert and professor. A researcher wants to run a ${sim.label} simulation using ${sim.engine} for the domain of ${domain}.

Simulation Parameters:
${inputSummary}

Provide a comprehensive computational analysis with the following structure:

1. SYSTEM OVERVIEW: Brief description of the system and what will be computed.
2. COMPUTATIONAL APPROACH: Which methods/levels of theory are appropriate and why.
3. PREDICTED RESULTS: Provide realistic numerical estimates/results with units:
   - Key calculated properties (energies, geometries, frequencies, binding affinities, etc.)
   - Tables where appropriate with values
4. SCIENTIFIC INTERPRETATION: What the results mean scientifically.
5. BASH SCRIPT (${sim.engine}): Provide a complete, ready-to-run bash script or input file for ${sim.engine} that researchers can use on a Linux HPC cluster. Include comments explaining each section.
6. VISUALIZATION & ANALYSIS: Commands/tools to visualize results (VMD, Avogadro, PyMOL, etc.)
7. LIMITATIONS & NEXT STEPS: Known limitations and recommended follow-up calculations.
8. REFERENCES: 2-3 key papers/resources.

Be technically precise with actual numbers and a real script.`;

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
          references: { type: "array", items: { type: "string" } },
          risk_notes: { type: "string" }
        }
      },
      model: "claude_sonnet_4_6"
    });

    setResults({ ...response, simType: sim, domain, inputs: { ...inputs } });
    setIsRunning(false);
    setActiveTab("analysis");
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
    const sim = results.simType;
    const blob = new Blob([results.bash_script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suttain_${sim.id}_simulation.sh`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setSelectedType(null);
    setInputs({});
    setResults(null);
  };

  const sim = selectedType ? SIM_TYPES.find(s => s.id === selectedType) : null;

  return (
    <AuthGate featureName="Computational Simulation" featureDescription="Run AI-powered computational chemistry simulations for DFT, MD, drug discovery, protein modeling and more.">
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Cpu className="w-4 h-4" />
              Computational Science Lab
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Computational Simulations
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-base">
              AI-powered molecular modeling, DFT, quantum mechanics, MD simulations & drug discovery —
              with ready-to-run scripts for ORCA, GROMACS, AMBER and more.
            </p>
            {/* Domain selector */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {DOMAIN_TAGS.map(d => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    domain === d
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results View */}
          {results && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit mx-auto">
                {[
                  { id: "analysis", label: "Analysis", icon: Microscope },
                  { id: "script", label: `${results.simType.engine} Script`, icon: Cpu },
                  { id: "viz", label: "Visualization", icon: FlaskConical },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? "bg-violet-600 text-white shadow"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "analysis" && (
                <div className="space-y-5">
                  {/* System Overview */}
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-violet-600" /> System Overview
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">{results.system_overview}</p>
                    </CardContent>
                  </Card>

                  {/* Key Results */}
                  {results.predicted_results?.key_values?.length > 0 && (
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-teal-600" /> Predicted Results
                        </h3>
                        <p className="text-slate-600 text-sm mb-4">{results.predicted_results.summary}</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600 uppercase">Property</th>
                                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600 uppercase">Value</th>
                                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600 uppercase">Unit</th>
                                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600 uppercase">Interpretation</th>
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

                  {/* Approach & Interpretation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <Beaker className="w-4 h-4 text-blue-600" /> Computational Approach
                        </h3>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{results.computational_approach}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <Dna className="w-4 h-4 text-pink-600" /> Scientific Interpretation
                        </h3>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{results.scientific_interpretation}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Limitations */}
                  {results.limitations && (
                    <Card className="border-amber-200 bg-amber-50">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Limitations & Considerations
                        </h3>
                        <p className="text-amber-700 text-sm">{results.limitations}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Next Steps */}
                  {results.next_steps?.length > 0 && (
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-green-600" /> Recommended Next Steps
                        </h3>
                        <ul className="space-y-2">
                          {results.next_steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* References */}
                  {results.references?.length > 0 && (
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-slate-600" /> Key References
                        </h3>
                        <ul className="space-y-1">
                          {results.references.map((ref, i) => (
                            <li key={i} className="text-xs text-slate-600 font-mono">{ref}</li>
                          ))}
                        </ul>
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
                        <Cpu className="w-4 h-4 text-violet-600" />
                        {results.simType.engine} Input / Bash Script
                        <Badge className="bg-green-100 text-green-700 text-xs">Ready to Run</Badge>
                      </h3>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleCopyScript} className="gap-2">
                          {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                        <Button size="sm" onClick={handleDownloadScript} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                          <Download className="w-4 h-4" />
                          Download .sh
                        </Button>
                      </div>
                    </div>
                    <pre className="bg-slate-900 text-green-300 rounded-xl p-5 overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap">
                      {results.bash_script}
                    </pre>
                    <p className="text-xs text-slate-500 mt-3">
                      ⚠️ Review and adapt paths, resource allocations, and parameters before running on your HPC cluster.
                    </p>
                  </CardContent>
                </Card>
              )}

              {activeTab === "viz" && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-teal-600" /> Visualization & Analysis Commands
                    </h3>
                    <pre className="bg-slate-900 text-cyan-300 rounded-xl p-5 overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap">
                      {results.visualization_commands}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Run again */}
              <div className="flex justify-center mt-6 gap-3">
                <Button variant="outline" onClick={reset} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  New Simulation
                </Button>
                <Button onClick={handleRun} disabled={isRunning} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                  Re-run Analysis
                </Button>
              </div>
            </motion.div>
          )}

          {/* Simulation Type Selector */}
          {!results && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {SIM_TYPES.map(s => {
                  const Icon = s.icon;
                  const isSelected = selectedType === s.id;
                  return (
                    <motion.button
                      key={s.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedType(s.id); setInputs({}); setResults(null); }}
                      className={`text-left p-5 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? "border-violet-500 bg-violet-50 shadow-lg"
                          : "border-slate-200 bg-white hover:border-violet-300 hover:shadow"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1">{s.label}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">{s.description}</p>
                      <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {s.engine}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Configuration Form */}
              <AnimatePresence>
                {selectedType && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="border-2 border-violet-200">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sim.color} flex items-center justify-center`}>
                            <sim.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h2 className="font-bold text-slate-900">{sim.label}</h2>
                            <p className="text-xs text-slate-500">{sim.engine} · {domain}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {sim.fields.map(field => (
                            <div key={field.key}>
                              <label className="block text-sm font-semibold text-slate-700 mb-1">{field.label}</label>
                              <input
                                type="text"
                                value={inputs[field.key] ?? field.default ?? ""}
                                onChange={e => handleInputChange(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                              />
                            </div>
                          ))}
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Additional Notes (optional)</label>
                            <input
                              type="text"
                              value={inputs.notes ?? ""}
                              onChange={e => handleInputChange("notes", e.target.value)}
                              placeholder="Any special requirements, constraints, or context..."
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold px-8 py-2 rounded-xl gap-2"
                          >
                            {isRunning
                              ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Simulation…</>
                              : <><Cpu className="w-4 h-4" /> Run Simulation</>
                            }
                          </Button>
                          <p className="text-xs text-slate-500">
                            AI analysis + {sim.engine} script · ~10-20 seconds
                          </p>
                        </div>

                        {isRunning && (
                          <div className="mt-4 bg-violet-50 border border-violet-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <Loader2 className="w-5 h-5 text-violet-600 animate-spin flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-violet-800">Computing {sim.label}…</p>
                                <p className="text-xs text-violet-600">Generating {sim.engine} input script, predicted results & analysis…</p>
                              </div>
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