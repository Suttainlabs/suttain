import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { query, formula } = body;
    if (!query && !formula) return Response.json({ error: 'query or formula required' }, { status: 400 });

    const crystal_structures = [];
    let materials_project = null;

    // --- COD OPTIMADE query (no API key needed) ---
    const searchVal = formula || query;
    const filterParam = `chemical_formula_descriptive CONTAINS "${searchVal}"`;
    const optimadeUrl = `https://www.crystallography.net/cod/optimade/v1/structures?filter=${encodeURIComponent(filterParam)}&page_limit=10&response_fields=chemical_formula_descriptive,chemical_formula_anonymous,space_group_symmetry,species,species_at_sites,lattice_vectors,cell_volume,nelements,elements,nperiodic_dimensions`;

    try {
      const codRes = await fetch(optimadeUrl, { headers: { 'Accept': 'application/json' } });
      if (codRes.ok) {
        const codData = await codRes.json();
        const structures = codData?.data || [];
        for (const s of structures) {
          const attrs = s.attributes || {};
          const sg = attrs.space_group_symmetry || {};
          const lv = attrs.lattice_vectors || [];
          // Compute cell parameters from lattice vectors (Angstroms and degrees)
          let cellParams = null;
          if (lv.length === 3 && lv[0].length === 3) {
            const [a, b, c] = lv;
            const len = v => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
            const angle = (u, v) => {
              const lu = len(u), lv2 = len(v);
              if (lu === 0 || lv2 === 0) return 90;
              const cosA = dot(u, v) / (lu * lv2);
              return Math.acos(Math.max(-1, Math.min(1, cosA))) * 180 / Math.PI;
            };
            cellParams = {
              a: len(a),
              b: len(b),
              c: len(c),
              alpha: angle(b, c),
              beta: angle(a, c),
              gamma: angle(a, b)
            };
          }
          crystal_structures.push({
            id: s.id,
            cod_id: s.id,
            formula: attrs.chemical_formula_descriptive || formula || query,
            space_group: sg.space_group_symbol_hall || sg.international_symbol || 'N/A',
            space_group_number: sg.space_group_number || null,
            cell: cellParams,
            volume: attrs.cell_volume || null,
            elements: attrs.elements || [],
            cif_url: `https://www.crystallography.net/cod/${s.id}.cif`,
            reference: attrs.chemical_formula_anonymous || ''
          });
        }
      }
    } catch (codErr) {
      console.log('COD OPTIMADE error:', codErr.message);
    }

    // --- Materials Project query (optional, requires user API key) ---
    let mpApiKey = null;
    try {
      const user = await base44.auth.me();
      if (user) {
        const settings = await base44.entities.MaterialsSetting.filter({ created_by_id: user.id });
        if (settings && settings.length > 0) {
          mpApiKey = settings[0].materials_project_api_key;
        }
      }
    } catch {}

    if (mpApiKey) {
      try {
        const mpFormula = formula || query;
        const mpUrl = `https://api.materialsproject.org/materials/summary/?formula=${encodeURIComponent(mpFormula)}&_fields=material_id,formula_pretty,spacegroup,band_gap,density,energy_above_hull,crystal_system,symmetry&limit=5`;
        const mpRes = await fetch(mpUrl, { headers: { 'X-API-KEY': mpApiKey } });
        if (mpRes.ok) {
          const mpData = await mpRes.json();
          const mpMats = mpData?.data || [];
          if (mpMats.length > 0) {
            const m = mpMats[0];
            materials_project = {
              material_id: m.material_id,
              formula: m.formula_pretty,
              band_gap_eV: m.band_gap,
              density: m.density,
              energy_above_hull: m.energy_above_hull,
              crystal_system: m.crystal_system || m.symmetry?.crystal_system,
              space_group: m.spacegroup?.symbol || m.symmetry?.symbol
            };
          }
        }
      } catch (mpErr) {
        console.log('MP error:', mpErr.message);
      }
    }

    return Response.json({
      source: mpApiKey ? 'COD (OPTIMADE) + Materials Project' : 'COD (OPTIMADE)',
      query: query || formula,
      crystal_structures,
      materials_project
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});