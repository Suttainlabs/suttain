
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ChevronRight, Plus, AlertTriangle, 
  Leaf, Beaker, Search, Filter, FileUp, Sparkles, ScanLine, Trash2,
  Info, Loader2, MoreVertical, Lightbulb
} from "lucide-react";
import UploadPantryModal from './UploadPantryModal';
import BarcodeScannerModal from '../shared/BarcodeScannerModal';
// Added DropdownMenu components for mobile actions
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "../shared/useDebounce";
import { comprehensiveChemicalSearch } from "@/functions/comprehensiveChemicalSearch";

const PRODUCT_TIPS = {
  facial_moisturizer: { text: "A great moisturizer combines humectants (e.g., Glycerin), emollients (e.g., Shea Butter), and occlusives to lock in moisture.", icon: Lightbulb, variant: "default" },
  all_purpose_cleaner: { text: "A balanced cleaner typically needs a surfactant for cleaning power, a solvent for grease, and a pH adjuster for stability.", icon: Info, variant: "default" },
  sunscreen: { text: "Formulating effective sunscreens requires specific UV filters (like Zinc Oxide) and rigorous testing. This tool is for educational purposes; consult a professional for commercial products.", icon: AlertTriangle, variant: "destructive" },
  shampoo: { text: "Key components for shampoo include primary surfactants (for cleaning), co-surfactants (for foam), conditioners, and thickeners.", icon: Lightbulb, variant: "default" },
  kitchen_degreaser: { text: "Strong degreasers often use powerful solvents and alkaline agents (high pH) to break down grease. Handle with care.", icon: Info, variant: "default" },
};

export default function EnhancedIngredientManager({ 
  ingredients, 
  onUpdateIngredients, 
  onNext, 
  onBack, 
  productType,
  businessMode,
  isLoading 
}) {
  // Ensure ingredients is always an array
  const safeIngredients = Array.isArray(ingredients) ? ingredients : [];

  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [isPantryModalOpen, setIsPantryModalOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length > 1) {
        searchChemicals(debouncedSearchTerm);
    } else {
        setSuggestions([]);
        setShowSuggestions(false);
    }
  }, [debouncedSearchTerm, productType, selectedCategory]); // Add selectedCategory to dependency array

  const searchChemicals = async (query) => {
      setIsSearching(true);
      setShowSuggestions(true);
      try {
          const searchPayload = { query, productType };
          if (selectedCategory && selectedCategory !== 'all') {
              searchPayload.category = selectedCategory;
          }
          const { data } = await comprehensiveChemicalSearch(searchPayload); // Pass updated payload
          if (data && Array.isArray(data.results)) {
              const currentIngredientNames = new Set(safeIngredients.map(i => i.name.toLowerCase()));
              const filteredResults = data.results.filter(res => !currentIngredientNames.has(res.name.toLowerCase()));
              setSuggestions(filteredResults.slice(0, 10)); // Limit results
          } else {
              setSuggestions([]);
          }
      } catch (error) {
          console.error("Chemical search failed:", error);
          setSuggestions([]);
      } finally {
          setIsSearching(false);
      }
  };


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const addIngredient = (ingredient) => {
    if (safeIngredients.some(ing => ing.name.toLowerCase() === ingredient.name.toLowerCase())) {
      return;
    }

    const newIngredient = {
      name: ingredient.name,
      purpose: ingredient.function_description || "General purpose",
      percentage: 5, // Default percentage
      eco_friendly: !ingredient.safety_level || ['safe', 'moderate'].includes(ingredient.safety_level),
      allergen: ingredient.safety_level === 'hazardous', // Simplification, can be refined
      category: ingredient.category || 'other'
    };
    
    const newIngredients = [...safeIngredients, newIngredient];
    onUpdateIngredients(newIngredients);
    
    // Clear search
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeIngredient = (name) => {
    const newIngredients = safeIngredients.filter(ing => ing.name !== name);
    onUpdateIngredients(newIngredients);
  };

  const clearAllIngredients = () => {
    onUpdateIngredients([]);
  };

  const handleScanSuccess = (scannedChemicals) => {
    const currentIngredientNames = new Set(safeIngredients.map(i => i.name.toLowerCase()));
    const newIngredientsToAdd = scannedChemicals
      .filter(scannedChem => !currentIngredientNames.has(scannedChem.name.toLowerCase()))
      .map(scannedChem => ({
        name: scannedChem.name,
        purpose: scannedChem.function_description || "Scanned ingredient",
        percentage: 5, // Default percentage
        eco_friendly: scannedChem.eco_friendly || false,
        allergen: scannedChem.allergen || false,
        category: scannedChem.category || 'other'
      }));
    
    if (newIngredientsToAdd.length > 0) {
      const updatedIngredients = [...safeIngredients, ...newIngredientsToAdd];
      onUpdateIngredients(updatedIngredients);
    }
    setIsBarcodeScannerOpen(false);
  };

  const getSustainabilityColor = (ecoFriendly) => {
    return ecoFriendly ? "text-emerald-600 bg-emerald-100 border-emerald-300" : "text-slate-600 bg-slate-100 border-slate-300";
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const productTip = PRODUCT_TIPS[productType];

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Product Type
          </Button>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Badge variant="outline" className="bg-teal-50 text-teal-800 border-teal-300 justify-center py-2">
              {productType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            {businessMode && (
              <Badge variant="outline" className="bg-violet-50 text-violet-800 border-violet-300 justify-center py-2">
                Professional Mode
              </Badge>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800">Your Product Ingredients</h2>
            <p className="text-lg text-slate-600">Select and manage ingredients for your {productType?.replace(/_/g, ' ').toLowerCase()} product.</p>
          </div>

          {productTip && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert variant={productTip.variant}>
                <productTip.icon className="h-4 w-4" />
                <AlertTitle>{productTip.variant === 'destructive' ? 'Warning' : 'Pro Tip'}</AlertTitle>
                <AlertDescription>
                  {productTip.text}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 py-4 border-b border-slate-200 -mx-2 sm:-mx-0 px-2 sm:px-0">
            <div className="relative mb-4" ref={searchInputRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search ingredients... (e.g., palm oil, salt, glycerin)"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 text-base py-3 h-12 border-2 border-slate-200 focus:border-teal-500"
              />
              {isSearching && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />}
              
              {/* Database-powered Suggestions */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto z-50"
                  >
                    {isSearching && suggestions.length === 0 && (
                        <div className="p-4 text-center text-slate-500">Searching...</div>
                    )}
                    {!isSearching && suggestions.length === 0 && searchTerm.length > 1 && (
                        <div className="p-4 text-center text-slate-500">No results found for "{searchTerm}".</div>
                    )}
                    {suggestions.map((ingredient, index) => (
                      <div
                        key={ingredient.name + index}
                        className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        onClick={() => addIngredient(ingredient)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{ingredient.name}</span>
                            {/* The eco/allergen logic here is a simplification and can be enhanced */}
                            {!['hazardous', 'highly_hazardous'].includes(ingredient.safety_level) && <Leaf className="w-3 h-3 text-emerald-500" />}
                            {['hazardous', 'highly_hazardous'].includes(ingredient.safety_level) && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                          </div>
                          <p className="text-sm text-slate-600">{ingredient.function_description || `Category: ${ingredient.category}`}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-teal-600 hover:text-teal-700">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="surfactant">Surfactants</SelectItem>
                    <SelectItem value="moisturizer">Moisturizers</SelectItem>
                    <SelectItem value="preservative">Preservatives</SelectItem>
                    <SelectItem value="fragrance">Fragrances</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="skincare">Skincare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <Button onClick={() => setIsPantryModalOpen(true)} variant="outline">
                <FileUp className="w-4 h-4 mr-2" /> Upload Pantry
              </Button>
              <Button onClick={() => setIsBarcodeScannerOpen(true)} variant="outline">
                <ScanLine className="w-4 h-4 mr-2" /> Scan Product
              </Button>
              {safeIngredients.length > 0 && (
                  <Button onClick={clearAllIngredients} variant="outline" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                      <Trash2 className="w-4 h-4 mr-2" /> Clear All
                  </Button>
              )}
            </div>
          </div>

          {safeIngredients.length > 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="p-4 sm:p-6 pb-0">
                <CardTitle className="text-xl sm:text-2xl text-slate-800 text-center sm:text-left">Added Ingredients ({safeIngredients.length})</CardTitle>
                <p className="text-slate-600 text-sm sm:text-base text-center sm:text-left">
                  Review and manage your selected ingredients.
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-4">
                <div className="space-y-3">
                  <AnimatePresence>
                    {safeIngredients.map((ingredient) => (
                      <motion.div
                        key={ingredient.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        // Modified class for mobile responsiveness
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 mb-2 sm:mb-0"> {/* Added mb-2 for mobile spacing */}
                          <Beaker className="w-5 h-5 text-teal-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-medium text-slate-900 truncate">{ingredient.name}</p>
                              {ingredient.eco_friendly && <Leaf className="w-3 h-3 text-emerald-500" />}
                              {ingredient.allergen && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                            </div>
                            <p className="text-sm text-slate-600">{ingredient.purpose}</p>
                          </div>
                        </div>
                        
                        {/* Actions - Combined into a dropdown on mobile, direct button on desktop */}
                        <div className="flex items-center gap-2 justify-end w-full sm:w-auto"> {/* Added w-full sm:w-auto for layout */}
                          {/* Mobile-only menu */}
                          <div className="sm:hidden"> {/* Hide on sm and up */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {/* Only Remove action as 'Edit Purpose' functionality is not part of this component's scope */}
                                <DropdownMenuItem onClick={() => removeIngredient(ingredient.name)} className="text-red-500">
                                  <Trash2 className="w-4 h-4 mr-2" /> Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {/* Desktop button */}
                          <div className="hidden sm:flex"> {/* Hide on mobile, show on sm and up */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeIngredient(ingredient.name)}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" /> {/* Changed X to Trash2 as per outline */}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 gap-4 border-t border-slate-200 mt-6">
                  <p className="text-sm text-slate-500 text-center sm:text-left">
                    {safeIngredients.length === 0 ? "Add at least 2 ingredients to continue" : 
                     `${safeIngredients.length} ingredients added • ${safeIngredients.filter(ing => ing.eco_friendly).length} eco-friendly`}
                  </p>
                  <Button
                    onClick={onNext}
                    disabled={safeIngredients.length < 2 || isLoading}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg w-full sm:w-auto"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Recipes
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl p-6 text-center space-y-4">
              <Sparkles className="w-12 h-12 text-teal-500 mx-auto" />
              <h3 className="text-2xl font-semibold text-slate-800">Ready to build your formula?</h3>
              <p className="text-slate-600">
                Start typing in the search box above to find ingredients instantly.
              </p>
              <p className="text-sm text-slate-500 mt-2">Add at least 2 ingredients to generate recipes.</p>
            </Card>
          )}
        </motion.div>
      </div>
      
      <React.Suspense fallback={null}>
        <UploadPantryModal
          isOpen={isPantryModalOpen}
          onClose={() => setIsPantryModalOpen(false)}
          onUploadComplete={onUpdateIngredients}
        />
      </React.Suspense>
      <React.Suspense fallback={null}>
        <BarcodeScannerModal
          isOpen={isBarcodeScannerOpen}
          onClose={() => setIsBarcodeScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      </React.Suspense>
    </TooltipProvider>
  );
}
