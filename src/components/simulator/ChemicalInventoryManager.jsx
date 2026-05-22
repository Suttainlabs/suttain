import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, Edit2, Check, X, FlaskConical, Package,
  AlertTriangle, Search, ChevronDown, ChevronUp, Tag
} from "lucide-react";

const UNITS = ["g", "kg", "mL", "L", "mol", "mmol", "units"];
const CONC_UNITS = ["M", "mM", "% w/v", "% w/w", "ppm", "ppb"];

const EMPTY_FORM = {
  name: "",
  scientific_name: "",
  cas_number: "",
  quantity: "",
  unit: "g",
  concentration: "",
  concentration_unit: "M",
  purity: 99.9,
  location: "",
  notes: "",
  low_stock_threshold: "",
  tags: ""
};

function toFormData(item) {
  return {
    name: item.name || "",
    scientific_name: item.scientific_name || "",
    cas_number: item.cas_number || "",
    quantity: item.quantity ?? "",
    unit: item.unit || "g",
    concentration: item.concentration ?? "",
    concentration_unit: item.concentration_unit || "M",
    purity: item.purity ?? 99.9,
    location: item.location || "",
    notes: item.notes || "",
    low_stock_threshold: item.low_stock_threshold ?? "",
    tags: (item.tags || []).join(", ")
  };
}

function toPayload(form) {
  return {
    name: form.name.trim(),
    scientific_name: form.scientific_name.trim() || undefined,
    cas_number: form.cas_number.trim() || undefined,
    quantity: parseFloat(form.quantity) || 0,
    unit: form.unit,
    concentration: form.concentration !== "" ? parseFloat(form.concentration) : undefined,
    concentration_unit: form.concentration_unit,
    purity: parseFloat(form.purity) || 99.9,
    location: form.location.trim() || undefined,
    notes: form.notes.trim() || undefined,
    low_stock_threshold: form.low_stock_threshold !== "" ? parseFloat(form.low_stock_threshold) : undefined,
    tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : []
  };
}

function ItemForm({ initial = EMPTY_FORM, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSave(toPayload(form)); }}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Chemical name *</label>
          <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Sodium Chloride" required />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Scientific / IUPAC name</label>
          <Input value={form.scientific_name} onChange={e => set("scientific_name", e.target.value)} placeholder="e.g. sodium chloride" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Quantity *</label>
          <div className="flex gap-2">
            <Input type="number" min="0" step="any" value={form.quantity} onChange={e => set("quantity", e.target.value)} placeholder="0" required className="flex-1" />
            <select value={form.unit} onChange={e => set("unit", e.target.value)} className="border border-slate-200 rounded-md px-2 text-sm text-slate-700 bg-white">
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Low stock alert (optional)</label>
          <Input type="number" min="0" step="any" value={form.low_stock_threshold} onChange={e => set("low_stock_threshold", e.target.value)} placeholder="e.g. 10" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Concentration (optional)</label>
          <div className="flex gap-2">
            <Input type="number" min="0" step="any" value={form.concentration} onChange={e => set("concentration", e.target.value)} placeholder="e.g. 1.0" className="flex-1" />
            <select value={form.concentration_unit} onChange={e => set("concentration_unit", e.target.value)} className="border border-slate-200 rounded-md px-2 text-sm text-slate-700 bg-white">
              {CONC_UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Purity (%)</label>
          <Input type="number" min="0" max="100" step="0.1" value={form.purity} onChange={e => set("purity", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">CAS number</label>
          <Input value={form.cas_number} onChange={e => set("cas_number", e.target.value)} placeholder="e.g. 7647-14-5" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Storage location</label>
          <Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Cabinet A, Shelf 2" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Tags (comma-separated)</label>
        <Input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="e.g. acid, solvent, reagent" />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Notes</label>
        <Input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Additional notes..." />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Check className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
      </div>
    </form>
  );
}

function InventoryCard({ item, onAddToSim, onEdit, onDelete }) {
  const isLow = item.low_stock_threshold != null && item.quantity <= item.low_stock_threshold;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-2 ${isLow ? "border-orange-300" : "border-slate-200"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 text-sm truncate">{item.name}</h3>
            {isLow && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Low stock
              </Badge>
            )}
          </div>
          {item.scientific_name && <p className="text-xs text-slate-500 italic truncate">{item.scientific_name}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm flex-wrap">
        <span className="font-semibold text-teal-700">
          {item.quantity} {item.unit}
        </span>
        {item.purity != null && <span className="text-slate-500 text-xs">{item.purity}% pure</span>}
        {item.concentration != null && (
          <span className="text-slate-500 text-xs">{item.concentration} {item.concentration_unit}</span>
        )}
        {item.location && (
          <span className="text-slate-400 text-xs">{item.location}</span>
        )}
      </div>

      {item.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
              <Tag className="w-2.5 h-2.5" /> {tag}
            </span>
          ))}
        </div>
      )}

      {item.cas_number && (
        <p className="text-xs text-slate-400">CAS: {item.cas_number}</p>
      )}

      <Button
        size="sm"
        onClick={() => onAddToSim(item)}
        className="mt-1 w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:opacity-90 text-white text-xs"
      >
        <FlaskConical className="w-3.5 h-3.5 mr-1.5" /> Add to simulation
      </Button>
    </motion.div>
  );
}

export default function ChemicalInventoryManager({ onAddToSimulation }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["chemical-inventory"],
    queryFn: () => base44.entities.ChemicalInventory.list("-created_date", 200),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: payload => base44.entities.ChemicalInventory.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["chemical-inventory"]);
      setShowAddForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => base44.entities.ChemicalInventory.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["chemical-inventory"]);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.ChemicalInventory.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["chemical-inventory"])
  });

  const filtered = inventory.filter(item => {
    const q = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.scientific_name?.toLowerCase().includes(q) ||
      item.cas_number?.toLowerCase().includes(q) ||
      item.tags?.some(t => t.toLowerCase().includes(q)) ||
      item.location?.toLowerCase().includes(q)
    );
  });

  const lowStockCount = inventory.filter(
    i => i.low_stock_threshold != null && i.quantity <= i.low_stock_threshold
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chemical Inventory</h2>
            <p className="text-xs text-slate-500">
              {inventory.length} chemical{inventory.length !== 1 ? "s" : ""} stocked
              {lowStockCount > 0 && (
                <span className="ml-2 text-orange-600 font-semibold">{lowStockCount} low stock</span>
              )}
            </p>
          </div>
        </div>
        <Button
          onClick={() => { setShowAddForm(true); setEditingItem(null); }}
          className="bg-teal-600 hover:bg-teal-700 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add chemical
        </Button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-teal-200 bg-teal-50/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <h3 className="font-semibold text-slate-900 text-sm">Add new chemical</h3>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ItemForm
                  onSave={payload => createMutation.mutate(payload)}
                  onCancel={() => setShowAddForm(false)}
                  saving={createMutation.isPending}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, CAS number, tag, or location..."
          className="pl-9"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {search ? "No chemicals match your search." : "Your inventory is empty. Add your first chemical above."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {filtered.map(item => (
              editingItem?.id === item.id ? (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="sm:col-span-2 lg:col-span-3"
                >
                  <Card className="border-teal-200 bg-teal-50/30">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <h3 className="font-semibold text-slate-900 text-sm">Edit: {item.name}</h3>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <ItemForm
                        initial={toFormData(editingItem)}
                        onSave={payload => updateMutation.mutate({ id: item.id, payload })}
                        onCancel={() => setEditingItem(null)}
                        saving={updateMutation.isPending}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onAddToSim={onAddToSimulation}
                  onEdit={setEditingItem}
                  onDelete={id => deleteMutation.mutate(id)}
                />
              )
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}