import React, { useState, useMemo } from "react";
import { Search, Beaker, FlaskConical, Pill, Leaf, Atom, BookOpen, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PRESETS = [
  {
    id: "skincare-stability",
    label: "Skincare Formulation Stability",
    category: "skincare",
    tag: "Small Brand",
    tagColor: "bg-pink-100 text-pink-700",
    simType: "dft",
    description: "Check if a retinol molecule is stable under UV and oxidative conditions.",
    fields: { molecule: "retinol C20H30O", functional: "B3LYP", basis_set: "6-31G*", task: "geometry optimization and UV stability" },
    engine: "ORCA",
  },
  {
    id: "household-bleach-ammonia",
    label: "Household Chemical Safety",
    category: "safety",
    tag: "Student",
    tagColor: "bg-blue-100 text-blue-700",
    simType: "dft",
    description: "Evaluate chloramine formation when bleach contacts ammonia-based cleaners.",
    fields: { molecule: "NaClO + NH3", functional: "PBE0", basis_set: "6-311G*", task: "reaction pathway and product formation" },
    engine: "Gaussian",
  },
  {
    id: "drug-receptor-binding",
    label: "Drug-Receptor Binding Prediction",
    category: "drug",
    tag: "Researcher",
    tagColor: "bg-violet-100 text-violet-700",
    simType: "drug_discovery",
    description: "Predict ibuprofen binding affinity to the COX-2 enzyme.",
    fields: { ligand: "Ibuprofen C13H18O2", receptor: "COX-2 (PDB: 5IKR)", binding_site: "active site", properties: "binding affinity, ADMET, LogP" },
    engine: "AutoDock Vina",
  },
  {
    id: "biodegradability",
    label: "Biodegradability Testing",
    category: "environmental",
    tag: "Small Brand",
    tagColor: "bg-green-100 text-green-700",
    simType: "environmental",
    description: "Estimate aerobic biodegradation half-life of a surfactant in freshwater.",
    fields: { compound: "sodium lauryl sulfate SDS", environment: "Aquatic (freshwater)", process: "Biodegradation", metrics: "Half-life" },
    engine: "EPI Suite",
  },
  {
    id: "catalyst-efficiency",
    label: "Catalyst Efficiency",
    category: "catalysis",
    tag: "Researcher",
    tagColor: "bg-violet-100 text-violet-700",
    simType: "surface_chemistry",
    description: "Calculate CO oxidation activation barrier on a Pt(111) surface.",
    fields: { surface: "Pt(111)", reactants: "CO + O2", analysis_type: "Activation barrier", functional: "PBE" },
    engine: "VASP",
  },
  {
    id: "environmental-persistence",
    label: "Environmental Persistence",
    category: "environmental",
    tag: "Researcher",
    tagColor: "bg-violet-100 text-violet-700",
    simType: "environmental",
    description: "Model PFAS fate and persistence in groundwater systems.",
    fields: { compound: "PFOS (perfluorooctane sulfonate)", environment: "Groundwater", process: "Bioaccumulation", metrics: "BCF (bioconcentration)" },
    engine: "EPI Suite",
  },
  {
    id: "protein-folding",
    label: "Protein Folding Analysis",
    category: "biology",
    tag: "Researcher",
    tagColor: "bg-violet-100 text-violet-700",
    simType: "protein_modeling",
    description: "Predict secondary structure of an insulin variant.",
    fields: { sequence: "UniProt: P01308", analysis_type: "secondary structure, RMSD, stability", environment: "physiological pH 7.4", mutations: "A21G" },
    engine: "AlphaFold",
  },
  {
    id: "nanoparticle-band-gap",
    label: "Nanoparticle Band Gap",
    category: "materials",
    tag: "Researcher",
    tagColor: "bg-violet-100 text-violet-700",
    simType: "materials",
    description: "Compute the electronic band gap of a TiO2 photocatalyst.",
    fields: { material: "TiO2 rutile", property: "Band gap", kpoints: "6x6x6", functional: "HSE06" },
    engine: "Quantum ESPRESSO",
  },
  {
    id: "vitamin-c-oxidation",
    label: "Vitamin C Oxidation Stability",
    category: "skincare",
    tag: "Small Brand",
    tagColor: "bg-pink-100 text-pink-700",
    simType: "dft",
    description: "Assess ascorbic acid oxidation susceptibility in aqueous formulations.",
    fields: { molecule: "ascorbic acid C6H8O6", functional: "M06-2X", basis_set: "6-311+G**", task: "single point energy, HOMO-LUMO gap" },
    engine: "Gaussian",
  },
  {
    id: "co2-adsorption-mof",
    label: "CO2 Adsorption in MOF",
    category: "environmental",
    tag: "Researcher",
    tagColor: "bg-violet-100 text-violet-700",
    simType: "monte_carlo",
    description: "Calculate CO2 adsorption isotherm in MOF-5 at 298K.",
    fields: { system: "CO2 adsorption in MOF-5 at 298K", ensemble: "GCMC", temperature: "298", property: "Adsorption isotherm" },
    engine: "RASPA",
  },
  {
    id: "pesticide-photodegradation",
    label: "Pesticide Photodegradation",
    category: "environmental",
    tag: "Student",
    tagColor: "bg-blue-100 text-blue-700",
    simType: "environmental",
    description: "Predict atrazine photodegradation half-life in surface water.",
    fields: { compound: "atrazine herbicide C8H14ClN5", environment: "Aquatic (freshwater)", process: "Photodegradation", metrics: "Half-life" },
    engine: "ORCA",
  },
  {
    id: "caffeine-solubility",
    label: "Caffeine Solubility & Partitioning",
    category: "skincare",
    tag: "Small Brand",
    tagColor: "bg-pink-100 text-pink-700",
    simType: "dft",
    description: "Calculate LogP and aqueous solubility of caffeine for topical formulation.",
    fields: { molecule: "caffeine C8H10N4O2", functional: "PBE0", basis_set: "def2-TZVP", task: "LogP, solvation energy, electrostatic potential" },
    engine: "ORCA",
  },
];

const CATEGORY_ICONS = {
  skincare: Beaker,
  safety: FlaskConical,
  drug: Pill,
  environmental: Leaf,
  catalysis: Atom,
  biology: BookOpen,
  materials: Atom,
};

export default function SimulationPresets({ onSelectPreset }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() =>
    PRESETS.filter(p =>
      search === "" ||
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tag.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  const handleSelect = (preset) => {
    setSelected(preset.id);
    onSelectPreset(preset);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">Simulation Templates</h2>
          <p className="text-xs text-slate-500">Select a preset to auto-fill the simulation form</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(preset => {
          const Icon = CATEGORY_ICONS[preset.category] || Atom;
          const isActive = selected === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset)}
              className={`text-left p-4 rounded-xl border-2 transition-all focus:outline-none ${
                isActive
                  ? "border-violet-500 bg-violet-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-violet-600" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${preset.tagColor}`}>
                  {preset.tag}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 leading-tight mb-1">{preset.label}</p>
              <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{preset.description}</p>
              {isActive && (
                <p className="text-[10px] text-violet-600 font-semibold mt-2">Applied to form below</p>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-8 text-sm text-slate-500">No templates match your search.</div>
        )}
      </div>
    </div>
  );
}