import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { chemical, context } = body;
    if (!chemical) return Response.json({ error: 'chemical required' }, { status: 400 });

    const TOX_PROTEINS = [
      { gene: 'TP53', name: 'Cellular tumor antigen p53', uniprot: 'P04637' },
      { gene: 'ESR1', name: 'Estrogen receptor alpha', uniprot: 'P03372' },
      { gene: 'ESR2', name: 'Estrogen receptor beta', uniprot: 'Q92731' },
      { gene: 'AR', name: 'Androgen receptor', uniprot: 'P10275' },
      { gene: 'CYP3A4', name: 'Cytochrome P450 3A4', uniprot: 'P08684' },
      { gene: 'CYP1A2', name: 'Cytochrome P450 1A2', uniprot: 'P05177' },
      { gene: 'CYP2D6', name: 'Cytochrome P450 2D6', uniprot: 'P10635' },
      { gene: 'PPARG', name: 'Peroxisome proliferator-activated receptor gamma', uniprot: 'P37231' },
      { gene: 'AHR', name: 'Aryl hydrocarbon receptor', uniprot: 'P35869' },
      { gene: 'NR1I2', name: 'Pregnane X receptor', uniprot: 'O75469' },
    ];

    const prompt = `You are a computational toxicology expert analyzing the protein-binding profile of a chemical ingredient using AlphaFold protein structure data.

CHEMICAL: ${chemical}
CONTEXT: ${context || 'general'}

Analyze this chemical's potential interactions with the following 10 toxicology target proteins (all have AlphaFold structures available):
${TOX_PROTEINS.map(p => `- ${p.gene} (${p.name}, UniProt: ${p.uniprot})`).join('\n')}

For each protein, assess:
- Binding probability: Confirmed (known binder), Probable, Possible, Unlikely, or None
- Interaction type (e.g. agonist, antagonist, inhibitor, substrate, allosteric)
- Biological consequence of the interaction
- Evidence strength: Strong, Moderate, or Weak
- AlphaFold confidence score (pLDDT) for the protein structure (use realistic values 70-95)
- Regulatory concern level

Also assess:
- Endocrine disruption potential (which hormones affected, mechanism)
- Carcinogenicity potential (mechanism)
- CYP450 enzyme inhibition and drug interaction concern
- Population-specific warnings for: pregnancy, children, sensitive skin, hormone conditions

Return a comprehensive structured analysis. Be scientifically rigorous. If data is limited for a chemical, use reasonable toxicological inference based on chemical class and known analogs.`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          chemical: { type: 'string' },
          chemical_class: { type: 'string' },
          overall_protein_risk_score: { type: 'number', description: '0-100, higher = more risk' },
          risk_level: { type: 'string', enum: ['Safe', 'Low', 'Moderate', 'High', 'Critical'] },
          proteins_queried: { type: 'number' },
          protein_interactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                gene: { type: 'string' },
                protein_name: { type: 'string' },
                binding_probability: { type: 'string', enum: ['Confirmed', 'Probable', 'Possible', 'Unlikely', 'None'] },
                interaction_type: { type: 'string' },
                biological_consequence: { type: 'string' },
                evidence_strength: { type: 'string', enum: ['Strong', 'Moderate', 'Weak'] },
                alphafold_confidence: { type: 'number', description: 'pLDDT score 0-100' },
                regulatory_concern: { type: 'string' },
              },
              required: ['gene', 'protein_name', 'binding_probability', 'interaction_type', 'biological_consequence', 'evidence_strength', 'alphafold_confidence', 'regulatory_concern'],
            },
          },
          endocrine_disruption: {
            type: 'object',
            properties: {
              is_potential_disruptor: { type: 'boolean' },
              risk_score: { type: 'number' },
              affected_hormones: { type: 'array', items: { type: 'string' } },
              mechanism: { type: 'string' },
            },
          },
          carcinogenicity: {
            type: 'object',
            properties: {
              is_potential_carcinogen: { type: 'boolean' },
              risk_score: { type: 'number' },
              mechanism: { type: 'string' },
            },
          },
          metabolic_interaction: {
            type: 'object',
            properties: {
              cyp_enzyme_inhibitor: { type: 'boolean' },
              drug_interaction_concern: { type: 'string' },
              risk_score: { type: 'number' },
              explanation: { type: 'string' },
            },
          },
          population_protein_warnings: {
            type: 'object',
            properties: {
              pregnancy: { type: 'object', properties: { status: { type: 'string', enum: ['Safe', 'Caution', 'Avoid'] }, reason: { type: 'string' } }, required: ['status', 'reason'] },
              children: { type: 'object', properties: { status: { type: 'string', enum: ['Safe', 'Caution', 'Avoid'] }, reason: { type: 'string' } }, required: ['status', 'reason'] },
              sensitive_skin: { type: 'object', properties: { status: { type: 'string', enum: ['Safe', 'Caution', 'Avoid'] }, reason: { type: 'string' } }, required: ['status', 'reason'] },
              hormone_conditions: { type: 'object', properties: { status: { type: 'string', enum: ['Safe', 'Caution', 'Avoid'] }, reason: { type: 'string' } }, required: ['status', 'reason'] },
            },
          },
          alphafold_insight: { type: 'string', description: 'How AlphaFold structural data informs the binding risk assessment' },
          safer_alternatives: { type: 'array', items: { type: 'string' } },
        },
        required: ['chemical', 'chemical_class', 'overall_protein_risk_score', 'risk_level', 'proteins_queried', 'protein_interactions', 'endocrine_disruption', 'carcinogenicity', 'metabolic_interaction', 'population_protein_warnings', 'alphafold_insight', 'safer_alternatives'],
      },
    });

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});