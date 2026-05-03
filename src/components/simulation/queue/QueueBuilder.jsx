import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X, Plus, Trash2, ChevronDown, ChevronUp, Copy, Loader2,
  FlaskConical, Cpu, Activity, Dna, Zap, Beaker, Globe
} from "lucide-react";

const SIM_TYPES = [
  { id: "dft", label: "DFT / Quantum Chemistry", icon: Cpu, color: "from-violet-500 to-purple-600",
    engines: ["ORCA", "Gaussian", "Psi4", "NWChem"],
    fields: [
      { key: "molecule", label: "Molecule / SMILES", placeholder: "e.g. H2O, C6H6" },
      { key: "functional", label: "DFT Functional", type: "select", options: ["B3LYP","PBE","PBE0","M06-2X","CAM-B3LYP","ωB97X-D","HF"], default: "B3LYP" },
      { key: "basis_set", label: "Basis Set", type: "select", options: ["STO-3G","6-31G*","6-311G**","cc-pVDZ","cc-pVTZ","def2-TZVP"], default: "6-31G*" },
      { key: "task", label: "Task", placeholder: "e.g. geometry optimization, NMR" },
    ]
  },
  { id: "molecular_dynamics", label: "Molecular Dynamics", icon: Activity, color: "from-teal-500 to-cyan-600",
    engines: ["GROMACS", "AMBER", "NAMD", "OpenMM"],
    fields: [
      { key: "system", label: "System Description", placeholder: "e.g. Lysozyme in water, NPT" },
      { key: "force_field", label: "Force Field", type: "select", options: ["AMBER99SB-ILDN","CHARMM36","OPLS-AA","ff14SB"], default: "AMBER99SB-ILDN" },
      { key: "temperature", label: "Temperature (K)", type: "select", options: ["273","298","300","310","320","350","400"], default: "300" },
      { key: "simulation_time", label: "Simulation Time", type: "select", options: ["1 ns","10 ns","50 ns","100 ns","500 ns","1 µs"], default: "100 ns" },
    ]
  },
  { id: "drug_discovery", label: "Drug Discovery / Docking", icon: FlaskConical, color: "from-pink-500 to-rose-600",
    engines: ["AutoDock Vina", "Glide", "DOCK6"],
    fields: [
      { key: "ligand", label: "Ligand", placeholder: "e.g. Ibuprofen or SMILES" },
      { key: "receptor", label: "Target Receptor", placeholder: "e.g. COX-2, PDB: 1CX2" },
      { key: "binding_site", label: "Binding Site", placeholder: "e.g. active site" },
      { key: "properties", label: "Properties", placeholder: "e.g. binding affinity, ADMET" },
    ]
  },
  { id: "protein_modeling", label: "Protein Modeling", icon: Dna, color: "from-blue-500 to-indigo-600",
    engines: ["GROMACS", "AMBER", "Modeller", "AlphaFold"],
    fields: [
      { key: "sequence", label: "Protein / PDB ID", placeholder: "e.g. UniProt: P12345" },
      { key: "analysis_type", label: "Analysis Type", placeholder: "e.g. secondary structure, RMSD" },
      { key: "environment", label: "Environment", placeholder: "e.g. physiological pH 7.4" },
      { key: "mutations", label: "Mutations (optional)", placeholder: "e.g. G12V, K45R" },
    ]
  },
  { id: "materials", label: "Materials Science", icon: Beaker, color: "from-slate-500 to-gray-700",
    engines: ["VASP", "Quantum ESPRESSO", "CP2K"],
    fields: [
      { key: "material", label: "Material / Crystal", placeholder: "e.g. TiO2, graphene" },
      { key: "property", label: "Property", type: "select", options: ["Band gap","DOS","Band structure","Phonons","Adsorption energy"], default: "Band gap" },
      { key: "kpoints", label: "k-point Sampling", type: "select", options: ["2x2x2","4x4x4","6x6x6","8x8x8"], default: "4x4x4" },
      { key: "functional", label: "Functional", type: "select", options: ["PBE","PBE+U","HSE06","SCAN"], default: "PBE" },
    ]
  },
  { id: "environmental", label: "Environmental / Green Chem", icon: Globe, color: "from-lime-500 to-green-600",
    engines: ["ORCA", "RDKit", "OpenBabel"],
    fields: [
      { key: "compound", label: "Compound", placeholder: "e.g. atrazine, PFAS" },
      { key: "environment", label: "Environmental Matrix", type: "select", options: ["Aquatic (freshwater)","Atmospheric","Soil / sediment","Groundwater"], default: "Aquatic (freshwater)" },
      { key: "process", label: "Process", type: "select", options: ["Photodegradation","Biodegradation","Hydrolysis","Sorption"], default: "Photodegradation" },
      { key: "metrics", label: "Metrics", type: "select", options: ["Half-life","Degradation products","Ecotoxicity LC50","LogKow"], default: "Half-life" },
    ]
  },
];

function JobForm({ job, index, onUpdate, onRemove, onDuplicate }) {
  const [expanded, setExpanded] = useState(true);
  const sim = SIM_TYPES.find(s => s.id === job.sim_type) || SIM_TYPES[0];

  const handleTypeChange = (typeId) => {
    const newSim = SIM_TYPES.find(s => s.id === typeId);
    const defaults = {};
    newSim.fields.forEach(f => { if (f.default) defaults[f.key] = f.default; });
    onUpdate({ ...job, sim_type: typeId, sim_type_label: newSim.label, engine: newSim.engines[0], inputs: defaults });
  };

  const handleField = (key, value) => {
    onUpdate({ ...job, inputs: { ...job.inputs, [key]: value } });
  };

  return (
    <Card className="border-2 border-slate-200">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-6 h-6 bg-violet-100 text-violet-700 text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <div className="min-w-0">
            <input
              value={job.job_name}
              onChange={e => { e.stopPropagation(); onUpdate({ ...job, job_name: e.target.value }); }}
              onClick={e => e.stopPropagation()}
              className="font-semibold text-slate-800 text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-violet-400 outline-none w-full"
              placeholder="Job name…"
            />
            <p className="text-xs text-slate-400 truncate">{sim.label} · {job.engine}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); onDuplicate(); }}
            className="text-slate-400 hover:text-violet-600 p-1.5 h-auto">
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); onRemove(); }}
            className="text-slate-400 hover:text-red-500 p-1.5 h-auto">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <CardContent className="pt-0 pb-4 px-4 space-y-4 border-t border-slate-100">
          {/* Sim type */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Simulation Type</label>
            <div className="flex flex-wrap gap-2">
              {SIM_TYPES.map(s => {
                const Icon = s.icon;
                return (
                  <button key={s.id} onClick={() => handleTypeChange(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${job.sim_type === s.id ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}>
                    <Icon className="w-3 h-3" />{s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Engine */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Engine</label>
            <div className="flex flex-wrap gap-2">
              {sim.engines.map(e => (
                <button key={e} onClick={() => onUpdate({ ...job, engine: e })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${job.engine === e ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sim.fields.map(field => (
              field.type === "select" ? (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{field.label}</label>
                  <select
                    value={job.inputs?.[field.key] || field.default || field.options[0]}
                    onChange={e => handleField(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                    {field.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ) : (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{field.label}</label>
                  <input
                    value={job.inputs?.[field.key] || ""}
                    onChange={e => handleField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              )
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function QueueBuilder({ onClose, onCreate }) {
  const [queueName, setQueueName] = useState("");
  const [queueDesc, setQueueDesc] = useState("");
  const [jobs, setJobs] = useState([createDefaultJob(0)]);
  const [saving, setSaving] = useState(false);

  function createDefaultJob(index) {
    const sim = SIM_TYPES[0];
    const defaults = {};
    sim.fields.forEach(f => { if (f.default) defaults[f.key] = f.default; });
    return {
      _id: `job_${Date.now()}_${index}`,
      job_name: `Job ${index + 1}`,
      sim_type: sim.id,
      sim_type_label: sim.label,
      engine: sim.engines[0],
      inputs: defaults,
    };
  }

  const addJob = () => setJobs(prev => [...prev, createDefaultJob(prev.length)]);

  const updateJob = (id, updated) => setJobs(prev => prev.map(j => j._id === id ? { ...updated, _id: id } : j));

  const removeJob = (id) => setJobs(prev => prev.filter(j => j._id !== id));

  const duplicateJob = (job) => {
    const dup = { ...job, _id: `job_${Date.now()}`, job_name: `${job.job_name} (copy)` };
    setJobs(prev => [...prev, dup]);
  };

  const handleSave = async () => {
    if (!queueName.trim() || jobs.length === 0) return;
    setSaving(true);
    await onCreate({ name: queueName, description: queueDesc }, jobs);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">New Simulation Queue</h2>
            <p className="text-sm text-slate-500">Define a batch of jobs with different parameters.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Queue metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Queue Name *</label>
              <input
                value={queueName}
                onChange={e => setQueueName(e.target.value)}
                placeholder="e.g. Temperature sweep MD run"
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description (optional)</label>
              <input
                value={queueDesc}
                onChange={e => setQueueDesc(e.target.value)}
                placeholder="What are you testing?"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>

          {/* Jobs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-700">Jobs ({jobs.length})</h3>
              <Button size="sm" variant="outline" onClick={addJob} className="gap-1.5 text-violet-700 border-violet-200 hover:bg-violet-50">
                <Plus className="w-3.5 h-3.5" /> Add Job
              </Button>
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {jobs.map((job, i) => (
                <JobForm
                  key={job._id}
                  job={job}
                  index={i}
                  onUpdate={updated => updateJob(job._id, updated)}
                  onRemove={() => removeJob(job._id)}
                  onDuplicate={() => duplicateJob(job)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <p className="text-sm text-slate-500">{jobs.length} job{jobs.length !== 1 ? "s" : ""} defined</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!queueName.trim() || jobs.length === 0 || saving}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Create Queue"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}