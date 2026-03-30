import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Search, Filter, Leaf, FlaskConical, Droplets, ShieldCheck, AlertTriangle, Skull, Info, X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- Tooltip Component ---
const Tooltip = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  return (
    <div className="relative inline-block" ref={ref}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && content && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl pointer-events-none"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Config ---
const TOXICITY_CONFIG = {
  safe:           { label: "Safe",         color: "text-green-600",  bg: "bg-green-100",  icon: ShieldCheck,     border: "border-green-200" },
  moderate:       { label: "Moderate",     color: "text-yellow-600", bg: "bg-yellow-100", icon: AlertTriangle,   border: "border-yellow-200" },
  hazardous:      { label: "Hazardous",    color: "text-orange-600", bg: "bg-orange-100", icon: AlertTriangle,   border: "border-orange-200" },
  highly_hazardous:{ label: "High Hazard", color: "text-red-600",    bg: "bg-red-100",    icon: Skull,           border: "border-red-200" },
  unknown:        { label: "Unknown",      color: "text-slate-500",  bg: "bg-slate-100",  icon: Info,            border: "border-slate-200" },
};

const ORIGIN_CONFIG = {
  natural:    { label: "Natural",    color: "text-emerald-600", bg: "bg-emerald-100", icon: Leaf },
  synthetic:  { label: "Synthetic",  color: "text-blue-600",    bg: "bg-blue-100",    icon: FlaskConical },
  both:       { label: "Semi-Synth", color: "text-violet-600",  bg: "bg-violet-100",  icon: Droplets },
};

const ECO_LEVELS = [
  { value: "all", label: "All Impact" },
  { value: "low",  label: "Low Impact" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High Impact" },
];

const getEcoLevel = (chemical) => {
  const eco = chemical.environmental_data;
  if (!eco) return "unknown";
  const bio = (eco.biodegradability || "").toLowerCase();
  const aquatic = (eco.aquatic_toxicity || "").toLowerCase();
  if (bio.includes("readily") || bio.includes("high")) return "low";
  if (aquatic.includes("very toxic") || aquatic.includes("high") || eco.bioaccumulation_factor > 1000) return "high";
  if (bio.includes("moderate") || aquatic.includes("moderate")) return "medium";
  return "low";
};

const getOrigin = (chemical) => {
  const name = (chemical.name + " " + (chemical.function_description || "")).toLowerCase();
  const naturalKeywords = ["plant", "botanical", "natural", "vegetable", "fruit", "herb", "essential oil", "extract", "bio"];
  const syntheticKeywords = ["synthetic", "polymer", "petroleum", "chemical synthesis", "artificial"];
  const isNatural = naturalKeywords.some(k => name.includes(k));
  const isSynthetic = syntheticKeywords.some(k => name.includes(k));
  if (isNatural && isSynthetic) return "both";
  if (isNatural) return "natural";
  const type = chemical.chemical_type || "";
  if (["element", "salt", "inorganic_acid", "inorganic_base", "oxide"].includes(type)) return "synthetic";
  return "synthetic";
};

// --- Chemical Card ---
const ChemicalCard = ({ chemical }) => {
  const toxicity = chemical.safety_level || "unknown";
  const toxConfig = TOXICITY_CONFIG[toxicity] || TOXICITY_CONFIG.unknown;
  const ToxIcon = toxConfig.icon;
  const origin = getOrigin(chemical);
  const originConfig = ORIGIN_CONFIG[origin] || ORIGIN_CONFIG.synthetic;
  const OriginIcon = originConfig.icon;
  const ecoLevel = getEcoLevel(chemical);

  const ecoColors = {
    low: "text-green-600 bg-green-100",
    medium: "text-yellow-600 bg-yellow-100",
    high: "text-red-600 bg-red-100",
    unknown: "text-slate-500 bg-slate-100",
  };

  const tooltipContent = chemical.function_description
    ? `Function: ${chemical.function_description}`
    : chemical.category
    ? `Category: ${chemical.category.replace(/_/g, " ")}`
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl border ${toxConfig.border} p-4 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">{chemical.name}</h3>
          {chemical.scientific_name && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{chemical.scientific_name}</p>
          )}
          {chemical.cas_number && (
            <p className="text-xs text-slate-300 mt-0.5">CAS: {chemical.cas_number}</p>
          )}
        </div>
        {tooltipContent && (
          <Tooltip content={tooltipContent}>
            <button className="ml-2 flex-shrink-0 text-slate-400 hover:text-teal-500 transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {/* Toxicity */}
        <Tooltip content={`Toxicity: ${toxConfig.label}${chemical.toxicity_data?.ld50_oral ? ` — LD50 oral: ${chemical.toxicity_data.ld50_oral}` : ""}`}>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full cursor-default ${toxConfig.bg} ${toxConfig.color}`}>
            <ToxIcon className="w-3 h-3" />
            {toxConfig.label}
          </span>
        </Tooltip>

        {/* Origin */}
        <Tooltip content={`Origin: ${originConfig.label}`}>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full cursor-default ${originConfig.bg} ${originConfig.color}`}>
            <OriginIcon className="w-3 h-3" />
            {originConfig.label}
          </span>
        </Tooltip>

        {/* Eco Impact */}
        <Tooltip content={`Environmental impact: ${ecoLevel}${chemical.environmental_data?.biodegradability ? ` — Biodegradability: ${chemical.environmental_data.biodegradability}` : ""}`}>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full cursor-default ${ecoColors[ecoLevel]}`}>
            <Leaf className="w-3 h-3" />
            {ecoLevel === "low" ? "Low Impact" : ecoLevel === "medium" ? "Medium" : ecoLevel === "high" ? "High Impact" : "Eco Unknown"}
          </span>
        </Tooltip>

        {/* Category */}
        {chemical.category && (
          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {chemical.category.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {/* Formula function tooltip hint */}
      {chemical.function_description && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{chemical.function_description}</p>
      )}
    </motion.div>
  );
};

// --- Filter Pill ---
const FilterPill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
      active
        ? "bg-[#02988C] text-white border-[#02988C] shadow-sm"
        : "bg-white text-slate-600 border-slate-200 hover:border-[#02988C] hover:text-[#02988C]"
    }`}
  >
    {children}
  </button>
);

// --- Main Page ---
export default function IngredientDatabase() {
  const [chemicals, setChemicals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toxFilter, setToxFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [ecoFilter, setEcoFilter] = useState("all");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    base44.entities.Chemical.list("-created_date", 500)
      .then(data => {
        setChemicals(data || []);
      })
      .catch(err => {
        console.error("Failed to load chemicals:", err);
        setChemicals([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Live suggestions filtered from loaded chemicals
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = search.toLowerCase();
    const matches = chemicals.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.scientific_name?.toLowerCase().includes(q) ||
      c.cas_number?.includes(q)
    ).slice(0, 8);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }, [search, chemicals]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSuggestionClick = (name) => {
    setSearch(name);
    setShowSuggestions(false);
  };

  const hasFilters = toxFilter !== "all" || originFilter !== "all" || ecoFilter !== "all" || search;
  const clearFilters = () => { setToxFilter("all"); setOriginFilter("all"); setEcoFilter("all"); setSearch(""); setSuggestions([]); setShowSuggestions(false); };

  const filtered = chemicals.filter(c => {
    const q = search.toLowerCase();
    if (q && !c.name?.toLowerCase().includes(q) && !c.scientific_name?.toLowerCase().includes(q) && !c.cas_number?.includes(q)) return false;
    if (toxFilter !== "all" && c.safety_level !== toxFilter) return false;
    if (originFilter !== "all" && getOrigin(c) !== originFilter) return false;
    if (ecoFilter !== "all" && getEcoLevel(c) !== ecoFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-white border-b border-slate-200 py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-[#02988C]/10 text-[#02988C] px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <FlaskConical className="w-4 h-4" />
              Ingredient Database
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Visual Ingredient Explorer
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Browse chemicals by toxicity, origin, and environmental impact. Hover any badge or info icon to learn how each ingredient functions in a formula.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-shrink-0 w-full sm:w-72" ref={searchRef}>
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search ingredients…"
              className="w-full pl-9 pr-8 py-2 text-sm rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            {search && (
              <button onClick={() => { setSearch(""); setSuggestions([]); setShowSuggestions(false); }} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  {suggestions.map(c => (
                    <button
                      key={c.id}
                      onMouseDown={() => handleSuggestionClick(c.name)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                        {c.scientific_name && <p className="text-xs text-slate-400 truncate">{c.scientific_name}</p>}
                      </div>
                      {c.safety_level && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${TOXICITY_CONFIG[c.safety_level]?.bg} ${TOXICITY_CONFIG[c.safety_level]?.color}`}>
                          {TOXICITY_CONFIG[c.safety_level]?.label}
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Groups */}
          <div className="flex flex-wrap gap-2 items-center flex-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1"><Filter className="w-3 h-3" />Toxicity:</span>
            {["all", "safe", "moderate", "hazardous", "highly_hazardous"].map(v => (
              <FilterPill key={v} active={toxFilter === v} onClick={() => setToxFilter(v)}>
                {v === "all" ? "All" : TOXICITY_CONFIG[v]?.label}
              </FilterPill>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto flex flex-wrap gap-2 items-center mt-2">
          <span className="text-xs text-slate-400 font-semibold">Origin:</span>
          {["all", "natural", "synthetic", "both"].map(v => (
            <FilterPill key={v} active={originFilter === v} onClick={() => setOriginFilter(v)}>
              {v === "all" ? "All" : ORIGIN_CONFIG[v]?.label}
            </FilterPill>
          ))}

          <span className="text-xs text-slate-400 font-semibold ml-2">Eco Impact:</span>
          {ECO_LEVELS.map(({ value, label }) => (
            <FilterPill key={value} active={ecoFilter === value} onClick={() => setEcoFilter(value)}>
              {label}
            </FilterPill>
          ))}

          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-600 font-semibold ml-1 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            {isLoading ? "Loading…" : `${filtered.length} ingredient${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No ingredients match your filters.</p>
            <button onClick={clearFilters} className="mt-3 text-sm text-teal-600 hover:underline">Clear filters</button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map(c => <ChemicalCard key={c.id} chemical={c} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}