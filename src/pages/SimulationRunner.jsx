import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SIM_TYPES } from "./ComputationalSimulation";
import MoleculeDrawer from "../components/simulation/MoleculeDrawer";
import MolViewer from "../components/simulation/MolViewer";
import TrajectoryViewer from "../components/simulation/TrajectoryViewer";
import CustomForcefieldManager from "../components/simulation/CustomForcefieldManager";
import EnvironmentalParametersPanel from "../components/simulation/EnvironmentalParametersPanel";
import ToolFeedbackToast from "../components/shared/ToolFeedbackToast";
import PlainLanguageSummary from "../components/computational/PlainLanguageSummary";
import SustainabilityProfileCard from "../components/computational/SustainabilityProfileCard";
import RelatedResearch from "../components/computational/RelatedResearch";
import SimulationHistoryPanel from "../components/computational/SimulationHistoryPanel";
import SimulationPresets from "../components/computational/SimulationPresets";
import DatabaseSearch from '@/components/computational/DatabaseSearch';
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import AuthContext from "../components/auth/AuthContext";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

import {
  Cpu, ChevronLeft, Beaker, Dna, Download, Copy, CheckCircle2,
  Loader2, RotateCcw, BookOpen, Microscope, Activity, AlertTriangle,
  Eye, SlidersHorizontal, Film, ChevronRight, Info, FileCode2, Upload
} from "lucide-react";
import SimulationInputFiles from "../components/computational/SimulationInputFiles";
import SimulationWorkflowHeader from '@/components/research/SimulationWorkflowHeader';
import SimulationWorkflowField from '@/components/research/SimulationWorkflowField';
import SimulationEngineSelector from '@/components/research/SimulationEngineSelector';
import ForcefieldAttachment from '@/components/simulation/ForcefieldAttachment';
import { generateSimulationInputs } from '@/functions/generateSimulationInputs';
import useTrialStatus from '@/hooks/useTrialStatus';
import SubscriptionLock from '@/components/shared/SubscriptionLock';
import PremiumFeatureGate from '@/components/shared/PremiumFeatureGate';

export default function SimulationRunner() {
  const { user, refreshUser } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const [typeId, setTypeId] = useState(params.get("type"));
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
  const [envParams, setEnvParams] = useState(null);
  const [currentJobHash, setCurrentJobHash] = useState(null);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [inputFiles, setInputFiles] = useState(null);
  const [generatingInputs, setGeneratingInputs] = useState(false);
  const fileAutoFillRef = useRef(null);
  const [fileAutoFillTarget, setFileAutoFillTarget] = useState(null);

  const DRAWABLE_KEYS = ['molecule', 'ligand', 'compound', 'system', 'surface', 'reactants'];
  const FILE_UPLOAD_KEYS = ['molecule', 'ligand', 'compound', 'system', 'molecule_or_trajectory', 'surface', 'reactants', 'sequence', 'material'];

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
    "RDKit": "Open-source cheminformatics for ADMET prediction and ligand preparation.",
    "OpenBabel": "Chemical file format interconversion and property prediction toolkit.",
    "VASP": "Industry standard for periodic DFT in materials and surface science.",
    "Quantum ESPRESSO": "Open-source plane-wave DFT for solids, surfaces, and nanostructures.",
    "AlphaFold": "State-of-the-art AI protein structure prediction from sequence.",
    "Rosetta": "Versatile platform for protein structure refinement and loop modeling.",
    "Modeller": "Comparative homology modeling from known template structures.",
    "RASPA": "Monte Carlo and MD for adsorption, diffusion, and phase equilibria in porous materials.",
    "EPI Suite": "EPA tool for estimating environmental fate and ecotoxicity of chemicals.",
    "ECOSAR": "Estimates aquatic toxicity from chemical structure using SAR relationships.",
    "VMD": "Powerful molecular visualization for trajectories and electrostatic maps.",
    "PyMOL": "Publication-quality 3D protein and small molecule visualization.",
    "VESTA": "Crystal structure visualization and electron density analysis.",
    "SchNet": "Graph neural network potential for fast, accurate molecular dynamics.",
    "MACE": "State-of-the-art equivariant ML potential for large and complex systems.",
    "Q-Chem": "Quantum chemistry, excited states and embedded QM/MM calculations for molecular systems.",
  };

  useEffect(() => {
    if (!sim) navigate("/ComputationalSimulation");
  }, [sim, navigate]);

  if (!sim) return null;

  const handleInputChange = (key, value) => setInputs(prev => ({ ...prev, [key]: value }));

  const openDrawer = (fieldKey) => { setDrawerTargetKey(fieldKey); setDrawerOpen(true); };
  const handleDrawerConfirm = (smiles) => { if (drawerTargetKey) handleInputChange(drawerTargetKey, smiles); };

  const handlePresetSelect = (preset) => {
    const presetSim = SIM_TYPES.find(item => item.id === preset.simType);
    const defaults = Object.fromEntries(presetSim.fields.filter(field => field.default).map(field => [field.key, field.default]));
    setTypeId(preset.simType);
    setSelectedEngine(preset.engine);
    setInputs({ ...defaults, ...preset.fields });
    setResults(null);
    setInputFiles(null);
    setEnvParams(null);
    setCustomForcefield(null);
    navigate(`/SimulationRunner?type=${preset.simType}&domain=${encodeURIComponent(domain)}`, { replace: true });
  };

  const handlePubChemSelect = (compound) => {
    const moleculeField = sim.fields.find(f =>
      ['molecule', 'ligand', 'compound', 'system', 'molecule_or_trajectory', 'surface', 'reactants', 'sequence', 'material'].includes(f.key) ||
      (f.label && /molecule|compound|ligand|trajectory|pdb|system|sequence|material/i.test(f.label))
    );
    if (moleculeField) {
      const value = compound.smiles ? `${compound.name} (SMILES: ${compound.smiles})` : compound.name;
      handleInputChange(moleculeField.key, value);
    }
  };

  const openFileAutoFill = (fieldKey) => {
    setFileAutoFillTarget(fieldKey);
    fileAutoFillRef.current?.click();
  };

  const handleFileAutoFill = (e) => {
    const file = e.target.files[0];
    if (!file || !fileAutoFillTarget) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      if (content.length <= 8000) {
        handleInputChange(fileAutoFillTarget, content);
      } else {
        handleInputChange(fileAutoFillTarget, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const generateJobHash = () => {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 10);
    return `sim-${ts}-${rand}`;
  };

  const handleRun = async () => {
    if (isRunning) return;
    if (!trialStatus.canRunResearchSim) { navigate('/Pricing?pillar=research'); return; }
    const inputSummary = sim.fields.map(f => `${f.label}: ${inputs[f.key] || 'not specified'}`).join('\n');
    const env = { solvent: 'water', temperature: 300, pressure: 1.0, ph: 7.0, ionic_strength: 0.15, boundary_conditions: 'periodic', ...envParams };
    const envSummary = `Solvent: ${env.solvent === 'custom' ? (env.solvent_custom || 'custom') : env.solvent}
Forcefield: ${env.forcefield || 'default'}
Temperature: ${env.temperature || 300} K
Pressure: ${env.pressure || 1.0} bar
pH: ${env.ph || 7.0}
Ionic Strength: ${env.ionic_strength || 0.15} mol/L
Boundary Conditions: ${env.boundary_conditions || 'periodic'}`;

    const jobHash = generateJobHash();
    setCurrentJobHash(jobHash);
    setIsRunning(true);
    setResults(null);

    // Create isolated SimulationDraft workspace (decoupled from saved entities)
    let draftId = null;
    if (user) {
      try {
        const draft = await base44.entities.SimulationDraft.create({
          name: `${sim.label}: ${new Date().toLocaleString()}`,
          sim_type: typeId,
          sim_type_label: sim.label,
          engine: selectedEngine,
          domain,
          raw_inputs: { ...inputs, forcefield_asset: env.forcefield_file_uri ? { file_uri: env.forcefield_file_uri, file_name: env.forcefield_file_name } : null, custom_forcefield: env.custom_forcefield || customForcefield || null },
          environmental_params: { ...env },
          run_id: jobHash,
          status: 'running',
          custom_forcefield_id: env.custom_forcefield_id || customForcefield?.id || null,
        });
        draftId = draft.id;
        setCurrentDraftId(draftId);
      } catch (e) {
        console.error('Failed to create simulation draft:', e);
      }
    }

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
${inputSummary}

Environmental Conditions:
${envSummary}${customFFNote}

Provide a focused, technical analysis. Return JSON with:
1. system_overview: Brief 2-3 sentence description
2. computational_approach: Method justification (3-4 sentences)
3. predicted_results: { summary: string, key_values: [{property, value, unit, interpretation}] }, include 4-6 realistic numerical results
4. scientific_interpretation: What results mean (3-4 sentences)
5. bash_script: Complete, ready-to-run ${selectedEngine} input file or bash script with comments
6. visualization_commands: Visualization commands/scripts
7. limitations: 2-3 sentence limitation note
8. next_steps: array of 3 concise next steps
9. references: array of 2-3 real paper citations`;

    try {
      const response = await base44.functions.invoke('runConsumerLLM', {
        operation: 'simulationRunner',
        data: { selectedEngine, simulationConfig: { forcefield_file_name: env.forcefield_file_name || '', custom_forcefield: env.custom_forcefield || customForcefield || null, ...inputs, ...env, force_field: env.forcefield || inputs.force_field }, moleculeInfo: inputSummary + (env.forcefield_file_name ? `\nUploaded forcefield file: ${env.forcefield_file_name}. Reference this local file in the script, do not invent its contents. Verify compatibility with ${selectedEngine} before execution.` : '') }
      });

      const fullResult = { ...response.data, simType: sim, engine: selectedEngine, domain, inputs: { ...inputs }, environmental_params: { ...env }, job_hash: jobHash };
      setActiveTab("analysis");

      // Update the draft with results and create an auditable SimulationJob
      if (user && draftId) {
        try {
          await base44.entities.SimulationDraft.update(draftId, {
            status: 'completed',
            result: fullResult,
          });
          await base44.entities.SimulationJob.create({
            draft_id: draftId,
            job_hash: jobHash,
            job_name: `${sim.label}: ${selectedEngine}`,
            sim_type: typeId,
            sim_type_label: sim.label,
            engine: selectedEngine,
            inputs: { ...inputs },
            environmental_params: { ...env },
            status: 'completed',
            result: fullResult,
          });
        } catch (e) {
          console.error('Failed to record simulation job:', e);
        }
      }

      if (user) {
        try {
          await base44.auth.updateMe({ reward_points: (user.reward_points || 0) + 50 });
          if (refreshUser) await refreshUser();
        } catch {}
      }
      setResults(fullResult);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 15000);
    } catch (e) {
      console.error(e);
      if (user && draftId) {
        try {
          await base44.entities.SimulationDraft.update(draftId, { status: 'failed', error: e.message });
        } catch {}
      }
    } finally {
      if (refreshUser) await refreshUser();
      setIsRunning(false);
    }
  };

  const handleGenerateInputs = async () => {
    setGeneratingInputs(true);
    setInputFiles(null);
    try {
      const result = await generateSimulationInputs({
        sim_type: typeId,
        engine: selectedEngine,
        inputs: { ...inputs },
        environmental_params: envParams || {},
      });
      setInputFiles(result.data);
    } catch (e) {
      console.error('Failed to generate input files:', e);
    } finally {
      setGeneratingInputs(false);
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
      doc.text("Generated by Suttain Computational Science Lab, suttain.com", margin, pageH - 3.5);
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
  if (!isRunning && !results && !trialStatus.canRunResearchSim) return <SubscriptionLock pillar="research" featureName="Research simulations" limit />;
  return (
    <div className="simulation-workspace research-surface min-h-screen">
      {!isRunning && results && !trialStatus.canRunResearchSim && <SubscriptionLock pillar="research" featureName="Research simulations" limit />}
      <ToolFeedbackToast
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        feature="computational"
        featureLabel="Computational Simulation"
        user={user}
        pointsToAward={50}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <SimulationWorkflowHeader simulation={sim} domain={domain} engine={selectedEngine} />

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8">
              {/* Result Tabs */}
              <div className="flex items-center gap-1 border-b border-research-border pb-3 mb-6 overflow-x-auto">
                {[
                  { id: "analysis", label: "Analysis", icon: Microscope },
                  { id: "script", label: `${results.engine} script`, icon: Cpu },
                  { id: "viz", label: "Visualization", icon: Eye },
                  ...((typeId === "molecular_dynamics" || typeId === "protein_modeling" || typeId === "biomolecular_dynamics")
                    ? [{ id: "trajectory", label: "Trajectory", icon: Film }]
                    : []),
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex shrink-0 items-center gap-2 min-h-11 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-research-soft text-research-accent' : 'text-research-muted hover:bg-research-card'}`}>
                    <tab.icon className="w-4 h-4" />{tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "analysis" && (
                <div className="space-y-5">
                  <Card className="border border-research-border bg-research-card shadow-none">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-violet-600" /> System overview</h3>
                      <p className="text-slate-700 text-sm leading-relaxed">{results.system_overview}</p>
                    </CardContent>
                  </Card>

                  {results.predicted_results?.key_values?.length > 0 && (
                    <Card className="border border-research-border bg-research-card shadow-none">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-teal-600" /> Predicted results</h3>
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
                    <Card className="border border-research-border bg-research-card shadow-none">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Beaker className="w-4 h-4 text-blue-600" /> Computational approach</h3>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{results.computational_approach}</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-research-border bg-research-card shadow-none">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Dna className="w-4 h-4 text-pink-600" /> Scientific interpretation</h3>
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
                    <Card className="border border-research-border bg-research-card shadow-none">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-600" /> Next steps</h3>
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
                    <Card className="border border-research-border bg-research-card shadow-none">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-slate-600" /> References</h3>
                        <ul className="space-y-1">{results.references.map((ref,i) => <li key={i} className="text-xs text-slate-600 font-mono">{ref}</li>)}</ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "script" && (
                <Card className="border border-research-border bg-research-card shadow-none">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-violet-600" /> {results.engine} Script
                        <Badge className="bg-green-100 text-green-700 text-xs">Ready to run</Badge>
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
                    <Card className="border border-research-border bg-research-card shadow-none">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-fuchsia-600" /> CLI visualization commands</h3>
                        <pre className="bg-slate-900 text-cyan-300 rounded-xl p-5 overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap">
                          {results.visualization_commands}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <ForcefieldAttachment env={results.environmental_params} />
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

              {/* Job Hash: auditability badge */}
              {currentJobHash && (
                <div className="mt-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Cpu className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Simulation job ID</p>
                    <p className="text-sm font-mono text-slate-800 truncate">{currentJobHash}</p>
                  </div>
                </div>
              )}

              {/* Related Research */}
              <div className="mt-5">
                <RelatedResearch
                  molecule={results?.inputs?.molecule || results?.inputs?.compound || results?.inputs?.ligand || results?.inputs?.system}
                  simType={sim?.label}
                />
              </div>

              <div className="flex justify-center mt-8 gap-3 flex-wrap">
                <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="w-4 h-4" />New simulation</Button>
                <Button onClick={generatePDFReport} variant="outline" className="research-secondary h-auto">
                  <Download className="w-4 h-4" /> Generate report
                </Button>
                <Button onClick={handleRun} disabled={isRunning} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                  Re-run analysis
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History & Comparison, always visible */}
        <div className="mt-8">
          <PremiumFeatureGate featureName="Saved history"><SimulationHistoryPanel
            currentResults={results}
            currentInputs={inputs}
            simTypeId={typeId}
            engine={selectedEngine}
          /></PremiumFeatureGate>
        </div>

        {/* Config Form */}
        {!results && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Simulation Presets */}
            <SimulationPresets onSelectPreset={handlePresetSelect} />

            <Card className="border border-research-border bg-research-card shadow-none rounded-xl">
              <CardContent className="p-5 sm:p-8">
                {/* PubChem Auto-fill */}
                <DatabaseSearch onSelect={handlePubChemSelect} />

                <SimulationEngineSelector engines={sim.engines} selected={selectedEngine} onSelect={setSelectedEngine} tooltips={ENGINE_TOOLTIPS} />

                {/* Custom Forcefield picker, MD only */}
                {typeId === "molecular_dynamics" && (
                  <div className="mb-7 p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-semibold text-teal-800">Custom forcefield parameters</p>
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
                          {customForcefield ? "Change / edit" : "Load custom forcefield"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <section className="mb-8">
                  <p className="research-label mb-2">02 / System configuration</p>
                  <h2 className="!text-lg mb-5">Calculation parameters</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {sim.fields.map(field => (
                      <SimulationWorkflowField key={field.key} field={field} value={inputs[field.key]}
                        onChange={value => handleInputChange(field.key, value)}
                        canUpload={FILE_UPLOAD_KEYS.includes(field.key)} canDraw={DRAWABLE_KEYS.includes(field.key)}
                        onUpload={() => openFileAutoFill(field.key)} onDraw={() => openDrawer(field.key)} />
                    ))}
                    <div className="min-w-0 md:col-span-2">
                      <label htmlFor="simulation-notes" className="block text-sm font-medium text-research-text mb-2">Additional notes (optional)</label>
                      <input id="simulation-notes" type="text" value={inputs.notes ?? ''}
                        onChange={event => handleInputChange('notes', event.target.value)}
                        placeholder="Any special requirements or context..." className="simulation-control" />
                    </div>
                  </div>
                </section>

                {/* Environmental Parameters */}
                <div className="mb-7">
                  <EnvironmentalParametersPanel
                    params={envParams}
                    onChange={setEnvParams}
                    simType={typeId}
                  />
                </div>

                {/* Run button */}
                <div className="flex items-center gap-3 flex-wrap border-t border-research-border pt-6">
                  <Button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="research-primary h-auto shadow-none"
                  >
                    {isRunning
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
                      : <><Cpu className="w-4 h-4" /> Prepare workflow and analyze</>}
                  </Button>

                  <Button
                    onClick={handleGenerateInputs}
                    disabled={generatingInputs}
                    variant="outline"
                    className="research-secondary h-auto"
                  >
                    {generatingInputs
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <FileCode2 className="w-4 h-4" />}
                    Generate input files
                  </Button>

                  <p className="text-xs text-slate-400">
                    Workflow analysis + {selectedEngine} script. Engine execution requires configured compute.
                  </p>
                </div>

                {/* Generated Input Files Panel */}
                {inputFiles && (
                  <div className="mt-5">
                    <SimulationInputFiles result={inputFiles} />
                    <ForcefieldAttachment env={envParams} />
                  </div>
                )}

                {isRunning && (
                  <div className="mt-5 bg-violet-50 border-violet-200 border rounded-2xl p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-violet-600 animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-violet-800">
                        Preparing {sim.label} workflow…
                      </p>
                      <p className="text-xs text-violet-500">
                        Generating {selectedEngine} script, predicted results & analysis…
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>

      <input
        ref={fileAutoFillRef}
        type="file"
        className="hidden"
        accept=".pdb,.xyz,.cif,.poscar,.contcar,.mol2,.sdf,.txt,.gro,.top,.xtc,.trr"
        onChange={handleFileAutoFill}
      />

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