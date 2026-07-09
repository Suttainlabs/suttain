import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const ingredients = body.ingredients;
    const ph = body.ph;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length < 2) {
      return Response.json({ error: 'At least 2 ingredients are required' }, { status: 400 });
    }

    const ingredientList = ingredients.map(i => `${i.name} (${i.percentage || 0}%)`).join(', ');
    const phStr = ph ? ` at pH ${ph}` : '';

    const prompt = `You are a cosmetic chemistry expert. Analyze the chemical interactions between these ingredients in a cosmetic formula${phStr}:

${ingredientList}

For EVERY PAIR of ingredients (i and j where i < j), provide:
- score (0-100): compatibility score where 100 = perfectly compatible, 0 = severe incompatibility
- explanation: brief scientific explanation of the interaction (1-2 sentences)
- mitigation: if score < 80, provide a specific mitigation suggestion; otherwise "N/A"

Also provide:
- overall_stability_score (0-100): weighted average considering all pairwise interactions and known stability factors (water content, preservative system, oxidation risk, pH)
- base_shelf_life_months: estimated shelf life at room temperature (25C, ambient light)
- degradation_rate: average monthly percentage of active ingredient loss at room temperature (e.g., 2.5 means 2.5% per month)
- critical_degradation_points: array of { month, percentage, note } for significant degradation thresholds (e.g., 90%, 75%, 50% remaining)
- warnings: array of { severity ("high"|"medium"|"low"), ingredient_pair, message } for incompatible pairs (score < 80)
- storage_recommendations: best practices for storing this formula

Consider these interaction types:
- pH incompatibility (e.g., acids + bases, retinol + low pH)
- Oxidation reactions (e.g., vitamin C + metals, unsaturated oils + oxygen)
- Precipitation or solubility issues
- Preservative deactivation (e.g., nonionics + preservatives)
- Emulsion instability
- Photosensitization
- Degradation catalysis (e.g., copper + ascorbic acid)

Return the analysis as JSON.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          interaction_matrix: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ingredient_a: { type: 'string' },
                ingredient_b: { type: 'string' },
                score: { type: 'number' },
                explanation: { type: 'string' },
                mitigation: { type: 'string' }
              }
            }
          },
          overall_stability_score: { type: 'number' },
          base_shelf_life_months: { type: 'number' },
          degradation_rate: { type: 'number' },
          critical_degradation_points: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'number' },
                percentage: { type: 'number' },
                note: { type: 'string' }
              }
            }
          },
          warnings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                severity: { type: 'string' },
                ingredient_pair: { type: 'string' },
                message: { type: 'string' }
              }
            }
          },
          storage_recommendations: { type: 'string' }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('chemicalInteractionScore error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});