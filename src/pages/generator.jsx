import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import AuthGate from "../components/auth/AuthGate";
import AuthContext from "../components/auth/AuthContext";
import { Check } from "lucide-react";
import { User } from "@/entities/User";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import GeneratorDashboard from "../components/generator/GeneratorDashboard";
import ProductTypeCatalog from "../components/generator/ProductTypeCatalog";
import ProductDescriptionStep from "../components/generator/ProductDescriptionStep";
import FormulaOptionsStep from "../components/generator/FormulaOptionsStep";
import FormulaEditor from "../components/generator/FormulaEditor";
import SmartStartWizard from "../components/generator/SmartStartWizard";
import { sendFeatureUsageEmail } from "../components/shared/featureNotifications";

export default function Generator() {
  const { user, refreshUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [businessMode, setBusinessMode] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [productDescription, setProductDescription] = useState('');
  const [formulaOptions, setFormulaOptions] = useState([]);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPointsNotification, setShowPointsNotification] = useState(false);
  const [showSmartStart, setShowSmartStart] = useState(false);

  const awardPoints = async (points, reason) => {
    try {
      const currentUser = await User.me();
      if (!currentUser || !currentUser.id) {
        return false;
      }
      const currentPoints = currentUser.reward_points || 0;
      const newPoints = currentPoints + points;

      await User.updateMyUserData({ reward_points: newPoints });
      await refreshUser();

      setShowPointsNotification(true);
      setTimeout(() => setShowPointsNotification(false), 4000);

      return true;
    } catch (error) {
      console.error('Failed to award points:', error);
      return false;
    }
  };

  const handleModeSelected = (mode) => {
    if (mode === 'smart_start') {
      setShowSmartStart(true);
      return;
    }
    setBusinessMode(mode === 'business');
    setCurrentStep(2);
  };

  const handleSmartStartComplete = ({ productType, description, businessMode: isBusiness }) => {
    setShowSmartStart(false);
    setBusinessMode(isBusiness);
    setSelectedProductType(productType);
    setProductDescription(description);
    setCurrentStep(3);
    // Auto-trigger generation with the built description
    handleGenerateOptions(description, productType, isBusiness);
  };

  const handleProductTypeSelected = (product) => {
    setSelectedProductType(product);
    setCurrentStep(3);
  };

  const handleGenerateOptions = async (description, productTypeOverride, businessModeOverride) => {
    setProductDescription(description);
    setIsGenerating(true);
    const activeProductType = productTypeOverride || selectedProductType;
    const isBusinessMode = businessModeOverride !== undefined ? businessModeOverride : businessMode;

    try {
      let prompt;

      if (isBusinessMode) {
        // BUSINESS MODE - Professional, regulatory-focused, scalable
        prompt = `You are a senior cosmetic formulation chemist with 20+ years experience in commercial product development.

  PRODUCT REQUEST: "${activeProductType.name}" - "${description}"

  MODE: COMMERCIAL/BUSINESS FORMULATION
  This formula will be manufactured at scale and sold commercially. All requirements must meet industry standards.

  Create 3 DISTINCT commercial-grade formula variants:

  1. MARKET LEADER (Premium positioning)
  - High-performance active ingredients at optimal concentrations
  - Premium textures and sensorial experience
  - Targeting high-end retail ($30-80 price point)

  2. MASS MARKET (Volume production)
  - Cost-optimized for large-scale manufacturing
  - Proven, stable formulations with long shelf life
  - Targeting drugstore/supermarket channels ($8-20 price point)

  3. CLEAN/SUSTAINABLE (Eco-certification ready)
  - COSMOS/ECOCERT compliant ingredient selection
  - Biodegradable, palm-free or certified sustainable palm
  - Minimal packaging impact considerations

  FOR EACH VARIANT PROVIDE:
  - Product name (market-ready brand name)
  - Positioning statement (1 sentence)
  - Key marketing claims (3 substantiated claims)
  - COMPLETE ingredient list using INCI NOMENCLATURE with:
  * Exact percentages (must total 100%)
  * Function of each ingredient
  * Include: preservative system, pH adjusters, chelating agents as needed
  - Cost level: low/medium/high (with estimated cost per kg)
  - Difficulty: intermediate/advanced/professional
  - Regulatory notes: Any restrictions in EU/US/Asia markets

  CRITICAL: Use proper INCI names (e.g., "Aqua" not "Water", "Sodium Laureth Sulfate" not "Detergent"). Include CAS numbers for key actives.`;
      } else {
        // INDIVIDUAL MODE - Simple, beginner-friendly, home-made
        prompt = `You are a friendly DIY cosmetics teacher helping a beginner make their first homemade product.

  PRODUCT REQUEST: "${activeProductType.name}" - "${description}"

  MODE: HOME/DIY FORMULATION
  This is for personal use, made in a home kitchen with easily available ingredients.

  Create 3 SIMPLE, BEGINNER-FRIENDLY formula variants:

  1. SUPER EASY (First-timer friendly)
  - Maximum 5-6 ingredients
  - No heating required if possible
  - Ingredients from grocery store or Amazon
  - Ready in under 15 minutes

  2. NATURAL & GENTLE
  - Focus on natural, recognizable ingredients
  - Plant-based, essential oil scented
  - Good for sensitive skin
  - Common health food store ingredients

  3. BUDGET SAVER
  - Most affordable option
  - Uses pantry staples where possible
  - Best value for money
  - Bulk-buy friendly ingredients

  FOR EACH VARIANT PROVIDE:
  - Fun, descriptive name (like "Kitchen Spa Cream")
  - Simple description (1 sentence, no jargon)
  - Benefits in plain English (3 points)
  - SIMPLE ingredient list with:
  * Common names (e.g., "Distilled Water" not "Aqua")
  * Percentages that total 100%
  * Where to buy each ingredient
  - Cost level: low/medium/high
  - Difficulty: beginner/intermediate
  - Simple tips for making it at home`;
      }

      prompt += `

  Return as JSON with this exact structure:
  {
  "formulas": [
  {
    "variant": "string",
    "name": "string", 
    "description": "string",
    "benefits": ["string", "string", "string"],
    "ingredients": [
      {"chemical_name": "string", "percentage": number, "purpose": "string"}
    ],
    "cost_level": "low|medium|high",
    "difficulty": "beginner|intermediate|advanced|professional"
  }
  ]
  }`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            formulas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variant: { type: "string" },
                  name: { type: "string" },
                  description: { type: "string" },
                  benefits: { type: "array", items: { type: "string" } },
                  ingredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        chemical_name: { type: "string" },
                        percentage: { type: "number" },
                        purpose: { type: "string" }
                      }
                    }
                  },
                  cost_level: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            }
          },
          required: ["formulas"]
        }
      });

      if (response && response.formulas && response.formulas.length >= 3) {
        setFormulaOptions(response.formulas);
        setCurrentStep(4);
        await awardPoints(10, "Formula options generated");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error('Failed to generate formula options:', error);
      alert('Failed to generate formula options. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormulaSelected = async (formula) => {
    setIsGenerating(true);

    try {
      // Generate full recipe details for the selected formula
      let prompt;

      if (businessMode) {
        prompt = `You are a senior cosmetic formulation chemist. Expand this ${formula.variant} commercial formula for "${productDescription}" into complete manufacturing documentation.

  Ingredients (already defined):
  ${formula.ingredients.map(ing => `- ${ing.chemical_name}: ${ing.percentage}% (${ing.purpose})`).join('\n')}

  Provide PROFESSIONAL MANUFACTURING DOCUMENTATION:

  1. MANUFACTURING INSTRUCTIONS (organized by phases):
  - Phase A (Water Phase): temperatures, order of addition, mixing speeds
  - Phase B (Oil Phase): heating requirements, emulsification parameters  
  - Phase C (Heat-sensitive actives): cooling temperatures, addition sequence
  - Phase D (Adjustments): pH adjustment, preservative addition, QC checks
  Include specific temperatures (°C), mixing times (minutes), and equipment notes.

  2. PRODUCT SPECIFICATIONS:
  - Target pH range (e.g., 5.0-5.5)
  - Viscosity range (cPs)
  - Specific gravity
  - Appearance description
  - Odor profile
  - Stability: shelf life and storage conditions

  3. QUALITY CONTROL:
  - In-process checks
  - Final product testing requirements
  - Microbiological limits

  4. SAFETY & COMPLIANCE:
  - GHS hazard statements for production
  - Required PPE for manufacturing
  - MSDS considerations
  - Regulatory notes (EU allergens, FDA restrictions)

  5. SUSTAINABILITY METRICS:
  - Biodegradability assessment
  - Carbon footprint estimate
  - Sustainability score (0-100)

  Return as JSON.`;
      } else {
        prompt = `You are a friendly DIY teacher. Expand this ${formula.variant} homemade recipe for "${productDescription}" into easy-to-follow instructions.

  Ingredients (already defined):
  ${formula.ingredients.map(ing => `- ${ing.chemical_name}: ${ing.percentage}% (${ing.purpose})`).join('\n')}

  Provide BEGINNER-FRIENDLY INSTRUCTIONS:

  1. SIMPLE STEP-BY-STEP INSTRUCTIONS (organized by phases):
  - Use plain language, no technical jargon
  - Include helpful tips like "stir until smooth"
  - Mention common kitchen equipment (measuring cups, bowls, whisk)
  - Add timing estimates ("mix for about 2 minutes")

  2. WHAT TO EXPECT:
  - What the final product should look and feel like
  - Approximate pH (if relevant, explain what this means)
  - How long it will last (shelf life)
  - How long it takes to make
  - Texture/consistency description

  3. SAFETY TIPS:
  - Simple safety precautions in plain English
  - Storage recommendations
  - When to discard

  4. TROUBLESHOOTING:
  - Common problems and how to fix them
  - "If it looks too thick, add a little more water"

  5. ECO-FRIENDLINESS:
  - Simple sustainability score (0-100)
  - Tips for eco-friendly disposal

  Return as JSON.`;
      }

      prompt += `

  Use this JSON structure:
  {
  "instructions": [
  {"phase": "Phase Name", "steps": ["step 1", "step 2"]}
  ],
  "properties": {
  "ph_level": "string",
  "shelf_life": "string", 
  "difficulty": "string",
  "time_to_make": "string"
  },
  "safety_precautions": ["string"],
  "sustainability_score": number
  }`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            instructions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  steps: { type: "array", items: { type: "string" } }
                }
              }
            },
            properties: {
              type: "object",
              properties: {
                ph_level: { type: "string" },
                shelf_life: { type: "string" },
                difficulty: { type: "string" },
                time_to_make: { type: "string" }
              }
            },
            safety_precautions: { type: "array", items: { type: "string" } },
            sustainability_score: { type: "number" }
          }
        }
      });

      const fullRecipe = {
        name: formula.name,
        description: formula.description,
        ingredients: formula.ingredients,
        instructions: response.instructions || [],
        properties: response.properties || {},
        safety_precautions: response.safety_precautions || [],
        sustainability_score: response.sustainability_score || 70,
        product_type: selectedProductType.id,
        business_mode: businessMode
      };

      setSelectedFormula(fullRecipe);
      setCurrentStep(5);
      await awardPoints(15, "Full formula generated");

      // Track formula creation
      base44.analytics.track({
        eventName: 'formula_created',
        properties: {
          product_type: selectedProductType.id,
          business_mode: businessMode,
          ingredient_count: fullRecipe.ingredients.length,
          formula_variant: formula.variant || 'custom'
        }
      });

      // Send email notification
      if (user) {
        sendFeatureUsageEmail(user, 'formula', {
          formulaName: fullRecipe.name,
          productType: selectedProductType?.name,
          ingredientCount: fullRecipe.ingredients?.length || 0,
          businessMode
        });
      }
    } catch (error) {
      console.error('Failed to generate full formula:', error);
      alert('Failed to generate full formula details. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGenerator = () => {
    setCurrentStep(1);
    setBusinessMode(false);
    setSelectedProductType(null);
    setProductDescription('');
    setFormulaOptions([]);
    setSelectedFormula(null);
    setShowSmartStart(false);
    navigate(createPageUrl('generator'), { replace: true });
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <AuthGate
          featureName="Formula Generator"
          featureDescription="Create custom formulas for cleaning products, skincare, and more. Log in to save your recipes and track your progress."
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/20 overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6b075fc5a_undraw_creative-experiment_bzae.png"
          alt="Formula Generator Watermark"
          className="w-1/2 max-w-xl h-auto opacity-5 select-none"
        />
      </div>
      {/* Serum bottles watermark */}
      <div className="absolute top-20 left-0 w-64 h-64 opacity-5 pointer-events-none hidden lg:block">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/71d10cfe3_bottles-with-serum-or-oil-2026-01-07-01-31-15-utc.jpg"
          alt=""
          className="w-full h-full object-cover select-none rounded-full"
        />
      </div>
      {/* Cosmetics on wooden background watermark */}
      <div className="absolute bottom-20 right-0 w-72 h-72 opacity-5 pointer-events-none hidden lg:block">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/7e24c77e6_beautiful-composition-with-cosmetics-on-wooden-bac-2026-02-05-20-53-27-utc.jpg"
          alt=""
          className="w-full h-full object-cover select-none"
        />
      </div>

      {/* Mode Indicator Badge - Top Right - Fixed Position */}
      {currentStep > 1 && (
        <div className="fixed top-24 right-6 z-50">
          <div className={`px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border-2 flex items-center gap-2 ${
            businessMode 
              ? 'bg-violet-100/90 border-violet-300 text-violet-800' 
              : 'bg-teal-100/90 border-teal-300 text-teal-800'
          }`}>
            {businessMode ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-sm">Business Mode</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-semibold text-sm">Individual Mode</span>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="relative z-10">
        <div className="min-h-screen py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto relative z-10">
            {/* Show points notification */}
            <AnimatePresence>
              {showPointsNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 mb-6 flex justify-center"
                >
                  <div className="bg-green-100 border border-green-300 rounded-lg px-4 py-2 flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+</span>
                    </div>
                    <span className="text-green-800 font-semibold text-sm">
                      Points earned! Total: {user.reward_points || 0} points
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Stepper */}
            {currentStep > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center gap-2 sm:gap-4 mb-8 md:mb-12"
              >
                {[
                  { step: 2, label: 'Product Type' },
                  { step: 3, label: 'Describe Product' },
                  { step: 4, label: 'Choose Formula' },
                  { step: 5, label: 'Customize' }
                ].map(({ step, label }, index) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                          currentStep >= step
                            ? businessMode
                              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg scale-105"
                              : "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg scale-105"
                        : "bg-white text-slate-500 border-2 border-slate-200 shadow-sm"
                        }`}
                      >
                        {currentStep > step ? <Check className="w-5 h-5"/> : index + 1}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold max-w-[60px] sm:max-w-none">
                        {label}
                      </span>
                    </div>
                    {index < 3 && (
                      <div className={`flex-1 h-0.5 rounded-full max-w-12 sm:max-w-24 ${
                          currentStep > step
                            ? businessMode
                              ? 'bg-gradient-to-r from-violet-600 to-purple-600'
                              : 'bg-gradient-to-r from-teal-600 to-cyan-600'
                            : 'bg-slate-200'
                        } transition-all duration-500`}></div>
                    )}
                  </React.Fragment>
                ))}
              </motion.div>
            )}

            {/* Smart Start Wizard */}
            {showSmartStart && (
              <SmartStartWizard
                onComplete={handleSmartStartComplete}
                onBack={() => setShowSmartStart(false)}
              />
            )}

            {/* Step 1: Dashboard */}
            {currentStep === 1 && !showSmartStart && (
              <GeneratorDashboard
                onModeSelect={handleModeSelected}
                onFormulaSelect={(formula) => {
                  setBusinessMode(formula.is_business_mode);
                  setSelectedFormula(formula.full_recipe_data || formula);
                  setCurrentStep(5);
                }}
              />
            )}

            {/* Step 2: Product Type Catalog */}
            {currentStep === 2 && (
              <ProductTypeCatalog
                businessMode={businessMode}
                onBack={resetGenerator}
                onSelectProductType={handleProductTypeSelected}
              />
            )}

            {/* Step 3: Product Description */}
            {currentStep === 3 && (
              <ProductDescriptionStep
                businessMode={businessMode}
                productType={selectedProductType}
                onBack={() => setCurrentStep(2)}
                onGenerateOptions={handleGenerateOptions}
                isGenerating={isGenerating}
              />
            )}

            {/* Step 4: Formula Options */}
            {currentStep === 4 && (
              <FormulaOptionsStep
                businessMode={businessMode}
                formulaOptions={formulaOptions}
                onBack={() => setCurrentStep(3)}
                onSelectFormula={handleFormulaSelected}
                isGenerating={isGenerating}
              />
            )}

            {/* Step 5: Formula Editor */}
            {currentStep === 5 && selectedFormula && (
              <FormulaEditor
                recipe={selectedFormula}
                productType={selectedProductType?.id || selectedFormula.product_type}
                businessMode={businessMode}
                isUpdate={false}
                onBack={() => setCurrentStep(4)}
                onResetGenerator={resetGenerator}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}