import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { fetchWithRetry, meanPlddtFromPdb, authGuard } from "../../shared/researchFetch.ts";

// Suttain Research: de novo binder and antibody design.
// Hybrid pipeline:
//   1. LLM-guided candidate sequence generation (an approximation of ProteinMPNN-style
//      sampling, run via InvokeLLM because the open-source weights cannot run here).
//   2. ESMFold structure prediction for the top-ranked candidate.
//   3. Interface scoring embedded in the LLM output.
// All results carry an honesty note and cite the reference open-source methods.

const UNIPROT_RE = /^[OPQ][0-9][A-Z0-9]{3}[0-9]$|^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await authGuard(base44);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { target, targetName, binderLength, hotspots, optimizeFor, numCandidates } = body;
    if (!target) return Response.json({ error: "A target antigen (UniProt ID, PDB ID, or sequence) is required." }, { status: 400 });

    const n = Math.min(Math.max(parseInt(numCandidates) || 3, 1), 5);
    const length = Math.min(Math.max(parseInt(binderLength) || 80, 30), 150);
    const optLabel =
      optimizeFor === "stability" ? "thermostability and solubility"
      : optimizeFor === "developability" ? "developability and low aggregation"
      : "binding affinity";

    // Enrich target context if a UniProt accession was provided.
    let targetContext = targetName || target;
    if (UNIPROT_RE.test(target.toUpperCase())) {
      try {
        const u = target.toUpperCase();
        const res = await fetchWithRetry(`https://rest.uniprot.org/uniprotkb/${u}.json`, { headers: { Accept: "application/json" } });
        if (res.ok) {
          const d = await res.json();
          targetContext = d?.proteinDescription?.recommendedName?.fullName?.value || targetName || u;
        }
      } catch {}
    }

    const prompt = `You are a computational protein design assistant on the Suttain Research platform. Design ${n} de novo mini-protein binder candidate(s) against the antigen below.

TARGET ANTIGEN: ${target}
TARGET CONTEXT: ${targetContext}
BINDER LENGTH: ${length} residues
HOTSPOT RESIDUES: ${hotspots || "not specified"}
OPTIMIZE FOR: ${optLabel}

For each candidate binder produce:
- candidate_id (B1, B2, ...)
- A full amino acid sequence of exactly ${length} residues using only valid single-letter codes (ARNDCQEGHILKMFPSTWYV)
- A short rationale (1-2 sentences) explaining the design strategy
- predicted_affinity: high, moderate, or low
- interface_score: 0-100 (higher is better)
- aggregation_risk: low, medium, or high
- solubility: low, medium, or high
- stability: low, medium, or high

Be scientifically grounded. If the target is a known protein, leverage characterized binding interfaces. Generate novel sequences, do not copy existing drug or antibody sequences. State clearly that this is an LLM-guided approximation, not output from ProteinMPNN or RFdiffusion.`;

    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          candidates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                candidate_id: { type: "string" },
                sequence: { type: "string" },
                rationale: { type: "string" },
                predicted_affinity: { type: "string", enum: ["high", "moderate", "low"] },
                interface_score: { type: "number" },
                aggregation_risk: { type: "string", enum: ["low", "medium", "high"] },
                solubility: { type: "string", enum: ["low", "medium", "high"] },
                stability: { type: "string", enum: ["low", "medium", "high"] },
              },
              required: ["candidate_id", "sequence", "rationale", "predicted_affinity", "interface_score", "aggregation_risk", "solubility", "stability"],
            },
          },
          design_summary: { type: "string" },
        },
        required: ["candidates", "design_summary"],
      },
    });

    const ranked = [...(llmRes.candidates || [])].sort((a, b) => (b.interface_score || 0) - (a.interface_score || 0));

    // Predict the structure of the top candidate via ESMFold.
    let topStructure = null;
    if (ranked.length > 0 && ranked[0].sequence) {
      const seq = ranked[0].sequence.toUpperCase().slice(0, 1000);
      try {
        const esmRes = await fetchWithRetry("https://api.esmatlas.com/foldSequence/v1/pdb/", {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: seq,
        });
        if (esmRes.ok) {
          const pdbText = await esmRes.text();
          topStructure = { candidate_id: ranked[0].candidate_id, pdbText, plddt: meanPlddtFromPdb(pdbText), sequence: seq };
        }
      } catch (e) {
        console.log(`[binderDesign] ESMFold structure prediction skipped: ${e.message}`);
      }
    }

    return Response.json({
      source: "Suttain LLM-guided binder design",
      method: "LLM-guided sequence design + ESMFold structure",
      target,
      targetContext,
      candidates: ranked,
      designSummary: llmRes.design_summary,
      topStructure,
      honestyNote: "Candidate sequences are generated by an LLM guided by protein design principles, not by ProteinMPNN or RFdiffusion. The structure of the top candidate is predicted by ESMFold. Treat results as hypotheses requiring experimental validation.",
      citations: [
        { method: "ProteinMPNN", url: "https://github.com/dauparas/ProteinMPNN", note: "Reference sequence-design method (not executed here)" },
        { method: "RFdiffusion", url: "https://github.com/RosettaCommons/RFdiffusion", note: "Reference binder-hallucination method (not executed here)" },
        { method: "ESMFold", url: "https://esmatlas.com", note: "Used for top-candidate structure prediction" },
      ],
    });
  } catch (error) {
    console.log(`[binderDesign] ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
}