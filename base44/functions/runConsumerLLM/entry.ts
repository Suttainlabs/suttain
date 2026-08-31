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

      default:
        return Response.json({ error: `Unknown operation: ${operation}` }, { status: 400 });
    }
  } catch (error) {
    console.error('runConsumerLLM error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}