import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Search, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDebounce } from "../shared/useDebounce";
import { useToast } from "@/components/ui/use-toast";

export default function ProductDescriptionStep({ 
  businessMode, 
  productType, 
  onBack, 
  onGenerateOptions,
  isGenerating,
  initialDescription
}) {
  const [searchQuery, setSearchQuery] = useState(initialDescription || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");
  const searchRef = useRef(null);
  const justSelectedRef = useRef(false);
  const { toast } = useToast();
  
  const debouncedSearch = useDebounce(searchQuery, 150);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (debouncedSearch && debouncedSearch.length > 1) {
      fetchSuggestions(debouncedSearch);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
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
    setSuggestionsError("");
    setShowSuggestions(true);
    
    try {
      const response = await base44.functions.invoke('runConsumerLLM', {
        operation: 'productSuggestions',
        data: { productType: productType.name, query }
      });

      if (response && Array.isArray(response.suggestions) && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      } else {
        setSuggestions([]);
        setSuggestionsError("No suggestions found — try rephrasing or click Generate.");
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
      const reason = error?.message || error?.error || "Connection issue";
      setSuggestionsError("Suggestions unavailable — check your connection.");
      toast({
        title: "Couldn't load suggestions",
        description: `The suggestion lookup failed (${reason}). You can still type your own description and generate.`,
        variant: "destructive",
      });
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

  const handleGenerate = () => {
    if (searchQuery && !isGenerating) {
      setShowSuggestions(false);
      onGenerateOptions(searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const modeColors = businessMode 
    ? {
        gradient: 'from-violet-600 to-purple-600',
        gradientHover: 'from-violet-700 to-purple-700',
        focus: 'focus:border-violet-500',
        iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
        hover: 'hover:bg-violet-50'
      }
    : {
        gradient: 'from-teal-600 to-cyan-600',
        gradientHover: 'from-teal-700 to-cyan-700',
        focus: 'focus:border-teal-500',
        iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-500',
        hover: 'hover:bg-teal-50'
      };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="flex items-center gap-2" disabled={isGenerating}>
        <ArrowLeft className="w-4 h-4" />
        Back to Product Types
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 ${modeColors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-slate-800 mb-2">
              {businessMode ? 'Define Your Commercial Product' : 'What would you like to create?'}
            </CardTitle>
            <p className="text-slate-600 text-lg">
              {businessMode 
                ? `Describe your ${productType.name.toLowerCase()} for commercial production with target market, claims, and specifications`
                : `Describe your ${productType.name.toLowerCase()} and get a simple, homemade recipe in seconds`
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Search Input */}
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder={businessMode 
                    ? `e.g., anti-aging serum with 2% retinol for EU market...`
                    : `e.g., gentle ${productType.name.toLowerCase()} for sensitive skin...`
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className={`pl-12 pr-4 py-6 text-lg border-2 border-slate-200 ${modeColors.focus} rounded-xl`}
                  disabled={isGenerating}
                  autoFocus
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
                    className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
                  >

                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={`px-4 py-3 ${modeColors.hover} cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-slate-900 text-sm">{suggestion}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {suggestionsError && !isSearching && (
                <p className="text-xs text-amber-600 mt-1 px-1">{suggestionsError}</p>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!searchQuery || isGenerating}
              className={`w-full bg-gradient-to-r ${modeColors.gradient} hover:${modeColors.gradientHover} text-white py-6 text-lg rounded-xl shadow-lg disabled:opacity-50`}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Formula Options...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Formula Options
                </>
              )}
            </Button>

            <div className={`rounded-lg p-4 border ${businessMode ? 'bg-violet-50 border-violet-200' : 'bg-teal-50 border-teal-200'}`}>
              <p className="text-sm text-slate-700 text-center">
                {businessMode ? (
                  <>
                    <strong>💼 Business Tip:</strong> Include target market, price positioning, key claims, regulatory region (EU/US/Asia), and any certification requirements (organic, vegan, etc.)
                  </>
                ) : (
                  <>
                    <strong>💡 DIY Tip:</strong> Mention skin type, preferred scents, any allergies to avoid, and whether you want a quick recipe or something more elaborate.
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}