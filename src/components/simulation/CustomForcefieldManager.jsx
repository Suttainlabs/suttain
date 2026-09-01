import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, ChevronDown, ChevronUp, FlaskConical, Pencil, X, CheckCircle2 } from "lucide-react";

const BASE_FORCEFIELDS = [
  "AMBER99SB-ILDN", "CHARMM36", "OPLS-AA", "GROMOS54A7",
  "ff14SB", "CHARMM36m", "AMBER14SB", "TraPPE", "Custom (from scratch)"
];

const EMPTY_LJ    = { atom_type: "", epsilon: "", sigma: "" };
const EMPTY_BOND  = { atom1: "", atom2: "", k_bond: "", r0: "" };
const EMPTY_ANGLE = { atom1: "", atom2: "", atom3: "", k_angle: "", theta0: "" };
const EMPTY_DIHED = { atom1: "", atom2: "", atom3: "", atom4: "", k_dihedral: "", n: "", delta: "" };

function ParamRow({ row, cols, onChange, onDelete }) {
  return (
    <div className="flex gap-1.5 items-center">
      {cols.map(col => (
        <input key={col.key}
          value={row[col.key] ?? ""}
          onChange={e => onChange({ ...row, [col.key]: e.target.value })}
          placeholder={col.label}
          className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 bg-white"
        />
      ))}
      <button onClick={onDelete} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ParamSection({ title, rows, cols, emptyRow, onChange }) {
  const [open, setOpen] = useState(true);
  const add = () => onChange([...rows, { ...emptyRow }]);
  const update = (i, row) => onChange(rows.map((r, idx) => idx === i ? row : r));
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        <div className="flex items-center gap-2">
          <Badge className="bg-slate-200 text-slate-600 text-xs">{rows.length}</Badge>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="p-3 space-y-2">
          {cols && (
            <div className="flex gap-1.5 px-1">
              {cols.map(c => (
                <span key={c.key} className="flex-1 min-w-0 text-[10px] font-semibold text-slate-400 uppercase truncate">{c.label}</span>
              ))}
              <span className="w-6 flex-shrink-0" />
            </div>
          )}
          {rows.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">No entries yet, click Add to define parameters.</p>
          )}
          {rows.map((row, i) => (
            <ParamRow key={i} row={row} cols={cols} onChange={r => update(i, r)} onDelete={() => remove(i)} />
          ))}
          <button onClick={add}
            className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 font-semibold mt-1 px-1 py-1 hover:bg-teal-50 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add row
          </button>
        </div>
      )}
    </div>
  );
}

function ForcefieldForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [base, setBase] = useState(initial?.base_forcefield ?? BASE_FORCEFIELDS[0]);
  const [lj, setLj] = useState(initial?.lj_parameters ?? []);
  const [bonds, setBonds] = useState(initial?.bond_parameters ?? []);
  const [angles, setAngles] = useState(initial?.angle_parameters ?? []);
  const [dihedrals, setDihedrals] = useState(initial?.dihedral_parameters ?? []);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const data = {
      name: name.trim(), description, base_forcefield: base,
      lj_parameters: lj, bond_parameters: bonds,
      angle_parameters: angles, dihedral_parameters: dihedrals, notes
    };
    await onSave(data);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Name *</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. My Lipid FF, Custom Water Model"
            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Base Forcefield</label>
          <select value={base} onChange={e => setBase(e.target.value)}
            className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
            {BASE_FORCEFIELDS.map(ff => <option key={ff}>{ff}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="What system/use-case is this for?"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
        </div>
      </div>

      <ParamSection
        title="Lennard-Jones Parameters  (ε in kJ/mol, σ in nm)"
        rows={lj} onChange={setLj} emptyRow={EMPTY_LJ}
        cols={[
          { key: "atom_type", label: "Atom type" },
          { key: "epsilon", label: "ε (kJ/mol)" },
          { key: "sigma", label: "σ (nm)" }
        ]}
      />
      <ParamSection
        title="Bond Force Constants  (k in kJ/mol/nm², r₀ in nm)"
        rows={bonds} onChange={setBonds} emptyRow={EMPTY_BOND}
        cols={[
          { key: "atom1", label: "Atom 1" }, { key: "atom2", label: "Atom 2" },
          { key: "k_bond", label: "k (kJ/mol/nm²)" }, { key: "r0", label: "r₀ (nm)" }
        ]}
      />
      <ParamSection
        title="Angle Force Constants  (k in kJ/mol/rad², θ₀ in deg)"
        rows={angles} onChange={setAngles} emptyRow={EMPTY_ANGLE}
        cols={[
          { key: "atom1", label: "Atom 1" }, { key: "atom2", label: "Atom 2" }, { key: "atom3", label: "Atom 3" },
          { key: "k_angle", label: "k (kJ/mol/rad²)" }, { key: "theta0", label: "θ₀ (°)" }
        ]}
      />
      <ParamSection
        title="Dihedral Parameters  (k in kJ/mol, n integer, δ in deg)"
        rows={dihedrals} onChange={setDihedrals} emptyRow={EMPTY_DIHED}
        cols={[
          { key: "atom1", label: "A1" }, { key: "atom2", label: "A2" },
          { key: "atom3", label: "A3" }, { key: "atom4", label: "A4" },
          { key: "k_dihedral", label: "k" }, { key: "n", label: "n" }, { key: "delta", label: "δ (°)" }
        ]}
      />

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Notes / References</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          placeholder="Paper DOI, derivation notes, caveats…"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white resize-none" />
      </div>

      <div className="flex gap-2 pt-1">
        <Button onClick={handleSave} disabled={saving || !name.trim()}
          className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
          <Save className="w-4 h-4" />{saving ? "Saving…" : "Save Forcefield"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Main exported component ───────────────────────────────────────────────
export default function CustomForcefieldManager({ isOpen, onClose, onSelect }) {
  const [forcefields, setForcefields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" | "new" | "edit"
  const [editing, setEditing] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    if (isOpen) fetchForcefields();
  }, [isOpen]);

  const fetchForcefields = async () => {
    setLoading(true);
    const data = await base44.entities.CustomForcefield.list("-created_date");
    setForcefields(data);
    setLoading(false);
  };

  const handleSave = async (data) => {
    if (editing) {
      await base44.entities.CustomForcefield.update(editing.id, data);
    } else {
      await base44.entities.CustomForcefield.create(data);
    }
    setSaved(data.name);
    setTimeout(() => setSaved(null), 2500);
    setView("list");
    setEditing(null);
    fetchForcefields();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this forcefield?")) return;
    await base44.entities.CustomForcefield.delete(id);
    fetchForcefields();
  };

  const handleSelect = (ff) => {
    onSelect(ff);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Custom Forcefield Parameters</h2>
              <p className="text-xs text-slate-500">Define LJ, bond, angle, and dihedral parameters for MD simulations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {saved && (
            <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" /> "{saved}" saved successfully!
            </div>
          )}

          {view === "list" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600">{forcefields.length} saved parameter {forcefields.length === 1 ? "set" : "sets"}</p>
                <Button size="sm" onClick={() => { setEditing(null); setView("new"); }}
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                  <Plus className="w-4 h-4" /> New Forcefield
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-10 text-slate-400 text-sm">Loading…</div>
              ) : forcefields.length === 0 ? (
                <div className="text-center py-10">
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                  <p className="text-slate-500 text-sm mb-4">No custom forcefields yet.</p>
                  <Button size="sm" onClick={() => setView("new")} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> Create your first
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {forcefields.map(ff => (
                    <Card key={ff.id} className="border border-slate-200 hover:border-teal-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-sm">{ff.name}</h3>
                              <Badge className="bg-teal-100 text-teal-700 text-xs">{ff.base_forcefield}</Badge>
                            </div>
                            {ff.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{ff.description}</p>}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {[
                                { label: "LJ", count: ff.lj_parameters?.length },
                                { label: "Bonds", count: ff.bond_parameters?.length },
                                { label: "Angles", count: ff.angle_parameters?.length },
                                { label: "Dihedrals", count: ff.dihedral_parameters?.length },
                              ].map(p => p.count > 0 && (
                                <span key={p.label} className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                  {p.count} {p.label}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            {onSelect && (
                              <Button size="sm" onClick={() => handleSelect(ff)}
                                className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 h-7">
                                Use
                              </Button>
                            )}
                            <button onClick={() => { setEditing(ff); setView("edit"); }}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(ff.id)}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {(view === "new" || view === "edit") && (
            <>
              <h3 className="font-bold text-slate-800 mb-4">{view === "edit" ? `Editing: ${editing?.name}` : "New Custom Forcefield"}</h3>
              <ForcefieldForm
                initial={view === "edit" ? editing : null}
                onSave={handleSave}
                onCancel={() => { setView("list"); setEditing(null); }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}