// Comprehensive learning modules database with persona-specific content

export const LEARNING_MODULES = {
  // BEGINNER MODULES - All personas start here
  'safety-fundamentals': {
    id: 'safety-fundamentals',
    title: 'Chemical Safety Fundamentals',
    description: 'Essential safety knowledge for working with chemicals',
    icon: 'Shield',
    color: 'bg-blue-500',
    level: 'beginner',
    duration: '15 min',
    points: 50,
    personas: ['all'],
    prerequisites: [],
    lessons: [
      {
        id: 'sf-1',
        title: 'Understanding Warning Labels',
        content: `Product labels are your first line of defense. Learn to read them correctly.

**GHS Pictograms:**
• Skull & Crossbones - Acute toxicity (fatal or toxic)
• Flame - Flammable materials
• Exclamation Mark - Irritant or harmful
• Corrosion - Corrosive to skin or metals
• Health Hazard - Serious health effects

**Signal Words:**
• DANGER - More severe hazards
• WARNING - Less severe hazards

**Always Check:**
• Hazard statements (H-codes)
• Precautionary statements (P-codes)
• First aid measures`,
        quiz: {
          question: 'What does the skull & crossbones pictogram indicate?',
          options: ['Product is old', 'Acute toxicity - fatal or toxic', 'Recyclable', 'Natural ingredients'],
          correct: 1,
          explanation: 'The skull & crossbones indicates acute toxicity, meaning the substance can be fatal or toxic if exposed.'
        }
      },
      {
        id: 'sf-2',
        title: 'Personal Protective Equipment',
        content: `PPE is essential when handling chemicals.

**Basic PPE:**
• Safety Glasses/Goggles - Protect eyes from splashes
• Chemical-Resistant Gloves - Nitrile or neoprene recommended
• Lab Coat or Apron - Protect clothing and skin
• Closed-Toe Shoes - Prevent foot exposure

**When to Use:**
• Always when handling unknown chemicals
• When mixing or diluting products
• When there's risk of splashing
• In poorly ventilated areas (add respirator)`,
        quiz: {
          question: 'Which type of gloves is recommended for chemical handling?',
          options: ['Cotton gloves', 'Leather gloves', 'Nitrile or neoprene gloves', 'No gloves needed'],
          correct: 2,
          explanation: 'Nitrile or neoprene gloves provide chemical resistance and protect against a wide range of substances.'
        }
      }
    ],
    certification: {
      id: 'cert-safety-basics',
      name: 'Chemical Safety Basics',
      passingScore: 80
    }
  },

  // INTERMEDIATE MODULES
  'mixing-hazards': {
    id: 'mixing-hazards',
    title: 'Chemical Mixing Hazards',
    description: 'Learn which chemicals should never be combined',
    icon: 'AlertTriangle',
    color: 'bg-red-500',
    level: 'intermediate',
    duration: '20 min',
    points: 75,
    personas: ['household', 'diy', 'student', 'teacher'],
    prerequisites: ['safety-fundamentals'],
    lessons: [
      {
        id: 'mh-1',
        title: 'Deadly Combinations',
        content: `Some common products create toxic gases when mixed.

**NEVER Mix These:**
• Bleach + Ammonia → Chloramine gas (toxic)
• Bleach + Vinegar → Chlorine gas (toxic)
• Bleach + Rubbing Alcohol → Chloroform (toxic)
• Hydrogen Peroxide + Vinegar → Peracetic acid (corrosive)

**Warning Signs of Dangerous Reaction:**
• Unusual colors or smoke
• Strong, unusual odors
• Bubbling or fizzing
• Heat generation
• Coughing or eye irritation

**If Exposed:**
1. Leave the area immediately
2. Get fresh air
3. Call Poison Control: 1-800-222-1222`,
        quiz: {
          question: 'What happens when bleach and ammonia are mixed?',
          options: ['Nothing', 'Better cleaning power', 'Chloramine gas is produced', 'Pleasant fragrance'],
          correct: 2,
          explanation: 'Mixing bleach and ammonia produces toxic chloramine gas which can cause serious respiratory harm.'
        }
      }
    ],
    certification: {
      id: 'cert-mixing-safety',
      name: 'Chemical Mixing Safety',
      passingScore: 85
    }
  },

  // ADVANCED - RESEARCHER SPECIFIC
  'reaction-kinetics': {
    id: 'reaction-kinetics',
    title: 'Reaction Kinetics & Thermodynamics',
    description: 'Advanced understanding of chemical reaction dynamics',
    icon: 'Atom',
    color: 'bg-indigo-500',
    level: 'advanced',
    duration: '45 min',
    points: 150,
    personas: ['researcher', 'teacher'],
    prerequisites: ['safety-fundamentals', 'mixing-hazards'],
    lessons: [
      {
        id: 'rk-1',
        title: 'Activation Energy & Reaction Rates',
        content: `Understanding how reactions proceed is crucial for safety.

**Activation Energy (Ea):**
• Minimum energy required to start a reaction
• Lower Ea = faster, more spontaneous reactions
• Catalysts lower Ea without being consumed

**Rate Equation:**
Rate = k[A]^m[B]^n

**Temperature Effects (Arrhenius Equation):**
k = Ae^(-Ea/RT)
• Doubling temperature can increase rate 2-4x
• Critical for storage and handling decisions

**Practical Implications:**
• Store temperature-sensitive chemicals properly
• Consider thermal runaway risks
• Use cooling for exothermic reactions`,
        quiz: {
          question: 'What effect does a catalyst have on activation energy?',
          options: ['Increases it', 'Decreases it', 'No effect', 'Eliminates it completely'],
          correct: 1,
          explanation: 'Catalysts lower the activation energy, making reactions proceed faster without being consumed.'
        }
      },
      {
        id: 'rk-2',
        title: 'Thermodynamic Considerations',
        content: `Understanding energy changes in reactions.

**Enthalpy (ΔH):**
• Exothermic (ΔH < 0): Releases heat
• Endothermic (ΔH > 0): Absorbs heat

**Safety Implications:**
• Highly exothermic reactions need cooling
• Thermal runaway risk in concentrated reactions
• Heat of mixing can be significant

**Gibbs Free Energy:**
ΔG = ΔH - TΔS
• ΔG < 0: Spontaneous reaction
• Important for predicting reaction direction`,
        quiz: {
          question: 'A reaction with ΔH = -250 kJ/mol is:',
          options: ['Endothermic', 'Exothermic', 'Neither', 'Impossible to determine'],
          correct: 1,
          explanation: 'Negative enthalpy change indicates an exothermic reaction that releases heat.'
        }
      }
    ],
    certification: {
      id: 'cert-reaction-kinetics',
      name: 'Reaction Kinetics Specialist',
      passingScore: 85
    }
  },

  // BUSINESS SPECIFIC
  'regulatory-compliance': {
    id: 'regulatory-compliance',
    title: 'Regulatory Compliance Essentials',
    description: 'Navigate chemical regulations for business',
    icon: 'FileCheck',
    color: 'bg-violet-500',
    level: 'intermediate',
    duration: '30 min',
    points: 100,
    personas: ['business'],
    prerequisites: ['safety-fundamentals'],
    lessons: [
      {
        id: 'rc-1',
        title: 'Understanding SDS Requirements',
        content: `Safety Data Sheets are legally required documents.

**16 Required SDS Sections:**
1. Identification
2. Hazard identification
3. Composition/ingredients
4. First-aid measures
5. Fire-fighting measures
6. Accidental release measures
7. Handling and storage
8. Exposure controls/PPE
9. Physical/chemical properties
10. Stability and reactivity
11. Toxicological information
12. Ecological information
13. Disposal considerations
14. Transport information
15. Regulatory information
16. Other information

**Business Requirements:**
• Maintain SDS for all chemicals
• Update within 90 days of new information
• Employee access required`,
        quiz: {
          question: 'How many sections are required in a Safety Data Sheet?',
          options: ['8', '12', '16', '20'],
          correct: 2,
          explanation: 'GHS-compliant Safety Data Sheets must contain exactly 16 sections in a specific order.'
        }
      }
    ],
    certification: {
      id: 'cert-compliance-basics',
      name: 'Regulatory Compliance Professional',
      passingScore: 90
    }
  },

  // STUDENT SPECIFIC
  'lab-safety-basics': {
    id: 'lab-safety-basics',
    title: 'Laboratory Safety for Students',
    description: 'Essential lab safety for academic settings',
    icon: 'FlaskConical',
    color: 'bg-teal-500',
    level: 'beginner',
    duration: '20 min',
    points: 60,
    personas: ['student', 'teacher'],
    prerequisites: [],
    lessons: [
      {
        id: 'lsb-1',
        title: 'Lab Safety Rules',
        content: `Essential rules for safe lab work.

**Before Starting:**
• Read all procedures completely
• Identify safety equipment locations
• Wear appropriate PPE
• Know emergency exits

**During Lab Work:**
• Never work alone
• Keep workspace clean
• Don't eat or drink in lab
• Report all accidents immediately
• Dispose of chemicals properly

**Emergency Procedures:**
• Know how to use eyewash station
• Know fire extinguisher locations
• Know emergency shower operation`,
        quiz: {
          question: 'What should you do FIRST before starting any lab work?',
          options: ['Start the experiment', 'Read all procedures completely', 'Put on gloves', 'Ask a friend'],
          correct: 1,
          explanation: 'Always read and understand all procedures before beginning any laboratory work.'
        }
      }
    ],
    certification: {
      id: 'cert-lab-safety',
      name: 'Laboratory Safety Certified',
      passingScore: 80
    }
  },

  // DIY SPECIFIC
  'diy-formulation': {
    id: 'diy-formulation',
    title: 'DIY Product Formulation Safety',
    description: 'Safe practices for home cosmetic and cleaner making',
    icon: 'Beaker',
    color: 'bg-orange-500',
    level: 'intermediate',
    duration: '25 min',
    points: 80,
    personas: ['diy', 'household'],
    prerequisites: ['safety-fundamentals'],
    lessons: [
      {
        id: 'df-1',
        title: 'Safe Ingredient Handling',
        content: `Best practices for DIY formulation.

**Safe Ingredients to Start:**
• Distilled water (base)
• Vegetable glycerin (humectant)
• Aloe vera gel (soothing)
• Essential oils (use sparingly!)
• Baking soda (cleaning)

**Caution Required:**
• Lye (sodium hydroxide) - for soap making only
• Citric acid - can cause burns
• Essential oils - dilute properly (1-2% max)

**Key Safety Rules:**
• Always use distilled water
• Sanitize all equipment
• Measure accurately
• Test pH when relevant
• Label everything clearly`,
        quiz: {
          question: 'What is the maximum recommended concentration for essential oils?',
          options: ['5-10%', '1-2%', '20%', 'Any amount is safe'],
          correct: 1,
          explanation: 'Essential oils should typically be used at 1-2% maximum concentration to avoid skin sensitization.'
        }
      }
    ],
    certification: {
      id: 'cert-diy-formulation',
      name: 'Safe DIY Formulator',
      passingScore: 80
    }
  },

  // ADVANCED SIMULATION
  'advanced-simulation': {
    id: 'advanced-simulation',
    title: 'Advanced Simulation Techniques',
    description: 'Master the chemical simulator for complex analyses',
    icon: 'TestTube',
    color: 'bg-cyan-500',
    level: 'advanced',
    duration: '35 min',
    points: 120,
    personas: ['researcher', 'teacher', 'business'],
    prerequisites: ['safety-fundamentals', 'mixing-hazards'],
    lessons: [
      {
        id: 'as-1',
        title: 'Multi-Chemical Simulations',
        content: `Advanced techniques for complex chemical systems.

**Setting Up Complex Simulations:**
• Add chemicals in order of reactivity
• Consider concentration effects
• Account for temperature changes
• Use parameter sets for systematic analysis

**Interpreting Results:**
• Risk scores are cumulative
• Check individual product hazards
• Review energy profiles
• Consider kinetic factors

**Best Practices:**
• Start with known reactions to validate
• Use literature values for comparison
• Document all parameters
• Save simulations for reference`,
        quiz: {
          question: 'When adding chemicals to a simulation, what order should you use?',
          options: ['Alphabetical', 'Random', 'Order of reactivity', 'Size of molecule'],
          correct: 2,
          explanation: 'Adding chemicals in order of reactivity helps predict reaction sequences accurately.'
        }
      }
    ],
    certification: {
      id: 'cert-advanced-sim',
      name: 'Advanced Simulation Expert',
      passingScore: 85
    }
  }
};

// Persona-specific learning paths
export const LEARNING_PATHS = {
  researcher: {
    name: 'Research Scientist Path',
    description: 'Advanced chemical safety and reaction analysis',
    icon: 'Microscope',
    color: 'from-indigo-500 to-purple-500',
    modules: ['safety-fundamentals', 'mixing-hazards', 'reaction-kinetics', 'advanced-simulation'],
    certificationGoal: 'Research Safety Specialist'
  },
  teacher: {
    name: 'Educator Path',
    description: 'Teaching chemical safety effectively',
    icon: 'GraduationCap',
    color: 'from-teal-500 to-cyan-500',
    modules: ['safety-fundamentals', 'lab-safety-basics', 'mixing-hazards', 'reaction-kinetics', 'advanced-simulation'],
    certificationGoal: 'Chemical Safety Educator'
  },
  student: {
    name: 'Student Path',
    description: 'Build a strong foundation in chemical safety',
    icon: 'BookOpen',
    color: 'from-blue-500 to-indigo-500',
    modules: ['safety-fundamentals', 'lab-safety-basics', 'mixing-hazards'],
    certificationGoal: 'Lab Safety Certified'
  },
  business: {
    name: 'Business Professional Path',
    description: 'Compliance and product safety for business',
    icon: 'Building2',
    color: 'from-violet-500 to-purple-500',
    modules: ['safety-fundamentals', 'regulatory-compliance', 'advanced-simulation'],
    certificationGoal: 'Business Safety Manager'
  },
  diy: {
    name: 'DIY Maker Path',
    description: 'Safe formulation for home projects',
    icon: 'Hammer',
    color: 'from-orange-500 to-amber-500',
    modules: ['safety-fundamentals', 'mixing-hazards', 'diy-formulation'],
    certificationGoal: 'Certified DIY Formulator'
  },
  household: {
    name: 'Home Safety Path',
    description: 'Keep your home safe from chemical hazards',
    icon: 'Home',
    color: 'from-green-500 to-emerald-500',
    modules: ['safety-fundamentals', 'mixing-hazards', 'diy-formulation'],
    certificationGoal: 'Home Safety Expert'
  }
};

// Calculate recommended modules based on progress and performance
export function getRecommendedModules(persona, completedModules, quizScores, usageStats) {
  const path = LEARNING_PATHS[persona] || LEARNING_PATHS.household;
  const recommendations = [];

  // Find next module in path that hasn't been completed
  for (const moduleId of path.modules) {
    if (!completedModules.includes(moduleId)) {
      const module = LEARNING_MODULES[moduleId];
      // Check prerequisites
      const prereqsMet = module.prerequisites.every(p => completedModules.includes(p));
      if (prereqsMet) {
        recommendations.push({
          ...module,
          reason: 'Next in your learning path'
        });
      }
    }
  }

  // Add usage-based recommendations
  if (usageStats?.simulations_run > 5 && !completedModules.includes('advanced-simulation')) {
    const simModule = LEARNING_MODULES['advanced-simulation'];
    const prereqsMet = simModule.prerequisites.every(p => completedModules.includes(p));
    if (prereqsMet && !recommendations.find(r => r.id === 'advanced-simulation')) {
      recommendations.push({
        ...simModule,
        reason: 'Based on your simulation activity'
      });
    }
  }

  if (usageStats?.formulas_created > 3 && !completedModules.includes('diy-formulation')) {
    const diyModule = LEARNING_MODULES['diy-formulation'];
    const prereqsMet = diyModule.prerequisites.every(p => completedModules.includes(p));
    if (prereqsMet && !recommendations.find(r => r.id === 'diy-formulation')) {
      recommendations.push({
        ...diyModule,
        reason: 'Based on your formula creation activity'
      });
    }
  }

  // Adaptive difficulty - if user scores well, suggest harder content
  const avgScore = quizScores.length > 0 
    ? quizScores.reduce((a, b) => a + b.score, 0) / quizScores.length 
    : 0;
  
  if (avgScore >= 90) {
    // Suggest advanced modules
    const advancedModules = Object.values(LEARNING_MODULES)
      .filter(m => m.level === 'advanced' && !completedModules.includes(m.id))
      .filter(m => m.prerequisites.every(p => completedModules.includes(p)));
    
    advancedModules.forEach(m => {
      if (!recommendations.find(r => r.id === m.id)) {
        recommendations.push({
          ...m,
          reason: 'Recommended based on your excellent performance'
        });
      }
    });
  }

  return recommendations.slice(0, 5); // Return top 5 recommendations
}

// Calculate skill level based on performance
export function calculateSkillLevel(completedModules, quizScores) {
  const moduleCount = completedModules.length;
  const avgScore = quizScores.length > 0 
    ? quizScores.reduce((a, b) => a + b.score, 0) / quizScores.length 
    : 0;

  if (moduleCount >= 5 && avgScore >= 90) return 'expert';
  if (moduleCount >= 3 && avgScore >= 80) return 'advanced';
  if (moduleCount >= 2 && avgScore >= 70) return 'intermediate';
  return 'beginner';
}