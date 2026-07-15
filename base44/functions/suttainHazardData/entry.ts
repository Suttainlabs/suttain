import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

async function pubchemIdentity(query) {
  const isCas = /^\d{2,7}-\d{2}-\d$/.test(query.trim());
  const isSmiles = /[()=#\[\]\\]/.test(query);
  let url;
  if (isSmiles) {
    url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(query)}/property/Title,MolecularFormula,MolecularWeight,CanonicalSMILES,CID,IUPACName/JSON`;
  } else {
    url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/Title,MolecularFormula,MolecularWeight,CanonicalSMILES,CID,IUPACName/JSON`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PubChem lookup failed (${res.status})`);
  const data = await res.json();
  const props = data?.PropertyTable?.Properties?.[0];
  if (!props) throw new Error('No compound found.');
  return {
    preferred_name: props.Title || props.IUPACName || query,
    cas_number: isCas ? query.trim() : null,
    molecular_formula: props.MolecularFormula,
    molecular_weight: props.MolecularWeight,
    smiles: props.CanonicalSMILES,
    cid: props.CID,
    pubchem_url: `https://pubchem.ncbi.nlm.nih.gov/compound/${props.CID}`
  };
}

async function epaCompToxSearch(query) {
  try {
    const url = `https://comptox.epa.gov/dashboard-api/ccdapp2/chemical/search/equal/${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    const hit = Array.isArray(data) ? data[0] : (data?.results?.[0] || data);
    if (!hit) return null;
    return {
      dtxsid: hit.dtxsid || hit.DTXSID || null,
      cas_number: hit.casrn || hit.casNumber || null,
      preferred_name: hit.name || hit.preferredName || null,
      dashboard_url: hit.dtxsid ? `https://comptox.epa.gov/dashboard/chemical/details/${hit.dtxsid}` : null
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { query } = body;
    if (!query) return Response.json({ error: 'query is required' }, { status: 400 });

    const [pubchem, epa] = await Promise.all([
      pubchemIdentity(query).catch(() => null),
      epaCompToxSearch(query).catch(() => null)
    ]);

    if (!pubchem && !epa) {
      return Response.json({ error: `No chemical identity data found for: ${query}` }, { status: 404 });
    }

    return Response.json({
      source: 'EPA CompTox + PubChem',
      query,
      preferred_name: epa?.preferred_name || pubchem?.preferred_name || query,
      dtxsid: epa?.dtxsid || null,
      cas_number: epa?.cas_number || pubchem?.cas_number || null,
      molecular_formula: pubchem?.molecular_formula || null,
      molecular_weight: pubchem?.molecular_weight || null,
      smiles: pubchem?.smiles || null,
      cid: pubchem?.cid || null,
      dashboard_url: epa?.dashboard_url || (pubchem?.cid ? pubchem.pubchem_url : null)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});