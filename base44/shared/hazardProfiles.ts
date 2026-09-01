// Shared authoritative hazard profiles for the Suttain platform.
// Used by:
//   - getAccurateChemicalAnalysis (simulator accuracy layer + compliance auditor)
//   - backfillChemicalHazards (database re-classification pass)
//
// Every entry is a curated, sourced hazard verdict. This is the authoritative
// floor: the AI's numeric risk score can never push a combination below it.

// ─── Per-chemical authoritative profiles ──────────────────────────────────────
// hazard_class values: carcinogen | reproductive_toxin | voc | oxidizer |
//   corrosive | sensitizer | environmental_toxin | flammable | toxic | none
// organic: true for any carbon-based compound (solvents, alcohols, aromatics,
//   hydrocarbons): used by the oxidizer + organic reaction rule.

export const HAZARD_PROFILES = {
  // ── Aromatic solvents / VOCs ──
  benzene: {
    aliases: ['c6h6', 'benzol', 'cyclohexatriene'],
    cas_number: '71-43-2',
    hazard_class: 'carcinogen',
    organic: true,
    risk_floor: 82,
    safety_level_floor: 'CRITICAL',
    ghs_codes: ['H350', 'H225', 'H304', 'H373'],
    signal_word: 'danger',
    primary_hazards: ['Known human carcinogen (IARC Group 1)', 'Highly flammable', 'Aspiration hazard', 'Chronic organ damage'],
    source: 'IARC Monographs; PubChem GHS; EPA IRIS',
  },
  toluene: {
    aliases: ['methylbenzene', 'phenylmethane', 'toluol'],
    cas_number: '108-88-3',
    hazard_class: 'reproductive_toxin',
    organic: true,
    risk_floor: 55,
    safety_level_floor: 'DANGEROUS',
    ghs_codes: ['H225', 'H304', 'H361d', 'H373', 'H315', 'H336'],
    signal_word: 'danger',
    primary_hazards: ['Suspected of damaging unborn child', 'Flammable', 'CNS depressant', 'Aspiration hazard'],
    source: 'ECHA REACH; PubChem GHS',
  },
  xylene: {
    aliases: ['dimethylbenzene', 'xylol', 'o-xylene', 'p-xylene', 'm-xylene'],
    cas_number: '1330-20-7',
    hazard_class: 'voc',
    organic: true,
    risk_floor: 50,
    safety_level_floor: 'DANGEROUS',
    ghs_codes: ['H226', 'H304', 'H312', 'H315', 'H319', 'H332'],
    signal_word: 'warning',
    primary_hazards: ['Flammable', 'Aspiration hazard', 'Skin and eye irritant', 'Respiratory irritant'],
    source: 'ECHA REACH; PubChem GHS',
  },

  // ── Strong oxidizers ──
  bleach: {
    aliases: ['sodium hypochlorite', 'naocl', 'liquid bleach', 'hypochlorite'],
    cas_number: '7681-52-9',
    hazard_class: 'oxidizer',
    organic: false,
    risk_floor: 55,
    safety_level_floor: 'DANGEROUS',
    ghs_codes: ['H314', 'H400', 'H290', 'H410'],
    signal_word: 'danger',
    primary_hazards: ['Strong oxidizer', 'Corrosive to skin and eyes', 'Very toxic to aquatic life', 'Releases chlorine gas with acids'],
    source: 'ECHA REACH; PubChem GHS; OSHA',
  },
  hydrogen_peroxide: {
    aliases: ['h2o2', 'dihydrogen dioxide', 'peroxide'],
    cas_number: '7722-84-1',
    hazard_class: 'oxidizer',
    organic: false,
    risk_floor: 62,
    safety_level_floor: 'DANGEROUS',
    ghs_codes: ['H271', 'H314', 'H332', 'H335'],
    signal_word: 'danger',
    primary_hazards: ['May cause fire or explosion (strong oxidizer)', 'Severe skin burns', 'Respiratory irritant'],
    source: 'ECHA REACH; PubChem GHS',
  },
  potassium_permanganate: {
    aliases: ['permanganate', 'kmno4'],
    cas_number: '7722-64-7',
    hazard_class: 'oxidizer',
    organic: false,
    risk_floor: 55,
    safety_level_floor: 'DANGEROUS',
    ghs_codes: ['H272', 'H302', 'H315', 'H319', 'H410'],
    signal_word: 'warning',
    primary_hazards: ['Strong oxidizer', 'Harmful if swallowed', 'Skin and eye irritant', 'Aquatic toxicity'],
    source: 'PubChem GHS; EPA',
  },

  // ── Strong acids ──
  'hydrochloric acid': {
    aliases: ['hcl', 'muriatic acid', 'spirits of salt'],
    cas_number: '7647-01-0',
    hazard_class: 'corrosive',
    organic: false,
    risk_floor: 55,
    safety_level_floor: 'DANGEROUS',
    ghs_codes: ['H314', 'H335', 'H290'],
    signal_word: 'danger',
    primary_hazards: ['Severe skin burns and eye damage', 'Respiratory irritant', 'Corrosive to metals'],
    source: 'ECHA REACH; PubChem GHS',
  },
  'sulfuric acid': {
    aliases: ['h2so4', 'oil of vitriol', 'battery acid'],
    cas_number: '7664-93-9',
    hazard_class: 'corrosive',
    organic: false,
    risk_floor: 68,
    safety_level_floor: 'DANGEROUS',
    ghs_codes: ['H314', 'H290'],
    signal_word: 'danger',
    primary_hazards: ['Severe burns and eye damage', 'Strong dehydrating agent', 'Corrosive to metals', 'Violent reaction with water'],
    source: 'ECHA REACH; PubChem GHS',
  },
  'nitric acid': {
    aliases: ['hno3', 'aqua fortis', 'engraver\u2019s acid'],
    cas_number: '7697-37-2',
    hazard_class: 'oxidizer',
    organic: false,
    risk_floor: 68,
    safety_level_floor: 'DANGEROUS',
    ghs_codes: ['H272', 'H314', 'H331', 'H290'],
    signal_word: 'danger',
    primary_hazards: ['Strong oxidizer', 'Severe burns', 'Toxic if inhaled', 'Releases nitrogen dioxide fumes'],
    source: 'ECHA REACH; PubChem GHS',
  },

  // ── Strong bases ──
  'sodium hydroxide': {
    aliases: ['naoh', 'lye', 'caustic soda'],
    cas_number: '1310-73-2',
    hazard_class: 'corrosive',
    organic: false,
    risk_floor: 55,
    safety_level_floor: 'DANGEROUS',
    ghs_codes: ['H314', 'H290'],
    signal_word: 'danger',
    primary_hazards: ['Severe skin burns and eye damage', 'Corrosive to metals', 'Violent exothermic reaction with acids'],
    source: 'ECHA REACH; PubChem GHS',
  },
  ammonia: {
    aliases: ['nh3', 'ammonium hydroxide', 'aqua ammonia'],
    cas_number: '1336-21-6',
    hazard_class: 'corrosive',
    organic: false,
    risk_floor: 45,
    safety_level_floor: 'MODERATE',
    ghs_codes: ['H314', 'H331', 'H400', 'H410'],
    signal_word: 'danger',
    primary_hazards: ['Corrosive', 'Toxic if inhaled', 'Respiratory irritant', 'Very toxic to aquatic life'],
    source: 'ECHA REACH; PubChem GHS',
  },

  // ── Alcohols / solvents ──
  'rubbing alcohol': {
    aliases: ['isopropyl alcohol', 'isopropanol', 'propan-2-ol', 'ipa', '2-propanol'],
    cas_number: '67-63-0',
    hazard_class: 'flammable',
    organic: true,
    risk_floor: 25,
    safety_level_floor: 'LOW',
    ghs_codes: ['H225', 'H319', 'H336', 'H373'],
    signal_word: 'danger',
    primary_hazards: ['Highly flammable', 'Eye irritant', 'May cause drowsiness', 'Forms chloroform with bleach'],
    source: 'PubChem GHS; OSHA',
  },
  ethanol: {
    aliases: ['ethyl alcohol', 'alcohol', 'etoh'],
    cas_number: '64-17-5',
    hazard_class: 'flammable',
    organic: true,
    risk_floor: 20,
    safety_level_floor: 'LOW',
    ghs_codes: ['H225', 'H319'],
    signal_word: 'danger',
    primary_hazards: ['Highly flammable', 'Eye irritant'],
    source: 'PubChem GHS',
  },
  methanol: {
    aliases: ['methyl alcohol', 'wood alcohol', 'ch3oh'],
    cas_number: '67-56-1',
    hazard_class: 'toxic',
    organic: true,
    risk_floor: 52,
    safety_level_floor: 'DANGEROUS',
    ghs_codes: ['H225', 'H301', 'H311', 'H331', 'H370'],
    signal_word: 'danger',
    primary_hazards: ['Highly flammable', 'Toxic if swallowed/inhaled/absorbed', 'Causes damage to optic nerve (blindness)'],
    source: 'ECHA REACH; PubChem GHS',
  },

  // ── Known carcinogens / toxins ──
  formaldehyde: {
    aliases: ['methanal', 'formalin', 'hcho'],
    cas_number: '50-00-0',
    hazard_class: 'carcinogen',
    organic: true,
    risk_floor: 76,
    safety_level_floor: 'CRITICAL',
    ghs_codes: ['H350', 'H317', 'H318', 'H341', 'H331'],
    signal_word: 'danger',
    primary_hazards: ['Known human carcinogen (IARC Group 1)', 'Skin and respiratory sensitizer', 'Severe eye damage', 'Suspected mutagen'],
    source: 'IARC Monographs; ECHA REACH; PubChem GHS',
  },
  chloroform: {
    aliases: ['trichloromethane', 'chcl3'],
    cas_number: '67-66-3',
    hazard_class: 'carcinogen',
    organic: true,
    risk_floor: 70,
    safety_level_floor: 'CRITICAL',
    ghs_codes: ['H351', 'H302', 'H315', 'H332', 'H361d', 'H373'],
    signal_word: 'danger',
    primary_hazards: ['Suspected of causing cancer', 'Harmful if swallowed or inhaled', 'CNS depressant', 'Suspected reproductive toxin'],
    source: 'IARC Monographs; ECHA REACH; PubChem GHS',
  },

  // ── Common / low-hazard ──
  water: {
    aliases: ['h2o', 'dihydrogen monoxide'],
    cas_number: '7732-18-5',
    hazard_class: 'none',
    organic: false,
    risk_floor: 0,
    safety_level_floor: 'SAFE',
    ghs_codes: [],
    signal_word: 'none',
    primary_hazards: [],
    source: 'Curated',
  },
  salt: {
    aliases: ['sodium chloride', 'nacl', 'table salt'],
    cas_number: '7647-14-5',
    hazard_class: 'none',
    organic: false,
    risk_floor: 3,
    safety_level_floor: 'SAFE',
    ghs_codes: [],
    signal_word: 'none',
    primary_hazards: [],
    source: 'Curated',
  },
  'baking soda': {
    aliases: ['sodium bicarbonate', 'nahco3', 'sodium hydrogen carbonate'],
    cas_number: '144-55-8',
    hazard_class: 'none',
    organic: false,
    risk_floor: 5,
    safety_level_floor: 'SAFE',
    ghs_codes: [],
    signal_word: 'none',
    primary_hazards: ['Mild irritant at high concentrations'],
    source: 'Curated',
  },
  vinegar: {
    aliases: ['acetic acid', 'ethanoic acid', 'ch3cooh'],
    cas_number: '64-19-7',
    hazard_class: 'corrosive',
    organic: true,
    risk_floor: 10,
    safety_level_floor: 'SAFE',
    ghs_codes: [],
    signal_word: 'none',
    primary_hazards: ['Mild irritant in dilute (vinegar) form; pure acetic acid is corrosive'],
    source: 'Curated',
  },
};

// ─── Name normalisation ───────────────────────────────────────────────────────
export function normaliseChemicalName(name) {
  if (!name) return '';
  let n = name.toLowerCase().trim();
  // Collapse common synonyms to canonical keys
  const synonymMap = {
    'sodium hypochlorite': 'bleach',
    'naocl': 'bleach',
    'liquid bleach': 'bleach',
    'ammonium hydroxide': 'ammonia',
    'aqua ammonia': 'ammonia',
    'muriatic acid': 'hydrochloric acid',
    'isopropyl alcohol': 'rubbing alcohol',
    'isopropanol': 'rubbing alcohol',
    'propan-2-ol': 'rubbing alcohol',
    '2-propanol': 'rubbing alcohol',
    'ethyl alcohol': 'ethanol',
    'methyl alcohol': 'methanol',
    'wood alcohol': 'methanol',
    'sodium bicarbonate': 'baking soda',
    'sodium hydrogen carbonate': 'baking soda',
    'sodium chloride': 'salt',
    'table salt': 'salt',
    'acetic acid': 'vinegar',
    'trichloromethane': 'chloroform',
    'methanal': 'formaldehyde',
    'formalin': 'formaldehyde',
    'methylbenzene': 'toluene',
    'dimethylbenzene': 'xylene',
    'caustic soda': 'sodium hydroxide',
    'lye': 'sodium hydroxide',
  };
  for (const [syn, canonical] of Object.entries(synonymMap)) {
    if (n === syn || n.includes(syn)) {
      n = canonical;
      break;
    }
  }
  return n;
}

// ─── Resolve a single chemical name to its authoritative profile ──────────────
export function resolveHazardProfile(name) {
  const normalised = normaliseChemicalName(name);
  // Direct key match
  if (HAZARD_PROFILES[normalised]) {
    return { name, matched: true, profile: HAZARD_PROFILES[normalised], key: normalised };
  }
  // Alias match
  for (const [key, profile] of Object.entries(HAZARD_PROFILES)) {
    if (profile.aliases && profile.aliases.some(a => normalised.includes(a) || a.includes(normalised))) {
      return { name, matched: true, profile, key };
    }
  }
  return { name, matched: false, profile: null, key: normalised };
}

// ─── Compute the authoritative floor for a combination of chemicals ──────────
// Returns the minimum risk score and safety level the combination can have,
// the trigger reasons, sources consulted, and hazard classes detected.
export function computeCombinationFloor(chemicalNames) {
  const resolved = chemicalNames.map(resolveHazardProfile);
  const matched = resolved.filter(r => r.matched);
  const triggerReasons = [];
  const sources = new Set();
  const hazardClasses = new Set();
  let floor = 0;

  for (const r of matched) {
    const p = r.profile;
    sources.add(p.source);
    hazardClasses.add(p.hazard_class);
    if (p.risk_floor > floor) floor = p.risk_floor;

    if (p.hazard_class === 'carcinogen') {
      triggerReasons.push(`${r.name} is a known carcinogen (${p.primary_hazards[0] || p.hazard_class}), minimum CRITICAL risk enforced`);
    }
    if (p.hazard_class === 'reproductive_toxin') {
      triggerReasons.push(`${r.name} is a suspected reproductive toxin`);
    }
  }

  // Combination reaction rules
  const hasOxidizer = matched.some(r => r.profile.hazard_class === 'oxidizer');
  const hasOrganic = matched.some(r => r.profile.organic === true);
  const hasAcid = matched.some(r => r.key === 'hydrochloric acid' || r.key === 'sulfuric acid' || r.key === 'nitric acid');
  const hasBase = matched.some(r => r.key === 'sodium hydroxide' || r.key === 'ammonia');

  // Oxidizer + organic = violent / toxic reaction (bleach + benzene, bleach + alcohol, etc.)
  if (hasOxidizer && hasOrganic) {
    if (floor < 88) floor = 88;
    triggerReasons.push('Strong oxidizer combined with an organic compound, risk of violent oxidation, fire, or toxic byproduct formation (e.g. chlorine gas, chloroform, phosgene)');
  }
  // Strong acid + strong base = violent exothermic neutralisation
  if (hasAcid && hasBase) {
    if (floor < 80) floor = 80;
    triggerReasons.push('Strong acid combined with strong base, violent exothermic neutralisation, splashing and boiling risk');
  }
  // Acid + oxidizer (acidified bleach, peroxide + acid) = toxic gas
  if (hasAcid && hasOxidizer) {
    if (floor < 85) floor = 85;
    triggerReasons.push('Acid combined with oxidizer, risk of toxic gas release (chlorine, nitrogen dioxide)');
  }

  const safetyLevel = deriveSafetyLevelFromScore(floor);

  // If nothing matched at all, we have no authoritative floor, return null
  // so the caller knows to rely on the AI output without clamping.
  if (matched.length === 0) {
    return {
      hasAuthoritativeData: false,
      floor: null,
      safetyLevel: null,
      triggerReasons: [],
      sources: [],
      hazardClasses: [],
      resolved: resolved,
    };
  }

  return {
    hasAuthoritativeData: true,
    floor,
    safetyLevel,
    triggerReasons,
    sources: Array.from(sources),
    hazardClasses: Array.from(hazardClasses),
    resolved,
  };
}

// ─── Safety-level derivation (simulator 6-level scale) ────────────────────────
export function deriveSafetyLevelFromScore(riskScore) {
  if (riskScore >= 90) return 'FATAL';
  if (riskScore >= 75) return 'CRITICAL';
  if (riskScore >= 55) return 'DANGEROUS';
  if (riskScore >= 35) return 'MODERATE';
  if (riskScore >= 15) return 'LOW';
  return 'SAFE';
}

// ─── Map a curated profile to the Chemical entity's 5-level scale ─────────────
// Chemical.safety_level enum: safe | moderate | hazardous | highly_hazardous | unknown
export function mapToDbSafetyLevel(profile) {
  if (!profile) return 'unknown';
  if (profile.hazard_class === 'carcinogen' || profile.risk_floor >= 75) return 'highly_hazardous';
  if (profile.hazard_class === 'oxidizer' || profile.hazard_class === 'corrosive' || profile.risk_floor >= 45) return 'hazardous';
  if (profile.risk_floor >= 15) return 'moderate';
  return 'safe';
}

// ─── Build authoritative warnings from the floor + profiles ───────────────────
export function buildAuthoritativeWarnings(floorResult) {
  if (!floorResult.hasAuthoritativeData) return [];
  const warnings = [];

  for (const r of floorResult.resolved) {
    if (!r.matched) continue;
    const p = r.profile;
    for (const hazard of p.primary_hazards) {
      warnings.push(`${r.name}: ${hazard}`);
    }
  }

  for (const reason of floorResult.triggerReasons) {
    // Avoid duplicating per-chemical warnings already covered
    if (!warnings.some(w => reason.includes(w.split(':')[0]))) {
      warnings.push(reason);
    }
  }

  return warnings;
}