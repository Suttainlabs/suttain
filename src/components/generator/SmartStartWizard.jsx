import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, ArrowRight, Sparkles, Heart, Droplets, Sun,
  Baby, Leaf, Home, Building2, Wallet, Shield,
  Wand2, Scissors, Bath, Pipette, Flower2, Wind,
  Brush, CircleDot, ThermometerSun, Eye, Palette,
  Layers, Timer, Gem, Ban, Rabbit, Recycle, Zap, Check
} from "lucide-react";

const STEPS = [
  {
    id: "goal",
    question: "What do you want to make?",
    subtitle: "Select a product category to get started",
    options: [
      { id: "face_cream", label: "Face Cream / Moisturizer", icon: Heart, desc: "Hydrating creams, serums, lotions", color: "bg-rose-50 text-rose-600" },
      { id: "cleanser", label: "Face Cleanser / Wash", icon: Droplets, desc: "Gentle cleansers, micellar waters", color: "bg-sky-50 text-sky-600" },
      { id: "sunscreen", label: "Sunscreen / SPF", icon: Sun, desc: "Sun protection products", color: "bg-amber-50 text-amber-600" },
      { id: "body_lotion", label: "Body Lotion / Butter", icon: Sparkles, desc: "Rich body moisturizers", color: "bg-violet-50 text-violet-600" },
      { id: "lip_balm", label: "Lip Balm / Lip Care", icon: Flower2, desc: "Lip balms, glosses, treatments", color: "bg-pink-50 text-pink-600" },
      { id: "hair_care", label: "Hair Care", icon: Scissors, desc: "Shampoo, conditioner, hair masks", color: "bg-emerald-50 text-emerald-600" },
      { id: "soap", label: "Soap / Body Wash", icon: Bath, desc: "Bar soaps, liquid soaps, body washes", color: "bg-cyan-50 text-cyan-600" },
      { id: "baby_care", label: "Baby / Kids Products", icon: Baby, desc: "Ultra-gentle baby-safe products", color: "bg-orange-50 text-orange-600" },
      { id: "cleaning", label: "Household Cleaning", icon: Home, desc: "Cleaners, sprays, detergents", color: "bg-teal-50 text-teal-600" },
      { id: "other", label: "Something Else", icon: Wand2, desc: "Describe what you need", color: "bg-slate-100 text-slate-600" },
    ]
  },
  {
    id: "results",
    question: "What results are you looking for?",
    subtitle: "Select all that apply — we'll tailor the formula accordingly",
    multi: true,
    optionsByGoal: {
      face_cream: [
        { id: "hydrating", label: "Deep Hydration", icon: Droplets },
        { id: "anti_aging", label: "Anti-Aging / Wrinkles", icon: Timer },
        { id: "brightening", label: "Brightening / Glow", icon: Sparkles },
        { id: "acne", label: "Acne / Blemish Control", icon: CircleDot },
        { id: "soothing", label: "Soothing / Redness Relief", icon: Leaf },
        { id: "firming", label: "Firming / Tightening", icon: Layers },
      ],
      cleanser: [
        { id: "gentle", label: "Gentle / Sensitive Skin", icon: Flower2 },
        { id: "deep_clean", label: "Deep Pore Cleaning", icon: Droplets },
        { id: "makeup_removal", label: "Makeup Removal", icon: Brush },
        { id: "oil_control", label: "Oil Control", icon: CircleDot },
        { id: "exfoliating", label: "Exfoliating", icon: Sparkles },
      ],
      sunscreen: [
        { id: "lightweight", label: "Lightweight / No White Cast", icon: Wind },
        { id: "moisturizing_spf", label: "Moisturizing SPF", icon: Droplets },
        { id: "sport", label: "Water-Resistant / Sport", icon: ThermometerSun },
        { id: "tinted", label: "Tinted / BB Cream", icon: Palette },
      ],
      body_lotion: [
        { id: "ultra_hydrating", label: "Ultra Hydrating", icon: Droplets },
        { id: "firming_body", label: "Firming / Toning", icon: Layers },
        { id: "scented", label: "Beautifully Scented", icon: Flower2 },
        { id: "sensitive_body", label: "Sensitive Skin Safe", icon: Leaf },
      ],
      lip_balm: [
        { id: "moisturizing_lip", label: "Super Moisturizing", icon: Droplets },
        { id: "tinted_lip", label: "Tinted / Colored", icon: Palette },
        { id: "spf_lip", label: "SPF Protection", icon: Sun },
        { id: "healing", label: "Healing / Repair", icon: Shield },
      ],
      hair_care: [
        { id: "moisturizing_hair", label: "Moisturizing / Dry Hair", icon: Droplets },
        { id: "volumizing", label: "Volume / Thin Hair", icon: Wind },
        { id: "damage_repair", label: "Damage Repair", icon: Shield },
        { id: "dandruff", label: "Dandruff / Scalp Care", icon: CircleDot },
        { id: "curly", label: "Curl Definition", icon: Sparkles },
      ],
      soap: [
        { id: "moisturizing_soap", label: "Moisturizing", icon: Droplets },
        { id: "antibacterial", label: "Antibacterial", icon: Shield },
        { id: "fragrant", label: "Luxurious Scent", icon: Flower2 },
        { id: "sensitive_soap", label: "Sensitive / Unscented", icon: Leaf },
      ],
      baby_care: [
        { id: "gentle_wash", label: "Gentle Wash", icon: Droplets },
        { id: "diaper_cream", label: "Diaper Cream", icon: Shield },
        { id: "baby_lotion", label: "Baby Lotion", icon: Heart },
        { id: "baby_shampoo", label: "Baby Shampoo", icon: Scissors },
      ],
      cleaning: [
        { id: "all_purpose", label: "All-Purpose Cleaner", icon: Home },
        { id: "kitchen_clean", label: "Kitchen / Degreaser", icon: Sparkles },
        { id: "bathroom_clean", label: "Bathroom Cleaner", icon: Bath },
        { id: "laundry", label: "Laundry Detergent", icon: Wind },
        { id: "glass", label: "Glass / Window", icon: Eye },
      ],
      other: [
        { id: "custom_desc", label: "I'll describe it myself", icon: Pipette },
      ],
    }
  },
  {
    id: "audience",
    question: "Who is this for?",
    subtitle: "This helps us tailor the complexity and instructions",
    options: [
      { id: "personal", label: "Just for Me", icon: Heart, desc: "Simple recipes with easy-to-find ingredients" },
      { id: "gifts", label: "Gifts / Small Batches", icon: Sparkles, desc: "Presentable enough to gift, easy to make in small quantities" },
      { id: "sell", label: "I Want to Sell It", icon: Building2, desc: "Commercial-grade formulas with compliance guidance" },
    ]
  },
  {
    id: "preferences",
    question: "Any preferences?",
    subtitle: "Select all that matter to you (optional — skip if unsure)",
    multi: true,
    options: [
      { id: "natural", label: "All Natural / Organic", icon: Leaf },
      { id: "budget", label: "Budget Friendly", icon: Wallet },
      { id: "vegan", label: "Vegan / Cruelty-Free", icon: Rabbit },
      { id: "fragrance_free", label: "Fragrance Free", icon: Ban },
      { id: "sensitive_skin", label: "Sensitive Skin Safe", icon: Flower2 },
      { id: "quick", label: "Quick & Easy (Under 15 min)", icon: Zap },
      { id: "eco", label: "Eco-Friendly / Sustainable", icon: Recycle },
      { id: "luxurious", label: "Luxurious / Premium Feel", icon: Gem },
    ]
  }
];

const GOAL_TO_PRODUCT = {
  face_cream: { id: "facial_moisturizer", name: "Facial Moisturizer" },
  cleanser: { id: "facial_cleanser", name: "Facial Cleanser" },
  sunscreen: { id: "sunscreen", name: "Sunscreen" },
  body_lotion: { id: "body_lotion", name: "Body Lotion" },
  lip_balm: { id: "lip_balm", name: "Lip Balm" },
  hair_care: { id: "shampoo", name: "Hair Care Product" },
  soap: { id: "hand_soap", name: "Soap" },
  baby_care: { id: "baby_care", name: "Baby Care Product" },
  cleaning: { id: "all_purpose_cleaner", name: "Cleaning Product" },
  other: { id: "custom_formula", name: "Custom Product" },
};

export default function SmartStartWizard({ onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ goal: null, results: [], audience: null, preferences: [] });
  const [customInput, setCustomInput] = useState("");

  const currentStep = STEPS[step];

  const getOptions = () => {
    if (currentStep.id === "results" && currentStep.optionsByGoal) {
      return currentStep.optionsByGoal[answers.goal] || currentStep.optionsByGoal.other;
    }
    return currentStep.options;
  };

  const handleSelect = (optionId) => {
    if (currentStep.multi) {
      setAnswers(prev => {
        const key = currentStep.id;
        const current = prev[key] || [];
        const updated = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [key]: updated };
      });
    } else {
      setAnswers(prev => ({ ...prev, [currentStep.id]: optionId }));
      if (step < STEPS.length - 1) {
        setTimeout(() => setStep(step + 1), 300);
      }
    }
  };

  const canProceed = () => {
    if (currentStep.multi) return true;
    return answers[currentStep.id] != null;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    const product = GOAL_TO_PRODUCT[answers.goal] || GOAL_TO_PRODUCT.other;
    const isBusinessMode = answers.audience === "sell";

    const options = getResultsOptions();
    const resultLabels = (answers.results || []).map(id => {
      const opt = options.find(o => o.id === id);
      return opt?.label || id;
    });
    const prefLabels = (answers.preferences || []).map(id => {
      const opt = STEPS[3].options.find(o => o.id === id);
      return opt?.label || id;
    });

    let description = `I want to create a ${product.name.toLowerCase()}`;
    if (resultLabels.length > 0) {
      description += ` that is ${resultLabels.join(", ").toLowerCase()}`;
    }
    if (prefLabels.length > 0) {
      description += `. Preferences: ${prefLabels.join(", ").toLowerCase()}`;
    }
    if (answers.audience === "gifts") {
      description += ". Should be presentable enough to give as gifts.";
    }
    if (customInput.trim()) {
      description += `. Additional details: ${customInput.trim()}`;
    }

    onComplete({
      productType: {
        ...product,
        description: `Custom ${product.name} formula`,
        category: "skincare",
        difficulty: isBusinessMode ? "Advanced" : "Beginner",
        time: "30 min",
        color: isBusinessMode ? "bg-violet-500" : "bg-teal-500"
      },
      description,
      businessMode: isBusinessMode
    });
  };

  const getResultsOptions = () => {
    const resultsStep = STEPS[1];
    return resultsStep.optionsByGoal[answers.goal] || resultsStep.optionsByGoal.other || [];
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={step > 0 ? () => setStep(step - 1) : onBack} className="flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        {step > 0 ? "Previous Question" : "Back to Dashboard"}
      </Button>

      {/* Progress */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <span>Question {step + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-slate-700 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white border border-slate-200 shadow-lg max-w-3xl mx-auto">
          <CardContent className="p-6 sm:p-8">
            {/* Question */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                {currentStep.question}
              </h2>
              <p className="text-slate-500 text-sm sm:text-base">
                {currentStep.subtitle}
              </p>
            </div>

            {/* Options Grid */}
            <div className={`grid gap-3 ${
              getOptions().length <= 4 ? "grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto" :
              getOptions().length <= 6 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
              "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            }`}>
              {getOptions().map((option) => {
                const isSelected = currentStep.multi
                  ? (answers[currentStep.id] || []).includes(option.id)
                  : answers[currentStep.id] === option.id;
                const Icon = option.icon;

                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(option.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col ${
                      isSelected
                        ? "border-slate-700 bg-slate-50 shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    >
                     <div className="flex items-start gap-3 flex-1">
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                         isSelected 
                           ? "bg-slate-700" 
                           : option.color 
                             ? option.color.split(" ")[0] 
                             : "bg-slate-100"
                       }`}>
                         <Icon className={`w-5 h-5 ${
                           isSelected 
                             ? "text-white" 
                             : option.color 
                               ? option.color.split(" ")[1] 
                               : "text-slate-600"
                         }`} />
                       </div>
                       <div className="min-w-0 flex-1">
                         <p className={`font-semibold text-sm leading-snug ${isSelected ? "text-slate-900" : "text-slate-800"}`}>
                           {option.label}
                         </p>
                         {option.desc && (
                           <p className="text-xs text-slate-500 mt-1 leading-tight">{option.desc}</p>
                         )}
                       </div>
                     </div>
                    {isSelected && (
                      <div className="mt-2 flex justify-end">
                        <div className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Custom input for "other" goal on results step */}
            {currentStep.id === "results" && answers.goal === "other" && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Describe what you want to make..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:outline-none text-sm"
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
              <div className="text-sm text-slate-400">
                {currentStep.multi && "Select all that apply, or skip"}
              </div>
              <Button
                onClick={handleNext}
                disabled={!currentStep.multi && !canProceed()}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6"
              >
                {step === STEPS.length - 1 ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate My Formula
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}