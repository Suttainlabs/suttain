import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Home, Droplets, Flame, Heart, Baby, Car, 
  Leaf, Wrench, Beaker, Shirt, Sun, Sparkles, Clock, Search, ArrowRight, ChevronRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    description: 'Create your own custom formula',
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

export default function ProductTypeCatalog({ businessMode, onBack, onSelectProductType }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customProductName, setCustomProductName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const modeColors = businessMode 
    ? {
        iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
        cardHover: 'hover:border-violet-300 hover:shadow-lg',
        btnBg: 'from-violet-600 to-purple-600',
        btnHover: 'from-violet-700 to-purple-700',
        suggestionHover: 'hover:bg-violet-50'
      }
    : {
        iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-500',
        cardHover: 'hover:border-teal-300 hover:shadow-lg',
        btnBg: 'from-teal-600 to-cyan-600',
        btnHover: 'from-teal-700 to-cyan-700',
        suggestionHover: 'hover:bg-teal-50'
      };

  // Search for matching products as user types
  useEffect(() => {
    if (customProductName.length > 0) {
      const matches = productCatalog.filter(product => 
        product.name.toLowerCase().includes(customProductName.toLowerCase()) ||
        product.description.toLowerCase().includes(customProductName.toLowerCase())
      ).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [customProductName]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSelectSuggestion = (product) => {
    onSelectProductType(product);
  };

  const handleCustomProduct = () => {
    if (customProductName.trim()) {
      onSelectProductType({
        id: 'custom_' + customProductName.toLowerCase().replace(/\s+/g, '_'),
        name: customProductName,
        description: `Custom ${customProductName} formula`,
        icon: Beaker,
        category: 'specialty',
        difficulty: 'Intermediate',
        time: '30 min',
        color: businessMode ? 'bg-violet-500' : 'bg-teal-500'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="text-center p-6 pb-4">
            <div className={`w-16 h-16 ${modeColors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Choose Your Product Type</h1>
            <p className="text-slate-600 text-lg">
              Select from our catalog or create a custom product type
            </p>
          </div>
          
          <CardContent className="space-y-6">
            {/* Custom Product Input with Suggestions */}
            <div className="relative" ref={searchRef}>
              <Card className="border-2 border-slate-200 bg-slate-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <Input
                      placeholder="Type your own product (e.g., 'Carpet Stain Remover', 'Pet Shampoo')"
                      value={customProductName}
                      onChange={(e) => setCustomProductName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomProduct()}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      onClick={handleCustomProduct}
                      disabled={!customProductName.trim()}
                      size="sm"
                      className={`bg-gradient-to-r ${modeColors.btnBg} hover:${modeColors.btnHover} text-white`}
                    >
                      Create
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
                  >
                    <div className="p-2">
                      <p className="text-xs font-semibold text-slate-500 px-3 py-2">Matching Products</p>
                      {suggestions.map((product) => {
                        const Icon = product.icon;
                        return (
                          <div
                            key={product.id}
                            onClick={() => handleSelectSuggestion(product)}
                            className={`flex items-center gap-3 p-3 ${modeColors.suggestionHover} cursor-pointer rounded-lg transition-colors`}
                          >
                            <div className={`w-10 h-10 ${product.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-900 text-sm">{product.name}</div>
                              <div className="text-xs text-slate-600 truncate">{product.description}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">or choose from catalog</span>
              </div>
            </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      onClick={() => onSelectProductType(product)}
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}