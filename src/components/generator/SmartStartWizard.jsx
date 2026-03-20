import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, Sparkles, Heart, Droplets, Sun,
  Baby, Leaf, Home, Building2, Wallet, Clock, Shield,
  Loader2, ChevronRight, Wand2
} from "lucide-react";

const STEPS = [
  {
    id: "goal",
    question: "What do you want to make?",
    subtitle: "Don't worry about technical names — just pick what sounds right!",
    options: [
      { id: "face_cream", label: "Face Cream / Moisturizer", emoji: "🧴", icon: Heart, desc: "Hydrating creams, serums, lotions" },
      { id: "cleanser", label: "Face Cleanser / Wash", emoji: "🫧", icon: Droplets, desc: "Gentle cleansers, micellar waters" },
      { id: "sunscreen", label: "Sunscreen / SPF", emoji: "☀️", icon: Sun, desc: "Sun protection products" },
      { id: "body_lotion", label: "Body Lotion / Butter", emoji: "✨", icon: Sparkles, desc: "Rich body moisturizers" },
      { id: "lip_balm", label: "Lip Balm / Lip Care", emoji: "💋", icon: Heart, desc: "Lip balms, glosses, treatments" },
      { id: "hair_care", label: "Hair Care", emoji: "💇", icon: Droplets, desc: "Shampoo, conditioner, hair masks" },
      { id: "soap", label: "Soap / Body Wash", emoji: "🧼", icon: Droplets, desc: "Bar soaps, liquid soaps, body washes" },
      { id: "baby_care", label: "Baby / Kids Products", emoji: "👶", icon: Baby, desc: "Ultra-gentle baby-safe products" },
      { id: "cleaning", label: "Household Cleaning", emoji: "🏠", icon: Home, desc: "Cleaners, sprays, detergents" },
      { id: "other", label: "Something Else", emoji: "🔬", icon: Wand2, desc: "Tell me what you need" },
    ]
  },
  {
    id: "results",
    question: "What results are you looking for?",
    subtitle: "Pick all that apply — we'll build the perfect formula for you",
    multi: true,
    optionsByGoal: {
      face_cream: [
        { id: "hydrating", label: "Deep Hydration", emoji: "💧" },
        { id: "anti_aging", label: "Anti-Aging / Wrinkles", emoji: "⏳" },
        { id: "brightening", label: "Brightening / Glow", emoji: "✨" },
        { id: "acne", label: "Acne / Blemish Control", emoji: "🎯" },
        { id: "soothing", label: "Soothing / Redness Relief", emoji: "🌿" },
        { id: "firming", label: "Firming / Tightening", emoji: "💪" },
      ],
      cleanser: [
        { id: "gentle", label: "Gentle / Sensitive Skin", emoji: "🌸" },
        { id: "deep_clean", label: "Deep Pore Cleaning", emoji: "🫧" },
        { id: "makeup_removal", label: "Makeup Removal", emoji: "💄" },
        { id: "oil_control", label: "Oil Control", emoji: "🎯" },
        { id: "exfoliating", label: "Exfoliating", emoji: "✨" },
      ],
      sunscreen: [
        { id: "lightweight", label: "Lightweight / No White Cast", emoji: "☁️" },
        { id: "moisturizing_spf", label: "Moisturizing SPF", emoji: "💧" },
        { id: "sport", label: "Water-Resistant / Sport", emoji: "🏊" },
        { id: "tinted", label: "Tinted / BB Cream", emoji: "🎨" },
      ],
      body_lotion: [
        { id: "ultra_hydrating", label: "Ultra Hydrating", emoji: "💧" },
        { id: "firming_body", label: "Firming / Toning", emoji: "💪" },
        { id: "scented", label: "Beautifully Scented", emoji: "🌹" },
        { id: "sensitive_body", label: "Sensitive Skin Safe", emoji: "🌿" },
      ],
      lip_balm: [
        { id: "moisturizing_lip", label: "Super Moisturizing", emoji: "💧" },
        { id: "tinted_lip", label: "Tinted / Colored", emoji: "💋" },
        { id: "spf_lip", label: "SPF Protection", emoji: "☀️" },
        { id: "healing", label: "Healing / Repair", emoji: "🩹" },
      ],
      hair_care: [
        { id: "moisturizing_hair", label: "Moisturizing / Dry Hair", emoji: "💧" },
        { id: "volumizing", label: "Volume / Thin Hair", emoji: "💨" },
        { id: "damage_repair", label: "Damage Repair", emoji: "🔧" },
        { id: "dandruff", label: "Dandruff / Scalp Care", emoji: "🎯" },
        { id: "curly", label: "Curl Definition", emoji: "〰️" },
      ],
      soap: [
        { id: "moisturizing_soap", label: "Moisturizing", emoji: "💧" },
        { id: "antibacterial", label: "Antibacterial", emoji: "🛡️" },
        { id: "fragrant", label: "Luxurious Scent", emoji: "🌹" },
        { id: "sensitive_soap", label: "Sensitive / Unscented", emoji: "🌿" },
      ],
      baby_care: [
        { id: "gentle_wash", label: "Gentle Wash", emoji: "🫧" },
        { id: "diaper_cream", label: "Diaper Cream", emoji: "🩹" },
        { id: "baby_lotion", label: "Baby Lotion", emoji: "💧" },
        { id: "baby_shampoo", label: "Baby Shampoo", emoji: "💇" },
      ],
      cleaning: [
        { id: "all_purpose", label: "All-Purpose Cleaner", emoji: "🏠" },
        { id: "kitchen_clean", label: "Kitchen / Degreaser", emoji: "🍳" },
        { id: "bathroom_clean", label: "Bathroom Cleaner", emoji: "🚿" },
        { id: "laundry", label: "Laundry Detergent", emoji: "👕" },
        { id: "glass", label: "Glass / Window", emoji: "🪟" },
      ],
      other: [
        { id: "custom_desc", label: "I'll describe it myself", emoji: "✍️" },
      ],
    }
  },
  {
    id: "audience",
    question: "Who is this for?",
    subtitle: "This helps us tailor the complexity and instructions",
    options: [
      { id: "personal", label: "Just for Me", icon: Heart, desc: "Simple recipes with easy-to-find ingredients", emoji: "🏠" },
      { id: "gifts", label: "Gifts / Small Batches", icon: Sparkles, desc: "Pretty enough to gift, easy to make in small quantities", emoji: "🎁" },
      { id: "sell", label: "I Want to Sell It", icon: Building2, desc: "Commercial-grade formulas with compliance guidance", emoji: "💼" },
    ]
  },
  {
    id: "preferences",
    question: "Any preferences?",
    subtitle: "Pick all that matter to you (optional — skip if unsure)",
    multi: true,
    options: [
      { id: "natural", label: "All Natural / Organic", emoji: "🌿" },
      { id: "budget", label: "Budget Friendly", emoji: "💰" },
      { id: "vegan", label: "Vegan / Cruelty-Free", emoji: "🐰" },
      { id: "fragrance_free", label: "Fragrance Free", emoji: "🚫" },
      { id: "sensitive_skin", label: "Sensitive Skin Safe", emoji: "🌸" },
      { id: "quick", label: "Quick & Easy (Under 15 min)", emoji: "⚡" },
      { id: "eco", label: "Eco-Friendly / Sustainable", emoji: "♻️" },
      { id: "luxurious", label: "Luxurious / Premium Feel", emoji: "💎" },
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
      // Auto-advance on single select
      if (step < STEPS.length - 1) {
        setTimeout(() => setStep(step + 1), 300);
      }
    }
  };

  const canProceed = () => {
    if (currentStep.multi) return true; // Multi-select steps are optional
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

    // Build a natural description from answers
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
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
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
        <Card className="bg-white border-0 shadow-xl max-w-3xl mx-auto">
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

                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(option.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-teal-400 bg-teal-50 shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{option.emoji}</span>
                      <div className="min-w-0">
                        <p className={`font-semibold text-sm ${isSelected ? "text-teal-800" : "text-slate-800"}`}>
                          {option.label}
                        </p>
                        {option.desc && (
                          <p className="text-xs text-slate-500 mt-0.5">{option.desc}</p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-2 flex justify-end">
                        <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
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
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:outline-none text-sm"
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
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6"
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