import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { 
  ArrowLeft, ChevronRight, Sparkles, DollarSign, 
  GraduationCap, Leaf, Clock, Beaker, Info, CheckCircle2, ShieldCheck, Crown, AlertTriangle
} from "lucide-react";
import { InvokeLLM } from "@/integrations/Core";
import { base44 } from '@/api/base44Client';
import ComplianceUpsellModal from "./ComplianceUpsellModal";
import { analyzeAndCreateAlerts } from '../safety/safetyAlertUtils';

// Fallback recipe templates based on product type and ingredients
const generateFallbackRecipes = (productType, ingredients) => {
  const safeProductType = productType || 'general product';
  const ingredientNames = ingredients.map(i => i.name || i.chemical_name || 'Unknown ingredient');
  
  // Base recipes that work with most ingredient combinations
  const baseRecipes = [
    {
      name: `Eco-Friendly ${safeProductType.replace(/_/g, ' ')}`,
      style: "eco",
      description: "A natural, sustainable formula emphasizing eco-friendly ingredients and minimal environmental impact.",
      ingredients: [
        { chemical_name: "Water", percentage: 70.0, purpose: "Base solvent" },
        { chemical_name: ingredientNames[0] || "Natural Surfactant", percentage: 15.0, purpose: "Primary active ingredient" },
        { chemical_name: ingredientNames[1] || "Glycerin", percentage: 10.0, purpose: "Moisturizer and stabilizer" },
        { chemical_name: ingredientNames[2] || "Citric Acid", percentage: 3.0, purpose: "pH adjuster" },
        { chemical_name: "Essential Oil Blend", percentage: 2.0, purpose: "Natural fragrance" }
      ],
      instructions: [
        { 
          phase: "Phase A: Base Preparation", 
          steps: [
            "Heat water to 60°C in a clean stainless steel container",
            "Add the primary active ingredient while stirring gently",
            "Mix until completely dissolved"
          ] 
        },
        { 
          phase: "Phase B: Stabilization", 
          steps: [
            "Add glycerin slowly while maintaining temperature",
            "Adjust pH using citric acid solution",
            "Cool mixture to 40°C before adding essential oils",
            "Mix thoroughly and allow to cool to room temperature"
          ] 
        }
      ],
      properties: {
        ph_level: "6.0 - 7.0",
        shelf_life: "6-8 months",
        difficulty: "Beginner",
        time_to_make: "20 minutes"
      },
      safety_precautions: [
        "Wear safety glasses and gloves during preparation",
        "Ensure good ventilation when heating ingredients",
        "Test pH before use and adjust if necessary",
        "Store in a cool, dry place away from direct sunlight"
      ]
    },
    {
      name: `Budget-Friendly ${safeProductType.replace(/_/g, ' ')}`,
      style: "budget",
      description: "An economical solution that maximizes effectiveness while minimizing costs, perfect for everyday use.",
      ingredients: [
        { chemical_name: "Water", percentage: 75.0, purpose: "Base solvent" },
        { chemical_name: ingredientNames[0] || "Sodium Bicarbonate", percentage: 10.0, purpose: "Active cleaning agent" },
        { chemical_name: ingredientNames[1] || "White Vinegar", percentage: 8.0, purpose: "Natural preservative and cleaner" },
        { chemical_name: ingredientNames[2] || "Castile Soap", percentage: 5.0, purpose: "Gentle surfactant" },
        { chemical_name: "Salt", percentage: 2.0, purpose: "Stabilizer and thickener" }
      ],
      instructions: [
        { 
          phase: "Phase A: Simple Mixing", 
          steps: [
            "Combine water and salt in a large mixing bowl",
            "Stir until salt is completely dissolved",
            "Add castile soap and mix gently to avoid excessive foaming"
          ] 
        },
        { 
          phase: "Phase B: Final Assembly", 
          steps: [
            "Slowly add vinegar while stirring continuously",
            "Add the primary active ingredient last",
            "Mix thoroughly and transfer to storage container",
            "Allow to settle for 10 minutes before first use"
          ] 
        }
      ],
      properties: {
        ph_level: "7.0 - 8.0",
        shelf_life: "3-4 months",
        difficulty: "Beginner",
        time_to_make: "10 minutes"
      },
      safety_precautions: [
        "Mix in a well-ventilated area",
        "Do not use on natural stone surfaces",
        "Keep away from children and pets",
        "Shake well before each use"
      ]
    },
    {
      name: `Professional Grade ${safeProductType.replace(/_/g, ' ')}`,
      style: "professional",
      description: "A high-performance, commercial-quality formula designed for demanding applications and professional results.",
      ingredients: [
        { chemical_name: "Deionized Water", percentage: 65.0, purpose: "Ultra-pure solvent base" },
        { chemical_name: ingredientNames[0] || "Advanced Surfactant", percentage: 15.0, purpose: "High-performance cleaning agent" },
        { chemical_name: ingredientNames[1] || "Glycerin", percentage: 8.0, purpose: "Moisturizing and stabilizing agent" },
        { chemical_name: ingredientNames[2] || "Xanthan Gum", percentage: 5.0, purpose: "Professional thickening agent" },
        { chemical_name: "Phenoxyethanol", percentage: 3.0, purpose: "Broad-spectrum preservative" },
        { chemical_name: "Fragrance", percentage: 2.0, purpose: "Professional-grade scent" },
        { chemical_name: "Chelating Agent", percentage: 1.5, purpose: "Water softener and stabilizer" },
        { chemical_name: "Colorant", percentage: 0.5, purpose: "Visual appeal and product identification" }
      ],
      instructions: [
        { 
          phase: "Phase A: Primary Base", 
          steps: [
            "Heat deionized water to 70°C using precise temperature control",
            "Add chelating agent and mix until completely dissolved",
            "Slowly incorporate the advanced surfactant while maintaining temperature"
          ] 
        },
        { 
          phase: "Phase B: Thickening System", 
          steps: [
            "Create a slurry with xanthan gum and small amount of glycerin",
            "Add slurry to the main mixture using high-shear mixing",
            "Continue mixing until uniform consistency is achieved"
          ] 
        },
        { 
          phase: "Phase C: Final Integration", 
          steps: [
            "Cool mixture to 50°C and add preservative system",
            "Add remaining glycerin and mix thoroughly",
            "Cool to 30°C before adding fragrance and colorant",
            "Perform final quality control checks before packaging"
          ] 
        }
      ],
      properties: {
        ph_level: "6.5 - 7.5",
        shelf_life: "12-18 months",
        difficulty: "Advanced",
        time_to_make: "45 minutes"
      },
      safety_precautions: [
        "Use personal protective equipment including safety glasses, gloves, and apron",
        "Ensure proper ventilation throughout the manufacturing process",
        "Monitor temperature carefully to prevent degradation of active ingredients",
        "Conduct pH and stability testing before final packaging",
        "Follow GMP (Good Manufacturing Practice) guidelines",
        "Maintain detailed batch records for traceability"
      ]
    }
  ];

  // Customize recipes based on actual ingredients provided
  return baseRecipes.map(recipe => {
    const customizedIngredients = recipe.ingredients.map((ingredient, index) => {
      if (index < ingredientNames.length && ingredientNames[index]) {
        return {
          ...ingredient,
          chemical_name: ingredientNames[index],
          purpose: ingredients[index]?.purpose || ingredient.purpose
        };
      }
      return ingredient;
    });

    return {
      ...recipe,
      ingredients: customizedIngredients,
      name: recipe.name.replace('general product', safeProductType.replace(/_/g, ' '))
    };
  });
};

const styleMeta = {
  eco: { icon: Leaf, gradient: "from-emerald-500 to-teal-500", label: "Eco-Conscious" },
  budget: { icon: DollarSign, gradient: "from-sky-500 to-cyan-500", label: "Budget-Friendly" },
  professional: { icon: GraduationCap, gradient: "from-violet-500 to-purple-500", label: "Professional Grade" }
};

export default function RecipeGenerator({ 
  ingredients = [],
  productType = "",
  onSelectRecipe, 
  onNext, 
  onBack,
  isLoading,
  businessMode
}) {
  const [recipes, setRecipes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [safetyAlert, setSafetyAlert] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        console.log('User not logged in');
      }
    };
    fetchUser();
  }, []);
  
  // Refactored useEffect to handle isLoading prop from parent
  useEffect(() => {
    if (isLoading) {
      setIsGenerating(true);
      setError(null);
      setRecipes([]);
    } else {
      // Only generate if not currently generating, ingredients exist, and no recipes are loaded yet
      if (!isGenerating && ingredients.length > 0 && recipes.length === 0 && !error) {
        generateRecipes();
      } else if (!isGenerating && ingredients.length > 0 && recipes.length === 0 && error) {
        // If an error occurred and parent stops loading, retry generating
        generateRecipes();
      }
    }
  }, [isLoading, isGenerating, ingredients, recipes, error]); // Depend on isLoading prop and other state for correct logic

  useEffect(() => {
    if (ingredients.length === 0 && !isLoading) {
      setIsGenerating(false);
      setError("No ingredients provided for recipe generation.");
      setRecipes([]); // Clear recipes if ingredients are empty
      setSelectedRecipe(null); // Deselect any chosen recipe
      onSelectRecipe(null); // Notify parent no recipe is selected
    } else if (ingredients.length > 0 && !isLoading && recipes.length === 0 && !error) {
        // Initial generation when ingredients are present and not already generating
        generateRecipes();
    }
  }, [ingredients, isLoading, recipes, error]); // Depend on ingredients and isLoading

  const generateRecipes = async () => {
    setIsGenerating(true);
    setError(null);

    if (!ingredients || ingredients.length === 0) {
      setError("Please add at least one ingredient to generate recipes.");
      setIsGenerating(false);
      return;
    }

    const userIngredientsList = ingredients.map(i => i.name || i.chemical_name || 'Unknown ingredient').join(', ');
    const safeProductType = productType || 'general product';
    
    try {
      // Updated, more robust prompt
      const prompt = `You are a world-class formulation chemist. Your task is to generate three distinct formulas for a "${safeProductType.replace(/_/g, ' ')}" using these key ingredients: ${userIngredientsList}.

You MUST return a single JSON object with a root key "recipes". The value of "recipes" must be an array of exactly three formula objects.
Each formula object must have the following keys: "name", "style" (must be one of "eco", "budget", "professional"), "description", "ingredients", "instructions", "properties", and "safety_precautions".
The "ingredients" array for each formula must contain objects, each with "chemical_name", "percentage", and "purpose".
The sum of all "percentage" values within each formula's "ingredients" array MUST be exactly 100.0.

WRITING THE "instructions" FIELD — follow these professional SOP standards strictly:
- "instructions" is an array of phase objects, each with "phase" (a phase title such as "Phase A: Aqueous Base") and "steps" (an array of sequential, numbered instruction strings).
- Use precise laboratory-grade terminology. Do NOT use casual phrasing like "gather your materials" or "add carefully". Instead say "sanitize and dry all equipment", "incorporate via slow addition with continuous low-shear agitation".
- Separate the procedure into logical phases (e.g., Phase A: Aqueous Base, Phase B: Oil Phase, Phase C: Cool-Down / Actives). If the formula has only one phase, still title it clearly (e.g., "Phase A: Single-Stage Mixing").
- State environmental parameters where relevant: target temperature ranges (e.g., "maintain 70–75°C"), mixing speed (low-shear vs. high-shear), and hold-times for homogeneity (e.g., "hold for 10 minutes with continuous stirring").
- Specify exact quantities in the step text using the ingredient percentages (e.g., "Charge 15.0% of the total batch as [ingredient name]"). The frontend will scale these to the user's batch size, so reference ingredients by name and percentage, not fixed gram values.
- Define the correct order of addition, addition technique (sprinkle, stream, pre-disperse in glycerin, etc.), and any required pre-mix or slurry steps.
- Include in-line quality-assurance checkpoints within steps where appropriate (e.g., "Verify pH is within 5.5–6.5 before proceeding", "Confirm uniform emulsion with no phase separation", "Visually inspect for homogeneity").
- Keep tone objective, instructional, and concise — no conversational filler, no marketing language.

Do not include any text or markdown formatting outside of the main JSON object.`;
      
      const response = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recipes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  style: { type: "string", enum: ["eco", "budget", "professional"] },
                  description: { type: "string" },
                  ingredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        chemical_name: { type: "string" },
                        percentage: { type: "number" },
                        purpose: { type: "string" }
                      },
                      required: ["chemical_name", "percentage", "purpose"]
                    }
                  },
                  instructions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        phase: { type: "string" },
                        steps: { type: "array", items: { type: "string" } }
                      },
                      required: ["phase", "steps"]
                    }
                  },
                  properties: {
                    type: "object",
                    properties: {
                      ph_level: { type: "string" },
                      shelf_life: { type: "string" },
                      difficulty: { type: "string" },
                      time_to_make: { type: "string" }
                    },
                    required: ["ph_level", "shelf_life", "difficulty", "time_to_make"]
                  },
                  safety_precautions: { type: "array", items: { type: "string" } }
                },
                required: ["name", "style", "description", "ingredients", "instructions", "properties", "safety_precautions"]
              }
            }
          },
          required: ["recipes"]
        }
      });
      
      // Enhanced validation
      let validationError = null;
      if (!response) {
        validationError = "AI response was null or undefined.";
      } else if (!response.recipes) {
        validationError = "The 'recipes' key is missing in the AI response.";
      } else if (!Array.isArray(response.recipes)) {
        validationError = "The 'recipes' key is not an array.";
      } else if (response.recipes.length === 0) {
        validationError = "The 'recipes' array is empty.";
      }

      if (validationError) {
        console.warn("AI Response Validation Failed:", validationError, "Response was:", JSON.stringify(response, null, 2));
        throw new Error("AI system returned invalid recipe data");
      }

      // Keep existing validation and normalization logic
      const validatedRecipes = response.recipes.map(recipe => {
          if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
            recipe.ingredients = [];
          }
          
          if (recipe.ingredients.length > 0) {
            const totalPercentage = recipe.ingredients.reduce((acc, ing) => acc + (ing.percentage || 0), 0);
            if (Math.abs(100 - totalPercentage) > 0.1) {
              const diff = 100 - totalPercentage;
              if (recipe.ingredients.length > 0) {
                // Distribute difference to the first ingredient, ensuring it stays non-negative
                recipe.ingredients[0].percentage = Math.max(0, (recipe.ingredients[0].percentage || 0) + diff);
              }
            }
            recipe.ingredients = recipe.ingredients.map(ing => ({
              ...ing, 
              percentage: parseFloat((ing.percentage || 0).toFixed(2))
            }));
          }
          
          return recipe;
        });
      setRecipes(validatedRecipes);

    } catch (err) {
      console.error("AI generation failed, using fallback recipes:", err);
      // Use fallback system when AI fails
      const fallbackRecipes = generateFallbackRecipes(safeProductType, ingredients);
      setRecipes(fallbackRecipes);
      setError("Our AI is experiencing high demand. We've provided our expertly crafted templates for you instead.");
    }

    setIsGenerating(false);
  };
  
  const handleSelectRecipe = async (recipe) => {
    const ingredientsWithDetails = (recipe.ingredients || []).map(ing => {
        const original = ingredients.find(orig => 
          (orig.name && orig.name.toLowerCase() === ing.chemical_name.toLowerCase()) ||
          (orig.chemical_name && orig.chemical_name.toLowerCase() === ing.chemical_name.toLowerCase())
        );
        return {
            ...ing,
            cas_number: original?.cas_number || null
        };
    });

    const fullRecipeData = { ...recipe, ingredients: ingredientsWithDetails, business_mode: businessMode };
    setSelectedRecipe(fullRecipeData);
    onSelectRecipe(fullRecipeData);

    // Check safety profile
    if (user && recipe.ingredients?.length > 0) {
      try {
        const profiles = await base44.entities.SafetyProfile.filter({ is_default: true });
        if (profiles.length > 0) {
          const defaultProfile = profiles[0];
          const ingredientNames = recipe.ingredients.map(i => i.chemical_name);

          const result = await analyzeAndCreateAlerts({
            productName: recipe.name,
            ingredients: ingredientNames,
            alertType: 'formula_creation',
            profileId: defaultProfile.id,
            userEmail: user.email,
            additionalContext: {
              product_type: productType,
              style: recipe.style
            }
          });

          if (result.shouldWarn) {
            setSafetyAlert(result.alert);
          }
        }
      } catch (error) {
        console.error('Safety check failed:', error);
      }
    }
  };
  
  const handleAccordionChange = (value) => {
    if (!value) {
        setSelectedRecipe(null);
        onSelectRecipe(null);
        return;
    }
    const recipe = recipes.find(r => r.name === value);
    if (recipe) {
      handleSelectRecipe(recipe);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Ingredients
        </Button>
        <Badge variant="outline" className="bg-teal-50 text-teal-800 border-teal-300 justify-center py-2">
          {ingredients.length} ingredients selected
        </Badge>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="p-4 sm:p-6 text-center">
            <CardTitle className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xl sm:text-2xl text-slate-800">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" />
              <span>Formula Options</span>
            </CardTitle>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Our expert system has analyzed your ingredients and created three distinct formulation approaches.
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Beaker className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </motion.div>
                  <p className="text-lg sm:text-xl font-medium text-slate-900 mb-2">
                    Generating Professional Formulas...
                  </p>
                  <p className="text-slate-600 text-sm sm:text-base px-4">
                    This may take a few moments. Our system is crafting accurate recipes.
                  </p>
              </div>
            ) : error ? (
                <div className="text-center py-12 sm:py-16 bg-blue-50 rounded-lg border border-blue-200 mx-2 sm:mx-0">
                  <Info className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-blue-800 mb-2">Using Professional Templates</h3>
                  <p className="text-blue-600 text-sm sm:text-base mt-2 max-w-md mx-auto px-4">{error}</p>
                </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <Accordion 
                    type="single" 
                    collapsible 
                    className="w-full space-y-4"
                    onValueChange={handleAccordionChange}
                    value={selectedRecipe?.name || ""} // Pass current selected recipe name to control accordion state
                >
                    {recipes.map((recipe) => {
                        const meta = styleMeta[recipe.style];
                        const isSelected = selectedRecipe?.name === recipe.name;
                        return (
                            <AccordionItem key={recipe.name} value={recipe.name} className="border-none">
                                <AccordionTrigger className={`p-4 rounded-lg shadow-md hover:shadow-lg data-[state=open]:shadow-xl transition-shadow duration-300 ${isSelected ? 'bg-teal-50 ring-2 ring-teal-500' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-4 w-full">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${meta.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                            <meta.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <Badge variant="outline" className="mb-1 bg-white">{meta.label}</Badge>
                                            <h3 className="font-bold text-slate-800 text-base sm:text-lg">{recipe.name}</h3>
                                        </div>
                                        {isSelected && <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0" />}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0 pt-2">
                                  <div className="p-4 sm:p-6 bg-white rounded-b-lg border-x-2 border-b-2 border-slate-100">
                                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
                                          {recipe.description}
                                      </p>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                                        <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">
                                          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                          <span className="truncate">{recipe.properties?.time_to_make || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">
                                          <Beaker className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                          <span className="truncate">pH: {recipe.properties?.ph_level || 'N/A'}</span>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                          <Badge variant="outline" className="text-xs h-fit w-full justify-center py-2">{recipe.properties?.difficulty || 'N/A'}</Badge>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-slate-700">Key Ingredients:</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                          {recipe.ingredients && recipe.ingredients.length > 0 ? (
                                            recipe.ingredients.slice(0, 4).map((ing, index) => (
                                              <Badge key={`${ing.chemical_name}-${index}`} variant="secondary" className="text-xs justify-center py-1 truncate">
                                                {ing.chemical_name}
                                              </Badge>
                                            ))
                                          ) : (
                                            <Badge variant="secondary" className="text-xs justify-center py-1 col-span-2">
                                              No ingredients available
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                  </div>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>

                {/* Safety Alert */}
                {safetyAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border-2 rounded-xl p-4 ${
                      safetyAlert.severity === 'critical' ? 'bg-red-50 border-red-300' :
                      'bg-amber-50 border-amber-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                        safetyAlert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                      }`} />
                      <div className="flex-1">
                        <h4 className={`font-bold mb-1 ${
                          safetyAlert.severity === 'critical' ? 'text-red-900' : 'text-amber-900'
                        }`}>
                          ⚠️ Safety Alert Triggered
                        </h4>
                        <p className={`text-sm mb-2 ${
                          safetyAlert.severity === 'critical' ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          {safetyAlert.alert_message}
                        </p>
                        <Badge className={`${
                          safetyAlert.severity === 'critical' ? 'bg-red-600' : 'bg-amber-600'
                        } text-white text-xs`}>
                          📧 Alert sent to your email
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Compliance Check CTA */}
                {selectedRecipe && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4 sm:p-5"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900 text-sm sm:text-base">Check Regulatory Compliance</h4>
                            <Badge className="bg-amber-100 text-amber-700 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600">
                            Verify your formula meets FDA, EPA, EU & global standards
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowComplianceModal(true)}
                        variant="outline"
                        className="border-purple-300 text-purple-700 hover:bg-purple-100 w-full sm:w-auto"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Check Compliance
                      </Button>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-center pt-6">
                  <Button
                    onClick={onNext}
                    disabled={!selectedRecipe}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg disabled:opacity-50 w-full sm:w-auto px-8 py-3"
                    size="lg"
                  >
                    Customize Formula
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      {/* Compliance Upsell Modal */}
      <ComplianceUpsellModal
        isOpen={showComplianceModal}
        onClose={() => setShowComplianceModal(false)}
        productName={selectedRecipe?.name}
        ingredients={selectedRecipe?.ingredients || []}
      />
    </div>
  );
}