// computeXTB — Suttain Computational Studio: REAL GFN2-xTB semi-empirical quantum chemistry.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ROWAN_BASE = "https://api.rowansci.com";
const PC = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const UA = { "User-Agent": "Suttain/1.0 (computeXTB)", Accept: "*/*" };

const SYM_TO_Z: Record<string, number> = {
  H:1,He:2,Li:3,Be:4,B:5,C:6,N:7,O:8,F:9,Ne:10,Na:11,Mg:12,Al:13,Si:14,P:15,S:16,Cl:17,
  Ar:18,K:19,Ca:20,Fe:26,Cu:29,Zn:30,Br:35,I:53,
};
const Z_TO_SYM: Record<number, string> = Object.fromEntries(
  Object.entries(SYM_TO_Z).map(([s, z]) => [z, s]),
);

async function fetch3D(query: string, isSmiles: boolean): Promise<{ atoms: any[]; smiles: string }> {
  const idPath = isSmiles
    ? `compound/smiles/${encodeURIComponent(query)}`
    : `compound/name/${encodeURIComponent(query)}`;
  const cidRes = await fetch(`${PC}/${idPath}/cids/JSON`, { headers: UA });
  if (!cidRes.ok) throw new Error("PubChem CID lookup failed (" + cidRes.status + ") for: " + query);
  const cidJson = await cidRes.json();
  const cid = cidJson?.IdentifierList?.CID?.[0];
  if (!cid) throw new Error("No PubChem compound for: " + query);
  const smiRes = await fetch(`${PC}/compound/cid/${cid}/property/SMILES/JSON`, { headers: UA });
  const smiJson = smiRes.ok ? await smiRes.json() : null;
  const smiles = smiJson?.PropertyTable?.Properties?.[0]?.SMILES
    || smiJson?.PropertyTable?.Properties?.[0]?.CanonicalSMILES || "";
  let sdfRes = await fetch(`${PC}/compound/cid/${cid}/record/SDF?record_type=3d`, { headers: UA });
  if (!sdfRes.ok) sdfRes = await fetch(`${PC}/compound/cid/${cid}/record/SDF?record_type=2d`, { headers: UA });
  if (!sdfRes.ok) throw new Error("PubChem 3D structure fetch failed (" + sdfRes.status + ")");
  const sdf = await sdfRes.text();
  const atoms = parseSdfAtoms(sdf);
  if (!atoms.length) throw new Error("Could not parse any atoms from PubChem structure");
  return { atoms, smiles };
}

function parseSdfAtoms(sdf: string): any[] {
  const lines = sdf.split(/\r?\n/);
  const counts = lines[3] || "";
  const nAtoms = parseInt(counts.slice(0, 3).trim(), 10);
  if (!Number.isFinite(nAtoms) || nAtoms <= 0) return [];
  const atoms: any[] = [];
  for (let i = 0; i < nAtoms; i++) {
    const l = lines[4 + i];
    if (!l) break;
    const x = parseFloat(l.slice(0, 10));
    const y = parseFloat(l.slice(10, 20));
    const z = parseFloat(l.slice(20, 30));
    const sym = l.slice(31, 34).trim();
    const z_ = SYM_TO_Z[sym];
    if (!z_) continue;
    atoms.push({ atomic_number: z_, position: [x, y, z] });
  }
  return atoms;
}

async function submitWorkflow(key: string, atoms: any[], mode: string) {
  const body = {
    name: "Suttain GFN2-xTB",
    workflow_type: "basic_calculation",
    workflow_data: { settings: { method: "GFN2_XTB", tasks: ["optimize", "energy"], mode }, engine: "xtb" },
    initial_molecule: { charge: 0, multiplicity: 1, atoms },
  };
  const r = await fetch(`${ROWAN_BASE}/workflow`, {
    method: "POST",
    headers: { "X-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error("Rowan submit failed (" + r.status + "): " + text.slice(0, 300));
  return JSON.parse(text);
}

async function poll(key: string, uuid: string, timeoutMs: number) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const r = await fetch(`${ROWAN_BASE}/workflow/${uuid}`, { headers: { "X-API-Key": key } });
    if (r.ok) {
      const d = await r.json();
      const s = d.object_status;
      if (s === 2) return d;
      if (s === 3 || s === 4) throw new Error("Rowan workflow failed (status " + s + ")");
    }
    await new Promise((res) => setTimeout(res, 3000));
  }
  throw new Error("Rowan workflow timed out");
}

async function getMolecules(key: string, calcUuid: string) {
  const r = await fetch(`${ROWAN_BASE}/calculation/${calcUuid}/molecules`, { headers: { "X-API-Key": key } });
  if (!r.ok) throw new Error("Rowan molecules fetch failed (" + r.status + ")");
  return await r.json();
}

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    // Authenticate the caller before consuming paid Rowan API credits
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const key = Deno.env.get("ROWAN_API_KEY");
    if (!key) throw new Error("ROWAN_API_KEY not configured");
    const body = await req.json().catch(() => ({}));
    const smilesIn: string = (body.smiles || "").toString().trim();
    const query: string = (body.query || body.name || "").toString().trim();
    const mode: string = body.mode || "rapid";
    if (!smilesIn && !query) throw new Error("Provide 'query' (compound name) or 'smiles'.");
    const isSmiles = !!smilesIn && !query;
    const lookup = isSmiles ? smilesIn : query;

    const { atoms, smiles } = await fetch3D(lookup, isSmiles);
    const wf = await submitWorkflow(key, atoms, mode);
    const uuid = wf.uuid;
    const done = await poll(key, uuid, 110000);
    const data = done.object_data || {};
    const calcUuid = data.calculation_uuid;
    const mols = calcUuid ? await getMolecules(key, calcUuid) : [];
    const final = Array.isArray(mols) && mols.length ? mols[mols.length - 1] : null;

    const outAtoms = (final?.atoms || []).map((a: any) => ({
      element: Z_TO_SYM[a.atomic_number] || String(a.atomic_number),
      atomic_number: a.atomic_number,
      position: (a.position || []).map((x: number) => Number(x.toFixed(5))),
    }));

    return new Response(JSON.stringify({
      query: query || smilesIn,
      resolved_smiles: smiles || smilesIn,
      method: "GFN2-xTB (semi-empirical tight binding)",
      engine: "xtb via Rowan cloud",
      mode,
      input_atoms: atoms.length,
      compute_location: "cloud (server-side). The browser is the interface; the quantum calculation runs on a remote xTB engine.",
      result: {
        total_energy_hartree: final?.energy ?? null,
        total_energy_kcal_mol: final?.energy != null ? Number((final.energy * 627.509).toFixed(3)) : null,
        homo_lumo_gap: final?.homo_lumo_gap ?? null,
        dipole: final?.dipole ?? null,
        mulliken_charges: final?.mulliken_charges ?? null,
        optimized_geometry: outAtoms,
        n_atoms: outAtoms.length,
      },
      provenance: {
        real_engine: true,
        level_of_theory: "gfn2_xtb",
        smiles_source: isSmiles ? "user-provided" : "PubChem",
        initial_geometry_source: "PubChem 3D conformer",
        workflow_uuid: uuid,
        credits_charged: done.credits_charged,
        elapsed_seconds: done.elapsed,
      },
      honesty_note:
        "This is a real GFN2-xTB calculation, not an approximation. GFN2-xTB is a semi-empirical " +
        "method: fast and broadly accurate for geometries and trends, less accurate than full DFT " +
        "for thermochemistry. Heavy compute runs on a remote engine, not literally in the browser.",
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }),
      { status: 500, headers: { "Content-Type": "application/json" } });
  }
});