import { base44 } from "@/api/base44Client";

export async function chemicalInteractionScore(payload) {
  return await base44.functions.invoke('chemicalInteractionScore', payload);
}