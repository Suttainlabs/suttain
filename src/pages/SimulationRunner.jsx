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
import useRowanRun from '@/components/simulation/useRowanRun';
import RowanResults from '@/components/simulation/RowanResults';
import useEngineRegistry from '@/components/simulation/useEngineRegistry';
import EngineParameterFields from '@/components/simulation/EngineParameterFields';
import LocalEngineResults from '@/components/simulation/LocalEngineResults';
import SourceLookupResults from '@/components/simulation/SourceLookupResults';
import { runPubchemLookup } from '@/functions/runPubchemLookup';
import environmentDefaults from '@/components/simulation/environmentDefaults';

export default function SimulationRunner() {
  const { user, refreshUser } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const [typeId, setTypeId] = useState(params.get("type"));
  const domain = params.get("domain") || "Chemistry";

  const sim = SIM_TYPES.find(s => s.id === typeId);

  const [selectedEngine, setSelectedEngine] = useState(sim?.id === 'molecular_dynamics' ? 'OpenMM' : 'Rowan');
  const [autoFallback, setAutoFallback] = useState(true);
  const [lookupBusy, setLookupBusy] = useState(false);
  const registry = useEngineRegistry();
  const selectedCatalogue = registry.data?.engines?.find(e => e.label === selectedEngine);
  const [inputs, setInputs] = useState(() => {
    const defaults = {};
    sim?.fields.forEach(f => { if (f.default) defaults[f.key] = f.default; });
    return defaults;
  });

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
  const [inputGenerationError, setInputGenerationError] = useState('');
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

  const effectiveEnvironment = { ...environmentDefaults(selectedEngine), ...envParams };
  const isMdEngine = ['OpenMM','GROMACS'].includes(selectedEngine);
  const rowan = useRowanRun({ user, sim, engine:selectedEngine, domain, inputs, environment:effectiveEnvironment, onResult:setResults, refreshUser, autoFallback });
  const isRunning = rowan.isRunning || generatingInputs || lookupBusy;
  useEffect(() => {
    if (!sim) navigate('/AtomisticSimulation');
  }, [sim, navigate]);

  if (!sim) return null;

  const handleInputChange = (key, value) => setInputs(prev => ({ ...prev, [key]: value }));
  const handleEngineSelect = (label) => {
    const entry=registry.data?.engines?.find(e=>e.label===label);
    setSelectedEngine(label); setInputFiles(null); setInputGenerationError('');
    if(['OpenMM','GROMACS'].includes(label) && label !== selectedEngine) setEnvParams(prev=>({...environmentDefaults(label),...prev,thermostat:label==='OpenMM'?'langevin':'vrescale',barostat:label==='OpenMM'?'monte_carlo':'parrinello_rahman'}));
    setInputs(prev=>{const next={...prev};delete next.engine_method;delete next.engine_task;
      if(entry?.deployment==='input_file') {next.engine_method=entry.methods[0];next.engine_task=entry.tasks[0];}
      if(entry?.id==='gamess') next.basis_set='6-31G*';
      return next;
    });
  };

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
      if (content.length <= 24000) {
        handleInputChange(fileAutoFillTarget, content);
      } else {
        handleInputChange(fileAutoFillTarget, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRun = async () => {
    if (isRunning) return;
    if (!trialStatus.canRunResearchSim) { navigate('/Pricing?pillar=research'); return; }
    if(selectedCatalogue?.id==='pubchem') {
      setLookupBusy(true);setInputGenerationError('');
      try {const {data}=await runPubchemLookup({query:inputs.query || inputs.molecule || inputs.system,namespace:inputs.namespace || 'name',operation:'Properties',sim_type:typeId});setResults({...data,inputs,simType:sim,domain});await refreshUser?.();}
      catch(error) {setInputGenerationError(error.response?.data?.error || error.message);}
      finally {setLookupBusy(false);}
      return;
    }
    if(selectedEngine!=='Rowan') {await handleGenerateInputs();return;}
    await rowan.run();
  };

  const handleGenerateInputs = async () => {
    setGeneratingInputs(true);
    setInputFiles(null);
    setInputGenerationError('');
    try {
      const result = await generateSimulationInputs({
        sim_type: typeId,
        engine: selectedEngine==='Rowan' ? (inputs.functional==='GFN2-xTB' || inputs.method==='GFN2-xTB' ? 'xtb' : 'ORCA') : selectedEngine,
        inputs: { ...inputs, ...(isMdEngine ? {md_steps:inputs.md_steps ?? 10000,md_timestep_fs:inputs.md_timestep_fs ?? 1,md_padding_nm:inputs.md_padding_nm ?? 1.2} : {}) },
        environmental_params: effectiveEnvironment,
        sim_type_label:sim.label,
        domain,
        record_job:true,
      });
      if(result.data.execution_mode==='local_pending' && !results) setResults({...result.data,inputs,environmental_params:result.data.environmental_params || effectiveEnvironment,simType:sim,domain});
      else setInputFiles(result.data);
    } catch (e) {
      setInputGenerationError(e.response?.data?.error || e.message);
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

  const reset = () => { setResults(null); setInputFiles(null); setInputGenerationError(''); setSelectedEngine(sim.id === 'molecular_dynamics' ? 'OpenMM' : 'Rowan'); setInputs(Object.fromEntries(sim.fields.filter(f=>f.default).map(f=>[f.key,f.default]))); };
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

        {(rowan.error || rowan.job?.status === 'failed') && <div role="alert" className="mb-6 rounded-xl border border-destructive bg-card p-5 text-destructive">{rowan.error || rowan.job.error}</div>}
        {isRunning && rowan.job?.provider_job_id && <div role="status" className="mb-6 rounded-xl border border-research-border bg-research-card p-5"><p className="research-label">Real Rowan compute run · {rowan.job.status}</p><p className="font-mono text-xs break-all mt-2">{rowan.job.provider_job_id}</p><p className="text-sm text-research-muted mt-2">Tracking completion notifications with polling fallback. You can return to this workflow later.</p></div>}
        {results?.execution_mode === 'real' && results.result_kind!=='lookup' && <RowanResults result={results} onReset={reset} onRun={handleRun} isRunning={isRunning}/>}
        {results?.execution_mode==='local_pending' && <LocalEngineResults result={results} onReset={reset}/>}
        {results?.result_kind==='lookup' && <SourceLookupResults result={results} onReset={reset}/>}
        {/* Previous demonstration results remain readable. */}
        <AnimatePresence>
          {results && !['real','local_pending'].includes(results.execution_mode) && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8">
              <div role="status" className="mb-5 rounded-xl border border-research-border bg-research-soft p-5"><p className="research-label">Demonstration mode</p><p className="text-sm text-research-muted">No real compute completed. Any estimates or reference structures below are illustrative, not Rowan output.</p></div>
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
                  <MolViewer simType={results.simType?.id} inputs={results.inputs} visualizationTarget={results.visualization_target} visualizationCommands={results.visualization_commands} />
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

        {results && (
          <section className="mt-6 rounded-xl border border-research-border bg-research-card p-5">
            <SimulationEngineSelector engines={sim.engines} selected={selectedEngine} onSelect={handleEngineSelect} tooltips={ENGINE_TOOLTIPS} simType={typeId}/>
            <EngineParameterFields engine={selectedCatalogue} inputs={inputs} onChange={handleInputChange} simType={typeId}/>
            <Button onClick={selectedCatalogue?.id==='pubchem' ? handleRun : handleGenerateInputs} disabled={isRunning} variant="outline" className="research-secondary h-auto">
              {generatingInputs ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode2 className="w-4 h-4" />}
              {generatingInputs ? 'Generating input files…' : selectedCatalogue?.id==='pubchem' ? 'Look up compound' : 'Generate input files'}
            </Button>
            {inputGenerationError && <p role="alert" className="mt-5 text-sm text-destructive">{inputGenerationError}</p>}
            {inputFiles && <div className="mt-5"><SimulationInputFiles result={inputFiles} simTypeLabel={sim.label} linkedJobId={inputFiles.job_id} /><ForcefieldAttachment env={envParams} /></div>}
          </section>
        )}

        {/* History & Comparison, always visible */}
        <div className="mt-8">
          <PremiumFeatureGate featureName="Saved history"><SimulationHistoryPanel
            currentResults={inputFiles || results}
            currentInputs={inputs}
            simTypeId={typeId}
            engine={selectedEngine}
            onSelectResult={record => {setInputs(record.inputs || {});setEnvParams(record.environmental_params || {});setInputFiles(null);setSelectedEngine(record.engine);setResults({...record.result,job_id:record.id,execution_mode:record.execution_mode,provider_job_id:record.provider_job_id,inputs:record.inputs,environmental_params:record.environmental_params,simType:sim,engine:record.result?.engine || record.engine,domain,job_hash:record.job_hash});setActiveTab('analysis');}}
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

                <SimulationEngineSelector engines={sim.engines} selected={selectedEngine} onSelect={handleEngineSelect} tooltips={ENGINE_TOOLTIPS} simType={typeId} />
                <EngineParameterFields engine={selectedCatalogue} inputs={inputs} onChange={handleInputChange} simType={typeId}/>
                {selectedEngine==='Rowan' && <label className="flex items-center gap-3 mb-7"><input type="checkbox" checked={autoFallback} onChange={e=>setAutoFallback(e.target.checked)}/><span>Automatically prepare compatible local inputs if Rowan credits run out</span></label>}

                {/* Custom Forcefield picker, MD only */}
                {typeId === "molecular_dynamics" && !isMdEngine && (
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
                          <button onClick={() => { setCustomForcefield(null); setEnvParams(prev=>({...environmentDefaults(selectedEngine),...prev,forcefield:'',custom_forcefield:null,custom_forcefield_id:'',forcefield_file_uri:'',forcefield_file_name:''})); }}
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
                    {sim.fields.filter(field=>isMdEngine ? !['force_field','temperature','simulation_time','system'].includes(field.key) : !selectedCatalogue || selectedEngine==='Rowan' || !['functional','method','task','basis_set','properties','theory_level','property','analysis_type'].includes(field.key)).map(field => (
                      <SimulationWorkflowField key={field.key} field={field} value={inputs[field.key]}
                        onChange={value => handleInputChange(field.key, value)}
                        canUpload={FILE_UPLOAD_KEYS.includes(field.key)} canDraw={DRAWABLE_KEYS.includes(field.key)}
                        onUpload={() => openFileAutoFill(field.key)} onDraw={() => openDrawer(field.key)} />
                    ))}
                    {['dft','quantum_mechanics'].includes(typeId) && <>
                      <div><label htmlFor="rowan-charge" className="block mb-2">Molecular charge (XYZ / SMILES override)</label><input id="rowan-charge" type="number" min="-10" max="10" step="1" placeholder="Use reference charge" value={inputs.charge ?? ''} onChange={e => handleInputChange('charge',e.target.value === '' ? undefined : Number(e.target.value))} className="simulation-control"/></div>
                      <div><label htmlFor="rowan-spin" className="block mb-2">Spin multiplicity</label><input id="rowan-spin" type="number" min="1" max="7" step="1" value={inputs.multiplicity ?? 1} onChange={e => handleInputChange('multiplicity',Number(e.target.value))} className="simulation-control"/></div>
                      <p className="md:col-span-2 text-sm text-research-muted">SMILES and compound names use a PubChem 3D reference conformer; upload XYZ for unindexed molecules. Rowan executes mapped methods with gpu4pyscf (or Psi4); GFN2-xTB uses xtb. Selected legacy engines remain input-file targets, not the actual compute engine.</p>
                    </>}
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
                    engine={selectedEngine}
                  />
                </div>

                {['dft','quantum_mechanics'].includes(typeId) && <p className="text-sm text-research-muted mb-5">Rowan applies implicit solvent only; temperature, pressure, pH, ionic strength and classical forcefields remain saved context and do not control this quantum calculation.</p>}
                {/* Run button */}
                <div className="flex items-center gap-3 flex-wrap border-t border-research-border pt-6">
                  <Button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="research-primary h-auto shadow-none"
                  >
                    {isRunning
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
                      : <><Cpu className="w-4 h-4" /> {selectedEngine==='Rowan' ? 'Run on Rowan' : selectedCatalogue?.id==='pubchem' ? 'Look up compound' : `Prepare ${selectedEngine} workflow`}</>}
                  </Button>

                  {selectedCatalogue?.id!=='pubchem' && <Button
                    onClick={handleGenerateInputs}
                    disabled={isRunning}
                    variant="outline"
                    className="research-secondary h-auto"
                  >
                    {generatingInputs
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <FileCode2 className="w-4 h-4" />}
                    Generate input files
                  </Button>}

                  <p className="text-xs text-slate-400">
                    {isMdEngine ? 'Local MD package only; hosted MD requires your compute service URL and authentication details.' : 'Rowan compute is capped at 25 Rowan credits per job. Only mapped molecular tasks run; other workflows report an unsupported state.'}
                  </p>
                </div>

                {inputGenerationError && <p role="alert" className="mt-5 text-sm text-destructive">{inputGenerationError}</p>}
                {/* Generated Input Files Panel */}
                {inputFiles && (
                  <div className="mt-5">
                    <SimulationInputFiles result={inputFiles} simTypeLabel={sim.label} />
                    <ForcefieldAttachment env={envParams} />
                  </div>
                )}

                {isRunning && (
                  <div className="mt-5 bg-violet-50 border-violet-200 border rounded-2xl p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-violet-600 animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-violet-800">
                        Submitting or tracking {sim.label}…
                      </p>
                      <p className="text-xs text-violet-500">
                        Resolving 3D input and waiting for real Rowan output. No simulated values are generated.
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
        onSelect={(ff) => { setCustomForcefield(ff); setEnvParams(prev=>({...environmentDefaults(selectedEngine),...prev,forcefield:ff.name,custom_forcefield:ff,custom_forcefield_id:ff.id,forcefield_file_uri:ff.file_uri || '',forcefield_file_name:ff.file_name || ''})); setFfManagerOpen(false); }}
      />
    </div>
  );
}