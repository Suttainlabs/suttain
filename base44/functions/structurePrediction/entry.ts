import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { fetchWithRetry, meanPlddtFromPdb, authGuard } from "../../shared/researchFetch.ts";

// Suttain Research: protein structure prediction.
// Hybrid execution:
//   - UniProt accession -> AlphaFold Database (EBI) retrieval
//   - Raw amino acid sequence -> ESMFold via the ESM Atlas public API
// All external calls go through the shared retry + SSRF-safe fetch helpers.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await authGuard(base44);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { input, inputType } = body;
    if (!input) return Response.json({ error: "input required" }, { status: 400 });

    // ── UniProt accession -> AlphaFold Database ──
    if (inputType === "uniprot") {
      const uniprotId = input.trim().toUpperCase();
      const url = `https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(uniprotId)}`;
      const res = await fetchWithRetry(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        return Response.json({ error: e.error || `AlphaFold lookup failed (${res.status}). Verify the UniProt accession.` }, { status: 200 });
      }
      const data = await res.json();
      const pred = Array.isArray(data) ? data[0] : data;
      if (!pred) return Response.json({ error: "No AlphaFold prediction found for this UniProt ID." }, { status: 200 });
      const plddt = pred.globalMetricValue != null ? Math.round(parseFloat(pred.globalMetricValue)) : null;
      return Response.json({
        source: "AlphaFold Database (EBI)",
        method: "AlphaFold v4",
        uniprotId,
        uniprotDescription: pred.uniprotDescription || null,
        pdbUrl: pred.pdbUrl || `https://alphafold.ebi.ac.uk/entry/${uniprotId}/AF-${uniprotId}-F1-model_v4.pdb`,
        plddt,
        confidence: plddt,
        honestyNote: "Structure retrieved from the AlphaFold Protein Structure Database (CC BY 4.0, DeepMind and EMBL-EBI).",
      });
    }

    // ── Raw amino acid sequence -> ESMFold (ESM Atlas) ──
    const sequence = input.trim().toUpperCase();
    if (!/^[A-Z]+$/.test(sequence) || sequence.length < 10) {
      return Response.json({ error: "Enter a valid amino acid sequence (single-letter codes, minimum 10 residues)." }, { status: 400 });
    }
    if (sequence.length > 1000) {
      return Response.json({ error: "Sequence exceeds 1000 residues for ESMFold prediction. Use a UniProt ID for longer proteins." }, { status: 400 });
    }

    const esmRes = await fetchWithRetry("https://api.esmatlas.com/foldSequence/v1/pdb/", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: sequence,
    });
    if (!esmRes.ok) {
      const errBody = await esmRes.text().catch(() => "");
      return Response.json({ error: `ESMFold prediction failed (${esmRes.status}). ${errBody.slice(0, 200)}` }, { status: 200 });
    }
    const pdbText = await esmRes.text();
    const plddt = meanPlddtFromPdb(pdbText);

    return Response.json({
      source: "ESMFold (ESM Atlas)",
      method: "ESMFold",
      sequence,
      pdbText,
      plddt,
      confidence: plddt != null ? Math.round(plddt) : null,
      honestyNote: "Structure predicted by ESMFold via the ESM Atlas public API. Per-residue confidence (pLDDT) is parsed from B-factor columns of the returned PDB.",
    });
  } catch (error) {
    console.log(`[structurePrediction] ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
}