import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, X, Loader2, Thermometer, Gauge, Clock, FlaskConical,
    Microscope, BookOpen, Database, ChevronLeft, TestTube, Calculator,
    FileText, Download, Atom, Radiation, FlaskRound
} from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useDebounce } from "../shared/useDebounce";
import { base44 } from "@/api/base44Client";

const formatSubscripts = (formula) => {
    if (!formula || formula === 'N/A' || formula === 'Custom') return formula;
    if (!/\d/.test(formula)) {
        return formula;
    }
    return formula.replace(/(\d+)/g, (match) =>
        String(match).split('').map(char =>
            String.fromCharCode(8320 + parseInt(char))
        ).join('')
    );
};

// Common catalysts database
const COMMON_CATALYSTS = [
    'Platinum (Pt)',
    'Palladium (Pd)',
    'Rhodium (Rh)',
    'Nickel (Ni)',
    'Iron (Fe)',
    'Copper (Cu)',
    'Zinc (Zn)',
    'Aluminum oxide (Al₂O₃)',
    'Titanium dioxide (TiO₂)',
    'Zeolite',
    'Vanadium pentoxide (V₂O₅)',
    'Manganese dioxide (MnO₂)',
    'Sulfuric acid (H₂SO₄)',
    'Hydrochloric acid (HCl)',
    'Sodium hydroxide (NaOH)',
    'Potassium hydroxide (KOH)',
    'Enzyme (specify)',
    'Raney nickel',
    'Lindlar catalyst',
    'Grubbs catalyst',
    'Wilkinson catalyst',
    'Ziegler-Natta catalyst'
];

export default function ResearchChemicalInput({
  chemicals,
  onAddChemical,
  onRemoveChemical,
  onRunSimulation,
  isLoading,
  persona,
  onBackToPersonaSelection
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [catalystSuggestions, setCatalystSuggestions] = useState([]);
  const [showCatalystSuggestions, setShowCatalystSuggestions] = useState(false);

  const [parameterSets, setParameterSets] = useState([{
    id: Date.now(),
    temperature: 298.15,
    temperatureUnit: 'kelvin',
    pressure: 101.325,
    pressureUnit: 'kPa',
    time: 60
  }]);
  const [activeParamSet, setActiveParamSet] = useState(0);

  const [experimentalConditions, setExperimentalConditions] = useState({
    stirringRate: 500,
    phValue: 7.0,
    catalystPresent: false,
    catalystType: '',
    solvent: 'water',
    atmosphereControl: 'air',
    lightExposure: 'ambient',
    vesselType: 'round_bottom_flask',
    notes: ''
  });

  const [safetyProtocols, setSafetyProtocols] = useState({
    fumeHood: true,
    ppe: ['lab_coat', 'safety_goggles', 'gloves'],
    emergencyEquipment: ['eyewash', 'safety_shower', 'fire_extinguisher'],
    wasteDisposal: '',
    supervisorApproval: false
  });

  const inputRef = useRef(null);
  const catalystInputRef = useRef(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.length > 0) {
      const fetchChemicals = async () => {
        setIsSearching(true);
        try {
          const response = await base44.functions.invoke('comprehensiveChemicalSearch', {
            query: debouncedSearchQuery,
            limit: 20,
            persona: persona
          });
          setSuggestions(response.data?.results || []);
        } catch (error) {
          console.error("Failed to fetch chemicals:", error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      };
      fetchChemicals();
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchQuery, persona]);

  const handleCatalystSearch = (query) => {
    setExperimentalConditions({
      ...experimentalConditions,
      catalystType: query
    });

    if (query.trim().length > 0) {
      const filtered = COMMON_CATALYSTS.filter(catalyst =>
        catalyst.toLowerCase().includes(query.toLowerCase())
      );
      setCatalystSuggestions(filtered);
      setShowCatalystSuggestions(true);
    } else {
      setCatalystSuggestions([]);
      setShowCatalystSuggestions(false);
    }
  };

  const handleSelectCatalyst = (catalyst) => {
    setExperimentalConditions({
      ...experimentalConditions,
      catalystType: catalyst
    });
    setShowCatalystSuggestions(false);
    setCatalystSuggestions([]);
  };

  const handleAddChemical = (chemical) => {
    onAddChemical({
      ...chemical,
      id: Date.now(),
      concentration: 0,
      concentrationUnit: 'M',
      purity: 99.9,
      supplierLot: '',
      casNumber: chemical.cas_number || ''
    });
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleUpdateChemical = (id, updates) => {
    const chemical = chemicals.find(c => c.id === id);
    if (chemical) {
      onAddChemical({ ...chemical, ...updates });
    }
  };

  const handleConcentrationChange = (id, value) => {
    const chemical = chemicals.find(c => c.id === id);
    if (chemical) {
      onAddChemical({
        ...chemical,
        concentration: value === '' ? '' : value
      });
    }
  };

  const handleConcentrationBlur = (id, value) => {
    const numValue = parseFloat(value);
    const finalValue = isNaN(numValue) || value === '' ? 0 : numValue;
    handleUpdateChemical(id, { concentration: finalValue });
  };

  const handleAddParamSet = () => {
    const newSet = {
      id: Date.now(),
      temperature: 298.15,
      temperatureUnit: 'kelvin',
      pressure: 101.325,
      pressureUnit: 'kPa',
      time: 60
    };
    setParameterSets([...parameterSets, newSet]);
    setActiveParamSet(parameterSets.length);
  };

  const handleRemoveParamSet = (index) => {
    if (parameterSets.length > 1) {
      const newSets = parameterSets.filter((_, i) => i !== index);
      setParameterSets(newSets);
      if (activeParamSet >= newSets.length) {
        setActiveParamSet(newSets.length - 1);
      }
    }
  };

  const handleParamSetChange = (index, field, value) => {
    const newSets = [...parameterSets];
    newSets[index] = { ...newSets[index], [field]: value };
    setParameterSets(newSets);
  };

  const convertTemperature = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;

    let kelvin = parseFloat(value);
    if (isNaN(kelvin)) return 0;

    if (fromUnit === 'celsius') kelvin = kelvin + 273.15;
    if (fromUnit === 'fahrenheit') kelvin = (kelvin - 32) * 5/9 + 273.15;

    if (toUnit === 'kelvin') return kelvin;
    if (toUnit === 'celsius') return kelvin - 273.15;
    if (toUnit === 'fahrenheit') return (kelvin - 273.15) * 9/5 + 32;

    return value;
  };

  const handleTemperatureUnitChange = (newUnit, index) => {
    const currentSet = parameterSets[index];
    const convertedTemp = convertTemperature(
      currentSet.temperature,
      currentSet.temperatureUnit,
      newUnit
    );
    handleParamSetChange(index, 'temperature', Math.round(convertedTemp * 100) / 100);
    handleParamSetChange(index, 'temperatureUnit', newUnit);
  };

  const handleRun = () => {
    const enhancedData = {
      parameterSets,
      experimentalConditions,
      safetyProtocols,
      persona,
      analysisLevel: 'advanced'
    };
    onRunSimulation(enhancedData);
  };

  return (
    <TooltipProvider>
      <Card className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg border-slate-200/50 shadow-lg">
        <CardHeader className="border-b border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FlaskRound className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-2xl text-slate-800 leading-tight">
                  {persona === 'researcher' ? 'Research Lab Simulator' : 'STEM Education Lab'}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  {persona === 'researcher'
                    ? 'Advanced chemical analysis with experimental control'
                    : 'Educational demonstration planner with safety protocols'}
                </CardDescription>
              </div>
            </div>
            {onBackToPersonaSelection && (
              <Button onClick={onBackToPersonaSelection} variant="outline" size="sm" className="self-start sm:self-auto flex-shrink-0">
                <ChevronLeft className="w-4 h-4 mr-1" /> Change Mode
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Chemical Selection */}
          <div className="space-y-2">
            <Label htmlFor="chemical-search" className="text-base font-semibold text-slate-700">
              Search Chemicals by IUPAC Name, CAS Number, or Common Name
            </Label>
            <div className="relative">
              <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="chemical-search"
                ref={inputRef}
                type="text"
                placeholder="e.g., 'dimethyl malonate', '108-59-8', 'benzene'"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="text-base py-3 pl-10 pr-4 bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl"
              />
            </div>

            {/* Horizontal Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && searchQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2"
                >
                  <Card className="shadow-lg overflow-hidden">
                    <CardContent className="p-2">
                      {isSearching ? (
                        <div className="p-4 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Searching comprehensive database...
                        </div>
                      ) : suggestions.length > 0 ? (
                        <div className="overflow-x-auto pb-2">
                          <div className="flex gap-3 p-3 min-w-max">
                            {suggestions.map((suggestion, index) => (
                              <button
                                key={`${suggestion.name}-${index}`}
                                onClick={() => handleAddChemical(suggestion)}
                                className="flex-shrink-0 w-64 p-3 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-200 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Atom className="w-5 h-5 text-indigo-600" />
                                  </div>
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="font-semibold text-sm text-slate-900 truncate">
                                      {suggestion.scientific_name || suggestion.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                                      <span className="font-mono">
                                        {suggestion.molecular_formula ? formatSubscripts(suggestion.molecular_formula) : 'Formula unavailable'}
                                      </span>
                                    </div>
                                    {suggestion.cas_number && (
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        CAS: {suggestion.cas_number}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-500">
                          <p>No results found for "{searchQuery}"</p>
                          <p className="text-xs mt-1">Try searching by IUPAC name, CAS number, or common name</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Chemicals - Compact Version */}
          {chemicals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-slate-700">
                  Selected Reactants ({chemicals.length})
                </Label>
              </div>

              <div className="space-y-2">
                {chemicals.map((chem) => (
                  <motion.div
                    key={chem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Atom className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">
                          {chem.scientific_name || chem.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {chem.molecular_formula ? formatSubscripts(chem.molecular_formula) : 'Formula not available'}
                        </p>
                      </div>
                      {chem.radioactive && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs px-1 py-0 flex-shrink-0">
                          <Radiation className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveChemical(chem.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 h-7 w-7"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Experimental Parameters */}
          <Tabs defaultValue="conditions" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1">
              <TabsTrigger value="conditions" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex flex-col sm:flex-row items-center gap-1">
                <FlaskConical className="w-4 h-4" />
                <span className="hidden sm:inline">Experimental</span> Conditions
              </TabsTrigger>
              <TabsTrigger value="safety" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex flex-col sm:flex-row items-center gap-1">
                <TestTube className="w-4 h-4" />
                <span className="hidden sm:inline">Safety</span> Protocols
              </TabsTrigger>
              <TabsTrigger value="documentation" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex flex-col sm:flex-row items-center gap-1">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Documentation</span> Docs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conditions" className="space-y-4 mt-4">
              {/* Parameter Sets */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700">
                    Experimental Parameter Sets
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddParamSet}
                    className="text-xs h-8 px-3"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Set
                  </Button>
                </div>

                <Tabs value={`set-${activeParamSet}`} onValueChange={(v) => setActiveParamSet(parseInt(v.split('-')[1]))}>
                  <TabsList className="flex overflow-x-auto overflow-y-hidden w-full justify-start border-b border-slate-200">
                    {parameterSets.map((set, index) => (
                      <TabsTrigger key={set.id} value={`set-${index}`} className="flex-shrink-0 px-4 py-2 text-sm">
                        Set {index + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {parameterSets.map((set, index) => (
                    <TabsContent key={set.id} value={`set-${index}`} className="space-y-4 mt-4">
                      {parameterSets.length > 1 && (
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md">
                          <h4 className="text-sm font-semibold text-slate-700">Parameters for Set {index + 1}</h4>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveParamSet(index)}
                            className="text-xs h-7 px-2"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Remove Set
                          </Button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Temperature */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-xs">
                            <Thermometer className="w-4 h-4 text-red-500" />
                            Temperature
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={set.temperature}
                              onChange={(e) => handleParamSetChange(index, 'temperature', parseFloat(e.target.value))}
                              className="flex-1 h-8 text-xs"
                            />
                            <Select
                              value={set.temperatureUnit}
                              onValueChange={(val) => handleTemperatureUnitChange(val, index)}
                            >
                              <SelectTrigger className="w-20 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kelvin">K</SelectItem>
                                <SelectItem value="celsius">°C</SelectItem>
                                <SelectItem value="fahrenheit">°F</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Pressure */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-xs">
                            <Gauge className="w-4 h-4 text-blue-500" />
                            Pressure
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.1"
                              value={set.pressure}
                              onChange={(e) => handleParamSetChange(index, 'pressure', parseFloat(e.target.value))}
                              className="flex-1 h-8 text-xs"
                            />
                            <Select
                              value={set.pressureUnit}
                              onValueChange={(val) => handleParamSetChange(index, 'pressureUnit', val)}
                            >
                              <SelectTrigger className="w-20 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kPa">kPa</SelectItem>
                                <SelectItem value="atm">atm</SelectItem>
                                <SelectItem value="bar">bar</SelectItem>
                                <SelectItem value="mmHg">mmHg</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Reaction Time */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-xs">
                            <Clock className="w-4 h-4 text-green-500" />
                            Time (min)
                          </Label>
                          <Input
                            type="number"
                            value={set.time}
                            onChange={(e) => handleParamSetChange(index, 'time', parseInt(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* Additional Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                {/* Stirring Rate */}
                <div className="space-y-2">
                  <Label className="text-xs">Stirring Rate (RPM)</Label>
                  <Input
                    type="number"
                    value={experimentalConditions.stirringRate}
                    onChange={(e) => setExperimentalConditions({
                      ...experimentalConditions,
                      stirringRate: parseInt(e.target.value)
                    })}
                    className="h-8 text-xs"
                  />
                </div>

                {/* pH Value */}
                <div className="space-y-2">
                  <Label className="text-xs">Initial pH</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={experimentalConditions.phValue}
                    onChange={(e) => setExperimentalConditions({
                      ...experimentalConditions,
                      phValue: parseFloat(e.target.value)
                    })}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Solvent */}
                <div className="space-y-2">
                  <Label className="text-xs">Solvent</Label>
                  <Select
                    value={experimentalConditions.solvent}
                    onValueChange={(val) => setExperimentalConditions({
                      ...experimentalConditions,
                      solvent: val
                    })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="ethanol">Ethanol</SelectItem>
                      <SelectItem value="methanol">Methanol</SelectItem>
                      <SelectItem value="acetone">Acetone</SelectItem>
                      <SelectItem value="dmso">DMSO</SelectItem>
                      <SelectItem value="dcm">Dichloromethane</SelectItem>
                      <SelectItem value="thf">THF</SelectItem>
                      <SelectItem value="none">None (Neat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Atmosphere */}
                <div className="space-y-2">
                  <Label className="text-xs">Atmosphere Control</Label>
                  <Select
                    value={experimentalConditions.atmosphereControl}
                    onValueChange={(val) => setExperimentalConditions({
                      ...experimentalConditions,
                      atmosphereControl: val
                    })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="air">Air (Ambient)</SelectItem>
                      <SelectItem value="nitrogen">Nitrogen</SelectItem>
                      <SelectItem value="argon">Argon</SelectItem>
                      <SelectItem value="oxygen">Oxygen</SelectItem>
                      <SelectItem value="vacuum">Vacuum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vessel Type */}
                <div className="space-y-2">
                  <Label className="text-xs">Reaction Vessel</Label>
                  <Select
                    value={experimentalConditions.vesselType}
                    onValueChange={(val) => setExperimentalConditions({
                      ...experimentalConditions,
                      vesselType: val
                    })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_bottom_flask">Round Bottom Flask</SelectItem>
                      <SelectItem value="beaker">Beaker</SelectItem>
                      <SelectItem value="test_tube">Test Tube</SelectItem>
                      <SelectItem value="erlenmeyer">Erlenmeyer Flask</SelectItem>
                      <SelectItem value="pressure_reactor">Pressure Reactor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Light Exposure */}
                <div className="space-y-2">
                  <Label className="text-xs">Light Exposure</Label>
                  <Select
                    value={experimentalConditions.lightExposure}
                    onValueChange={(val) => setExperimentalConditions({
                      ...experimentalConditions,
                      lightExposure: val
                    })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ambient">Ambient</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="uv">UV Light</SelectItem>
                      <SelectItem value="visible">Visible Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Catalyst Section with Suggestions */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={experimentalConditions.catalystPresent}
                    onCheckedChange={(checked) => setExperimentalConditions({
                      ...experimentalConditions,
                      catalystPresent: checked
                    })}
                  />
                  <Label className="text-xs">Catalyst Present</Label>
                </div>
                {experimentalConditions.catalystPresent && (
                  <div className="relative">
                    <Input
                      ref={catalystInputRef}
                      placeholder="Search or type catalyst name (e.g., Platinum, Palladium)..."
                      value={experimentalConditions.catalystType}
                      onChange={(e) => handleCatalystSearch(e.target.value)}
                      onFocus={() => {
                        if (experimentalConditions.catalystType.trim() || COMMON_CATALYSTS.length > 0) {
                          handleCatalystSearch(experimentalConditions.catalystType);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowCatalystSuggestions(false), 200);
                      }}
                      className="h-8 text-xs"
                    />

                    {/* Catalyst Suggestions Dropdown */}
                    <AnimatePresence>
                      {showCatalystSuggestions && catalystSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                        >
                          {catalystSuggestions.map((catalyst, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectCatalyst(catalyst)}
                              className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors border-b border-slate-100 last:border-none text-xs"
                            >
                              {catalyst}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-xs">Experimental Notes</Label>
                <Textarea
                  placeholder="Add any special observations, precautions, or experimental notes..."
                  value={experimentalConditions.notes}
                  onChange={(e) => setExperimentalConditions({
                    ...experimentalConditions,
                    notes: e.target.value
                  })}
                  rows={3}
                  className="text-xs"
                />
              </div>
            </TabsContent>

            <TabsContent value="safety" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={safetyProtocols.fumeHood}
                    onCheckedChange={(checked) => setSafetyProtocols({
                      ...safetyProtocols,
                      fumeHood: checked
                    })}
                  />
                  <Label>Fume Hood Required</Label>
                </div>

                <div className="space-y-2">
                  <Label>Personal Protective Equipment (PPE)</Label>
                  <div className="space-y-2">
                    {['lab_coat', 'safety_goggles', 'gloves', 'face_shield', 'respirator'].map(item => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          checked={safetyProtocols.ppe.includes(item)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSafetyProtocols({
                                ...safetyProtocols,
                                ppe: [...safetyProtocols.ppe, item]
                              });
                            } else {
                              setSafetyProtocols({
                                ...safetyProtocols,
                                ppe: safetyProtocols.ppe.filter(p => p !== item)
                              });
                            }
                          }}
                        />
                        <Label className="capitalize">{item.replace(/_/g, ' ')}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Waste Disposal Protocol</Label>
                  <Textarea
                    placeholder="Describe waste disposal procedures..."
                    value={safetyProtocols.wasteDisposal}
                    onChange={(e) => setSafetyProtocols({
                      ...safetyProtocols,
                      wasteDisposal: e.target.value
                    })}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={safetyProtocols.supervisorApproval}
                    onCheckedChange={(checked) => setSafetyProtocols({
                      ...safetyProtocols,
                      supervisorApproval: checked
                    })}
                  />
                  <Label>Supervisor Approval Obtained</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documentation" className="space-y-4 mt-4">
              <Card className="bg-slate-50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-slate-900">Experimental Documentation</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      {persona === 'researcher'
                        ? 'This simulation will generate a comprehensive lab report including reaction mechanisms, kinetics data, yield calculations across parameter sets, and safety considerations suitable for publication or lab notebook documentation.'
                        : 'This simulation will generate educational materials including simplified mechanisms, safety protocols, experimental procedures, and demonstration guidelines suitable for classroom use.'}
                    </p>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                      <p className="font-semibold text-slate-800">Report will include:</p>
                      <ul className="list-disc list-inside text-slate-600 space-y-1">
                        <li>Complete experimental conditions for {parameterSets.length} parameter set(s)</li>
                        <li>Reaction mechanism and kinetics analysis</li>
                        <li>3D surface plot of yield vs temperature/pressure</li>
                        <li>Safety assessment and hazard analysis</li>
                        <li>Optimization recommendations</li>
                        <li>References to peer-reviewed sources</li>
                      </ul>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Badge variant="outline" className="bg-white text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        Lab Report
                      </Badge>
                      <Badge variant="outline" className="bg-white text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        Data Export
                      </Badge>
                      <Badge variant="outline" className="bg-white text-xs">
                        <Calculator className="w-3 h-3 mr-1" />
                        Calculations
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Run Simulation Button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={handleRun}
              disabled={chemicals.length < 2 || isLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Running Advanced Analysis...
                </>
              ) : (
                <>
                  <Microscope className="w-5 h-5 mr-2" />
                  Run Research-Grade Simulation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}