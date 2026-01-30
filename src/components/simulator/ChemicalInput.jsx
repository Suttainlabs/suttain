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
import { TestTube, Plus, Trash2, AlertTriangle, ChevronLeft, Home, Hammer, GraduationCap, Atom, Play, Thermometer, Droplets, Settings2, ChevronDown, ChevronUp, Scale, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { base44 } from "@/api/base44Client";
import { useDebounce } from "@/components/shared/useDebounce";

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

  const handleSelectChemical = (chemical) => {
    const scientificName = (chemical.scientific_name || chemical.name).toLowerCase();
    
    // For household/DIY users, use common name if available
    const shouldUseCommonName = ['household', 'diy', 'student'].includes(persona);
    const displayName = shouldUseCommonName && COMMON_NAME_MAP[scientificName] 
      ? COMMON_NAME_MAP[scientificName]
      : chemical.name;

    onAddChemical({
      ...chemical,
      id: Date.now(),
      name: displayName, // Display name (common name for household/DIY)
      scientific_name: chemical.scientific_name || chemical.name, // Keep scientific name for processing
      display_name: displayName, // Explicitly store display name
      concentration: 0,
      concentrationUnit: 'M',
      purity: 99.9
    });

    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleManualAdd = () => {
    if (!searchTerm.trim()) return;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const shouldUseCommonName = ['household', 'diy', 'student'].includes(persona);
    
    // Check if it's a common name that maps to a scientific name
    const scientificName = SCIENTIFIC_NAME_MAP[searchLower] || searchLower;
    const displayName = shouldUseCommonName && COMMON_NAME_MAP[scientificName]
      ? COMMON_NAME_MAP[scientificName]
      : searchTerm.trim();

    onAddChemical({
      id: Date.now(),
      name: displayName,
      scientific_name: scientificName,
      display_name: displayName,
      concentration: 0,
      concentrationUnit: 'M',
      purity: 99.9
    });

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
                placeholder="e.g., bleach, baking soda, vinegar..."
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
                              {chemical.safety_level && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs flex-shrink-0 ${
                                    chemical.safety_level === 'safe' ? 'bg-green-50 text-green-700 border-green-200' :
                                    chemical.safety_level === 'moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                  }`}
                                >
                                  {chemical.safety_level}
                                </Badge>
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