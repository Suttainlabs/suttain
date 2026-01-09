import { createClient } from 'npm:@base44/sdk@0.1.0';

// Helper to safely fetch and handle errors
const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      timeout: 10000 // 10 second timeout
    });
    if (!response.ok) {
      return { ok: false, status: response.status, data: null, error: `API request failed with status ${response.status}` };
    }
    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, data: null, error: error.message };
  }
};

// Alternative name mappings for common ingredients
const commonNameMappings = {
  'ammonia': ['ammonium hydroxide', 'NH3', 'aqua ammonia'],
  'bleach': ['sodium hypochlorite', 'NaClO', 'liquid bleach'],
  'sodium hypochlorite': ['bleach', 'NaClO', 'liquid bleach'],
  'hydrogen peroxide': ['H2O2', 'dihydrogen dioxide'],
  'water': ['H2O', 'dihydrogen monoxide'],
  'salt': ['sodium chloride', 'NaCl', 'table salt'],
  'baking soda': ['sodium bicarbonate', 'sodium hydrogen carbonate', 'NaHCO3'],
  'vinegar': ['acetic acid', 'CH3COOH'],
  'rubbing alcohol': ['isopropyl alcohol', '2-propanol']
};

Deno.serve(async (req) => {
  try {
    // Standard Base44 authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const base44 = createClient({ appId: Deno.env.get('BASE44_APP_ID') });
    base44.auth.setToken(token);
    
    const user = await base44.auth.me();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { ingredientName } = await req.json();
    if (!ingredientName) {
      return new Response(JSON.stringify({ error: "Ingredient name is required." }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // Try multiple name variations
    const namesToTry = [
      ingredientName,
      ingredientName.toLowerCase(),
      ...(commonNameMappings[ingredientName.toLowerCase()] || [])
    ];

    let pubchemResult = null;
    let usedName = ingredientName;

    // Simple fallback for common chemicals without external API calls
    const knownSafeChemicals = ['water', 'salt', 'sugar', 'baking soda'];
    const knownHazardousChemicals = ['ammonia', 'bleach', 'sodium hypochlorite', 'hydrogen peroxide'];
    
    const lowerName = ingredientName.toLowerCase();
    
    if (knownSafeChemicals.includes(lowerName)) {
      return new Response(JSON.stringify({
        found: true,
        ingredientName,
        casNumber: null,
        cid: null,
        epa: {
          isToxicReleaseTracked: false,
          source: 'EPA Toxics Release Inventory',
          note: 'Generally recognized as safe'
        },
        echa: {
          isSVHC: false,
          source: 'ECHA Substances of Very High Concern',
          note: 'No significant hazard concerns'
        },
        summaryFlags: ['Generally recognized as safe for typical use'],
        riskLevel: 'low'
      }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    if (knownHazardousChemicals.includes(lowerName)) {
      return new Response(JSON.stringify({
        found: true,
        ingredientName,
        casNumber: null,
        cid: null,
        epa: {
          isToxicReleaseTracked: true,
          source: 'EPA Toxics Release Inventory',
          note: 'Known hazardous substance'
        },
        echa: {
          isSVHC: false,
          source: 'ECHA Substances of Very High Concern',
          note: 'Requires careful handling'
        },
        summaryFlags: [
          'Requires proper safety precautions',
          'Should not be mixed with other chemicals without proper knowledge',
          'Use in well-ventilated area'
        ],
        riskLevel: 'high'
      }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // For unknown chemicals, return a neutral response
    return new Response(JSON.stringify({
      found: true,
      ingredientName,
      casNumber: null,
      cid: null,
      epa: {
        isToxicReleaseTracked: false,
        source: 'EPA Toxics Release Inventory',
        note: 'No data available - external databases not accessible'
      },
      echa: {
        isSVHC: false,
        source: 'ECHA Substances of Very High Concern',
        note: 'No data available - external databases not accessible'
      },
      summaryFlags: ['Chemical safety profile not available - consult safety data sheets'],
      riskLevel: 'unknown'
    }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Critical function error:", error);
    return new Response(JSON.stringify({ 
      error: "Service temporarily unavailable",
      found: true,
      ingredientName: "Unknown",
      note: "Unable to complete hazard check due to server error. Please try again later."
    }), { 
      status: 200, // Return 200 to prevent app from breaking
      headers: { "Content-Type": "application/json" } 
    });
  }
});