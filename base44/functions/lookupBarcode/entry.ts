import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function convertUpcEtoUpcA(upcE) {
    if (!/^\d{8}$/.test(upcE)) return upcE;
    const lastDigit = upcE.charAt(6);
    let upcAExpansion = '';
    if (['0', '1', '2'].includes(lastDigit)) {
        upcAExpansion = upcE.substring(0, 1) + upcE.substring(2, 6) + lastDigit + '0000';
    } else if (lastDigit === '3') {
        upcAExpansion = upcE.substring(0, 3) + '00000' + upcE.substring(3, 6);
    } else if (lastDigit === '4') {
        upcAExpansion = upcE.substring(0, 4) + '00000' + upcE.substring(4, 6);
    } else {
        upcAExpansion = upcE.substring(0, 5) + '0000' + upcE.substring(5, 7);
    }
    const fullCodeWithoutChecksum = '0' + upcAExpansion;
    if (fullCodeWithoutChecksum.length !== 11) return upcE;
    let oddSum = 0, evenSum = 0;
    for (let i = 0; i < 11; i++) {
        const digit = parseInt(fullCodeWithoutChecksum.charAt(i), 10);
        if ((i + 1) % 2 !== 0) oddSum += digit;
        else evenSum += digit;
    }
    const checksum = (10 - (((oddSum * 3) + evenSum) % 10)) % 10;
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
            return new Response(JSON.stringify({ error: 'Barcode is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Convert 8-digit UPC-E to 12-digit UPC-A
        if (barcode.length === 8) {
            const converted = convertUpcEtoUpcA(barcode);
            if (converted.length === 12) barcode = converted;
        }

        if (barcode.length < 8 || barcode.length > 14) {
            return new Response(JSON.stringify({ error: 'Please enter a valid barcode (8-14 digits)' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        let productData = null;

        // 1. Open Food Facts — global, includes African/Asian/European EANs
        try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}`, {
                headers: { 'User-Agent': 'Suttain/1.0 (contact@suttain.com)' }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 1 && data.product) {
                    productData = transformOpenFoodFactsData(data.product, barcode);
                }
            }
        } catch (e) { console.error('OpenFoodFacts failed:', e.message); }

        // 2. Open Beauty Facts — cosmetics globally
        if (!productData) {
            try {
                const res = await fetch(`https://world.openbeautyfacts.org/api/v2/product/${barcode}`, {
                    headers: { 'User-Agent': 'Suttain/1.0 (contact@suttain.com)' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 1 && data.product) {
                        productData = transformOpenBeautyFactsData(data.product, barcode);
                    }
                }
            } catch (e) { console.error('OpenBeautyFacts failed:', e.message); }
        }

        // 3. Open Pet Food Facts / Open Products Facts — broader coverage
        if (!productData) {
            try {
                const res = await fetch(`https://world.openproductsfacts.org/api/v2/product/${barcode}`, {
                    headers: { 'User-Agent': 'Suttain/1.0 (contact@suttain.com)' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 1 && data.product) {
                        productData = transformOpenFoodFactsData(data.product, barcode);
                        if (productData) productData.source = 'Open Products Facts';
                    }
                }
            } catch (e) { console.error('OpenProductsFacts failed:', e.message); }
        }

        // 4. UPC Item DB
        if (!productData) {
            try {
                const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.code === 'OK' && data.items && data.items.length > 0) {
                        productData = transformUPCData(data.items[0], barcode);
                    }
                }
            } catch (e) { console.error('UPC Item DB failed:', e.message); }
        }

        // 5. AI fallback with internet search — handles regional/African/Asian barcodes
        if (!productData) {
            try {
                const barcodePrefix = barcode.substring(0, 3);
                const countryHint = getBarcodeCountryHint(barcodePrefix);
                const llmResult = await base44.integrations.Core.InvokeLLM({
                    prompt: `You are a global product data analyst. Find information for EAN/UPC barcode: "${barcode}".

The barcode prefix "${barcodePrefix}" suggests: ${countryHint}. Search regional databases, manufacturer websites, retailer listings, and consumer goods databases for this region.

For African products (Nigeria, Ghana, etc.) check NAFDAC, NBS, local manufacturers and distributors.
For European products check national food safety databases.
For Asian products check local regulatory databases.

IMPORTANT: Return your best estimate even if confidence is low. Only use name "Product Not Found" if you truly have zero information.

Return ingredients as a comma-separated list in INCI format if cosmetic, otherwise common names.`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            brand: { type: 'string' },
                            category: { type: 'string' },
                            ingredients_text: { type: 'string' },
                            source_url_citation: { type: 'string' },
                            source_confidence: { type: 'string', enum: ['high', 'medium', 'low'] }
                        },
                        required: ['name', 'brand', 'category', 'ingredients_text', 'source_confidence']
                    }
                });

                if (llmResult && llmResult.name) {
                    productData = await transformAIData(llmResult, barcode, base44);
                }
            } catch (e) { console.error('AI fallback failed:', e.message); }
        }

        if (!productData) {
            productData = {
                name: 'Product Not Found',
                brand: 'Unknown',
                barcode: barcode,
                category: 'Unknown',
                source: 'Not Found',
                imageUrl: getFallbackImageUrl(),
                ingredientsText: `We could not find any information for barcode ${barcode}. This product may not be in global databases yet.`,
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

        return new Response(JSON.stringify(productData), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Barcode lookup error:', error.message);
        return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again later.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});

// Maps EAN prefix to country/region hint for better AI search
function getBarcodeCountryHint(prefix) {
    const num = parseInt(prefix, 10);
    if (num >= 0 && num <= 19) return 'USA/Canada (UPC-A)';
    if (num >= 30 && num <= 37) return 'France';
    if (num >= 40 && num <= 44) return 'Germany';
    if (num >= 45 && num <= 49) return 'Japan';
    if (num >= 50 && num <= 59) return 'UK';
    if (num >= 60 && num <= 69) return 'USA/Canada';
    if (num >= 70 && num <= 74) return 'Norway/Sweden/Finland/Denmark';
    if (num >= 76 && num <= 76) return 'Switzerland';
    if (num >= 80 && num <= 83) return 'Italy';
    if (num >= 84 && num <= 84) return 'Spain';
    if (num >= 87 && num <= 87) return 'Netherlands';
    if (num >= 93 && num <= 93) return 'Australia';
    if (num >= 94 && num <= 94) return 'New Zealand';
    if (num >= 619 && num <= 619) return 'Nigeria — search NAFDAC, Nigerian manufacturers, local consumer goods';
    if (num >= 611 && num <= 611) return 'Morocco';
    if (num >= 613 && num <= 613) return 'Algeria';
    if (num >= 615 && num <= 615) return 'Ghana';
    if (num >= 616 && num <= 616) return 'Senegal';
    if (num >= 621 && num <= 621) return 'Egypt';
    if (num >= 624 && num <= 624) return 'Libya';
    if (num >= 625 && num <= 625) return 'Jordan';
    if (num >= 626 && num <= 626) return 'Iran';
    if (num >= 627 && num <= 627) return 'Kuwait';
    if (num >= 628 && num <= 628) return 'Saudi Arabia';
    if (num >= 629 && num <= 629) return 'UAE';
    if (num >= 690 && num <= 699) return 'China';
    if (num >= 880 && num <= 880) return 'South Korea';
    if (num >= 885 && num <= 885) return 'Thailand';
    if (num >= 888 && num <= 888) return 'Singapore';
    if (num >= 893 && num <= 893) return 'Vietnam';
    if (num >= 899 && num <= 899) return 'Indonesia';
    return 'International/Unknown region';
}

function normalizeIngredients(ingredients) {
    if (!ingredients || ingredients.length === 0) return [];
    const normalizationMap = { 'aqua': 'water', 'parfum': 'fragrance', 'sodium chloride': 'salt' };
    return ingredients.map(ing => {
        const lowerCaseName = (typeof ing.name === 'string' ? ing.name : String(ing.name || '')).toLowerCase();
        const normalizedName = normalizationMap[lowerCaseName] || lowerCaseName;
        ing.name = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
        return ing;
    });
}

function transformOpenFoodFactsData(product, barcode) {
    const ingredientsText = product.ingredients_text || product.ingredients_text_en || '';
    let ingredients = parseIngredients(ingredientsText);
    ingredients = normalizeIngredients(ingredients);
    const category = determineCategory(product.categories || '');
    return {
        name: product.product_name || product.product_name_en || 'Unknown Product',
        brand: product.brands || 'Unknown Brand',
        barcode,
        category,
        source: 'OpenFoodFacts',
        imageUrl: product.image_url || getFallbackImageUrl(),
        ingredientsText,
        ingredients,
        hazards: analyzeHazards(ingredients),
        allergens: product.allergens_tags || [],
        interactionRisks: checkInteractionRisks(ingredients),
        diyFormulas: generateDIYFormulas(category),
        analysisNotes: [
            'Product found in Open Food Facts global database.',
            `Contains ${ingredients.length} identified ingredients.`,
            ingredientsText ? 'Full ingredient list available.' : 'Limited ingredient information available.'
        ],
        riskAssessment: { overallRisk: calculateRiskScore(ingredients, category, product.product_name), hasKnownHazards: analyzeHazards(ingredients).length > 0 },
        source_url: `https://world.openfoodfacts.org/product/${barcode}`
    };
}

function transformOpenBeautyFactsData(product, barcode) {
    const ingredientsText = product.ingredients_text || product.ingredients_text_en || '';
    let ingredients = parseIngredients(ingredientsText);
    ingredients = normalizeIngredients(ingredients);
    return {
        name: product.product_name || product.product_name_en || 'Unknown Product',
        brand: product.brands || 'Unknown Brand',
        barcode,
        category: 'Cosmetic',
        source: 'OpenBeautyFacts',
        imageUrl: product.image_url || getFallbackImageUrl(),
        ingredientsText,
        ingredients,
        hazards: analyzeHazards(ingredients),
        allergens: product.allergens_tags || [],
        interactionRisks: checkInteractionRisks(ingredients),
        diyFormulas: generateDIYFormulas('cosmetic'),
        analysisNotes: [
            'Product found in Open Beauty Facts database.',
            `Contains ${ingredients.length} identified ingredients.`
        ],
        riskAssessment: { overallRisk: calculateRiskScore(ingredients, 'Cosmetic', product.product_name), hasKnownHazards: analyzeHazards(ingredients).length > 0 },
        source_url: `https://world.openbeautyfacts.org/product/${barcode}`
    };
}

function transformUPCData(item, barcode) {
    const category = determineCategory(item.category || '');
    const estimatedIngredients = generateEstimatedIngredients(category);
    return {
        name: item.title || 'Unknown Product',
        brand: item.brand || 'Unknown Brand',
        barcode,
        category,
        source: 'UPC Database',
        imageUrl: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : getFallbackImageUrl(),
        ingredientsText: 'Ingredient information not available from this source.',
        ingredients: estimatedIngredients,
        hazards: [],
        allergens: [],
        interactionRisks: [],
        diyFormulas: generateDIYFormulas(category),
        analysisNotes: ['Product found in UPC database.', 'Ingredient information estimated based on product category.'],
        riskAssessment: { overallRisk: calculateRiskScore(estimatedIngredients, category, item.title), hasKnownHazards: false },
        source_url: null
    };
}

function parseIngredients(ingredientsText) {
    if (!ingredientsText) return [];

    const purposeMap = {
        'water': 'Solvent', 'aqua': 'Solvent', 'alcohol': 'Solvent', 'ethanol': 'Solvent',
        'propellant': 'Propellant', 'butane': 'Propellant', 'propane': 'Propellant', 'isobutane': 'Propellant',
        'fragrance': 'Fragrance', 'parfum': 'Fragrance',
        'cyclodextrin': 'Odor Eliminator', 'hydroxypropyl': 'Odor Eliminator',
        'sodium': 'pH Adjuster', 'citric acid': 'pH Adjuster',
        'benzisothiazolinone': 'Preservative', 'methylisothiazolinone': 'Preservative', 'phenoxyethanol': 'Preservative',
        'peg': 'Emulsifier', 'polysorbate': 'Emulsifier',
        'glycerin': 'Moisturizer', 'glycerol': 'Moisturizer', 'aloe': 'Moisturizer',
        'dimethicone': 'Conditioning Agent',
        'lauryl sulfate': 'Surfactant', 'laureth sulfate': 'Surfactant', 'cocamidopropyl': 'Surfactant',
        'tocopherol': 'Antioxidant', 'vitamin e': 'Antioxidant',
        'ci ': 'Colorant', 'yellow': 'Colorant', 'blue': 'Colorant', 'red': 'Colorant'
    };

    const getPurpose = (name) => {
        const lowerName = name.toLowerCase();
        for (const [key, purpose] of Object.entries(purposeMap)) {
            if (lowerName.includes(key)) return purpose;
        }
        return 'Functional Ingredient';
    };

    const getSafetyScore = (name) => {
        const l = name.toLowerCase();
        if (l.includes('water') || l.includes('aqua')) return 98;
        if (l.includes('glycerin') || l.includes('aloe')) return 95;
        if (l.includes('cyclodextrin') || l.includes('citric acid')) return 90;
        if (l.includes('fragrance') || l.includes('parfum')) return 75;
        if (l.includes('butane') || l.includes('propane')) return 70;
        if (l.includes('benzisothiazolinone') || l.includes('methylisothiazolinone')) return 65;
        if (l.includes('sulfate')) return 72;
        return 80;
    };

    const getSustainabilityScore = (name) => {
        const l = name.toLowerCase();
        if (l.includes('water') || l.includes('aqua')) return 95;
        if (l.includes('aloe') || l.includes('plant')) return 90;
        if (l.includes('citric acid')) return 88;
        if (l.includes('butane') || l.includes('propane')) return 45;
        if (l.includes('fragrance')) return 60;
        return 72;
    };

    const cleanedText = ingredientsText
        .replace(/ingredients?:?\s*/gi, '')
        .replace(/\s*\([^)]*\)\s*/g, ' ')
        .replace(/\s*\[[^\]]*\]\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const rawIngredients = cleanedText
        .split(/[,;]/)
        .map(ing => ing.replace(/^\s*[•\-\*]\s*/, '').trim())
        .filter(ing => ing.length > 1 && ing.length < 100)
        .filter(ing => !/^\d+%?$/.test(ing))
        .filter(ing => !/^(and|or|with|contains|may contain)$/i.test(ing));

    const seen = new Set();
    return rawIngredients
        .filter(ing => {
            const key = ing.toLowerCase().trim();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .map(ingredient => {
            const name = ingredient.charAt(0).toUpperCase() + ingredient.slice(1).toLowerCase();
            return { name, purpose: getPurpose(name), safety: getSafetyScore(name), sustainability: getSustainabilityScore(name), notes: `${getPurpose(name)} commonly used in consumer products.` };
        });
}

function determineCategory(categories) {
    const s = (categories || '').toLowerCase();
    if (s.includes('cleaning') || s.includes('detergent')) return 'Household Cleaner';
    if (s.includes('cosmetic') || s.includes('beauty') || s.includes('skincare')) return 'Skincare';
    if (s.includes('food') || s.includes('beverage')) return 'Food & Beverage';
    return 'General Product';
}

function analyzeHazards(ingredients) {
    const patterns = [
        { pattern: 'sodium lauryl sulfate', hazard: 'May cause skin irritation', type: 'irritant' },
        { pattern: 'formaldehyde', hazard: 'Potential carcinogen', type: 'carcinogen' },
        { pattern: 'parabens', hazard: 'Endocrine disruptor concerns', type: 'endocrine' },
        { pattern: 'phthalates', hazard: 'Reproductive health concerns', type: 'reproductive' },
        { pattern: 'triclosan', hazard: 'Antimicrobial resistance concerns', type: 'antimicrobial' },
        { pattern: 'fragrance', hazard: 'Can contain unknown allergens', type: 'allergen' }
    ];
    return patterns
        .filter(({ pattern }) => ingredients.some(ing => (typeof ing.name === 'string' ? ing.name : '').toLowerCase().includes(pattern)))
        .map(({ hazard, type }) => ({ description: hazard, type }));
}

function checkInteractionRisks(ingredients) {
    const names = ingredients.map(i => (typeof i.name === 'string' ? i.name : '').toLowerCase());
    const risks = [];
    if (names.some(n => n.includes('bleach')) && names.some(n => n.includes('ammonia'))) {
        risks.push('DANGER: Bleach and ammonia create toxic chloramine gas');
    }
    return risks;
}

function generateEstimatedIngredients(category) {
    const map = {
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
    return map[category] || map['Food & Beverage'];
}

function calculateRiskScore(ingredients, category, productName) {
    if (ingredients && ingredients.length > 0) {
        const avgSafety = ingredients.reduce((sum, ing) => sum + (ing.safety || 0), 0) / ingredients.length;
        const hasFragrance = ingredients.some(i => (i.name || '').toLowerCase().includes('fragrance') || (i.name || '').toLowerCase().includes('parfum'));
        const hasPropellant = ingredients.some(i => (i.name || '').toLowerCase().includes('butane') || (i.name || '').toLowerCase().includes('propane'));
        if (avgSafety >= 85 && !hasFragrance && !hasPropellant) return 'low';
        if (avgSafety >= 70 || hasFragrance || hasPropellant) return 'medium';
        return 'high';
    }
    const lowerName = (productName || '').toLowerCase();
    const lowerCat = (category || '').toLowerCase();
    if (['bleach', 'acid', 'drain', 'oven cleaner', 'insecticide', 'pesticide'].some(t => lowerName.includes(t) || lowerCat.includes(t))) return 'high';
    if (['cleaner', 'air freshener', 'deodorant', 'spray', 'detergent'].some(t => lowerName.includes(t) || lowerCat.includes(t))) return 'medium';
    if (['soap', 'lotion', 'moisturizer', 'shampoo', 'conditioner'].some(t => lowerName.includes(t) || lowerCat.includes(t))) return 'low';
    return 'unknown';
}

function generateDIYFormulas(category) {
    const templates = {
        'Household Cleaner': [{
            name: 'Simple All-Purpose Cleaner',
            description: 'A versatile and non-toxic cleaner for most household surfaces.',
            ingredients: [{ name: 'Water', percentage: 80 }, { name: 'White Vinegar', percentage: 15 }, { name: 'Baking Soda', percentage: 3 }, { name: 'Lemon Essential Oil', percentage: 2 }]
        }],
        'Skincare': [{
            name: 'Basic Hydrating Moisturizer',
            description: 'A simple, natural moisturizer for daily use.',
            ingredients: [{ name: 'Aloe Vera Gel', percentage: 60 }, { name: 'Jojoba Oil', percentage: 25 }, { name: 'Shea Butter', percentage: 10 }, { name: 'Vitamin E Oil', percentage: 5 }]
        }]
    };
    const effectiveCategory = (category.toLowerCase().includes('cosmetic') || category.toLowerCase().includes('skincare')) ? 'Skincare' :
        category.toLowerCase().includes('cleaner') ? 'Household Cleaner' : null;
    return templates[effectiveCategory] || [];
}

async function transformAIData(aiData, barcode, base44) {
    if (aiData.name === 'Product Not Found') return null;

    let ingredients = parseIngredients(aiData.ingredients_text || '');
    ingredients = normalizeIngredients(ingredients);

    let sourceString = 'AI Estimation';
    const analysisNotes = [];

    if (aiData.source_confidence === 'low') {
        analysisNotes.push('Information estimated by AI with low confidence. Please cross-reference with product packaging.');
        sourceString = 'AI Estimation (Low Confidence)';
    } else if (aiData.source_confidence === 'high' && aiData.source_url_citation) {
        analysisNotes.push(`Information validated by AI from: ${aiData.source_url_citation}.`);
        sourceString = 'AI Estimation (High Confidence)';
    } else {
        analysisNotes.push('Product not found in standard databases. Information estimated by AI and may be incomplete.');
        sourceString = 'AI Estimation (Medium Confidence)';
    }
    analysisNotes.push('Always verify details with the physical product packaging.');

    return {
        name: aiData.name || 'Unknown Product',
        brand: aiData.brand || 'Unknown Brand',
        barcode,
        category: determineCategory(aiData.category || ''),
        source: sourceString,
        imageUrl: getFallbackImageUrl(),
        ingredientsText: aiData.ingredients_text || 'Information estimated by AI. Please verify with product packaging.',
        ingredients,
        hazards: analyzeHazards(ingredients),
        allergens: [],
        interactionRisks: checkInteractionRisks(ingredients),
        diyFormulas: generateDIYFormulas(determineCategory(aiData.category || '')),
        analysisNotes,
        riskAssessment: { overallRisk: calculateRiskScore(ingredients, determineCategory(aiData.category || ''), aiData.name), hasKnownHazards: analyzeHazards(ingredients).length > 0 },
        source_url: aiData.source_url_citation || null
    };
}

function getFallbackImageUrl() {
    return 'https://d33wubrfki0l68.cloudfront.net/3b4b358e263799301735955a5170395351296d33/53f12/images/placeholders/product-placeholder.svg';
}