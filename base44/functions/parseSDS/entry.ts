import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_url } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    const prompt = `You are an expert chemical safety analyst. Carefully read this Safety Data Sheet document and extract ALL information visible in it.

CRITICAL: You MUST read the actual document content. The product name is in Section 1 (Identification) or at the top of the document. Never return "Unknown Product", always extract the real product name.

Return a JSON object with these fields:
- product_name: the exact chemical or product name from the SDS (e.g. "Sodium Hydroxide", "Acetone", "Benzene"), REQUIRED
- cas_number: CAS registry number (e.g. "67-64-1")
- manufacturer: supplier/company name from Section 1
- hazard_classifications: array of GHS hazard class strings (e.g. ["Flammable liquid, category 2", "Acute toxicity, category 4"])
- hazard_statements: array of H-statement strings (e.g. ["H225 - Highly flammable liquid and vapour"])
- precautionary_statements: array of P-statement strings
- ingredients: array of objects {name, cas, concentration_percent, hazard_level} where hazard_level is "low", "medium", "high", or "critical"
- physical_properties: object with {flash_point, boiling_point, ph, vapor_pressure, appearance, odor}
- health_hazards: array of health effect strings
- environmental_hazards: array of environmental concern strings
- first_aid_measures: object with {skin, eyes, inhalation, ingestion}
- storage_requirements: array of storage guideline strings
- disposal_requirements: string
- overall_risk_score: integer 0-100 (100 = most dangerous; e.g. benzene=90, strong acids=75, acetone=45, vitamin C=5)
- safer_alternatives: array of {ingredient_name, alternative, reason, estimated_risk_reduction_percent}
- formula_recommendations: array of actionable safety recommendation strings
- regulatory_compliance: object with {reach_compliant: boolean, sds_version, revision_date}
- summary: 2-3 sentence plain-language safety summary of the product and its main risks`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          product_name: { type: "string" },
          cas_number: { type: "string" },
          manufacturer: { type: "string" },
          hazard_classifications: { type: "array", items: { type: "string" } },
          hazard_statements: { type: "array", items: { type: "string" } },
          precautionary_statements: { type: "array", items: { type: "string" } },
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                cas: { type: "string" },
                concentration_percent: { type: "string" },
                hazard_level: { type: "string" }
              }
            }
          },
          physical_properties: {
            type: "object",
            properties: {
              flash_point: { type: "string" },
              boiling_point: { type: "string" },
              ph: { type: "string" },
              vapor_pressure: { type: "string" },
              appearance: { type: "string" },
              odor: { type: "string" }
            }
          },
          health_hazards: { type: "array", items: { type: "string" } },
          environmental_hazards: { type: "array", items: { type: "string" } },
          first_aid_measures: {
            type: "object",
            properties: {
              skin: { type: "string" },
              eyes: { type: "string" },
              inhalation: { type: "string" },
              ingestion: { type: "string" }
            }
          },
          storage_requirements: { type: "array", items: { type: "string" } },
          disposal_requirements: { type: "string" },
          overall_risk_score: { type: "number" },
          safer_alternatives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                ingredient_name: { type: "string" },
                alternative: { type: "string" },
                reason: { type: "string" },
                estimated_risk_reduction_percent: { type: "number" }
              }
            }
          },
          formula_recommendations: { type: "array", items: { type: "string" } },
          regulatory_compliance: {
            type: "object",
            properties: {
              reach_compliant: { type: "boolean" },
              sds_version: { type: "string" },
              revision_date: { type: "string" }
            }
          },
          summary: { type: "string" }
        }
      },
      model: "claude_sonnet_4_6"
    });

    // InvokeLLM with response_json_schema returns { response: {...} }, unwrap it
    const parsed = result?.response ?? result;
    return Response.json({ success: true, data: parsed });
  } catch (error) {
    console.error('parseSDS error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});