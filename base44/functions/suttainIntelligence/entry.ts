import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const BLOCKED_PATTERNS = [
  /synthesize|synthesis of|how to make|manufacture of|production of|step.by.step.*make/i,
  /explosive.*recipe|bomb.*make|methamphetamine|illegal drug/i,
  /weaponize|nerve agent|chemical weapon/i
];

function isBlocked(text) {
  return BLOCKED_PATTERNS.some(p => p.test(text));
}

function buildPrompt(task, input, context) {
  const ctx = context ? `\n\nContext: ${context}` : '';
  switch (task) {
    case 'hazard_explanation':
      return `You are a chemical safety expert. Explain the hazard profile of "${input}" in clear, factual terms.${ctx}\n\nCover: GHS hazard classifications, key toxicity concerns, environmental fate, and safe handling guidance. Be specific and cite regulatory bodies (EPA, ECHA, GHS) where applicable. Do not provide synthesis instructions.`;
    case 'ingredient_analysis':
      return `You are a product safety analyst. Analyze the safety of the following ingredient or product: "${input}".${ctx}\n\nProvide a risk rating (low/medium/high), identify specific concerns (allergens, endocrine disruptors, carcinogens, irritants), and note any regulatory restrictions. Be factual and cite sources. Do not provide medical advice.`;
    case 'interaction_analysis':
      return `You are a chemical interaction specialist. Analyze what happens when these are mixed: "${input}".${ctx}\n\nIdentify: reaction products, hazard level, safety warnings, and any dangerous interactions. Be specific about the chemistry. Do not provide synthesis instructions.`;
    case 'farm_agronomist':
      return `You are an expert agronomist. Answer this farming question: "${input}".${ctx}\n\nProvide practical, actionable advice. Cover crop management, pest/disease control, soil health, and timing. Be concise but thorough.`;
    default:
      return `Answer the following: ${input}${ctx}`;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { task, input, context } = body;

    if (!task || !input) return Response.json({ error: 'task and input are required' }, { status: 400 });

    const prompt = buildPrompt(task, input, context);

    const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: task === 'ingredient_analysis' ? {
        type: 'object',
        properties: {
          risk_rating: { type: 'string', enum: ['low', 'medium', 'high'] },
          summary: { type: 'string' },
          concerns: { type: 'array', items: { type: 'string' } },
          regulatory_notes: { type: 'string' },
          confidence: { type: 'number' }
        }
      } : task === 'interaction_analysis' ? {
        type: 'object',
        properties: {
          hazard_level: { type: 'string', enum: ['safe', 'caution', 'dangerous'] },
          summary: { type: 'string' },
          reaction_products: { type: 'array', items: { type: 'string' } },
          safety_warning: { type: 'string' },
          confidence: { type: 'number' }
        }
      } : task === 'hazard_explanation' ? {
        type: 'object',
        properties: {
          ghs_classification: { type: 'string' },
          toxicity_summary: { type: 'string' },
          environmental_fate: { type: 'string' },
          safe_handling: { type: 'string' },
          confidence: { type: 'number' }
        }
      } : null
    });

    const responseText = typeof llmResult === 'string' ? llmResult : JSON.stringify(llmResult);
    const blocked = isBlocked(responseText) || isBlocked(input);

    return Response.json({
      source: 'AI analysis (LLM)',
      task,
      input,
      blocked,
      result: blocked
        ? { message: 'This query was blocked by the safety guard. The requested information cannot be provided for safety reasons.' }
        : llmResult
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});