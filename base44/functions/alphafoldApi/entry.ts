import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action, uniprotId, url, gene } = body;

    if (action === 'prediction') {
      if (!uniprotId) return Response.json({ error: 'uniprotId required' }, { status: 400 });
      const res = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(uniprotId)}`);
      if (!res.ok) {
        return Response.json({ error: res.status === 404 ? 'No AlphaFold prediction found for this UniProt ID' : `AlphaFold API error: ${res.status}` }, { status: res.status });
      }
      const data = await res.json();
      // AlphaFold prediction endpoint returns an array — extract first entry
      const prediction = Array.isArray(data) ? data[0] : data;
      if (!prediction) return Response.json({ error: 'No prediction found' }, { status: 404 });
      return Response.json(prediction);
    }

    if (action === 'fetchJson') {
      if (!url) return Response.json({ error: 'url required' }, { status: 400 });
      const res = await fetch(url);
      if (!res.ok) return Response.json({ error: `Fetch error: ${res.status}` }, { status: res.status });
      const data = await res.json();
      return Response.json(data);
    }

    if (action === 'fetchCsv') {
      if (!url) return Response.json({ error: 'url required' }, { status: 400 });
      const res = await fetch(url);
      if (!res.ok) return Response.json({ error: `Fetch error: ${res.status}` }, { status: res.status });
      const text = await res.text();
      return Response.json({ csv: text });
    }

    if (action === 'geneSearch') {
      if (!gene) return Response.json({ error: 'gene required' }, { status: 400 });
      const query = `gene:${encodeURIComponent(gene)}+AND+organism_id:9606+AND+reviewed:true`;
      const res = await fetch(`https://rest.uniprot.org/uniprotkb/search?query=${query}&format=json&size=5&fields=accession,gene_names,protein_name`);
      if (!res.ok) return Response.json({ error: `UniProt search error: ${res.status}` }, { status: res.status });
      const data = await res.json();
      const results = (data.results || []).map(r => ({
        accession: r.primaryAccession,
        gene: r.genes?.[0]?.geneName?.value || gene,
        description: r.proteinDescription?.recommendedName?.fullName?.value || '',
      }));
      return Response.json({ results });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});