import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Loader2, Search, ChevronRight,
  Home, Droplets, Flame, Heart, Baby, Car, Leaf, Wrench, 
  Beaker, Shirt, Sun, Clock
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDebounce } from "../shared/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Product catalog data
const productCatalog = [
  {
    id: 'all_purpose_cleaner',
    name: 'All-Purpose Cleaner',
    description: 'Versatile cleaning solution for multiple surfaces',
    icon: Home,
    category: 'cleaning',
    difficulty: 'Beginner',
    time: '15 min',
    color: 'bg-blue-500'
  },
  {
    id: 'glass_cleaner',
    name: 'Glass & Window Cleaner',
    description: 'Streak-free cleaning for glass surfaces',
    icon: Sparkles,
    category: 'cleaning',
    difficulty: 'Beginner',
    time: '10 min',
    color: 'bg-cyan-500'
  },
  {
    id: 'bathroom_cleaner',
    name: 'Bathroom Cleaner',
    description: 'Powerful lime scale and soap scum remover',
    icon: Droplets,
    category: 'cleaning',
    difficulty: 'Intermediate',
    time: '20 min',
    color: 'bg-teal-500'
  },
  {
    id: 'kitchen_degreaser',
    name: 'Kitchen Degreaser',
    description: 'Heavy-duty grease removal formula',
    icon: Flame,
    category: 'cleaning',
    difficulty: 'Intermediate',
    time: '25 min',
    color: 'bg-orange-500'
  },
  {
    id: 'facial_moisturizer',
    name: 'Facial Moisturizer',
    description: 'Gentle hydrating cream for daily skincare',
    icon: Heart,
    category: 'skincare',
    difficulty: 'Intermediate',
    time: '30 min',
    color: 'bg-pink-500'
  },
  {
    id: 'hand_soap',
    name: 'Hand Soap',
    description: 'Cleansing soap with moisturizing properties',
    icon: Droplets,
    category: 'personal_care',
    difficulty: 'Beginner',
    time: '20 min',
    color: 'bg-purple-500'
  },
  {
    id: 'body_wash',
    name: 'Body Wash',
    description: 'Luxurious cleansing gel for daily use',
    icon: Sparkles,
    category: 'personal_care',
    difficulty: 'Intermediate',
    time: '35 min',
    color: 'bg-blue-400'
  },
  {
    id: 'shampoo',
    name: 'Shampoo',
    description: 'Gentle cleansing formula for hair',
    icon: Droplets,
    category: 'hair_care',
    difficulty: 'Advanced',
    time: '40 min',
    color: 'bg-green-500'
  },
  {
    id: 'sunscreen',
    name: 'Sunscreen',
    description: 'Broad spectrum UV protection',
    icon: Sun,
    category: 'skincare',
    difficulty: 'Advanced',
    time: '45 min',
    color: 'bg-yellow-500'
  },
  {
    id: 'baby_care',
    name: 'Baby Care Products',
    description: 'Ultra-gentle formulations for sensitive skin',
    icon: Baby,
    category: 'personal_care',
    difficulty: 'Advanced',
    time: '50 min',
    color: 'bg-pink-400'
  },
  {
    id: 'car_care',
    name: 'Car Care Products',
    description: 'Automotive cleaning and protection',
    icon: Car,
    category: 'specialty',
    difficulty: 'Intermediate',
    time: '30 min',
    color: 'bg-slate-600'
  },
  {
    id: 'laundry_detergent',
    name: 'Laundry Detergent',
    description: 'Effective fabric cleaning solution',
    icon: Shirt,
    category: 'cleaning',
    difficulty: 'Intermediate',
    time: '25 min',
    color: 'bg-blue-600'
  },
  {
    id: 'eco_friendly',
    name: 'Eco-Friendly Formula',
    description: 'Sustainable ingredients and safe',
    icon: Leaf,
    category: 'specialty',
    difficulty: 'Advanced',
    time: '40 min',
    color: 'bg-green-600'
  },
  {
    id: 'custom_formula',
    name: 'Custom Formula',
    description: 'Create your own custom formula using',
    icon: Beaker,
    category: 'specialty',
    difficulty: 'Advanced',
    time: 'Varies',
    color: 'bg-purple-600'
  },
  {
    id: 'industrial_grade',
    name: 'Industrial Grade',
    description: 'Professional strength for commercial applications',
    icon: Wrench,
    category: 'specialty',
    difficulty: 'Advanced',
    time: '60 min',
    color: 'bg-slate-700'
  }
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'cleaning', label: 'Cleaning Products' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'personal_care', label: 'Personal Care' },
  { value: 'hair_care', label: 'Hair Care' },
  { value: 'specialty', label: 'Specialty Products' }
];

export default function ProductTypeSelector({ 
  businessMode,
  onBack, 
  onGenerateRecipe,
  isGenerating
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('catalog'); // 'catalog' or 'search'
  const searchRef = useRef(null);
  const justSelectedRef = useRef(false);
  
  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (debouncedSearch && debouncedSearch.length > 1) {
      fetchSuggestions(debouncedSearch);
      setViewMode('search');
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      if (!searchQuery) {
        setViewMode('catalog');
      }
    }
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    setIsSearching(true);
    setShowSuggestions(true);
    
    try {
      const prompt = `Given the user input "${query}", suggest 8 specific cosmetic, cleaning, or personal care product types they might want to create. 
      
      Examples: All-Purpose Cleaner, Facial Moisturizer, Hand Soap, Glass Cleaner, Body Wash, Kitchen Degreaser, Sunscreen, Shampoo
      
      Return a JSON object with a "suggestions" array containing product type names.`;

      const response = await base44.functions.invoke('runConsumerLLM', {
        operation: 'productTypeSuggestions',
        data: { query }
      });

      if (response && Array.isArray(response.suggestions)) {
        setSuggestions(response.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    justSelectedRef.current = true;
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSelectProduct = async (product) => {
    const productType = product.id;
    const humanReadableName = product.name;
    await onGenerateRecipe(productType, humanReadableName);
  };

  const handleGenerateRecipe = async () => {
    if (!searchQuery || isGenerating) return;
    
    const productType = searchQuery.toLowerCase().replace(/\s+/g, '_');
    await onGenerateRecipe(productType, searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery && !isGenerating) {
      setShowSuggestions(false);
      handleGenerateRecipe();
    }
  };

  const modeColors = businessMode 
    ? {
        gradient: 'from-violet-500 to-purple-500',
        gradientButton: 'from-violet-600 to-purple-600',
        gradientButtonHover: 'from-violet-700 to-purple-700',
        focus: 'focus:border-violet-500',
        hover: 'hover:bg-violet-50',
        badge: 'bg-violet-50 text-violet-800 border-violet-300',
        iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
        cardHover: 'hover:border-violet-300 hover:shadow-lg'
      }
    : {
        gradient: 'from-teal-500 to-cyan-500',
        gradientButton: 'from-teal-600 to-cyan-600',
        gradientButtonHover: 'from-teal-700 to-cyan-700',
        focus: 'focus:border-teal-500',
        hover: 'hover:bg-teal-50',
        badge: 'bg-teal-50 text-teal-800 border-teal-300',
        iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-500',
        cardHover: 'hover:border-teal-300 hover:shadow-lg'
      };

  const filteredProducts = productCatalog.filter(product => 
    selectedCategory === 'all' || product.category === selectedCategory
  );

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-amber-100 text-amber-800';
      case 'Advanced': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
          disabled={isGenerating}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        {businessMode && (
          <Badge variant="outline" className={modeColors.badge}>
            Professional Mode Active
          </Badge>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className={`w-16 h-16 ${modeColors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-slate-800 mb-2">
              {viewMode === 'catalog' ? 'Choose Your Product Type' : 'What would you like to create?'}
            </CardTitle>
            <p className="text-slate-600 text-lg">
              {viewMode === 'catalog' ? 
                "Select what you'd like to create today from our extensive catalog" :
                "Describe your product and get a complete, professional formula in seconds"
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Search Input */}
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search or type your own product idea..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className={`pl-12 pr-4 py-6 text-lg border-2 border-slate-200 ${modeColors.focus} rounded-xl`}
                  disabled={isGenerating}
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
                )}
              </div>

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={`px-4 py-3 ${modeColors.hover} cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900">{suggestion}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {searchQuery && (
              <Button
                onClick={handleGenerateRecipe}
                disabled={!searchQuery || isGenerating}
                className={`w-full bg-gradient-to-r ${modeColors.gradientButton} hover:${modeColors.gradientButtonHover} text-white py-6 text-lg rounded-xl shadow-lg disabled:opacity-50`}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Your Formula...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Formula
                  </>
                )}
              </Button>
            )}

            {/* Product Catalog */}
            {viewMode === 'catalog' && (
              <>
                {/* Category Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">Filter by:</span>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {filteredProducts.map((product) => {
                    const Icon = product.icon;
                    return (
                      <motion.div
                        key={product.id}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer border-2 border-slate-200 ${modeColors.cardHover} transition-all duration-200`}
                          onClick={() => handleSelectProduct(product)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-12 h-12 ${product.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 text-sm mb-1">{product.name}</h3>
                                <p className="text-xs text-slate-600 line-clamp-2">{product.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className={getDifficultyColor(product.difficulty)}>
                                {product.difficulty}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                {product.time}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 text-center">
                <strong>💡 Tip:</strong> Browse our catalog or search for something specific. You can also type your own custom product idea!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}