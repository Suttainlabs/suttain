import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Narrow, app-specific LLM operations for the consumer/sustainability/carbon
// domain. Accepts a known `operation` enum + structured domain `data` (never a
// raw prompt); the prompt + schema are constructed server-side and run
// service-scoped to protect integration credits. All operations require an
// authenticated user.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { operation, data = {} } = await req.json();
    const call = (params) => base44.asServiceRole.integrations.Core.InvokeLLM(params);

    switch (operation) {
      case 'businessAssessment': {
        const productName = (data.productName || '').toString().slice(0, 200);
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients.filter(i => i && i.trim()).slice(0, 50) : [];
        const manufacturing = (data.manufacturing || '').toString().slice(0, 200);
        const packaging = (data.packaging || '').toString().slice(0, 400);
        const sourcing = (data.sourcing || '').toString().slice(0, 200);
        const prompt = `Perform a business-grade sustainability assessment for this product:

Product Name: ${productName}
Ingredients: ${ingredients.join(', ')}
Manufacturing Method: ${manufacturing || 'Not specified'}
Packaging Materials: ${packaging || 'Not specified'}
Sourcing Origin: ${sourcing || 'Not specified'}

Score using these 5 weighted metrics (0-100):
1. Carbon Footprint (30%) - Based on ingredients, manufacturing, and transport
2. Water Consumption (20%) - Manufacturing and raw material water usage
3. Packaging Sustainability (20%) - Material recyclability and biodegradability
4. Toxicity & Safety (20%) - Ingredient hazard profiles
5. Ethical Sourcing (10%) - Origin, labor practices, transparency

Calculate weighted overall score. Compare to industry average (typically 45-55).

Provide:
- Eco badges earned
- Critical improvement areas flagged
- Specific ingredient/packaging swaps with % score impact
- 3 greener product alternatives
- Industry average comparison`;
        const result = await call({
          prompt,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              product_name: { type: 'string' },
              category: { type: 'string' },
              overall_score: { type: 'number' },
              industry_average: { type: 'number' },
              metrics: {
                type: 'object',
                properties: {
                  carbon_footprint: { type: 'number' },
                  water_consumption: { type: 'number' },
                  packaging_sustainability: { type: 'number' },
                  toxicity_safety: { type: 'number' },
                  ethical_sourcing: { type: 'number' }
                }
              },
              eco_badges: { type: 'array', items: { type: 'string' } },
              score_reasons: { type: 'array', items: { type: 'string' } },
              critical_areas: { type: 'array', items: { type: 'string' } },
              alternatives: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    score: { type: 'number' },
                    reason: { type: 'string' },
                    score_improvement: { type: 'number' },
                    certifications: { type: 'array', items: { type: 'string' } }
                  }
                }
              },
              improvements: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    suggestion: { type: 'string' },
                    impact_percentage: { type: 'number' },
                    category: { type: 'string' }
                  }
                }
              }
            }
          }
        });
        return Response.json(result);
      }

      case 'comparativeImpactAdvice': {
        const formulaName = (data.formulaName || '').toString().slice(0, 200);
        const productType = (data.productType || '').toString().slice(0, 120);
        const metricLabels = data.metricLabels && typeof data.metricLabels === 'object' ? data.metricLabels : {};
        const userScores = data.userScores && typeof data.userScores === 'object' ? data.userScores : {};
        const benchmark = data.benchmark && typeof data.benchmark === 'object' ? data.benchmark : {};
        const weakAreas = Array.isArray(data.weakAreas) ? data.weakAreas.slice(0, 20) : [];
        const lowPerforming = Array.isArray(data.lowPerformingIngredients) ? data.lowPerformingIngredients.slice(0, 50) : [];
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients.slice(0, 100) : [];

        const scoreLines = Object.keys(metricLabels).map(k => `- ${metricLabels[k]}: ${userScores[k] ?? 'N/A'}/100 (industry avg: ${benchmark[k] ?? 'N/A'})`).join('\n');
        const ingredientLines = ingredients.map(i => `${i.chemical_name || i.name} (${i.percentage}%)`).join(', ');

        const prompt = `You are a sustainability expert. A user has a formula named "${formulaName}" (type: ${productType}) with these eco-scores vs industry averages:

${scoreLines}

Weak areas below industry average: ${weakAreas.join(', ') || 'None — performing above average!'}

Low-performing ingredients identified: ${lowPerforming.join(', ') || 'None flagged'}

Ingredients in formula: ${ingredientLines}

Provide 4-6 concise, specific, actionable recommendations to improve this formula's eco-score. Focus on:
1. Swapping flagged ingredients for greener alternatives
2. Addressing the weakest scoring areas
3. Certifications they could pursue
Keep each recommendation to 1-2 sentences.`;
        const result = await call({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              overall_summary: { type: 'string' },
              recommendations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    detail: { type: 'string' },
                    impact: { type: 'string', enum: ['high', 'medium', 'low'] },
                    category: { type: 'string' }
                  }
                }
              },
              certifications: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        return Response.json(result);
      }

      case 'formulaIngredientScore': {
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients.filter(i => i && i.name && i.name.trim()).slice(0, 100) : [];
        const ingredientList = ingredients.map(i => `${i.name.trim()}${i.percentage ? ` (${i.percentage}%)` : ''}`).join(', ');
        const prompt = `You are an environmental chemist. Analyze the sustainability and eco-impact of these formula ingredients: ${ingredientList}.

For each ingredient, provide:
- eco_score (0-100, higher = greener)
- biodegradability (0-100)
- aquatic_safety (0-100)
- renewable_sourcing (0-100)
- summary (one sentence)
- concerns (array of 1-3 strings about environmental issues)
- greener_alternative (string or null if already green)

Also provide:
- overall_score (0-100, weighted average)
- overall_summary (2-3 sentences about the formula's eco-profile)
- top_recommendation (single most impactful change to improve sustainability)
- certifications_possible (array of certifications this formula could achieve, e.g. "ECOCERT", "COSMOS")

Return JSON only.`;
        const result = await call({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              overall_score: { type: 'number' },
              overall_summary: { type: 'string' },
              top_recommendation: { type: 'string' },
              certifications_possible: { type: 'array', items: { type: 'string' } },
              ingredients: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    eco_score: { type: 'number' },
                    biodegradability: { type: 'number' },
                    aquatic_safety: { type: 'number' },
                    renewable_sourcing: { type: 'number' },
                    summary: { type: 'string' },
                    concerns: { type: 'array', items: { type: 'string' } },
                    greener_alternative: { type: 'string' }
                  }
                }
              }
            }
          }
        });
        return Response.json(result);
      }

      case 'productLookup': {
        const query = (data.query || '').toString().slice(0, 200);
        const category = (data.category || 'all').toString().slice(0, 50);
        const prompt = `Analyze the sustainability of this product: "${query}" (category: ${category}).

Provide a detailed sustainability assessment using these 5 weighted metrics (scores 0-100):
1. Carbon Footprint (30%) - GHG emissions across lifecycle
2. Water Consumption (20%) - Water usage in sourcing and manufacturing
3. Packaging Sustainability (20%) - Recyclability, biodegradability, materials
4. Toxicity & Safety (20%) - Ingredient safety for humans and ecosystems
5. Ethical Sourcing (10%) - Fair trade, supply chain transparency

Calculate the overall score as a weighted average.

Also provide:
- Eco badges earned (from: "Low Carbon", "Plastic-Free", "Zero Toxins", "Water Efficient", "Ethically Sourced", "Biodegradable")
- Key reasons explaining the score
- 3 greener alternative products with their scores, why they're better, score improvement, and any certifications
- Specific improvement suggestions with percentage impact on score`;
        const result = await call({
          prompt,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              product_name: { type: 'string' },
              category: { type: 'string' },
              overall_score: { type: 'number' },
              metrics: {
                type: 'object',
                properties: {
                  carbon_footprint: { type: 'number' },
                  water_consumption: { type: 'number' },
                  packaging_sustainability: { type: 'number' },
                  toxicity_safety: { type: 'number' },
                  ethical_sourcing: { type: 'number' }
                }
              },
              eco_badges: { type: 'array', items: { type: 'string' } },
              score_reasons: { type: 'array', items: { type: 'string' } },
              alternatives: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    score: { type: 'number' },
                    reason: { type: 'string' },
                    score_improvement: { type: 'number' },
                    certifications: { type: 'array', items: { type: 'string' } }
                  }
                }
              },
              improvements: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    suggestion: { type: 'string' },
                    impact_percentage: { type: 'number' },
                    category: { type: 'string' }
                  }
                }
              }
            }
          }
        });
        return Response.json(result);
      }

      case 'carbonIntensityEstimate': {
        const ingredientName = (data.ingredientName || '').toString().slice(0, 200);
        const prompt = `Estimate the carbon intensity (kg CO2e per kg of ingredient) for "${ingredientName}" used in cosmetic/cleaning product formulation. Consider production, transport, and processing. Provide a realistic single number based on life cycle assessment data.`;
        const result = await call({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              carbon_intensity: { type: 'number' },
              category: { type: 'string' },
              confidence: { type: 'string' }
            }
          }
        });
        return Response.json(result);
      }

      case 'carbonTaxSimulation': {
        const unitsPerMonth = Number(data.unitsPerMonth) || 0;
        const totalCO2e = Number(data.totalCO2e) || 0;
        const annualCO2e = Number(data.annualCO2e) || 0;
        const ingredientList = (data.ingredientList || '').toString().slice(0, 2000);
        const selectedMarkets = Array.isArray(data.selectedMarkets) ? data.selectedMarkets.slice(0, 10) : [];
        const carbonPrice = Number(data.carbonPrice) || 0;
        const prompt = `Carbon tax exposure analysis for a product manufacturer.
Monthly production: ${unitsPerMonth} units. Batch CO2e: ${totalCO2e.toFixed(1)} kg. Annual CO2e: ${(annualCO2e / 1000).toFixed(1)} tonnes.
Ingredients: ${ingredientList}.
Target markets: ${selectedMarkets.join(', ')}.
Carbon price assumption: $${carbonPrice}/tonne.

For each selected market, provide 3 annual cost scenarios (low/base/high carbon price) and CBAM exposure if EU is selected.`;
        const result = await call({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              results: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    market: { type: 'string' },
                    low: { type: 'number' },
                    base: { type: 'number' },
                    high: { type: 'number' },
                    currency: { type: 'string' },
                    cbam_exposure: { type: 'number' },
                    note: { type: 'string' }
                  }
                }
              },
              total_low: { type: 'number' },
              total_base: { type: 'number' },
              total_high: { type: 'number' }
            }
          }
        });
        return Response.json(result);
      }

      case 'carbonAlternatives': {
        const unitsPerMonth = Number(data.unitsPerMonth) || 0;
        const highCarbon = Array.isArray(data.highCarbonIngredients) ? data.highCarbonIngredients.slice(0, 10) : [];
        const ingredientLines = highCarbon.map(i => `- ${i.name}: ${i.carbon_intensity} kg CO2e/kg, quantity ${i.quantity_kg}kg`).join('\n');
        const prompt = `You are a green chemistry expert. Suggest greener ingredient alternatives that improve eco-score and carbon footprint.

Current high-impact ingredients:
${ingredientLines}

For each, suggest the best greener alternative with:
- Specific alternative ingredient name
- Reason (why greener, what it replaces)
- Carbon reduction percentage
- Estimated annual cost saving at ${unitsPerMonth} units/month production
- Eco score gain (1-10 scale)
- Implementation difficulty (Easy/Medium/Hard)
- Any compliance or performance tradeoffs

Prioritise by ROI. Return top 5 alternatives.`;
        const result = await call({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              alternatives: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    replace_ingredient: { type: 'string' },
                    alternative_ingredient: { type: 'string' },
                    reason: { type: 'string' },
                    carbon_reduction_pct: { type: 'number' },
                    cost_saving_1yr: { type: 'number' },
                    cost_saving_5yr: { type: 'number' },
                    eco_score_gain: { type: 'number' },
                    difficulty: { type: 'string' },
                    tradeoffs: { type: 'string' }
                  }
                }
              },
              total_potential_reduction_pct: { type: 'number' },
              summary: { type: 'string' }
            }
          }
        });
        return Response.json(result);
      }

      case 'contentToolkit': {
        const productName = (data.productName || '').toString().slice(0, 200);
        const ingredients = (data.ingredients || '').toString().slice(0, 1000);
        const targetAudience = (data.targetAudience || '').toString().slice(0, 200);
        const tone = (data.tone || '').toString().slice(0, 100);
        const safetySummary = (data.safetySummary || '').toString().slice(0, 2000);
        const prompt = `You are a marketing copywriter for a sustainable, safety-focused product brand.
Product: ${productName}
Key Ingredients: ${ingredients}
Target Audience: ${targetAudience}
Desired Tone: ${tone}

Safety Context (from ingredient analysis):
${safetySummary}

Generate 4 pieces of marketing content, each emphasizing ingredient safety, transparency, and sustainability:
1. SEO-optimized product description (150-200 words, include relevant keywords)
2. Instagram caption (engaging, with hashtags, 100-150 words)
3. Blog post outline about the product's safety profile (5-7 section headings with brief descriptions)
4. Email newsletter draft (subject line + 200-250 word body, focused on transparency and safety)`;
        const result = await call({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              seo_description: { type: 'string' },
              instagram_caption: { type: 'string' },
              blog_outline: { type: 'string' },
              email_draft: { type: 'string' }
            }
          }
        });
        return Response.json(result);
      }

      case 'claraChat': {
        const conversationHistory = (data.conversationHistory || '').slice(0, 16000);
        const userMessage = (data.userMessage || '').slice(0, 2000);
        const language = (data.language || 'en').toString().slice(0, 10);
        const languageNames = { en: 'English', hi: 'Hindi', sw: 'Swahili', es: 'Spanish' };
        const languageInstruction = `IMPORTANT: You MUST respond in ${languageNames[language] || 'English'}. Always preserve scientific names, chemical formulas, CAS numbers, SMILES strings, InChI keys, units, and numeric values in their original form. Only translate natural language prose, descriptions, warnings, and recommendations.`;
        let updatesContext = 'No recent updates available.';
        try {
          const updates = await base44.asServiceRole.entities.PlatformUpdate.list('-created_date', 10);
          const published = (updates || []).filter(u => u.is_published !== false);
          if (published.length > 0) {
            updatesContext = published.map(u => `- ${u.title}: ${u.description}${u.url ? ` (Link: ${u.url})` : ''}`).join('\n');
          }
        } catch {}
        const SYSTEM_PROMPT = `You are Clara — the expert virtual assistant and core intelligence layer of Suttain (suttain.com), an AI-native platform for chemical safety, sustainable formulation, molecular intelligence, and climate compliance.

RESPONSE FORMATTING RULES:
- Use PLAIN TEXT ONLY — NO markdown, NO asterisks (**), NO special formatting symbols
- Keep responses SHORT and CONCISE (3-5 sentences unless a list is genuinely needed)
- Use simple bullet points with dashes (-) if listing items
- Speak like a trusted expert, never like software. Translate every technical output into plain language.
- A score is not just a number — it is a verdict with a reason and a recommendation.
- A compliance flag is not just a warning — it is a specific action with a deadline and a fix.
- If you don't know something specific, say "For more details, please email contact@suttain.com"
- NEVER use emojis in any response

SPECIAL ACTIONS:
- If the user wants to CANCEL their subscription, respond with exactly: ACTION:CANCEL_SUBSCRIPTION
- If the user wants to UPGRADE or SUBSCRIBE, respond with exactly: ACTION:UPGRADE_SUBSCRIPTION

EXECUTIVE ASSISTANT BEHAVIOR:
- Analyze the user's intent before responding. If a request is vague, ask one clarifying question. If a request is complex, break it down into steps.
- Provide concise, high-value responses that solve the user's problem rather than just listing information.
- Think step by step internally, then deliver only the final, polished answer.
- Remember context within the session. Every ingredient mentioned, every formula discussed, every market selected — carry it forward.
- Personalize outputs by referencing their target markets, allergen or health flags, product type, production volume, and sustainability goals.

OPERATING LOGIC:
1. IDENTIFY INTENT: Safety → Chemical Simulator; Formulation → Formula Generator; Compliance → AI Compliance Co-Pilot; Carbon → Carbon Tax Simulator; Sourcing → Sustainable Chemistry Marketplace; Ingredient → Ingredient Database; Research → Computational Simulation, Molecule Analysis, Structural Biology; Platform updates → Use LATEST PLATFORM UPDATES from context.
2. NEVER give a standalone answer. Every answer must connect to a tool output or direct the user to run something on the platform.
3. CHAIN THE TOOLS automatically in your response.
4. SURFACE THE NEXT ACTION always. After every answer, suggest the next step within the platform.

SUTTAIN TOOLS: Chemical Simulator, Formula Generator, SuttainScan/Barcode Scanner, Ingredient Database (130M+ chemicals), Formula Simulation Engine, Computational Simulations (DFT, MD, ORCA, GROMACS), AI Compliance Co-Pilot (50+ regulations), Carbon Tax Simulator, Carbon Opportunity Simulator, Comparative Impact Report, Personalized Safety Alerts, Sustainability Scoring, Sustainable Chemistry Marketplace, DWSIM Integration, Molecule Analysis, Structural Biology, SDS Analyzer, Enterprise API.

PRICING: FREE (3 sims/mo, 5 formulas/mo, unlimited scans), STARTER ($4.99/mo), PRO ($49.99/mo — unlimited everything), ACADEMIC ($199/mo), LIFETIME ($999 one-time), PRO LIFETIME ($99.99 one-time), ENTERPRISE (custom).

SCOPE RULES:
- Answer ALL questions about Suttain
- For billing issues → "Please email contact@suttain.com"
- For off-topic questions → redirect warmly back to the platform
- NEVER make up features, prices, or policies not listed above`;
        const prompt = `${SYSTEM_PROMPT}\n\n${languageInstruction}\n\n=== LATEST PLATFORM UPDATES (real-time from PlatformUpdate entity) ===\n${updatesContext}\n\n=== END PLATFORM UPDATES ===\n\nCurrent conversation:\n${conversationHistory}\n\nUser's latest question: ${userMessage}\n\nProvide a helpful, CONCISE response in PLAIN TEXT focused on the Suttain platform. Respond in ${languageNames[language] || 'English'}:`;
        const result = await call({ prompt, add_context_from_internet: false, model: 'gpt_5_mini' });
        return Response.json(typeof result === 'string' ? result : (result?.text || String(result)));
      }

      case 'formulaOptions': {
        const productName = (data.productTypeName || '').toString().slice(0, 200);
        const description = (data.description || '').toString().slice(0, 2000);
        const isBusiness = !!data.businessMode;
        let prompt;
        if (isBusiness) {
          prompt = `You are a senior cosmetic formulation chemist with 20+ years experience in commercial product development.

PRODUCT REQUEST: "${productName}" - "${description}"

MODE: COMMERCIAL/BUSINESS FORMULATION
This formula will be manufactured at scale and sold commercially. All requirements must meet industry standards.

Create 3 DISTINCT commercial-grade formula variants:
1. MARKET LEADER (Premium positioning) - High-performance actives, premium textures, high-end retail ($30-80)
2. MASS MARKET (Volume production) - Cost-optimized, proven stable formulations, drugstore/supermarket ($8-20)
3. CLEAN/SUSTAINABLE (Eco-certification ready) - COSMOS/ECOCERT compliant, biodegradable, palm-free or sustainable palm

FOR EACH VARIANT PROVIDE:
- Product name (market-ready brand name)
- Positioning statement (1 sentence)
- Key marketing claims (3 substantiated claims)
- COMPLETE ingredient list using INCI NOMENCLATURE with exact percentages (must total 100%), function of each ingredient, industrial-grade preservative system, pH adjusters, chelating agents
- Cost level: low/medium/high (with estimated cost per kg)
- Difficulty: intermediate/advanced/professional
- Regulatory notes: Any restrictions in EU/US/Asia markets

Use proper INCI names. Include CAS numbers for key actives.`;
        } else {
          prompt = `You are a friendly DIY cosmetics teacher helping a beginner make their first homemade product.

PRODUCT REQUEST: "${productName}" - "${description}"

MODE: HOME/DIY FORMULATION
This is for personal use, made in a home kitchen with easily available ingredients.

Create 3 SIMPLE, BEGINNER-FRIENDLY formula variants:
1. SUPER EASY (First-timer friendly) - Max 5-6 ingredients, no heating if possible, grocery store ingredients, ready in under 15 minutes
2. NATURAL & GENTLE - Natural recognizable ingredients, plant-based, essential oil scented, good for sensitive skin
3. BUDGET SAVER - Most affordable, uses pantry staples, best value, bulk-buy friendly

FOR EACH VARIANT PROVIDE:
- Fun, descriptive name (like "Kitchen Spa Cream")
- Simple description (1 sentence, no jargon)
- Benefits in plain English (3 points)
- SIMPLE ingredient list with common names, percentages that total 100%, where to buy each ingredient
- Cost level: low/medium/high
- Difficulty: beginner/intermediate
- Simple tips for making it at home`;
        }
        prompt += `\n\nReturn as JSON with this exact structure:\n{\n"formulas": [\n{\n  "variant": "string",\n  "name": "string",\n  "description": "string",\n  "benefits": ["string", "string", "string"],\n  "ingredients": [{"chemical_name": "string", "percentage": number, "purpose": "string"}],\n  "cost_level": "low|medium|high",\n  "difficulty": "beginner|intermediate|advanced|professional"\n}\n]\n}`;
        const result = await call({
          prompt, add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              formulas: { type: 'array', items: {
                type: 'object',
                properties: {
                  variant: { type: 'string' }, name: { type: 'string' },
                  description: { type: 'string' }, benefits: { type: 'array', items: { type: 'string' } },
                  ingredients: { type: 'array', items: { type: 'object', properties: { chemical_name: { type: 'string' }, percentage: { type: 'number' }, purpose: { type: 'string' } } } },
                  cost_level: { type: 'string' }, difficulty: { type: 'string' }
                }
              } }
            },
            required: ['formulas']
          }
        });
        return Response.json(result);
      }

      case 'formulaRecipe': {
        const variant = (data.variant || '').toString().slice(0, 100);
        const description = (data.description || '').toString().slice(0, 2000);
        const isBusiness = !!data.businessMode;
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients.slice(0, 50) : [];
        const ingredientLines = ingredients.map(ing => `- ${ing.chemical_name}: ${ing.percentage}% (${ing.purpose})`).join('\n');
        let prompt;
        if (isBusiness) {
          prompt = `You are a senior cosmetic formulation chemist. Expand this ${variant} commercial formula for "${description}" into complete manufacturing documentation.

Ingredients (already defined):
${ingredientLines}

Provide PROFESSIONAL MANUFACTURING DOCUMENTATION:
1. MANUFACTURING INSTRUCTIONS (organized by phases A/B/C/D with temperatures, order of addition, mixing speeds)
2. PRODUCT SPECIFICATIONS (Target pH range, viscosity, specific gravity, appearance, odor, stability)
3. QUALITY CONTROL (In-process checks, final product testing, microbiological limits)
4. SAFETY & COMPLIANCE (GHS hazard statements, required PPE, MSDS considerations, regulatory notes)
5. SUSTAINABILITY METRICS (Biodegradability, carbon footprint, sustainability score 0-100)

Return as JSON.`;
        } else {
          prompt = `You are a friendly DIY teacher. Expand this ${variant} homemade recipe for "${description}" into easy-to-follow instructions.

Ingredients (already defined):
${ingredientLines}

Provide BEGINNER-FRIENDLY INSTRUCTIONS:
1. SIMPLE STEP-BY-STEP INSTRUCTIONS (plain language, kitchen equipment, timing estimates)
2. WHAT TO EXPECT (appearance, pH, shelf life, time to make, texture)
3. SAFETY TIPS (simple precautions, storage, when to discard)
4. TROUBLESHOOTING (common problems and fixes)
5. ECO-FRIENDLINESS (sustainability score 0-100, disposal tips)

Return as JSON.`;
        }
        prompt += `\n\nUse this JSON structure:\n{\n"instructions": [{"phase": "Phase Name", "steps": ["step 1", "step 2"]}],\n"properties": {"ph_level": "string", "shelf_life": "string", "difficulty": "string", "time_to_make": "string"},\n"safety_precautions": ["string"],\n"sustainability_score": number\n}`;
        const result = await call({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              instructions: { type: 'array', items: { type: 'object', properties: { phase: { type: 'string' }, steps: { type: 'array', items: { type: 'string' } } } } },
              properties: { type: 'object', properties: { ph_level: { type: 'string' }, shelf_life: { type: 'string' }, difficulty: { type: 'string' }, time_to_make: { type: 'string' } } },
              safety_precautions: { type: 'array', items: { type: 'string' } },
              sustainability_score: { type: 'number' }
            }
          }
        });
        return Response.json(result);
      }

      case 'productCompliance': {
        const productName = (data.productName || '').toString().slice(0, 200);
        const category = (data.category || '').toString().slice(0, 100);
        const ingredients = (data.ingredients || '').toString().slice(0, 4000);
        const result = await call({
          prompt: `You are a regulatory compliance expert. Analyze these product ingredients for global regulatory compliance:\n\nProduct: ${productName}\nCategory: ${category}\nIngredients: ${ingredients}\n\nCheck compliance for EU, US FDA, and Canada regulations. Flag any restricted or banned substances.`,
          response_json_schema: {
            type: 'object',
            properties: {
              overall_status: { type: 'string', enum: ['Compliant', 'Issues Found', 'Requires Review'] },
              summary: { type: 'string' },
              flagged_ingredients: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, region: { type: 'string' }, issue: { type: 'string' }, severity: { type: 'string', enum: ['low', 'medium', 'high'] } } } },
              recommendations: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        return Response.json(result);
      }

      case 'productHealth': {
        const productName = (data.productName || '').toString().slice(0, 200);
        const brand = (data.brand || '').toString().slice(0, 200);
        const category = (data.category || '').toString().slice(0, 100);
        const ingredients = (data.ingredients || '').toString().slice(0, 4000);
        const nutritionText = (data.nutritionFacts || 'not available').toString().slice(0, 2000);
        const result = await call({
          prompt: `You are a certified nutritionist. Analyze this product for health and dietary insights:\n\nProduct: ${productName}\nBrand: ${brand}\nCategory: ${category}\nIngredients: ${ingredients}\nNutritional Info: ${nutritionText}\n\nProvide a comprehensive health analysis.`,
          response_json_schema: {
            type: 'object',
            properties: {
              health_summary: { type: 'string' },
              overall_health_rating: { type: 'string', enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
              dietary_suitability: { type: 'array', items: { type: 'object', properties: { diet: { type: 'string' }, suitable: { type: 'boolean' }, reason: { type: 'string' } } } },
              health_warnings: { type: 'array', items: { type: 'object', properties: { warning: { type: 'string' }, severity: { type: 'string', enum: ['low', 'medium', 'high'] }, affected_groups: { type: 'string' } } } },
              nutritional_highlights: { type: 'array', items: { type: 'string' } },
              healthier_alternatives: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, benefit: { type: 'string' } } } },
              consumption_tips: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        return Response.json(result);
      }

      case 'productSustainability': {
        const productName = (data.productName || '').toString().slice(0, 200);
        const category = (data.category || '').toString().slice(0, 100);
        const ingredients = (data.ingredients || '').toString().slice(0, 4000);
        const result = await call({
          prompt: `You are an environmental sustainability expert. Analyze the eco-impact of these product ingredients:\n\nProduct: ${productName}\nCategory: ${category}\nIngredients: ${ingredients}\n\nAssess biodegradability, bioaccumulation, carbon footprint, and overall sustainability.`,
          response_json_schema: {
            type: 'object',
            properties: {
              overall_score: { type: 'number' },
              grade: { type: 'string', enum: ['A', 'B', 'C', 'D', 'F'] },
              biodegradability: { type: 'string' },
              carbon_footprint: { type: 'string' },
              summary: { type: 'string' },
              eco_concerns: { type: 'array', items: { type: 'string' } },
              green_positives: { type: 'array', items: { type: 'string' } },
              improvement_tips: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        return Response.json(result);
      }

      case 'findSimilarProducts': {
        const productName = (data.productName || '').toString().slice(0, 200);
        const category = (data.category || '').toString().slice(0, 100);
        const brand = (data.brand || '').toString().slice(0, 200);
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients.slice(0, 5).join(', ') : '';
        const result = await call({
          prompt: `Find 3 real alternative products that serve the EXACT same purpose as "${productName}" (${category} by ${brand}). Prefer more natural, eco-friendly options. Key ingredients: ${ingredients || 'N/A'}.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              similar_products: { type: 'array', items: {
                type: 'object',
                properties: { product_name: { type: 'string' }, brand: { type: 'string' }, main_category: { type: 'string' }, key_attributes: { type: 'string' }, brief_description: { type: 'string' }, url: { type: 'string', nullable: true } }
              } }
            }
          }
        });
        return Response.json(result);
      }

      case 'ingredientSearch': {
        const query = (data.query || '').toString().slice(0, 200);
        const result = await call({
          prompt: `List 6 real chemical/ingredient names that match "${query}" for cosmetic/cleaning formulas. Return JSON: {"results": ["name1","name2",...]}`,
          response_json_schema: { type: 'object', properties: { results: { type: 'array', items: { type: 'string' } } } }
        });
        return Response.json(result);
      }

      case 'extractIngredientsFromImage': {
        const fileUrl = (data.fileUrl || '').toString().slice(0, 500);
        if (!fileUrl) return Response.json({ error: 'fileUrl required' }, { status: 400 });
        const result = await call({
          prompt: 'Extract the full ingredient list from this product label or SDS document. Return JSON with ingredient names.',
          file_urls: [fileUrl],
          response_json_schema: { type: 'object', properties: { ingredients: { type: 'array', items: { type: 'string' } } } }
        });
        return Response.json(result);
      }

      case 'formulaAnalysis': {
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients : [];
        const ingredientList = ingredients.map(i => `${i.name}${i.concentration ? ` ${i.concentration}%` : ''}`).join(', ');
        const result = await call({
          prompt: `Analyse this formula for safety, compliance (REACH, FDA, GHS), sustainability, and carbon footprint. Ingredients: ${ingredientList}.\nReturn scores 0-100 and brief explanations. Also list any flagged ingredients with severity.`,
          response_json_schema: {
            type: 'object',
            properties: {
              safety_score: { type: 'number' },
              compliance_score: { type: 'number' },
              sustainability_score: { type: 'number' },
              carbon_score: { type: 'number' },
              safety_summary: { type: 'string' },
              flagged_ingredients: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, severity: { type: 'string' }, reason: { type: 'string' }, regulation: { type: 'string' } } } }
            }
          }
        });
        return Response.json(result);
      }

      case 'extractFileData': {
        const fileUrl = (data.fileUrl || '').toString().slice(0, 500);
        if (!fileUrl) return Response.json({ error: 'fileUrl required' }, { status: 400 });
        const result = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
          file_url: fileUrl,
          json_schema: {
            type: 'object',
            properties: {
              product_name: { type: 'string' },
              ingredients: { type: 'array', items: { type: 'string' } },
              hazard_information: { type: 'string' },
              regulatory_info: { type: 'string' },
              cas_numbers: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        return Response.json(result);
      }

      case 'complianceAnalysis': {
        const ingredients = (data.ingredients || '').toString().slice(0, 4000);
        const documentContext = (data.documentContext || '').toString().slice(0, 8000);
        const result = await call({
          prompt: `You are a regulatory compliance expert. Analyze these ingredients for compliance:\n\nIngredients: ${ingredients}\n\nDocument context:\n${documentContext}\n\nCheck EU, US FDA, Canada, and REACH regulations. Flag restricted/banned substances and provide remediation steps.`,
          response_json_schema: {
            type: 'object',
            properties: {
              overall_status: { type: 'string' },
              summary: { type: 'string' },
              flagged_ingredients: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, region: { type: 'string' }, issue: { type: 'string' }, severity: { type: 'string' } } } },
              recommendations: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        return Response.json(result);
      }

      case 'aiSuggestions': {
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients.slice(0, 50) : [];
        const ingredientDetails = ingredients.map(i => `${i.chemical_name} (${i.percentage}%, ${i.purpose || 'general'})`).join(', ');
        const productType = (data.productType || 'product').toString().slice(0, 100);
        const businessMode = !!data.businessMode;
        const result = await call({
          prompt: `You are an expert cosmetic/product chemist. Analyze this ${productType} formula and provide intelligent suggestions.\n\nCurrent Ingredients: ${ingredientDetails}\nProduct Type: ${productType}\nContext: ${businessMode ? 'Commercial/B2B production' : 'DIY/Home formulation'}\n\nProvide comprehensive suggestions in JSON format:\n1. complementary_ingredients: 3-5 ingredients that would enhance this formula (name, purpose, suggested_percentage, why_add, safety_notes)\n2. potential_formulations: 2-3 complete formula variations based on current ingredients (name, description, key_changes, benefits)\n3. safety_considerations: Important safety notes for current ingredient combinations\n4. improvement_tips: 3-4 specific tips to improve safety, efficacy, or cost-effectiveness\n5. synergy_notes: How current ingredients work together and any potential issues`,
          response_json_schema: {
            type: 'object',
            properties: {
              complementary_ingredients: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, purpose: { type: 'string' }, suggested_percentage: { type: 'number' }, why_add: { type: 'string' }, safety_notes: { type: 'string' } } } },
              potential_formulations: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, key_changes: { type: 'array', items: { type: 'string' } }, benefits: { type: 'array', items: { type: 'string' } } } } },
              safety_considerations: { type: 'array', items: { type: 'string' } },
              improvement_tips: { type: 'array', items: { type: 'string' } },
              synergy_notes: { type: 'string' }
            }
          }
        });
        return Response.json(result);
      }

      case 'batchCompliance': {
        const ingredientList = (data.ingredientList || '').toString().slice(0, 4000);
        const productType = (data.productType || 'cosmetic').toString().slice(0, 100);
        const result = await call({
          prompt: `You are a regulatory compliance expert. Analyze this ${productType} formula for global regulatory compliance.\n\nIngredients: ${ingredientList}\n\nCheck compliance for US (FDA), EU (Cosmetics Regulation + REACH), and UK (UK Cosmetics Regulation). Flag restricted/banned substances, concentration limits, and allergen declarations.\n\nReturn JSON with: overall_risk, risk_summary, regional_compliance (array with region, status, details, labeling_requirements), restricted_ingredients, concentration_limits, allergen_declarations, labeling_requirements.`,
          response_json_schema: {
            type: 'object',
            properties: {
              overall_risk: { type: 'string' },
              risk_summary: { type: 'string' },
              regional_compliance: { type: 'array', items: { type: 'object', properties: { region: { type: 'string' }, status: { type: 'string' }, details: { type: 'string' }, labeling_requirements: { type: 'array', items: { type: 'string' } } } } },
              restricted_ingredients: { type: 'array', items: { type: 'object', properties: { ingredient: { type: 'string' }, reason: { type: 'string' }, region: { type: 'string' } } } },
              concentration_limits: { type: 'array', items: { type: 'object', properties: { ingredient: { type: 'string' }, limit: { type: 'string' }, current: { type: 'string' }, status: { type: 'string' } } } },
              allergen_declarations: { type: 'array', items: { type: 'string' } },
              labeling_requirements: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        return Response.json(result);
      }

      case 'ingredientCost': {
        const ingredientName = (data.ingredientName || '').toString().slice(0, 200);
        const result = await call({
          prompt: `Estimate the current wholesale purchase price for the cosmetic ingredient "${ingredientName}". Search for prices from major cosmetics ingredient suppliers like MakingCosmetics, lotioncrafter, or similar. Return the price per 100 grams in USD. If you cannot find an exact price, provide a reasonable industry estimate.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              price_per_100g: { type: 'number' },
              supplier: { type: 'string' },
              confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
              notes: { type: 'string' }
            }
          }
        });
        return Response.json(result);
      }

      case 'formulaInsights': {
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients.slice(0, 50) : [];
        const ingredientList = ingredients.map(i => `${i.chemical_name} (${i.percentage}%)`).join(', ');
        const productType = (data.productType || 'cosmetic').toString().slice(0, 100);
        const businessMode = !!data.businessMode;
        const result = await call({
          prompt: `Analyze this ${productType} formula and provide comprehensive insights for a ${businessMode ? 'commercial B2B' : 'DIY home formulation'} context:\n\nIngredients: ${ingredientList}\n\nPlease analyze and return JSON with:\n1. properties: { ph_level, viscosity, stability }\n2. warnings: array of critical safety issues, incompatibilities, or missing essential components\n3. suggestions: array of 3-4 actionable improvement recommendations\n4. efficacy_score: number 1-10\n5. safety_score: number 1-10\n\nFocus on practical, formula-specific feedback. Consider ingredient interactions, concentration safety limits, and ${businessMode ? 'regulatory compliance' : 'ease of sourcing ingredients'}.`,
          response_json_schema: {
            type: 'object',
            properties: {
              properties: { type: 'object', properties: { ph_level: { type: 'string' }, viscosity: { type: 'string' }, stability: { type: 'string' } } },
              warnings: { type: 'array', items: { type: 'string' } },
              suggestions: { type: 'array', items: { type: 'string' } },
              efficacy_score: { type: 'number' },
              safety_score: { type: 'number' }
            },
            required: ['properties', 'warnings', 'suggestions']
          }
        });
        return Response.json(result);
      }

      case 'hazardAlternatives': {
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients.slice(0, 50) : [];
        const ingredientList = ingredients.map(i => `${i.chemical_name} (${i.percentage}%)`).join(', ');
        const result = await call({
          prompt: `Analyze these cosmetic/cleaning product ingredients for potential hazards and suggest safer alternatives:\n\nIngredients: ${ingredientList}\n\nFor each ingredient, assess:\n1. Hazard level (safe, low_concern, moderate_concern, high_concern)\n2. Specific hazard types (skin irritant, allergen, endocrine disruptor, environmental toxin, carcinogen concern, etc.)\n3. Regulatory status (any bans or restrictions globally)\n4. If hazardous or concerning, provide 2-3 safer alternatives with: name, why it's safer, effectiveness compared to original (percentage), any tradeoffs\n\nFocus on scientifically documented concerns, not speculation.`,
          response_json_schema: {
            type: 'object',
            properties: {
              flagged_count: { type: 'number' },
              overall_safety: { type: 'string' },
              ingredients: { type: 'array', items: { type: 'object', properties: {
                name: { type: 'string' }, hazard_level: { type: 'string' }, hazard_types: { type: 'array', items: { type: 'string' } },
                regulatory_notes: { type: 'string' },
                alternatives: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, reason: { type: 'string' }, effectiveness: { type: 'number' }, tradeoffs: { type: 'string' } } } }
              } } }
            }
          }
        });
        return Response.json(result);
      }

      case 'ingredientInteractions': {
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients.slice(0, 50) : [];
        const ingredientList = ingredients.map(i => `${i.chemical_name} (${i.percentage}%)`).join(', ');
        const productType = (data.productType || 'cosmetic').toString().slice(0, 100);
        const result = await call({
          prompt: `Analyze potential chemical interactions and incompatibilities between these ingredients in a ${productType} formula:\n\nIngredients: ${ingredientList}\n\nFor each potential interaction, provide:\n1. Which ingredients are involved\n2. Type of interaction (beneficial, neutral, problematic, or dangerous)\n3. Detailed explanation\n4. Severity level (1-5)\n5. Recommended action if problematic\n\nAlso provide an overall compatibility score (0-100). Focus on pH incompatibilities, oxidation reactions, ingredient deactivation, precipitation, skin sensitization, efficacy interference.`,
          response_json_schema: {
            type: 'object',
            properties: {
              overall_score: { type: 'number' },
              overall_assessment: { type: 'string' },
              interactions: { type: 'array', items: { type: 'object', properties: {
                ingredients_involved: { type: 'array', items: { type: 'string' } }, interaction_type: { type: 'string' },
                severity: { type: 'number' }, explanation: { type: 'string' }, recommendation: { type: 'string' }
              } } },
              warnings: { type: 'array', items: { type: 'string' } },
              positive_synergies: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        return Response.json(result);
      }

      case 'ingredientSustainabilityScore': {
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients.slice(0, 50) : [];
        const ingredientList = ingredients.map(i => i.chemical_name).join(', ');
        const result = await call({
          prompt: `Analyze the sustainability of these cosmetic/cleaning product ingredients:\n\nIngredients: ${ingredientList}\n\nFor each ingredient, provide: overall sustainability score (0-100), sourcing score (0-100), biodegradability score (0-100), environmental impact score (0-100), sourcing description, biodegradability category (readily/inherently/not biodegradable), key environmental concerns, sustainable alternative suggestion (if score below 60). Also calculate an overall formula sustainability score.`,
          response_json_schema: {
            type: 'object',
            properties: {
              overall_formula_score: { type: 'number' },
              overall_assessment: { type: 'string' },
              ingredients: { type: 'array', items: { type: 'object', properties: {
                name: { type: 'string' }, overall_score: { type: 'number' }, sourcing_score: { type: 'number' },
                biodegradability_score: { type: 'number' }, environmental_score: { type: 'number' },
                sourcing_type: { type: 'string' }, biodegradability_category: { type: 'string' },
                concerns: { type: 'array', items: { type: 'string' } }, sustainable_alternative: { type: 'string' }
              } } },
              recommendations: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        return Response.json(result);
      }

      case 'productSuggestions': {
        const productType = (data.productType || '').toString().slice(0, 200);
        const query = (data.query || '').toString().slice(0, 200);
        const result = await call({
          prompt: `User wants "${productType}". Query: "${query}". Give 8 short, specific product ideas matching this query. Be concise.`,
          response_json_schema: { type: 'object', properties: { suggestions: { type: 'array', items: { type: 'string' }, maxItems: 8 } }, required: ['suggestions'] }
        });
        return Response.json(result);
      }

      case 'productTypeSuggestions': {
        const query = (data.query || '').toString().slice(0, 200);
        const result = await call({
          prompt: `Given the user input "${query}", suggest 8 specific cosmetic, cleaning, or personal care product types they might want to create. Examples: All-Purpose Cleaner, Facial Moisturizer, Hand Soap, Glass Cleaner, Body Wash, Kitchen Degreaser, Sunscreen, Shampoo. Return a JSON object with a "suggestions" array containing product type names.`,
          response_json_schema: { type: 'object', properties: { suggestions: { type: 'array', items: { type: 'string' } } }, required: ['suggestions'] }
        });
        return Response.json(result);
      }

      case 'stabilityPrediction': {
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients.slice(0, 50) : [];
        const ingredientList = ingredients.map(i => `${i.chemical_name} (${i.percentage}%)`).join(', ');
        const result = await call({
          prompt: `Predict the shelf life stability for a cosmetic formula with these ingredients: ${ingredientList}.\n\nConsider: water activity and microbial growth risk, oxidation potential, preservative efficacy, pH stability, ingredient interactions, packaging recommendations.\n\nReturn JSON with: predicted_months, confidence, key_factors, degradation_risks (factor, risk, mitigation), packaging_recommendation, storage_conditions.`,
          response_json_schema: {
            type: 'object',
            properties: {
              predicted_months: { type: 'number' },
              confidence: { type: 'string' },
              key_factors: { type: 'array', items: { type: 'string' } },
              degradation_risks: { type: 'array', items: { type: 'object', properties: { factor: { type: 'string' }, risk: { type: 'string' }, mitigation: { type: 'string' } } } },
              packaging_recommendation: { type: 'string' },
              storage_conditions: { type: 'string' }
            }
          }
        });
        return Response.json(result);
      }

      case 'supplierSourcing': {
        const ingredientName = (data.ingredientName || '').toString().slice(0, 200);
        const result = await call({
          prompt: `Search the web for REAL product listings for the ingredient "${ingredientName}" from wholesale cosmetic ingredient suppliers, chemical distributors, or bulk suppliers. Focus on: MakingCosmetics, Lotioncrafter, Wholesale Supplies Plus, Nature's Garden, Croda Indie Beauty, Formulator Sample Shop, bulkapothecary, and chemistry supply companies like Sigma-Aldrich or Fisher Scientific.\n\nCRITICAL: Only return suppliers where you found an ACTUAL product page with a visible price. Do NOT estimate or guess prices.\n\nFor each real listing, provide: supplier name, productUrl (direct URL to product page), packageName, packagePrice (USD), pricePer100g, leadTime, moq, confidence (high/medium/low), sourcingScore (0-100).\n\nExclude consumer retail stores. Rank by pricePer100g (lowest first).`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              suppliers: { type: 'array', items: { type: 'object', properties: {
                supplier: { type: 'string' }, productUrl: { type: 'string' }, packageName: { type: 'string' },
                packagePrice: { type: 'number' }, pricePer100g: { type: 'number' }, leadTime: { type: 'string' },
                moq: { type: 'string' }, confidence: { type: 'string', enum: ['high', 'medium', 'low'] }, sourcingScore: { type: 'number' }
              } } }
            }
          }
        });
        return Response.json(result);
      }

      default:
        return Response.json({ error: `Unknown operation: ${operation}` }, { status: 400 });
    }
  } catch (error) {
    console.error('runConsumerLLM error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}