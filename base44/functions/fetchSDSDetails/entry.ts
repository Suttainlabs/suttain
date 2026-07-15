import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { cid, name } = await req.json();

    if (!cid) {
      return Response.json({ error: 'CID is required' }, { status: 400 });
    }

    // Fetch GHS/safety data from PubChem PUG-View
    const [hazardRes, synonymRes, descRes] = await Promise.all([
      fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=GHS+Classification`),
      fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`),
      fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/description/JSON`),
    ]);

    const hazardData = hazardRes.ok ? await hazardRes.json() : null;
    const synonymData = synonymRes.ok ? await synonymRes.json() : null;
    const descData = descRes.ok ? await descRes.json() : null;

    // Extract GHS hazard statements
    const ghsSection = hazardData?.Record?.Section?.[0]?.Section || [];
    const hazardStatements = [];
    const precautionaryStatements = [];
    const pictograms = [];
    const signalWord = [];

    for (const sec of ghsSection) {
      if (sec.TOCHeading === 'GHS Hazard Statements') {
        for (const info of (sec.Information || [])) {
          const val = info.Value?.StringWithMarkup?.[0]?.String;
          if (val) hazardStatements.push(val);
        }
      }
      if (sec.TOCHeading === 'Precautionary Statement Codes') {
        for (const info of (sec.Information || [])) {
          const val = info.Value?.StringWithMarkup?.[0]?.String;
          if (val) precautionaryStatements.push(val);
        }
      }
      if (sec.TOCHeading === 'Pictogram(s)') {
        for (const info of (sec.Information || [])) {
          const extras = info.Value?.StringWithMarkup?.[0]?.Markup || [];
          for (const m of extras) {
            if (m.URL) pictograms.push({ url: m.URL, type: m.Extra || '' });
          }
        }
      }
      if (sec.TOCHeading === 'Signal') {
        for (const info of (sec.Information || [])) {
          const val = info.Value?.StringWithMarkup?.[0]?.String;
          if (val) signalWord.push(val);
        }
      }
    }

    // Synonyms / trade names
    const synonyms = (synonymData?.InformationList?.Information?.[0]?.Synonym || []).slice(0, 10);
    const description = descData?.InformationList?.Information?.find(i => i.Description)?.Description || '';

    // Use AI to build a structured SDS-like analysis from PubChem data
    const chemicalSummary = {
      cid,
      name,
      hazard_statements: hazardStatements,
      precautionary_statements: precautionaryStatements,
      signal_word: signalWord[0] || null,
      pictograms,
      synonyms,
      description,
    };

    const prompt = `You are a chemical safety expert. Given the following PubChem data for "${name}", produce a structured SDS analysis JSON.

PubChem data:
${JSON.stringify(chemicalSummary, null, 2)}

Create a comprehensive safety analysis as if this were a full Safety Data Sheet analysis. Derive risk scores from the hazard statements and signal word. Signal word "Danger" = high risk (70-90), "Warning" = moderate risk (40-70), none = lower risk (10-40). Extract or infer all fields.`;

    const sdsSchema = {
      type: "object",
      properties: {
        product_name: { type: "string" },
        cas_number: { type: "string" },
        chemical_formula: { type: "string" },
        signal_word: { type: "string" },
        overall_risk_score: { type: "number", description: "0-100" },
        hazard_classifications: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              statement: { type: "string" },
              severity: { type: "string", enum: ["low", "medium", "high", "critical"] }
            }
          }
        },
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              cas: { type: "string" },
              percentage: { type: "string" },
              hazard_level: { type: "string", enum: ["low", "medium", "high", "critical"] }
            }
          }
        },
        first_aid_measures: {
          type: "object",
          properties: {
            inhalation: { type: "string" },
            skin_contact: { type: "string" },
            eye_contact: { type: "string" },
            ingestion: { type: "string" }
          }
        },
        physical_properties: {
          type: "object",
          properties: {
            appearance: { type: "string" },
            odor: { type: "string" },
            boiling_point: { type: "string" },
            flash_point: { type: "string" },
            solubility: { type: "string" }
          }
        },
        safer_alternatives: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              reason: { type: "string" },
              risk_reduction: { type: "string" }
            }
          }
        },
        regulatory_status: {
          type: "object",
          properties: {
            reach: { type: "string" },
            osha: { type: "string" },
            california_prop65: { type: "string" }
          }
        },
        summary: { type: "string" }
      },
      required: ["product_name", "overall_risk_score", "hazard_classifications", "ingredients", "first_aid_measures", "safer_alternatives", "summary"]
    };

    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: sdsSchema,
    });

    // Merge PubChem data into the AI result
    const finalResult = {
      ...aiResult,
      _pubchem: {
        cid,
        synonyms,
        pictograms,
        hazard_statements: hazardStatements,
        precautionary_statements: precautionaryStatements,
        pubchem_url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
      }
    };

    return Response.json({ success: true, data: finalResult });
  } catch (error) {
    console.error('fetchSDSDetails error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});