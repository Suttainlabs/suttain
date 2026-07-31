import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

async function pubchemLookup(query) {
  const isSmiles = /[()=#\[\]\\]/.test(query) || /^\d+$/.test(query) === false && query.length > 30;
  const baseUrl = isSmiles
    ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(query)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount/JSON`
    : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount/JSON`;
  const res = await fetch(baseUrl);
  if (!res.ok) throw new Error(`PubChem lookup failed (${res.status})`);
  const data = await res.json();
  const props = data?.PropertyTable?.Properties?.[0];
  if (!props) throw new Error('No compound found.');
  const cid = props.CID;
  const structure_image = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG`;
  return { cid, properties: props, structure_image };
}

async function chemblLookup(query) {
  const url = `https://www.ebi.ac.uk/chembl/api/data/molecule/${encodeURIComponent(query)}.json`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    const searchUrl = `https://www.ebi.ac.uk/chembl/api/data/molecule/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error(`ChEMBL lookup failed (${res.status})`);
    const searchData = await searchRes.json();
    const hit = searchData?.molecules?.[0];
    if (!hit) throw new Error('No ChEMBL entry found.');
    return {
      chembl_id: hit.molecule_chembl_id,
      preferred_name: hit.pref_name || 'N/A',
      max_phase: hit.max_phase || 0,
      molecule_type: hit.molecule_type || 'N/A'
    };
  }
  const data = await res.json();
  return {
    chembl_id: data.molecule_chembl_id,
    preferred_name: data.pref_name || 'N/A',
    max_phase: data.max_phase || 0,
    molecule_type: data.molecule_type || 'N/A'
  };
}

async function rcsbLookup(query) {
  const pdbId = query.toUpperCase().trim();
  const url = `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`RCSB lookup failed (${res.status}) for PDB ID: ${pdbId}`);
  const data = await res.json();
  const title = data.struct?.title || 'N/A';
  const methods = data?.exptl?.map(e => e.method) || [];
  const resolution = data?.rcsb_entry_info?.resolution_combined?.[0] || null;
  const download_url = `https://files.rcsb.org/download/${pdbId}.pdb`;
  return { pdb_id: pdbId, title, method: methods.join(', ') || 'N/A', resolution, download_url };
}

async function alphafoldLookup(query) {
  const accession = query.toUpperCase().trim();
  const url = `https://alphafold.ebi.ac.uk/api/prediction/${accession}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Suttain-Research-Platform/1.0 (contact@suttain.com)',
    },
  });
  if (!res.ok) {
    const msg = res.status === 404
      ? `No AlphaFold prediction found for UniProt ${accession}. Verify the accession is correct.`
      : res.status === 403
        ? `AlphaFold DB is temporarily blocking requests. Please try again in a moment.`
        : `AlphaFold lookup failed (${res.status}) for UniProt: ${accession}`;
    throw new Error(msg);
  }
  const data = await res.json();
  const entry = Array.isArray(data) ? data[0] : data;
  return {
    uniprot_accession: entry.uniprotAccession || accession,
    gene: entry.gene || 'N/A',
    organism: entry.organismScientificName || 'N/A',
    model_version: entry.latestVersion || entry.modelVersion || 'N/A',
    pdb_download_url: entry.pdbUrl || null,
    cif_download_url: entry.amAnnotationCifUrl || entry.cifUrl || null
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { source, query } = body;
    if (!source || !query) return Response.json({ error: 'source and query are required' }, { status: 400 });

    let result;
    if (source === 'pubchem') result = await pubchemLookup(query);
    else if (source === 'chembl') result = await chemblLookup(query);
    else if (source === 'rcsb') result = await rcsbLookup(query);
    else if (source === 'alphafold') result = await alphafoldLookup(query);
    else return Response.json({ error: `Unknown source: ${source}` }, { status: 400 });

    return Response.json({ source, query, ...result });
  } catch (error) {
    // Return 200 with error body so the frontend can surface a friendly message
    // instead of a generic "Request failed with status code 500".
    return Response.json({ error: error.message }, { status: 200 });
  }
});