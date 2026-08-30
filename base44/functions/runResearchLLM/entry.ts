import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Narrow, app-specific LLM operations for the research/computational domain.
// Accepts a known `operation` enum + structured domain `data` (never a raw prompt);
// the prompt + schema are constructed server-side and run service-scoped to
// protect integration credits.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { operation, data = {} } = await req.json();

    const call = (params) => base44.asServiceRole.integrations.Core.InvokeLLM(params);

    switch (operation) {
      case 'plainLanguageSummary': {
        const { simLabel, domain, results = {} } = data;
        const keyVals = results.predicted_results?.key_values
          ?.map(kv => `${kv.property}: ${kv.value} ${kv.unit}`)
          .join(', ') || '';
        const prompt = `You are a science communicator helping a non-specialist understand a computational chemistry result.

Simulation type: ${simLabel}
Domain: ${domain}
System overview: ${results.system_overview || ''}
Key results: ${keyVals}
Scientific interpretation: ${results.scientific_interpretation || ''}

Write exactly 2-3 plain English sentences (no jargon, no bullet points) explaining what these results mean in practical terms for someone working in product formulation or safety.
For example, explain whether the molecule is stable, reactive, safe to use, or how it might behave in a real product. Do NOT repeat the numbers verbatim — translate them into meaning.
Return just the plain text sentences, nothing else.`;
        const response = await call({ prompt });
        return Response.json(typeof response === 'string' ? response : response?.text || String(response));
      }

      case 'domainReliabilityInterpretation': {
        const {
          uniprotDescription, gene, max_predicted_aligned_error, maxPae,
          globalMetricValue, fractionPlddtVeryHigh, fractionPlddtConfident,
          fractionPlddtLow, fractionPlddtVeryLow
        } = data;
        const prompt = `You are a structural biology expert. Given the following AlphaFold protein structure quality metrics, write a 2-sentence plain English explanation of what the domain reliability means for this protein's function. Be specific and practical.

Protein: ${uniprotDescription} (${gene})
Max Predicted Aligned Error (PAE): ${max_predicted_aligned_error || maxPae || 'unknown'} Angstroms
Global pLDDT: ${globalMetricValue}
Fraction Very High (>90): ${(fractionPlddtVeryHigh * 100).toFixed(1)}%
Fraction Confident (70-90): ${(fractionPlddtConfident * 100).toFixed(1)}%
Fraction Low (50-70): ${(fractionPlddtLow * 100).toFixed(1)}%
Fraction Very Low (<50): ${(fractionPlddtVeryLow * 100).toFixed(1)}%

Explain in exactly 2 sentences what these metrics tell us about which domains are reliable and what that means for understanding this protein's function and potential drug-binding sites.`;
        const interpRes = await call({ prompt });
        return Response.json(typeof interpRes === 'string' ? interpRes : JSON.stringify(interpRes));
      }

      case 'sustainabilityProfile': {
        const moleculeName = (data.moleculeName || 'the molecule').toString().slice(0, 200);
        const prompt = `You are an environmental chemist. Based on what is known about the molecule "${moleculeName}", estimate its sustainability profile.

Return a JSON object with these exact keys:
- biodegradability_percent: number 0-100 (estimated % biodegradability under aerobic conditions, e.g. 85)
- persistence: string, one of "Low", "Moderate", "High" (environmental persistence)
- aquatic_toxicity: string, one of "Low", "Moderate", "High" (estimated aquatic toxicity class)
- carbon_footprint: string, one of "Low", "Moderate", "High" (relative carbon footprint of production/use)
- data_available: boolean (true if real data exists, false if estimated)
- notes: string (1 sentence note, or "Sustainability data limited for this compound. Manual review recommended." if data_available is false)`;
        const resp = await call({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              biodegradability_percent: { type: 'number' },
              persistence: { type: 'string' },
              aquatic_toxicity: { type: 'string' },
              carbon_footprint: { type: 'string' },
              data_available: { type: 'boolean' },
              notes: { type: 'string' }
            }
          }
        });
        return Response.json(resp);
      }

      case 'relatedResearch': {
        const molecule = (data.molecule || '').toString().slice(0, 200);
        const simType = (data.simType || 'computational chemistry').toString().slice(0, 120);
        const prompt = `You are a research assistant. For the molecule or system "${molecule}" in the context of ${simType}, return the 3 most relevant real PubMed research abstracts.

Return a JSON array of 3 objects, each with:
- title: string (real paper title)
- authors: string (first author et al., year)
- journal: string (journal name)
- abstract_snippet: string (1-2 sentence description of what the paper found)
- pubmed_id: string (real PMID if you know it, otherwise "N/A")

Only include real, plausible papers. Do not fabricate PMIDs.`;
        const resp = await call({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                authors: { type: 'string' },
                journal: { type: 'string' },
                abstract_snippet: { type: 'string' },
                pubmed_id: { type: 'string' }
              }
            }
          }
        });
        return Response.json(resp);
      }

      case 'externalDatabaseSearch': {
        const searchQuery = (data.searchQuery || '').toString().slice(0, 200);
        const selectedSources = Array.isArray(data.selectedSources) ? data.selectedSources : [];
        const selectedCategories = Array.isArray(data.selectedCategories) ? data.selectedCategories : [];
        const prompt = `
        Search for chemical information about "${searchQuery}" from scientific databases.

        Simulate fetching data from these sources: ${selectedSources.join(', ')}
        Focus on these categories: ${selectedCategories.join(', ')}

        Return comprehensive data in this JSON format:
        {
          "compound_info": { "name": "string", "iupac_name": "string", "cas_number": "string", "molecular_formula": "string", "molecular_weight": "number", "smiles": "string", "inchi": "string", "inchi_key": "string", "pubchem_cid": "string" },
          "physical_properties": { "melting_point": "string", "boiling_point": "string", "density": "string", "solubility": "string", "vapor_pressure": "string", "log_p": "number", "pka": "number" },
          "spectral_data": { "ir_peaks": ["array"], "nmr_shifts": ["array"], "mass_spectrum_peaks": ["array"], "uv_vis_absorption": "string" },
          "toxicity_data": { "ld50_oral": "string", "ld50_dermal": "string", "lc50_inhalation": "string", "carcinogenicity": "string", "mutagenicity": "string", "ghs_classification": ["array"], "exposure_limits": { "osha_pel": "string", "niosh_rel": "string", "acgih_tlv": "string" } },
          "bioactivity": { "targets": ["array"], "mechanisms": ["array"], "therapeutic_uses": ["array"], "side_effects": ["array"] },
          "literature": [{ "title": "string", "authors": "string", "journal": "string", "year": "number", "doi": "string", "abstract_summary": "string", "relevance": "high|medium|low" }],
          "synthesis_routes": [{ "name": "string", "steps": "number", "yield": "string", "conditions": "string" }],
          "safety_summary": "string",
          "data_sources": ["array of sources used"]
        }`;
        const response = await call({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              compound_info: { type: 'object' },
              physical_properties: { type: 'object' },
              spectral_data: { type: 'object' },
              toxicity_data: { type: 'object' },
              bioactivity: { type: 'object' },
              literature: { type: 'array', items: { type: 'object' } },
              synthesis_routes: { type: 'array', items: { type: 'object' } },
              safety_summary: { type: 'string' },
              data_sources: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        return Response.json(response);
      }

      case 'externalDatabaseSummary': {
        const searchResults = data.searchResults || {};
        const resultsJson = JSON.stringify(searchResults).slice(0, 12000);
        const prompt = `
        Analyze and summarize this chemical data for a scientist or formulator:

        ${resultsJson}

        Provide a comprehensive but concise summary in this format:
        {
          "executive_summary": "2-3 sentence overview",
          "key_properties": ["5 most important properties"],
          "safety_highlights": ["top 3 safety considerations"],
          "research_insights": ["3 key findings from literature"],
          "practical_applications": ["3 practical uses or applications"],
          "recommended_precautions": ["3 recommended precautions"],
          "interesting_facts": ["2-3 interesting scientific facts"],
          "confidence_score": 0.0-1.0
        }`;
        const summary = await call({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              executive_summary: { type: 'string' },
              key_properties: { type: 'array', items: { type: 'string' } },
              safety_highlights: { type: 'array', items: { type: 'string' } },
              research_insights: { type: 'array', items: { type: 'string' } },
              practical_applications: { type: 'array', items: { type: 'string' } },
              recommended_precautions: { type: 'array', items: { type: 'string' } },
              interesting_facts: { type: 'array', items: { type: 'string' } },
              confidence_score: { type: 'number' }
            }
          }
        });
        return Response.json(summary);
      }

      case 'dwsimChat': {
        const SYSTEM_PROMPT = `You are an expert DWSIM process simulation engineer and Python developer.
When a user describes a chemical process, you:
1. Generate a complete, working DWSIM Python FluentAPI script
2. Explain what the simulation does and what results to expect
3. Suggest the correct thermodynamic property package
4. Note any important assumptions or limitations

DWSIM Python FluentAPI requirements:
- Import: clr, sys; add dwsim_path to sys.path
- References: DWSIM.Automation, DWSIM.Interfaces, DWSIM.Thermodynamics, DWSIM.UnitOperations
- Use Automation3() to create flowsheet
- AddObject(ObjectType.X, x, y, "name") to add objects
- Use correct ObjectType enum values: MaterialStream, EnergyStreams, Mixer, NodeIn (splitter), Heater, Cooler, HeatExchanger, DistillationColumn, Flash2, Compressor, Pump, Valve, ConversionReactor, EquilibriumReactor
- Connect streams: flowsheet.ConnectObjects(source_name, dest_name, source_port, dest_port)
- Set compound mole fractions, temperature (K), pressure (Pa), mass flow (kg/s)
- Call sim.SolveFlowsheet() and print results
- Save as .dwxml

Always wrap your script in a code block with python syntax highlighting.
Be concise but thorough. Flag if a process needs special handling.`;
        const conversationHistory = (data.conversationHistory || '').slice(0, 16000);
        const result = await call({
          prompt: `${SYSTEM_PROMPT}\n\nConversation so far:\n${conversationHistory}\n\nRespond as the assistant:`,
          model: 'claude_sonnet_4_6'
        });
        return Response.json(result);
      }

      default:
        return Response.json({ error: `Unknown operation: ${operation}` }, { status: 400 });
    }
  } catch (error) {
    console.error('runResearchLLM error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}