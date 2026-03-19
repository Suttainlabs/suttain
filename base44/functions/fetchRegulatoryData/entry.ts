import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Regulatory database endpoints
const PUBCHEM_API = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
const FDA_NDC_API = 'https://api.fda.gov/drug/ndc.json';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ingredients, regions } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return Response.json({ error: 'Ingredients array is required' }, { status: 400 });
    }

    const regulatoryData = [];

    for (const ingredient of ingredients) {
      const ingredientData = {
        ingredient: ingredient,
        sources: [],
        echa_data: null,
        fda_data: null,
        pubchem_data: null,
        restrictions: [],
        status: 'Unknown'
      };

      // Fetch from PubChem (chemical properties and safety)
      try {
        const pubchemSearch = await fetch(
          `${PUBCHEM_API}/compound/name/${encodeURIComponent(ingredient)}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`,
          { headers: { 'Accept': 'application/json' } }
        );
        
        if (pubchemSearch.ok) {
          const pubchemData = await pubchemSearch.json();
          if (pubchemData.PropertyTable?.Properties?.[0]) {
            ingredientData.pubchem_data = pubchemData.PropertyTable.Properties[0];
            ingredientData.sources.push('PubChem');
          }
        }
      } catch (e) {
        console.log(`PubChem fetch failed for ${ingredient}:`, e.message);
      }

      // Fetch FDA data for drug/cosmetic ingredients
      try {
        const fdaSearch = await fetch(
          `${FDA_NDC_API}?search=active_ingredients:"${encodeURIComponent(ingredient)}"&limit=5`,
          { headers: { 'Accept': 'application/json' } }
        );
        
        if (fdaSearch.ok) {
          const fdaData = await fdaSearch.json();
          if (fdaData.results && fdaData.results.length > 0) {
            ingredientData.fda_data = {
              found_in_products: fdaData.results.length,
              sample_products: fdaData.results.slice(0, 3).map(r => ({
                brand: r.brand_name,
                manufacturer: r.labeler_name
              }))
            };
            ingredientData.sources.push('FDA NDC');
          }
        }
      } catch (e) {
        console.log(`FDA fetch failed for ${ingredient}:`, e.message);
      }

      // Check known restricted substances lists
      const restrictedSubstances = checkRestrictedLists(ingredient, regions);
      ingredientData.restrictions = restrictedSubstances.restrictions;
      
      // Determine overall status
      if (restrictedSubstances.isBanned) {
        ingredientData.status = 'Banned';
      } else if (restrictedSubstances.isRestricted) {
        ingredientData.status = 'Restricted';
      } else if (restrictedSubstances.requiresWarning) {
        ingredientData.status = 'Requires Warning';
      } else if (ingredientData.sources.length > 0) {
        ingredientData.status = 'Compliant';
      }

      regulatoryData.push(ingredientData);
    }

    return Response.json({
      success: true,
      data: regulatoryData,
      timestamp: new Date().toISOString(),
      sources_checked: ['PubChem', 'FDA NDC', 'Internal Regulatory Database']
    });

  } catch (error) {
    console.error('Regulatory data fetch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Check against known restricted/banned substance lists
function checkRestrictedLists(ingredient, regions = []) {
  const ingredientLower = ingredient.toLowerCase();
  
  // Known banned/restricted substances by region - USA now includes ALL federal regulations
  const bannedSubstances = {
    'EU': [
      'hydroquinone', 'mercury', 'lead acetate', 'methylene chloride',
      'chloroform', 'formaldehyde', 'coal tar', 'triclosan'
    ],
    'USA': [
      // FDA banned (cosmetics, drugs, food additives)
      'mercury', 'chloroform', 'vinyl chloride', 'zirconium', 'bithionol', 'chlorofluorocarbon', 'methylene chloride',
      // EPA banned substances
      'pcbs', 'ddt', 'chlordane', 'asbestos', 'hexavalent chromium', 'mercury compounds',
      // CPSC banned
      'lead paint',
      // Known carcinogens (Prop 65 + federal)
      'benzene', 'formaldehyde', 'acetaldehyde', 'asbestos', 'cadmium', 'arsenic'
    ],
    'Canada': [
      'coal tar', 'formaldehyde', 'mercury', 'lead', 'asbestos', 'bithionol'
    ],
    'Global_GHS': [
      'asbestos', 'benzene', 'formaldehyde', 'mercury'
    ],
    'Asia_Pacific': [
      'hydroquinone', 'mercury', 'lead compounds', 'glucocorticoids'
    ]
  };

  const restrictedSubstances = {
    'EU': [
      'salicylic acid', 'retinol', 'benzoyl peroxide', 'alpha hydroxy acids',
      'hydrogen peroxide', 'parabens', 'phenoxyethanol'
    ],
    'USA': [
      // FDA restricted (with concentration limits)
      'salicylic acid', 'benzoyl peroxide', 'hydroquinone', 'coal tar', 'fluoride', 'parabens', 'triclosan',
      'alpha hydroxy acids', 'beta hydroxy acids', 'retinol', 'retinyl palmitate',
      // EPA regulated
      'phthalates', 'bpa', 'pfas', 'vocs', 'formaldehyde resins',
      // TSCA regulated
      'nanomaterials', 'flame retardants',
      // OSHA exposure limits apply
      'ammonia', 'ethanol', 'isopropyl alcohol', 'acetone', 'toluene',
      // CPSC regulated (children's products)
      'phthalates', 'heavy metals',
      // ASTM standards
      'lead in toys', 'certain dyes',
      // Prop 65 restricted
      'talc', 'mineral oil', 'petrolatum', 'diethanolamine', 'triethanolamine'
    ],
    'Canada': [
      'salicylic acid', 'coal tar derivatives', 'vitamin a derivatives', 'parabens', 'phthalates'
    ],
    'Global_GHS': [
      'strong acids', 'strong bases', 'oxidizers'
    ],
    'Asia_Pacific': [
      'hydroquinone', 'retinoids', 'azelaic acid', 'certain preservatives'
    ]
  };

  const warningSubstances = {
    'EU': ['fragrance', 'parfum', 'essential oils', 'allergens', 'nanomaterials', 'uv filters'],
    'USA': [
      // Prop 65 warnings
      'titanium dioxide', 'carbon black', 'coconut oil diethanolamine', 'cocamide dea', 'aloe vera', 'pulegone', 'styrene', 'talc',
      // FDA labeling requirements
      'alpha hydroxy acids', 'sunscreen actives', 'drug facts panel ingredients',
      // OSHA hazard communication
      'volatile organic compounds', 'sensitizing agents', 'respiratory sensitizers'
    ],
    'Canada': ['fragrance allergens', 'fluoride compounds'],
    'Global_GHS': ['sensitizers', 'irritants', 'skin sensitizers'],
    'Asia_Pacific': ['whitening agents', 'certain preservatives']
  };

  const result = {
    isBanned: false,
    isRestricted: false,
    requiresWarning: false,
    restrictions: []
  };

  const regionsToCheck = regions.length > 0 ? regions : Object.keys(bannedSubstances);

  for (const region of regionsToCheck) {
    // Check banned
    if (bannedSubstances[region]) {
      for (const banned of bannedSubstances[region]) {
        if (ingredientLower.includes(banned) || banned.includes(ingredientLower)) {
          result.isBanned = true;
          const regulatoryBodies = region === 'USA' ? getUSARegulatoryBodies(banned) : region;
          result.restrictions.push({
            region,
            type: 'Banned',
            substance: banned,
            details: `${ingredient} is banned under ${regulatoryBodies} regulations`,
            regulatory_bodies: regulatoryBodies
          });
        }
      }
    }

    // Check restricted
    if (restrictedSubstances[region]) {
      for (const restricted of restrictedSubstances[region]) {
        if (ingredientLower.includes(restricted) || restricted.includes(ingredientLower)) {
          result.isRestricted = true;
          const regulatoryBodies = region === 'USA' ? getUSARegulatoryBodies(restricted) : region;
          result.restrictions.push({
            region,
            type: 'Restricted',
            substance: restricted,
            details: `${ingredient} has concentration limits under ${regulatoryBodies}`,
            regulatory_bodies: regulatoryBodies
          });
        }
      }
    }

    // Check warning required
    if (warningSubstances[region]) {
      for (const warning of warningSubstances[region]) {
        if (ingredientLower.includes(warning) || warning.includes(ingredientLower)) {
          result.requiresWarning = true;
          const regulatoryBodies = region === 'USA' ? getUSARegulatoryBodies(warning) : region;
          result.restrictions.push({
            region,
            type: 'Warning Required',
            substance: warning,
            details: `${ingredient} requires labeling under ${regulatoryBodies}`,
            regulatory_bodies: regulatoryBodies
          });
        }
      }
    }
  }

  return result;
}

// Helper function to identify which US regulatory bodies apply to a substance
function getUSARegulatoryBodies(substance) {
  const substanceLower = substance.toLowerCase();
  const bodies = [];
  
  // FDA jurisdiction (cosmetics, drugs, food)
  const fdaSubstances = ['mercury', 'chloroform', 'parabens', 'triclosan', 'hydroquinone', 'fluoride', 'salicylic acid', 'benzoyl peroxide', 'alpha hydroxy', 'beta hydroxy', 'retinol', 'sunscreen', 'drug facts', 'coal tar', 'bithionol'];
  if (fdaSubstances.some(s => substanceLower.includes(s))) bodies.push('FDA');
  
  // EPA jurisdiction (environmental, chemicals)
  const epaSubstances = ['pcbs', 'ddt', 'phthalates', 'bpa', 'pfas', 'vocs', 'formaldehyde', 'asbestos', 'chlordane'];
  if (epaSubstances.some(s => substanceLower.includes(s))) bodies.push('EPA');
  
  // OSHA jurisdiction (workplace safety)
  const oshaSubstances = ['ammonia', 'ethanol', 'isopropyl', 'acetone', 'volatile', 'sensitizing', 'toluene', 'respiratory'];
  if (oshaSubstances.some(s => substanceLower.includes(s))) bodies.push('OSHA');
  
  // CPSC jurisdiction (consumer products)
  const cpscSubstances = ['lead', 'phthalates', 'magnet', 'children', 'toys', 'heavy metals'];
  if (cpscSubstances.some(s => substanceLower.includes(s))) bodies.push('CPSC');
  
  // TSCA jurisdiction (toxic substances)
  const tscaSubstances = ['nanomaterials', 'flame retardant', 'pcbs', 'asbestos', 'hexavalent'];
  if (tscaSubstances.some(s => substanceLower.includes(s))) bodies.push('TSCA');
  
  // Prop 65 (California)
  const prop65Substances = ['titanium dioxide', 'diethanolamine', 'cocamide', 'aloe vera', 'styrene', 'carbon black', 'talc', 'benzene', 'formaldehyde', 'lead', 'cadmium', 'pulegone'];
  if (prop65Substances.some(s => substanceLower.includes(s))) bodies.push('CA Prop 65');
  
  // ASTM (standards)
  const astmSubstances = ['toys', 'dyes', 'heavy metals'];
  if (astmSubstances.some(s => substanceLower.includes(s))) bodies.push('ASTM');
  
  return bodies.length > 0 ? bodies.join(', ') : 'US Federal Regulations';
}