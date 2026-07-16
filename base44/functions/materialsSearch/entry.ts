import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user;
    try {
      user = await base44.auth.me();
    } catch (authErr) {
      return Response.json({ error: 'Authentication required. Please log in and try again.' }, { status: 401 });
    }
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { formula, elements, property_filter } = body;

    // Get user's Materials Project API key
    let mpApiKey = null;
    try {
      const settings = await base44.entities.MaterialsSetting.list();
      if (settings && settings.length > 0) {
        mpApiKey = settings[0].materials_project_api_key;
      }
    } catch (e) {
      console.error('Failed to load materials settings:', e);
    }

    const results = [];
    const sourcesQueried = [];

    // 1. Query Materials Project if key available
    if (mpApiKey) {
      try {
        let mpUrl = 'https://api.materialsproject.org/materials/summary?_limit=10&_fields=material_id,formula_pretty,formation_energy_per_atom,band_gap,density,symmetry,is_stable';
        if (formula) {
          mpUrl += `&formula=${encodeURIComponent(formula)}`;
        } else if (elements) {
          const elemList = elements.split(',').map(e => e.trim()).filter(Boolean);
          mpUrl += `&elements=${encodeURIComponent(elemList.join(','))}`;
        }
        const mpRes = await fetch(mpUrl, {
          headers: { 'x-api-key': mpApiKey }
        });
        if (mpRes.ok) {
          const mpData = await mpRes.json();
          const mats = mpData.data || mpData.materials || [];
          for (const mat of mats) {
            results.push({
              source: 'Materials Project',
              material_id: mat.material_id,
              formula: mat.formula_pretty,
              formation_energy_per_atom: mat.formation_energy_per_atom,
              band_gap: mat.band_gap,
              density: mat.density,
              crystal_system: mat.symmetry?.crystal_system,
              spacegroup: mat.symmetry?.symbol,
              is_stable: mat.is_stable,
            });
          }
          sourcesQueried.push('Materials Project');
        } else {
          console.error('MP API error status:', mpRes.status);
        }
      } catch (e) {
        console.error('MP query failed:', e.message);
      }
    }

    // 2. Query OPTIMADE public providers (no key needed)
    const optimadeProviders = [
      { name: 'COD', url: 'https://www.crystallography.net/cod/optimade/v1/structures' },
      { name: 'Materials Cloud', url: 'https://aiida.materialscloud.org/optimade/v1/structures' },
    ];

    for (const provider of optimadeProviders) {
      if (results.length >= 10) break;
      try {
        let odUrl = `${provider.url}?page_limit=5`;
        if (formula) {
          odUrl += `&filter=${encodeURIComponent(`chemical_formula_descriptive CONTAINS "${formula}"`)}`;
        }
        const odRes = await fetch(odUrl);
        if (odRes.ok) {
          const odData = await odRes.json();
          for (const mat of (odData.data || [])) {
            if (results.length >= 10) break;
            results.push({
              source: `${provider.name} (OPTIMADE)`,
              material_id: String(mat.id),
              formula: mat.attributes?.chemical_formula_descriptive || mat.attributes?.chemical_formula_anonymous || 'Unknown',
              nelements: mat.attributes?.nelements,
              elements: mat.attributes?.elements,
            });
          }
          sourcesQueried.push(`${provider.name} (OPTIMADE)`);
        }
      } catch (e) {
        console.error(`${provider.name} OPTIMADE query failed:`, e.message);
      }
    }

    // 3. If no results from live APIs, use InvokeLLM with web search as fallback
    if (results.length === 0) {
      const searchQuery = formula || elements || '';
      try {
        const llmResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Search for real materials data for: ${searchQuery}. Return real materials from Materials Project, AFLOW, or OPTIMADE databases. For each material include: source database name, formula, formation_energy_per_atom (eV/atom), band_gap (eV), density (g/cm3), crystal_system, and a plain_language explanation of what the material is and its key properties for a student. Return 5-8 materials.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              materials: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    source: { type: "string" },
                    formula: { type: "string" },
                    formation_energy_per_atom: { type: "number" },
                    band_gap: { type: "number" },
                    density: { type: "number" },
                    crystal_system: { type: "string" },
                    plain_language: { type: "string" }
                  }
                }
              }
            }
          }
        });
        for (const mat of (llmResponse.materials || [])) {
          results.push({
            source: mat.source || 'Materials Project (web search)',
            ...mat
          });
        }
        sourcesQueried.push('Web search fallback');
      } catch (e) {
        console.error('LLM fallback failed:', e.message);
      }
    }

    // 4. Add plain language explanations using LLM if not present
    const needsExplanation = results.filter(r => !r.plain_language);
    if (needsExplanation.length > 0) {
      try {
        const explainResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `For each material, write a brief plain-language explanation (1-2 sentences) of what it is and what its key properties mean, suitable for a student. Materials: ${JSON.stringify(needsExplanation.map(r => ({ formula: r.formula, band_gap: r.band_gap, formation_energy: r.formation_energy_per_atom, crystal_system: r.crystal_system })))}`,
          response_json_schema: {
            type: "object",
            properties: {
              explanations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    formula: { type: "string" },
                    plain_language: { type: "string" }
                  }
                }
              }
            }
          }
        });
        const explanations = explainResponse.explanations || [];
        for (const r of results) {
          if (!r.plain_language) {
            const exp = explanations.find(e => e.formula === r.formula);
            if (exp) r.plain_language = exp.plain_language;
          }
        }
      } catch (e) {
        console.error('Failed to add explanations:', e.message);
      }
    }

    // 5. Apply property filter if specified
    let filteredResults = results;
    if (property_filter && property_filter !== 'None') {
      filteredResults = results.filter(r => {
        if (property_filter === 'Semiconductors (band gap 0.1-3 eV)') {
          return typeof r.band_gap === 'number' && r.band_gap > 0.1 && r.band_gap < 3;
        }
        if (property_filter === 'Insulators (band gap > 3 eV)') {
          return typeof r.band_gap === 'number' && r.band_gap > 3;
        }
        if (property_filter === 'Metals (band gap = 0)') {
          return typeof r.band_gap === 'number' && r.band_gap === 0;
        }
        if (property_filter === 'Stable materials (on hull)') {
          return r.is_stable === true;
        }
        return true;
      });
    }

    return Response.json({
      results: filteredResults,
      total_count: filteredResults.length,
      has_mp_key: !!mpApiKey,
      sources_queried: sourcesQueried,
      method_note: sourcesQueried.some(s => s.includes('Web search'))
        ? 'Web search fallback — add a Materials Project API key for live database queries'
        : `Live API queries to ${sourcesQueried.join(', ')}`,
      query: { formula, elements, property_filter }
    });
  } catch (error) {
    console.error('materialsSearch error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});