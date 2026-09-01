import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// A compact built-in list for instant matching before external APIs respond.
const BUILTIN_CHEMICALS = [
  { name: 'Bleach', scientific_name: 'Sodium Hypochlorite', molecular_formula: 'NaClO' },
  { name: 'Baking Soda', scientific_name: 'Sodium Bicarbonate', molecular_formula: 'NaHCO₃' },
  { name: 'Vinegar', scientific_name: 'Acetic Acid', molecular_formula: 'CH₃COOH' },
  { name: 'Rubbing Alcohol', scientific_name: 'Isopropyl Alcohol', molecular_formula: 'C₃H₈O' },
  { name: 'Ammonia', scientific_name: 'Ammonia', molecular_formula: 'NH₃' },
  { name: 'Hydrogen Peroxide', scientific_name: 'Hydrogen Peroxide', molecular_formula: 'H₂O₂' },
  { name: 'Muriatic Acid', scientific_name: 'Hydrochloric Acid', molecular_formula: 'HCl' },
  { name: 'Lye', scientific_name: 'Sodium Hydroxide', molecular_formula: 'NaOH' },
  { name: 'Washing Soda', scientific_name: 'Sodium Carbonate', molecular_formula: 'Na₂CO₃' },
  { name: 'Salt', scientific_name: 'Sodium Chloride', molecular_formula: 'NaCl' },
  { name: 'Water', scientific_name: 'Water', molecular_formula: 'H₂O' },
  { name: 'Ethanol', scientific_name: 'Ethanol', molecular_formula: 'C₂H₅OH' },
  { name: 'Acetone', scientific_name: 'Acetone', molecular_formula: 'C₃H₆O' },
  { name: 'Benzene', scientific_name: 'Benzene', molecular_formula: 'C₆H₆' },
  { name: 'Sulfuric Acid', scientific_name: 'Sulfuric Acid', molecular_formula: 'H₂SO₄' },
  { name: 'Citric Acid', scientific_name: 'Citric Acid', molecular_formula: 'C₆H₈O₇' },
  { name: 'Glycerin', scientific_name: 'Glycerol', molecular_formula: 'C₃H₈O₃' },
  { name: 'Borax', scientific_name: 'Sodium Tetraborate', molecular_formula: 'Na₂B₄O₇' },
  { name: 'Epsom Salt', scientific_name: 'Magnesium Sulfate', molecular_formula: 'MgSO₄' },
  { name: 'Methanol', scientific_name: 'Methanol', molecular_formula: 'CH₃OH' },
  { name: 'Toluene', scientific_name: 'Toluene', molecular_formula: 'C₇H₈' },
  { name: 'Vitamin C', scientific_name: 'Ascorbic Acid', molecular_formula: 'C₆H₈O₆' },
  { name: 'Vitamin E', scientific_name: 'Tocopherol', molecular_formula: 'C₂₉H₅₀O₂' },
  { name: 'Aspirin', scientific_name: 'Acetylsalicylic Acid', molecular_formula: 'C₉H₈O₄' },
  { name: 'Caffeine', scientific_name: 'Caffeine', molecular_formula: 'C₈H₁₀N₄O₂' },
  { name: 'Glucose', scientific_name: 'Glucose', molecular_formula: 'C₆H₁₂O₆' },
  { name: 'Sucrose', scientific_name: 'Sucrose', molecular_formula: 'C₁₂H₂₂O₁₁' },
  { name: 'Sodium Chloride', scientific_name: 'Sodium Chloride', molecular_formula: 'NaCl' },
  { name: 'Calcium Carbonate', scientific_name: 'Calcium Carbonate', molecular_formula: 'CaCO₃' },
  { name: 'Potassium Hydroxide', scientific_name: 'Potassium Hydroxide', molecular_formula: 'KOH' },
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // Public autocomplete: no login required, but we still init the client.
    await base44.auth.me().catch(() => null);

    const body = await req.json().catch(() => ({}));
    const query = (body.query || '').trim().toLowerCase();

    if (!query || query.length < 2) {
      return Response.json({ suggestions: [] });
    }

    // 1. Built-in instant matches
    const builtinMatches = BUILTIN_CHEMICALS.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.scientific_name.toLowerCase().includes(query) ||
      c.molecular_formula.toLowerCase().includes(query)
    ).slice(0, 5).map(c => ({
      name: c.name,
      scientific_name: c.scientific_name,
      molecular_formula: c.molecular_formula,
      source_db: 'Suttain',
    }));

    // 2. PubChem autocomplete (public, no key)
    let pubchemMatches = [];
    try {
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(query)}/json?limit=8`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const terms = data?.dictionary_terms?.compound || [];
        pubchemMatches = terms.slice(0, 8).map(term => ({
          name: term,
          scientific_name: term,
          molecular_formula: '',
          source_db: 'PubChem',
        }));
      }
    } catch (e) {
      console.error('PubChem autocomplete failed:', e.message);
    }

    // Merge + dedupe by name, prioritizing built-in (which have formulas)
    const seen = new Set();
    const merged = [];
    for (const item of [...builtinMatches, ...pubchemMatches]) {
      const key = item.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }

    return Response.json({ suggestions: merged.slice(0, 8) });
  } catch (error) {
    console.error('chemicalAutocomplete error:', error);
    return Response.json({ error: error.message, suggestions: [] }, { status: 500 });
  }
}