import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, hypothesis, chemicals, conditions } = body;

    if (!title || !hypothesis || !chemicals || !Array.isArray(chemicals) || chemicals.length === 0) {
      return Response.json({ error: 'Missing required fields: title, hypothesis, chemicals' }, { status: 400 });
    }

    const chemicalList = chemicals.map(c => {
      let s = c.name || c;
      if (c.concentration) s += ` (${c.concentration})`;
      if (c.amount) s += ` [${c.amount}]`;
      return s;
    }).join(', ');

    const conditionsStr = conditions
      ? Object.entries(conditions).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ')
      : 'standard conditions';

    // Build the evaluation prompt
    const prompt = `You are a scientific research advisor evaluating a student's proposed chemistry experiment.

EXPERIMENT TITLE: ${title}

STUDENT HYPOTHESIS: ${hypothesis}

CHEMICALS INVOLVED: ${chemicalList}

CONDITIONS: ${conditionsStr}

Evaluate this experiment and provide:

1. FEASIBILITY SCORE (0-100): How likely is this experiment to produce meaningful results as described?
2. FEASIBILITY LABEL: One of: highly_feasible, feasible, marginal, unlikely, not_recommended
3. FEASIBILITY REASONING: Explain WHY this score was given. Consider reaction chemistry, thermodynamics, kinetics, and practical feasibility.
4. PREDICTED OUTCOME: What would likely happen if this experiment were actually conducted? Describe expected products, observations, and measurable outcomes.
5. SAFETY ASSESSMENT: Evaluate the safety of this experiment. Note any hazards, required PPE, and whether it could be safely conducted in a school lab setting.
6. CITATIONS: Find 3-5 published research papers or reliable scientific sources that are directly relevant to this experiment. For each, provide title, authors (if known), source (journal or database), URL, and a brief note on relevance.
7. SIMILAR EXPERIMENTS: Find 2-3 similar experiments that have been published or documented. Describe what was done and what the outcome was.

Be scientific, evidence-based, and constructive. This is for educational purposes — guide the student toward better research, do not just say yes or no.`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          feasibility_score: { type: "number" },
          feasibility_label: { type: "string", enum: ["highly_feasible", "feasible", "marginal", "unlikely", "not_recommended"] },
          feasibility_reasoning: { type: "string" },
          predicted_outcome: { type: "string" },
          safety_assessment: { type: "string" },
          citations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                authors: { type: "string" },
                source: { type: "string" },
                url: { type: "string" },
                relevance: { type: "string" }
              }
            }
          },
          similar_experiments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                outcome: { type: "string" },
                source: { type: "string" }
              }
            }
          }
        },
        required: ["feasibility_score", "feasibility_label", "feasibility_reasoning", "predicted_outcome", "safety_assessment"]
      }
    });

    return Response.json({
      success: true,
      evaluation: response
    });
  } catch (error) {
    console.error('evaluateExperiment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});