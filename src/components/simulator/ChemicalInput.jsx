import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TestTube, Plus, Trash2, AlertTriangle, ChevronLeft, Home, Hammer, GraduationCap, Atom, Play, Thermometer, Droplets, Settings2, ChevronDown, ChevronUp, Scale, Info, ShieldAlert, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { base44 } from "@/api/base44Client";
import { useDebounce } from "@/components/shared/useDebounce";

// ── Curated quick-pick chemicals per persona ──────────────────────────────────
const PERSONA_QUICK_CHEMICALS = {
  // Education
  student:      ["Vinegar (Acetic Acid)", "Baking Soda", "Hydrogen Peroxide", "Bleach", "Salt (NaCl)", "Lemon Juice"],
  teacher:      ["Hydrochloric Acid (HCl)", "Sodium Hydroxide", "Copper Sulfate", "Potassium Permanganate", "Ethanol", "Magnesium Ribbon"],
  professor:    ["Benzene", "Toluene", "Diethyl Ether", "Acetonitrile", "Chloroform", "Dimethyl Sulfoxide (DMSO)"],
  researcher:   ["Sodium Borohydride", "Lithium Aluminum Hydride", "Palladium on Carbon", "Triethylamine", "Trifluoroacetic Acid", "Grignard Reagent"],
  // Industry
  manufacturer: ["Sulfuric Acid", "Nitric Acid", "Caustic Soda", "Chlorine Gas", "Ammonia", "Phosphoric Acid"],
  engineer:     ["Ethylene Oxide", "Propylene Oxide", "Methanol", "Acetone", "Dichloromethane", "Hydrogen Fluoride"],
  petroleum:    ["Crude Oil", "Gasoline", "Benzene", "Toluene", "Xylene", "Hydrogen Sulfide"],
  textile:      ["Formaldehyde", "Reactive Dye", "Sodium Carbonate", "Hydrogen Peroxide", "Acetic Acid", "Sodium Silicate"],
  automotive:   ["Engine Oil", "Coolant (Ethylene Glycol)", "Brake Fluid", "Battery Acid (H₂SO₄)", "Transmission Fluid", "Antifreeze"],
  logistics:    ["Hazmat Class 3 Flammable", "Corrosive Liquid", "Compressed Gas (O₂)", "Oxidizer (KNO₃)", "Toxic Substance", "Radioactive Material"],
  mining:       ["Ammonium Nitrate", "Cyanide Solution", "Sulfuric Acid", "Mercury", "Sodium Cyanide", "Lime (CaO)"],
  // Health
  pharma:       ["Aspirin (ASA)", "Paracetamol", "Ethanol USP", "Propylene Glycol", "Sodium Chloride IV", "Calcium Carbonate"],
  doctor:       ["Lidocaine", "Epinephrine", "Metformin", "Warfarin", "Digoxin", "Potassium Chloride IV"],
  nutrition:    ["Vitamin C (Ascorbic Acid)", "Iron Sulfate", "Calcium Carbonate", "Citric Acid", "Sodium Benzoate", "Tartrazine (E102)"],
  fitness:      ["Creatine", "Caffeine", "Whey Protein", "Beta-Alanine", "Magnesium Citrate", "Nitric Oxide Precursor"],
  nurse:        ["Isopropyl Alcohol 70%", "Povidone-Iodine", "Chlorhexidine", "Sodium Hypochlorite 0.5%", "Hydrogen Peroxide 3%", "Saline"],
  vet:          ["Ivermectin", "Amoxicillin", "Xylazine", "Ketamine", "Fipronil", "Enrofloxacin"],
  // Environment
  eco:          ["CO₂ (Carbon Dioxide)", "Methane", "Nitrous Oxide", "Ozone", "PM2.5 Particulates", "Perfluorocarbon"],
  water:        ["Chlorine", "Fluoride", "Alum (KAl(SO₄)₂)", "Sodium Hypochlorite", "Ozone (O₃)", "Activated Carbon"],
  forestry:     ["Glyphosate", "Atrazine", "2,4-D Herbicide", "Malathion", "Copper Sulfate", "Urea Fertilizer"],
  marine:       ["Mercury (Hg)", "PCB (Polychlorinated Biphenyl)", "Crude Oil", "Microplastics", "Tributyltin (TBT)", "Cadmium"],
  air:          ["Nitrogen Dioxide (NO₂)", "Sulfur Dioxide (SO₂)", "Carbon Monoxide", "Ozone", "VOC (Benzene)", "Particulate Matter"],
  recycling:    ["Sulfuric Acid (battery)", "Lithium", "Lead", "Polyvinyl Chloride (PVC)", "Mercury (lamp)", "Cadmium (NiCd)"],
  // Consumer
  household:    ["Bleach", "Ammonia Cleaner", "Vinegar", "Rubbing Alcohol", "Drain Cleaner (NaOH)", "Baking Soda"],
  parent:       ["Baby Wipes Ingredients", "Talcum Powder", "Diaper Cream (Zinc Oxide)", "Baby Shampoo Surfactant", "Sunscreen (Oxybenzone)", "Fluoride Toothpaste"],
  diy:          ["Epoxy Resin", "Acetone", "Paint Thinner", "Wood Stain (Linseed Oil)", "Polyurethane Varnish", "Spray Paint (Isocyanate)"],
  chef:         ["Sodium Nitrite (Curing Salt)", "Tartaric Acid", "Sodium Alginate", "Lecithin", "Citric Acid", "Xanthan Gum"],
  traveler:     ["DEET Insect Repellent", "Sunscreen SPF50", "Hand Sanitizer (Ethanol)", "Water Purification Tablet", "Melatonin", "Antimalarial Drug"],
  // Professional
  business:     ["Retinol", "Hyaluronic Acid", "Niacinamide", "Glycolic Acid", "Salicylic Acid", "Phenoxyethanol"],
  cosmetic:     ["Titanium Dioxide", "Dimethicone", "Carbomer", "Cetyl Alcohol", "Benzyl Alcohol", "Sodium Lauryl Sulfate"],
  safety:       ["Hydrogen Cyanide", "Phosgene", "Chlorine Gas", "Hydrogen Sulfide", "Carbon Monoxide", "Ammonia"],
  regulatory:   ["Parabens (Methylparaben)", "Phthalates (DEHP)", "Bisphenol A (BPA)", "Formaldehyde-Releaser", "Lead Acetate", "Mercury Compound"],
  consultant:   ["REACH SVHC Chemicals", "GHS Category 1 Toxic", "CMR Substances", "Endocrine Disruptors", "PBT Substances", "Nano-Silver"],
  lab:          ["Ethidium Bromide", "Acrylamide", "Beta-Mercaptoethanol", "Phenol", "Bromophenol Blue", "Trypan Blue"],
};

// Default placeholder text per persona
const PERSONA_PLACEHOLDER = {
  student:      "e.g., bleach, baking soda, vinegar...",
  teacher:      "e.g., HCl, NaOH, copper sulfate...",
  professor:    "e.g., benzene, DMSO, acetonitrile...",
  researcher:   "e.g., LiAlH4, Pd/C, triethylamine...",
  manufacturer: "e.g., sulfuric acid, chlorine, ammonia...",
  engineer:     "e.g., ethylene oxide, methanol, acetone...",
  petroleum:    "e.g., benzene, toluene, H₂S...",
  textile:      "e.g., formaldehyde, reactive dye, NaOH...",
  automotive:   "e.g., coolant, brake fluid, battery acid...",
  logistics:    "e.g., flammable liquid, oxidizer, toxic...",
  mining:       "e.g., ammonium nitrate, cyanide, H₂SO₄...",
  pharma:       "e.g., aspirin, ethanol, propylene glycol...",
  doctor:       "e.g., lidocaine, epinephrine, warfarin...",
  nutrition:    "e.g., vitamin C, citric acid, iron sulfate...",
  fitness:      "e.g., creatine, caffeine, beta-alanine...",
  nurse:        "e.g., isopropyl alcohol, chlorhexidine...",
  vet:          "e.g., ivermectin, ketamine, fipronil...",
  eco:          "e.g., CO₂, methane, perfluorocarbon...",
  water:        "e.g., chlorine, alum, sodium hypochlorite...",
  forestry:     "e.g., glyphosate, atrazine, malathion...",
  marine:       "e.g., mercury, PCBs, crude oil...",
  air:          "e.g., NO₂, SO₂, benzene VOC...",
  recycling:    "e.g., sulfuric acid, lithium, lead...",
  household:    "e.g., bleach, vinegar, ammonia cleaner...",
  parent:       "e.g., zinc oxide, oxybenzone, fluoride...",
  diy:          "e.g., epoxy resin, acetone, polyurethane...",
  chef:         "e.g., sodium nitrite, citric acid, lecithin...",
  traveler:     "e.g., DEET, sunscreen, hand sanitizer...",
  business:     "e.g., retinol, hyaluronic acid, niacinamide...",
  cosmetic:     "e.g., TiO₂, dimethicone, carbomer...",
  safety:       "e.g., HCN, phosgene, chlorine gas...",
  regulatory:   "e.g., parabens, phthalates, BPA...",
  consultant:   "e.g., SVHC, CMR substance, nano-silver...",
  lab:          "e.g., ethidium bromide, acrylamide, phenol...",
};

// Chemicals known to be hazardous — warn users when added
const HAZARDOUS_CHEMICALS = new Set([
  'sodium hypochlorite', 'bleach', 'ammonia', 'hydrogen peroxide',
  'hydrochloric acid', 'muriatic acid', 'hydrogen chloride', 'sulfuric acid',
  'nitric acid', 'hydrofluoric acid', 'sodium hydroxide', 'lye', 'potassium hydroxide',
  'formaldehyde', 'acetone', 'methanol', 'methyl alcohol', 'benzene', 'toluene',
  'chlorine', 'chlorine gas', 'phosphoric acid', 'acetic acid', 'glacial acetic acid',
  'calcium hypochlorite', 'pool chlorine', 'isocyanate', 'mercury', 'lead', 'arsenic',
  'carbon tetrachloride', 'chloroform', 'ethylene oxide', 'propylene oxide'
]);

// Common name mappings for household/DIY users
const COMMON_NAME_MAP = {
  'sodium hypochlorite': 'bleach',
  'sodium hydrogen carbonate': 'baking soda',
  'ethanoic acid': 'vinegar',
  'propan-2-ol': 'rubbing alcohol',
  'ammonia': 'ammonia',
  'hydrogen peroxide': 'hydrogen peroxide',
  'hydrogen chloride': 'muriatic acid',
  'sodium hydroxide': 'lye',
  'acetic acid': 'vinegar',
  'sodium bicarbonate': 'baking soda',
  'isopropyl alcohol': 'rubbing alcohol',
  'calcium hypochlorite': 'pool chlorine',
  'sodium carbonate': 'washing soda'
};

// Reverse mapping
const SCIENTIFIC_NAME_MAP = Object.entries(COMMON_NAME_MAP).reduce((acc, [sci, common]) => {
  acc[common.toLowerCase()] = sci;
  return acc;
}, {});

const formatSubscripts = (formula) => {
  if (!formula || formula === 'N/A' || formula === 'Custom') return formula;
  if (!/\d/.test(formula)) return formula;
  return formula.replace(/(\d+)/g, (match) =>
    String(match).split('').map(char =>
      String.fromCharCode(8320 + parseInt(char))
    ).join('')
  );
};

export default function ChemicalInput({
  chemicals,
  onAddChemical,
  onRemoveChemical,
  onRunSimulation,
  isLoading,
  persona,
  onBackToPersonaSelection
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [hazardWarnings, setHazardWarnings] = useState([]); // Active warnings to show
  
  // Advanced reaction parameters
  const [reactionParams, setReactionParams] = useState({
    temperature: 25,
    pressure: 1,
    pH: 7,
    reactionTime: 60,
    timeUnit: 'min'
  });
  
  // Stoichiometry state - coefficient and limiting reactant per chemical
  const [stoichiometry, setStoichiometry] = useState({});
  
  const searchInputRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Update stoichiometry when chemicals change
  useEffect(() => {
    setStoichiometry(prev => {
      const newStoich = { ...prev };
      // Add new chemicals
      chemicals.forEach(chem => {
        if (!newStoich[chem.id]) {
          newStoich[chem.id] = { coefficient: 1, amount: 0, unit: 'mol', isLimiting: false };
        }
      });
      // Remove old chemicals
      Object.keys(newStoich).forEach(id => {
        if (!chemicals.find(c => c.id === parseInt(id))) {
          delete newStoich[id];
        }
      });
      return newStoich;
    });
  }, [chemicals]);

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length > 1) {
      fetchChemicalSuggestions(debouncedSearchTerm);
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchChemicalSuggestions = async (query) => {
    setIsSearching(true);
    try {
      const response = await base44.functions.invoke('comprehensiveChemicalSearch', {
        query,
        limit: 10,
        persona: persona || 'household'
      });
      // Response can be in response.data or response.data.results depending on SDK version
      const results = response?.data?.results || response?.results || [];
      setSuggestions(results);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const checkHazardWarning = (chemical, allChemicals) => {
    const sciName = (chemical.scientific_name || chemical.name || '').toLowerCase();
    const displayName = (chemical.display_name || chemical.name || '').toLowerCase();
    const isHazardous = HAZARDOUS_CHEMICALS.has(sciName) || HAZARDOUS_CHEMICALS.has(displayName) || chemical.safety_level === 'hazardous' || chemical.safety_level === 'dangerous';
    
    if (!isHazardous) return;

    // Count how many hazardous chemicals are already in the list
    const hazardousCount = allChemicals.filter(c => {
      const sn = (c.scientific_name || c.name || '').toLowerCase();
      const dn = (c.display_name || c.name || '').toLowerCase();
      return HAZARDOUS_CHEMICALS.has(sn) || HAZARDOUS_CHEMICALS.has(dn);
    }).length;

    const warningId = Date.now();
    let message = `⚠️ "${chemical.display_name || chemical.name}" is a hazardous chemical. Handle with care and use proper PPE.`;
    
    if (hazardousCount >= 1) {
      message = `🚨 You now have ${hazardousCount + 1} hazardous chemicals in your simulation. Certain combinations (e.g. bleach + ammonia) can produce toxic gases. Please review safety guidelines before proceeding.`;
    }

    setHazardWarnings(prev => [...prev, { id: warningId, message, level: hazardousCount >= 1 ? 'critical' : 'warning' }]);
    
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      setHazardWarnings(prev => prev.filter(w => w.id !== warningId));
    }, 8000);
  };

  const handleSelectChemical = (chemical) => {
    const scientificName = (chemical.scientific_name || chemical.name).toLowerCase();
    
    // For household/DIY users, use common name if available
    const shouldUseCommonName = ['household', 'diy', 'student'].includes(persona);
    const displayName = shouldUseCommonName && COMMON_NAME_MAP[scientificName] 
      ? COMMON_NAME_MAP[scientificName]
      : chemical.name;

    const newChemical = {
      ...chemical,
      id: Date.now(),
      name: displayName,
      scientific_name: chemical.scientific_name || chemical.name,
      display_name: displayName,
      concentration: 0,
      concentrationUnit: 'M',
      purity: 99.9
    };

    checkHazardWarning(newChemical, chemicals);
    onAddChemical(newChemical);

    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleManualAdd = () => {
    if (!searchTerm.trim()) return;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const shouldUseCommonName = ['household', 'diy', 'student'].includes(persona);
    
    const scientificName = SCIENTIFIC_NAME_MAP[searchLower] || searchLower;
    const displayName = shouldUseCommonName && COMMON_NAME_MAP[scientificName]
      ? COMMON_NAME_MAP[scientificName]
      : searchTerm.trim();

    const newChemical = {
      id: Date.now(),
      name: displayName,
      scientific_name: scientificName,
      display_name: displayName,
      concentration: 0,
      concentrationUnit: 'M',
      purity: 99.9
    };

    checkHazardWarning(newChemical, chemicals);
    onAddChemical(newChemical);

    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleConcentrationChange = (id, value) => {
    const chemicalToUpdate = chemicals.find(c => c.id === id);
    if (chemicalToUpdate) {
      onAddChemical({
        ...chemicalToUpdate,
        concentration: value === '' ? 0 : Number(value)
      });
    }
  };

  const handleConcentrationUnitChange = (id, unit) => {
    const chemicalToUpdate = chemicals.find(c => c.id === id);
    if (chemicalToUpdate) {
      onAddChemical({
        ...chemicalToUpdate,
        concentrationUnit: unit
      });
    }
  };

  const handleStoichiometryChange = (chemId, field, value) => {
    setStoichiometry(prev => {
      const newStoich = { ...prev };
      if (!newStoich[chemId]) {
        newStoich[chemId] = { coefficient: 1, amount: 0, unit: 'mol', isLimiting: false };
      }
      newStoich[chemId][field] = value;
      
      // If setting one as limiting, unset others
      if (field === 'isLimiting' && value) {
        Object.keys(newStoich).forEach(id => {
          if (id !== String(chemId)) {
            newStoich[id].isLimiting = false;
          }
        });
      }
      return newStoich;
    });
  };

  const handleRunClick = () => {
    // Pass advanced parameters to the simulation
    const enhancedData = {
      parameterSets: [{
        temperature: reactionParams.temperature,
        pressure: reactionParams.pressure,
        time: reactionParams.reactionTime
      }],
      experimentalConditions: {
        phValue: reactionParams.pH,
        reactionTime: reactionParams.reactionTime,
        timeUnit: reactionParams.timeUnit
      },
      stoichiometry
    };
    onRunSimulation(enhancedData);
  };

  // Determine icon based on persona
  const getPersonaIcon = () => {
    switch(persona) {
      case 'student': return GraduationCap;
      case 'diy': return Hammer;
      case 'household': 
      default: return Home;
    }
  };
  
  const PersonaIcon = getPersonaIcon();
  
  const getPersonaGradient = () => {
    switch(persona) {
      case 'student': return 'from-blue-500 to-cyan-500';
      case 'diy': return 'from-orange-500 to-amber-500';
      case 'household':
      default: return 'from-green-500 to-emerald-500';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className={`bg-gradient-to-r ${getPersonaGradient()} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <PersonaIcon className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Chemical Setup</CardTitle>
              <p className="text-sm text-white/90 mt-1">Add chemicals to test their interactions</p>
            </div>
          </div>
          {onBackToPersonaSelection && (
            <Button
              onClick={onBackToPersonaSelection}
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Chemical Search */}
        <div className="relative" ref={searchInputRef}>
          <Label className="block text-sm font-semibold text-slate-700 mb-2">
            Search for a Chemical
          </Label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (suggestions.length > 0) {
                      handleSelectChemical(suggestions[0]);
                    } else {
                      handleManualAdd();
                    }
                  }
                }}
                placeholder={PERSONA_PLACEHOLDER[persona] || "e.g., bleach, baking soda, vinegar..."}
                className="pr-10"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--suttain-teal)]"></div>
                </div>
              )}
            </div>
            <Button
              onClick={handleManualAdd}
              disabled={!searchTerm.trim()}
              className="bg-[var(--suttain-teal)] hover:bg-[#028a7f] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Horizontal Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && (isSearching || suggestions.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden"
              >
                {isSearching && suggestions.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--suttain-teal)] mx-auto mb-2"></div>
                    Searching chemicals...
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-3 p-3 min-w-max">
                      {suggestions.map((chemical, index) => {
                        const scientificName = (chemical.scientific_name || chemical.name).toLowerCase();
                        const shouldUseCommonName = ['household', 'diy', 'student'].includes(persona);
                        const displayName = shouldUseCommonName && COMMON_NAME_MAP[scientificName]
                          ? COMMON_NAME_MAP[scientificName]
                          : chemical.name;

                        return (
                          <button
                            key={index}
                            onClick={() => handleSelectChemical(chemical)}
                            className="flex-shrink-0 w-56 p-3 hover:bg-slate-50 rounded-lg border border-slate-200 hover:border-[var(--suttain-teal)] transition-all"
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Atom className="w-4 h-4 text-[var(--suttain-teal)]" />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="font-semibold text-xs text-slate-900 truncate capitalize">
                                  {displayName}
                                </p>
                                {shouldUseCommonName && COMMON_NAME_MAP[scientificName] && (
                                  <p className="text-xs text-slate-500 truncate mt-0.5">
                                    {chemical.scientific_name || chemical.name}
                                  </p>
                                )}
                                {chemical.molecular_formula && (
                                  <p className="text-xs text-slate-600 mt-0.5">
                                    {formatSubscripts(chemical.molecular_formula)}
                                  </p>
                                )}
                              </div>
                              {chemical.safety_level && chemical.safety_level !== 'unknown' && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs flex-shrink-0 ${
                                    chemical.safety_level === 'safe' ? 'bg-green-50 text-green-700 border-green-200' :
                                    chemical.safety_level === 'moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    chemical.safety_level === 'highly_hazardous' ? 'bg-red-100 text-red-800 border-red-300' :
                                    'bg-red-50 text-red-700 border-red-200'
                                  }`}
                                >
                                  {chemical.safety_level.replace(/_/g, ' ')}
                                </Badge>
                              )}
                              {chemical.source_db && (
                                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">{chemical.source_db}</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick-pick chips — persona-specific */}
        {PERSONA_QUICK_CHEMICALS[persona] && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Quick add for your profile</p>
            <div className="flex flex-wrap gap-2">
              {PERSONA_QUICK_CHEMICALS[persona].map(chem => {
                const alreadyAdded = chemicals.some(c =>
                  (c.display_name || c.name || '').toLowerCase() === chem.toLowerCase() ||
                  (c.name || '').toLowerCase() === chem.toLowerCase()
                );
                return (
                  <button
                    key={chem}
                    disabled={alreadyAdded}
                    onClick={() => {
                      if (alreadyAdded) return;
                      const newChem = {
                        id: Date.now(),
                        name: chem,
                        scientific_name: chem,
                        display_name: chem,
                        concentration: 0,
                        concentrationUnit: 'M',
                        purity: 99.9
                      };
                      checkHazardWarning(newChem, chemicals);
                      onAddChemical(newChem);
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      alreadyAdded
                        ? 'bg-teal-50 text-teal-700 border-teal-300 cursor-default opacity-60'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[var(--suttain-teal)] hover:text-[var(--suttain-teal)] hover:bg-teal-50 cursor-pointer'
                    }`}
                  >
                    {alreadyAdded ? '✓ ' : '+ '}{chem}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Hazard Warnings */}
        <AnimatePresence>
          {hazardWarnings.map(warning => (
            <motion.div
              key={warning.id}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 ${
                warning.level === 'critical'
                  ? 'bg-red-50 border-red-300'
                  : 'bg-amber-50 border-amber-300'
              }`}
            >
              <ShieldAlert className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                warning.level === 'critical' ? 'text-red-600' : 'text-amber-600'
              }`} />
              <p className={`text-sm flex-1 font-medium ${
                warning.level === 'critical' ? 'text-red-900' : 'text-amber-900'
              }`}>{warning.message}</p>
              <button
                onClick={() => setHazardWarnings(prev => prev.filter(w => w.id !== warning.id))}
                className={`flex-shrink-0 ${warning.level === 'critical' ? 'text-red-400 hover:text-red-600' : 'text-amber-400 hover:text-amber-600'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Added Chemicals List - Simple Square Blocks */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Selected Chemicals ({chemicals.length})
          </label>
          
          {chemicals.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <TestTube className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No chemicals added yet</p>
              <p className="text-sm text-slate-400 mt-1">Search and add at least 2 chemicals to run a simulation</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {chemicals.map((chemical) => (
                <motion.div
                  key={chemical.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border-2 border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TestTube className="w-4 h-4 text-[var(--suttain-teal)]" />
                    </div>
                    <Button
                      onClick={() => onRemoveChemical(chemical.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="font-semibold text-sm text-slate-900 truncate capitalize" title={chemical.display_name || chemical.name}>
                      {chemical.display_name || chemical.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {chemical.molecular_formula || 'Chemical compound'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Warning for insufficient chemicals */}
        {chemicals.length === 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-900 font-medium">Add one more chemical</p>
              <p className="text-xs text-amber-700 mt-1">
                You need at least 2 chemicals to run a simulation and see how they interact.
              </p>
            </div>
          </div>
        )}

        {/* Advanced Reaction Parameters - Collapsible */}
        {chemicals.length >= 2 && (
          <TooltipProvider>
            <Collapsible open={showAdvancedParams} onOpenChange={setShowAdvancedParams}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-2 border-dashed border-slate-300 hover:border-[var(--suttain-teal)] hover:bg-teal-50/50"
                >
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-700">Advanced Reaction Parameters</span>
                    <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                      Optional
                    </Badge>
                  </div>
                  {showAdvancedParams ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-4 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-xl border border-slate-200"
                >
                  {/* Environmental Conditions */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <h4 className="font-semibold text-slate-800 text-sm">Environmental Conditions</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Temperature */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-orange-500" />
                            Temperature
                          </Label>
                          <span className="text-xs font-bold text-orange-600">{reactionParams.temperature}°C</span>
                        </div>
                        <Slider
                          value={[reactionParams.temperature]}
                          onValueChange={([value]) => setReactionParams(p => ({ ...p, temperature: value }))}
                          min={-50}
                          max={200}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>-50°C</span>
                          <span className="text-green-600">Room (25°C)</span>
                          <span>200°C</span>
                        </div>
                      </div>

                      {/* pH Level */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-cyan-500" />
                            pH Level
                          </Label>
                          <span className={`text-xs font-bold ${
                            reactionParams.pH < 6 ? 'text-red-600' : 
                            reactionParams.pH > 8 ? 'text-purple-600' : 'text-green-600'
                          }`}>
                            {reactionParams.pH}
                          </span>
                        </div>
                        <Slider
                          value={[reactionParams.pH]}
                          onValueChange={([value]) => setReactionParams(p => ({ ...p, pH: value }))}
                          min={0}
                          max={14}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span className="text-red-500">Acidic</span>
                          <span className="text-green-500">Neutral (7)</span>
                          <span className="text-purple-500">Basic</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stoichiometry Section */}
                  {chemicals.length > 0 && (
                    <div className="space-y-4 mt-6 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-emerald-500" />
                          <h4 className="font-semibold text-slate-800 text-sm">Stoichiometry</h4>
                        </div>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs">Set coefficients for balanced equations and identify the limiting reactant for yield calculations.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      <div className="space-y-3">
                        {chemicals.map((chem) => {
                          const stoichData = stoichiometry[chem.id] || { coefficient: 1, amount: 0, unit: 'mol', isLimiting: false };
                          return (
                            <div 
                              key={chem.id} 
                              className={`p-3 rounded-lg border-2 transition-all ${
                                stoichData.isLimiting 
                                  ? 'border-amber-400 bg-amber-50' 
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 min-w-[120px]">
                                  <div className="w-6 h-6 bg-gradient-to-br from-teal-100 to-blue-100 rounded flex items-center justify-center">
                                    <TestTube className="w-3 h-3 text-[var(--suttain-teal)]" />
                                  </div>
                                  <span className="font-medium text-sm text-slate-800 truncate capitalize">
                                    {chem.display_name || chem.name}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs text-slate-500">Coeff:</Label>
                                  <Input
                                    type="number"
                                    value={stoichData.coefficient}
                                    onChange={(e) => handleStoichiometryChange(chem.id, 'coefficient', parseInt(e.target.value) || 1)}
                                    className="w-14 h-7 text-center text-xs"
                                    min={1}
                                    max={10}
                                  />
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs text-slate-500">Amount:</Label>
                                  <Input
                                    type="number"
                                    value={stoichData.amount}
                                    onChange={(e) => handleStoichiometryChange(chem.id, 'amount', parseFloat(e.target.value) || 0)}
                                    className="w-16 h-7 text-xs"
                                    min={0}
                                    step={0.1}
                                  />
                                  <Select
                                    value={stoichData.unit}
                                    onValueChange={(value) => handleStoichiometryChange(chem.id, 'unit', value)}
                                  >
                                    <SelectTrigger className="w-16 h-7 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="mol">mol</SelectItem>
                                      <SelectItem value="g">g</SelectItem>
                                      <SelectItem value="mL">mL</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <Button
                                  variant={stoichData.isLimiting ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleStoichiometryChange(chem.id, 'isLimiting', !stoichData.isLimiting)}
                                  className={`h-7 text-xs ${
                                    stoichData.isLimiting 
                                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                                      : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                                  }`}
                                >
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {stoichData.isLimiting ? 'Limiting' : 'Set Limiting'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          </TooltipProvider>
        )}

        {/* Run Simulation Button */}
        <Button
          onClick={handleRunClick}
          disabled={chemicals.length < 2 || isLoading}
          className="w-full bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)] hover:from-[#028a7f] hover:to-[#08b8d4] text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Analyzing Interactions...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Run Safety Analysis
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}