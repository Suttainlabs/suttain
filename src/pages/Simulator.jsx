import React, { useState, useContext, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getAccurateChemicalAnalysis } from "@/functions/getAccurateChemicalAnalysis";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useTrialStatus from "../hooks/useTrialStatus";
import TrialExpiredBanner from "../components/trial/TrialExpiredBanner";
import SubscriptionLock from '@/components/shared/SubscriptionLock';
import SimulationStatusBanner from '@/components/shared/SimulationStatusBanner';
import AuthGate from "../components/auth/AuthGate";
import AuthContext from '../components/auth/AuthContext';
import ChemicalInput from "../components/simulator/ChemicalInput";
import SimulationResults from "../components/simulator/SimulationResults";
import SaferAlternatives from "../components/simulator/SaferAlternatives";
import PersonaSelector from "../components/simulator/PersonaSelector";
import SupplierManager from "../components/suppliers/SupplierManager";
import SupplierLinkModal from "../components/suppliers/SupplierLinkModal";
import ComplianceAuditPanel from "../components/simulator/ComplianceAuditPanel";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MessageSquare, Star, X, DollarSign, FlaskConical, FileText, Package } from "lucide-react";
import FormulaVersionTracker from "../components/simulator/FormulaVersionTracker";
import FormulaComparisonChart from "../components/simulator/FormulaComparisonChart";
import ChemicalInventoryManager from "../components/simulator/ChemicalInventoryManager";
import { sendFeatureUsageEmail } from "../components/shared/featureNotifications";
import SEOHead, { pageSEO } from "../components/shared/SEOHead";
import ConsumerWorkbench, { ModeTabs, WorkbenchGrid, SetupRail, ResultsRail } from "@/components/consumer/ConsumerWorkbench";

// Lazy load ResearchChemicalInput
const ResearchChemicalInput = lazy(() => import("../components/simulator/ResearchChemicalInput"));
// Lazy load BusinessChemicalInput
const BusinessChemicalInput = lazy(() => import("../components/simulator/BusinessChemicalInput"));
// Lazy load SDSAnalyzer inline panel
const SDSAnalyzerPanel = lazy(() => import("../pages/SDSAnalyzer"));

// Reaction analysis is now handled by the getAccurateChemicalAnalysis backend skill.
// Keeping this comment as a marker, the inline DB has been removed.
const _LEGACY_PLACEHOLDER = {}; // remove this file line if linter complains

// SCIENTIFICALLY VERIFIED REACTIONS DATABASE WITH ACCURATE PRODUCT FORMATION (LEGACY, kept for reference only)
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
  const [activeMode, setActiveMode] = useState("simulator"); // "simulator" | "sds" | "inventory"
  const [persona, setPersona] = useState(null);
  const [step, setStep] = useState(1);
  const [chemicals, setChemicals] = useState([]);

  const [sdsSourceBanner, setSdsSourceBanner] = React.useState(null);
  const autoSimulateRef = React.useRef(false);
  const location = useLocation();

  // Pre-populate chemicals from URL params (e.g. from SDS Analyzer or the
  // Safer Alternatives "Simulate This Chemical" action). Re-runs when the
  // query string changes so navigating to /Simulator?chemicals=... from within
  // the same page still reloads and auto-runs the new chemical.
  React.useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const chemParam = urlParams.get("chemicals") || urlParams.get("chemical");
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
        // Reset the flow so the new chemical is simulated fresh
        setSimulationData(null);
        setError(null);
        setStep(1);
      }
    }

    // Flag to auto-trigger simulation once chemicals are loaded
    if (urlParams.get("auto_simulate") === "true") {
      autoSimulateRef.current = true;
    }
  }, [location.search]);
  const [simulationData, setSimulationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
  

  const handleSimulate = async (enhancedData, chemicalsOverride) => {
    if (isLoading) return;
    if (!trialStatus.canSimulateCore) { setError('Monthly simulation limit reached. Subscribe to Core to continue.'); return; }
    const runChemicals = chemicalsOverride || chemicals;
    if (runChemicals.length < 1) {
      setError("Please add at least 1 chemical to run a simulation.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSimulationData(null);

    try {
      // Delegate entirely to the centralised backend skill
      const skillResponse = await getAccurateChemicalAnalysis({
        chemicals: runChemicals.map(c => c.name || c.scientific_name),
        persona,
        conditions: enhancedData?.experimentalConditions || {}
      });

      const analysisResult = skillResponse.data;

      // Attach the full chemical objects (with concentration, purity etc.) back to the result
      const finalData = {
        ...analysisResult,
        chemicals: runChemicals,
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
            ? 'DO NOT PROCEED, Severe safety risks. Use safer verified alternatives.'
            : 'Optimise temperature, concentration, and catalyst presence for improved yield.',
          safety_optimization: isHighHazard
            ? 'NEVER MIX THESE CHEMICALS, Use safer, verified alternatives.'
            : 'Ensure strict adherence to PPE and operate under a fume hood with adequate ventilation.'
        }
      };

      finalData.experimentalConditions = experimentalConditions;
      finalData.safetyProtocols = safetyProtocols;
      finalData.parameterSets = parameterSets;
      
      setSimulationData(finalData);
      setStep(2);

      // Increment usage for free tier users
      if (refreshUser) await refreshUser();

      // Saved history and workspace require paid Core (included with Research).
      if (trialStatus.hasCoreAccess) try {
        await base44.entities.Simulation.create({
          chemicals: runChemicals.map(c => c.name || c.scientific_name),
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
          title: `Simulation: ${runChemicals.map(c => c.name || c.scientific_name).join(' + ')}`,
          type: 'simulation',
          snapshot: {
            chemicals: runChemicals.map(c => c.name || c.scientific_name),
            risk_score: finalData.risk_assessment?.overall_risk_score || 0,
            safety_level: finalData.safety_status?.level,
            persona
          }
        }).catch(() => {});
      } catch (saveError) {
        console.error('Failed to save simulation:', saveError);
      }


      // Send email notification
      if (user) {
        sendFeatureUsageEmail(user, 'simulation', {
          chemicals: runChemicals.map(c => c.name || c.scientific_name),
          riskScore: finalData.risk_assessment?.overall_risk_score,
          safetyLevel: finalData.safety_status?.level,
          recommendation: finalData.risk_assessment?.recommendation
        });
      }


    } catch (error) {
      console.error("Simulation failed:", error);
      setError("Failed to run simulation: " + error.message);
    } finally {
      if (refreshUser) await refreshUser();
      setIsLoading(false);
    }
  };


  // Auto-trigger simulation when arriving from SaferAlternatives with auto_simulate=true
  React.useEffect(() => {
    if (autoSimulateRef.current && chemicals.length > 0 && persona && !isLoading && !simulationData) {
      autoSimulateRef.current = false;
      handleSimulate();
    }
  }, [chemicals, persona, isLoading, simulationData]);

  // Swap the original chemical for the selected alternative in the current
  // list, then re-run the simulation from scratch with the new combination.
  const handleSimulateAlternative = (alt) => {
    if (!alt?.alternative_chemical) return;

    const altName = String(alt.alternative_chemical).trim();
    const originalName = String(alt.original_chemical || '').trim().toLowerCase();

    const updatedChemicals = chemicals.map(c => {
      const currentName = String(c.scientific_name || c.name || '').trim().toLowerCase();
      if (currentName && (currentName === originalName || currentName.includes(originalName) || originalName.includes(currentName))) {
        return {
          ...c,
          id: Date.now() + Math.random(),
          name: altName,
          scientific_name: altName,
        };
      }
      return c;
    });

    // If no match was found (original was a combo label), fall back to
    // running the simulation with just the alternative chemical.
    const hasMatch = updatedChemicals.some(c => (c.scientific_name || c.name) === altName);
    const finalChemicals = hasMatch ? updatedChemicals : [
      { id: Date.now(), name: altName, scientific_name: altName, concentration: 0, concentrationUnit: 'M', purity: 99.9 }
    ];

    setChemicals(finalChemicals);
    setSimulationData(null);
    setStep(2);
    // Run with the swapped list directly to avoid stale-state closures.
    handleSimulate(null, finalChemicals);
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
    <AuthGate featureName="Chemical Analysis" featureDescription="Test chemical interactions safely with our advanced simulation engine. Start your 14-day free trial to save simulations and access the full database.">
      <SEOHead {...pageSEO.simulator} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6"><SimulationStatusBanner user={user} pillar="core" /></div>
      {!isLoading && simulationData && !trialStatus.canSimulateCore && <SubscriptionLock featureName="Core simulations" limit />}
      {user && !simulationData && !trialStatus.canSimulateCore ? (
        <TrialExpiredBanner featureName="Chemical Analysis" />
      ) : (
      <ConsumerWorkbench toolId="analysis" tag={activeMode === "simulator" && persona ? persona.replace(/_/g, ' ') : null}>
        <div className="relative">
          <ModeTabs
            label="Analysis mode"
            value={activeMode}
            onChange={setActiveMode}
            modes={[
              { id: "simulator", label: "Interaction check", icon: FlaskConical },
              { id: "sds", label: "SDS analyzer", icon: FileText },
              { id: "inventory", label: "Inventory", icon: Package },
            ]}
          />

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

              {/* Workbench: setup rail + results */}
              <WorkbenchGrid wide>
                <SetupRail flush label="Configuration" title={step === 1 ? "Set up your analysis" : "Your mixture"}>
                    <Suspense fallback={<div className="px-5 pb-5 text-sm text-research-muted">Loading input form…</div>}>
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
                </SetupRail>
                <ResultsRail
                  hasOutput={!!simulationData}
                  isRunning={isLoading}
                  runningText="Analysing how these chemicals interact…"
                  tag={step === 3 ? "Safer alternatives" : simulationData ? "Interaction analysis" : null}
                  emptyText="Add at least two chemicals on the left, then run the analysis. Results open here as guided steps: overview, structures, reaction, health and detailed analysis."
                >
              <AnimatePresence mode="wait">
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
                     {(isBusinessMode || isResearchMode) && (<>
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
                     </>)}
                     <ComplianceAuditPanel
                       chemicals={chemicals}
                       persona={persona}
                       simulationData={simulationData}
                     />

                     {(isBusinessMode || isResearchMode) && (<>
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
                     </>)}
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
                      onSimulateAlternative={handleSimulateAlternative}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
                </ResultsRail>
              </WorkbenchGrid>
            </>
          ) : null}
        </div>

        {/* Supplier Link Modal */}
        {selectedIngredientForSupplier && (
          <SupplierLinkModal
            isOpen={showSupplierModal}
            onClose={() => setShowSupplierModal(false)}
            ingredientName={selectedIngredientForSupplier}
          />
        )}
      </ConsumerWorkbench>
      )}
    </AuthGate>
  );
}