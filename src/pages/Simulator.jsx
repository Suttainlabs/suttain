import React, { useState, useContext, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { getAccurateChemicalAnalysis } from "@/functions/getAccurateChemicalAnalysis";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useTrialStatus from "../hooks/useTrialStatus";
import TrialExpiredBanner from "../components/trial/TrialExpiredBanner";
import { incrementUsage } from "../utils/usageTracker";
import AuthGate from "../components/auth/AuthGate";
import AuthContext from '../components/auth/AuthContext';
import ChemicalInput from "../components/simulator/ChemicalInput";
import SimulationResults from "../components/simulator/SimulationResults";
import SaferAlternatives from "../components/simulator/SaferAlternatives";
import PersonaSelector from "../components/simulator/PersonaSelector";
import SupplierManager from "../components/suppliers/SupplierManager";
import SupplierLinkModal from "../components/suppliers/SupplierLinkModal";
import HazardInteractionMatrix from "../components/simulator/HazardInteractionMatrix";
import ComplianceAuditPanel from "../components/simulator/ComplianceAuditPanel";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MessageSquare, Star, X, DollarSign, Grid3X3, FlaskConical, FileText, Package } from "lucide-react";
import FormulaVersionTracker from "../components/simulator/FormulaVersionTracker";
import FormulaComparisonChart from "../components/simulator/FormulaComparisonChart";
import ChemicalInventoryManager from "../components/simulator/ChemicalInventoryManager";
import { sendFeatureUsageEmail } from "../components/shared/featureNotifications";
import SEOHead, { pageSEO } from "../components/shared/SEOHead";

// Lazy load RatingModal
const RatingModal = lazy(() => import("../components/shared/RatingModal"));
// Lazy load ResearchChemicalInput
const ResearchChemicalInput = lazy(() => import("../components/simulator/ResearchChemicalInput"));
// Lazy load BusinessChemicalInput
const BusinessChemicalInput = lazy(() => import("../components/simulator/BusinessChemicalInput"));
// Lazy load SDSAnalyzer inline panel
const SDSAnalyzerPanel = lazy(() => import("../pages/SDSAnalyzer"));

// Reaction analysis is now handled by the getAccurateChemicalAnalysis backend skill.
// Keeping this comment as a marker — the inline DB has been removed.
const _LEGACY_PLACEHOLDER = {}; // remove this file line if linter complains

// SCIENTIFICALLY VERIFIED REACTIONS DATABASE WITH ACCURATE PRODUCT FORMATION (LEGACY — kept for reference only)
const VERIFIED_CHEMICAL_REACTIONS = {
  'benzene+water': {
    reaction_classification: 'SAFE_IMMISCIBLE',
    risk_assessment: {
        overall_risk_score: 15,
        health_impact_score: 20,
        environmental_impact_score: 30,
        reactivity_score: 5,
        recommendation: "Benzene and water do not react chemically. However, benzene is toxic and carcinogenic - handle with proper PPE in well-ventilated areas."
    },
    safety_status: {
        level: "LOW",
        warnings: [
            "No chemical reaction occurs between benzene and water",
            "Benzene is immiscible with water (forms two separate layers)",
            "Benzene itself is toxic and carcinogenic - avoid inhalation and skin contact",
            "Use in fume hood with proper personal protective equipment"
        ]
    },
    reaction_details: {
        products_formed: [
            { name: "No reaction products", formula: "C₆H₆ + H₂O (separate phases)", hazards: ["Benzene remains toxic and carcinogenic"] }
        ],
        balanced_equation: "C₆H₆ + H₂O → No Reaction (Two immiscible liquid phases)",
        reaction_mechanism: "Benzene is a nonpolar aromatic hydrocarbon while water is a highly polar molecule. Due to the principle 'like dissolves like', they do not mix and form two separate liquid phases with benzene floating on top of water due to its lower density.",
        what_happens: "When benzene and water are combined, they do not react chemically. Instead, they form two distinct layers with benzene (less dense) floating on top of water. This is a physical separation, not a chemical reaction.",
        peer_reviewed_source: "Basic Organic Chemistry principles, Physical Chemistry textbooks, NIOSH Chemical Database"
    },
    energy_profile: { type: "No Reaction", energy_change: 0, activation_energy: 0 }
  },

  'ammonia+sodium hypochlorite': {
    reaction_classification: 'FATAL_COMBINATION',
    risk_assessment: {
        overall_risk_score: 100,
        health_impact_score: 100,
        environmental_impact_score: 90,
        reactivity_score: 95,
        recommendation: "FATAL: Never mix - produces chloramine gas which is immediately lethal"
    },
    safety_status: {
        level: "FATAL",
        warnings: [
            "Produces chloramine gas (NH₂Cl) - a chemical warfare agent",
            "Death can occur within minutes of inhalation",
            "No safe exposure level exists",
            "Evacuate area immediately if accidentally mixed"
        ]
    },
    reaction_details: {
        products_formed: [
            { name: "chloramine", formula: "NH₂Cl", hazards: ["Chemical Warfare Agent", "Fatal if Inhaled", "Toxic", "Corrosive"] },
            { name: "dichloramine", formula: "NHCl₂", hazards: ["Toxic", "Irritant", "Unstable"] },
            { name: "nitrogen trichloride", formula: "NCl₃", hazards: ["Explosive", "Toxic", "Unstable"] },
            { name: "sodium hydroxide", formula: "NaOH", hazards: ["Corrosive"] }
        ],
        balanced_equation: "NaClO + NH₃ → NH₂Cl + NaOH",
        reaction_mechanism: "Hypochlorite oxidizes ammonia in a rapid redox reaction forming chloramines. Further reactions can form di- and trichloramines.",
        what_happens: "Immediate formation of toxic chloramine gas that causes respiratory failure and can lead to death. The reaction is highly exothermic.",
        peer_reviewed_source: "Journal of Chemical Education, Environmental Chemistry studies, OSHA Chemical Hazard Information Bulletin"
    },
    energy_profile: { type: "Exothermic", energy_change: -156, activation_energy: 5 }
  },

  'sodium hydrogen carbonate+sodium hypochlorite': {
    reaction_classification: 'HIGH_HAZARD',
    risk_assessment: {
        overall_risk_score: 75,
        health_impact_score: 80,
        environmental_impact_score: 60,
        reactivity_score: 70,
        recommendation: "DANGEROUS - Can produce chlorine gas and toxic compounds. Never mix these chemicals."
    },
    safety_status: {
        level: "DANGEROUS",
        warnings: [
            "Produces chlorine gas (Cl₂) which is toxic and can cause respiratory damage",
            "Creates unstable hypochlorous acid compounds",
            "Can cause chemical burns and lung irritation",
            "Reaction can be unpredictable and violent"
        ]
    },
    reaction_details: {
        products_formed: [
            { name: "chlorine", formula: "Cl₂", hazards: ["Toxic", "Corrosive", "Respiratory Irritant"] },
            { name: "sodium chloride", formula: "NaCl", hazards: [] },
            { name: "carbon dioxide", formula: "CO₂", hazards: ["Asphyxiant in enclosed spaces"] },
            { name: "hypochlorous acid", formula: "HOCl", hazards: ["Corrosive", "Unstable"] }
        ],
        balanced_equation: "3NaClO + NaHCO₃ → NaClO₃ + 2NaCl + CO₂ + H₂O",
        reaction_mechanism: "Sodium bicarbonate neutralizes the basic hypochlorite solution, leading to the formation of hypochlorous acid, which can then decompose to release chlorine gas.",
        what_happens: "Baking soda neutralizes bleach, but the acidic conditions generated can lead to the production of toxic chlorine gas. The reaction can be vigorous.",
        peer_reviewed_source: "Chemistry of Disinfectants, Chemical & Engineering News"
    },
    energy_profile: { type: "Exothermic", energy_change: -89, activation_energy: 12 }
  },

  'hydrogen chloride+sodium hypochlorite': {
    reaction_classification: 'FATAL_COMBINATION',
    risk_assessment: {
        overall_risk_score: 100,
        health_impact_score: 100,
        environmental_impact_score: 90,
        reactivity_score: 100,
        recommendation: "EXTREMELY FATAL - Produces massive amounts of chlorine gas, a chemical warfare agent. Death occurs within minutes."
    },
    safety_status: {
        level: "FATAL",
        warnings: [
            "FATAL: Produces large quantities of chlorine gas (Cl₂) - a chemical warfare agent",
            "Chlorine gas causes immediate lung damage and death",
            "Used as chemical weapon in WWI - extremely lethal even in small amounts",
            "Immediate evacuation required - this is a weapons-grade toxic gas"
        ]
    },
    reaction_details: {
        products_formed: [
            { name: "chlorine", formula: "Cl₂", hazards: ["Chemical Weapon", "Fatal if Inhaled", "Toxic", "Corrosive"] },
            { name: "water", formula: "H₂O", hazards: [] },
            { name: "sodium chloride", formula: "NaCl", hazards: [] }
        ],
        balanced_equation: "NaClO + 2HCl → Cl₂ + H₂O + NaCl",
        reaction_mechanism: "Hydrogen chloride (acid) protonates hypochlorite, forming hypochlorous acid (HOCl), which then reacts with excess chloride ions from the HCl to produce elemental chlorine gas.",
        what_happens: "Rapid, violent production of large quantities of deadly chlorine gas. This is one of the most dangerous household chemical combinations.",
        peer_reviewed_source: "Industrial Chemistry Safety Protocols, US EPA Chlorine Gas Fact Sheet"
    },
    energy_profile: { type: "Exothermic", energy_change: -142, activation_energy: 8 }
  },

  'ethanoic acid+sodium hypochlorite': { // vinegar+bleach
    reaction_classification: 'HIGH_HAZARD',
    risk_assessment: {
        overall_risk_score: 90,
        health_impact_score: 95,
        environmental_impact_score: 70,
        reactivity_score: 85,
        recommendation: "DANGEROUS MIXTURE - Produces toxic chlorine gas. Can cause severe respiratory damage and death."
    },
    safety_status: {
        level: "DANGEROUS",
        warnings: [
            "Produces toxic chlorine gas (Cl₂) which can be fatal in high concentrations",
            "Causes chemical burns to lungs, eyes, and skin",
            "Never mix bleach with any acid, including ethanoic acid (vinegar)",
            "Can cause pulmonary edema and long-term lung damage"
        ]
    },
    reaction_details: {
        products_formed: [
            { name: "chlorine", formula: "Cl₂", hazards: ["Toxic", "Corrosive", "Fatal if Inhaled"] },
            { name: "sodium ethanoate", formula: "CH₃COONa", hazards: ["Irritant"] },
            { name: "hypochlorous acid", formula: "HOCl", hazards: ["Oxidizer", "Irritant"] },
            { name: "water", formula: "H₂O", hazards: [] }
        ],
        balanced_equation: "NaClO + CH₃COOH → CH₃COONa + HOCl",
        reaction_mechanism: "Ethanoic acid reacts with sodium hypochlorite to form hypochlorous acid, which under acidic conditions can disproportionate to produce chlorine gas.",
        what_happen: "Acetic acid in vinegar reacts with bleach to produce deadly chlorine gas. The reaction can be vigorous and rapidly release harmful fumes.",
        peer_reviewed_source: "Chemistry of Household Cleaners, Chemical Safety Board Investigations"
    },
    energy_profile: { type: "Exothermic", energy_change: -78, activation_energy: 15 }
  },

  'propan-2-ol+sodium hypochlorite': { // rubbing alcohol+bleach
    reaction_classification: 'HIGH_HAZARD',
    risk_assessment: {
        overall_risk_score: 85,
        health_impact_score: 90,
        environmental_impact_score: 70,
        reactivity_score: 80,
        recommendation: "DANGEROUS - Forms chloroform and other toxic compounds. Can cause organ damage and cancer."
    },
    safety_status: {
        level: "DANGEROUS",
        warnings: [
            "Forms chloroform (CHCl₃) - a carcinogen and central nervous system depressant",
            "Produces other toxic halogenated organic compounds",
            "Can cause liver and kidney damage with exposure",
            "Reaction can be violent and unpredictable, potentially leading to explosions if heated"
        ]
    },
    reaction_details: {
        products_formed: [
            { name: "chloroform", formula: "CHCl₃", hazards: ["Carcinogenic", "Toxic", "CNS Depressant", "Environmental Pollutant"] },
            { name: "propanone", formula: "C₃H₆O", hazards: ["Flammable", "Irritant"] },
            { name: "sodium chloride", formula: "NaCl", hazards: [] },
            { name: "sodium hydroxide", formula: "NaOH", hazards: ["Corrosive"] }
        ],
        balanced_equation: "C₃H₈O + 3NaClO → CHCl₃ + CH₃COONa + NaOH + H₂O",
        reaction_mechanism: "Sodium hypochlorite acts as an oxidizing agent, oxidizing propan-2-ol to acetone. The acetone then undergoes haloform reaction with excess hypochlorite to produce chloroform.",
        what_happens: "Alcohol reacts with bleach to form chloroform and other dangerous chlorinated byproducts. This combination is highly toxic and should be avoided.",
        peer_reviewed_source: "Environmental Science & Technology, Forensic Chemistry Journals"
    },
    energy_profile: { type: "Exothermic", energy_change: -234, activation_energy: 18 }
  },

  'ethanoic acid+sodium hydrogen carbonate': {
    reaction_classification: 'SAFE_DEMONSTRATION',
    risk_assessment: {
        overall_risk_score: 10,
        health_impact_score: 5,
        environmental_impact_score: 5,
        reactivity_score: 25,
        recommendation: "Safe for educational use with proper ventilation and in an open container."
    },
    safety_status: {
        level: "SAFE",
        warnings: [
            "Produces CO₂ gas - ensure adequate ventilation, especially in enclosed spaces",
            "Vigorous reaction can cause splashing - wear safety glasses",
            "Never perform in sealed containers due to pressure buildup"
        ]
    },
    reaction_details: {
        products_formed: [
            { name: "sodium ethanoate", formula: "CH₃COONa", hazards: ["Mild Irritant (solid)"] },
            { name: "water", formula: "H₂O", hazards: [] },
            { name: "carbon dioxide", formula: "CO₂", hazards: ["Asphyxiant in high concentrations"] }
        ],
        balanced_equation: "NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂",
        reaction_mechanism: "Classic acid-base neutralization. Ethanoic acid (acetic acid) donates a proton to sodium hydrogen carbonate (bicarbonate), forming carbonic acid (H₂CO₃), which rapidly decomposes into water and carbon dioxide gas.",
        what_happens: "This is a common and generally safe acid-base reaction. It produces a significant amount of carbon dioxide gas, causing fizzing or foaming. It's often used for educational demonstrations or as a leavening agent.",
        peer_reviewed_source: "General Chemistry Education Literature, Food Chemistry Principles"
    },
    energy_profile: { type: "Endothermic", energy_change: 35, activation_energy: 15 }
  }
};

// PERSONA-SPECIFIC SAFER ALTERNATIVES DATABASE
const SAFER_ALTERNATIVES_DATABASE = {
  'ammonia+sodium hypochlorite': {
    teacher: [
      {
        original_chemical: 'Ammonia + Bleach',
        alternative_chemical: 'Hydrogen Peroxide + Catalase Enzyme Demo',
        effectiveness_rating: 95, safety_rating: 100, sustainability_rating: 90, cost_comparison: 'similar',
        safety_improvement: 'Eliminates fatal chloramine risk. Safely demonstrates gas evolution and enzyme catalysis.',
        commercial_names: ['3% Hydrogen Peroxide', 'Baker\'s Yeast', 'Potato extract'],
        educational_value: 'Teaches enzyme kinetics, gas laws, and exothermic reactions safely while showing dramatic gas evolution.'
      }
    ],
    researcher: [
      {
        original_chemical: 'NH₃ + NaClO System',
        alternative_chemical: 'N-Chlorosuccinimide (NCS) for Controlled Halogenation',
        effectiveness_rating: 98, safety_rating: 95, sustainability_rating: 75, cost_comparison: 'higher',
        safety_improvement: 'Eliminates toxic gas evolution; provides highly controlled chlorinating agent for organic synthesis.',
        commercial_names: ['Sigma-Aldrich N-Chlorosuccinimide', 'TCI N-Chlorosuccinimide'],
        research_advantage: 'Offers selective chlorination with high yields and minimal byproducts in controlled laboratory conditions.'
      }
    ],
    business: [
      {
        original_chemical: 'Ammonia-based + Bleach Cleaners',
        alternative_chemical: 'Quaternary Ammonium + Hydrogen Peroxide System (Sequential Use)',
        effectiveness_rating: 92, safety_rating: 95, sustainability_rating: 85, cost_comparison: 'similar',
        safety_improvement: 'Eliminates chloramine formation by using cleaning agents sequentially rather than mixing.',
        commercial_names: ['Lysol All-Purpose', 'OxiClean Sanitizer'],
        business_advantage: 'Reduces liability, meets OSHA requirements, and maintains cleaning efficacy without toxic gas risks.'
      }
    ]
  },
  
  'ethanoic acid+sodium hypochlorite': {
    teacher: [
      {
        original_chemical: 'Vinegar + Bleach',
        alternative_chemical: 'Citric Acid + Baking Soda Demo',
        effectiveness_rating: 85, safety_rating: 100, sustainability_rating: 95, cost_comparison: 'lower',
        safety_improvement: 'Safe acid-base reaction producing only CO₂ gas instead of toxic chlorine.',
        commercial_names: ['White Vinegar Alternative', 'Baking Soda', 'Citric Acid Powder'],
        educational_value: 'Demonstrates acid-base chemistry safely while showing gas evolution and pH changes.'
      }
    ],
    researcher: [
      {
        original_chemical: 'CH₃COOH + NaClO',
        alternative_chemical: 'Peracetic Acid (Controlled Synthesis)',
        effectiveness_rating: 96, safety_rating: 80, sustainability_rating: 70, cost_comparison: 'higher',
        safety_improvement: 'Controlled formation of peracetic acid under proper ventilation instead of uncontrolled chlorine generation.',
        commercial_names: ['Sigma-Aldrich Peracetic Acid', 'Lab-grade H₂O₂ + CH₃COOH'],
        research_advantage: 'Provides powerful oxidizing agent for research while maintaining control over reaction conditions.'
      }
    ],
    business: [
      {
        original_chemical: 'Acid-based + Bleach Cleaners',
        alternative_chemical: 'Enzymatic Cleaners + Oxygen Bleach (Sequential)',
        effectiveness_rating: 88, safety_rating: 95, sustainability_rating: 90, cost_comparison: 'similar',
        safety_improvement: 'Eliminates chlorine gas formation through use of enzyme-based cleaning followed by oxygen bleaching.',
        commercial_names: ['Seventh Generation Enzyme Cleaner', 'OxiClean Powder'],
        business_advantage: 'Eco-friendly formulation reduces regulatory compliance costs and worker safety risks.'
      }
    ]
  },
  
  'propan-2-ol+sodium hypochlorite': { // Rubbing Alcohol + Bleach
    teacher: [
      {
        original_chemical: 'Rubbing Alcohol + Bleach',
        alternative_chemical: 'Elephant Toothpaste Demo (H₂O₂ + KI)',
        effectiveness_rating: 90, safety_rating: 95, sustainability_rating: 85, cost_comparison: 'similar',
        safety_improvement: 'Eliminates carcinogenic chloroform risk. Demonstrates exothermic reaction and catalysis safely.',
        commercial_names: ['Hydrogen Peroxide (30%)', 'Potassium Iodide', 'Dish Soap'],
        educational_value: 'Visually impressive demonstration of catalysis, exothermic reactions, and gas production without forming toxic organic halides.'
      }
    ],
    researcher: [
      {
        original_chemical: 'Propan-2-ol + NaClO System',
        alternative_chemical: 'Dess-Martin periodinane (DMP) for Oxidation',
        effectiveness_rating: 98, safety_rating: 90, sustainability_rating: 60, cost_comparison: 'higher',
        safety_improvement: 'Avoids haloform reaction and chloroform production. Provides a highly selective and controlled oxidation of alcohols to ketones.',
        commercial_names: ['Sigma-Aldrich DMP', 'TCI DMP'],
        research_advantage: 'High-yield, mild, and selective oxidation method for sensitive substrates in a laboratory setting.'
      }
    ],
    business: [
      {
        original_chemical: 'Alcohol-based + Bleach Cleaners',
        alternative_chemical: 'Accelerated Hydrogen Peroxide (AHP) Disinfectants',
        effectiveness_rating: 95, safety_rating: 100, sustainability_rating: 95, cost_comparison: 'higher',
        safety_improvement: 'Eliminates chloroform and toxic byproduct formation. AHP is a stable, effective, and safe high-level disinfectant.',
        commercial_names: ['Virox Rescue', 'CloroxPro Hydrogen Peroxide Disinfectant'],
        business_advantage: 'Superior safety profile, non-toxic byproducts (oxygen and water), and broad-spectrum efficacy. Reduces liability and enhances worker safety.'
      }
    ]
  }
};

// Helper functions
const normalizeChemicalName = (name) => {
    const map = {
        'bleach': 'sodium hypochlorite',
        'baking soda': 'sodium hydrogen carbonate',
        'vinegar': 'ethanoic acid',
        'rubbing alcohol': 'propan-2-ol',
        'ammonia': 'ammonia',
        'hydrogen peroxide': 'hydrogen peroxide',
        'muriatic acid': 'hydrogen chloride',
        'caustic soda': 'sodium hydroxide',
        'lye': 'sodium hydroxide',
        'benzene': 'benzene',
        'water': 'water'
    };
    return map[name.toLowerCase().trim()] || name.toLowerCase().trim();
};

const createChemicalKey = (chemicalNames) => {
    return chemicalNames
        .map(normalizeChemicalName)
        .sort()
        .join('+');
};

const performScientificAnalysis = (chemicals) => {
    const key = createChemicalKey(chemicals.map(c => c.scientific_name || c.name));
    if (VERIFIED_CHEMICAL_REACTIONS[key]) {
        return {
            found: true,
            hazardData: VERIFIED_CHEMICAL_REACTIONS[key],
        };
    }
    return { found: false };
};

// This function is kept for persona-specific alternatives for VERIFIED reactions.
const generatePersonaSpecificAlternatives = (chemicals, persona, riskScore) => {
  const chemicalKey = createChemicalKey(chemicals.map(c => c.scientific_name || c.name));
  
  // Check for specific alternatives in our database
  if (SAFER_ALTERNATIVES_DATABASE[chemicalKey] && SAFER_ALTERNATIVES_DATABASE[chemicalKey][persona]) {
    return SAFER_ALTERNATIVES_DATABASE[chemicalKey][persona];
  }
  
  // Fallback based on risk level and persona
  const chemicalNames = chemicals.map(c => c.name);
  const allOriginalChemicalsStr = chemicalNames.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' & ');

  if (riskScore >= 70) {
    return [{
      original_chemical: allOriginalChemicalsStr,
      alternative_chemical: "Professional Hazmat Disposal & Safer Process",
      effectiveness_rating: 90, safety_rating: 100, sustainability_rating: 80, cost_comparison: 'higher',
      safety_improvement: "Completely avoids dangerous reactions by proper disposal and adoption of verified safe alternatives.",
      commercial_names: ["Professional hazardous waste services", "EPA-approved eco-friendly alternatives"],
      specific_action: "Do NOT mix; contact local hazmat facility. Replace with certified safe alternatives."
    }];
  }

  return [{
      original_chemical: allOriginalChemicalsStr,
      alternative_chemical: "Use with Enhanced Safety Protocols",
      effectiveness_rating: 80, safety_rating: 90, sustainability_rating: 85, cost_comparison: 'lower',
      safety_improvement: "Minimizes risks through proper PPE, ventilation, and controlled conditions.",
      commercial_names: ["Standard safety equipment", "Proper ventilation systems"],
      specific_action: "Use in well-ventilated areas with appropriate personal protective equipment."
  }];
};

const parseAIResponse = (response, chemicalNames) => {
  const defaultFallback = {
    risk_assessment: {
      overall_risk_score: 55,
      health_impact_score: 60,
      environmental_impact_score: 50,
      reactivity_score: 50,
      recommendation: "Chemical interaction analysis incomplete. Exercise extreme caution and consult safety data sheets immediately."
    },
    safety_status: { 
      level: "CAUTION", 
      warnings: ["Analysis incomplete - exercise caution", "Do not mix without proper safety research"] 
    },
    reaction_details: {
      products_formed: [
        { name: "Unknown products", formula: "Analysis Required", hazards: ["Potentially Hazardous"] }
      ],
      balanced_equation: `${chemicalNames.join(' + ')} → Analysis Required`,
      reaction_mechanism: "Interaction mechanism requires detailed analysis and experimental verification.",
      what_happens: "Chemical interaction outcome is uncertain - potential for unpredictable reactions.",
      peer_reviewed_source: "Analysis required for this specific combination"
    },
    safer_alternatives: [{
        original_chemical: chemicalNames.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' & '),
        alternative_chemical: "Professional Consultation Advised",
        effectiveness_rating: 80, safety_rating: 95, sustainability_rating: 85, cost_comparison: 'varies',
        safety_improvement: "Consulting with a chemical safety expert or reviewing official Safety Data Sheets (SDS) is the safest alternative for unverified reactions.",
        commercial_names: ["Safety Data Sheets (SDS)", "Chemical Safety Consultant"],
        specific_action: "Do not proceed without expert consultation or official documentation."
    }],
    energy_profile: { type: "Unknown", energy_change: 0, activation_energy: 0 } // Add default energy profile
  };

  try {
    let parsed;
    if (typeof response === 'object' && response !== null) {
        parsed = response;
    } else if (typeof response === 'string') {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON object found in AI response string.');
      }
    } else {
      throw new Error('Invalid AI response type.');
    }
    
    // Deep merge parsed data over defaults
    const result = {
      risk_assessment: { ...defaultFallback.risk_assessment, ...parsed.risk_assessment },
      safety_status: { ...defaultFallback.safety_status, ...parsed.safety_status },
      reaction_details: { ...defaultFallback.reaction_details, ...parsed.reaction_details },
      safer_alternatives: parsed.safer_alternatives || defaultFallback.safer_alternatives,
      energy_profile: { ...defaultFallback.energy_profile, ...parsed.energy_profile } // Merge energy profile
    };

    // Ensure products_formed is always an array with proper structure
    if (!result.reaction_details.products_formed || !Array.isArray(result.reaction_details.products_formed) || result.reaction_details.products_formed.length === 0) {
      result.reaction_details.products_formed = defaultFallback.reaction_details.products_formed;
    } else {
       result.reaction_details.products_formed = result.reaction_details.products_formed.map(p => ({
         name: p.name || 'Unknown',
         formula: p.formula || 'N/A',
         hazards: p.hazards || []
       }));
    }

    return result;

  } catch (error) {
    console.warn('AI Response parsing failed, using conservative fallback:', error);
    return defaultFallback;
  }
};

const ADVANCED_PERSONAS = new Set(['business', 'teacher', 'researcher']);

export default function Simulator() {
  const { user, refreshUser } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const [activeMode, setActiveMode] = useState("simulator"); // "simulator" | "matrix" | "sds"
  const [persona, setPersona] = useState(null);
  const [step, setStep] = useState(1);
  const [chemicals, setChemicals] = useState([]);

  const [sdsSourceBanner, setSdsSourceBanner] = React.useState(null);

  // Pre-populate chemicals from URL params (e.g. from SDS Analyzer)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chemParam = urlParams.get("chemicals");
    const source = urlParams.get("source");
    const sdsProduct = urlParams.get("sds_product");

    if (source === "sds" && sdsProduct) {
      setSdsSourceBanner(sdsProduct);
    }

    if (chemParam) {
      const names = chemParam.split(",").map(n => n.trim()).filter(Boolean);
      if (names.length > 0) {
        const preloaded = names.map((name, i) => ({
          id: Date.now() + i,
          name,
          scientific_name: name,
          concentration: 0,
          concentrationUnit: 'M',
          purity: 99.9,
        }));
        setChemicals(preloaded);
        // Default to researcher persona so they can run immediately
        setPersona("researcher");
      }
    }
  }, []);
  const [simulationData, setSimulationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFeedbackNotification, setShowFeedbackNotification] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedIngredientForSupplier, setSelectedIngredientForSupplier] = useState(null);

  const queryClient = useQueryClient();

  const addChemical = (chemicalObject) => {
    if (!chemicalObject?.name) return;
    
    setChemicals(prev => {
      // Find existing chemical by id or name
      const existingIndex = prev.findIndex(c => 
        c.id === chemicalObject.id || 
        (c.scientific_name || c.name) === (chemicalObject.scientific_name || chemicalObject.name)
      );
      
      if (existingIndex !== -1) {
        // Update existing chemical - preserve id
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...chemicalObject };
        return updated;
      } else {
        // Add new chemical
        return [...prev, {
          id: chemicalObject.id || Date.now(),
          concentration: 0,
          concentrationUnit: 'M',
          purity: 99.9,
          ...chemicalObject
        }];
      }
    });
  };

  const removeChemical = (id) => {
    setChemicals(prev => prev.filter(c => c.id !== id));
  };
  
  const awardPointsMutation = useMutation({
    mutationFn: async ({ points, reason }) => {
        if (!user?.id) { // Ensure user is logged in before attempting to award points
            throw new Error("User not authenticated for awarding points.");
        }
        
        // Get current points and add new points
        const currentPoints = user.reward_points || 0;
        const newPoints = currentPoints + points;
        
        // Update user's reward points
        return base44.auth.updateMe({ reward_points: newPoints });
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['user']); // Invalidate user query to refresh points
        if(refreshUser) refreshUser(); // Refresh user context
    },
    onError: (err) => {
        console.error('Failed to award points:', err);
    }
  });

  const awardPoints = async (points, reason) => {
      try {
          await awardPointsMutation.mutateAsync({ points, reason });
          console.log(`Awarded ${points} points for: ${reason}.`);
      } catch (error) {
          console.error('Failed to award points (mutation caller):', error.message);
      }
  };

  const handleSimulate = async (enhancedData) => {
    if (chemicals.length < 2) {
      setError("Please add at least 2 chemicals to run a simulation.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSimulationData(null);

    try {
      // Delegate entirely to the centralised backend skill
      const skillResponse = await getAccurateChemicalAnalysis({
        chemicals: chemicals.map(c => c.name || c.scientific_name),
        persona,
        conditions: enhancedData?.experimentalConditions || {}
      });

      const analysisResult = skillResponse.data;

      // Attach the full chemical objects (with concentration, purity etc.) back to the result
      const finalData = {
        ...analysisResult,
        chemicals,
        persona,
      };

      // Attach experimental parameters from the UI input form
      const { parameterSets = [], experimentalConditions = {}, safetyProtocols = {} } = enhancedData || {};
      const riskScore = finalData.risk_assessment?.overall_risk_score || 50;
      const isHighHazard = riskScore > 70;

      finalData.experimental_analysis = {
        conditions: (parameterSets.length > 0 ? parameterSets : [{}]).map((c, i) => ({
          id: i + 1,
          temperature: c.temperature ?? 25,
          pressure: c.pressure ?? 1,
          time: c.time ?? 10,
          yield: isHighHazard ? Math.random() * 10 : Math.random() * 60 + 20,
          selectivity: isHighHazard ? Math.random() * 20 : Math.random() * 80 + 10,
          rate: isHighHazard ? 'dangerous and rapid' : riskScore > 40 ? 'moderate' : 'slow',
          side_reactions: isHighHazard
            ? 'DANGEROUS: Significant formation of toxic or explosive by-products likely'
            : riskScore > 40 ? 'Caution: Monitor for unexpected products or side reactions' : 'Minor side reactions possible, generally negligible'
        })),
        optimization_recommendations: {
          yield_optimization: isHighHazard
            ? 'DO NOT PROCEED — Severe safety risks. Use safer verified alternatives.'
            : 'Optimise temperature, concentration, and catalyst presence for improved yield.',
          safety_optimization: isHighHazard
            ? 'NEVER MIX THESE CHEMICALS — Use safer, verified alternatives.'
            : 'Ensure strict adherence to PPE and operate under a fume hood with adequate ventilation.'
        }
      };

      finalData.experimentalConditions = experimentalConditions;
      finalData.safetyProtocols = safetyProtocols;
      finalData.parameterSets = parameterSets;
      
      setSimulationData(finalData);
      setStep(2);

      // Increment usage for free tier users
      if (user && trialStatus && !trialStatus.isPro) {
        await incrementUsage(user, 'simulations').catch(console.error);
        if (refreshUser) refreshUser();
      }

      // Save simulation to database
      try {
        await base44.entities.Simulation.create({
          chemicals: chemicals.map(c => c.name || c.scientific_name),
          risk_score: finalData.risk_assessment?.overall_risk_score || 0,
          reaction_summary: finalData.reaction_details?.what_happens || finalData.risk_assessment?.recommendation || '',
          health_impact: finalData.risk_assessment?.health_impact_score || 0,
          environmental_impact: finalData.risk_assessment?.environmental_impact_score || 0,
          voc_level: 0,
          reactivity: finalData.risk_assessment?.reactivity_score || 0,
          hazard_symbols: finalData.safety_status?.level === 'FATAL' || finalData.safety_status?.level === 'DANGEROUS' 
            ? ['toxic'] 
            : finalData.safety_status?.level === 'MODERATE' 
            ? ['irritant'] 
            : [],
          ai_recommendation: finalData.risk_assessment?.recommendation || '',
          safer_alternatives: finalData.safer_alternatives || []
        });
        // Auto-save to Workspace
        base44.entities.WorkspaceSession.create({
          title: `Simulation: ${chemicals.map(c => c.name || c.scientific_name).join(' + ')}`,
          type: 'simulation',
          snapshot: {
            chemicals: chemicals.map(c => c.name || c.scientific_name),
            risk_score: finalData.risk_assessment?.overall_risk_score || 0,
            safety_level: finalData.safety_status?.level,
            persona
          }
        }).catch(() => {});
      } catch (saveError) {
        console.error('Failed to save simulation:', saveError);
      }

      await awardPoints(5, "Chemical simulation completed");

      // Send email notification
      if (user) {
        sendFeatureUsageEmail(user, 'simulation', {
          chemicals: chemicals.map(c => c.name || c.scientific_name),
          riskScore: finalData.risk_assessment?.overall_risk_score,
          safetyLevel: finalData.safety_status?.level,
          recommendation: finalData.risk_assessment?.recommendation
        });
      }

      setShowFeedbackNotification(true);
      setTimeout(() => setShowFeedbackNotification(false), 8000);

    } catch (error) {
      console.error("Simulation failed:", error);
      setError("Failed to run simulation: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ rating, feedback, chemicals_tested, helpful, points_earned }) => {
        return base44.entities.Review.create({
            feature_used: 'simulator',
            rating,
            feedback: feedback || null,
            chemicals_tested,
            helpful,
            points_earned
        });
    },
    onSuccess: async (data, variables) => {
        queryClient.invalidateQueries(['feedback']); // Invalidate feedback queries
        if (variables.points_earned && user?.id) {
            await awardPoints(variables.points_earned, 'Feedback submitted');
        }
        setShowFeedbackModal(false);
        setShowFeedbackNotification(false);
    },
    onError: (err) => {
        console.error("Failed to submit feedback:", err);
        setShowFeedbackModal(false);
    }
  });

  const handleFeedbackSubmit = async (rating, feedback) => {
    await submitFeedbackMutation.mutateAsync({
      rating,
      feedback,
      chemicals_tested: chemicals.map(c => c.name),
      helpful: rating >= 4,
      points_earned: 5
    });
  };

  const viewAlternatives = () => setStep(3);
  const backToAnalysis = () => setStep(2);
  
  const startNewSimulation = () => {
    setStep(1);
    setChemicals([]);
    setSimulationData(null);
    setPersona(null); // Reset persona as well for a completely new flow
  };
  
  const handleSelectPersona = (selectedPersona) => {
    setPersona(selectedPersona);
  };

  const handleBackToPersonaSelection = () => {
    setPersona(null);
    setChemicals([]); // Clear chemicals when going back to persona selection
    setStep(1); // Reset to step 1
    setSimulationData(null); // Clear any simulation data
  };

  const isResearchMode = persona === 'researcher' || persona === 'teacher';
  const isBusinessMode = persona === 'business';

  return (
    <AuthGate featureName="Chemical Simulator" featureDescription="Test chemical interactions safely with our advanced simulation engine. Start your 14-day free trial to save simulations and access the full database.">
      <SEOHead {...pageSEO.simulator} />
      {user && !trialStatus.isPro && !trialStatus.canSimulate ? (
        <TrialExpiredBanner featureName="Chemical Simulator" />
      ) : (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#EDF7F2' }}>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-6 px-2">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm overflow-x-auto max-w-full no-scrollbar">
              <button
                onClick={() => setActiveMode("simulator")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeMode === "simulator"
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FlaskConical className="w-4 h-4 flex-shrink-0" /> <span>Simulator</span>
              </button>
              <button
                onClick={() => setActiveMode("matrix")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeMode === "matrix"
                    ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Grid3X3 className="w-4 h-4 flex-shrink-0" /> <span>Hazard Matrix</span>
              </button>
              <button
                onClick={() => setActiveMode("sds")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeMode === "sds"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" /> <span>SDS Analyzer</span>
              </button>
              <button
                onClick={() => setActiveMode("inventory")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeMode === "inventory"
                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Package className="w-4 h-4 flex-shrink-0" /> <span>Inventory</span>
              </button>
            </div>
          </div>

          {/* Hazard Interaction Matrix mode */}
          {activeMode === "matrix" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-2 border-red-100">
                <CardContent className="p-6">
                  <HazardInteractionMatrix />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Chemical Inventory mode */}
          {activeMode === "inventory" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-2 border-teal-100">
                <CardContent className="p-6">
                  <ChemicalInventoryManager
                    onAddToSimulation={(item) => {
                      addChemical({
                        id: Date.now(),
                        name: item.name,
                        scientific_name: item.scientific_name || item.name,
                        concentration: item.concentration || 0,
                        concentrationUnit: item.concentration_unit || "M",
                        purity: item.purity || 99.9,
                      });
                      setActiveMode("simulator");
                      if (!persona) setPersona("researcher");
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* SDS Analyzer mode */}
          {activeMode === "sds" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}>
                <SDSAnalyzerPanel />
              </Suspense>
            </motion.div>
          )}

          {activeMode === "simulator" && !persona ? (
            <PersonaSelector onSelectPersona={(selectedPersona) => setPersona(selectedPersona)} />
          ) : activeMode === "simulator" ? (
            <>
              {/* Header Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                    Chemical Interaction Simulator
                  </h1>
                  <span className={`px-4 py-1.5 text-sm font-semibold rounded-full capitalize ${
                    {
                      business: 'bg-slate-900 text-white',
                      researcher: 'bg-slate-700 text-white',
                      teacher: 'bg-teal-600 text-white',
                      student: 'bg-blue-600 text-white',
                      diy: 'bg-orange-600 text-white',
                      chef: 'bg-amber-600 text-white',
                      manufacturer: 'bg-red-700 text-white',
                      engineer: 'bg-cyan-700 text-white',
                      pharma: 'bg-purple-600 text-white',
                      doctor: 'bg-blue-700 text-white',
                      nurse: 'bg-pink-600 text-white',
                      eco: 'bg-green-700 text-white',
                      cosmetic: 'bg-rose-500 text-white',
                      safety: 'bg-red-600 text-white',
                      lab: 'bg-violet-600 text-white',
                    }[persona] || 'bg-green-600 text-white'
                  }`}>
                    {persona?.replace(/_/g, ' ') || 'Household'}
                  </span>
                </div>
                <p className="text-base text-slate-600 max-w-2xl mx-auto">
                  {isBusinessMode
                    ? "Professional safety analysis for cosmetic and skincare formulations"
                    : isResearchMode 
                    ? "Advanced scientific analysis with comprehensive experimental control and documentation" 
                    : "Understand how chemicals interact safely in everyday life"}
                </p>
              </motion.div>

              {/* SDS Source Banner */}
              {sdsSourceBanner && step === 1 && (
                <div className="mb-4 flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                  <FileText className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-teal-800">
                      Chemicals loaded from SDS: <span className="font-bold">{sdsSourceBanner}</span>
                    </p>
                    <p className="text-xs text-teal-600 mt-0.5">
                      Add at least one more chemical below, then run the simulation.
                    </p>
                  </div>
                  <button onClick={() => setSdsSourceBanner(null)} className="text-teal-400 hover:text-teal-600 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-center shadow-sm"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                </motion.div>
              )}

              {/* Progress Stepper */}
              <div className="flex justify-center items-center mb-10">
                <div className="flex items-center gap-3">
                  {['Setup', 'Analysis', 'Alternatives'].map((label, index) => (
                    <React.Fragment key={label}>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                            step >= (index + 1)
                              ? isBusinessMode
                                ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg scale-105"
                                : isResearchMode
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105"
                                : "bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)] text-white shadow-lg scale-105"
                              : "bg-white text-slate-400 border-2 border-slate-200 shadow-sm"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className={`text-xs mt-2 font-semibold ${step >= (index + 1) ? 'text-slate-800' : 'text-slate-400'}`}>
                          {label}
                        </span>
                      </motion.div>
                      {index < 2 && (
                        <div className={`w-16 h-0.5 rounded-full ${
                          step > (index + 1)
                            ? isBusinessMode
                              ? 'bg-gradient-to-r from-slate-900 to-slate-800'
                              : isResearchMode
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                              : 'bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)]'
                            : 'bg-slate-200'
                        } transition-all duration-500`}></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Suspense fallback={<div>Loading input form...</div>}>
                      {isBusinessMode ? (
                        <BusinessChemicalInput
                          chemicals={chemicals}
                          onAddChemical={addChemical}
                          onRunSimulation={handleSimulate}
                          onRemoveChemical={removeChemical}
                          isLoading={isLoading}
                          persona={persona}
                          onBackToPersonaSelection={handleBackToPersonaSelection}
                        />
                      ) : isResearchMode ? (
                        <ResearchChemicalInput
                          chemicals={chemicals}
                          onAddChemical={addChemical}
                          onRunSimulation={handleSimulate}
                          onRemoveChemical={removeChemical}
                          isLoading={isLoading}
                          persona={persona}
                          onBackToPersonaSelection={handleBackToPersonaSelection}
                        />
                      ) : (
                        <ChemicalInput
                          chemicals={chemicals}
                          onAddChemical={addChemical}
                          onRunSimulation={handleSimulate}
                          onRemoveChemical={removeChemical}
                          isLoading={isLoading}
                          persona={persona}
                          onBackToPersonaSelection={handleBackToPersonaSelection}
                        />
                      )}
                    </Suspense>
                  </motion.div>
                )}

                {step === 2 && simulationData && (
                   <motion.div
                     key="results"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     transition={{ duration: 0.3 }}
                     className="space-y-6"
                   >
                     <SimulationResults
                       data={simulationData}
                       chemicals={chemicals}
                       onViewAlternatives={() => setStep(3)}
                       onStartNew={startNewSimulation}
                       persona={persona}
                     />
                     <Card className="border-slate-200">
                       <CardContent className="p-6">
                         <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                           <DollarSign className="w-5 h-5 text-blue-600" />
                           Ingredient Cost Tracking
                         </h3>
                         <div className="space-y-2">
                           {chemicals.map((chem, idx) => (
                             <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
                               <p className="font-medium text-slate-900 text-sm">{chem.name || chem.scientific_name}</p>
                               <Button 
                                 size="sm" 
                                 variant="outline"
                                 onClick={() => {
                                   setSelectedIngredientForSupplier(chem.name || chem.scientific_name);
                                   setShowSupplierModal(true);
                                 }}
                                 className="text-xs"
                               >
                                 Link Suppliers
                               </Button>
                             </div>
                           ))}
                         </div>
                       </CardContent>
                     </Card>
                     <ComplianceAuditPanel
                       chemicals={chemicals}
                       persona={persona}
                       simulationData={simulationData}
                     />

                     {/* Version Tracker */}
                     <FormulaVersionTracker
                       chemicals={chemicals}
                       simulationData={simulationData}
                       onRevert={(revertedChemicals) => {
                         setChemicals(revertedChemicals);
                         setStep(1);
                         setSimulationData(null);
                       }}
                     />

                     {/* Comparison Chart */}
                     <FormulaComparisonChart
                       currentChemicals={chemicals}
                       currentMetrics={{
                         environmental_impact: simulationData?.risk_assessment?.environmental_impact_score ?? null,
                         health_impact: simulationData?.risk_assessment?.health_impact_score ?? null,
                         overall_risk: simulationData?.risk_assessment?.overall_risk_score ?? null,
                       }}
                     />

                     <SupplierManager />
                   </motion.div>
                 )}

                {step === 3 && simulationData && (
                  <motion.div
                    key="alternatives"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SaferAlternatives
                      alternatives={simulationData.safer_alternatives || []}
                      chemicals={chemicals.map(c => c.scientific_name || c.name)}
                      riskAssessment={simulationData.risk_assessment}
                      onStartNew={startNewSimulation}
                      onBackToAnalysis={() => setStep(2)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : null}
        </div>

        {/* Subtle Feedback Notification - Bottom Right */}
        <AnimatePresence>
          {showFeedbackNotification && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed bottom-6 right-6 z-50 max-w-sm"
            >
              <Card className="bg-white/95 backdrop-blur-sm border border-green-200 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)] rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">
                        How was your simulation?
                      </h4>
                      <p className="text-slate-600 text-xs mb-3">
                        Help us improve by sharing your experience
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setShowFeedbackModal(true)}
                          className="bg-[var(--suttain-teal)] hover:bg-[#028a7f] text-white text-xs px-3 py-1 h-7"
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

        {/* Optional Feedback Modal */}
        <Suspense fallback={null}>
          {showFeedbackModal && (
            <RatingModal
              isOpen={showFeedbackModal}
              onClose={() => setShowFeedbackModal(false)}
              onSubmit={handleFeedbackSubmit}
              featureType="simulation"
              title="Rate Your Simulation Experience"
              description="Your feedback helps us improve the chemical simulator"
            />
          )}
        </Suspense>

        {/* Supplier Link Modal */}
        {selectedIngredientForSupplier && (
          <SupplierLinkModal
            isOpen={showSupplierModal}
            onClose={() => setShowSupplierModal(false)}
            ingredientName={selectedIngredientForSupplier}
          />
        )}
      </div>
      )}
    </AuthGate>
  );
}