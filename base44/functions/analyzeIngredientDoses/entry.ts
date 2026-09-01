import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const ingredients = body?.ingredients;
    const productName = body?.product_name || 'Unknown';
    const category = body?.category || 'General';

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return Response.json({ error: 'Ingredients array is required' }, { status: 400 });
    }

    // Cap at 30 ingredients to stay within token limits
    const capped = ingredients.slice(0, 30);
    const ingredientList = capped.map((ing, i) =>
      `${i + 1}. ${ing.name || 'Unknown'}${ing.purpose ? ` (purpose: ${ing.purpose})` : ''}`
    ).join('\n');

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a board-certified toxicologist and regulatory scientist. Analyze each ingredient below for DOSE-AWARE safety.

Product: ${productName}
Category: ${category}
Ingredients:
${ingredientList}

For EACH ingredient, provide a dose-aware safety analysis following these principles:

1. DOSE-AWARE SCORING: Factor in the typical use concentration relative to recognized safe-use thresholds (FDA, EFSA, JECFA ADI where available). An ingredient that is safe at its actual concentration must NOT receive a low score simply because it appears in the product.

2. CONCENTRATION CONTEXT: State the typical concentration in this product category. If the actual concentration is unknown, clearly state that the score is based on presence only and may overstate risk.

3. SAFE-USE LEVEL: Cite the specific regulatory threshold (e.g. "FDA permits up to 0.5% as preservative in leave-on products", "JECFA ADI: 0-5 mg/kg body weight", "EU CosIng Annex VI max 0.001%").

4. HONEST FRAMING: Where evidence is weak, contradictory, or based only on extreme-dose animal studies, say so plainly. Example phrasing: "Flagged in some studies at very high doses; considered safe by regulators at levels normally used." Never use fear-based language. Be calm, clear, and scientific.

5. PER-INGREDIENT SOURCE: Each ingredient must cite its OWN specific source, never provide a generic list of references. Use specific regulation numbers, database entries, or study references.

6. CONFIDENCE: Rate your confidence. "high" when regulatory limits are well-established; "medium" when some data exists but is incomplete; "low" when data is sparse, contradictory, or primarily from animal studies at extreme doses.

7. REASONING: Write in plain human language accessible to a non-scientist. Explain the concern (if any), the concentration context, the safe-use level, and why the score is what it is. Tie it to the specific source.

Return one analysis object per ingredient, matching the ingredient name exactly.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          analyses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ingredient_name: { type: 'string' },
                typical_concentration: { type: 'string', description: 'Typical use level in this product category, e.g. "0.1-1% in cosmetics" or "Unknown, presence detected only"' },
                safe_use_level: { type: 'string', description: 'Recognized safe-use threshold from FDA/EFSA/JECFA or regulatory body' },
                regulatory_source: { type: 'string', description: 'Specific agency and regulation, e.g. "FDA 21 CFR 182.60", "EFSA ADI", "JECFA Monograph"' },
                dose_adjusted_score: { type: 'number', description: '0-100 score factoring in concentration vs safe threshold' },
                confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
                concentration_known: { type: 'boolean', description: 'true if actual concentration is known, false if estimated or unknown' },
                reasoning: { type: 'string', description: 'Plain-language explanation. Honest about weak/contradictory/animal-only evidence. No fear-based words.' },
                source_citation: { type: 'string', description: 'Specific source per ingredient, URL, regulation number, or study reference' }
              },
              required: ['ingredient_name', 'typical_concentration', 'safe_use_level', 'dose_adjusted_score', 'confidence', 'concentration_known', 'reasoning', 'source_citation']
            }
          }
        },
        required: ['analyses']
      }
    });

    return Response.json({ analyses: result?.analyses || [] });
  } catch (error) {
    console.error('Dose analysis error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});