// Carbon Ledger data and calculations.
//
// 1. Spend-based factors: US EPA "Supply Chain Greenhouse Gas Emission Factors v1.3 by NAICS-6"
//    (USEEIO; 2022 GHG data; kg CO2e per 2022 USD, purchaser price, AR5 100-yr GWP; "with margins" column).
//    https://catalog.data.gov/dataset/supply-chain-greenhouse-gas-emission-factors-v1-3-by-naics-6
//    Values copied from SupplyChainGHGEmissionFactors_v1.3.0_NAICS_CO2e_USD2022.csv.
// 2. Mass-based values come from Suttain's existing reference library (src/data/carbonLibrary.js). They are
//    indicative and unverified; the UI labels them that way and prefers the EPA spend-based method when a price is given.
// 3. Molecular carbon uses the molecular formula from PubChem and the feedstock origin to split fossil and biogenic carbon.

import { CARBON_LIBRARY } from '@/data/carbonLibrary';

export const EPA_SOURCE = {
  name: 'US EPA Supply Chain GHG Emission Factors v1.3 (USEEIO)',
  url: 'https://catalog.data.gov/dataset/supply-chain-greenhouse-gas-emission-factors-v1-3-by-naics-6',
  unit: 'kg CO2e per 2022 US$ (purchaser price)',
};

export const NAICS = {
  '325613': { title: 'Surface active agents (surfactants)', ef: 0.355 },
  '325611': { title: 'Soap and other detergents', ef: 0.355 },
  '325620': { title: 'Toilet preparations (cosmetic blends, fragrance)', ef: 0.194 },
  '311225': { title: 'Fats and oils refining and blending', ef: 0.385 },
  '311224': { title: 'Soybean and other oilseed processing', ef: 0.511 },
  '311221': { title: 'Wet corn milling (starches, sugars)', ef: 0.993 },
  '311942': { title: 'Spice and extract manufacturing', ef: 0.344 },
  '325411': { title: 'Medicinal and botanical manufacturing', ef: 0.189 },
  '325414': { title: 'Biological products (fermentation-derived)', ef: 0.15 },
  '325193': { title: 'Ethyl alcohol manufacturing', ef: 1.184 },
  '325199': { title: 'All other basic organic chemicals', ef: 1.184 },
  '325194': { title: 'Cyclic crudes, intermediates, gum and wood chemicals', ef: 1.184 },
  '325110': { title: 'Petrochemicals', ef: 0.811 },
  '325180': { title: 'Other basic inorganic chemicals', ef: 1.01 },
  '325211': { title: 'Plastics materials and resins (incl. silicones, polymers)', ef: 1.045 },
  '325130': { title: 'Synthetic dyes and pigments', ef: 0.432 },
  '325998': { title: 'Other miscellaneous chemical products', ef: 0.5 },
  '324191': { title: 'Petroleum lubricating oils and greases (mineral oil, petrolatum)', ef: 0.391 },
  '327992': { title: 'Ground or treated minerals and earths', ef: 0.497 },
  '212324': { title: 'Kaolin and ball clay mining', ef: 0.309 },
  '212391': { title: 'Potash, soda and borate minerals', ef: 0.309 },
  // Packaging
  '326160': { title: 'Plastics bottles', ef: 0.579 },
  '326112': { title: 'Plastics packaging film and sheet', ef: 0.544 },
  '326199': { title: 'Other plastics products (caps, jars, pumps)', ef: 0.371 },
  '327213': { title: 'Glass containers', ef: 0.597 },
  '331315': { title: 'Aluminum sheet, plate and foil', ef: 0.721 },
  '332431': { title: 'Metal cans', ef: 0.318 },
  '322212': { title: 'Folding paperboard boxes', ef: 0.479 },
  '322211': { title: 'Corrugated boxes', ef: 0.479 },
  '322220': { title: 'Paper bags, coated and treated paper (labels)', ef: 0.364 },
};

// Feedstock origin of an ingredient's carbon. `fossil` is the share of its carbon that is fossil-derived.
export const ORIGINS = {
  bio: { label: 'Plant / fermentation', fossil: 0 },
  mixed: { label: 'Mixed (part plant, part petro)', fossil: 0.5 },
  fossil: { label: 'Petrochemical', fossil: 1 },
  none: { label: 'Mineral / no carbon', fossil: 0 },
};

// Function categories drive like-for-like swap suggestions.
export const FUNCTIONS = ['Surfactant', 'Emulsifier', 'Oil / butter / wax', 'Solvent / humectant', 'Preservative', 'Active', 'Botanical', 'Mineral / pigment', 'Thickener', 'pH / chelator', 'Fragrance', 'Silicone / film former'];

// [name, function, NAICS, origin, pubchemName (null when it is a mixture, not one molecule)]
const MAP = [
  ['sodium lauryl sulfate', 'Surfactant', '325613', 'bio', 'sodium lauryl sulfate'],
  ['sodium laureth sulfate', 'Surfactant', '325613', 'mixed', null],
  ['sodium coco sulfate', 'Surfactant', '325613', 'bio', null],
  ['cocamidopropyl betaine', 'Surfactant', '325613', 'mixed', 'cocamidopropyl betaine'],
  ['decyl glucoside', 'Surfactant', '325613', 'bio', 'decyl glucoside'],
  ['lauryl glucoside', 'Surfactant', '325613', 'bio', 'lauryl glucoside'],
  ['ceteareth 20', 'Emulsifier', '325613', 'mixed', null],
  ['cetearyl alcohol', 'Emulsifier', '325199', 'bio', null],
  ['cetyl alcohol', 'Emulsifier', '325199', 'bio', 'cetyl alcohol'],
  ['stearyl alcohol', 'Emulsifier', '325199', 'bio', 'stearyl alcohol'],
  ['polysorbate 20', 'Emulsifier', '325613', 'mixed', null],
  ['polysorbate 80', 'Emulsifier', '325613', 'mixed', null],
  ['glyceryl stearate', 'Emulsifier', '325199', 'bio', 'glyceryl monostearate'],
  ['peg 100 stearate', 'Emulsifier', '325613', 'mixed', null],
  ['stearic acid', 'Emulsifier', '311225', 'bio', 'stearic acid'],
  ['palmitic acid', 'Emulsifier', '311225', 'bio', 'palmitic acid'],
  ['oleic acid', 'Emulsifier', '311225', 'bio', 'oleic acid'],
  ['triethanolamine', 'pH / chelator', '325199', 'fossil', 'triethanolamine'],
  ['coconut oil', 'Oil / butter / wax', '311225', 'bio', null],
  ['olive oil', 'Oil / butter / wax', '311225', 'bio', null],
  ['sunflower oil', 'Oil / butter / wax', '311224', 'bio', null],
  ['palm oil', 'Oil / butter / wax', '311225', 'bio', null],
  ['shea butter', 'Oil / butter / wax', '311225', 'bio', null],
  ['cocoa butter', 'Oil / butter / wax', '311225', 'bio', null],
  ['avocado oil', 'Oil / butter / wax', '311225', 'bio', null],
  ['argan oil', 'Oil / butter / wax', '311225', 'bio', null],
  ['jojoba oil', 'Oil / butter / wax', '311225', 'bio', null],
  ['almond oil', 'Oil / butter / wax', '311225', 'bio', null],
  ['castor oil', 'Oil / butter / wax', '311225', 'bio', null],
  ['hemp seed oil', 'Oil / butter / wax', '311225', 'bio', null],
  ['rosehip oil', 'Oil / butter / wax', '311225', 'bio', null],
  ['macadamia oil', 'Oil / butter / wax', '311225', 'bio', null],
  ['squalane (olive)', 'Oil / butter / wax', '311225', 'bio', 'squalane'],
  ['beeswax', 'Oil / butter / wax', '311225', 'bio', null],
  ['carnauba wax', 'Oil / butter / wax', '311225', 'bio', null],
  ['candelilla wax', 'Oil / butter / wax', '311225', 'bio', null],
  ['mineral oil', 'Oil / butter / wax', '324191', 'fossil', null],
  ['petroleum jelly', 'Oil / butter / wax', '324191', 'fossil', null],
  ['paraffin wax', 'Oil / butter / wax', '324191', 'fossil', null],
  ['lanolin', 'Oil / butter / wax', '311225', 'bio', null],
  ['tallow', 'Oil / butter / wax', '311225', 'bio', null],
  ['squalane (shark)', 'Oil / butter / wax', '311225', 'bio', 'squalane'],
  ['water', 'Solvent / humectant', null, 'none', 'water'],
  ['ethanol', 'Solvent / humectant', '325193', 'bio', 'ethanol'],
  ['isopropanol', 'Solvent / humectant', '325199', 'fossil', 'isopropanol'],
  ['denatured alcohol', 'Solvent / humectant', '325193', 'bio', 'ethanol'],
  ['propylene glycol', 'Solvent / humectant', '325199', 'fossil', 'propylene glycol'],
  ['butylene glycol', 'Solvent / humectant', '325199', 'fossil', '1,3-butanediol'],
  ['hexylene glycol', 'Solvent / humectant', '325199', 'fossil', 'hexylene glycol'],
  ['propanediol', 'Solvent / humectant', '325414', 'bio', '1,3-propanediol'],
  ['glycerin', 'Solvent / humectant', '325199', 'bio', 'glycerol'],
  ['sorbitol', 'Solvent / humectant', '311221', 'bio', 'sorbitol'],
  ['parabens', 'Preservative', '325199', 'fossil', 'methylparaben'],
  ['methylparaben', 'Preservative', '325199', 'fossil', 'methylparaben'],
  ['phenoxyethanol', 'Preservative', '325199', 'fossil', 'phenoxyethanol'],
  ['sodium benzoate', 'Preservative', '325199', 'fossil', 'sodium benzoate'],
  ['potassium sorbate', 'Preservative', '325199', 'fossil', 'potassium sorbate'],
  ['benzoic acid', 'Preservative', '325199', 'fossil', 'benzoic acid'],
  ['sorbic acid', 'Preservative', '325199', 'fossil', 'sorbic acid'],
  ['benzyl alcohol', 'Preservative', '325199', 'fossil', 'benzyl alcohol'],
  ['caprylyl glycol', 'Preservative', '325199', 'mixed', '1,2-octanediol'],
  ['ethylhexylglycerin', 'Preservative', '325199', 'mixed', 'ethylhexylglycerin'],
  ['dehydroacetic acid', 'Preservative', '325199', 'fossil', 'dehydroacetic acid'],
  ['quaternium-15', 'Preservative', '325199', 'fossil', 'quaternium-15'],
  ['formaldehyde', 'Preservative', '325199', 'fossil', 'formaldehyde'],
  ['dmdm hydantoin', 'Preservative', '325199', 'fossil', 'dmdm hydantoin'],
  ['citric acid', 'pH / chelator', '325414', 'bio', 'citric acid'],
  ['lactic acid', 'Active', '325414', 'bio', 'lactic acid'],
  ['glycolic acid', 'Active', '325199', 'fossil', 'glycolic acid'],
  ['salicylic acid', 'Active', '325199', 'fossil', 'salicylic acid'],
  ['azelaic acid', 'Active', '325199', 'bio', 'azelaic acid'],
  ['kojic acid', 'Active', '325414', 'bio', 'kojic acid'],
  ['ferulic acid', 'Active', '325411', 'bio', 'ferulic acid'],
  ['hyaluronic acid', 'Active', '325414', 'bio', null],
  ['ascorbic acid (vitamin c)', 'Active', '325414', 'bio', 'ascorbic acid'],
  ['niacinamide', 'Active', '325199', 'fossil', 'niacinamide'],
  ['retinol', 'Active', '325199', 'fossil', 'retinol'],
  ['panthenol', 'Active', '325199', 'fossil', 'dexpanthenol'],
  ['allantoin', 'Active', '325199', 'fossil', 'allantoin'],
  ['urea', 'Active', '325199', 'fossil', 'urea'],
  ['tocopherol (vitamin e)', 'Active', '325411', 'mixed', 'alpha-tocopherol'],
  ['tocopheryl acetate', 'Active', '325199', 'mixed', 'tocopheryl acetate'],
  ['caffeine', 'Active', '325199', 'mixed', 'caffeine'],
  ['aloe vera', 'Botanical', '325411', 'bio', null],
  ['green tea extract', 'Botanical', '325411', 'bio', null],
  ['chamomile extract', 'Botanical', '325411', 'bio', null],
  ['witch hazel', 'Botanical', '325411', 'bio', null],
  ['calendula extract', 'Botanical', '325411', 'bio', null],
  ['cucumber extract', 'Botanical', '325411', 'bio', null],
  ['ginseng extract', 'Botanical', '325411', 'bio', null],
  ['rosemary extract', 'Botanical', '325411', 'bio', null],
  ['centella asiatica extract', 'Botanical', '325411', 'bio', null],
  ['seaweed extract', 'Botanical', '325411', 'bio', null],
  ['lavender oil', 'Fragrance', '311942', 'bio', null],
  ['peppermint oil', 'Fragrance', '311942', 'bio', null],
  ['tea tree oil', 'Fragrance', '311942', 'bio', null],
  ['eucalyptus oil', 'Fragrance', '311942', 'bio', null],
  ['ylang ylang oil', 'Fragrance', '311942', 'bio', null],
  ['vanilla extract', 'Fragrance', '311942', 'bio', null],
  ['essential oil blend', 'Fragrance', '311942', 'bio', null],
  ['fragrance', 'Fragrance', '325620', 'fossil', null],
  ['titanium dioxide', 'Mineral / pigment', '325180', 'none', 'titanium dioxide'],
  ['zinc oxide', 'Mineral / pigment', '325180', 'none', 'zinc oxide'],
  ['kaolin clay', 'Mineral / pigment', '212324', 'none', null],
  ['bentonite clay', 'Mineral / pigment', '327992', 'none', null],
  ['mica', 'Mineral / pigment', '327992', 'none', null],
  ['iron oxides', 'Mineral / pigment', '325130', 'none', null],
  ['silica', 'Mineral / pigment', '325180', 'none', 'silicon dioxide'],
  ['talc', 'Mineral / pigment', '327992', 'none', null],
  ['sodium hydroxide', 'pH / chelator', '325180', 'none', 'sodium hydroxide'],
  ['potassium hydroxide', 'pH / chelator', '325180', 'none', 'potassium hydroxide'],
  ['sodium chloride', 'Thickener', '325180', 'none', 'sodium chloride'],
  ['hydrogen peroxide', 'Active', '325180', 'none', 'hydrogen peroxide'],
  ['edta', 'pH / chelator', '325199', 'fossil', 'edetic acid'],
  ['dimethicone', 'Silicone / film former', '325211', 'fossil', null],
  ['cyclomethicone', 'Silicone / film former', '325211', 'fossil', null],
  ['carbomer', 'Thickener', '325211', 'fossil', null],
  ['xanthan gum', 'Thickener', '325414', 'bio', null],
  ['guar gum', 'Thickener', '311221', 'bio', null],
  ['cellulose gum', 'Thickener', '325199', 'bio', null],
];

export const INGREDIENTS = Object.fromEntries(MAP.map(([name, fn, naics, origin, pubchem]) => [name, { name, fn, naics, origin, pubchem, indicative: CARBON_LIBRARY[name] ?? null }]));
export const INGREDIENT_NAMES = Object.keys(INGREDIENTS);

export const PACKAGING = {
  'PET bottle': { naics: '326160', indicative: CARBON_LIBRARY['pet plastic'] },
  'HDPE bottle': { naics: '326160', indicative: CARBON_LIBRARY['hdpe plastic'] },
  'PP cap / pump / jar': { naics: '326199', indicative: CARBON_LIBRARY['polypropylene'] },
  'Plastic tube / pouch (film)': { naics: '326112', indicative: CARBON_LIBRARY['pet plastic'] },
  'Glass jar / bottle': { naics: '327213', indicative: CARBON_LIBRARY['glass'] },
  'Aluminium tube / foil': { naics: '331315', indicative: CARBON_LIBRARY['aluminum'] },
  'Metal can / tin': { naics: '332431', indicative: CARBON_LIBRARY['aluminum'] },
  'Folding carton': { naics: '322212', indicative: CARBON_LIBRARY['paper'] },
  'Shipping box (corrugated)': { naics: '322211', indicative: CARBON_LIBRARY['corrugated cardboard'] },
  'Paper label': { naics: '322220', indicative: CARBON_LIBRARY['paper'] },
};

export const lookupIngredient = name => INGREDIENTS[String(name || '').toLowerCase().trim()] || null;

// ── Molecular carbon ──────────────────────────────────────────────────────────
const ATOMIC = { C: 12.011, H: 1.008, O: 15.999, N: 14.007, S: 32.06, Na: 22.99, K: 39.098, Cl: 35.45, P: 30.974, Si: 28.085, Ti: 47.867, Zn: 65.38, Fe: 55.845, Ca: 40.078, Mg: 24.305, Al: 26.982, Br: 79.904, F: 18.998, I: 126.9, B: 10.81, Cu: 63.546 };
// Carbon mass fraction from a molecular formula such as "C12H25NaO4S". Returns null if an element is unknown.
export function carbonFraction(formula) {
  if (!formula) return null;
  const clean = String(formula).replace(/[+-]\d*$/, '').replace(/\./g, '');
  let total = 0; let carbon = 0;
  for (const [, el, n] of clean.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    const w = ATOMIC[el]; if (!w) return null;
    const count = n ? Number(n) : 1; total += w * count; if (el === 'C') carbon += w * count;
  }
  return total ? carbon / total : null;
}
export const CO2_PER_C = 44.009 / 12.011; // kg CO2 released per kg carbon fully oxidised

const formulaCache = new Map();
export async function fetchFormula(pubchemName) {
  if (!pubchemName) return null;
  if (formulaCache.has(pubchemName)) return formulaCache.get(pubchemName);
  const p = fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(pubchemName)}/property/MolecularFormula,MolecularWeight/JSON`, { signal: AbortSignal.timeout(10000) })
    .then(r => (r.ok ? r.json() : null))
    .then(j => { const prop = j?.PropertyTable?.Properties?.[0]; return prop ? { formula: prop.MolecularFormula, cid: prop.CID, mw: Number(prop.MolecularWeight) } : null; })
    .catch(() => null);
  formulaCache.set(pubchemName, p);
  return p;
}

// ── Ledger ───────────────────────────────────────────────────────────────────
// product: { unitGrams, unitsPerYear, rinseOff }
// ingredients: [{ id, name, pct, price, naics, origin, fn, indicative, formula }]
// packaging: [{ id, type, grams, cost }]
export function computeLedger(product, ingredients, packaging) {
  const unitKg = (Number(product.unitGrams) || 0) / 1000;
  const rows = ingredients.map(i => {
    const massKg = unitKg * (Number(i.pct) || 0) / 100;
    const ef = i.naics ? NAICS[i.naics]?.ef : null;
    const price = Number(i.price) || 0;
    const spend = price > 0 && ef != null ? massKg * price * ef : null; // kg CO2e per unit
    const indicativeCO2 = i.indicative != null ? massKg * i.indicative : null;
    const method = spend != null ? 'epa' : indicativeCO2 != null ? 'indicative' : i.origin === 'none' && !i.naics ? 'zero' : 'missing';
    const co2 = method === 'epa' ? spend : method === 'indicative' ? indicativeCO2 : 0;
    const wC = i.origin === 'none' ? 0 : carbonFraction(i.formula);
    const carbonKg = wC != null ? massKg * wC : null;
    const fossilShare = ORIGINS[i.origin]?.fossil ?? 0.5;
    const fossilC = carbonKg != null ? carbonKg * fossilShare : null;
    const bioC = carbonKg != null ? carbonKg * (1 - fossilShare) : null;
    const eolCO2 = product.rinseOff && fossilC != null ? fossilC * CO2_PER_C : 0;
    return { ...i, massKg, ef, spend, indicativeCO2, method, co2, wC, carbonKg, fossilC, bioC, eolCO2 };
  });
  const pack = packaging.map(p => {
    const def = PACKAGING[p.type] || {};
    const ef = def.naics ? NAICS[def.naics].ef : null;
    const cost = Number(p.cost) || 0;
    const spend = cost > 0 && ef != null ? cost * ef : null;
    const indicativeCO2 = def.indicative != null ? (Number(p.grams) || 0) / 1000 * def.indicative : null;
    const method = spend != null ? 'epa' : indicativeCO2 != null ? 'indicative' : 'missing';
    return { ...p, naics: def.naics, ef, spend, indicativeCO2, method, co2: (method === 'epa' ? spend : indicativeCO2) || 0 };
  });
  const sum = (arr, k) => arr.reduce((s, r) => s + (Number(r[k]) || 0), 0);
  const formulaCO2 = sum(rows, 'co2');
  const packCO2 = sum(pack, 'co2');
  const eolCO2 = sum(rows, 'eolCO2');
  const perUnit = formulaCO2 + packCO2 + eolCO2;
  const knownCarbonRows = rows.filter(r => r.carbonKg != null);
  const totalC = sum(knownCarbonRows, 'carbonKg');
  const bioC = sum(knownCarbonRows, 'bioC');
  const pctPct = sum(ingredients, 'pct');
  const all = [...rows.map(r => ({ method: r.method, co2: r.co2 })), ...pack.map(p => ({ method: p.method, co2: p.co2 }))];
  const totalForQuality = all.reduce((s, r) => s + r.co2, 0) || 1;
  const quality = {
    epa: all.filter(r => r.method === 'epa').reduce((s, r) => s + r.co2, 0) / totalForQuality,
    indicative: all.filter(r => r.method === 'indicative').reduce((s, r) => s + r.co2, 0) / totalForQuality,
    missing: all.filter(r => r.method === 'missing').length,
  };
  const carbonCoverage = rows.filter(r => r.origin !== 'none').length ? knownCarbonRows.filter(r => r.origin !== 'none').length / rows.filter(r => r.origin !== 'none').length : 1;
  return {
    rows, pack, formulaCO2, packCO2, eolCO2, perUnit,
    annualTonnes: perUnit * (Number(product.unitsPerYear) || 0) / 1000,
    biobasedCarbonPct: totalC > 0 ? (bioC / totalC) * 100 : null,
    carbonCoverage, pctPct, quality,
  };
}

// Like-for-like swaps: same function, lower footprint per kg (EPA factor when no indicative value).
export function suggestSwaps(row, limit = 3) {
  const current = row.indicative ?? null;
  return Object.values(INGREDIENTS)
    .filter(c => c.fn === row.fn && c.name !== String(row.name).toLowerCase() && c.indicative != null && current != null && c.indicative < current)
    .map(c => ({ ...c, reductionPct: Math.round((1 - c.indicative / current) * 100), fossilChange: (ORIGINS[c.origin]?.fossil ?? 0.5) - (ORIGINS[row.origin]?.fossil ?? 0.5) }))
    .sort((a, b) => b.reductionPct - a.reductionPct)
    .slice(0, limit);
}

// Carbon price reference points. Only the EU value has a dated, sourced figure here; others must be checked by the user.
export const PRICE_PRESETS = [
  { id: 'eu', label: 'EU ETS', value: 82, currency: '€', note: 'EUA Dec contract €82.40/t on 5 Oct 2026 (S&P Global Commodity Insights).', url: 'https://www.spglobal.com/energy/en/news-research/latest-news/natural-gas/100526-european-carbon-prices-drop-to-7-week-low-as-market-eyes-upcoming-policy-agenda' },
  { id: 'internal', label: 'Internal price', value: 50, currency: '$', note: 'A shadow price you choose for decisions. Not a legal charge.' },
  { id: 'stress', label: 'Stress test', value: 150, currency: '$', note: 'A high-price scenario to test margins.' },
];
