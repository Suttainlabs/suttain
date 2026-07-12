import { base44 } from "@/api/base44Client";

export async function evaluateExperiment({ title, hypothesis, chemicals, conditions }) {
  const res = await base44.functions.invoke("evaluateExperiment", {
    title,
    hypothesis,
    chemicals,
    conditions
  });
  return res.data;
}