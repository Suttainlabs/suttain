// hazardPrediction: RETIRED.
// This endpoint previously returned narrative hazard metrics that were not produced by a
// trained, validated model. It has been retired. Use `hazardClassifier` (real trained
// random-forest model with held-out validation) and `hazardValidation` (confusion matrix,
// ROC curve, calibration) instead.

export default async function(req: Request): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  return new Response(JSON.stringify({
    error: "retired",
    message: "hazardPrediction has been retired. Use hazardClassifier for predictions and hazardValidation for validation metrics.",
    replacement: {
      predict: "hazardClassifier",
      validate: "hazardValidation",
    },
  }), { status: 410, headers: { ...cors, "Content-Type": "application/json" } });
}