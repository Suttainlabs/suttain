import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search, Filter, Plus, Loader2, Sparkles, ExternalLink, 
  Droplets, ShieldCheck, Leaf, FlaskConical, Package, 
  ChevronRight, X, Link2, Building2
} from "lucide-react";
import { useDebounce } from "../shared/useDebounce";

// Property tags for search
const PROPERTY_TAGS = [
  { value: 'moisturizing', label: 'Moisturizing', icon: Droplets, color: 'bg-blue-100 text-blue-700' },
  { value: 'antioxidant', label: 'Antioxidant', icon: ShieldCheck, color: 'bg-purple-100 text-purple-700' },
  { value: 'soothing', label: 'Soothing', icon: Leaf, color: 'bg-green-100 text-green-700' },
  { value: 'cleansing', label: 'Cleansing', icon: FlaskConical, color: 'bg-cyan-100 text-cyan-700' },
  { value: 'emulsifying', label: 'Emulsifying', icon: Droplets, color: 'bg-amber-100 text-amber-700' },
  { value: 'preservative', label: 'Preservative', icon: ShieldCheck, color: 'bg-rose-100 text-rose-700' },
  { value: 'thickening', label: 'Thickening', icon: Package, color: 'bg-indigo-100 text-indigo-700' },
  { value: 'fragrance', label: 'Fragrance', icon: Leaf, color: 'bg-pink-100 text-pink-700' },
  { value: 'exfoliating', label: 'Exfoliating', icon: Sparkles, color: 'bg-orange-100 text-orange-700' },
  { value: 'anti_aging', label: 'Anti-Aging', icon: Sparkles, color: 'bg-violet-100 text-violet-700' },
];

// Category options
const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'preservative', label: 'Preservative' },
  { value: 'surfactant', label: 'Surfactant' },
  { value: 'emulsifier', label: 'Emulsifier' },
  { value: 'fragrance', label: 'Fragrance' },
  { value: 'colorant', label: 'Colorant' },
  { value: 'thickener', label: 'Thickener' },
  { value: 'moisturizer', label: 'Moisturizer' },
  { value: 'antioxidant', label: 'Antioxidant' },
];

// Common supplier info (this would ideally come from a database or API)
const SUPPLIER_INFO = {
  'Glycerin': [
    { name: 'Making Cosmetics', url: 'https://www.makingcosmetics.com', region: 'US' },
    { name: 'Lotioncrafter', url: 'https://www.lotioncrafter.com', region: 'US' },
  ],
  'Sodium Hydroxide': [
    { name: 'Bramble Berry', url: 'https://www.brambleberry.com', region: 'US' },
    { name: 'Essential Depot', url: 'https://www.essentialdepot.com', region: 'US' },
  ],
  'Citric Acid': [
    { name: 'Bulk Apothecary', url: 'https://www.bulkapothecary.com', region: 'US' },
    { name: 'Making Cosmetics', url: 'https://www.makingcosmetics.com', region: 'US' },
  ],
  'default': [
    { name: 'Making Cosmetics', url: 'https://www.makingcosmetics.com', region: 'US' },
    { name: 'Lotioncrafter', url: 'https://www.lotioncrafter.com', region: 'US' },
    { name: 'Formulator Sample Shop', url: 'https://www.formulatorsampleshop.com', region: 'US' },
  ]
};

export default function IngredientBrowser({ 
  onSelectIngredient, 
  productType,
  currentIngredients = [],
  isOpen,
  onClose 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  
  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  // Selected ingredient for detail view
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Search ingredients
  useEffect(() => {
    if (debouncedSearch || selectedProperties.length > 0 || selectedCategory !== 'all') {
      searchIngredients();
    } else {
      setResults([]);
    }
  }, [debouncedSearch, selectedProperties, selectedCategory]);

  const searchIngredients = async () => {
    setIsLoading(true);
    try {
      const { data } = await base44.functions.invoke('enhancedIngredientSearch', {
        query: searchTerm,
        properties: selectedProperties,
        category: selectedCategory,
        productType,
        excludeIngredients: currentIngredients.map(i => i.chemical_name?.toLowerCase())
      });
      
      if (data?.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error("Search failed:", error);
      // Fallback to basic search
      try {
        const { data } = await base44.functions.invoke('comprehensiveChemicalSearch', {
          query: searchTerm || selectedProperties[0] || '',
          category: selectedCategory,
          productType
        });
        if (data?.results) {
          const filtered = data.results.filter(r => 
            !currentIngredients.some(i => i.chemical_name?.toLowerCase() === r.name?.toLowerCase())
          );
          setResults(filtered);
        }
      } catch (fallbackError) {
        console.error("Fallback search also failed:", fallbackError);
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get AI suggestions for complementary ingredients
  const getAISuggestions = async () => {
    if (currentIngredients.length === 0) return;
    
    setIsLoadingAI(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Given these ingredients in a ${productType?.replace(/_/g, ' ') || 'cosmetic'} formula: ${currentIngredients.map(i => i.chemical_name).join(', ')}

Suggest 5 complementary ingredients that would work well with this formula. For each suggestion, provide:
1. The ingredient name (INCI name)
2. Why it complements the existing ingredients
3. Typical usage percentage
4. Primary benefit/function

Focus on ingredients that enhance efficacy, improve stability, or add beneficial properties without conflicting with existing ingredients.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" },
                  percentage: { type: "string" },
                  function: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      if (response?.suggestions) {
        setAiSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error("AI suggestions failed:", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Load AI suggestions when switching to that tab
  useEffect(() => {
    if (activeTab === 'ai' && aiSuggestions.length === 0 && currentIngredients.length > 0) {
      getAISuggestions();
    }
  }, [activeTab]);

  const toggleProperty = (property) => {
    setSelectedProperties(prev => 
      prev.includes(property) 
        ? prev.filter(p => p !== property)
        : [...prev, property]
    );
  };

  const getSuppliers = (ingredientName) => {
    return SUPPLIER_INFO[ingredientName] || SUPPLIER_INFO['default'];
  };

  const handleAddIngredient = (ingredient) => {
    onSelectIngredient({
      chemical_name: ingredient.name,
      purpose: ingredient.function_description || ingredient.function || "General purpose",
      percentage: parseFloat(ingredient.percentage?.replace('%', '').split('-')[0]) || 5,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-teal-600" />
            Ingredient Browser
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="text-sm">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="properties" className="text-sm">
              <Filter className="w-4 h-4 mr-2" />
              By Property
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Suggestions
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, CAS number, or function..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((ingredient, idx) => (
                    <IngredientCard
                      key={ingredient.name + idx}
                      ingredient={ingredient}
                      onAdd={() => handleAddIngredient(ingredient)}
                      onViewDetails={() => setSelectedIngredient(ingredient)}
                      suppliers={getSuppliers(ingredient.name)}
                    />
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="text-center py-12 text-slate-500">
                  No ingredients found. Try a different search term.
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  Start typing to search for ingredients
                </div>
              )}
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-3">Select properties to find matching ingredients:</p>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TAGS.map(tag => {
                  const Icon = tag.icon;
                  const isSelected = selectedProperties.includes(tag.value);
                  return (
                    <Button
                      key={tag.value}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleProperty(tag.value)}
                      className={isSelected ? "bg-teal-600 hover:bg-teal-700" : ""}
                    >
                      <Icon className="w-3 h-3 mr-1.5" />
                      {tag.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {selectedProperties.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-500">Filtering by:</span>
                {selectedProperties.map(prop => (
                  <Badge key={prop} variant="secondary" className="gap-1">
                    {PROPERTY_TAGS.find(t => t.value === prop)?.label}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => toggleProperty(prop)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((ingredient, idx) => (
                    <IngredientCard
                      key={ingredient.name + idx}
                      ingredient={ingredient}
                      onAdd={() => handleAddIngredient(ingredient)}
                      onViewDetails={() => setSelectedIngredient(ingredient)}
                      suppliers={getSuppliers(ingredient.name)}
                    />
                  ))}
                </div>
              ) : selectedProperties.length > 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No ingredients found with selected properties.
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  Select properties above to find ingredients
                </div>
              )}
            </div>
          </TabsContent>

          {/* AI Suggestions Tab */}
          <TabsContent value="ai" className="flex-1 overflow-hidden flex flex-col mt-4">
            {currentIngredients.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Add some ingredients to your formula first to get AI suggestions.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600">
                    AI-suggested ingredients that complement your formula:
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getAISuggestions}
                    disabled={isLoadingAI}
                  >
                    {isLoadingAI ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Refresh Suggestions
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {isLoadingAI ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                      <span className="ml-2 text-slate-600">Analyzing your formula...</span>
                    </div>
                  ) : aiSuggestions.length > 0 ? (
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion, idx) => (
                        <Card key={idx} className="border border-purple-100 bg-gradient-to-r from-purple-50/50 to-white">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-slate-900">{suggestion.name}</h4>
                                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                                    {suggestion.function}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{suggestion.reason}</p>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Droplets className="w-3 h-3" />
                                    Typical: {suggestion.percentage}
                                  </span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAddIngredient({
                                  name: suggestion.name,
                                  function_description: suggestion.function,
                                  percentage: suggestion.percentage
                                })}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      Click "Refresh Suggestions" to get AI recommendations.
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Ingredient Detail Modal */}
        <AnimatePresence>
          {selectedIngredient && (
            <IngredientDetailModal
              ingredient={selectedIngredient}
              suppliers={getSuppliers(selectedIngredient.name)}
              onClose={() => setSelectedIngredient(null)}
              onAdd={() => {
                handleAddIngredient(selectedIngredient);
                setSelectedIngredient(null);
              }}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Ingredient Card Component
function IngredientCard({ ingredient, onAdd, onViewDetails, suppliers }) {
  return (
    <Card className="hover:shadow-md transition-all border-slate-200">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-slate-900">{ingredient.name}</span>
              {ingredient.category && (
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {ingredient.category.replace(/_/g, ' ')}
                </Badge>
              )}
              {ingredient.safety_level && (
                <Badge className={`text-[10px] ${
                  ingredient.safety_level === 'safe' ? 'bg-green-100 text-green-700' :
                  ingredient.safety_level === 'moderate' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {ingredient.safety_level === 'safe' ? '✓ Safe' : 
                   ingredient.safety_level === 'moderate' ? '⚠ Moderate' : 
                   ingredient.safety_level}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-600 line-clamp-2 mb-2">
              {ingredient.function_description || 'General purpose ingredient'}
            </p>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              {ingredient.typical_percentage_range && (
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  {ingredient.typical_percentage_range}
                </span>
              )}
              {suppliers.length > 0 && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {suppliers.length} suppliers
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button size="sm" onClick={onAdd} className="bg-teal-600 hover:bg-teal-700 h-8">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={onViewDetails} className="h-8 text-xs">
              Details
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Ingredient Detail Modal
function IngredientDetailModal({ ingredient, suppliers, onClose, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{ingredient.name}</h2>
              {ingredient.scientific_name && ingredient.scientific_name !== ingredient.name && (
                <p className="text-sm text-slate-500">{ingredient.scientific_name}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Properties */}
            <div className="flex flex-wrap gap-2">
              {ingredient.category && (
                <Badge className="bg-teal-100 text-teal-700 capitalize">
                  {ingredient.category.replace(/_/g, ' ')}
                </Badge>
              )}
              {ingredient.safety_level && (
                <Badge className={
                  ingredient.safety_level === 'safe' ? 'bg-green-100 text-green-700' :
                  ingredient.safety_level === 'moderate' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }>
                  Safety: {ingredient.safety_level}
                </Badge>
              )}
              {ingredient.chemical_type && (
                <Badge variant="outline" className="capitalize">
                  {ingredient.chemical_type}
                </Badge>
              )}
            </div>

            {/* Description */}
            {ingredient.function_description && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Function</h4>
                <p className="text-sm text-slate-600">{ingredient.function_description}</p>
              </div>
            )}

            {/* Technical Info */}
            <div className="grid grid-cols-2 gap-4">
              {ingredient.cas_number && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">CAS Number</h4>
                  <p className="text-sm text-slate-700">{ingredient.cas_number}</p>
                </div>
              )}
              {ingredient.molecular_formula && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Formula</h4>
                  <p className="text-sm text-slate-700">{ingredient.molecular_formula}</p>
                </div>
              )}
              {ingredient.typical_percentage_range && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Typical Usage</h4>
                  <p className="text-sm text-slate-700">{ingredient.typical_percentage_range}</p>
                </div>
              )}
              {ingredient.molecular_weight && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Mol. Weight</h4>
                  <p className="text-sm text-slate-700">{ingredient.molecular_weight} g/mol</p>
                </div>
              )}
            </div>

            {/* Suppliers Section */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Where to Buy
              </h4>
              <div className="space-y-2">
                {suppliers.map((supplier, idx) => (
                  <a
                    key={idx}
                    href={supplier.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Package className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{supplier.name}</p>
                        <p className="text-xs text-slate-500">{supplier.region}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2 italic">
                * Supplier links are for reference. Always verify product specifications.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={onAdd} className="flex-1 bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Add to Formula
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}