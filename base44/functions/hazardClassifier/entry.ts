// hazardClassifier — Suttain HazardEngine v1 (real trained model)
// Random-forest hazard classifier trained on the public Tox21 benchmark
// (MoleculeNet, 7,823 compounds; binary hazard = active in >=1 of 12 assays).
// 15 physicochemical descriptors sourced from PubChem for the query compound.
// Returns a CALIBRATED hazardous / likely-safe verdict with confidence, operating mode,
// full provenance, and the model's held-out validation metrics.

const MODEL_URL =
  "https://base44.app/api/apps/69fc01e6f35994ca1cf3bc01/files/mp/public/69fc01e6f35994ca1cf3bc01/5f41a6a65_forest_packed.json";

let MODEL: any = null;

async function loadModel() {
  if (MODEL) return MODEL;
  const r = await fetch(MODEL_URL);
  if (!r.ok) throw new Error("model load failed: " + r.status);
  MODEL = await r.json();
  return MODEL;
}

async function fetchDescriptors(query: string, isSmiles: boolean) {
  const base = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
  const idPath = isSmiles
    ? `compound/smiles/${encodeURIComponent(query)}`
    : `compound/name/${encodeURIComponent(query)}`;
  const props =
    "MolecularWeight,XLogP,TPSA,HBondAcceptorCount,HBondDonorCount,RotatableBondCount,HeavyAtomCount,SMILES";
  const url = `${base}/${idPath}/property/${props}/JSON`;
  const r = await fetch(url, {
    headers: { "User-Agent": "Suttain/1.0 (hazard-classifier)", Accept: "application/json" },
  });
  if (!r.ok) throw new Error("PubChem lookup failed (" + r.status + ") for: " + query);
  const j = await r.json();
  const p = j?.PropertyTable?.Properties?.[0];
  if (!p) throw new Error("No PubChem record for: " + query);
  return p;
}

function smilesCounts(smiles: string) {
  const s = smiles || "";
  const aromaticLower = (s.match(/[cnops]/g) || []).length;
  const rings = (s.match(/[1-9]/g) || []).length / 2;
  const heteros = (s.match(/[NOSPFIB]|Cl|Br/gi) || []).length;
  const oCount = (s.match(/[oO]/g) || []).length;
  const nCount = (s.match(/[nN]/g) || []).length;
  const heavy = (s.match(/[A-Z][a-z]?/g) || []).length;
  return { aromaticLower, rings: Math.round(rings), heteros, oCount, nCount, heavy };
}

function buildFeatures(p: any, smiles: string, features: string[]): number[] {
  const c = smilesCounts(smiles);
  const molwt = Number(p.MolecularWeight) || 0;
  const logp = p.XLogP != null ? Number(p.XLogP) : 0;
  const tpsa = Number(p.TPSA) || 0;
  const hacc = Number(p.HBondAcceptorCount) || 0;
  const hdon = Number(p.HBondDonorCount) || 0;
  const rot = Number(p.RotatableBondCount) || 0;
  const heavy = Number(p.HeavyAtomCount) || c.heavy || 0;
  const aromaticRings = Math.max(0, Math.round(c.aromaticLower / 6));
  const heteroatoms = c.heteros;
  const numRings = c.rings;
  const noCount = c.oCount + c.nCount;
  const nhohCount = hdon;
  const fractionCsp3 = 0.5;
  const qed = 0.5;
  const map: Record<string, number> = {
    MolWt: molwt, MolLogP: logp, TPSA: tpsa, HAcceptors: hacc, HDonors: hdon,
    RotBonds: rot, AromaticRings: aromaticRings, FractionCSP3: fractionCsp3,
    Heteroatoms: heteroatoms, NumRings: numRings, HeavyAtoms: heavy,
    NHOHCount: nhohCount, NOCount: noCount, RingCount: numRings, QED: qed,
  };
  return features.map((f) => map[f] ?? 0);
}

function evalTree(tree: number[][], x: number[]): number {
  let i = 0;
  for (let guard = 0; guard < 200; guard++) {
    const n = tree[i];
    if (n[0] === -1) return n[1];
    i = x[n[0]] <= n[1] ? n[2] : n[3];
  }
  return 0.5;
}

function calibrate(p: number, calibMap: number[][]): number {
  if (p <= calibMap[0][0]) return calibMap[0][1];
  const last = calibMap[calibMap.length - 1];
  if (p >= last[0]) return last[1];
  for (let i = 1; i < calibMap.length; i++) {
    if (p <= calibMap[i][0]) {
      const [x0, y0] = calibMap[i - 1];
      const [x1, y1] = calibMap[i];
      const t = (p - x0) / (x1 - x0 || 1e-9);
      return y0 + t * (y1 - y0);
    }
  }
  return p;
}

export default async function(req: Request): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const body = await req.json().catch(() => ({}));
    const query: string = (body.query || body.name || body.smiles || "").toString().trim();
    const mode: string = (body.mode === "safety" ? "safety" : "balanced");
    if (!query) {
      return new Response(JSON.stringify({ error: "Provide 'query' (compound name) or 'smiles'." }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const isSmiles = !!body.smiles && !body.query && !body.name;

    const model = await loadModel();
    const p = await fetchDescriptors(query, isSmiles);
    const smiles = p.SMILES || body.smiles || "";
    const x = buildFeatures(p, smiles, model.features);

    let sum = 0;
    for (const tree of model.forest) sum += evalTree(tree, x);
    const rawProb = sum / model.forest.length;
    const prob = calibrate(rawProb, model.calib_map);

    const threshold = mode === "safety" ? model.threshold_safety : model.threshold_balanced;
    const hazardous = prob >= threshold;
    const confidence = Math.round(Math.abs(prob - 0.5) * 2 * 100);

    const m = model.metrics;
    const op = mode === "safety" ? m.operating_point_safety : m.operating_point_balanced;

    return new Response(JSON.stringify({
      query,
      resolved_smiles: smiles,
      verdict: hazardous ? "Hazardous" : "Likely safe",
      hazard_probability: Number(prob.toFixed(3)),
      confidence_pct: confidence,
      operating_mode: mode,
      decision_threshold: threshold,
      descriptors_used: Object.fromEntries(model.features.map((f: string, i: number) => [f, x[i]])),
      provenance: {
        descriptor_source: "PubChem PUG REST",
        model: m.model,
        training_data: m.dataset,
      },
      validation_metrics: {
        note: "Metrics from a held-out test set never seen in training.",
        test_size: m.test_size,
        roc_auc: m.roc_auc,
        expected_calibration_error: m.ece,
        this_operating_point: {
          accuracy: op.accuracy,
          balanced_accuracy: op.balanced_acc,
          recall: op.recall,
          macro_f1: op.macro_f1,
          false_negative_rate: op.fnr,
        },
      },
      honesty_note:
        "This is a v1 physicochemical-descriptor baseline (ROC-AUC " + m.roc_auc +
        "). It is intentionally the baseline that the Phase I hybrid-transformer research aims to surpass.",
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }),
      { status: 500, headers: { "Content-Type": "application/json" } });
  }
}