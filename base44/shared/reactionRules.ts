// Curated reaction rules for common household combinations.
//
// These give a FIXED answer for known pairs, so identical inputs always return
// identical scores, products and equations (fix list A1, K1–K4). The language
// model is never asked to invent products or numbers. Combinations that match no
// rule are reported as "No known reaction" and scored from each chemical's own
// GHS hazards (see ghsScoring.ts).
//
// Product hazard tags are NOT stored here: they are looked up from each product's
// PubChem GHS record by CID at run time (K4). CIDs below were verified against
// PubChem on 2026-10-31.
//
// reviewed: false marks wording that still needs sign-off by Suttain's chemist.

export const RULES_VERSION = '2026-10-31.1';

const GROUPS: Record<string, string[]> = {
  bleach: ['bleach', 'sodium hypochlorite', 'calcium hypochlorite', 'hypochlorite', 'chlorine bleach'],
  ammonia: ['ammonia', 'ammonium hydroxide', 'aqueous ammonia'],
  hcl: ['hydrochloric acid', 'muriatic acid'],
  vinegar: ['vinegar', 'acetic acid'],
  isopropanol: ['rubbing alcohol', 'isopropyl alcohol', 'isopropanol', '2-propanol', 'propan-2-ol'],
  bicarbonate: ['baking soda', 'sodium bicarbonate', 'sodium hydrogen carbonate', 'bicarbonate of soda'],
  peroxide: ['hydrogen peroxide'],
  sls: ['sodium lauryl sulfate', 'sodium lauryl sulphate', 'sodium dodecyl sulfate', 'sodium dodecyl sulphate', 'sls'],
  citric: ['citric acid'],
};

export function normaliseName(name: string) {
  return String(name || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ') // "(3%)", "(household)"
    .replace(/[^a-z0-9\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function groupOf(name: string): string | null {
  const n = normaliseName(name);
  for (const [group, aliases] of Object.entries(GROUPS)) {
    if (aliases.some((a) => new RegExp(`(^|\\b)${escapeRe(a)}(\\b|$)`).test(n))) return group;
  }
  return null;
}

type Product = { name: string; formula: string; cid: number };
export type ReactionRule = {
  id: string;
  groups: string[];
  exact: boolean; // true: only fires when the inputs are exactly these groups
  reaction: boolean;
  risk: { overall: number; health: number; environment: number; reactivity: number };
  warnings: string[];
  equation: string | null;
  mechanism: string | null;
  what_happens: string;
  recommendation: string;
  products: Product[];
  emergency?: Record<string, string>;
  reviewed: boolean;
};

const EMERGENCY_TOXIC_GAS = {
  inhalation: 'Leave the area and get to fresh air immediately. Call Poison Control (US: 1-800-222-1222) or emergency services if anyone has trouble breathing.',
  skin_contact: 'Rinse skin with plenty of water for at least 15 minutes. Remove contaminated clothing.',
  eye_contact: 'Rinse eyes with water for at least 15 minutes, removing contact lenses if easy. Get medical advice.',
  ingestion: 'Do not induce vomiting. Rinse mouth and call Poison Control or emergency services.',
};

export const REACTION_RULES: ReactionRule[] = [
  {
    id: 'bleach+ammonia', groups: ['bleach', 'ammonia'], exact: false, reaction: true,
    risk: { overall: 98, health: 98, environment: 60, reactivity: 90 },
    warnings: [
      'Do not mix: bleach and ammonia release chloramine vapours.',
      'Toxic gas and severe respiratory irritant; can be life-threatening in enclosed spaces.',
    ],
    equation: 'NaClO + NH3 → NH2Cl + NaOH',
    mechanism: 'Hypochlorite chlorinates ammonia, forming chloramines (mainly monochloramine, NH2Cl). With excess hypochlorite, dichloramine and nitrogen trichloride can also form.',
    what_happens: 'Mixing releases chloramine vapours that irritate the eyes, nose, throat and lungs. In a small or poorly ventilated room exposure can be life-threatening.',
    recommendation: 'Never mix bleach with ammonia or ammonia-based glass cleaners. Use one product, rinse the surface with water, then use the other.',
    products: [
      { name: 'Chloramine', formula: 'NH2Cl', cid: 25423 },
      { name: 'Sodium hydroxide', formula: 'NaOH', cid: 14798 },
    ],
    emergency: EMERGENCY_TOXIC_GAS,
    reviewed: false,
  },
  {
    id: 'bleach+hcl', groups: ['bleach', 'hcl'], exact: false, reaction: true,
    risk: { overall: 99, health: 99, environment: 65, reactivity: 95 },
    warnings: [
      'Do not mix: acids release chlorine gas from bleach.',
      'Chlorine gas is highly toxic and corrosive to the airways; can be life-threatening.',
    ],
    equation: 'NaClO + 2 HCl → Cl2 + NaCl + H2O',
    mechanism: 'Acid converts hypochlorite to hypochlorous acid, which reacts with chloride to release chlorine gas.',
    what_happens: 'Chlorine gas is released quickly. It causes coughing, chest tightness and eye irritation, and can be life-threatening.',
    recommendation: 'Never mix bleach with acidic cleaners such as toilet bowl or descaling products.',
    products: [
      { name: 'Chlorine', formula: 'Cl2', cid: 24526 },
      { name: 'Sodium chloride', formula: 'NaCl', cid: 5234 },
      { name: 'Water', formula: 'H2O', cid: 962 },
    ],
    emergency: EMERGENCY_TOXIC_GAS,
    reviewed: false,
  },
  {
    id: 'bleach+vinegar', groups: ['bleach', 'vinegar'], exact: false, reaction: true,
    risk: { overall: 98, health: 98, environment: 60, reactivity: 90 },
    warnings: [
      'Do not mix: vinegar (acetic acid) releases chlorine gas from bleach.',
      'Chlorine gas is highly toxic and corrosive to the airways; can be life-threatening.',
    ],
    equation: 'NaClO + NaCl + 2 CH3COOH → Cl2 + 2 CH3COONa + H2O',
    mechanism: 'Acetic acid lowers the pH of bleach, converting hypochlorite to hypochlorous acid, which reacts with the chloride present in bleach to release chlorine gas.',
    what_happens: 'Chlorine gas is released. Even a mild acid like vinegar is enough.',
    recommendation: 'Never mix bleach with vinegar or any other acid.',
    products: [
      { name: 'Chlorine', formula: 'Cl2', cid: 24526 },
      { name: 'Sodium acetate', formula: 'C2H3NaO2', cid: 31372 },
      { name: 'Water', formula: 'H2O', cid: 962 },
    ],
    emergency: EMERGENCY_TOXIC_GAS,
    reviewed: false,
  },
  {
    id: 'bleach+isopropanol', groups: ['bleach', 'isopropanol'], exact: false, reaction: true,
    risk: { overall: 85, health: 85, environment: 55, reactivity: 70 },
    warnings: [
      'Do not mix: bleach and rubbing alcohol form chloroform and other chlorinated compounds.',
      'Chloroform is harmful if inhaled and is suspected of causing cancer.',
    ],
    equation: 'C3H8O + 4 NaClO → CHCl3 + CH3COONa + NaCl + 2 NaOH + H2O',
    mechanism: 'Hypochlorite oxidises isopropyl alcohol to acetone, which then undergoes the haloform reaction to give chloroform.',
    what_happens: 'Chloroform and other chlorinated by-products form. The reaction can release heat.',
    recommendation: 'Never mix bleach with rubbing alcohol or alcohol-based cleaners.',
    products: [
      { name: 'Chloroform', formula: 'CHCl3', cid: 6212 },
      { name: 'Sodium acetate', formula: 'C2H3NaO2', cid: 31372 },
      { name: 'Sodium hydroxide', formula: 'NaOH', cid: 14798 },
    ],
    emergency: EMERGENCY_TOXIC_GAS,
    reviewed: false,
  },
  // ── Low-risk pairs (exact match only) ─────────────────────────────────────
  {
    id: 'bleach+bicarbonate', groups: ['bleach', 'bicarbonate'], exact: true, reaction: false,
    risk: { overall: 20, health: 20, environment: 10, reactivity: 5 },
    warnings: ['Never add an acid (such as vinegar or toilet cleaner) to this mixture: acids release chlorine gas from bleach.'],
    equation: null, mechanism: null,
    what_happens: 'No hazardous reaction. Household bleach (about pH 11–13) is more alkaline than a baking soda solution (about pH 8), so adding baking soda slightly lowers the pH of the bleach. No toxic gas forms unless an acid is added.',
    recommendation: 'Low risk on its own. Handle bleach with gloves, keep the room ventilated, and never add acids.',
    products: [], reviewed: false,
  },
  {
    id: 'peroxide+bicarbonate', groups: ['peroxide', 'bicarbonate'], exact: true, reaction: false,
    risk: { overall: 15, health: 15, environment: 5, reactivity: 10 },
    warnings: ['Do not store the mixture in a sealed container: hydrogen peroxide slowly releases oxygen.'],
    equation: null, mechanism: null,
    what_happens: 'No significant reaction. The mildly basic solution may slowly speed up the breakdown of hydrogen peroxide into water and oxygen. Baking soda does not release carbon dioxide here because hydrogen peroxide is not acting as an acid.',
    recommendation: 'Low risk. Mix only what you need and do not store it in a closed container.',
    products: [], reviewed: false,
  },
  {
    id: 'sls+citric', groups: ['sls', 'citric'], exact: true, reaction: false,
    risk: { overall: 10, health: 10, environment: 10, reactivity: 0 },
    warnings: [],
    equation: null, mechanism: null,
    what_happens: 'Compatible. Citric acid is routinely used to adjust the pH of products containing sodium lauryl sulfate. At normal formulation pH it does not meaningfully react with the surfactant; changes in pH and salt content can affect viscosity.',
    recommendation: 'Compatible. Adjust pH gradually and check the viscosity of the finished product.',
    products: [], reviewed: false,
  },
  {
    id: 'vinegar+bicarbonate', groups: ['vinegar', 'bicarbonate'], exact: true, reaction: true,
    risk: { overall: 10, health: 5, environment: 5, reactivity: 10 },
    warnings: ['Do not mix in a sealed container: carbon dioxide builds up pressure.'],
    equation: 'NaHCO3 + CH3COOH → CH3COONa + H2O + CO2',
    mechanism: 'Acid–base neutralisation: acetic acid protonates bicarbonate, which decomposes to water and carbon dioxide.',
    what_happens: 'Fizzing as carbon dioxide is released, leaving a dilute sodium acetate solution. The mixture cools slightly.',
    recommendation: 'Safe in an open container. The two largely neutralise each other, so the mixture is a weak cleaner.',
    products: [
      { name: 'Sodium acetate', formula: 'C2H3NaO2', cid: 31372 },
      { name: 'Water', formula: 'H2O', cid: 962 },
      { name: 'Carbon dioxide', formula: 'CO2', cid: 280 },
    ],
    reviewed: false,
  },
  {
    id: 'isopropanol+bicarbonate', groups: ['isopropanol', 'bicarbonate'], exact: true, reaction: false,
    risk: { overall: 28, health: 15, environment: 5, reactivity: 28 },
    warnings: ['Rubbing alcohol is flammable: keep the mixture away from flames and heat.'],
    equation: null, mechanism: null,
    what_happens: 'No reaction. Baking soda does not react with isopropyl alcohol. The main hazard is the flammability of the alcohol.',
    recommendation: 'Low risk. Use in a ventilated area away from ignition sources.',
    products: [], reviewed: false,
  },
];

// Returns the matching rule, or null. Dangerous (non-exact) rules fire whenever
// all their groups are present; low-risk rules only when the inputs are exactly
// that pair, since an extra chemical could change the answer.
export function matchRule(chemicals: string[]): ReactionRule | null {
  const groups = chemicals.map(groupOf);
  const present = new Set(groups.filter(Boolean) as string[]);
  for (const rule of REACTION_RULES.filter((r) => !r.exact)) {
    if (rule.groups.every((g) => present.has(g))) return rule;
  }
  if (groups.some((g) => !g)) return null;
  for (const rule of REACTION_RULES.filter((r) => r.exact)) {
    if (present.size === rule.groups.length && chemicals.length === rule.groups.length && rule.groups.every((g) => present.has(g))) return rule;
  }
  return null;
}
