import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const dedupAndPrioritize = (results) => {
    const uniqueMap = new Map();
    results.forEach(chem => {
        const key = (chem.cas_number || chem.name).toLowerCase();
        const existing = uniqueMap.get(key);

        // Prioritize records that have a formula and are not just custom entries
        if (!existing || (!existing.molecular_formula && chem.molecular_formula) || (existing.source === 'user_input' && chem.source !== 'user_input')) {
            uniqueMap.set(key, chem);
        }
    });
    return Array.from(uniqueMap.values());
};

const enrichWithLLM = async (base44, chemicalName) => {
    try {
        const prompt = `
            Given the chemical name "${chemicalName}", provide its most likely chemical type, primary category, and a brief, descriptive molecular formula string suitable for a layperson.
            For 'chemical_type', choose from: element, compound, mixture, extract, polymer, enzyme, material, pharmaceutical, other.
            For 'category', choose a single primary use like: skincare, cleaning, solvent, food_additive, industrial, aromatherapy, other.
            For 'molecular_formula', if it's a simple compound, use the chemical formula (e.g., 'H₂O'). If it's a complex mixture (like an essential oil), provide a descriptive string (e.g., 'Complex Mixture of Terpenes', 'Blend of Fatty Acids').

            Your response MUST be a single, valid JSON object with the following keys and nothing else:
            {"chemical_type": "...", "category": "...", "molecular_formula": "..."}
        `;

        const schema = {
            type: "object",
            properties: {
                chemical_type: { type: "string" },
                category: { type: "string" },
                molecular_formula: { type: "string" },
            },
            required: ["chemical_type", "category", "molecular_formula"],
        };

        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: schema,
        });

        // The InvokeLLM integration now directly returns the parsed JSON object
        if (llmResponse && llmResponse.chemical_type) {
            return llmResponse;
        }
        return null;

    } catch (error) {
        console.error(`LLM enrichment failed for "${chemicalName}":`, error);
        return null;
    }
};

const disambiguateWithLLM = async (base44, searchTerm) => {
    try {
        const prompt = `
            The user searched for "${searchTerm}", which is an ambiguous chemical term. Provide a list of up to 5 specific, common chemical names that this term could refer to.
            For example, if the search is "alcohol", you could return ["Ethanol", "Isopropyl Alcohol", "Methanol"].
            If the search is "vitamin c", return ["Ascorbic Acid"].
            Your response MUST be a single, valid JSON array of strings and nothing else. For example:
            ["Chemical Name 1", "Chemical Name 2"]
        `;
        const schema = {
            type: "array",
            items: { type: "string" }
        };
        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: schema,
        });
        return Array.isArray(llmResponse) ? llmResponse : null;
    } catch (error) {
        console.error(`LLM disambiguation failed for "${searchTerm}":`, error);
        return null;
    }
};

const CATEGORY_KEYWORDS = {
  all_purpose_cleaner: ['cleaning', 'surfactant', 'solvent', 'ph_adjuster', 'disinfectant'],
  glass_cleaner: ['cleaning', 'solvent', 'surfactant', 'anti-fog'],
  bathroom_cleaner: ['cleaning', 'acid', 'disinfectant', 'surfactant', 'chelating_agent'],
  kitchen_degreaser: ['cleaning', 'solvent', 'surfactant', 'base', 'degreaser'],
  facial_moisturizer: ['skincare', 'moisturizer', 'emollient', 'humectant', 'occlusive', 'antioxidant'],
  hand_soap: ['cleaning', 'surfactant', 'moisturizer', 'antimicrobial'],
  body_wash: ['cleaning', 'surfactant', 'moisturizer', 'fragrance'],
  shampoo: ['hair_care', 'surfactant', 'conditioner', 'thickener'],
  sunscreen: ['skincare', 'uv_filter', 'sunscreen', 'antioxidant'],
  baby_products: ['skincare', 'gentle', 'soothing', 'moisturizer'],
  car_care: ['automotive', 'cleaning', 'wax', 'sealant', 'polish'],
  laundry_detergent: ['laundry', 'cleaning', 'enzyme', 'surfactant', 'fabric_softener'],
  eco_friendly: ['biodegradable', 'natural', 'plant-derived', 'eco-friendly'],
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const { query, productType, category } = await req.json(); // Changed: accept category
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) {
        return new Response(JSON.stringify({ results: [] }), {
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        let allChemicals = await base44.asServiceRole.entities.Chemical.filter({});

        // NEW: Apply category filter if provided
        if (category && category !== 'all') {
            allChemicals = allChemicals.filter(c => c.category?.toLowerCase() === category.toLowerCase());
        }
        
        let internalResults = allChemicals.filter(c =>
            c.name?.toLowerCase().includes(searchTerm) ||
            c.scientific_name?.toLowerCase().includes(searchTerm) ||
            c.iupac_name?.toLowerCase().includes(searchTerm) ||
            c.cas_number?.includes(searchTerm)
        );

        let finalResults = dedupAndPrioritize(internalResults);

        // If no sufficient results internally, try PubChem (only if not filtering by a specific category)
        if (finalResults.length === 0 && (!category || category === 'all')) {
            const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(searchTerm)}/property/IUPACName,MolecularFormula,MolecularWeight/JSON`;
            const pubchemResponse = await fetch(pubchemUrl);

            if (pubchemResponse.ok) {
                const pubchemData = await pubchemResponse.json();
                const properties = pubchemData?.PropertyTable?.Properties?.[0];

                if (properties && properties.CID) {
                    let newChemical = {
                        name: query, // Use original query casing for name
                        scientific_name: properties.IUPACName || query,
                        iupac_name: properties.IUPACName,
                        cas_number: null, // PubChem name search doesn't easily provide CAS
                        molecular_formula: properties.MolecularFormula,
                        molecular_weight: properties.MolecularWeight,
                        chemical_type: 'compound',
                        category: 'other',
                        safety_level: 'unknown',
                        radioactive: false,
                        source: 'pubchem_cache'
                    };

                    // Enrich with LLM if formula seems ambiguous or type is generic
                    const llmEnrichment = await enrichWithLLM(base44, newChemical.name);
                    if (llmEnrichment) {
                        newChemical = { ...newChemical, ...llmEnrichment };
                    }
                    
                    finalResults = [newChemical];

                    // Asynchronously cache the enriched result without waiting for it
                    base44.asServiceRole.entities.Chemical.create(newChemical)
                        .catch(e => console.error("Failed to cache new chemical:", e));
                }
            }
        }

        // If still no results after direct internal and pubchem search, try AI disambiguation
        if (finalResults.length === 0 && (!category || category === 'all')) {
            const specificNames = await disambiguateWithLLM(base44, searchTerm);
            if (specificNames && specificNames.length > 0) {
                // Re-run the internal search for each specific name suggested by the AI
                const disambiguatedResults = allChemicals.filter(c => 
                    specificNames.some(specificName => 
                        c.name?.toLowerCase() === specificName.toLowerCase() ||
                        c.scientific_name?.toLowerCase() === specificName.toLowerCase() ||
                        c.iupac_name?.toLowerCase() === specificName.toLowerCase()
                    )
                );
                finalResults = dedupAndPrioritize(disambiguatedResults);
            }
        }
        
        // New: Prioritize results based on productType
        if (productType && CATEGORY_KEYWORDS[productType] && finalResults.length > 0) {
            const keywords = new Set(CATEGORY_KEYWORDS[productType]);
            finalResults.sort((a, b) => {
                const aIsRelevant = keywords.has(a.category) || a.function_description?.toLowerCase().split(' ').some(word => keywords.has(word));
                const bIsRelevant = keywords.has(b.category) || b.function_description?.toLowerCase().split(' ').some(word => keywords.has(word));
                
                if (aIsRelevant && !bIsRelevant) return -1;
                if (!aIsRelevant && bIsRelevant) return 1;
                return 0;
            });
        }

        return new Response(JSON.stringify({ results: finalResults }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Chemical search error:", error);
        return new Response(JSON.stringify({ error: "Search failed", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});