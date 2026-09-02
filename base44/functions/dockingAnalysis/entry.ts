import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { fetchWithRetry, authGuard } from "../../shared/researchFetch.ts";

// Suttain Research: docking and binding analysis.
// Hybrid pipeline:
//   1. Receptor context enrichment (UniProt -> AlphaFold metadata, PDB ID -> RCSB).
//   2. LLM-guided binding pose prediction (an approximation of physics-based docking,
//      run via InvokeLLM because AutoDock Vina / DiffDock / GNINA cannot run here).
// Results carry an honesty note and cite the reference open-source methods.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await authGuard(base44);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { receptor, receptorType, ligand, ligandType, numPoses } = body;
    if (!receptor || !ligand) return Response.json({ error: "Both a receptor and a ligand are required." }, { status: 400 });

    const n = Math.min(Math.max(parseInt(numPoses) || 3, 1), 5);

    // Enrich receptor context.
    let receptorContext = receptor;
    let receptorPdbUrl = null;
    const rType = receptorType || "name";
    if (rType === "uniprot") {
      const u = receptor.trim().toUpperCase();
      try {
        const res = await fetchWithRetry(`https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(u)}`, { headers: { Accept: "application/json" } });
        if (res.ok) {
          const d = await res.json();
          const pred = Array.isArray(d) ? d[0] : d;
          receptorContext = `${u} - ${pred?.uniprotDescription || "AlphaFold structure"}`;
          receptorPdbUrl = pred?.pdbUrl || `https://alphafold.ebi.ac.uk/entry/${u}/AF-${u}-F1-model_v4.pdb`;
        }
      } catch {}
    } else if (rType === "pdb") {
      const p = receptor.trim().toUpperCase();
      receptorPdbUrl = `https://files.rcsb.org/download/${p}.pdb`;
      receptorContext = `RCSB PDB ${p}`;
    }

    const prompt = `You are a computational docking assistant on the Suttain Research platform. Predict ${n} ranked binding pose(s) for the ligand against the receptor below.

RECEPTOR: ${receptor}
RECEPTOR TYPE: ${rType}
RECEPTOR CONTEXT: ${receptorContext}
LIGAND: ${ligand}
LIGAND TYPE: ${ligandType || "smiles"}

For each pose produce:
- pose_id (P1, P2, ...)
- predicted_affinity: high, moderate, or low
- docking_score: a realistic binding free energy in kcal/mol (more negative is stronger, range -12 to -2)
- binding_site_residues: comma-separated residues (e.g. "ASP42, GLU45, LYS50")
- key_interactions: hydrogen bond, hydrophobic, pi-stacking, ionic, etc.
- confidence: high, medium, or low
- rationale: a short explanation

Be scientifically grounded. If the receptor is a known protein with a characterized binding pocket, use it. Do not fabricate exact atomic coordinates. State clearly this is an LLM-guided estimate, not output from AutoDock Vina, DiffDock, or GNINA.`;

    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          poses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pose_id: { type: "string" },
                predicted_affinity: { type: "string", enum: ["high", "moderate", "low"] },
                docking_score: { type: "number" },
                binding_site_residues: { type: "string" },
                key_interactions: { type: "string" },
                confidence: { type: "string", enum: ["high", "medium", "low"] },
                rationale: { type: "string" },
              },
              required: ["pose_id", "predicted_affinity", "docking_score", "binding_site_residues", "key_interactions", "confidence", "rationale"],
            },
          },
          summary: { type: "string" },
        },
        required: ["poses", "summary"],
      },
    });

    return Response.json({
      source: "Suttain LLM-guided docking analysis",
      method: "LLM-guided binding pose prediction",
      receptor,
      ligand,
      receptorType: rType,
      ligandType: ligandType || "smiles",
      receptorContext,
      receptorPdbUrl,
      poses: llmRes.poses || [],
      summary: llmRes.summary,
      honestyNote: "Binding poses are predicted by an LLM using receptor and ligand context, not by AutoDock Vina, DiffDock, or GNINA. Docking scores are estimates, not physics-based. Treat as hypotheses for experimental or physics-based validation.",
      citations: [
        { method: "AutoDock Vina", url: "https://vina.scripps.edu", note: "Reference physics-based docking engine (not executed here)" },
        { method: "DiffDock", url: "https://github.com/gcorso/DiffDock", note: "Reference diffusion-based docking model (not executed here)" },
        { method: "GNINA", url: "https://gnina.github.io", note: "Reference CNN-scored docking engine (not executed here)" },
      ],
    });
  } catch (error) {
    console.log(`[dockingAnalysis] ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
}