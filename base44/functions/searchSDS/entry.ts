import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query } = await req.json();

    if (!query || !query.trim()) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // 1. Search PubChem for matching compounds by name
    const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query.trim())}/cids/JSON?name_type=word&MaxRecords=20`;
    const searchRes = await fetch(searchUrl);

    if (!searchRes.ok) {
      // Try autocomplete as fallback
      const autoUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(query.trim())}/JSON?limit=10`;
      const autoRes = await fetch(autoUrl);
      if (autoRes.ok) {
        const autoData = await autoRes.json();
        const suggestions = autoData?.dictionary_terms?.compound || [];
        return Response.json({ results: [], suggestions });
      }
      return Response.json({ results: [], suggestions: [] });
    }

    const searchData = await searchRes.json();
    const cids = (searchData?.IdentifierList?.CID || []).slice(0, 8);

    if (cids.length === 0) {
      return Response.json({ results: [], suggestions: [] });
    }

    // 2. Fetch properties for each CID in bulk
    const propsUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cids.join(',')}/property/IUPACName,MolecularFormula,MolecularWeight,InChIKey/JSON`;
    const propsRes = await fetch(propsUrl);
    const propsData = propsRes.ok ? await propsRes.json() : { PropertyTable: { Properties: [] } };
    const properties = propsData?.PropertyTable?.Properties || [];

    // 3. Build results with basic info; GHS data fetched on demand
    const results = properties.map(p => ({
      cid: p.CID,
      name: p.IUPACName || `CID ${p.CID}`,
      formula: p.MolecularFormula || '',
      molecular_weight: p.MolecularWeight || null,
      inchikey: p.InChIKey || '',
      pubchem_url: `https://pubchem.ncbi.nlm.nih.gov/compound/${p.CID}`,
    }));

    return Response.json({ results, suggestions: [] });
  } catch (error) {
    console.error('searchSDS error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});