import { base44 } from "@/api/base44Client";

export async function enrichChemicalMultiSource(payload) {
  return base44.functions.invoke("enrichChemicalMultiSource", payload);
}