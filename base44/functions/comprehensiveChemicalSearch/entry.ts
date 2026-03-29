import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

// WHO Essential Medicines (2023 list - key entries)
const WHO_ESSENTIAL_MEDICINES = new Set([
  'aspirin', 'acetylsalicylic acid', 'paracetamol', 'acetaminophen', 'ibuprofen',
  'amoxicillin', 'ampicillin', 'penicillin', 'erythromycin', 'tetracycline',
  'ciprofloxacin', 'metronidazole', 'fluconazole', 'ketoconazole',
  'chloroquine', 'artemisinin', 'quinine', 'primaquine',
  'morphine', 'codeine', 'tramadol', 'fentanyl', 'naloxone',
  'diazepam', 'lorazepam', 'phenobarbital', 'phenytoin', 'carbamazepine', 'valproic acid',
  'metformin', 'insulin', 'glibenclamide',
  'amlodipine', 'atenolol', 'bisoprolol', 'captopril', 'enalapril', 'lisinopril',
  'furosemide', 'hydrochlorothiazide', 'spironolactone',
  'digoxin', 'warfarin', 'heparin', 'alteplase', 'streptokinase',
  'atorvastatin', 'simvastatin',
  'prednisolone', 'dexamethasone', 'hydrocortisone', 'budesonide', 'beclometasone',
  'salbutamol', 'ipratropium', 'theophylline',
  'omeprazole', 'ranitidine', 'antacid', 'oral rehydration salts',
  'zinc sulfate', 'folic acid', 'ferrous sulfate', 'vitamin a', 'retinol',
  'levothyroxine', 'carbimazole',
  'rifampicin', 'isoniazid', 'pyrazinamide', 'ethambutol', 'streptomycin',
  'zidovudine', 'lamivudine', 'efavirenz', 'nevirapine',
  'chloramphenicol', 'gentamicin', 'kanamycin',
  'magnesium sulfate', 'oxytocin', 'ergometrine', 'mifepristone',
  'atropine', 'epinephrine', 'adrenaline', 'dopamine', 'norepinephrine',
  'lidocaine', 'bupivacaine', 'ketamine', 'propofol', 'halothane',
  'sodium chloride', 'potassium chloride', 'glucose', 'dextrose',
  'activated charcoal', 'sodium bicarbonate',
  'betamethasone', 'triamcinolone', 'clotrimazole', 'nystatin',
  'aciclovir', 'ganciclovir', 'oseltamivir',
]);

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

function isWHOEssential(name) {
  const lower = (name || '').toLowerCase();
  return WHO_ESSENTIAL_MEDICINES.has(lower) || 
    Array.from(WHO_ESSENTIAL_MEDICINES).some(m => lower.includes(m) || m.includes(lower));
}

async function searchPubChem(resolvedName, originalQuery) {
  try {
    const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(resolvedName)}/property/IUPACName,MolecularFormula,MolecularWeight,CanonicalSMILES/JSON`;
    const res = await fetch(pubchemUrl);
    if (!res.ok) return [];
    const data = await res.json();
    const props = data?.PropertyTable?.Properties?.[0];
    if (!props?.CID) return [];
    const name = originalQuery;
    return [{
      name,
      scientific_name: props.IUPACName || resolvedName,
      iupac_name: props.IUPACName,
      molecular_formula: props.MolecularFormula,
      molecular_weight: props.MolecularWeight,
      smiles: props.CanonicalSMILES,
      chemical_type: 'compound',
      category: 'other',
      safety_level: 'unknown',
      source: 'pubchem',
      source_db: 'PubChem',
      who_essential: isWHOEssential(name),
    }];
  } catch (e) {
    console.error('PubChem search failed:', e.message);
    return [];
  }
}

async function searchChEMBL(query) {
  try {
    const url = `https://www.ebi.ac.uk/chembl/api/data/molecule/search.json?q=${encodeURIComponent(query)}&limit=5`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    const molecules = data?.molecules || [];
    return molecules
      .filter(m => m.pref_name)
      .map(m => ({
        name: m.pref_name,
        scientific_name: m.pref_name,
        iupac_name: m.molecule_structures?.standard_inchi_key || '',
        molecular_formula: m.molecule_properties?.full_molformula || '',
        molecular_weight: m.molecule_properties?.full_mwt ? parseFloat(m.molecule_properties.full_mwt) : null,
        smiles: m.molecule_structures?.canonical_smiles || '',
        cas_number: m.molecule_synonyms?.find(s => s.syn_type === 'CAS')?.molecule_synonym || '',
        chemical_type: m.molecule_type === 'Small molecule' ? 'compound' : m.molecule_type?.toLowerCase() || 'compound',
        category: 'pharmaceutical',
        safety_level: 'unknown',
        source: 'chembl',
        source_db: 'ChEMBL',
        chembl_id: m.molecule_chembl_id,
        who_essential: isWHOEssential(m.pref_name),
      }));
  } catch (e) {
    console.error('ChEMBL search failed:', e.message);
    return [];
  }
}

async function searchChEBI(query) {
  try {
    const url = `https://www.ebi.ac.uk/chebi/websrvices2/rest/search?search=${encodeURIComponent(query)}&ontologyDataOutput=false&searchCategory=ALL&stars=ALL&maximumResults=5`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.searchResults?.results || [];
    return results
      .filter(r => r.chebiAsciiName)
      .map(r => ({
        name: r.chebiAsciiName,
        scientific_name: r.chebiAsciiName,
        iupac_name: r.iupacNames?.[0] || '',
        molecular_formula: r.formulae?.[0]?.data || '',
        molecular_weight: r.mass ? parseFloat(r.mass) : null,
        chemical_type: 'compound',
        category: 'biochemical',
        safety_level: 'unknown',
        source: 'chebi',
        source_db: 'ChEBI',
        chebi_id: r.chebiId,
        who_essential: isWHOEssential(r.chebiAsciiName),
      }));
  } catch (e) {
    console.error('ChEBI search failed:', e.message);
    return [];
  }
}

async function searchPubChemAutocomplete(query) {
  try {
    const autoUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(query)}/json?limit=8`;
    const res = await fetch(autoUrl);
    if (!res.ok) return [];
    const data = await res.json();
    const terms = data?.dictionary_terms?.compound || [];
    return terms.slice(0, 6).map(term => ({
      name: term,
      scientific_name: term,
      chemical_type: 'compound',
      category: 'other',
      safety_level: 'unknown',
      source: 'pubchem',
      source_db: 'PubChem',
      who_essential: isWHOEssential(term),
    }));
  } catch (e) {
    return [];
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body", results: [] }, { status: 400 });
  }
  
  const query = body.query || '';
  const category = body.category;
  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) {
    return Response.json({ results: [] });
  }

  try {
    // 1. Built-in chemicals (instant)
    const builtinResults = BUILTIN_CHEMICALS.filter(c =>
      c.keywords.some(kw => kw.includes(searchTerm) || searchTerm.includes(kw)) ||
      c.name.toLowerCase().includes(searchTerm) ||
      c.scientific_name.toLowerCase().includes(searchTerm)
    ).map(c => ({ 
      ...c, 
      source: 'builtin', 
      source_db: 'Built-in',
      who_essential: isWHOEssential(c.name) || isWHOEssential(c.scientific_name)
    }));

    // 2. DB chemicals
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
        ).map(c => ({ ...c, source: 'database', source_db: 'Suttain DB', who_essential: isWHOEssential(c.name) }));
      }
    } catch (e) {
      console.error("DB search failed:", e);
    }

    // 3. Combine built-in + DB
    let finalResults = dedupAndPrioritize([...dbResults, ...builtinResults]);

    // 4. Always enrich with external databases in parallel
    const resolvedName = COMMON_NAME_MAP[searchTerm] || searchTerm;
    const [pubchemResults, chemblResults, chebiResults, autocompleteResults] = await Promise.allSettled([
      searchPubChem(resolvedName, query),
      searchChEMBL(query),
      searchChEBI(query),
      finalResults.length === 0 ? searchPubChemAutocomplete(query) : Promise.resolve([]),
    ]);

    const externalResults = [
      ...(pubchemResults.status === 'fulfilled' ? pubchemResults.value : []),
      ...(chemblResults.status === 'fulfilled' ? chemblResults.value : []),
      ...(chebiResults.status === 'fulfilled' ? chebiResults.value : []),
      ...(autocompleteResults.status === 'fulfilled' ? autocompleteResults.value : []),
    ];

    finalResults = dedupAndPrioritize([...finalResults, ...externalResults]);

    // 5. Category filter
    if (category && category !== 'all') {
      finalResults = finalResults.filter(c => c.category?.toLowerCase() === category.toLowerCase());
    }

    // Tag WHO Essential at top level for UI display
    finalResults = finalResults.map(c => ({
      ...c,
      who_essential: c.who_essential || isWHOEssential(c.name) || isWHOEssential(c.scientific_name),
    }));

    finalResults = finalResults.slice(0, 20);

    const sources = [...new Set(finalResults.map(r => r.source_db).filter(Boolean))];
    console.log(`Found ${finalResults.length} results from: ${sources.join(', ')}`);

    return Response.json({ results: finalResults, sources });

  } catch (error) {
    console.error("Chemical search error:", error);
    return Response.json({ error: "Search failed", details: error.message }, { status: 500 });
  }
});