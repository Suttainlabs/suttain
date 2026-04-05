import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Play, Save, Beaker, Thermometer, FlaskConical } from "lucide-react";

const ROLES = ["Reactant", "Product", "Catalyst", "Solvent", "Ligand", "Other"];
const SOLVENTS = ["Water", "Ethanol", "DMSO", "Acetone", "Methanol", "Chloroform", "None"];

export default function ExperimentEditor({ initialData, simTypes, onSaveDraft, onSaveAndRun, saving, running }) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [simType, setSimType] = useState(initialData?.simulation_type || "interaction");
  const [tags, setTags] = useState((initialData?.tags || []).join(", "));
  const [molecules, setMolecules] = useState(
    initialData?.molecules?.length > 0
      ? initialData.molecules
      : [{ name: "", amount: "", role: "Reactant" }]
  );
  const [conditions, setConditions] = useState({
    temperature: "298",
    pressure: "1",
    solvent: "Water",
    ph: "7",
    time: "1 ns",
    ...(initialData?.conditions || {}),
  });

  const addMolecule = () => setMolecules(prev => [...prev, { name: "", amount: "", role: "Reactant" }]);

  const updateMolecule = (i, field, value) =>
    setMolecules(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  const removeMolecule = (i) => setMolecules(prev => prev.filter((_, idx) => idx !== i));

  const buildData = () => ({
    ...(initialData || {}),
    name,
    description,
    simulation_type: simType,
    molecules: molecules.filter(m => m.name.trim()),
    conditions,
    tags: tags.split(",").map(t => t.trim()).filter(Boolean),
  });

  const isValid = name.trim() && molecules.some(m => m.name.trim());

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Basic info */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <FlaskConical className="w-5 h-5 text-teal-600" /> Experiment Setup
          </h2>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Experiment Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Aspirin hydrolysis in water"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={2} placeholder="What are you studying in this experiment?"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Simulation Type</label>
            <div className="flex flex-wrap gap-2">
              {simTypes.map(s => (
                <button key={s.id} onClick={() => setSimType(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    simType === s.id ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)}
              placeholder="e.g. hydrolysis, organic, pH-sensitive"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
        </CardContent>
      </Card>

      {/* Molecule editor */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <Beaker className="w-5 h-5 text-violet-600" /> Molecular System
            </h2>
            <Button size="sm" variant="outline" onClick={addMolecule} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Molecule
            </Button>
          </div>

          <div className="space-y-3">
            {molecules.map((mol, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <input type="text" value={mol.name} onChange={e => updateMolecule(i, "name", e.target.value)}
                  placeholder="Molecule name or SMILES"
                  className="flex-1 min-w-[140px] px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white" />
                <input type="text" value={mol.amount} onChange={e => updateMolecule(i, "amount", e.target.value)}
                  placeholder="Amount (e.g. 1 mol)"
                  className="w-28 px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white" />
                <select value={mol.role} onChange={e => updateMolecule(i, "role", e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none bg-white">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {molecules.length > 1 && (
                  <button onClick={() => removeMolecule(i)} className="text-slate-300 hover:text-red-400 p-1 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg mb-4">
            <Thermometer className="w-5 h-5 text-amber-500" /> Experimental Conditions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: "temperature", label: "Temperature (K)", placeholder: "298" },
              { key: "pressure", label: "Pressure (atm)", placeholder: "1" },
              { key: "ph", label: "pH", placeholder: "7" },
              { key: "time", label: "Simulation Time", placeholder: "1 ns" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                <input type="text" value={conditions[key] || ""}
                  onChange={e => setConditions(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Solvent</label>
              <select value={conditions.solvent || "Water"}
                onChange={e => setConditions(prev => ({ ...prev, solvent: e.target.value }))}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none bg-white">
                {SOLVENTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center gap-3 justify-end">
        <Button variant="outline" onClick={() => onSaveDraft(buildData())} disabled={!isValid || saving || running} className="gap-2">
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Draft"}
        </Button>
        <Button onClick={() => onSaveAndRun(buildData())} disabled={!isValid || saving || running}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white gap-2 px-6">
          {running ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running…</>
            : <><Play className="w-4 h-4" /> Save & Run Simulation</>}
        </Button>
      </div>
    </div>
  );
}