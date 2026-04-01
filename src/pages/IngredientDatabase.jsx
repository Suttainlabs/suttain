import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Search, Filter, Leaf, FlaskConical, Droplets, ShieldCheck, AlertTriangle, Skull, Info, X, ExternalLink, Loader2, FileDown } from "lucide-react";

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
  const name = (chemical.name + " " + (chemical.scientific_name || "") + " " + (chemical.function_description || "")).toLowerCase();
  const formula = (chemical.molecular_formula || "").toUpperCase();

  // Natural origin keywords
  const naturalKeywords = ["plant", "botanical", "natural", "vegetable", "fruit", "herb", "essential oil", "extract", "bio", "aloe", "coconut", "jojoba", "shea", "castor", "olive", "avocado", "argan", "vitamin", "amino acid", "peptide", "honey", "beeswax", "lanolin", "collagen", "keratin", "enzyme", "ferment"];
  // Synthetic keywords
  const syntheticKeywords = ["synthetic", "polymer", "petroleum", "silicone", "parabens", "paraben", "phthalate", "sulfate", "acrylate", "polyethylene", "polypropylene", "artificial", "perfluoro", "trifluoro", "fluoromet"];

  const isNatural = naturalKeywords.some(k => name.includes(k));
  const isSynthetic = syntheticKeywords.some(k => name.includes(k));
  if (isNatural && isSynthetic) return "both";
  if (isNatural) return "natural";
  if (isSynthetic) return "synthetic";

  const type = chemical.chemical_type || "";
  // Pure elements are not synthetic (they're naturally occurring)
  if (type === "element") return "natural";
  // Inorganic minerals/salts occur naturally
  if (["salt", "inorganic_acid", "inorganic_base", "oxide"].includes(type)) {
    // Simple inorganic: no Carbon or only CO3/carbonate
    if (!formula.includes("C") || formula.match(/^[^C]*CO3[^C]*$/)) return "natural";
  }
  // Organic acids/bases — check for carbon chains
  if (type === "organic_acid" || type === "organic_base") return "synthetic";
  // Semi-synthetic: has C but also natural-sounding name
  const iupac = (chemical.scientific_name || "").toLowerCase();
  if (iupac.includes("oleate") || iupac.includes("palmitate") || iupac.includes("stearate") || iupac.includes("linoleate") || iupac.includes("laurate") || iupac.includes("myristate")) return "both";
  // Fluorinated / halogenated = synthetic
  if (formula.includes("F") || (formula.match(/CL/i) && formula.includes("C"))) return "synthetic";
  // Metals and their salts occur in nature
  if (/^(FE|NA|MG|CA|ZN|CU|MN|CO|NI|AG|AU|AL|K|LI|SI)[0-9]*/i.test(formula.replace(/\s/g,""))) return "natural";
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
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

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

  const handleSummary = async () => {
    if (showSummary) { setShowSummary(false); return; }
    setShowSummary(true);
    if (summary) return;
    setSummaryLoading(true);
    try {
      // Try PubChem description first
      let text = null;
      if (chemical._pubchem_cid) {
        const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${chemical._pubchem_cid}/description/JSON`);
        if (res.ok) {
          const json = await res.json();
          const descs = json.InformationList?.Information || [];
          text = descs.find(d => d.Description)?.Description || null;
        }
      }
      // Fallback: AI summary
      if (!text) {
        const aiRes = await base44.integrations.Core.InvokeLLM({
          prompt: `Give a concise 2-3 sentence summary of the chemical ingredient "${chemical.name}" (${chemical.scientific_name || ""}). Cover its main uses, safety notes, and any notable properties. Be factual and brief.`
        });
        text = aiRes;
      }
      setSummary(text);
    } catch {
      setSummary("Summary unavailable.");
    } finally {
      setSummaryLoading(false);
    }
  };

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
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {chemical._pubchem_cid && (
            <a
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${chemical._pubchem_cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:text-teal-700 transition-colors"
              title="View on PubChem"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {tooltipContent && (
            <Tooltip content={tooltipContent}>
              <button className="text-slate-400 hover:text-teal-500 transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Tooltip content={`Toxicity: ${toxConfig.label}${chemical.toxicity_data?.ld50_oral ? ` — LD50 oral: ${chemical.toxicity_data.ld50_oral}` : ""}`}>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full cursor-default ${toxConfig.bg} ${toxConfig.color}`}>
            <ToxIcon className="w-3 h-3" />
            {toxConfig.label}
          </span>
        </Tooltip>
        <Tooltip content={`Origin: ${originConfig.label}`}>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full cursor-default ${originConfig.bg} ${originConfig.color}`}>
            <OriginIcon className="w-3 h-3" />
            {originConfig.label}
          </span>
        </Tooltip>
        <Tooltip content={`Environmental impact: ${ecoLevel}${chemical.environmental_data?.biodegradability ? ` — Biodegradability: ${chemical.environmental_data.biodegradability}` : ""}`}>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full cursor-default ${ecoColors[ecoLevel]}`}>
            <Leaf className="w-3 h-3" />
            {ecoLevel === "low" ? "Low Impact" : ecoLevel === "medium" ? "Medium" : ecoLevel === "high" ? "High Impact" : "Eco Unknown"}
          </span>
        </Tooltip>
        {chemical.category && (
          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {chemical.category.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {/* Action row */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSummary}
          className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors"
        >
          {summaryLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          {showSummary ? "Hide summary" : "Get summary"}
        </button>
        <a
          href={chemical._pubchem_cid
            ? `https://pubchem.ncbi.nlm.nih.gov/compound/${chemical._pubchem_cid}#section=Safety-and-Hazards`
            : `https://cameochemicals.noaa.gov/search/simple?q=${encodeURIComponent(chemical.name)}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          title="Download free Safety Data Sheet"
        >
          <FileDown className="w-3.5 h-3.5" />
          Free SDS
        </a>
        <a
          href={`https://cameochemicals.noaa.gov/search/simple?q=${encodeURIComponent(chemical.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
          title="Search NOAA CAMEO Chemicals database"
        >
          <ExternalLink className="w-3 h-3" />
          CAMEO
        </a>
      </div>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pt-2 border-t border-slate-100">
              {summaryLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading summary…
                </div>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">{summary}</p>
              )}
              {chemical._pubchem_cid && !summaryLoading && (
                <a
                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${chemical._pubchem_cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline mt-1.5"
                >
                  <ExternalLink className="w-3 h-3" /> Full details on PubChem
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

// --- PubChem helpers ---
const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const PUBCHEM_AUTO = "https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound";

const mapPubchemToChemical = (props, name) => ({
  id: `pubchem_${props.CID}`,
  name: name,
  scientific_name: props.IUPACName || name,
  cas_number: null,
  molecular_formula: props.MolecularFormula || null,
  molecular_weight: props.MolecularWeight || null,
  smiles: props.CanonicalSMILES || null,
  safety_level: "unknown",
  category: null,
  chemical_type: "compound",
  environmental_data: null,
  toxicity_data: null,
  function_description: props.IUPACName ? `IUPAC: ${props.IUPACName}` : null,
  _pubchem_cid: props.CID,
  _source: "pubchem",
});

// --- Main Page ---
export default function IngredientDatabase() {
  const [localChemicals, setLocalChemicals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toxFilter, setToxFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [ecoFilter, setEcoFilter] = useState("all");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [pubchemResults, setPubchemResults] = useState([]);
  const [isPubchemLoading, setIsPubchemLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const suppressSuggestRef = useRef(false);

  useEffect(() => {
    base44.entities.Chemical.list("-created_date", 500)
      .then(data => setLocalChemicals(data || []))
      .catch(() => setLocalChemicals([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Debounced autocomplete: local filter + PubChem autocomplete
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!search.trim() || search.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      if (suppressSuggestRef.current) { suppressSuggestRef.current = false; return; }
      setIsSuggestLoading(true);
      const q = search.toLowerCase();
      // Local matches
      const local = localChemicals
        .filter(c => c.name?.toLowerCase().includes(q) || c.scientific_name?.toLowerCase().includes(q) || c.cas_number?.includes(q))
        .slice(0, 4)
        .map(c => ({ label: c.name, sublabel: c.scientific_name, source: "local", data: c }));
      // PubChem autocomplete
      let pubchem = [];
      try {
        const res = await fetch(`${PUBCHEM_AUTO}/${encodeURIComponent(search)}/JSON?limit=8`);
        if (res.ok) {
          const json = await res.json();
          pubchem = (json.dictionary_terms?.compound || []).slice(0, 8 - local.length).map(name => ({
            label: name, sublabel: "PubChem database", source: "pubchem", name
          }));
        }
      } catch {}
      const combined = [...local, ...pubchem];
      setSuggestions(combined);
      setShowSuggestions(combined.length > 0);
      setIsSuggestLoading(false);
    }, 300);
  }, [search, localChemicals]);

  // Fetch PubChem compound details when search is committed
  const fetchPubchemResults = useCallback(async (query) => {
    if (!query || query.length < 2) { setPubchemResults([]); return; }
    setIsPubchemLoading(true);
    try {
      const res = await fetch(`${PUBCHEM_BASE}/compound/name/${encodeURIComponent(query)}/property/IUPACName,MolecularFormula,MolecularWeight,CanonicalSMILES/JSON?MaxRecords=20`);
      if (res.ok) {
        const json = await res.json();
        const props = json.PropertyTable?.Properties || [];
        const mapped = props.map(p => mapPubchemToChemical(p, query));
        // Dedupe by CID
        const seen = new Set();
        const deduped = mapped.filter(c => { if (seen.has(c._pubchem_cid)) return false; seen.add(c._pubchem_cid); return true; });
        setPubchemResults(deduped);
      } else {
        setPubchemResults([]);
      }
    } catch {
      setPubchemResults([]);
    } finally {
      setIsPubchemLoading(false);
    }
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    const name = suggestion.label;
    suppressSuggestRef.current = true;
    setSearch(name);
    setShowSuggestions(false);
    fetchPubchemResults(name);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      fetchPubchemResults(search);
    }
  };

  const hasFilters = toxFilter !== "all" || originFilter !== "all" || ecoFilter !== "all" || search;
  const clearFilters = () => {
    setToxFilter("all"); setOriginFilter("all"); setEcoFilter("all");
    setSearch(""); setSuggestions([]); setShowSuggestions(false); setPubchemResults([]);
  };

  const filteredLocal = localChemicals.filter(c => {
    const q = search.toLowerCase();
    if (q && !c.name?.toLowerCase().includes(q) && !c.scientific_name?.toLowerCase().includes(q) && !c.cas_number?.includes(q)) return false;
    if (toxFilter !== "all" && c.safety_level !== toxFilter) return false;
    if (originFilter !== "all" && getOrigin(c) !== originFilter) return false;
    if (ecoFilter !== "all" && getEcoLevel(c) !== ecoFilter) return false;
    return true;
  });

  // Merge: local first, then pubchem (deduped by name)
  const localNames = new Set(filteredLocal.map(c => c.name?.toLowerCase()));
  const filteredPubchem = pubchemResults.filter(c => !localNames.has(c.name?.toLowerCase()));
  const filtered = [...filteredLocal, ...filteredPubchem];

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
              Search 250,000+ chemicals from PubChem plus our curated database. Explore toxicity, origin, and environmental impact.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                <FlaskConical className="w-3.5 h-3.5" /> Local database
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full">
                <ExternalLink className="w-3.5 h-3.5" /> PubChem 250k+ compounds
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-shrink-0 w-full sm:w-80" ref={searchRef}>
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            {isSuggestLoading && <Loader2 className="absolute top-1/2 -translate-y-1/2 right-8 w-3.5 h-3.5 text-teal-400 animate-spin pointer-events-none" />}
            <input
              type="text"
              value={search}
              onChange={e => { suppressSuggestRef.current = false; setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={handleSearchSubmit}
              placeholder="Search 250k+ chemicals… (Enter)"
              className="w-full pl-9 pr-8 py-2 text-sm rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            {search && (
              <button onClick={clearFilters} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 hover:text-slate-600">
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
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onMouseDown={() => handleSuggestionClick(s)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{s.label}</p>
                        {s.sublabel && <p className="text-xs text-slate-400 truncate">{s.sublabel}</p>}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        s.source === "local" ? "bg-slate-100 text-slate-500" : "bg-teal-50 text-teal-700"
                      }`}>
                        {s.source === "local" ? "Local" : "PubChem"}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Groups */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 pb-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 flex-shrink-0"><Filter className="w-3 h-3" />Tox:</span>
            {["all", "safe", "moderate", "hazardous", "highly_hazardous"].map(v => (
              <FilterPill key={v} active={toxFilter === v} onClick={() => setToxFilter(v)}>
                {v === "all" ? "All" : TOXICITY_CONFIG[v]?.label}
              </FilterPill>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs text-slate-400 font-semibold flex-shrink-0">Origin:</span>
          {["all", "natural", "synthetic", "both"].map(v => (
            <FilterPill key={v} active={originFilter === v} onClick={() => setOriginFilter(v)}>
              {v === "all" ? "All" : ORIGIN_CONFIG[v]?.label}
            </FilterPill>
          ))}

          <span className="text-xs text-slate-400 font-semibold ml-2 flex-shrink-0">Eco:</span>
          {ECO_LEVELS.map(({ value, label }) => (
            <FilterPill key={value} active={ecoFilter === value} onClick={() => setEcoFilter(value)}>
              {label}
            </FilterPill>
          ))}

          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-600 font-semibold ml-1 flex items-center gap-1 flex-shrink-0">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-500">
              {isLoading ? "Loading…" : `${filtered.length} ingredient${filtered.length !== 1 ? "s" : ""} found`}
            </p>
            {isPubchemLoading && (
              <span className="inline-flex items-center gap-1.5 text-xs text-teal-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching PubChem…
              </span>
            )}
            {filteredPubchem.length > 0 && !isPubchemLoading && (
              <span className="inline-flex items-center gap-1.5 text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                <ExternalLink className="w-3 h-3" /> {filteredPubchem.length} from PubChem
              </span>
            )}
          </div>
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
        {!isLoading && search && filtered.length === 0 && !isPubchemLoading && (
          <div className="text-center py-16">
            <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No results found locally.</p>
            <p className="text-slate-400 text-sm mt-1">Press <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">Enter</kbd> to search PubChem's 250k+ compound database.</p>
          </div>
        )}
      </section>
    </div>
  );
}