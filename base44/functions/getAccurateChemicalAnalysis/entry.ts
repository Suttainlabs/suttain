import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── Verified hardcoded hazard database (last-resort fallback only) ───────────
const VERIFIED_HAZARD_DATABASE = {
  'bleach+ammonia': {
    risk_score: 98, health_impact: 99, environmental_impact: 85, reactivity: 95,
    safety_level: 'FATAL',
    critical_warnings: [
      'FATAL: Produces toxic chloramine gas (NH2Cl)',
      'Inhalation can cause immediate respiratory failure and death',
      'IDLH — Immediately Dangerous to Life and Health'
    ],
    balanced_equation: 'NaClO + NH3 → NH2Cl + NaOH',
    reaction_mechanism: 'Hypochlorite oxidizes ammonia in a rapid redox reaction forming chloramines.',
    what_happens: 'Immediate formation of toxic chloramine gas that causes respiratory failure.',
    products_formed: [
      { name: 'chloramine', formula: 'NH2Cl', hazards: ['Chemical Warfare Agent', 'Fatal if Inhaled'] },
      { name: 'sodium hydroxide', formula: 'NaOH', hazards: ['Corrosive'] }
    ],
    energy_profile: { type: 'Exothermic', energy_change: -156, activation_energy: 5 },
    professional_recommendation: 'DO NOT MIX under any circumstances. Evacuate immediately.',
    emergency_response: {
      skin_contact: 'Remove contaminated clothing. Rinse with water for 20+ minutes. Seek emergency care.',
      eye_contact: 'Flush with water for 20+ minutes. Remove contact lenses. Seek emergency care.',
      inhalation: 'Move to fresh air immediately. Administer oxygen if available. Call emergency services.',
      ingestion: 'Do not induce vomiting. Rinse mouth. Give water if conscious. Seek emergency care.'
    }
  },
  'hydrochloric acid+bleach': {
    risk_score: 99, health_impact: 100, environmental_impact: 90, reactivity: 98,
    safety_level: 'FATAL',
    critical_warnings: [
      'FATAL: Produces highly toxic chlorine gas (Cl2)',
      'Chlorine gas is a chemical warfare agent',
      'Immediate evacuation required'
    ],
    balanced_equation: 'NaClO + 2HCl → Cl2 + H2O + NaCl',
    reaction_mechanism: 'Acid protonates hypochlorite to form hypochlorous acid, which reacts with chloride ions to produce elemental chlorine.',
    what_happens: 'Rapid, violent production of deadly chlorine gas.',
    products_formed: [
      { name: 'chlorine', formula: 'Cl2', hazards: ['Chemical Weapon', 'Fatal if Inhaled'] }
    ],
    energy_profile: { type: 'Exothermic', energy_change: -142, activation_energy: 8 },
    professional_recommendation: 'FATAL COMBINATION. Never mix acid with bleach.',
    emergency_response: {
      skin_contact: 'Flush with large quantities of water. Seek emergency care.',
      eye_contact: 'Flush with water for 20+ minutes. Seek emergency care.',
      inhalation: 'Move to fresh air. Seek emergency care immediately.',
      ingestion: 'Do not induce vomiting. Seek emergency care immediately.'
    }
  },
  'rubbing alcohol+bleach': {
    risk_score: 92, health_impact: 95, environmental_impact: 75, reactivity: 90,
    safety_level: 'DANGEROUS',
    critical_warnings: [
      'DANGER: Forms chloroform (CHCl3) — a carcinogen',
      'Causes liver and kidney damage',
      'Reaction can be violent and unpredictable'
    ],
    balanced_equation: 'C3H8O + 3NaClO → CHCl3 + CH3COONa + NaOH + H2O',
    reaction_mechanism: 'Bleach oxidizes isopropanol to acetone, which undergoes haloform reaction producing chloroform.',
    what_happens: 'Forms chloroform and other toxic chlorinated byproducts.',
    products_formed: [
      { name: 'chloroform', formula: 'CHCl3', hazards: ['Carcinogenic', 'CNS Depressant'] }
    ],
    energy_profile: { type: 'Exothermic', energy_change: -234, activation_energy: 18 },
    professional_recommendation: 'DANGEROUS COMBINATION. Never mix alcohol-based cleaners with bleach.',
    emergency_response: {
      skin_contact: 'Flush with water for 15 minutes. Seek medical attention.',
      eye_contact: 'Flush with water for 15 minutes. Seek medical attention.',
      inhalation: 'Move to fresh air. Seek medical attention.',
      ingestion: 'Do not induce vomiting. Seek medical attention.'
    }
  }
};

// ─── Name normalisation ───────────────────────────────────────────────────────
const normalise = (name) =>
  name.toLowerCase()
    .replace(/sodium hypochlorite/gi, 'bleach')
    .replace(/ammonium hydroxide|aqua ammonia/gi, 'ammonia')
    .replace(/muriatic acid/gi, 'hydrochloric acid')
    .replace(/acetic acid/gi, 'vinegar')
    .replace(/isopropyl alcohol|propan-2-ol/gi, 'rubbing alcohol')
    .trim();

// ─── Check hardcoded hazards ──────────────────────────────────────────────────
const checkHardcodedHazards = (chemicals) => {
  const normalised = chemicals.map(normalise);
  for (const [key, data] of Object.entries(VERIFIED_HAZARD_DATABASE)) {
    const parts = key.split('+');
    if (parts.every(p => normalised.some(n => n.includes(p) || p.includes(n)))) {
      return { found: true, data, key };
    }
  }
  return { found: false };
};

// ─── Persona recommendation map ──────────────────────────────────────────────
const personaContext = (persona) => {
  const map = {
    researcher: 'a laboratory researcher requiring precise scientific analysis, reaction mechanisms, peer-reviewed citations, and experimental parameters',
    business: 'a product formulation professional requiring regulatory compliance, commercial viability, and supplier recommendations',
    teacher: 'an educator needing clear explanations, educational value, demonstration safety, and student-accessible language',
    student: 'a student requiring simplified explanations with learning objectives and safe demonstration alternatives',
    diy: 'a DIY/home user needing plain-language safety warnings, household alternative substitutions, and basic precautions',
    household: 'a general household user needing clear safety warnings and safer product alternatives'
  };
  return map[persona] || map.household;
};

Deno.serve(async (req) => {
  const appId = Deno.env.get('BASE44_APP_ID');
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const chemicals = body.chemicals; // string[]
    const persona = body.persona || 'household';
    const conditions = body.conditions || {};

    if (!chemicals || !Array.isArray(chemicals) || chemicals.length < 2) {
      return Response.json({ error: 'At least 2 chemicals are required' }, { status: 400 });
    }

    console.log(`[${appId}] analyzeChemicals — user=${user.email} chemicals=${chemicals.join(', ')} persona=${persona}`);

    // ── Step 1: Check hardcoded fatal/dangerous combinations ─────────────────
    const hardcoded = checkHardcodedHazards(chemicals);
    if (hardcoded.found) {
      const d = hardcoded.data;
      console.log(`[${appId}] Hardcoded hazard detected: ${hardcoded.key}`);
      return Response.json(buildResponse({
        chemicals,
        persona,
        risk_assessment: {
          overall_risk_score: d.risk_score,
          health_impact_score: d.health_impact,
          environmental_impact_score: d.environmental_impact,
          reactivity_score: d.reactivity,
          recommendation: d.professional_recommendation
        },
        safety_status: { level: d.safety_level, warnings: d.critical_warnings },
        reaction_details: {
          products_formed: d.products_formed,
          balanced_equation: d.balanced_equation,
          reaction_mechanism: d.reaction_mechanism,
          what_happens: d.what_happens,
          peer_reviewed_source: 'OSHA Chemical Hazard Information Bulletin; EPA Hazardous Substance Fact Sheet'
        },
        energy_profile: d.energy_profile,
        health_and_safety: buildHealthSafety(d.risk_score, d.emergency_response),
        safer_alternatives: buildFallbackAlternatives(chemicals, persona, d.risk_score),
        persona_recommendations: buildPersonaRecommendations(persona, d.risk_score, d.safety_level),
        source: 'verified_database'
      }));
    }

    // ── Step 2: Query Chemical entity database ────────────────────────────────
    let dbChemicals = [];
    try {
      const dbResults = await Promise.all(
        chemicals.map(name =>
          base44.asServiceRole.entities.Chemical.filter({ name: { $regex: name, $options: 'i' } }, null, 1)
            .then(r => r[0] || null)
        )
      );
      dbChemicals = dbResults.filter(Boolean);
      console.log(`[${appId}] DB lookup: found ${dbChemicals.length}/${chemicals.length} chemicals`);
    } catch (dbErr) {
      console.error(`[${appId}] DB lookup failed:`, dbErr.message);
    }

    // ── Step 3: LLM analysis (fallback for unknown combinations) ─────────────
    const chemNamesStr = chemicals.join(', ');
    const dbContext = dbChemicals.length > 0
      ? `\n\nDatabase records found:\n${dbChemicals.map(c =>
          `- ${c.name}: safety_level=${c.safety_level}, chemical_type=${c.chemical_type}, cas=${c.cas_number || 'N/A'}`
        ).join('\n')}`
      : '';

    const prompt = `You are a world-class computational chemist and safety expert for the Suttain platform.
Analyze the chemical interaction between: ${chemNamesStr}.
User persona: ${personaContext(persona)}.
${dbContext}
Provide a comprehensive, scientifically accurate analysis. Cite real scientific journals or databases (PubChem, CAS, OSHA) as sources.
The safer_alternatives must be tailored specifically for a ${persona} user.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          risk_assessment: {
            type: 'object',
            properties: {
              overall_risk_score: { type: 'number' },
              health_impact_score: { type: 'number' },
              environmental_impact_score: { type: 'number' },
              reactivity_score: { type: 'number' },
              recommendation: { type: 'string' }
            },
            required: ['overall_risk_score', 'health_impact_score', 'environmental_impact_score', 'reactivity_score', 'recommendation']
          },
          safety_status: {
            type: 'object',
            properties: {
              level: { type: 'string', enum: ['SAFE', 'LOW', 'MODERATE', 'DANGEROUS', 'CRITICAL', 'FATAL'] },
              warnings: { type: 'array', items: { type: 'string' } }
            },
            required: ['level', 'warnings']
          },
          reaction_details: {
            type: 'object',
            properties: {
              products_formed: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    formula: { type: 'string' },
                    hazards: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['name', 'formula', 'hazards']
                }
              },
              balanced_equation: { type: 'string' },
              reaction_mechanism: { type: 'string' },
              what_happens: { type: 'string' },
              peer_reviewed_source: { type: 'string' }
            },
            required: ['products_formed', 'balanced_equation', 'reaction_mechanism', 'what_happens', 'peer_reviewed_source']
          },
          energy_profile: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['Exothermic', 'Endothermic'] },
              energy_change: { type: 'number' },
              activation_energy: { type: 'number' }
            },
            required: ['type', 'energy_change', 'activation_energy']
          },
          safer_alternatives: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                original_chemical: { type: 'string' },
                alternative_chemical: { type: 'string' },
                effectiveness_rating: { type: 'number' },
                safety_rating: { type: 'number' },
                sustainability_rating: { type: 'number' },
                cost_comparison: { type: 'string' },
                safety_improvement: { type: 'string' },
                commercial_names: { type: 'array', items: { type: 'string' } }
              },
              required: ['original_chemical', 'alternative_chemical', 'effectiveness_rating', 'safety_rating', 'sustainability_rating', 'cost_comparison', 'safety_improvement', 'commercial_names']
            }
          }
        },
        required: ['risk_assessment', 'safety_status', 'reaction_details', 'energy_profile', 'safer_alternatives']
      }
    });

    const riskScore = aiResponse?.risk_assessment?.overall_risk_score || 50;
    // Always derive safety level from the numerical score so label and value are consistent
    const safetyLevel = deriveSafetyLevel(riskScore);
    const safetyStatus = {
      level: safetyLevel,
      warnings: aiResponse?.safety_status?.warnings || []
    };

    return Response.json(buildResponse({
      chemicals,
      persona,
      risk_assessment: aiResponse.risk_assessment,
      safety_status: safetyStatus,
      reaction_details: aiResponse.reaction_details,
      energy_profile: aiResponse.energy_profile,
      health_and_safety: buildHealthSafety(riskScore),
      safer_alternatives: aiResponse.safer_alternatives,
      persona_recommendations: buildPersonaRecommendations(persona, riskScore, safetyLevel),
      source: dbChemicals.length > 0 ? 'db_plus_llm' : 'llm'
    }));

  } catch (error) {
    console.error(`[${appId}] getAccurateChemicalAnalysis error:`, error.message);
    return Response.json({ error: 'Analysis failed', details: error.message }, { status: 500 });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveSafetyLevel(riskScore) {
  if (riskScore >= 90) return 'FATAL';
  if (riskScore >= 75) return 'CRITICAL';
  if (riskScore >= 55) return 'DANGEROUS';
  if (riskScore >= 35) return 'MODERATE';
  if (riskScore >= 15) return 'LOW';
  return 'SAFE';
}

function buildResponse(params) {
  const { chemicals, persona, risk_assessment, safety_status, reaction_details, energy_profile, health_and_safety, safer_alternatives, persona_recommendations, source } = params;
  return {
    chemicals,
    persona,
    risk_assessment,
    safety_status,
    reaction_details,
    energy_profile,
    health_and_safety,
    safer_alternatives,
    persona_recommendations,
    source,
    analyzed_at: new Date().toISOString()
  };
}

function buildHealthSafety(riskScore, customEmergency) {
  const isHigh = riskScore > 70;
  return {
    toxicology_assessment: {
      acute_toxicity: isHigh
        ? 'High acute toxicity — immediate danger, highly corrosive, or fatal if inhaled/ingested.'
        : 'Low to moderate acute toxicity expected under normal handling conditions.',
      chronic_effects: isHigh
        ? 'Potential for severe long-term health effects including organ damage or carcinogenicity.'
        : 'No significant chronic effects anticipated with proper handling.',
      exposure_routes: ['Inhalation', 'Skin Contact', 'Eye Contact', 'Ingestion (potential)']
    },
    emergency_response_protocol: customEmergency || {
      skin_contact: 'Flush affected skin with water for 15–20 minutes. Remove contaminated clothing. Seek medical attention if irritation persists.',
      eye_contact: 'Flush eyes with water for 15–20 minutes. Remove contact lenses. Seek immediate medical attention.',
      inhalation: 'Move to fresh air. If breathing is difficult, administer oxygen. Seek immediate medical attention.',
      ingestion: 'Do NOT induce vomiting. Rinse mouth. If conscious, give 1–2 glasses of water. Seek immediate medical attention.'
    },
    environmental_impact_assessment: {
      biodegradability: isHigh ? 'Low biodegradability; potential for environmental persistence.' : 'Expected to biodegrade under standard conditions.',
      bioaccumulation: isHigh ? 'High bioaccumulation potential.' : 'Low bioaccumulation potential.',
      ecotoxicity: isHigh ? 'High ecotoxicity to aquatic life. Requires specialised waste disposal.' : 'Low ecotoxicity under normal use conditions.'
    }
  };
}

function buildPersonaRecommendations(persona, riskScore, safetyLevel) {
  const isHigh = riskScore > 70;
  const isFatal = safetyLevel === 'FATAL' || safetyLevel === 'CRITICAL';

  const base = {
    persona,
    risk_level: safetyLevel,
    proceed_advised: !isFatal && riskScore < 70
  };

  const map = {
    researcher: {
      ...base,
      ppe_required: isHigh ? ['Lab coat', 'Chemical splash goggles', 'Nitrile gloves', 'Face shield', 'Fume hood mandatory'] : ['Lab coat', 'Safety glasses', 'Nitrile gloves'],
      documentation: 'Complete a formal risk assessment (COSHH or institutional equivalent) before proceeding.',
      supervisor_approval_required: isHigh,
      key_action: isFatal ? 'Do not proceed. Consult safety officer.' : 'Review SDS sheets and complete lab risk assessment.'
    },
    business: {
      ...base,
      regulatory_flags: isHigh ? ['REACH compliance review required', 'GHS labelling mandatory', 'SDS must be updated'] : ['Standard GHS labelling applies'],
      supply_chain_note: 'Verify supplier CoA and SDS documentation before use in commercial formulations.',
      key_action: isFatal ? 'This combination is prohibited in commercial formulations. Consult regulatory advisor.' : 'Ensure full regulatory compliance before production scale-up.'
    },
    teacher: {
      ...base,
      classroom_safe: !isHigh,
      demonstration_note: isFatal ? 'This combination must never be demonstrated in a classroom.' : isHigh ? 'Requires controlled fume hood environment. Not suitable for student-facing demonstrations.' : 'Safe for supervised classroom demonstration with appropriate PPE.',
      student_ppe: ['Safety glasses', 'Apron'],
      key_action: isFatal ? 'Use a safer alternative for educational purposes.' : 'Brief students on safety protocols before demonstration.'
    },
    student: {
      ...base,
      key_action: isFatal ? 'Never attempt this combination. Inform your teacher or supervisor immediately.' : isHigh ? 'Only attempt under direct supervision in a controlled lab environment.' : 'Follow standard lab safety rules. Wear PPE.',
      learning_note: 'Review the reaction mechanism in your chemistry textbook before the lab session.'
    },
    diy: {
      ...base,
      key_action: isFatal ? 'Never mix these chemicals at home. Dispose of them separately at a hazardous waste facility.' : isHigh ? 'Avoid mixing these chemicals at home. Use commercially available safer alternatives.' : 'If used, ensure the area is well-ventilated and keep children and pets away.',
      safer_home_alternatives: isHigh ? ['Use dedicated single-purpose cleaning products', 'Never mix cleaning agents'] : ['Baking soda and vinegar for mild cleaning', 'Commercial all-purpose cleaners']
    },
    household: {
      ...base,
      key_action: isFatal ? 'Do not mix these products. If accidentally mixed, evacuate and call emergency services.' : isHigh ? 'Keep these products stored separately and never mix them.' : 'Use with adequate ventilation and keep out of reach of children.',
      disposal_note: 'Dispose of unused chemicals at your local hazardous waste facility.'
    }
  };

  return map[persona] || map.household;
}

function buildFallbackAlternatives(chemicals, persona, riskScore) {
  const chemStr = chemicals.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' & ');
  if (riskScore >= 70) {
    return [{
      original_chemical: chemStr,
      alternative_chemical: 'Professional Hazmat Disposal & Safer Verified Alternatives',
      effectiveness_rating: 90,
      safety_rating: 100,
      sustainability_rating: 80,
      cost_comparison: 'higher',
      safety_improvement: 'Completely avoids dangerous reactions through proper disposal and adoption of verified safe alternatives.',
      commercial_names: ['Professional hazardous waste services', 'EPA-approved alternatives']
    }];
  }
  return [{
    original_chemical: chemStr,
    alternative_chemical: 'Use with Enhanced Safety Protocols',
    effectiveness_rating: 80,
    safety_rating: 90,
    sustainability_rating: 85,
    cost_comparison: 'lower',
    safety_improvement: 'Minimises risks through proper PPE, ventilation, and controlled conditions.',
    commercial_names: ['Standard safety equipment', 'Proper ventilation systems']
  }];
}