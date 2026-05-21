import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { file_url } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Step 1: Extract raw text from the PDF
    const extraction = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          raw_text: { type: "string" }
        }
      }
    });

    const pdfText = extraction?.output?.raw_text || '';

    if (!pdfText || pdfText.trim().length < 30) {
      return Response.json({ error: 'Could not extract text from PDF.' }, { status: 400 });
    }

    // Step 2: Analyze text with fast default LLM model
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a chemical safety analyst. Extract data from this Safety Data Sheet text.

${pdfText.slice(0, 12000)}

Return JSON with:
- product_name: exact chemical/product name from Section 1 or document title (REQUIRED - never null)
- cas_number: CAS number string
- manufacturer: supplier company name
- hazard_classifications: array of GHS hazard class strings
- hazard_statements: array of "H### - description" strings
- precautionary_statements: array of "P### - description" strings
- ingredients: array of {name, cas, concentration_percent, hazard_level: "low"|"medium"|"high"|"critical"}
- physical_properties: {flash_point, boiling_point, ph, vapor_pressure, appearance, odor}
- health_hazards: array of strings
- environmental_hazards: array of strings
- first_aid_measures: {skin, eyes, inhalation, ingestion}
- storage_requirements: array of strings
- disposal_requirements: string
- overall_risk_score: 0-100 integer (carcinogens like benzene=90, corrosives=70, mild irritants=20, safe=5)
- safer_alternatives: array of {ingredient_name, alternative, reason, estimated_risk_reduction_percent}
- formula_recommendations: array of actionable strings
- regulatory_compliance: {reach_compliant: boolean, sds_version, revision_date}
- summary: 2-3 sentence plain-language safety summary`,
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
      }
    });

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('parseSDS error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});