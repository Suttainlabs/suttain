import React, { useState, useEffect } from "react";
import { Beaker, Thermometer, Gauge, FlaskConical, Save, Library, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SOLVENT_OPTIONS = [
  { value: "none", label: "None / Vacuum" },
  { value: "water", label: "Water (explicit)" },
  { value: "tip3p", label: "TIP3P" },
  { value: "tip4p", label: "TIP4P" },
  { value: "spc", label: "SPC" },
  { value: "methanol", label: "Methanol" },
  { value: "ethanol", label: "Ethanol" },
  { value: "chloroform", label: "Chloroform" },
  { value: "hexane", label: "Hexane" },
  { value: "toluene", label: "Toluene" },
  { value: "dmso", label: "DMSO" },
  { value: "acetonitrile", label: "Acetonitrile" },
  { value: "custom", label: "Custom" },
];

const BOUNDARY_OPTIONS = [
  { value: "periodic", label: "Periodic" },
  { value: "vacuum", label: "Vacuum" },
  { value: "spherical", label: "Spherical" },
  { value: "cylindrical", label: "Cylindrical" },
  { value: "slab", label: "Slab" },
];

const BOX_OPTIONS = [
  { value: "cubic", label: "Cubic" },
  { value: "orthorhombic", label: "Orthorhombic" },
  { value: "truncated_octahedron", label: "Truncated Octahedron" },
  { value: "rhombic_dodecahedron", label: "Rhombic Dodecahedron" },
];

const THERMOSTAT_OPTIONS = [
  { value: "vrescale", label: "Velocity Rescaling" },
  { value: "nose_hoover", label: "Nose-Hoover" },
  { value: "berendsen", label: "Berendsen" },
  { value: "langevin", label: "Langevin" },
  { value: "andersen", label: "Andersen" },
  { value: "none", label: "None" },
];

const BAROSTAT_OPTIONS = [
  { value: "parrinello_rahman", label: "Parrinello-Rahman" },
  { value: "c_rescale", label: "C-Rescale" },
  { value: "berendsen", label: "Berendsen" },
  { value: "monte_carlo", label: "Monte Carlo" },
  { value: "none", label: "None" },
];

const DEFAULT_ENV = {
  solvent: "water",
  solvent_custom: "",
  forcefield: "",
  temperature: 300,
  pressure: 1.0,
  ph: 7.0,
  ionic_strength: 0.15,
  boundary_conditions: "periodic",
  box_type: "cubic",
  thermostat: "vrescale",
  barostat: "parrinello_rahman",
  environment_id: null,
};

function SelectInput({ label, value, onChange, options }) {
  return (
    <div>
      <Label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</Label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white text-slate-800"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function NumberInput({ label, value, onChange, placeholder, unit }) {
  return (
    <div>
      <Label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          step="any"
          value={value ?? ""}
          onChange={e => onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
          placeholder={placeholder}
          className="pr-12"
        />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{unit}</span>}
      </div>
    </div>
  );
}

export default function EnvironmentalParametersPanel({ params, onChange, simType }) {
  const queryClient = useQueryClient();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [envName, setEnvName] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);

  const env = { ...DEFAULT_ENV, ...params };

  const update = (key, value) => {
    onChange({ ...env, [key]: value, environment_id: null });
  };

  const { data: savedEnvs = [] } = useQuery({
    queryKey: ['simulation-environments'],
    queryFn: () => base44.entities.SimulationEnvironment.list('-created_date', 50),
  });

  const saveMutation = useMutation({
    mutationFn: async (name) => {
      return base44.entities.SimulationEnvironment.create({
        name,
        solvent: env.solvent,
        solvent_custom: env.solvent_custom,
        forcefield: env.forcefield,
        temperature: env.temperature,
        pressure: env.pressure,
        ph: env.ph,
        ionic_strength: env.ionic_strength,
        boundary_conditions: env.boundary_conditions,
        box_type: env.box_type,
        thermostat: env.thermostat,
        barostat: env.barostat,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulation-environments'] });
      toast.success('Environment saved as reusable preset');
      setShowSaveDialog(false);
      setEnvName("");
    },
    onError: (e) => toast.error('Failed to save: ' + e.message),
  });

  const loadEnv = (preset) => {
    onChange({
      solvent: preset.solvent,
      solvent_custom: preset.solvent_custom || "",
      forcefield: preset.forcefield || "",
      temperature: preset.temperature,
      pressure: preset.pressure,
      ph: preset.ph,
      ionic_strength: preset.ionic_strength,
      boundary_conditions: preset.boundary_conditions,
      box_type: preset.box_type,
      thermostat: preset.thermostat,
      barostat: preset.barostat,
      environment_id: preset.id,
    });
    setShowLibrary(false);
    toast.success(`Loaded "${preset.name}"`);
  };

  const isMDLike = ['molecular_dynamics', 'protein_modeling', 'biomolecular_dynamics', 'monte_carlo'].includes(simType);

  return (
    <Card className="border-2 border-cyan-200 bg-cyan-50/30">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Beaker className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Environmental Parameters</h3>
              <p className="text-xs text-slate-500">Isolated sandbox conditions — decoupled from saved entities</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowLibrary(true)} className="gap-1.5 text-xs">
              <Library className="w-3.5 h-3.5" /> Load Preset
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowSaveDialog(true)} className="gap-1.5 text-xs">
              <Save className="w-3.5 h-3.5" /> Save Preset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-1">
            <SelectInput label="Solvent" value={env.solvent} onChange={v => update('solvent', v)} options={SOLVENT_OPTIONS} />
          </div>
          {env.solvent === 'custom' && (
            <div className="md:col-span-2">
              <Label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Custom Solvent Description</Label>
              <Input value={env.solvent_custom} onChange={e => update('solvent_custom', e.target.value)} placeholder="e.g. 80:20 water:ethanol mixture" />
            </div>
          )}
          <div>
            <Label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
              <FlaskConical className="w-3 h-3" /> Forcefield
            </Label>
            <Input value={env.forcefield} onChange={e => update('forcefield', e.target.value)} placeholder="e.g. AMBER99SB-ILDN" />
          </div>
          <NumberInput label="Temperature" value={env.temperature} onChange={v => update('temperature', v)} placeholder="300" unit="K" />
          <NumberInput label="Pressure" value={env.pressure} onChange={v => update('pressure', v)} placeholder="1.0" unit="bar" />
          <NumberInput label="pH" value={env.ph} onChange={v => update('ph', v)} placeholder="7.0" unit="pH" />
          <NumberInput label="Ionic Strength" value={env.ionic_strength} onChange={v => update('ionic_strength', v)} placeholder="0.15" unit="mol/L" />

          {isMDLike && (
            <>
              <SelectInput label="Boundary Conditions" value={env.boundary_conditions} onChange={v => update('boundary_conditions', v)} options={BOUNDARY_OPTIONS} />
              <SelectInput label="Box Type" value={env.box_type} onChange={v => update('box_type', v)} options={BOX_OPTIONS} />
              <SelectInput label="Thermostat" value={env.thermostat} onChange={v => update('thermostat', v)} options={THERMOSTAT_OPTIONS} />
              <SelectInput label="Barostat" value={env.barostat} onChange={v => update('barostat', v)} options={BAROSTAT_OPTIONS} />
            </>
          )}
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowSaveDialog(false)}>
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Save Environment Preset</h3>
                <button onClick={() => setShowSaveDialog(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              </div>
              <Input value={envName} onChange={e => setEnvName(e.target.value)} placeholder="e.g. Physiological Saline 310K" className="mb-4" />
              <Button onClick={() => envName.trim() && saveMutation.mutate(envName.trim())} disabled={!envName.trim() || saveMutation.isPending} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                {saveMutation.isPending ? 'Saving...' : 'Save Preset'}
              </Button>
            </div>
          </div>
        )}

        {/* Library Dialog */}
        {showLibrary && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setShowLibrary(false)}>
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Saved Environment Presets</h3>
                <button onClick={() => setShowLibrary(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              </div>
              {savedEnvs.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No saved presets yet. Configure parameters and save for reuse.</p>
              ) : (
                <div className="space-y-2">
                  {savedEnvs.map(preset => (
                    <button key={preset.id} onClick={() => loadEnv(preset)} className="w-full text-left p-3 border border-slate-200 rounded-xl hover:border-cyan-400 hover:bg-cyan-50 transition-colors">
                      <p className="font-semibold text-sm text-slate-900">{preset.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {preset.solvent} · {preset.temperature}K · {preset.pressure}bar
                        {preset.forcefield ? ` · ${preset.forcefield}` : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}