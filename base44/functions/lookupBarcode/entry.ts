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

        // PLU codes are 4-5 digits (fresh produce) — handle separately
        if (barcode.length >= 4 && barcode.length <= 5) {
            const pluResult = await lookupPLU(barcode, base44);
            return new Response(JSON.stringify(pluResult), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (barcode.length < 8 || barcode.length > 14) {
            return new Response(JSON.stringify({ error: 'Please enter a valid barcode (4-5 digits for PLU or 8-14 digits for UPC/EAN)' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
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

        // 3. Open Medicine Facts — medicines, drugs, supplements
        if (!productData) {
            try {
                const res = await fetch(`https://world.openmedicinefacts.org/api/v2/product/${barcode}`, {
                    headers: { 'User-Agent': 'Suttain/1.0 (contact@suttain.com)' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 1 && data.product) {
                        productData = transformMedicineFactsData(data.product, barcode);
                    }
                }
            } catch (e) { console.error('OpenMedicineFacts failed:', e.message); }
        }

        // 3b. Open Products Facts — broader coverage
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

        // 3c. NIH RxNorm / NLM DailyMed — US prescription & OTC drugs
        if (!productData) {
            try {
                // Try RxNorm NDC lookup (National Drug Code encoded in some barcodes)
                const ndcFormatted = barcode.replace(/^0+/, ''); // strip leading zeros
                const rxRes = await fetch(`https://rxnav.nlm.nih.gov/REST/ndcstatus.json?ndc=${barcode}`);
                if (rxRes.ok) {
                    const rxData = await rxRes.json();
                    const rxcui = rxData?.ndcStatus?.rxcui;
                    if (rxcui) {
                        const drugRes = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`);
                        const drugData = drugRes.ok ? await drugRes.json() : null;
                        const propRes = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/allrelated.json`);
                        const propData = propRes.ok ? await propRes.json() : null;
                        if (drugData?.properties) {
                            productData = transformRxNormData(drugData.properties, propData, barcode, rxcui);
                        }
                    }
                }
            } catch (e) { console.error('RxNorm lookup failed:', e.message); }
        }

        // 3d. OpenFDA drug label lookup
        if (!productData) {
            try {
                const fdaRes = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.upc:"${barcode}"&limit=1`);
                if (fdaRes.ok) {
                    const fdaData = await fdaRes.json();
                    if (fdaData.results?.length > 0) {
                        productData = transformFDADrugData(fdaData.results[0], barcode);
                    }
                }
            } catch (e) { console.error('FDA drug lookup failed:', e.message); }
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
                const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: `You are a global product data analyst with expertise in consumer goods, pharmaceuticals, supplements, and medical devices. Find information for EAN/UPC/NDC barcode: "${barcode}".

The barcode prefix "${barcodePrefix}" suggests: ${countryHint}. Search ALL relevant databases including:
- Consumer goods: manufacturer websites, retailer listings, GS1 databases
- Pharmaceuticals & OTC drugs: FDA NDC database, DailyMed, RxNorm, EMA, WHO essential medicines, national drug registries
- Supplements & vitamins: NIH Dietary Supplement Label Database, natural product databases
- Medical devices: FDA 510k, CE mark databases
- African products (Nigeria, Ghana, etc.): NAFDAC, KEBS, NACC, local manufacturers
- European products: EMA, national food/drug safety databases
- Asian products: PMDA (Japan), NMPA (China), local regulatory databases

This barcode could be for: food, beverage, cosmetic, personal care, medicine, prescription drug, OTC drug, supplement, vitamin, medical device, or household product.

IMPORTANT: Return your best estimate even if confidence is low. Only use name "Product Not Found" if you truly have zero information.
For medicines/drugs: list active ingredients, inactive excipients, dosage form, strength if known.
For food/cosmetics: list ingredients in INCI format if cosmetic, otherwise common names.`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            brand: { type: 'string' },
                            category: { type: 'string' },
                            ingredients_text: { type: 'string' },
                            active_ingredients: { type: 'string' },
                            dosage_form: { type: 'string' },
                            strength: { type: 'string' },
                            indications: { type: 'string' },
                            warnings: { type: 'string' },
                            is_prescription: { type: 'boolean' },
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
    if (s.includes('prescription') || s.includes('rx only') || s.includes('prescription drug')) return 'Prescription Drug';
    if (s.includes('otc') || s.includes('over-the-counter') || s.includes('drug') || s.includes('medicine') || s.includes('tablet') || s.includes('capsule') || s.includes('syrup') || s.includes('injection') || s.includes('pharmaceutical')) return 'Medicine / Drug';
    if (s.includes('supplement') || s.includes('vitamin') || s.includes('mineral') || s.includes('herbal') || s.includes('probiotic')) return 'Supplement / Vitamin';
    if (s.includes('medical device') || s.includes('diagnostic') || s.includes('first aid')) return 'Medical Device';
    if (s.includes('cleaning') || s.includes('detergent')) return 'Household Cleaner';
    if (s.includes('cosmetic') || s.includes('beauty') || s.includes('skincare')) return 'Skincare';
    if (s.includes('food') || s.includes('beverage')) return 'Food & Beverage';
    if (s.includes('pet') || s.includes('animal')) return 'Pet Product';
    return 'General Product';
}

function transformMedicineFactsData(product, barcode) {
    const ingredientsText = product.ingredients_text || product.ingredients_text_en || '';
    let ingredients = parseIngredients(ingredientsText);
    ingredients = normalizeIngredients(ingredients);
    const name = product.product_name || product.product_name_en || 'Unknown Medicine';
    return {
        name,
        brand: product.brands || 'Unknown Brand',
        barcode,
        category: 'Medicine / Drug',
        source: 'Open Medicine Facts',
        imageUrl: product.image_url || getFallbackImageUrl(),
        ingredientsText,
        ingredients,
        hazards: analyzeMedicineHazards(ingredients, name),
        allergens: product.allergens_tags || [],
        interactionRisks: checkDrugInteractionRisks(ingredients),
        diyFormulas: [],
        analysisNotes: [
            'Medicine/drug product found in Open Medicine Facts database.',
            `Contains ${ingredients.length} identified ingredients/excipients.`,
            '⚠️ Always consult a healthcare professional before use.',
            'This analysis is for informational purposes only and does not constitute medical advice.'
        ],
        riskAssessment: { overallRisk: 'medium', hasKnownHazards: analyzeMedicineHazards(ingredients, name).length > 0 },
        source_url: `https://world.openmedicinefacts.org/product/${barcode}`,
        isMedicine: true
    };
}

function transformRxNormData(properties, relatedData, barcode, rxcui) {
    const name = properties.name || 'Unknown Drug';
    const synonyms = relatedData?.allRelatedGroup?.conceptGroup
        ?.filter(g => g.tty === 'IN')
        ?.flatMap(g => g.conceptProperties || [])
        ?.map(p => p.name) || [];

    const ingredients = synonyms.slice(0, 10).map(s => ({
        name: s,
        purpose: 'Active Ingredient',
        safety: 70,
        sustainability: 60,
        notes: 'Active pharmaceutical ingredient identified via RxNorm.'
    }));

    return {
        name,
        brand: properties.synonym || name,
        barcode,
        category: 'Medicine / Drug',
        source: 'RxNorm (NIH)',
        imageUrl: getFallbackImageUrl(),
        ingredientsText: synonyms.join(', ') || name,
        ingredients: ingredients.length > 0 ? ingredients : [{ name, purpose: 'Active Ingredient', safety: 70, sustainability: 60, notes: 'Drug identified via RxNorm.' }],
        hazards: [],
        allergens: [],
        interactionRisks: checkDrugInteractionRisks(ingredients),
        diyFormulas: [],
        analysisNotes: [
            `Drug identified via NIH RxNorm database (RXCUI: ${rxcui}).`,
            '⚠️ Always consult a healthcare professional or pharmacist before use.',
            'This analysis is for informational purposes only and does not constitute medical advice.'
        ],
        riskAssessment: { overallRisk: 'medium', hasKnownHazards: false },
        source_url: `https://www.drugs.com/search.php?searchterm=${encodeURIComponent(name)}`,
        isMedicine: true
    };
}

function transformFDADrugData(label, barcode) {
    const name = label.openfda?.brand_name?.[0] || label.openfda?.generic_name?.[0] || 'Unknown Drug';
    const brand = label.openfda?.manufacturer_name?.[0] || 'Unknown';
    const activeIngredientsText = label.active_ingredient?.[0] || '';
    const inactiveIngredientsText = label.inactive_ingredient?.[0] || '';
    const allIngredientsText = [activeIngredientsText, inactiveIngredientsText].filter(Boolean).join(', ');

    const activeIngredients = parseIngredients(activeIngredientsText).map(i => ({ ...i, purpose: 'Active Ingredient', safety: 70 }));
    const inactiveIngredients = parseIngredients(inactiveIngredientsText).map(i => ({ ...i, purpose: 'Inactive Excipient', safety: 85 }));
    const ingredients = [...activeIngredients, ...inactiveIngredients];

    const warnings = label.warnings?.[0] || label.boxed_warning?.[0] || '';
    const dosage = label.dosage_and_administration?.[0] || '';
    const indications = label.indications_and_usage?.[0] || '';

    const notes = [];
    if (indications) notes.push(`Indication: ${indications.substring(0, 200)}...`);
    notes.push('⚠️ Always consult a healthcare professional before use.');
    notes.push('Drug data sourced from FDA Drug Label database (DailyMed).');
    if (warnings) notes.push(`Warning: ${warnings.substring(0, 150)}...`);

    return {
        name,
        brand,
        barcode,
        category: label.openfda?.product_type?.[0] === 'PRESCRIPTION' ? 'Prescription Drug' : 'Medicine / Drug',
        source: 'FDA Drug Labels (DailyMed)',
        imageUrl: getFallbackImageUrl(),
        ingredientsText: allIngredientsText,
        ingredients,
        hazards: warnings ? [{ description: warnings.substring(0, 200), type: 'warning' }] : [],
        allergens: [],
        interactionRisks: checkDrugInteractionRisks(ingredients),
        diyFormulas: [],
        analysisNotes: notes,
        riskAssessment: { overallRisk: label.boxed_warning ? 'high' : 'medium', hasKnownHazards: !!label.boxed_warning },
        source_url: label.openfda?.application_number?.[0] ? `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(name)}` : null,
        isMedicine: true
    };
}

function analyzeMedicineHazards(ingredients, productName) {
    const hazards = [];
    const name = (productName || '').toLowerCase();
    const commonHazards = [
        { pattern: 'opioid', hazard: 'Opioid — high addiction potential, controlled substance', type: 'controlled' },
        { pattern: 'morphine', hazard: 'Opioid analgesic — risk of dependence and respiratory depression', type: 'controlled' },
        { pattern: 'codeine', hazard: 'Opioid — risk of dependence, restricted in many countries', type: 'controlled' },
        { pattern: 'benzodiazepine', hazard: 'Benzodiazepine — risk of dependence and CNS depression', type: 'controlled' },
        { pattern: 'diazepam', hazard: 'Benzodiazepine — controlled substance, dependence risk', type: 'controlled' },
        { pattern: 'warfarin', hazard: 'Anticoagulant — risk of serious bleeding, many drug interactions', type: 'interaction' },
        { pattern: 'nsaid', hazard: 'NSAID — risk of GI bleeding and cardiovascular events', type: 'warning' },
        { pattern: 'aspirin', hazard: 'Salicylate — not for children under 16 (Reye syndrome risk)', type: 'warning' },
        { pattern: 'alcohol', hazard: 'Contains alcohol — avoid with certain medications', type: 'interaction' }
    ];
    for (const { pattern, hazard, type } of commonHazards) {
        if (name.includes(pattern) || ingredients.some(i => (i.name || '').toLowerCase().includes(pattern))) {
            hazards.push({ description: hazard, type });
        }
    }
    return hazards;
}

function checkDrugInteractionRisks(ingredients) {
    const names = ingredients.map(i => (i.name || '').toLowerCase());
    const risks = [];
    if (names.some(n => n.includes('warfarin')) && names.some(n => n.includes('aspirin'))) {
        risks.push('CAUTION: Warfarin + Aspirin — increased bleeding risk');
    }
    if (names.some(n => n.includes('maoi')) && names.some(n => n.includes('ssri'))) {
        risks.push('DANGER: MAOI + SSRI combination — risk of serotonin syndrome');
    }
    return risks;
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

    const category = determineCategory(aiData.category || '');
    const isMedicine = ['Medicine / Drug', 'Prescription Drug', 'Supplement / Vitamin'].includes(category);

    // For medicines, combine active + inactive ingredients
    const allIngredientsText = [aiData.active_ingredients, aiData.ingredients_text].filter(Boolean).join(', ');
    let ingredients = parseIngredients(allIngredientsText || aiData.ingredients_text || '');
    // Tag active ingredients
    if (aiData.active_ingredients) {
        const activeNames = new Set(parseIngredients(aiData.active_ingredients).map(i => i.name.toLowerCase()));
        ingredients = ingredients.map(i => activeNames.has(i.name.toLowerCase()) ? { ...i, purpose: 'Active Ingredient', safety: 70 } : i);
    }
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

    if (isMedicine) {
        analysisNotes.push('⚠️ This is a medicine or drug product. Always consult a healthcare professional before use.');
        analysisNotes.push('This analysis is for informational purposes only and does not constitute medical advice.');
        if (aiData.indications) analysisNotes.push(`Indicated for: ${aiData.indications.substring(0, 200)}`);
        if (aiData.dosage_form) analysisNotes.push(`Dosage form: ${aiData.dosage_form}${aiData.strength ? ' — ' + aiData.strength : ''}`);
        if (aiData.warnings) analysisNotes.push(`Warning: ${aiData.warnings.substring(0, 200)}`);
    } else {
        analysisNotes.push('Always verify details with the physical product packaging.');
    }

    const hazards = isMedicine ? analyzeMedicineHazards(ingredients, aiData.name) : analyzeHazards(ingredients);
    const interactionRisks = isMedicine ? checkDrugInteractionRisks(ingredients) : checkInteractionRisks(ingredients);

    return {
        name: aiData.name || 'Unknown Product',
        brand: aiData.brand || 'Unknown Brand',
        barcode,
        category,
        source: sourceString,
        imageUrl: getFallbackImageUrl(),
        ingredientsText: allIngredientsText || 'Information estimated by AI. Please verify with product packaging.',
        ingredients,
        hazards,
        allergens: [],
        interactionRisks,
        diyFormulas: isMedicine ? [] : generateDIYFormulas(category),
        analysisNotes,
        riskAssessment: {
            overallRisk: isMedicine ? (aiData.is_prescription ? 'high' : 'medium') : calculateRiskScore(ingredients, category, aiData.name),
            hasKnownHazards: hazards.length > 0
        },
        source_url: aiData.source_url_citation || null,
        isMedicine
    };
}

async function lookupPLU(plu, base44) {
    // Known common PLU codes
    const PLU_DB = {
        '4011': { name: 'Banana (Yellow)', brand: 'Fresh Produce', category: 'Fresh Fruit' },
        '4012': { name: 'Plantain', brand: 'Fresh Produce', category: 'Fresh Fruit' },
        '4065': { name: 'Apple (Fuji)', brand: 'Fresh Produce', category: 'Fresh Fruit' },
        '4016': { name: 'Apple (Granny Smith)', brand: 'Fresh Produce', category: 'Fresh Fruit' },
        '4053': { name: 'Apple (Gala)', brand: 'Fresh Produce', category: 'Fresh Fruit' },
        '4020': { name: 'Avocado (Hass)', brand: 'Fresh Produce', category: 'Fresh Fruit' },
        '3045': { name: 'Avocado (Large)', brand: 'Fresh Produce', category: 'Fresh Fruit' },
        '4771': { name: 'Mango', brand: 'Fresh Produce', category: 'Fresh Fruit' },
        '4959': { name: 'Papaya', brand: 'Fresh Produce', category: 'Fresh Fruit' },
        '4060': { name: 'Lemon', brand: 'Fresh Produce', category: 'Fresh Fruit' },
        '4053': { name: 'Lime', brand: 'Fresh Produce', category: 'Fresh Fruit' },
        '4046': { name: 'Orange (Navel)', brand: 'Fresh Produce', category: 'Fresh Fruit' },
        '3107': { name: 'Broccoli', brand: 'Fresh Produce', category: 'Fresh Vegetable' },
        '4548': { name: 'Carrot (Loose)', brand: 'Fresh Produce', category: 'Fresh Vegetable' },
        '3082': { name: 'Potato (Russet)', brand: 'Fresh Produce', category: 'Fresh Vegetable' },
        '4065': { name: 'Tomato (Beefsteak)', brand: 'Fresh Produce', category: 'Fresh Vegetable' },
        '4664': { name: 'Tomato (Cherry)', brand: 'Fresh Produce', category: 'Fresh Vegetable' },
    };

    const known = PLU_DB[plu];
    const productName = known?.name || `PLU ${plu} Produce Item`;
    const category = known?.category || 'Fresh Produce';

    // Use AI to look up unknown PLU codes
    let aiInfo = null;
    if (!known) {
        try {
            aiInfo = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Identify the fresh produce or grocery item with PLU code ${plu}. PLU codes are 4-5 digit codes used on fresh fruits, vegetables, and bulk items in grocery stores. Return the product name, any relevant details, and typical characteristics.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        category: { type: 'string' },
                        description: { type: 'string' },
                        organic: { type: 'boolean' }
                    },
                    required: ['name', 'category']
                }
            });
        } catch {}
    }

    const finalName = aiInfo?.name || productName;
    const finalCategory = aiInfo?.category || category;
    const isOrganic = plu.startsWith('9') || aiInfo?.organic === true;

    return {
        name: finalName,
        brand: 'Fresh Produce',
        barcode: plu,
        category: finalCategory,
        source: known ? 'PLU Database' : 'AI Lookup',
        imageUrl: getFallbackImageUrl(),
        ingredientsText: `${finalName}${isOrganic ? ' (Organic)' : ''}. PLU code: ${plu}. Fresh produce item — no processed ingredients.`,
        ingredients: [
            { name: finalName, purpose: 'Whole food', safety: 98, sustainability: 90, notes: isOrganic ? 'Certified organic' : 'Conventionally grown fresh produce' }
        ],
        hazards: [],
        allergens: [],
        interactionRisks: [],
        diyFormulas: [],
        analysisNotes: [
            `PLU code ${plu} identifies this as: ${finalName}.`,
            isOrganic ? 'PLU starting with 9 indicates organic produce.' : 'Conventionally grown produce.',
            'Fresh produce contains no artificial preservatives or additives.',
            aiInfo?.description || ''
        ].filter(Boolean),
        riskAssessment: { overallRisk: 'low', hasKnownHazards: false },
        source_url: `https://www.ifps.org/plu-codes/`,
        isProduce: true
    };
}

function getFallbackImageUrl() {
    return 'https://d33wubrfki0l68.cloudfront.net/3b4b358e263799301735955a5170395351296d33/53f12/images/placeholders/product-placeholder.svg';
}