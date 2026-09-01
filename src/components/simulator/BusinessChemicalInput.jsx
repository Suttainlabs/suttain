import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ChevronLeft, TestTube, Calculator,
    TrendingUp, Package, Shield, Atom, Search, Droplets, Info, HelpCircle, Target, Beaker
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDebounce } from "../shared/useDebounce";
import { base44 } from "@/api/base44Client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const formatSubscripts = (formula) => {
    if (!formula || formula === 'N/A' || formula === 'Custom') return formula;
    if (!/\d/.test(formula)) return formula;
    return formula.replace(/(\d+)/g, (match) =>
        String(match).split('').map(char =>
            String.fromCharCode(8320 + parseInt(char))
        ).join('')
    );
};

export default function BusinessChemicalInput({
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

  // Business-specific parameters
  const [businessParams, setBusinessParams] = useState({
    batchSize: 1000,
    batchUnit: 'grams',
    targetMarket: 'US',
    productCategory: 'skincare',
    costPerUnit: 0,
    regulatoryCompliance: true,
    // Experimental parameters
    temperature: 25,
    pH: 5.5,
    shelfLife: 24
  });

  const inputRef = useRef(null);
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

  const handleAddChemical = (chemical) => {
    onAddChemical({
      ...chemical,
      id: Date.now(),
      concentration: 0,
      concentrationUnit: '%',
      costPerKg: 0
    });
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemoveChemical = (id) => {
    onRemoveChemical(id);
  };

  const updateChemical = (id, field, value) => {
    const updated = chemicals.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    );
    // Update parent
    chemicals.forEach(c => {
      if (c.id === id) {
        onAddChemical({ ...c, [field]: value });
      }
    });
  };

  const calculateTotalCost = () => {
    const batchSizeKg = businessParams.batchUnit === 'kg' ? businessParams.batchSize : businessParams.batchSize / 1000;
    return chemicals.reduce((total, chem) => {
      const chemAmount = (chem.concentration / 100) * batchSizeKg;
      return total + (chemAmount * (chem.costPerKg || 0));
    }, 0).toFixed(2);
  };

  const calculatePerUnitCost = () => {
    const perBatchCost = parseFloat(calculateTotalCost());
    const unitsPerBatch = businessParams.batchUnit === 'kg' ? businessParams.batchSize * 10 : businessParams.batchSize / 100;
    return (perBatchCost / unitsPerBatch).toFixed(3);
  };

  const handleRunSimulation = () => {
    onRunSimulation({ businessParams });
  };

  return (
    <TooltipProvider>
      <Card className="max-w-7xl mx-auto bg-white shadow-2xl border-0 overflow-hidden">
        {/* Professional Business Header with Brand Colors */}
        <div className="bg-gradient-to-r from-[#02988C] via-[#09D2FF] to-[#9531F5] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center shadow-lg">
                <Droplets className="w-6 h-6 text-[#02988C]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-md">Business Formulation Simulator</h2>
                <p className="text-sm text-white/90 mt-1 drop-shadow">
                  Professional chemical analysis with cost and compliance insights
                </p>
              </div>
            </div>
            {onBackToPersonaSelection && (
              <Button
                onClick={onBackToPersonaSelection}
                variant="outline"
                className="bg-white text-[#02988C] border-white hover:bg-white/90 font-semibold"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Experimental Parameters */}
          <Accordion type="single" collapsible className="border-2 border-indigo-200 rounded-xl overflow-hidden">
            <AccordionItem value="params" className="border-0">
              <AccordionTrigger className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 hover:no-underline">
                <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                  <Beaker className="w-5 h-5 text-indigo-600" />
                  <span>Experimental Parameters (Optional)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 flex items-center gap-1">
                      Temperature (°C)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Processing/storage temperature affects stability and shelf life</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      value={businessParams.temperature}
                      onChange={(e) => setBusinessParams({...businessParams, temperature: Number(e.target.value)})}
                      placeholder="e.g., 25"
                      className="h-8 text-xs"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 flex items-center gap-1">
                      pH Level
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Target pH for formula stability and skin compatibility</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      value={businessParams.pH}
                      onChange={(e) => setBusinessParams({...businessParams, pH: Number(e.target.value)})}
                      placeholder="e.g., 5.5"
                      step="0.1"
                      min="0"
                      max="14"
                      className="h-8 text-xs"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 flex items-center gap-1">
                      Shelf Life (months)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Target product shelf life for stability testing</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      value={businessParams.shelfLife}
                      onChange={(e) => setBusinessParams({...businessParams, shelfLife: Number(e.target.value)})}
                      placeholder="e.g., 24"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>These parameters help analyze formula stability, microbial preservation needs, and regulatory compliance requirements.</span>
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Business Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                Batch Size
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Production volume affects cost per unit, ingredient procurement, and compliance testing requirements. Larger batches typically reduce per-unit costs.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={businessParams.batchSize}
                  onChange={(e) => setBusinessParams({...businessParams, batchSize: Number(e.target.value)})}
                  className="flex-1"
                />
                <Select
                  value={businessParams.batchUnit}
                  onValueChange={(value) => setBusinessParams({...businessParams, batchUnit: value})}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grams">g</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                Target Market
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Different markets have unique regulatory requirements (FDA, EU, Health Canada). Your target market determines which ingredients are approved, restricted, or banned.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select
                value={businessParams.targetMarket}
                onValueChange={(value) => setBusinessParams({...businessParams, targetMarket: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="EU">European Union</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Product Category
              </Label>
              <Select
                value={businessParams.productCategory}
                onValueChange={(value) => setBusinessParams({...businessParams, productCategory: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skincare">Skincare</SelectItem>
                  <SelectItem value="haircare">Hair Care</SelectItem>
                  <SelectItem value="cosmetics">Cosmetics</SelectItem>
                  <SelectItem value="cleaning">Cleaning Products</SelectItem>
                  <SelectItem value="personal_care">Personal Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chemical Search */}
          <div className="space-y-2">
            <Label htmlFor="chemical-search" className="text-base font-semibold text-slate-700">
              Add Ingredients
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="chemical-search"
                ref={inputRef}
                type="text"
                placeholder="Search by INCI name, IUPAC, or CAS number..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="text-base py-3 pl-10 pr-4 bg-white border-2 border-slate-300 focus:border-amber-500 rounded-xl"
              />
            </div>

            {/* Horizontal Suggestions */}
            <AnimatePresence>
              {showSuggestions && searchQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2"
                >
                  <Card className="shadow-xl border-2 border-slate-200">
                    <CardContent className="p-3">
                      {isSearching ? (
                        <div className="p-4 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Searching database...
                        </div>
                      ) : suggestions.length > 0 ? (
                        <div className="overflow-x-auto pb-2">
                          <div className="flex gap-3 min-w-max">
                            {suggestions.map((suggestion, index) => (
                              <button
                                key={`${suggestion.name}-${index}`}
                                onClick={() => handleAddChemical(suggestion)}
                                className="flex-shrink-0 w-64 p-3 hover:bg-amber-50 rounded-lg border-2 border-slate-200 hover:border-amber-300 transition-all hover:shadow-md"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Atom className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="font-semibold text-sm text-slate-900 truncate">
                                      {suggestion.scientific_name || suggestion.name}
                                    </p>
                                    <div className="flex flex-col gap-0.5 text-xs text-slate-600 mt-1">
                                      <span className="font-mono">{formatSubscripts(suggestion.molecular_formula)}</span>
                                      {suggestion.cas_number && (
                                        <span className="text-xs text-slate-500">CAS: {suggestion.cas_number}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-600">
                          <p>No results found for "{searchQuery}"</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Chemicals */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-lg font-bold text-slate-800">Formula Composition ({chemicals.length} ingredients)</h3>
              {chemicals.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg cursor-help">
                        <Calculator className="w-4 h-4 text-blue-600" />
                        <div className="text-left">
                          <p className="text-xs text-blue-600 font-medium">Per Batch</p>
                          <p className="text-sm font-bold text-blue-700">${calculateTotalCost()}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs font-semibold mb-1">Batch Cost Breakdown:</p>
                      <p className="text-xs">Total raw material cost for {businessParams.batchSize}{businessParams.batchUnit === 'kg' ? 'kg' : 'g'} batch. This excludes labor, packaging, overhead, and compliance testing.</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg cursor-help">
                        <Package className="w-4 h-4 text-green-600" />
                        <div className="text-left">
                          <p className="text-xs text-green-600 font-medium">Per Unit</p>
                          <p className="text-sm font-bold text-green-700">${calculatePerUnitCost()}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs font-semibold mb-1">Cost Per 100g Unit:</p>
                      <p className="text-xs">Material cost for a standard 100g product unit. Add 2-3x markup for retail pricing to cover all business expenses and profit.</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {calculateTotalCost() > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg cursor-help">
                          <Target className="w-4 h-4 text-purple-600" />
                          <div className="text-left">
                            <p className="text-xs text-purple-600 font-medium">Suggested Retail</p>
                            <p className="text-sm font-bold text-purple-700">${(parseFloat(calculatePerUnitCost()) * 2.5).toFixed(2)}</p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs font-semibold mb-1">Retail Price Target:</p>
                        <p className="text-xs">Recommended retail price per 100g unit (2.5x material cost) to cover manufacturing, packaging, marketing, compliance, and maintain healthy profit margins.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>

            {chemicals.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {chemicals.map((chemical) => (
                  <Card key={chemical.id} className="border-2 border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {/* Icon and Delete Button */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Atom className="w-5 h-5 text-white" />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveChemical(chemical.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        {/* Chemical Name */}
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 truncate" title={chemical.scientific_name || chemical.name}>
                            {chemical.scientific_name || chemical.name}
                          </h4>
                          <p className="text-xs text-slate-600 font-mono truncate">
                            {formatSubscripts(chemical.molecular_formula)}
                          </p>
                        </div>

                        {/* Concentration with Spinner */}
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-600">Concentration (%)</Label>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={chemical.concentration}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || val === '.' || /^\d*\.?\d*$/.test(val)) {
                                  updateChemical(chemical.id, 'concentration', val);
                                }
                              }}
                              onBlur={(e) => {
                                const num = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                updateChemical(chemical.id, 'concentration', num);
                              }}
                              className="h-8 text-xs pr-8"
                            />
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                              <button
                                type="button"
                                onClick={() => updateChemical(chemical.id, 'concentration', parseFloat(Math.min(100, (parseFloat(chemical.concentration) || 0) + 0.1).toFixed(2)))}
                                className="h-3 px-1 text-slate-600 hover:bg-slate-100 rounded-t flex items-center justify-center"
                              >
                                <span className="text-[10px]">▲</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateChemical(chemical.id, 'concentration', parseFloat(Math.max(0, (parseFloat(chemical.concentration) || 0) - 0.1).toFixed(2)))}
                                className="h-3 px-1 text-slate-600 hover:bg-slate-100 rounded-b flex items-center justify-center"
                              >
                                <span className="text-[10px]">▼</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Cost per kg with Spinner */}
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-600">Cost per kg ($)</Label>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={chemical.costPerKg}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || val === '.' || /^\d*\.?\d*$/.test(val)) {
                                  updateChemical(chemical.id, 'costPerKg', val);
                                }
                              }}
                              onBlur={(e) => {
                                const num = Math.max(0, parseFloat(e.target.value) || 0);
                                updateChemical(chemical.id, 'costPerKg', parseFloat(num.toFixed(2)));
                              }}
                              className="h-8 text-xs pr-8"
                            />
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                              <button
                                type="button"
                                onClick={() => updateChemical(chemical.id, 'costPerKg', parseFloat(((parseFloat(chemical.costPerKg) || 0) + 0.1).toFixed(2)))}
                                className="h-3 px-1 text-slate-600 hover:bg-slate-100 rounded-t flex items-center justify-center"
                              >
                                <span className="text-[10px]">▲</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateChemical(chemical.id, 'costPerKg', Math.max(0, parseFloat(((parseFloat(chemical.costPerKg) || 0) - 0.1).toFixed(2))))}
                                className="h-3 px-1 text-slate-600 hover:bg-slate-100 rounded-b flex items-center justify-center"
                              >
                                <span className="text-[10px]">▼</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TestTube className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No ingredients added yet</p>
                <p className="text-sm text-slate-400 mt-1">Search and add ingredients to build your formula</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={handleRunSimulation}
              disabled={chemicals.length < 2 || isLoading}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-xl px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5 mr-2" />
                  Run Professional Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}