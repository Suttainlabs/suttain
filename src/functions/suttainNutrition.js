import { base44 } from '@/api/base44Client';

export async function suttainNutrition(payload) {
  return await base44.functions.invoke('suttainNutrition', payload);
}