import { base44 } from '@/api/base44Client';

export async function suttainNutrition(payload) {
  const res = await base44.functions.invoke('suttainNutrition', payload);
  return res.data;
}