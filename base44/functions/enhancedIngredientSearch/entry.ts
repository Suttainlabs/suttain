import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Property mappings for ingredient search
const PROPERTY_KEYWORDS = {
  moisturizing: ['humectant', 'emollient', 'occlusive', 'hydrating', 'moisturizer', 'glycerin', 'hyaluronic'],
  antioxidant: ['antioxidant', 'vitamin c', 'vitamin e', 'tocopherol', 'ascorbic', 'polyphenol', 'resveratrol'],
  soothing: ['soothing', 'calming', 'anti-inflammatory', 'aloe', 'chamomile', 'allantoin', 'bisabolol'],
  cleansing: ['surfactant', 'cleanser', 'cleansing', 'soap', 'detergent', 'foaming'],
  emulsifying: ['emulsifier', 'emulsifying', 'stabilizer', 'lecithin', 'polysorbate'],
  preservative: ['preservative', 'antimicrobial', 'antifungal', 'phenoxyethanol', 'paraben'],
  thickening: ['thickener', 'thickening', 'viscosity', 'gum', 'cellulose', 'carbomer'],
  fragrance: ['fragrance', 'essential oil', 'aroma', 'perfume', 'scent'],
  exfoliating: ['exfoliant', 'exfoliating', 'aha', 'bha', 'glycolic', 'salicylic', 'lactic'],
  anti_aging: ['anti-aging', 'retinol', 'peptide', 'collagen', 'elastin', 'firming', 'wrinkle']
};

// Common ingredient data with supplier info
const INGREDIENT_DATABASE = [
  {
    name: "Glycerin",
    scientific_name: "Glycerol",
    category: "moisturizer",
    function_description: "A powerful humectant that draws moisture to the skin, providing hydration without greasiness.",
    safety_level: "safe",
    typical_percentage_range: "2-10%",
    properties: ["moisturizing", "soothing"],
    cas_number: "56-81-5"
  },
  {
    name: "Sodium Hyaluronate",
    scientific_name: "Hyaluronic Acid",
    category: "moisturizer",
    function_description: "Holds up to 1000x its weight in water, providing deep hydration and plumping effect.",
    safety_level: "safe",
    typical_percentage_range: "0.1-2%",
    properties: ["moisturizing", "anti_aging"],
    cas_number: "9067-32-7"
  },
  {
    name: "Niacinamide",
    scientific_name: "Vitamin B3",
    category: "skincare",
    function_description: "Improves skin barrier, reduces pores, brightens skin tone, and regulates sebum.",
    safety_level: "safe",
    typical_percentage_range: "2-10%",
    properties: ["soothing", "anti_aging"],
    cas_number: "98-92-0"
  },
  {
    name: "Tocopherol",
    scientific_name: "Vitamin E",
    category: "antioxidant",
    function_description: "Powerful antioxidant that protects skin from free radical damage and moisturizes.",
    safety_level: "safe",
    typical_percentage_range: "0.5-2%",
    properties: ["antioxidant", "moisturizing"],
    cas_number: "59-02-9"
  },
  {
    name: "Ascorbic Acid",
    scientific_name: "Vitamin C",
    category: "antioxidant",
    function_description: "Brightens skin, boosts collagen production, and provides antioxidant protection.",
    safety_level: "moderate",
    typical_percentage_range: "5-20%",
    properties: ["antioxidant", "anti_aging"],
    cas_number: "50-81-7"
  },
  {
    name: "Aloe Barbadensis Leaf Juice",
    scientific_name: "Aloe Vera",
    category: "skincare",
    function_description: "Soothes, hydrates, and calms irritated skin with natural healing properties.",
    safety_level: "safe",
    typical_percentage_range: "1-50%",
    properties: ["soothing", "moisturizing"],
    cas_number: "85507-69-3"
  },
  {
    name: "Cetearyl Alcohol",
    scientific_name: "Cetearyl Alcohol",
    category: "emulsifier",
    function_description: "Fatty alcohol that acts as emulsifier and thickener, adds creaminess to formulas.",
    safety_level: "safe",
    typical_percentage_range: "2-6%",
    properties: ["emulsifying", "thickening"],
    cas_number: "67762-27-0"
  },
  {
    name: "Phenoxyethanol",
    scientific_name: "Phenoxyethanol",
    category: "preservative",
    function_description: "Broad-spectrum preservative effective against bacteria and some fungi.",
    safety_level: "moderate",
    typical_percentage_range: "0.5-1%",
    properties: ["preservative"],
    cas_number: "122-99-6"
  },
  {
    name: "Sodium Lauryl Sulfate",
    scientific_name: "SLS",
    category: "surfactant",
    function_description: "Strong cleansing agent that creates rich foam, removes oil and dirt effectively.",
    safety_level: "moderate",
    typical_percentage_range: "1-5%",
    properties: ["cleansing"],
    cas_number: "151-21-3"
  },
  {
    name: "Xanthan Gum",
    scientific_name: "Xanthan Gum",
    category: "thickener",
    function_description: "Natural thickener and stabilizer that creates smooth, uniform textures.",
    safety_level: "safe",
    typical_percentage_range: "0.1-1%",
    properties: ["thickening"],
    cas_number: "11138-66-2"
  },
  {
    name: "Retinol",
    scientific_name: "Vitamin A",
    category: "skincare",
    function_description: "Gold standard anti-aging ingredient that promotes cell turnover and collagen production.",
    safety_level: "moderate",
    typical_percentage_range: "0.025-1%",
    properties: ["anti_aging"],
    cas_number: "68-26-8"
  },
  {
    name: "Salicylic Acid",
    scientific_name: "2-Hydroxybenzoic Acid",
    category: "skincare",
    function_description: "BHA that exfoliates, unclogs pores, and treats acne with anti-inflammatory benefits.",
    safety_level: "moderate",
    typical_percentage_range: "0.5-2%",
    properties: ["exfoliating", "cleansing"],
    cas_number: "69-72-7"
  },
  {
    name: "Glycolic Acid",
    scientific_name: "Hydroxyacetic Acid",
    category: "skincare",
    function_description: "AHA that exfoliates dead skin cells, improves texture, and boosts radiance.",
    safety_level: "moderate",
    typical_percentage_range: "1-10%",
    properties: ["exfoliating", "anti_aging"],
    cas_number: "79-14-1"
  },
  {
    name: "Allantoin",
    scientific_name: "Allantoin",
    category: "skincare",
    function_description: "Gentle ingredient that soothes, promotes healing, and softens skin.",
    safety_level: "safe",
    typical_percentage_range: "0.1-2%",
    properties: ["soothing"],
    cas_number: "97-59-6"
  },
  {
    name: "Shea Butter",
    scientific_name: "Butyrospermum Parkii Butter",
    category: "moisturizer",
    function_description: "Rich emollient that deeply nourishes, softens, and protects skin barrier.",
    safety_level: "safe",
    typical_percentage_range: "1-25%",
    properties: ["moisturizing", "soothing"],
    cas_number: "194043-92-0"
  }
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON", results: [] }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { query = '', properties = [], category = 'all', productType, excludeIngredients = [] } = body;
  const searchTerm = query.trim().toLowerCase();
  const excludeSet = new Set(excludeIngredients.map(e => e?.toLowerCase()));

  try {
    // Start with our curated database
    let results = [...INGREDIENT_DATABASE];

    // Also fetch from Chemical entity if available
    try {
      const dbChemicals = await base44.asServiceRole.entities.Chemical.list();
      if (Array.isArray(dbChemicals)) {
        const mappedDbChemicals = dbChemicals.map(c => ({
          name: c.name,
          scientific_name: c.scientific_name || c.iupac_name,
          category: c.category,
          function_description: c.function_description,
          safety_level: c.safety_level,
          typical_percentage_range: null,
          properties: [],
          cas_number: c.cas_number,
          molecular_formula: c.molecular_formula,
          molecular_weight: c.molecular_weight
        }));
        
        // Merge, avoiding duplicates
        const existingNames = new Set(results.map(r => r.name.toLowerCase()));
        mappedDbChemicals.forEach(c => {
          if (!existingNames.has(c.name?.toLowerCase())) {
            results.push(c);
          }
        });
      }
    } catch (dbError) {
      console.error("Could not fetch from Chemical entity:", dbError);
    }

    // Filter by properties if specified
    if (properties.length > 0) {
      results = results.filter(ingredient => {
        // Check if ingredient has any of the selected properties
        const hasDirectProperty = ingredient.properties?.some(p => properties.includes(p));
        if (hasDirectProperty) return true;

        // Check if ingredient description or name matches property keywords
        const textToSearch = `${ingredient.name} ${ingredient.scientific_name} ${ingredient.function_description} ${ingredient.category}`.toLowerCase();
        return properties.some(prop => {
          const keywords = PROPERTY_KEYWORDS[prop] || [];
          return keywords.some(kw => textToSearch.includes(kw.toLowerCase()));
        });
      });
    }

    // Filter by category
    if (category && category !== 'all') {
      results = results.filter(r => r.category?.toLowerCase() === category.toLowerCase());
    }

    // Filter by search term
    if (searchTerm) {
      results = results.filter(r => 
        r.name?.toLowerCase().includes(searchTerm) ||
        r.scientific_name?.toLowerCase().includes(searchTerm) ||
        r.function_description?.toLowerCase().includes(searchTerm) ||
        r.cas_number?.includes(searchTerm)
      );
    }

    // Exclude ingredients already in formula
    results = results.filter(r => !excludeSet.has(r.name?.toLowerCase()));

    // Sort by relevance (exact matches first, then partial)
    if (searchTerm) {
      results.sort((a, b) => {
        const aExact = a.name?.toLowerCase() === searchTerm;
        const bExact = b.name?.toLowerCase() === searchTerm;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      });
    }

    // Limit results
    results = results.slice(0, 20);

    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Enhanced ingredient search error:", error);
    return new Response(JSON.stringify({ error: error.message, results: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});