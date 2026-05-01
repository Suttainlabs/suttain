import React, { useState, useContext, Suspense, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Download, Beaker, Info, Plus,
  Minus, FileText, AlertTriangle, ShieldCheck, Thermometer,
  Droplets, Clock, BrainCircuit, History, Save, Loader2, MessageSquare, Star, X,
  Menu, Printer, Search,
  Calculator,
  Leaf, Sparkles, DollarSign // Added icons
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InvokeLLM } from "@/integrations/Core";
import { base44 } from "@/api/base44Client";
import { Formula } from "@/entities/Formula";
import { User } from "@/entities/User";
import { Review } from "@/entities/Review";
import { createPageUrl } from "@/utils";
import AuthContext from '../auth/AuthContext';

import PDFExportModal from "./PDFExportModal";
import PrintLabelModal from "./PrintLabelModal";
import FormulaExportDialog from "./FormulaExportUtils";
import ComplianceChecker from "./ComplianceChecker";
import SustainabilityAnalyzer from "./SustainabilityAnalyzer";
import FormulaAssistant from "./FormulaAssistant";
import FormulaOptimizer from "./FormulaOptimizer";
import AISuggestionsPanel from "./AISuggestionsPanel";
import { useDebounce } from "../shared/useDebounce";
import IngredientBrowser from "../ingredients/IngredientBrowser";
import IngredientInteractionAnalyzer from "./IngredientInteractionAnalyzer";
import IngredientSustainabilityScore from "./IngredientSustainabilityScore";
import HazardAlternativesPanel from "./HazardAlternativesPanel";
import RegulatoryScanner from "../compliance/RegulatoryScanner";
import SupplierLinkModal from "../suppliers/SupplierLinkModal";
import SupplierManager from "../suppliers/SupplierManager";

const RatingModal = React.lazy(() => import('../shared/RatingModal'));

export default function FormulaEditor({
  recipe,
  productType,
  businessMode: businessModeProp,
  isUpdate,
  originalFormulaId,
  onSaveSuccess,
  onBack,
  onResetGenerator
}) {
  const { user, openAuthModal } = useContext(AuthContext);
  const navigate = useNavigate();

  // Derive the definitive business mode from the recipe if available,
  // falling back to the prop. This makes it more robust.
  const businessMode = recipe?.business_mode ?? businessModeProp ?? false;
  
  // Color configuration based on mode
  const modeColors = businessMode 
    ? {
        primaryBtnClasses: 'bg-violet-600 hover:bg-violet-700', // For primary buttons
        primaryIconClasses: 'text-violet-600', // For main icons
        primaryBgClasses: 'bg-violet-600', // For solid backgrounds like step circles
        primaryAccentGradient: 'from-violet-500 to-purple-500', // For feedback icon gradient
        accentCardBg: 'bg-violet-50', // For suggestion/info card backgrounds
        accentCardBorder: 'border-violet-200', // For suggestion/info card borders
        accentCardText: 'text-violet-700', // For suggestion/info card general text
        accentCardTextStrong: 'text-violet-900', // For suggestion/info card strong text/titles
        tabsTriggerActive: 'data-[state=active]:bg-violet-100 data-[state=active]:text-violet-800 data-[state=active]:border-b-2 data-[state=active]:border-violet-500', // Active tab trigger
        loaderIcon: 'text-violet-400', // Loader icon
        // Status colors (success, warning, error) are generally kept consistent regardless of theme
        successDisplayBg: 'bg-emerald-100',
        successDisplayText: 'text-emerald-800',
        successDisplayBorder: 'border-emerald-300',
        warningDisplayBg: 'bg-amber-100',
        warningDisplayText: 'text-amber-800',
        warningDisplayBorder: 'border-amber-300',
        alertErrorText: 'text-rose-500'
      }
    : {
        primaryBtnClasses: 'bg-teal-600 hover:bg-teal-700',
        primaryIconClasses: 'text-teal-600',
        primaryBgClasses: 'bg-teal-600',
        primaryAccentGradient: 'from-teal-500 to-cyan-500',
        accentCardBg: 'bg-blue-50',
        accentCardBorder: 'border-blue-200',
        accentCardText: 'text-blue-800',
        accentCardTextStrong: 'text-blue-900',
        tabsTriggerActive: 'data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800 data-[state=active]:border-b-2 data-[state=active]:border-teal-500',
        loaderIcon: 'text-slate-400',
        successDisplayBg: 'bg-emerald-100',
        successDisplayText: 'text-emerald-800',
        successDisplayBorder: 'border-emerald-300',
        warningDisplayBg: 'bg-amber-100',
        warningDisplayText: 'text-amber-800',
        warningDisplayBorder: 'border-amber-300',
        alertErrorText: 'text-rose-500'
      };

  const [formula, setFormula] = useState(() => {
    // Ensure recipe is at least an empty object for safe destructuring/access if called outside of main guard
    const safeRecipe = recipe || {};

    // Ensure 'properties', 'instructions', 'safety_precautions' are always valid objects/arrays
    // to provide a robust initial state structure and simplify downstream access patterns.
    // This handles cases where LLM output might omit these keys.
    const initialProperties = safeRecipe.properties || {};
    
    // Robustly parse instructions whether they're an array, JSON string, or double-encoded string
    let initialInstructions = [];
    const rawInstructions = safeRecipe.instructions;
    if (Array.isArray(rawInstructions)) {
      initialInstructions = rawInstructions;
    } else if (typeof rawInstructions === 'string' && rawInstructions.trim()) {
      try {
        let parsed = JSON.parse(rawInstructions);
        // Handle double-stringified JSON
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        initialInstructions = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to parse instructions:", e, rawInstructions);
        initialInstructions = [];
      }
    }
    // Also check full_recipe_data as a fallback source for instructions
    if (initialInstructions.length === 0 && safeRecipe.full_recipe_data?.instructions) {
      const fallback = safeRecipe.full_recipe_data.instructions;
      if (Array.isArray(fallback)) {
        initialInstructions = fallback;
      } else if (typeof fallback === 'string' && fallback.trim()) {
        try {
          const parsed = JSON.parse(fallback);
          initialInstructions = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          initialInstructions = [];
        }
      }
    }

    const initialSafetyPrecautions = Array.isArray(safeRecipe.safety_precautions) ? safeRecipe.safety_precautions : [];

    // Initialize ingredients without density state management (as density fetching is removed)
    const ingredientsMapped = (safeRecipe.ingredients || []).map(ing => ({
      ...ing,
      // density and isDensityLoading are removed as they are no longer managed client-side for fetching
    }));

    return {
      ...safeRecipe, // Spread existing recipe properties (name, description, ingredients etc.)
      ingredients: ingredientsMapped, // Use ingredients without density state management
      properties: initialProperties, // Override with guaranteed object, or set if missing
      instructions: initialInstructions, // Override with guaranteed array, or set if missing
      safety_precautions: initialSafetyPrecautions, // Override with guaranteed array, or set if missing
      // Derive ph_level_value robustly from safe properties, defaulting to 7
      ph_level_value: parseFloat(initialProperties.ph_level?.split(' ')[0]) || 7
    };
  });

  // NEW state for batch calculations
  const [batchSize, setBatchSize] = useState(100);
  const [batchUnit, setBatchUnit] = useState('g');

  const [updatingOption, setUpdatingOption] = useState(null); // Track which option is loading
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [isSaving, setIsSaving] = useState(false); // New state for explicit saving status
  const [showFeedbackNotification, setShowFeedbackNotification] = useState(false); // New state for feedback notification
  const [showRatingModal, setShowRatingModal] = useState(false); // Existing state for rating modal
  const [showIngredientBrowser, setShowIngredientBrowser] = useState(false); // Ingredient browser modal
  const [showRegulatoryCheck, setShowRegulatoryCheck] = useState(false); // Regulatory compliance check
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedIngredientForSupplier, setSelectedIngredientForSupplier] = useState(null);

  // NEW: Ingredient search states
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState("");
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [isSearchingIngredients, setIsSearchingIngredients] = useState(false);
  const [showIngredientSuggestions, setShowIngredientSuggestions] = useState(false);
  const ingredientSearchRef = useRef(null);
  
  const debouncedIngredientSearch = useDebounce(ingredientSearchTerm, 300);

  // NEW: Search for ingredients
  useEffect(() => {
    if (debouncedIngredientSearch && debouncedIngredientSearch.length > 1) {
      searchIngredients(debouncedIngredientSearch);
    } else {
      setIngredientSuggestions([]);
      setShowIngredientSuggestions(false);
    }
  }, [debouncedIngredientSearch]);

  const searchIngredients = async (query) => {
    setIsSearchingIngredients(true);
    setShowIngredientSuggestions(true);
    try {
      const { data } = await base44.functions.invoke('comprehensiveChemicalSearch', {
        query,
        productType
      });
      if (data && Array.isArray(data.results)) {
        const currentIngredientNames = new Set(formula.ingredients.map(i => i.chemical_name.toLowerCase()));
        const filteredResults = data.results.filter(res => !currentIngredientNames.has(res.name.toLowerCase()));
        setIngredientSuggestions(filteredResults.slice(0, 8));
      } else {
        setIngredientSuggestions([]);
      }
    } catch (error) {
      console.error("Ingredient search failed:", error);
      setIngredientSuggestions([]);
    } finally {
      setIsSearchingIngredients(false);
    }
  };

  const addIngredientFromSearch = (ingredient) => {
    const newIngredient = {
      chemical_name: ingredient.name,
      purpose: ingredient.function_description || "General purpose",
      percentage: 5, // Default percentage, user can adjust
    };
    
    setFormula(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
    
    setIngredientSearchTerm("");
    setIngredientSuggestions([]);
    setShowIngredientSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ingredientSearchRef.current && !ingredientSearchRef.current.contains(event.target)) {
        setShowIngredientSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Removed: Effect to fetch densities for ingredients

  // MOVED UP: Memoized calculation for ingredient amounts
  const ingredientAmounts = useMemo(() => {
    // Ensure formula.ingredients is always an array to prevent errors if formula is not fully initialized
    const ingredientsToProcess = formula.ingredients || [];

    return ingredientsToProcess.map(ing => {
      if (typeof ing.percentage !== 'number' || isNaN(ing.percentage) || !batchSize || batchSize <= 0) {
        return { value: '-', unit: '' };
      }

      const percentage = ing.percentage / 100;
      let amount;
      
      // Convert batch size to grams for calculation
      let totalBatchWeight = batchSize;
      if (batchUnit === 'kg') totalBatchWeight *= 1000;
      else if (batchUnit === 'lb') totalBatchWeight *= 453.592; // 1 lb = 453.592 g
      else if (batchUnit === 'L') totalBatchWeight *= 1000; // Assume 1 L = 1000 g (density of water)
      else if (batchUnit === 'ml') totalBatchWeight *= 1; // Assume 1 ml = 1 g (density of water)
      // else it's already in grams
      
      // Calculate ingredient weight in grams
      let ingredientWeight = totalBatchWeight * percentage;

      // Convert to display unit
      if (batchUnit === 'kg') {
        amount = ingredientWeight / 1000;
      } else if (batchUnit === 'lb') {
        amount = ingredientWeight / 453.592;
      } else if (batchUnit === 'L') {
        amount = ingredientWeight / 1000;
      } else if (batchUnit === 'ml') {
        amount = ingredientWeight;
      } else {
        amount = ingredientWeight;
      }
      
      return { value: amount.toFixed(2), unit: batchUnit };
    });
  }, [formula.ingredients, batchSize, batchUnit]);

  // NEW: Dynamic instructions that update with batch amounts
  const dynamicInstructions = useMemo(() => {
    if (!formula.instructions || !Array.isArray(formula.instructions)) {
      return [];
    }

    return formula.instructions.map(phase => {
      if (!phase.steps || !Array.isArray(phase.steps)) {
        return phase;
      }

      const updatedSteps = phase.steps.map(step => {
        let updatedStep = step;
        
        // For each ingredient, replace amounts in the instruction
        formula.ingredients.forEach((ing, index) => {
          const amount = ingredientAmounts[index];
          if (amount && amount.value !== '-') {
            // Create regex to find ingredient mentions with amounts
            // This will match patterns like "30g of coconut oil", "20g coconut oil", etc.
            // Using \b for word boundaries to avoid partial matches
            const ingredientNamePattern = ing.chemical_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // Regex to match quantity followed by unit, then optional "of", then ingredient name
            const amountPattern = new RegExp(`\\b\\d+\\.?\\d*\\s*(?:g|kg|ml|L|lb)\\s+(?:of\\s+)?${ingredientNamePattern}\\b`, 'gi');
            updatedStep = updatedStep.replace(amountPattern, `${amount.value}${amount.unit} ${ing.chemical_name}`);
            
            // Regex to match ingredient name followed by quantity in parentheses
            const reversedPattern = new RegExp(`\\b${ingredientNamePattern}\\s*\\(?\\d+\\.?\\d*\\s*(?:g|kg|ml|L|lb)\\)?\\b`, 'gi');
            updatedStep = updatedStep.replace(reversedPattern, `${ing.chemical_name} (${amount.value}${amount.unit})`);
            
            // Additional catch-all for ingredient name followed by amount without "of" or parentheses but near it
            // This is more aggressive and might need fine-tuning based on LLM output patterns
            const generalPattern = new RegExp(`\\b${ingredientNamePattern}\\s*\\d+\\.?\\d*\\s*(?:g|kg|ml|L|lb)\\b`, 'gi');
            updatedStep = updatedStep.replace(generalPattern, `${ing.chemical_name} (${amount.value}${amount.unit})`);

            // Replace generic quantity indicators for this ingredient if no specific amount was mentioned
            // Example: "add [ingredient name]" => "add Xg [ingredient name]"
            // This is a bit more complex and might not be needed if LLM outputs amounts already.
            // For now, focus on replacing existing explicit quantities.
          }
        });
        
        return updatedStep;
      });

      return {
        ...phase,
        steps: updatedSteps
      };
    });
  }, [formula.instructions, formula.ingredients, ingredientAmounts]);


  // Defensive check for invalid recipe prop
  if (!recipe || !recipe.ingredients || !recipe.name) {
    return (
        <div className="text-center p-4 sm:p-8 bg-rose-50 rounded-lg mx-4">
            <AlertTriangle className={`w-8 h-8 sm:w-12 sm:h-12 ${modeColors.alertErrorText} mx-auto mb-4`} />
            <h2 className="text-lg sm:text-xl font-bold text-rose-700">Formula Loading Error</h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">There was a problem loading the formula data. Please return to the previous step and try generating recipes again.</p>
            <Button onClick={onBack} variant="outline" className="mt-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
            </Button>
        </div>
    );
  }

  const totalPercentage = formula.ingredients.reduce((acc, ing) => acc + (parseFloat(ing.percentage) || 0), 0);

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formula.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormula({ ...formula, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormula({
      ...formula,
      ingredients: [...formula.ingredients, {
        chemical_name: "", percentage: 0, purpose: "" // density and isDensityLoading removed
      }]
    });
  };

  const removeIngredient = (index) => {
    setFormula({
      ...formula,
      ingredients: formula.ingredients.filter((_, i) => i !== index)
    });
  };

  const triggerFeedback = () => {
    setShowFeedbackNotification(true);
    setTimeout(() => setShowFeedbackNotification(8000), 8000); // Hide after 8 seconds
  };

  const handleActionComplete = () => {
    // showNextSteps state removed as per new outline, no longer needed here
    triggerFeedback(); // Call feedback trigger
  };

  const handleSaveFormula = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    setIsSaving(true); // Set saving state true
    setSaveStatus('saving');

    try {
      const payload = {
        name: formula.name,
        product_type: productType,
        description: formula.description || `A formula for ${productType.replace(/_/g, ' ')}.`,
        ingredients: formula.ingredients.map(ing => ({
          chemical_name: ing.chemical_name,
          percentage: parseFloat(ing.percentage) || 0,
          purpose: ing.purpose,
          density: ing.density // Include density if it exists, otherwise it will be undefined/null
        })),
        // Use original instructions for saving, not dynamic ones
        instructions: JSON.stringify(formula.instructions), // Revert to original recipe instructions for saving
        difficulty_level: formula.properties?.difficulty?.toLowerCase() || 'intermediate',
        ph_level: formula.ph_level_value, // Use the state-managed ph_level_value
        shelf_life: formula.properties?.shelf_life || "6 months",
        is_business_mode: businessMode,
        status: 'draft', // Always save as 'draft' with this button
        last_step: 5,
        full_recipe_data: recipe
      };

      let savedFormula;
      if (isUpdate && originalFormulaId) {
        savedFormula = await Formula.update(originalFormulaId, payload);
      } else {
        savedFormula = await Formula.create(payload);
      }

      // Update state with saved data. No need to preserve isDensityLoading
      setFormula(prev => ({
        ...prev,
        ...savedFormula,
        ingredients: savedFormula.ingredients // No need to map and preserve isDensityLoading
      }));

      // Award points for creating/updating a formula
      try {
        const currentUser = await User.me();
        if (currentUser) {
          const pointsToAward = isUpdate ? 5 : 10;
          const newPoints = (currentUser.reward_points || 0) + pointsToAward;
          await User.updateMyUserData({ reward_points: newPoints });
          console.log(`Awarded ${pointsToAward} points for formula ${isUpdate ? 'update' : 'creation'}`);
        }
      } catch (e) {
        console.warn("Could not award formula points:", e);
      }

      if (onSaveSuccess) {
          onSaveSuccess(savedFormula);
      }

      setSaveStatus('saved');
      
      // Track formula save
      base44.analytics.track({
        eventName: 'formula_saved',
        properties: {
          is_update: isUpdate,
          product_type: productType,
          business_mode: businessMode,
          ingredient_count: formula.ingredients.length
        }
      });
      
      // Show subtle feedback notification after successful save
      triggerFeedback(); // Call feedback trigger

      setTimeout(() => setSaveStatus('idle'), 2500);

    } catch (error) {
      console.error("Failed to save formula:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } finally {
      setIsSaving(false);
    }
  };


  const handleAdvancedOption = async (option) => {
    setUpdatingOption(option);
    let prompt;
    if (option === 'preservative') {
      prompt = `Given the formula for "${formula.name}", suggest a suitable preservative system. The current ingredients are: ${formula.ingredients.map(i => `${i.chemical_name} (${i.percentage}%)`).join(', ')}. Provide a response in JSON format with the preservative's INCI name and a recommended percentage. Example: { "chemical_name": "Phenoxyethanol", "percentage": 0.8, "purpose": "Preservative" }`;
    } else if (option === 'ph_adjuster') {
      prompt = `The target pH for "${formula.name}" is ${formula.properties.ph_level}. Suggest a pH adjuster (like Citric Acid or Sodium Hydroxide) to achieve this. Provide a JSON response with the adjuster's INCI name and a starting percentage. Example: { "chemical_name": "Citric Acid", "percentage": 0.1, "purpose": "pH Adjuster" }`;
    }

    try {
      const suggestion = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            chemical_name: { type: "string" },
            percentage: { type: "number" },
            purpose: { type: "string" }
          }
        }
      });
      if (suggestion && suggestion.chemical_name) {
        setFormula(prev => ({
          ...prev,
          ingredients: [...prev.ingredients, {
            ...suggestion,
          }]
        }));
      }
    } catch (error) {
      console.error(`Error suggesting ${option}:`, error);
      alert(`Could not get a suggestion for a ${option}. Please add one manually.`);
    }
    setUpdatingOption(null);
  };

  const handleViewHistory = () => {
    navigate(createPageUrl('FormulaHistory'));
  };

  // Modified handleStartNewFormula to not automatically show rating modal
  const handleStartNewFormula = () => {
    onResetGenerator(); // Proceed directly to reset generator
  };

  // New function to handle feedback submission (previously handleRatingSubmit)
  const handleFeedbackSubmit = async (rating, feedback) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      // Award 5 points for feedback and create review entry
      await Review.create({
        feature_used: 'generator',
        rating,
        feedback: feedback || null,
        formula_type: productType,
        helpful: rating >= 4,
        points_earned: 5
      });

      // Update user points
      try {
        const currentUser = await User.me();
        if (currentUser) {
          const newPoints = (currentUser.reward_points || 0) + 5;
          await User.updateMyUserData({ reward_points: newPoints });
          console.log("Awarded 5 points for formula generation feedback.");
        }
      } catch (e) {
        console.warn("Could not award feedback points:", e);
      }

      setShowRatingModal(false);
      setShowFeedbackNotification(false); // Hide the notification after feedback is given
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setShowRatingModal(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 relative">
      {/* Simplified Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" onClick={onBack} className="self-start -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <Input
            value={formula.name || ''}
            onChange={(e) => setFormula({ ...formula, name: e.target.value })}
            placeholder="Enter Formula Name..."
            className="text-2xl md:text-3xl font-bold h-auto p-2 border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none bg-transparent"
          />
          
          {/* Action Buttons - Simplified */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="w-4 h-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export (PDF / CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPDFModal(true)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Custom PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPrintModal(true)}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Label
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleStartNewFormula}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start New
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewHistory}>
                  <History className="w-4 h-4 mr-2" />
                  View History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              onClick={handleSaveFormula}
              disabled={isSaving}
              size="sm"
              className={`${modeColors.primaryBtnClasses} text-white`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Cleaner Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
      >
        {/* Left Column - Main Content (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <Tabs defaultValue="formulation" className="w-full">
              <CardHeader className="pb-3 px-3 sm:px-6">
                <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-slate-100 gap-0.5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="formulation" className={`text-[10px] sm:text-xs py-1.5 sm:py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 ${modeColors.tabsTriggerActive}`}>
                          <Beaker className="w-3 h-3" />
                          <span className="hidden sm:inline">Formula</span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="sm:hidden"><p>Formula</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="instructions" className={`text-[10px] sm:text-xs py-1.5 sm:py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 ${modeColors.tabsTriggerActive}`}>
                          <FileText className="w-3 h-3" />
                          <span className="hidden sm:inline">Steps</span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="sm:hidden"><p>Steps</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="safety" className={`text-[10px] sm:text-xs py-1.5 sm:py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 ${modeColors.tabsTriggerActive}`}>
                          <ShieldCheck className="w-3 h-3" />
                          <span className="hidden sm:inline">Safety</span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="sm:hidden"><p>Safety</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="sustainability" className={`text-[10px] sm:text-xs py-1.5 sm:py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 ${modeColors.tabsTriggerActive}`}>
                          <Leaf className="w-3 h-3" />
                          <span className="hidden sm:inline">Impact</span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="sm:hidden"><p>Impact</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="compliance" className={`text-[10px] sm:text-xs py-1.5 sm:py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 ${modeColors.tabsTriggerActive}`}>
                          <AlertTriangle className="w-3 h-3" />
                          <span className="hidden sm:inline">Comply</span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="sm:hidden"><p>Compliance</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="suppliers" className={`text-[10px] sm:text-xs py-1.5 sm:py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 ${modeColors.tabsTriggerActive}`}>
                          <DollarSign className="w-3 h-3" />
                          <span className="hidden sm:inline">Suppliers</span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="sm:hidden"><p>Suppliers</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TabsList>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <TabsContent value="formulation" className="mt-0 space-y-6">
                  {/* Batch Calculator - Simplified */}
                  <Card className="bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Calculator className={`w-4 h-4 ${modeColors.primaryIconClasses}`}/>
                        <CardTitle className="text-base">Batch Size</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          placeholder="100"
                          value={batchSize}
                          onChange={(e) => setBatchSize(parseFloat(e.target.value) || 0)}
                          className="flex-1 text-base"
                        />
                        <Select value={batchUnit} onValueChange={setBatchUnit}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lb">lb</SelectItem>
                            <SelectItem value="ml">mL</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                          </SelectContent>
                        </Select>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-slate-500">
                                        <Info className="w-4 h-4"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs text-sm">
                                    <p>Changing the unit will automatically update ingredient amounts and mixing instructions.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Percentage - Prominent Display */}
                  <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    Math.abs(totalPercentage - 100) < 0.01
                      ? `${modeColors.successDisplayBg} ${modeColors.successDisplayBorder}`
                      : `${modeColors.warningDisplayBg} ${modeColors.warningDisplayBorder}`
                  }`}>
                    <span className="font-medium text-sm">Total Percentage</span>
                    <span className={`text-2xl font-bold ${
                      Math.abs(totalPercentage - 100) < 0.01
                        ? modeColors.successDisplayText
                        : modeColors.warningDisplayText
                    }`}>
                      {totalPercentage.toFixed(2)}%
                    </span>
                  </div>

                  {/* Ingredient Search */}
                  <div className="relative" ref={ingredientSearchRef}>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Search to add ingredients..."
                          value={ingredientSearchTerm}
                          onChange={(e) => setIngredientSearchTerm(e.target.value)}
                          className="pl-10 h-11"
                        />
                        {isSearchingIngredients && <Loader2 className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${modeColors.loaderIcon} animate-spin`} />}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowIngredientBrowser(true)}
                        className="h-11 px-4"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Browse
                      </Button>
                    </div>
                    
                    <AnimatePresence>
                      {showIngredientSuggestions && ingredientSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl mt-1 max-h-80 overflow-y-auto z-50"
                        >
                          {ingredientSuggestions.map((ingredient, index) => (
                            <div
                              key={ingredient.name + index}
                              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                              onClick={() => addIngredientFromSearch(ingredient)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-slate-900">{ingredient.name}</span>
                                    {ingredient.category && (
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                                        {ingredient.category.replace(/_/g, ' ')}
                                      </Badge>
                                    )}
                                    {ingredient.safety_level && (
                                      <Badge className={`text-[10px] px-1.5 py-0 ${
                                        ingredient.safety_level === 'safe' ? 'bg-green-100 text-green-700' :
                                        ingredient.safety_level === 'moderate' ? 'bg-amber-100 text-amber-700' :
                                        ingredient.safety_level === 'hazardous' ? 'bg-red-100 text-red-700' :
                                        'bg-slate-100 text-slate-600'
                                      }`}>
                                        {ingredient.safety_level === 'safe' ? '✓ Safe' : 
                                         ingredient.safety_level === 'moderate' ? '⚠ Moderate' :
                                         ingredient.safety_level === 'hazardous' ? '⚠ Caution' : ingredient.safety_level}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                    {ingredient.function_description || 'General purpose ingredient'}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                                    {ingredient.typical_percentage_range && (
                                      <span className="flex items-center gap-1">
                                        <Droplets className="w-3 h-3" />
                                        Typical: {ingredient.typical_percentage_range}
                                      </span>
                                    )}
                                    {ingredient.common_uses && (
                                      <span className="truncate">
                                        Uses: {Array.isArray(ingredient.common_uses) ? ingredient.common_uses.slice(0, 2).join(', ') : ingredient.common_uses}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" className={`${modeColors.primaryIconClasses} flex-shrink-0 h-8 w-8 p-0`}>
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Ingredients List - Cleaner Design */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                        Ingredients ({formula.ingredients?.length || 0})
                      </h3>
                      <Button onClick={addIngredient} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {formula.ingredients.map((ing, i) => (
                        <Card key={i} className="p-2 sm:p-3 border border-slate-200 hover:border-slate-300 transition-all">
                          {/* Mobile Layout */}
                          <div className="sm:hidden space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <Input
                                value={ing.chemical_name}
                                onChange={(e) => updateIngredient(i, 'chemical_name', e.target.value)}
                                placeholder="Ingredient Name"
                                className="h-8 text-sm flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeIngredient(i)}
                                className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 flex-shrink-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                value={ing.purpose}
                                onChange={(e) => updateIngredient(i, 'purpose', e.target.value)}
                                placeholder="Purpose"
                                className="h-8 text-xs flex-1"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                value={ing.percentage}
                                onChange={(e) => updateIngredient(i, 'percentage', parseFloat(e.target.value) || 0)}
                                className="h-8 text-xs w-16"
                                placeholder="%"
                              />
                              <span className="text-xs font-medium text-slate-600 w-14 text-right">
                                {ingredientAmounts[i].value}{ingredientAmounts[i].unit}
                              </span>
                            </div>
                          </div>
                          {/* Desktop Layout */}
                          <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-4">
                              <Input
                                value={ing.chemical_name}
                                onChange={(e) => updateIngredient(i, 'chemical_name', e.target.value)}
                                placeholder="Ingredient Name"
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                value={ing.purpose}
                                onChange={(e) => updateIngredient(i, 'purpose', e.target.value)}
                                placeholder="Purpose"
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={ing.percentage}
                                onChange={(e) => updateIngredient(i, 'percentage', parseFloat(e.target.value) || 0)}
                                className="h-9 text-sm"
                                placeholder="%"
                              />
                            </div>
                            <div className="col-span-2 text-right text-xs font-medium text-slate-600">
                              {ingredientAmounts[i].value} {ingredientAmounts[i].unit}
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeIngredient(i)}
                                className="h-9 w-9 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* AI Suggestions Panel */}
                  <AISuggestionsPanel
                    formula={formula}
                    productType={productType}
                    businessMode={businessMode}
                    onAddIngredient={(newIng) => {
                      setFormula(prev => ({
                        ...prev,
                        ingredients: [...prev.ingredients, newIng]
                      }));
                    }}
                  />

                  {/* AI Formula Optimizer */}
                  <FormulaOptimizer 
                    formula={formula}
                    businessMode={businessMode}
                    onApplyOptimization={(newIngredients) => {
                      setFormula(prev => ({ ...prev, ingredients: newIngredients }));
                    }}
                  />

                  {/* Enhancement Options */}
                  <Card className={`${modeColors.accentCardBg} ${modeColors.accentCardBorder} border`}>
                    <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                      <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" />
                        Smart Enhancements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6">
                      <div className="p-2 sm:p-3 bg-white/60 rounded-lg border border-slate-200">
                        <Button 
                          onClick={() => handleAdvancedOption('preservative')} 
                          disabled={updatingOption !== null} 
                          variant="outline"
                          size="sm"
                          className="w-full justify-start mb-1.5 sm:mb-2 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          {updatingOption === 'preservative' ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin"/> : <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"/>}
                          Suggest Preservative
                        </Button>
                        <p className="text-[10px] sm:text-xs text-slate-500">Adds a preservative to extend shelf life and prevent microbial growth.</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-white/60 rounded-lg border border-slate-200">
                        <Button 
                          onClick={() => handleAdvancedOption('ph_adjuster')} 
                          disabled={updatingOption !== null} 
                          variant="outline"
                          size="sm"
                          className="w-full justify-start mb-1.5 sm:mb-2 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          {updatingOption === 'ph_adjuster' ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin"/> : <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"/>}
                          Suggest pH Adjuster
                        </Button>
                        <p className="text-[10px] sm:text-xs text-slate-500">Balances formula acidity for skin compatibility and stability.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="instructions" className="mt-0">
                  <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Beaker className={`w-5 h-5 ${modeColors.primaryIconClasses}`} />
                        Mixing Instructions
                      </h3>
                      <div className={`mb-4 p-3 ${modeColors.accentCardBg} ${modeColors.accentCardBorder} rounded-lg`}>
                        <p className={`text-sm ${modeColors.accentCardText}`}>
                          <strong>Note:</strong> Instructions automatically update based on your batch size ({batchSize} {batchUnit}).
                        </p>
                      </div>
                      {dynamicInstructions && dynamicInstructions.map ? (
                        dynamicInstructions.map((phase, i) => (
                          <div key={i} className="mb-6 p-3 sm:p-4 bg-slate-50 rounded-lg">
                            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                              <span className={`w-6 h-6 ${modeColors.primaryBgClasses} text-white rounded-full flex items-center justify-center text-sm`}>{i + 1}</span>
                              {phase.phase}
                            </h4>
                            <ul className="list-disc pl-6 sm:pl-8 space-y-2">
                              {phase.steps && phase.steps.map ? phase.steps.map((step, j) => (
                                <li key={j} className="text-slate-700 text-sm sm:text-base">{step}</li>
                              )) : null}
                            </ul>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic text-sm sm:text-base">No mixing instructions available for this formula.</p>
                      )}
                    </div>
                </TabsContent>

                <TabsContent value="safety" className="mt-0 space-y-6">
                  {/* Ingredient Interactions */}
                  <IngredientInteractionAnalyzer 
                    ingredients={formula.ingredients} 
                    productType={productType}
                  />

                  {/* Hazard Alternatives */}
                  <HazardAlternativesPanel
                    ingredients={formula.ingredients}
                    onReplaceIngredient={(index, newIngredient) => {
                      const newIngredients = [...formula.ingredients];
                      newIngredients[index] = newIngredient;
                      setFormula(prev => ({ ...prev, ingredients: newIngredients }));
                    }}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-2 border-emerald-200">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                          <ShieldCheck className={`w-5 h-5 ${modeColors.primaryIconClasses}`}/>
                          Safety Precautions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {formula.safety_precautions && formula.safety_precautions.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm sm:text-base">
                            {formula.safety_precautions.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        ) : (
                          <p className="text-slate-500 italic text-sm sm:text-base">No specific safety precautions listed.</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-200">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                          <Info className={`w-5 h-5 ${modeColors.primaryIconClasses}`}/>
                          Formula Properties
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-slate-500"/>
                            <strong className="text-slate-700 text-sm">Target pH:</strong>
                          </div>
                          <span className="text-slate-600 text-sm">{formula.properties?.ph_level || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Beaker className="w-4 h-4 text-slate-500"/>
                            <strong className="text-slate-700 text-sm">Difficulty:</strong>
                          </div>
                          <span className="text-slate-600 text-sm">{formula.properties?.difficulty || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-slate-500"/>
                            <strong className="text-slate-700 text-sm">Shelf Life:</strong>
                          </div>
                          <span className="text-slate-600 text-sm">{formula.properties?.shelf_life || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500"/>
                            <strong className="text-slate-700 text-sm">Time to Make:</strong>
                          </div>
                          <span className="text-slate-600 text-sm">{formula.properties?.time_to_make || 'Not specified'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="sustainability" className="mt-0 space-y-6">
                  {/* Individual Ingredient Sustainability */}
                  <IngredientSustainabilityScore ingredients={formula.ingredients} />
                  
                  {/* Overall Formula Sustainability */}
                  <Suspense fallback={<div className="flex items-center justify-center p-4"><Loader2 className="w-6 h-6 animate-spin mr-2"/>Loading sustainability insights...</div>}>
                    <SustainabilityAnalyzer formula={formula} />
                  </Suspense>
                </TabsContent>
                
                <TabsContent value="compliance" className="mt-0 space-y-6">
                   <Suspense fallback={<div className="flex items-center justify-center p-4"><Loader2 className="w-6 h-6 animate-spin mr-2"/>Loading compliance checks...</div>}>
                     <ComplianceChecker formula={formula} />
                   </Suspense>
                   <RegulatoryScanner 
                     ingredients={formula.ingredients} 
                     onClose={() => setShowRegulatoryCheck(false)} 
                   />
                </TabsContent>
                
                <TabsContent value="suppliers" className="mt-0 space-y-6">
                  <SupplierManager />
                  
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-base">Ingredient Costs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {formula.ingredients.map((ing, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-900">{ing.chemical_name}</p>
                            <p className="text-xs text-slate-600">{ing.percentage}% | {ingredientAmounts[idx]?.value || '-'} {ingredientAmounts[idx]?.unit || ''}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedIngredientForSupplier(ing.chemical_name);
                              setShowSupplierModal(true);
                            }}
                          >
                            Link Suppliers
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column - Live Analysis (1/3 width) */}
        <div className="lg:col-span-1">
          <FormulaAssistant 
            formula={formula}
            productType={productType}
            businessMode={businessMode}
          />
        </div>
      </motion.div>

      {/* Subtle Feedback Notification - Bottom Right */}
      <AnimatePresence>
        {showFeedbackNotification && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm"
          >
            <Card className={`bg-white/95 backdrop-blur-sm border ${modeColors.accentCardBorder} shadow-lg`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${modeColors.primaryAccentGradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">
                      How was this action?
                    </h4>
                    <p className="text-slate-600 text-xs mb-3">
                      Share your experience and earn 5 bonus points
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setShowRatingModal(true)}
                        className={`${modeColors.primaryBtnClasses} text-white text-xs px-3 py-1 h-7`}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Give Feedback
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowFeedbackNotification(false)}
                        className="text-slate-500 hover:text-slate-700 text-xs px-2 py-1 h-7"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
            </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <PDFExportModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        formula={formula}
        businessMode={businessMode}
        onActionComplete={handleActionComplete}
      />
      <PrintLabelModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        formula={formula}
        businessMode={businessMode}
        onActionComplete={handleActionComplete}
      />

      {/* Rating Modal - Now Optional */}
      <Suspense fallback={null}>
        {showRatingModal && (
          <RatingModal
            isOpen={showRatingModal}
            onClose={() => setShowRatingModal(false)}
            onSubmit={handleFeedbackSubmit}
            featureType="formula"
            title="Rate Your Experience"
            description="Help us improve by rating your experience with this feature"
          />
        )}
      </Suspense>

      {/* Export Dialog */}
      <FormulaExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        formula={formula}
      />

      {/* Ingredient Browser Modal */}
      <IngredientBrowser
        isOpen={showIngredientBrowser}
        onClose={() => setShowIngredientBrowser(false)}
        productType={productType}
        currentIngredients={formula.ingredients}
        onSelectIngredient={(newIng) => {
          setFormula(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, newIng]
          }));
          setShowIngredientBrowser(false);
        }}
      />

      {/* Supplier Link Modal */}
      {selectedIngredientForSupplier && (
        <SupplierLinkModal
          isOpen={showSupplierModal}
          onClose={() => setShowSupplierModal(false)}
          ingredientName={selectedIngredientForSupplier}
        />
      )}
    </div>
  );
}