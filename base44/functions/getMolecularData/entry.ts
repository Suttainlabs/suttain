import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function fetchPubChemCompound(query, type) {
  try {
    const namespace = type === 'smiles' ? 'smiles' : type === 'inchi' ? 'inchi' : 'name';
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/${namespace}/${encodeURIComponent(query)}/JSON`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.PC_Compounds?.[0] || null;
  } catch { return null; }
}

async function fetchPubChemProperties(cid) {
  try {
    const props = 'MolecularFormula,MolecularWeight,CanonicalSMILES,IsomericSMILES,IUPACName,InChI,InChIKey,XLogP,HBondDonorCount,HBondAcceptorCount,TPSA,HeavyAtomCount,Complexity';
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/${props}/JSON`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.PropertyTable?.Properties?.[0] || null;
  } catch { return null; }
}

async function fetchPubChemSynonyms(cid) {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return { synonyms: [], cas: null };
    const data = await res.json();
    const all = data?.InformationList?.Information?.[0]?.Synonym || [];
    const cas = all.filter(s => /^\d{2,7}-\d{2}-\d$/.test(s));
    return { synonyms: all.slice(0, 8), cas: cas[0] || null };
  } catch { return { synonyms: [], cas: null }; }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, queryType = 'name', mode = 'full' } = await req.json();
    if (!query?.trim()) return Response.json({ error: 'query is required' }, { status: 400 });

    console.log(`[getMolecularData] query="${query}" type=${queryType} mode=${mode}`);

    // ── PubChem lookup ─────────────────────────────────────────────────────────
    const compound = await fetchPubChemCompound(query.trim(), queryType);
    let properties = null;
    let synonymInfo = { synonyms: [], cas: null };

    if (compound?.id?.id?.cid) {
      [properties, synonymInfo] = await Promise.all([
        fetchPubChemProperties(compound.id.id.cid),
        fetchPubChemSynonyms(compound.id.id.cid)
      ]);
    }

    const pubchemData = properties ? {
      cid: properties.CID,
      molecular_formula: properties.MolecularFormula,
      molecular_weight: properties.MolecularWeight,
      iupac_name: properties.IUPACName,
      canonical_smiles: properties.CanonicalSMILES,
      isomeric_smiles: properties.IsomericSMILES,
      inchi: properties.InChI,
      inchi_key: properties.InChIKey,
      xlogp: properties.XLogP,
      hbd_count: properties.HBondDonorCount,
      hba_count: properties.HBondAcceptorCount,
      tpsa: properties.TPSA,
      heavy_atom_count: properties.HeavyAtomCount,
      complexity: properties.Complexity,
      cas_number: synonymInfo.cas,
      synonyms: synonymInfo.synonyms,
      data_found: true
    } : { data_found: false, query: query.trim() };

    // Quick mode: return PubChem data immediately, no LLM
    if (mode === 'quick') {
      return Response.json({ pubchem: pubchemData, analysis: null, query: query.trim(), query_type: queryType });
    }

    // ── LLM hazard analysis ────────────────────────────────────────────────────
    const prompt = `You are a senior toxicologist and regulatory chemist. Produce a rigorous, citation-ready hazard and regulatory assessment.

QUERY: "${query.trim()}" (input type: ${queryType})

${pubchemData.data_found ? `PUBCHEM VERIFIED DATA:
CID: ${pubchemData.cid} | Formula: ${pubchemData.molecular_formula} | MW: ${pubchemData.molecular_weight} g/mol
IUPAC: ${pubchemData.iupac_name} | CAS: ${pubchemData.cas_number || 'unknown'}
XLogP: ${pubchemData.xlogp} | HBD: ${pubchemData.hbd_count} | HBA: ${pubchemData.hba_count} | TPSA: ${pubchemData.tpsa}` : 
'No PubChem data found, use your best scientific knowledge.'}

Return ONLY valid JSON matching this schema (no markdown):
{
  "compound_name": "string",
  "cas_number": "string or null",
  "hazard_classification": {
    "ghs_classes": ["string"],
    "signal_word": "Danger or Warning or None",
    "overall_hazard_score": 0,
    "confidence_score": 0,
    "source": "string"
  },
  "toxicity_profile": {
    "acute": { "ld50_oral": "string", "ld50_dermal": "string", "lc50_inhalation": "string", "classification": "string", "confidence": 0, "source": "string" },
    "chronic": { "assessment": "string", "confidence": 0, "source": "string" },
    "carcinogenicity": { "iarc_group": "string", "ntp_classification": "string", "assessment": "string", "confidence": 0, "source": "string" },
    "endocrine_disruption": { "status": "string", "mechanism": "string or null", "confidence": 0, "source": "string" },
    "reproductive_toxicity": { "classification": "string", "confidence": 0, "source": "string" }
  },
  "bioavailability": { "oral_estimate_percent": 0, "dermal_estimate_percent": 0, "primary_route": "string", "notes": "string", "confidence": 0, "source": "string" },
  "environmental_fate": {
    "biodegradability": { "classification": "string", "half_life_days": null, "confidence": 0 },
    "aquatic_toxicity": { "fish_lc50": "string", "classification": "string", "confidence": 0 },
    "atmospheric_persistence": { "half_life": "string", "classification": "string", "confidence": 0 },
    "soil_adsorption": { "koc": null, "classification": "string" },
    "source": "string"
  },
  "regulatory_status": {
    "fda": { "status": "string", "notes": "string" },
    "epa": { "status": "string", "list": "string", "notes": "string" },
    "reach": { "status": "string", "svhc": false, "notes": "string" },
    "eu_green_claims": { "compliant": true, "notes": "string" },
    "safe_concentration_range": { "value": "string", "units": "string", "application": "string", "source": "string" }
  },
  "safer_alternatives": [
    { "name": "string", "comparison_score": 0, "reason": "string", "cas_number": "string or null" }
  ],
  "key_citations": ["APA citation string"],
  "confidence_overall": 0,
  "data_gaps": ["string"]
}`;

    let analysis = {};
    try {
      const rawAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_sonnet_4_6'
      });

      if (typeof rawAnalysis === 'string') {
        const match = rawAnalysis.match(/\{[\s\S]*\}/);
        if (match) { try { analysis = JSON.parse(match[0]); } catch { analysis = {}; } }
      } else if (rawAnalysis && typeof rawAnalysis === 'object') {
        analysis = rawAnalysis;
      }
    } catch (llmErr) {
      console.error('[getMolecularData] LLM error:', llmErr.message);
    }

    console.log(`[getMolecularData] done: ${analysis?.compound_name}, hazard=${analysis?.hazard_classification?.overall_hazard_score}`);

    return Response.json({
      pubchem: pubchemData,
      analysis,
      query: query.trim(),
      query_type: queryType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[getMolecularData] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});