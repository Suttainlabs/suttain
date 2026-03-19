import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

/**
 * Converts an 8-digit UPC-E barcode to its 12-digit UPC-A equivalent.
 * This is crucial for looking up compressed barcodes in most databases.
 * @param {string} upcE - The 8-digit UPC-E code.
 * @returns {string} The 12-digit UPC-A code.
 */
function convertUpcEtoUpcA(upcE) {
    if (!/^\d{8}$/.test(upcE)) {
        return upcE; // Return original if not a valid 8-digit code
    }

    let upcAExpansion = '';
    const manufacturerPrefix = upcE.substring(1, 6);
    const lastDigit = upcE.charAt(6); // This is the expansion digit for UPC-E

    // UPC-E expansion rules (from Wikipedia/GS1 specifications)
    if (['0', '1', '2'].includes(lastDigit)) {
        // Form: AB CDE L (where L is 0,1, or 2) becomes AB CDE L0000X
        upcAExpansion = upcE.substring(0, 1) + upcE.substring(2, 6) + lastDigit + '0000';
    } else if (lastDigit === '3') {
        // Form: AB CDE 3 becomes AB CDE 00000X
        upcAExpansion = upcE.substring(0, 3) + '00000' + upcE.substring(3, 6);
    } else if (lastDigit === '4') {
        // Form: AB CD4 X becomes AB CD00000X
        upcAExpansion = upcE.substring(0, 4) + '00000' + upcE.substring(4, 6);
    } else { // Digits 5, 6, 7, 8, 9
        // Form: AB C5X becomes ABC000000X or AB C6X becomes ABC000000X, etc.
        // The rule here is: AB CD E5-9 X -> AB CDE5-90000X
        upcAExpansion = upcE.substring(0, 5) + '0000' + upcE.substring(5, 7);
    }

    // The logic above directly produced the 11 digits that are used to calculate the checksum.
    // The first digit of the 12-digit UPC-A is always 0 for UPC-E conversions.
    const fullCodeWithoutChecksum = '0' + upcAExpansion; // Should be 11 digits at this point

    if (fullCodeWithoutChecksum.length !== 11) {
        // This should ideally not happen if the logic above is correct.
        // It's a safeguard to ensure we have exactly 11 digits for checksum calculation.
        console.error('UPC-E conversion error: Expanded code is not 11 digits long.');
        return upcE;
    }

    // Calculate UPC-A checksum
    let oddSum = 0;
    let evenSum = 0;
    for (let i = 0; i < 11; i++) {
        const digit = parseInt(fullCodeWithoutChecksum.charAt(i), 10);
        if ((i + 1) % 2 !== 0) { // 1st, 3rd, 5th, etc. (0-indexed: 0, 2, 4...)
            oddSum += digit;
        } else { // 2nd, 4th, 6th, etc. (0-indexed: 1, 3, 5...)
            evenSum += digit;
        }
    }
    const total = (oddSum * 3) + evenSum;
    const checksum = (10 - (total % 10)) % 10;

    return fullCodeWithoutChecksum + checksum;
}


Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        let { barcode } = await req.json();

        if (!barcode) {
            return new Response(JSON.stringify({ error: 'Barcode is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // --- FIX: Convert 8-digit UPC-E to 12-digit UPC-A before lookup ---
        // UPC-E (8-digit) barcodes are often compressed versions of UPC-A.
        // Most databases expect the 12-digit UPC-A or 13-digit EAN-13.
        // If an 8-digit barcode is detected, attempt to convert it to UPC-A.
        if (barcode.length === 8) {
            const convertedBarcode = convertUpcEtoUpcA(barcode);
            if (convertedBarcode.length === 12) { // Only use conversion if successful
                barcode = convertedBarcode;
                console.log(`Converted 8-digit UPC-E to 12-digit UPC-A: ${convertedBarcode}`);
            } else {
                console.warn(`Failed to convert 8-digit UPC-E (${barcode}) to UPC-A, proceeding with original.`);
            }
        }

        // Validate barcode length (after potential conversion)
        if (barcode.length < 8 || barcode.length > 14) {
            return new Response(JSON.stringify({
                error: 'Please enter a valid barcode (8-14 digits)'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Try multiple sources for comprehensive product data
        let productData = null;

        // First try: Open Food Facts (most comprehensive for food/cosmetics) - Upgraded to v2 API
        try {
            const offResponse = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}`);
            if (offResponse.ok) { // Check if the response was successful
                const offData = await offResponse.json();
                if (offData.status === 1 && offData.product) {
                    productData = transformOpenFoodFactsData(offData.product, barcode);
                }
            }
        } catch (error) {
            console.error('OpenFoodFacts lookup failed:', error);
        }

        // Second try: Open Beauty Facts (for cosmetics) - Upgraded to v2 API
        if (!productData) {
            try {
                const obfResponse = await fetch(`https://world.openbeautyfacts.org/api/v2/product/${barcode}`);
                 if (obfResponse.ok) { // Check if the response was successful
                    const obfData = await obfResponse.json();
                    if (obfData.status === 1 && obfData.product) {
                        productData = transformOpenBeautyFactsData(obfData.product, barcode);
                    }
                }
            } catch (error) {
                console.error('OpenBeautyFacts lookup failed:', error);
            }
        }

        // Third try: UPC Item DB (for general products)
        if (!productData) {
            try {
                const upcResponse = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
                if (upcResponse.ok) { // Check if the response was successful
                    const upcData = await upcResponse.json();
                    if (upcData.code === 'OK' && upcData.items && upcData.items.length > 0) {
                        productData = transformUPCData(upcData.items[0], barcode);
                    }
                }
            } catch (error) {
                console.error('UPC Database lookup failed:', error);
            }
        }

        // Fourth try with AI Fallback if no data is found
        if (!productData) {
            try {
                const llmResult = await base44.integrations.Core.InvokeLLM({
                    prompt: `You are a highly meticulous and authoritative global product data analyst specializing in chemical safety and consumer goods. Your primary goal is to find the most accurate and verifiable information for the product associated with the EAN/UPC barcode: "${barcode}".

             **Global Search Strategy:**
             Prioritize official manufacturer websites, verified regulatory databases, and reputable scientific sources from any region globally. This includes, but is not limited to:
             - **Americas (North, South, Central):** FDA, EPA, Health Canada, Mercosur standards.
             - **Europe:** ECHA, CosIng, EU Commission databases, national food and chemical agencies (e.g., UK FSA, German BfR, French ANSES).
             - **Asia:** Specific national regulatory bodies (e.g., China NMPA, Japan MHLW, India FSSAI), major retailers, local industry associations.
             - **Africa (including West Africa and Nigeria):** Relevant national health, safety, and consumer protection agencies, local industry standards.
             - **Rest of the World:** Equivalent official and reputable sources.

             **Language Adaptation:** If initial English searches are inconclusive, attempt searches using common product names or terms in the primary languages associated with the barcode's likely region of origin (e.g., French/German/Spanish for Europe, Chinese/Japanese for Asia, local languages for Africa).

             **Data Extraction Requirements:**
             Extract the product name, brand, primary category, and the *full, un-abbreviated ingredient list* (use INCI format if applicable for cosmetics, otherwise common chemical names).

             **CRITICAL FAILURE CONDITION:** If, after a thorough global and multi-lingual search, you cannot find ANY verifiable product information for this barcode, you MUST respond with a JSON object where the 'name' property is exactly "Product Not Found". Do not invent or guess product details.

             For each piece of extracted information, you MUST provide the exact URL of its official source if possible. If no high-confidence, verifiable source is found, you MUST explicitly state 'low' for confidence and provide a brief reason why (e.g., "no official source found", "data from retailer site only").

             Your response MUST strictly adhere to the provided JSON schema.`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            brand: { type: 'string' },
                            category: { type: 'string' },
                            ingredients_text: { type: 'string', description: "A single string of all ingredients, separated by commas (INCI format preferred for cosmetics)." },
                            source_url_citation: { type: 'string', nullable: true, description: "The exact URL of the official source where this data was found, if available." },
                            source_confidence: { type: 'string', enum: ["high", "medium", "low"], default: "medium", description: "Confidence in the accuracy of the extracted data based on source verifiability." }
                        },
                        required: ['name', 'brand', 'category', 'ingredients_text', 'source_confidence']
                    }
                });

                if (llmResult && llmResult.name) {
                    productData = await transformAIData(llmResult, barcode, base44);
                }
            } catch (llmError) {
                console.error('AI fallback lookup failed:', llmError);
            }
        }

        if (!productData) {
            productData = {
                name: 'Product Not Found',
                brand: 'Unknown',
                barcode: barcode,
                category: 'Unknown',
                source: 'Not Found',
                imageUrl: getFallbackImageUrl(),
                ingredientsText: `We could not find any information for barcode ${barcode}. Please verify the number and try again. This product may not be in our databases yet.`,
                ingredients: [],
                hazards: [],
                allergens: [],
                interactionRisks: [],
                diyFormulas: [],
                analysisNotes: [`No data could be found for the barcode: ${barcode}.`],
                riskAssessment: { overallRisk: 'unknown', hasKnownHazards: false },
                source_url: null
            };
        }

        return new Response(JSON.stringify(productData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Barcode lookup error:', error.message); // Log the specific error message
        return new Response(JSON.stringify({
            error: 'An unexpected error occurred. Please try again later.' // Generic error message for client
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

function normalizeIngredients(ingredients) {
    if (!ingredients || ingredients.length === 0) return [];

    const normalizationMap = {
        'aqua': 'water',
        'parfum': 'fragrance',
        'sodium chloride': 'salt'
    };

    return ingredients.map(ing => {
        const lowerCaseName = ing.name.toLowerCase();
        const normalizedName = normalizationMap[lowerCaseName] || lowerCaseName;

        // Capitalize first letter
        ing.name = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
        return ing;
    });
}

function transformOpenFoodFactsData(product, barcode) {
    const ingredientsText = product.ingredients_text || product.ingredients_text_en || '';
    let ingredients = parseIngredients(ingredientsText);
    ingredients = normalizeIngredients(ingredients);

    return {
        name: product.product_name || product.product_name_en || 'Unknown Product',
        brand: product.brands || 'Unknown Brand',
        barcode: barcode,
        category: determineCategory(product.categories || ''),
        source: 'OpenFoodFacts',
        imageUrl: product.image_url || getFallbackImageUrl(),
        ingredientsText: ingredientsText,
        ingredients: ingredients,
        hazards: analyzeHazards(ingredients),
        allergens: product.allergens_tags || [],
        interactionRisks: checkInteractionRisks(ingredients),
        diyFormulas: generateDIYFormulas(determineCategory(product.categories || '')),
        analysisNotes: [
            `Product found in Open Food Facts database.`,
            `Contains ${ingredients.length} identified ingredients.`,
            ingredientsText ? 'Full ingredient list available for analysis.' : 'Limited ingredient information available.'
        ],
        riskAssessment: {
            overallRisk: calculateRiskScore(ingredients, determineCategory(product.categories || ''), product.product_name),
            hasKnownHazards: analyzeHazards(ingredients).length > 0
        },
        source_url: `https://world.openfoodfacts.org/product/${barcode}`
    };
}

function transformUPCData(item, barcode) {
    const productName = item.title || 'Unknown Product';
    const category = determineCategory(item.category || '');

    const estimatedIngredients = generateEstimatedIngredients(category);

    return {
        name: productName,
        brand: item.brand || 'Unknown Brand',
        barcode: barcode,
        category: category,
        source: 'UPC Database',
        imageUrl: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : getFallbackImageUrl(),
        ingredientsText: 'Ingredient information not available from this source.',
        ingredients: estimatedIngredients,
        hazards: [],
        allergens: [],
        interactionRisks: [],
        diyFormulas: generateDIYFormulas(category),
        analysisNotes: [
            'Product found in UPC database.',
            'Ingredient information estimated based on product category.',
            'For detailed ingredient analysis, check product packaging.'
        ],
        riskAssessment: {
            overallRisk: calculateRiskScore(estimatedIngredients, category, productName),
            hasKnownHazards: false
        },
        source_url: item.ean ? `https://ean-search.org/ean/${item.ean}` : null
    };
}

function transformOpenBeautyFactsData(product, barcode) {
    const ingredientsText = product.ingredients_text || product.ingredients_text_en || '';
    let ingredients = parseIngredients(ingredientsText);
    ingredients = normalizeIngredients(ingredients);

    return {
        name: product.product_name || product.product_name_en || 'Unknown Product',
        brand: product.brands || 'Unknown Brand',
        barcode: barcode,
        category: 'Cosmetic',
        source: 'OpenBeautyFacts',
        imageUrl: product.image_url || getFallbackImageUrl(),
        ingredientsText: ingredientsText,
        ingredients: ingredients,
        hazards: analyzeHazards(ingredients),
        allergens: product.allergens_tags || [],
        interactionRisks: checkInteractionRisks(ingredients),
        diyFormulas: generateDIYFormulas('cosmetic'),
        analysisNotes: [
            'Product found in Open Beauty Facts database.',
            `Contains ${ingredients.length} identified ingredients.`,
            'Cosmetic/beauty product with ingredient analysis available.'
        ],
        riskAssessment: {
            overallRisk: calculateRiskScore(ingredients, 'Cosmetic', product.product_name),
            hasKnownHazards: analyzeHazards(ingredients).length > 0
        },
        source_url: `https://world.openbeautyfacts.org/product/${barcode}`
    };
}

function parseIngredients(ingredientsText) {
    if (!ingredientsText) return [];

    // Purpose mapping based on common ingredient functions
    const purposeMap = {
        'water': 'Solvent',
        'aqua': 'Solvent',
        'alcohol': 'Solvent',
        'ethanol': 'Solvent',
        'propellant': 'Propellant',
        'butane': 'Propellant',
        'propane': 'Propellant',
        'isobutane': 'Propellant',
        'fragrance': 'Fragrance',
        'parfum': 'Fragrance',
        'cyclodextrin': 'Odor Eliminator',
        'hydroxypropyl': 'Odor Eliminator',
        'sodium': 'pH Adjuster',
        'citric acid': 'pH Adjuster',
        'benzisothiazolinone': 'Preservative',
        'methylisothiazolinone': 'Preservative',
        'phenoxyethanol': 'Preservative',
        'peg': 'Emulsifier',
        'polysorbate': 'Emulsifier',
        'glycerin': 'Moisturizer',
        'glycerol': 'Moisturizer',
        'aloe': 'Moisturizer',
        'dimethicone': 'Conditioning Agent',
        'lauryl sulfate': 'Surfactant',
        'laureth sulfate': 'Surfactant',
        'cocamidopropyl': 'Surfactant',
        'tocopherol': 'Antioxidant',
        'vitamin e': 'Antioxidant',
        'colorant': 'Colorant',
        'ci ': 'Colorant',
        'yellow': 'Colorant',
        'blue': 'Colorant',
        'red': 'Colorant'
    };

    const getPurpose = (name) => {
        const lowerName = name.toLowerCase();
        for (const [key, purpose] of Object.entries(purposeMap)) {
            if (lowerName.includes(key)) {
                return purpose;
            }
        }
        return 'Functional Ingredient';
    };

    // Safety scores based on ingredient type (more realistic than random)
    const getSafetyScore = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('water') || lowerName.includes('aqua')) return 98;
        if (lowerName.includes('glycerin') || lowerName.includes('aloe')) return 95;
        if (lowerName.includes('cyclodextrin')) return 92;
        if (lowerName.includes('citric acid')) return 90;
        if (lowerName.includes('fragrance') || lowerName.includes('parfum')) return 75;
        if (lowerName.includes('propellant') || lowerName.includes('butane') || lowerName.includes('propane')) return 70;
        if (lowerName.includes('benzisothiazolinone') || lowerName.includes('methylisothiazolinone')) return 65;
        if (lowerName.includes('sulfate')) return 72;
        return Math.floor(Math.random() * 20) + 75; // 75-95 for unknown
    };

    const getSustainabilityScore = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('water') || lowerName.includes('aqua')) return 95;
        if (lowerName.includes('aloe') || lowerName.includes('plant')) return 90;
        if (lowerName.includes('cyclodextrin')) return 85;
        if (lowerName.includes('citric acid')) return 88;
        if (lowerName.includes('propellant') || lowerName.includes('butane')) return 45;
        if (lowerName.includes('fragrance')) return 60;
        return Math.floor(Math.random() * 25) + 60; // 60-85 for unknown
    };

    // Parse ingredients more thoroughly - handle various separators and formats
    const cleanedText = ingredientsText
        .replace(/ingredients?:?\s*/gi, '') // Remove "Ingredients:" prefix
        .replace(/\s*\([^)]*\)\s*/g, ' ') // Remove parenthetical notes
        .replace(/\s*\[[^\]]*\]\s*/g, ' ') // Remove bracketed notes
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

    // Split by common separators: comma, semicolon, period followed by space and capital
    const rawIngredients = cleanedText
        .split(/[,;]|(?<=\.)\s+(?=[A-Z])/)
        .map(ing => ing.replace(/^\s*[•\-\*]\s*/, '').trim()) // Remove bullet points
        .filter(ing => ing.length > 1 && ing.length < 100) // Filter invalid entries
        .filter(ing => !/^\d+%?$/.test(ing)) // Remove percentage-only entries
        .filter(ing => !/^(and|or|with|contains|may contain)$/i.test(ing)); // Remove filler words

    // Deduplicate while preserving order
    const seen = new Set();
    const uniqueIngredients = rawIngredients.filter(ing => {
        const normalized = ing.toLowerCase().trim();
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
    });

    return uniqueIngredients.map(ingredient => {
        const name = ingredient.charAt(0).toUpperCase() + ingredient.slice(1).toLowerCase();
        return {
            name: name,
            purpose: getPurpose(name),
            safety: getSafetyScore(name),
            sustainability: getSustainabilityScore(name),
            notes: `${getPurpose(name)} commonly used in consumer products.`
        };
    });
}

function determineCategory(categories) {
    const categoryStr = (categories || '').toLowerCase();

    if (categoryStr.includes('cleaning') || categoryStr.includes('detergent')) {
        return 'Household Cleaner';
    }
    if (categoryStr.includes('cosmetic') || categoryStr.includes('beauty') || categoryStr.includes('skincare')) {
        return 'Skincare';
    }
    if (categoryStr.includes('food') || categoryStr.includes('beverage')) {
        return 'Food & Beverage';
    }
    return 'General Product';
}

function analyzeHazards(ingredients) {
    const hazards = [];

    const hazardPatterns = [
        { pattern: 'sodium lauryl sulfate', hazard: 'May cause skin irritation', type: 'irritant' },
        { pattern: 'formaldehyde', hazard: 'Potential carcinogen', type: 'carcinogen' },
        { pattern: 'parabens', hazard: 'Endocrine disruptor concerns', type: 'endocrine' },
        { pattern: 'phthalates', hazard: 'Reproductive health concerns', type: 'reproductive' },
        { pattern: 'triclosan', hazard: 'Antimicrobial resistance concerns', type: 'antimicrobial' },
        { pattern: 'fragrance', hazard: 'Can contain unknown allergens', type: 'allergen' }
    ];

    hazardPatterns.forEach(({ pattern, hazard, type }) => {
        if (ingredients.some(ing => ing.name.toLowerCase().includes(pattern))) {
            hazards.push({ description: hazard, type });
        }
    });

    return hazards;
}

function checkInteractionRisks(ingredients) {
    const risks = [];
    const ingredientNames = ingredients.map(i => i.name.toLowerCase());

    if (ingredientNames.some(name => name.includes('bleach')) &&
        ingredientNames.some(name => name.includes('ammonia'))) {
        risks.push('DANGER: Bleach and ammonia create toxic chloramine gas');
    }

    return risks;
}

function generateEstimatedIngredients(category) {
    const commonIngredients = {
        'Household Cleaner': [
            { name: 'Water', purpose: 'Solvent', safety: 95, sustainability: 95, notes: '' },
            { name: 'Surfactant', purpose: 'Cleaning agent', safety: 80, sustainability: 70, notes: '' },
            { name: 'Fragrance', purpose: 'Scent', safety: 75, sustainability: 60, notes: '' }
        ],
        'Skincare': [
            { name: 'Water', purpose: 'Base', safety: 95, sustainability: 95, notes: '' },
            { name: 'Emollients', purpose: 'Moisturizing', safety: 85, sustainability: 80, notes: '' },
            { name: 'Preservatives', purpose: 'Shelf life', safety: 80, sustainability: 70, notes: '' }
        ],
        'Food & Beverage': [
            { name: 'Primary ingredients', purpose: 'Main component', safety: 90, sustainability: 80, notes: '' },
            { name: 'Natural flavors', purpose: 'Taste', safety: 85, sustainability: 75, notes: '' }
        ]
    };

    return commonIngredients[category] || commonIngredients['Food & Beverage'];
}

function calculateRiskScore(ingredients, category, productName) {
    // If we have ingredients, calculate based on safety scores
    if (ingredients && ingredients.length > 0) {
        const avgSafety = ingredients.reduce((sum, ing) => sum + (ing.safety || 0), 0) / ingredients.length;
        
        // Check for specific hazardous ingredients
        const hasFragrance = ingredients.some(i => i.name.toLowerCase().includes('fragrance') || i.name.toLowerCase().includes('parfum'));
        const hasPropellant = ingredients.some(i => i.name.toLowerCase().includes('butane') || i.name.toLowerCase().includes('propane'));
        
        if (avgSafety >= 85 && !hasFragrance && !hasPropellant) return 'low';
        if (avgSafety >= 70 || hasFragrance || hasPropellant) return 'medium';
        return 'high';
    }
    
    // If no ingredients but we have product info, estimate based on category/name
    const lowerName = (productName || '').toLowerCase();
    const lowerCategory = (category || '').toLowerCase();
    
    // Generally safe product types
    const safeProdudcts = ['hand sanitizer', 'soap', 'water', 'lotion', 'moisturizer', 'shampoo', 'conditioner'];
    const mediumRiskProducts = ['cleaner', 'air freshener', 'deodorant', 'spray', 'detergent'];
    const highRiskProducts = ['bleach', 'acid', 'drain', 'oven cleaner', 'insecticide', 'pesticide'];
    
    if (highRiskProducts.some(term => lowerName.includes(term) || lowerCategory.includes(term))) {
        return 'high';
    }
    if (mediumRiskProducts.some(term => lowerName.includes(term) || lowerCategory.includes(term))) {
        return 'medium';
    }
    if (safeProdudcts.some(term => lowerName.includes(term) || lowerCategory.includes(term))) {
        return 'low';
    }
    
    return 'unknown';
}

function generateDIYFormulas(category) {
    const templates = {
        'Household Cleaner': [
            {
                name: 'Simple All-Purpose Cleaner',
                description: 'A versatile and non-toxic cleaner for most household surfaces.',
                ingredients: [
                    { name: 'Water', percentage: 80 },
                    { name: 'White Vinegar', percentage: 15 },
                    { name: 'Baking Soda', percentage: 3 },
                    { name: 'Lemon Essential Oil', percentage: 2 }
                ]
            }
        ],
        'Skincare': [
            {
                name: 'Basic Hydrating Moisturizer',
                description: 'A simple, natural moisturizer for daily use.',
                ingredients: [
                    { name: 'Aloe Vera Gel', percentage: 60 },
                    { name: 'Jojoba Oil', percentage: 25 },
                    { name: 'Shea Butter', percentage: 10 },
                    { name: 'Vitamin E Oil', percentage: 5 }
                ]
            }
        ]
    };

    const effectiveCategory = (category.toLowerCase().includes('cosmetic') || category.toLowerCase().includes('skincare')) ? 'Skincare' :
                              (category.toLowerCase().includes('cleaner')) ? 'Household Cleaner' : null;

    return templates[effectiveCategory] || [];
}

async function transformAIData(aiData, barcode, base44) {
    // Handle the explicit failure case from the AI
    if (aiData.name === 'Product Not Found') {
        return null; // Let the main function generate the standard "Not Found" response
    }

    let ingredients = parseIngredients(aiData.ingredients_text || '');
    ingredients = normalizeIngredients(ingredients);

    // --- Post-LLM Validation and Refinement ---
    let analysisNotes = [];
    let sourceString = 'AI Estimation';

    // 1. Dynamic analysis notes based on confidence
    if (aiData.source_confidence === 'low') {
        analysisNotes.push('Information estimated by AI with low confidence due to lack of verifiable official sources. Please cross-reference with product packaging.');
        sourceString = 'AI Estimation (Low Confidence)';
    } else if (aiData.source_confidence === 'high' && aiData.source_url_citation) {
        analysisNotes.push(`Information validated by AI from official source: ${aiData.source_url_citation}.`);
        sourceString = 'AI Estimation (High Confidence)';
    } else {
        analysisNotes.push('Product not found in standard databases. Information has been estimated by AI and may be incomplete.');
        sourceString = 'AI Estimation (Medium Confidence)';
    }

    // 2. Ingredient validation against internal DB
    if (ingredients.length > 0 && base44) {
        const uniqueIngredientNames = [...new Set(ingredients.map((ing) => ing.name.toLowerCase()))];
        const validationPromises = uniqueIngredientNames.map(name =>
            // Assuming `base44.entities.Chemical.filter` exists and returns an array of matching chemicals
            base44.entities.Chemical.filter({ name: name }, null, 1)
        );
        const validationResults = await Promise.all(validationPromises);
        const notFoundCount = validationResults.filter(res => res.length === 0).length;

        if (uniqueIngredientNames.length > 0 && (notFoundCount / uniqueIngredientNames.length > 0.25) && aiData.source_confidence !== 'high') {
             analysisNotes.push('Warning: A significant number of ingredients could not be verified against our database. The ingredient list may contain inaccuracies or AI hallucinations. Always verify with the physical product.');
        }
    }

    analysisNotes.push('Always verify details with the physical product packaging.');

    return {
        name: aiData.name || 'Unknown Product',
        brand: aiData.brand || 'Unknown Brand',
        barcode: barcode,
        category: determineCategory(aiData.category || ''),
        source: sourceString,
        imageUrl: getFallbackImageUrl(),
        ingredientsText: aiData.ingredients_text || 'Information estimated by AI. Please verify with product packaging.',
        ingredients: ingredients,
        hazards: analyzeHazards(ingredients),
        allergens: [],
        interactionRisks: checkInteractionRisks(ingredients),
        diyFormulas: generateDIYFormulas(determineCategory(aiData.category || '')),
        analysisNotes: analysisNotes,
        riskAssessment: {
            overallRisk: calculateRiskScore(ingredients, determineCategory(aiData.category || ''), aiData.name),
            hasKnownHazards: analyzeHazards(ingredients).length > 0
        },
        source_url: aiData.source_url_citation || null
    };
}

function getFallbackImageUrl() {
    return `https://d33wubrfki0l68.cloudfront.net/3b4b358e263799301735955a5170395351296d33/53f12/images/placeholders/product-placeholder.svg`;
}