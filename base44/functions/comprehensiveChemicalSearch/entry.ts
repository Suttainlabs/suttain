import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Common household names to scientific names for PubChem lookup
const COMMON_NAME_MAP = {
  'bleach': 'sodium hypochlorite',
  'baking soda': 'sodium bicarbonate',
  'vinegar': 'acetic acid',
  'rubbing alcohol': 'isopropyl alcohol',
  'ammonia': 'ammonia',
  'hydrogen peroxide': 'hydrogen peroxide',
  'muriatic acid': 'hydrochloric acid',
  'lye': 'sodium hydroxide',
  'caustic soda': 'sodium hydroxide',
  'pool chlorine': 'calcium hypochlorite',
  'washing soda': 'sodium carbonate',
  'salt': 'sodium chloride',
  'sugar': 'sucrose',
  'water': 'water',
  'ethanol': 'ethanol',
  'acetone': 'acetone',
  'benzene': 'benzene',
  'toluene': 'toluene',
  'methanol': 'methanol',
  'sulfuric acid': 'sulfuric acid',
  'nitric acid': 'nitric acid',
  'phosphoric acid': 'phosphoric acid',
  'citric acid': 'citric acid',
  'glycerin': 'glycerol',
  'borax': 'sodium tetraborate',
  'epsom salt': 'magnesium sulfate',
  'cream of tartar': 'potassium bitartrate',
  'alum': 'potassium aluminum sulfate',
  'alcohol': 'ethanol',
  'iso alcohol': 'isopropyl alcohol',
  'table salt': 'sodium chloride',
  'baking powder': 'sodium bicarbonate',
  'peroxide': 'hydrogen peroxide',
};

// Built-in chemical database for instant results when DB is empty
const BUILTIN_CHEMICALS = [
  { name: 'Bleach', scientific_name: 'Sodium Hypochlorite', molecular_formula: 'NaClO', chemical_type: 'compound', category: 'cleaning', safety_level: 'hazardous', keywords: ['bleach', 'sodium hypochlorite', 'naocl', 'chlorine'] },
  { name: 'Baking Soda', scientific_name: 'Sodium Bicarbonate', molecular_formula: 'NaHCO₃', chemical_type: 'compound', category: 'cleaning', safety_level: 'safe', keywords: ['baking soda', 'sodium bicarbonate', 'nahco3', 'bicarb'] },
  { name: 'Vinegar', scientific_name: 'Acetic Acid', molecular_formula: 'CH₃COOH', chemical_type: 'compound', category: 'cleaning', safety_level: 'safe', keywords: ['vinegar', 'acetic acid', 'ethanoic acid'] },
  { name: 'Rubbing Alcohol', scientific_name: 'Isopropyl Alcohol', molecular_formula: 'C₃H₈O', chemical_type: 'compound', category: 'cleaning', safety_level: 'moderate', keywords: ['rubbing alcohol', 'isopropyl alcohol', 'isopropanol', 'propan-2-ol'] },
  { name: 'Ammonia', scientific_name: 'Ammonia', molecular_formula: 'NH₃', chemical_type: 'compound', category: 'cleaning', safety_level: 'hazardous', keywords: ['ammonia', 'nh3'] },
  { name: 'Hydrogen Peroxide', scientific_name: 'Hydrogen Peroxide', molecular_formula: 'H₂O₂', chemical_type: 'compound', category: 'cleaning', safety_level: 'moderate', keywords: ['hydrogen peroxide', 'h2o2', 'peroxide'] },
  { name: 'Muriatic Acid', scientific_name: 'Hydrochloric Acid', molecular_formula: 'HCl', chemical_type: 'compound', category: 'industrial', safety_level: 'hazardous', keywords: ['muriatic acid', 'hydrochloric acid', 'hcl'] },
  { name: 'Lye', scientific_name: 'Sodium Hydroxide', molecular_formula: 'NaOH', chemical_type: 'compound', category: 'cleaning', safety_level: 'hazardous', keywords: ['lye', 'sodium hydroxide', 'caustic soda', 'naoh'] },
  { name: 'Pool Chlorine', scientific_name: 'Calcium Hypochlorite', molecular_formula: 'Ca(ClO)₂', chemical_type: 'compound', category: 'cleaning', safety_level: 'hazardous', keywords: ['pool chlorine', 'calcium hypochlorite'] },
  { name: 'Washing Soda', scientific_name: 'Sodium Carbonate', molecular_formula: 'Na₂CO₃', chemical_type: 'compound', category: 'cleaning', safety_level: 'moderate', keywords: ['washing soda', 'sodium carbonate', 'soda ash'] },
  { name: 'Salt', scientific_name: 'Sodium Chloride', molecular_formula: 'NaCl', chemical_type: 'compound', category: 'food_additive', safety_level: 'safe', keywords: ['salt', 'sodium chloride', 'nacl', 'table salt'] },
  { name: 'Water', scientific_name: 'Water', molecular_formula: 'H₂O', chemical_type: 'compound', category: 'solvent', safety_level: 'safe', keywords: ['water', 'h2o', 'aqua'] },
  { name: 'Ethanol', scientific_name: 'Ethanol', molecular_formula: 'C₂H₅OH', chemical_type: 'compound', category: 'solvent', safety_level: 'moderate', keywords: ['ethanol', 'alcohol', 'ethyl alcohol', 'drinking alcohol'] },
  { name: 'Acetone', scientific_name: 'Acetone', molecular_formula: 'C₃H₆O', chemical_type: 'compound', category: 'solvent', safety_level: 'moderate', keywords: ['acetone', 'nail polish remover', 'propanone'] },
  { name: 'Benzene', scientific_name: 'Benzene', molecular_formula: 'C₆H₆', chemical_type: 'compound', category: 'industrial', safety_level: 'hazardous', keywords: ['benzene'] },
  { name: 'Sulfuric Acid', scientific_name: 'Sulfuric Acid', molecular_formula: 'H₂SO₄', chemical_type: 'compound', category: 'industrial', safety_level: 'highly_hazardous', keywords: ['sulfuric acid', 'h2so4', 'battery acid'] },
  { name: 'Citric Acid', scientific_name: 'Citric Acid', molecular_formula: 'C₆H₈O₇', chemical_type: 'compound', category: 'food_additive', safety_level: 'safe', keywords: ['citric acid', 'lemon acid'] },
  { name: 'Glycerin', scientific_name: 'Glycerol', molecular_formula: 'C₃H₈O₃', chemical_type: 'compound', category: 'skincare', safety_level: 'safe', keywords: ['glycerin', 'glycerol', 'glycerine'] },
  { name: 'Borax', scientific_name: 'Sodium Tetraborate', molecular_formula: 'Na₂B₄O₇', chemical_type: 'compound', category: 'cleaning', safety_level: 'moderate', keywords: ['borax', 'sodium tetraborate', 'sodium borate'] },
  { name: 'Epsom Salt', scientific_name: 'Magnesium Sulfate', molecular_formula: 'MgSO₄', chemical_type: 'compound', category: 'skincare', safety_level: 'safe', keywords: ['epsom salt', 'magnesium sulfate'] },
  { name: 'Phosphoric Acid', scientific_name: 'Phosphoric Acid', molecular_formula: 'H₃PO₄', chemical_type: 'compound', category: 'industrial', safety_level: 'hazardous', keywords: ['phosphoric acid', 'h3po4'] },
  { name: 'Nitric Acid', scientific_name: 'Nitric Acid', molecular_formula: 'HNO₃', chemical_type: 'compound', category: 'industrial', safety_level: 'highly_hazardous', keywords: ['nitric acid', 'hno3'] },
  { name: 'Methanol', scientific_name: 'Methanol', molecular_formula: 'CH₃OH', chemical_type: 'compound', category: 'solvent', safety_level: 'hazardous', keywords: ['methanol', 'methyl alcohol', 'wood alcohol'] },
  { name: 'Toluene', scientific_name: 'Toluene', molecular_formula: 'C₇H₈', chemical_type: 'compound', category: 'solvent', safety_level: 'hazardous', keywords: ['toluene', 'methylbenzene'] },
  { name: 'Coconut Oil', scientific_name: 'Coconut Oil', molecular_formula: 'Fatty Acid Mixture', chemical_type: 'mixture', category: 'skincare', safety_level: 'safe', keywords: ['coconut oil', 'cocos nucifera'] },
  { name: 'Shea Butter', scientific_name: 'Butyrospermum Parkii Butter', molecular_formula: 'Lipid Mixture', chemical_type: 'mixture', category: 'skincare', safety_level: 'safe', keywords: ['shea butter', 'butyrospermum parkii'] },
  { name: 'Tea Tree Oil', scientific_name: 'Melaleuca Alternifolia Oil', molecular_formula: 'Terpene Mixture', chemical_type: 'mixture', category: 'skincare', safety_level: 'moderate', keywords: ['tea tree oil', 'melaleuca'] },
  { name: 'Aloe Vera', scientific_name: 'Aloe Barbadensis Leaf Juice', molecular_formula: 'Complex Mixture', chemical_type: 'extract', category: 'skincare', safety_level: 'safe', keywords: ['aloe vera', 'aloe'] },
  { name: 'Vitamin C', scientific_name: 'Ascorbic Acid', molecular_formula: 'C₆H₈O₆', chemical_type: 'compound', category: 'skincare', safety_level: 'safe', keywords: ['vitamin c', 'ascorbic acid'] },
  { name: 'Vitamin E', scientific_name: 'Tocopherol', molecular_formula: 'C₂₉H₅₀O₂', chemical_type: 'compound', category: 'skincare', safety_level: 'safe', keywords: ['vitamin e', 'tocopherol'] },
];

const dedupAndPrioritize = (results) => {
  const uniqueMap = new Map();
  results.forEach(chem => {
    const key = (chem.cas_number || chem.scientific_name || chem.name).toLowerCase();
    const existing = uniqueMap.get(key);
    if (!existing || (!existing.molecular_formula && chem.molecular_formula)) {
      uniqueMap.set(key, chem);
    }
  });
  return Array.from(uniqueMap.values());
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body", results: [] }, { status: 400 });
  }
  
  const query = body.query || '';
  const productType = body.productType;
  const category = body.category;
  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) {
    return Response.json({ results: [] });
  }

  try {
    // 1. Search built-in chemicals first (instant, always available)
    const builtinResults = BUILTIN_CHEMICALS.filter(c =>
      c.keywords.some(kw => kw.includes(searchTerm) || searchTerm.includes(kw)) ||
      c.name.toLowerCase().includes(searchTerm) ||
      c.scientific_name.toLowerCase().includes(searchTerm)
    ).map(c => ({ ...c, source: 'builtin' }));

    // 2. Search database chemicals
    let dbResults = [];
    try {
      const allChemicals = await base44.asServiceRole.entities.Chemical.list();
      const chemicals = Array.isArray(allChemicals) ? allChemicals : [];
      
      if (chemicals.length > 0) {
        dbResults = chemicals.filter(c =>
          c.name?.toLowerCase().includes(searchTerm) ||
          c.scientific_name?.toLowerCase().includes(searchTerm) ||
          c.iupac_name?.toLowerCase().includes(searchTerm) ||
          (c.cas_number && c.cas_number.includes(searchTerm))
        ).map(c => ({ ...c, source: 'database' }));
      }
    } catch (e) {
      console.error("DB search failed:", e);
    }

    // 3. Combine and deduplicate (DB results take priority over builtin)
    let finalResults = dedupAndPrioritize([...dbResults, ...builtinResults]);

    // 4. If still no results, try PubChem with resolved name
    if (finalResults.length === 0) {
      const resolvedName = COMMON_NAME_MAP[searchTerm] || searchTerm;
      
      try {
        const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(resolvedName)}/property/IUPACName,MolecularFormula,MolecularWeight/JSON`;
        const pubchemResponse = await fetch(pubchemUrl);

        if (pubchemResponse.ok) {
          const pubchemData = await pubchemResponse.json();
          const properties = pubchemData?.PropertyTable?.Properties?.[0];

          if (properties && properties.CID) {
            finalResults = [{
              name: query,
              scientific_name: properties.IUPACName || resolvedName,
              iupac_name: properties.IUPACName,
              molecular_formula: properties.MolecularFormula,
              molecular_weight: properties.MolecularWeight,
              chemical_type: 'compound',
              category: 'other',
              safety_level: 'unknown',
              source: 'pubchem'
            }];
          }
        }
      } catch (e) {
        console.error("PubChem lookup failed:", e);
      }
    }

    // 5. Apply category filter if needed
    if (category && category !== 'all') {
      finalResults = finalResults.filter(c => c.category?.toLowerCase() === category.toLowerCase());
    }

    // Limit results
    finalResults = finalResults.slice(0, 15);

    return Response.json({ results: finalResults });

  } catch (error) {
    console.error("Chemical search error:", error);
    return Response.json({ error: "Search failed", details: error.message }, { status: 500 });
  }
});