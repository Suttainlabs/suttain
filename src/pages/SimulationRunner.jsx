import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SIM_TYPES } from "./ComputationalSimulation";
import MoleculeDrawer from "../components/simulation/MoleculeDrawer";
import MolViewer from "../components/simulation/MolViewer";
import TrajectoryViewer from "../components/simulation/TrajectoryViewer";
import CustomForcefieldManager from "../components/simulation/CustomForcefieldManager";
import ToolFeedbackToast from "../components/shared/ToolFeedbackToast";
import PlainLanguageSummary from "../components/computational/PlainLanguageSummary";
import SustainabilityProfileCard from "../components/computational/SustainabilityProfileCard";
import RelatedResearch from "../components/computational/RelatedResearch";
import SimulationHistoryPanel from "../components/computational/SimulationHistoryPanel";
import SimulationPresets from "../components/computational/SimulationPresets";
import PubChemSearch from "../components/computational/PubChemSearch";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import AuthContext from "../components/auth/AuthContext";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import {
  Cpu, ChevronLeft, Beaker, Dna, Download, Copy, CheckCircle2,
  Loader2, RotateCcw, BookOpen, Microscope, Activity, AlertTriangle,
  Eye, SlidersHorizontal, Film, ChevronRight, FlaskConical, ArrowRight, Info
} from "lucide-react";

function SelectField({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white text-slate-800"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function SimulationRunner() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const typeId = params.get("type");
  const domain = params.get("domain") || "Chemistry";

  const sim = SIM_TYPES.find(s => s.id === typeId);

  const [selectedEngine, setSelectedEngine] = useState(sim?.engines[0] || null);
  const [inputs, setInputs] = useState(() => {
    const defaults = {};
    sim?.fields.forEach(f => { if (f.default) defaults[f.key] = f.default; });
    return defaults;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");
  const [showFeedback, setShowFeedback] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTargetKey, setDrawerTargetKey] = useState(null);
  const [ffManagerOpen, setFfManagerOpen] = useState(false);
  const [customForcefield, setCustomForcefield] = useState(null);

  const DRAWABLE_KEYS = ['molecule', 'ligand', 'compound', 'system', 'surface', 'reactants'];

  const ENGINE_TOOLTIPS = {
    "ORCA": "Best for accurate electronic structure calculations on medium-sized molecules.",
    "Gaussian": "Industry-standard for a wide range of quantum chemistry calculations.",
    "Psi4": "Open-source, highly accurate quantum chemistry for small to medium molecules.",
    "NWChem": "Scalable high-performance chemistry for large molecular systems.",
    "CP2K": "Efficient for large periodic systems and ab initio molecular dynamics.",
    "GROMACS": "Best for high-speed MD simulations of proteins and biomolecular systems.",
    "AMBER": "Optimized for biomolecular simulations with well-validated force fields.",
    "NAMD": "Scales well on large HPC clusters for very large biomolecular systems.",
    "OpenMM": "GPU-accelerated MD with flexible Python scripting support.",
    "LAMMPS": "Versatile MD engine for materials science and engineering applications.",
    "AutoDock Vina": "Fast and accurate rigid/flexible receptor docking for drug discovery.",
    "Glide": "High-throughput virtual screening with extra precision docking modes.",
    "DOCK6": "Flexible docking with energy scoring for structure-based drug design.",
    "RDKit": "Open-source cheminformatics for ADMET prediction and ligand preparation.",
    "OpenBabel": "Chemical file format interconversion and property prediction toolkit.",
    "VASP": "Industry standard for periodic DFT in materials and surface science.",
    "Quantum ESPRESSO": "Open-source plane-wave DFT for solids, surfaces, and nanostructures.",
    "AlphaFold": "State-of-the-art AI protein structure prediction from sequence.",
    "Rosetta": "Versatile platform for protein design, docking, and loop modeling.",
    "Modeller": "Comparative homology modeling from known template structures.",
    "RASPA": "Monte Carlo and MD for adsorption, diffusion, and phase equilibria in porous materials.",
    "VASP": "Plane-wave DFT for periodic systems, surfaces, and bulk materials.",
    "EPI Suite": "EPA tool for estimating environmental fate and ecotoxicity of chemicals.",
    "ECOSAR": "Estimates aquatic toxicity from chemical structure using SAR relationships.",
    "VMD": "Powerful molecular visualization for trajectories and electrostatic maps.",
    "PyMOL": "Publication-quality 3D protein and small molecule visualization.",
    "VESTA": "Crystal structure visualization and electron density analysis.",
    "SchNet": "Graph neural network potential for fast, accurate molecular dynamics.",
    "MACE": "State-of-the-art equivariant ML potential for large and complex systems.",
    "DWSIM": "Open-source process simulator for chemical and petrochemical flowsheets.",
  };

  useEffect(() => {
    if (!sim) navigate("/ComputationalSimulation");
  }, [sim, navigate]);

  if (!sim) return null;

  const handleInputChange = (key, value) => setInputs(prev => ({ ...prev, [key]: value }));

  const openDrawer = (fieldKey) => { setDrawerTargetKey(fieldKey); setDrawerOpen(true); };
  const handleDrawerConfirm = (smiles) => { if (drawerTargetKey) handleInputChange(drawerTargetKey, smiles); };

  const handlePresetSelect = (preset) => {
    if (preset.engine) setSelectedEngine(preset.engine);
    if (preset.fields) setInputs(prev => ({ ...prev, ...preset.fields }));
  };

  const handlePubChemSelect = (compound) => {
    const moleculeField = sim.fields.find(f => ['molecule', 'ligand', 'compound', 'system'].includes(f.key));
    if (moleculeField) {
      const value = compound.smiles ? `${compound.name} ${compound.smiles}` : compound.name;
      handleInputChange(moleculeField.key, value);
    }
  };

  const handleSendToFormula = () => {
    const molecule = inputs.molecule || inputs.ligand || inputs.compound || inputs.system || "";
    const smiles = molecule.includes(" ") ? molecule.split(" ").slice(1).join(" ") : "";
    const stability = results?.predicted_results?.key_values?.find(k =>
      k.property?.toLowerCase().includes("stab") || k.property?.toLowerCase().includes("energy")
    );
    const params = new URLSearchParams({
      from_simulation: "1",
      molecule: molecule.split(" ")[0] || molecule,
      smiles: smiles,
      sim_type: sim?.label || "",
      stability: stability?.value || "",
      safety_level: results?.predicted_results?.summary?.slice(0, 120) || "",
    });
    window.location.href = `/generator?${params.toString()}`;
  };

  const handleRun = async () => {
    const inputSummary = sim.fields.map(f => `${f.label}: ${inputs[f.key] || 'not specified'}`).join('\n');
    setIsRunning(true);
    setResults(null);

    const customFFNote = customForcefield && typeId === "molecular_dynamics"
      ? `\n\nCustom Forcefield: "${customForcefield.name}" (extends ${customForcefield.base_forcefield})
${customForcefield.description ? `Description: ${customForcefield.description}` : ""}
${customForcefield.lj_parameters?.length ? `LJ params: ${customForcefield.lj_parameters.map(p => `${p.atom_type}: ε=${p.epsilon} kJ/mol, σ=${p.sigma} nm`).join("; ")}` : ""}
${customForcefield.bond_parameters?.length ? `Bond params: ${customForcefield.bond_parameters.map(p => `${p.atom1}-${p.atom2}: k=${p.k_bond}, r0=${p.r0}`).join("; ")}` : ""}
${customForcefield.angle_parameters?.length ? `Angle params: ${customForcefield.angle_parameters.map(p => `${p.atom1}-${p.atom2}-${p.atom3}: k=${p.k_angle}, θ0=${p.theta0}`).join("; ")}` : ""}
${customForcefield.dihedral_parameters?.length ? `Dihedral params: ${customForcefield.dihedral_parameters.map(p => `${p.atom1}-${p.atom2}-${p.atom3}-${p.atom4}: k=${p.k_dihedral}, n=${p.n}, δ=${p.delta}`).join("; ")}` : ""}
Incorporate these custom parameters into the simulation script.` : "";

    const prompt = `You are a computational chemistry expert. A researcher wants to run a ${sim.label} simulation using ${selectedEngine} for ${domain}.

Parameters:
${inputSummary}${customFFNote}

Provide a focused, technical analysis. Return JSON with:
1. system_overview: Brief 2-3 sentence description
2. computational_approach: Method justification (3-4 sentences)
3. predicted_results: { summary: string, key_values: [{property, value, unit, interpretation}] } — include 4-6 realistic numerical results
4. scientific_interpretation: What results mean (3-4 sentences)
5. bash_script: Complete, ready-to-run ${selectedEngine} input file or bash script with comments
6. visualization_commands: Visualization commands/scripts
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
      if (user) {
        try {
          await base44.auth.updateMe({ reward_points: (user.reward_points || 0) + 50 });
          if (refreshUser) await refreshUser();
        } catch {}
      }
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 15000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const generatePDFReport = () => {
    if (!results) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = 0;

    const addPage = () => { doc.addPage(); y = margin; };
    const checkY = (needed = 10) => { if (y + needed > pageH - 15) addPage(); };

    doc.setFillColor(109, 40, 217);
    doc.rect(0, 0, pageW, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Computational Simulation Report", margin, 12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated by Suttain  ·  ${new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}`, margin, 21);
    doc.text(`Engine: ${results.engine}  ·  Domain: ${results.domain}`, pageW - margin, 21, { align: "right" });
    y = 38;

    const sectionTitle = (title) => {
      checkY(14);
      doc.setDrawColor(109, 40, 217);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + contentW, y);
      y += 3;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 50);
      doc.text(title, margin, y + 4);
      y += 10;
    };

    const bodyText = (text, indent = 0) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 80);
      const lines = doc.splitTextToSize(text, contentW - indent);
      lines.forEach(line => { checkY(6); doc.text(line, margin + indent, y); y += 5; });
    };

    if (results.system_overview) { sectionTitle("System Overview"); bodyText(results.system_overview); y += 3; }
    if (results.predicted_results?.key_values?.length > 0) {
      sectionTitle("Predicted Results");
      if (results.predicted_results.summary) { bodyText(results.predicted_results.summary); y += 2; }
    }
    if (results.computational_approach) { sectionTitle("Computational Approach"); bodyText(results.computational_approach); y += 3; }
    if (results.scientific_interpretation) { sectionTitle("Scientific Interpretation"); bodyText(results.scientific_interpretation); y += 3; }
    if (results.limitations) {
      checkY(18);
      doc.setFillColor(255, 251, 235);
      const limLines = doc.splitTextToSize(results.limitations, contentW - 12);
      const limH = limLines.length * 5 + 10;
      doc.roundedRect(margin, y, contentW, limH, 2, 2, "F");
      doc.setTextColor(120, 60, 0);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Limitations", margin + 4, y + 6);
      doc.setFont("helvetica", "normal");
      limLines.forEach((l, li) => { doc.text(l, margin + 4, y + 12 + li * 5); });
      y += limH + 5;
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(245, 243, 255);
      doc.rect(0, pageH - 10, pageW, 10, "F");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 80, 200);
      doc.setFont("helvetica", "normal");
      doc.text("Generated by Suttain Computational Science Lab — suttain.com", margin, pageH - 3.5);
      doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 3.5, { align: "right" });
    }

    doc.save(`suttain-${sim.id}-${selectedEngine}-report.pdf`);
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
    const ext = selectedEngine === "VASP" ? "INCAR" : selectedEngine === "Quantum ESPRESSO" ? "in" : "sh";
    const blob = new Blob([results.bash_script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suttain_${sim.id}_${selectedEngine}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => { setResults(null); setInputs({}); };
  const Icon = sim.icon;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDF7F2' }}>
      <ToolFeedbackToast
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        feature="computational"
        featureLabel="Computational Simulation"
        user={user}
        pointsToAward={50}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Back + Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/ComputationalSimulation")}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-700 font-medium mb-5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Simulations
          </button>

          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${sim.color} flex items-center justify-center shadow-md flex-shrink-0`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{domain}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{sim.label}</h1>
              <p className="text-slate-500 text-sm mt-0.5">{sim.description}</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8">
              {/* Result Tabs */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit">
                {[
                  { id: "analysis", label: "Analysis", icon: Microscope },
                  { id: "script", label: `${results.engine} Script`, icon: Cpu },
                  { id: "viz", label: "Visualization", icon: Eye },
                  ...((typeId === "molecular_dynamics" || typeId === "protein_modeling" || typeId === "biomolecular_dynamics")
                    ? [{ id: "trajectory", label: "Trajectory", icon: Film }]
                    : []),
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-violet-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`}>
                    <tab.icon className="w-4 h-4" />{tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "analysis" && (
                <div className="space-y-5">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-violet-600" /> System Overview</h3>
                      <p className="text-slate-700 text-sm leading-relaxed">{results.system_overview}</p>
                    </CardContent>
                  </Card>

                  {results.predicted_results?.key_values?.length > 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-teal-600" /> Predicted Results</h3>
                        <p className="text-slate-600 text-sm mb-4">{results.predicted_results.summary}</p>
                        <div className="overflow-x-auto rounded-xl border border-slate-100">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50">
                                {["Property","Value","Unit","Interpretation"].map(h => (
                                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {results.predicted_results.key_values.map((row, i) => (
                                <tr key={i} className="border-t border-slate-100 hover:bg-violet-50 transition-colors">
                                  <td className="px-4 py-3 font-medium text-slate-800">{row.property}</td>
                                  <td className="px-4 py-3 font-mono text-violet-700 font-bold">{row.value}</td>
                                  <td className="px-4 py-3 text-slate-500 text-xs">{row.unit}</td>
                                  <td className="px-4 py-3 text-slate-600 text-xs">{row.interpretation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Beaker className="w-4 h-4 text-blue-600" /> Computational Approach</h3>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{results.computational_approach}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Dna className="w-4 h-4 text-pink-600" /> Scientific Interpretation</h3>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{results.scientific_interpretation}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {results.limitations && (
                    <Card className="border-amber-200 bg-amber-50 border shadow-sm">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Limitations</h3>
                        <p className="text-amber-700 text-sm">{results.limitations}</p>
                      </CardContent>
                    </Card>
                  )}

                  {results.next_steps?.length > 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-600" /> Next Steps</h3>
                        <ul className="space-y-2">
                          {results.next_steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                              <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {results.references?.length > 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-slate-600" /> References</h3>
                        <ul className="space-y-1">{results.references.map((ref,i) => <li key={i} className="text-xs text-slate-600 font-mono">{ref}</li>)}</ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "script" && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
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
                    <p className="text-xs text-slate-500 mt-3">Review paths, resource allocations, and parameters before running on your HPC cluster.</p>
                  </CardContent>
                </Card>
              )}

              {activeTab === "trajectory" && (
                <TrajectoryViewer initialPdbId={
                  results.inputs?.system?.match(/^[A-Za-z0-9]{4}$/) ? results.inputs.system :
                  results.inputs?.sequence?.match(/^[A-Za-z0-9]{4}$/) ? results.inputs.sequence : null
                } />
              )}

              {activeTab === "viz" && (
                <div className="space-y-5">
                  <MolViewer simType={results.simType?.id} inputs={results.inputs} />
                  {results.visualization_commands && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-fuchsia-600" /> CLI Visualization Commands</h3>
                        <pre className="bg-slate-900 text-cyan-300 rounded-xl p-5 overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap">
                          {results.visualization_commands}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Plain Language Summary */}
              <div className="mt-5">
                <PlainLanguageSummary
                  results={results}
                  simLabel={sim?.label}
                  domain={domain}
                />
              </div>

              {/* Sustainability Profile */}
              <div className="mt-5">
                <SustainabilityProfileCard
                  results={results}
                  molecule={results?.inputs?.molecule || results?.inputs?.compound || results?.inputs?.ligand || results?.inputs?.system}
                />
              </div>

              {/* Send to Formula Generator */}
              <div className="mt-5">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="font-bold text-teal-900 text-sm">Send to Formula Generator</p>
                    <p className="text-xs text-teal-700 mt-0.5">Pass this molecule's validated data directly into the formulation workflow.</p>
                  </div>
                  <Button
                    onClick={handleSendToFormula}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white gap-2 flex-shrink-0"
                  >
                    <FlaskConical className="w-4 h-4" />
                    Send to Formula Generator
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Related Research */}
              <div className="mt-5">
                <RelatedResearch
                  molecule={results?.inputs?.molecule || results?.inputs?.compound || results?.inputs?.ligand || results?.inputs?.system}
                  simType={sim?.label}
                />
              </div>

              <div className="flex justify-center mt-8 gap-3 flex-wrap">
                <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="w-4 h-4" />New Simulation</Button>
                <Button onClick={generatePDFReport} variant="outline" className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50">
                  <Download className="w-4 h-4" /> Generate Report
                </Button>
                <Button onClick={handleRun} disabled={isRunning} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                  Re-run Analysis
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History & Comparison — always visible */}
        <div className="mt-8">
          <SimulationHistoryPanel
            currentResults={results}
            currentInputs={inputs}
            simTypeId={typeId}
            engine={selectedEngine}
          />
        </div>

        {/* Config Form */}
        {!results && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Simulation Presets */}
            <SimulationPresets onSelectPreset={handlePresetSelect} />

            <Card className="border-0 shadow-md">
              <CardContent className="p-6 md:p-8">

                {/* PubChem Auto-fill */}
                <PubChemSearch onSelect={handlePubChemSelect} />

                {/* Engine selector */}
                <div className="mb-7">
                  <label className="block text-xs font-semibold text-slate-500 mb-2.5 uppercase tracking-widest">Software / Engine</label>
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-2">
                      {sim.engines.map(e => (
                        <Tooltip key={e}>
                          <TooltipTrigger asChild>
                            <button onClick={() => setSelectedEngine(e)}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                                selectedEngine === e
                                  ? "bg-violet-600 text-white border-violet-600 shadow"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                              }`}>
                              {e}
                              {ENGINE_TOOLTIPS[e] && <Info className="w-3 h-3 opacity-60" />}
                            </button>
                          </TooltipTrigger>
                          {ENGINE_TOOLTIPS[e] && (
                            <TooltipContent side="bottom" className="max-w-xs text-xs">
                              {ENGINE_TOOLTIPS[e]}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>

                {/* Custom Forcefield picker — MD only */}
                {typeId === "molecular_dynamics" && (
                  <div className="mb-7 p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-semibold text-teal-800">Custom Forcefield Parameters</p>
                        {customForcefield ? (
                          <p className="text-xs text-teal-600 mt-0.5">
                            Using: <span className="font-bold">{customForcefield.name}</span>
                            <span className="ml-1 text-teal-500">({customForcefield.base_forcefield})</span>
                          </p>
                        ) : (
                          <p className="text-xs text-teal-600 mt-0.5">Optionally load saved LJ, bond, angle & dihedral overrides</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {customForcefield && (
                          <button onClick={() => setCustomForcefield(null)}
                            className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                            Remove
                          </button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setFfManagerOpen(true)}
                          className="gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-100 text-xs">
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          {customForcefield ? "Change / Edit" : "Load Custom FF"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
                  {sim.fields.map(field => (
                    field.type === "select" ? (
                      <SelectField key={field.key} label={field.label} options={field.options}
                        value={inputs[field.key] || field.default || field.options[0]}
                        onChange={v => handleInputChange(field.key, v)} />
                    ) : (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{field.label}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={inputs[field.key] ?? ""}
                            onChange={e => handleInputChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="flex-1 px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
                          />
                          {DRAWABLE_KEYS.includes(field.key) && (
                            <button
                              type="button"
                              onClick={() => openDrawer(field.key)}
                              className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold transition-colors">
                              Draw
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Additional Notes (optional)</label>
                    <input type="text" value={inputs.notes ?? ""}
                      onChange={e => handleInputChange("notes", e.target.value)}
                      placeholder="Any special requirements or context..."
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white" />
                  </div>
                </div>

                {/* Run button */}
                <div className="flex items-center gap-4 flex-wrap">
                  <Button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold px-8 py-2.5 rounded-xl gap-2 shadow-md"
                  >
                    {isRunning
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
                      : <><Cpu className="w-4 h-4" /> Run Simulation and Analyze</>}
                  </Button>
                  <p className="text-xs text-slate-400">AI analysis + {selectedEngine} script · 5-10 seconds</p>
                </div>

                {isRunning && (
                  <div className="mt-5 bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-violet-600 animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-violet-800">Computing {sim.label}…</p>
                      <p className="text-xs text-violet-500">Generating {selectedEngine} script, predicted results & analysis…</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>

      <MoleculeDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onConfirm={handleDrawerConfirm}
        initialSmiles={drawerTargetKey ? (inputs[drawerTargetKey] || '') : ''}
      />

      <CustomForcefieldManager
        isOpen={ffManagerOpen}
        onClose={() => setFfManagerOpen(false)}
        onSelect={(ff) => { setCustomForcefield(ff); setFfManagerOpen(false); }}
      />
    </div>
  );
}