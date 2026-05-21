import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { file_url } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Use ExtractDataFromUploadedFile to get raw text from the PDF first
    const extraction = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          raw_text: { type: "string", description: "All text content from the document" }
        }
      }
    });

    const pdfText = extraction?.output?.raw_text || '';
    
    if (!pdfText || pdfText.trim().length < 50) {
      return Response.json({ error: 'Could not extract text from PDF. Please ensure it is a text-based PDF.' }, { status: 400 });
    }

    // Now analyze the extracted text with InvokeLLM
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an expert chemical safety analyst. Analyze the following Safety Data Sheet (SDS) text and extract all relevant information.

SDS TEXT:
${pdfText}

Extract and return a structured JSON with:
1. product_name: The name of the chemical/product (e.g. "Benzene", "Acetone", etc.)
2. cas_number: CAS registry number if present
3. manufacturer: Company name
4. hazard_classifications: Array of GHS hazard classes (e.g. "Flammable Liquid", "Acute Toxicity", "Skin Irritant")
5. hazard_statements: Array of H-statements (e.g. "H225 - Highly flammable liquid and vapour")
6. precautionary_statements: Array of P-statements
7. ingredients: Array of objects with {name, cas, concentration_percent, hazard_level (low/medium/high/critical)}
8. physical_properties: Object with {flash_point, boiling_point, ph, vapor_pressure, appearance, odor}
9. health_hazards: Array of health effects (skin, eye, inhalation, ingestion)
10. environmental_hazards: Array of environmental concerns
11. first_aid_measures: Object with {skin, eyes, inhalation, ingestion}
12. storage_requirements: Array of storage guidelines
13. disposal_requirements: String
14. overall_risk_score: Number 0-100 (100 = most dangerous). For highly toxic carcinogenic chemicals like benzene score 80-95.
15. safer_alternatives: Array of objects with {ingredient_name, alternative, reason, estimated_risk_reduction_percent}
16. formula_recommendations: Array of actionable recommendations to make formulas cleaner/safer
17. regulatory_compliance: Object with {reach_compliant: bool, sds_version, revision_date}
18. summary: A 2-3 sentence plain-language summary of the key safety concerns and recommended actions

Be thorough and accurate. ALWAYS fill in product_name from the SDS data.`,
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