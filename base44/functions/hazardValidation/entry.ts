// hazardValidation — Suttain HazardEngine Validation surface
const VALIDATION_URL =
  "https://base44.app/api/apps/69fc01e6f35994ca1cf3bc01/files/mp/public/69fc01e6f35994ca1cf3bc01/1f15d043d_validation.json";

let CACHE: any = null;

async function loadValidation() {
  if (CACHE) return CACHE;
  const r = await fetch(VALIDATION_URL);
  if (!r.ok) throw new Error("validation data load failed: " + r.status);
  CACHE = await r.json();
  return CACHE;
}

export default async function(req: Request): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const v = await loadValidation();
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const mode = body.mode === "safety" ? "safety" : "balanced";
    const op = v.operating_points[mode];

    return new Response(JSON.stringify({
      model: v.model,
      dataset: v.dataset,
      split: v.split,
      test_set: { size: v.test_size, hazardous: v.test_hazardous, safe: v.test_safe },
      headline: { roc_auc: v.roc_auc, expected_calibration_error: v.expected_calibration_error },
      selected_operating_point: { mode, ...op },
      operating_points: v.operating_points,
      roc_curve: v.roc_curve,
      calibration_curve: v.calibration_curve,
      baseline_comparison: v.baseline_comparison,
      honesty_note:
        "These are real held-out metrics from a physicochemical-descriptor baseline (v1). " +
        "The Phase I research goal is a hybrid transformer that raises accuracy and recall above this baseline.",
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }),
      { status: 500, headers: { "Content-Type": "application/json" } });
  }
}